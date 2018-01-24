/* global buffer */
/*eslint max-len: ["error", 95, { "ignoreComments": true }]*/
/*eslint semi: ["error", "always", { "omitLastInOneLineBlock": true}]*/
/*eslint object-curly-spacing: ["error", "never"]*/
/*eslint node/no-deprecated-api: [error, {ignoreModuleItems: ["new buffer.Buffer()"]}] */

;(function(){ // eslint-disable-line no-extra-semi
  /*
    Security, Encryption, and Authorization: SEA.js
  */

  // NECESSARY PRE-REQUISITE: http://gun.js.org/explainers/data/security.html

  /* THIS IS AN EARLY ALPHA!!! */

  const Gun = (typeof window !== 'undefined' ? window : global).Gun || require('./gun')

  let subtle
  let subtleossl
  let getRandomBytes
  let indexedDB
  let crypto
  let funcsSetter

  if (typeof window !== 'undefined') {
    const wc = window.crypto || window.msCrypto   // STD or M$
    subtle = wc.subtle || wc.webkitSubtle         // STD or iSafari
    getRandomBytes = (len) => Buffer.from(wc.getRandomValues(new Uint8Array(Buffer.alloc(len))))
    funcsSetter = () => window
    indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB
    || window.msIndexedDB || window.shimIndexedDB
  } else {
    crypto = require('crypto')
    const WebCrypto = require('node-webcrypto-ossl')
    const webcrypto = new WebCrypto({directory: 'key_storage'})
    subtleossl = webcrypto.subtle
    subtle = require('@trust/webcrypto').subtle   // All but ECDH
    getRandomBytes = (len) => Buffer.from(crypto.randomBytes(len))
    funcsSetter = () => {
      const { TextEncoder, TextDecoder } = require('text-encoding')
      // Let's have Storage for NodeJS / testing
      const sessionStorage = new require('node-localstorage').LocalStorage('.sessionStorage')
      const localStorage = new require('node-localstorage').LocalStorage('.localStorage')
      return { TextEncoder, TextDecoder, sessionStorage, localStorage }
    }
    indexedDB = require('fake-indexeddb')
  }
  const { TextEncoder, TextDecoder, sessionStorage, localStorage } = funcsSetter()

  if (typeof global !== 'undefined') {
    global.sessionStorage = sessionStorage
    global.localStorage = localStorage
  }
  // This is Array extended to have .toString(['utf8'|'hex'|'base64'])
  function SeaArray() {}
  Object.assign(SeaArray, { from: Array.from })
  SeaArray.prototype = Object.create(Array.prototype)
  SeaArray.prototype.toString = function(enc = 'utf8', start = 0, end) {
    const { length } = this
    if (enc === 'hex') {
      const buf = new Uint8Array(this)
      return [ ...Array(((end && (end + 1)) || length) - start).keys()]
      .map((i) => buf[ i + start ].toString(16).padStart(2, '0')).join('')
    }
    if (enc === 'utf8') {
      return Array.from(
        { length: (end || length) - start },
        (_, i) => String.fromCharCode(this[ i + start])
      ).join('')
    }
    if (enc === 'base64') {
      return btoa(this)
    }
  }

  // This is Buffer implementation used in SEA. Functionality is mostly
  // compatible with NodeJS 'safe-buffer' and is used for encoding conversions
  // between binary and 'hex' | 'utf8' | 'base64'
  // See documentation and validation for safe implementation in:
  // https://github.com/feross/safe-buffer#update
  function SafeBuffer(...props) {
    console.warn('new SafeBuffer() is depreciated, please use SafeBuffer.from()')
    return SafeBuffer.from(...props)
  }
  SafeBuffer.prototype = Object.create(Array.prototype)
  Object.assign(SafeBuffer, {
    // (data, enc) where typeof data === 'string' then enc === 'utf8'|'hex'|'base64'
    from() {
      if (!Object.keys(arguments).length) {
        throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
      }
      const input = arguments[0]
      let buf
      if (typeof input === 'string') {
        const enc = arguments[1] || 'utf8'
        if (enc === 'hex') {
          const bytes = input.match(/([\da-fA-F]{2})/g)
          .map((byte) => parseInt(byte, 16))
          if (!bytes || !bytes.length) {
            throw new TypeError('Invalid first argument for type \'hex\'.')
          }
          buf = SeaArray.from(bytes)
        } else if (enc === 'utf8') {
          const { length } = input
          const words = new Uint16Array(length)
          Array.from({ length }, (_, i) => words[i] = input.charCodeAt(i))
          buf = SeaArray.from(words)
        } else if (enc === 'base64') {
          const dec = atob(input)
          const { length } = dec
          const bytes = new Uint8Array(length)
          Array.from({ length }, (_, i) => bytes[i] = dec.charCodeAt(i))
          buf = SeaArray.from(bytes)
        } else if (enc === 'binary') {
          buf = SeaArray.from(input)
        } else {
          console.info(`SafeBuffer.from unknown encoding: '${enc}'`)
        }
        return buf
      }
      const { byteLength, length = byteLength } = input
      if (length) {
        let buf
        if (input instanceof ArrayBuffer) {
          buf = new Uint8Array(input)
        }
        return SeaArray.from(buf || input)
      }
    },
    // This is 'safe-buffer.alloc' sans encoding support
    alloc(length, fill = 0 /*, enc*/ ) {
      return SeaArray.from(new Uint8Array(Array.from({ length }, () => fill)))
    },
    // This is normal UNSAFE 'buffer.alloc' or 'new Buffer(length)' - don't use!
    allocUnsafe(length) {
      return SeaArray.from(new Uint8Array(Array.from({ length })))
    },
    // This puts together array of array like members
    concat(arr) { // octet array
      if (!Array.isArray(arr)) {
        throw new TypeError('First argument must be Array containing ArrayBuffer or Uint8Array instances.')
      }
      return SeaArray.from(arr.reduce((ret, item) => ret.concat(Array.from(item)), []))
    }
  })
  SafeBuffer.prototype.from = SafeBuffer.from
  SafeBuffer.prototype.toString = SeaArray.prototype.toString

  const Buffer = SafeBuffer

  // Encryption parameters
  const pbkdf2 = { hash: 'SHA-256', iter: 50000, ks: 64 }

  const ecdsasignprops = {name: 'ECDSA', hash: {name: 'SHA-256'}}
  const ecdsakeyprops = {name: 'ECDSA', namedCurve: 'P-256'}
  const ecdhkeyprops = {name: 'ECDH', namedCurve: 'P-256'}

  const _initial_authsettings = {
    validity: 12 * 60 * 60, // internally in seconds : 12 hours
    hook: (props) => props  // { iat, exp, alias, remember }
    // or return new Promise((resolve, reject) => resolve(props)
  }
  // These are used to persist user's authentication "session"
  const authsettings = Object.assign({}, _initial_authsettings)
  // This creates Web Cryptography API compliant JWK for sign/verify purposes
  const keystoecdsajwk = (pub,priv) => {
    const [ x, y ] = Buffer.from(pub, 'base64').toString('utf8').split(':')
    const jwk = priv ? { d: priv, key_ops: ['sign'] } : { key_ops: ['verify'] }
    return Object.assign(jwk, {
      x, y, kty: 'EC', crv: 'P-256', ext: false
    });
  }

  // let's extend the gun chain with a `user` function.
  // only one user can be logged in at a time, per gun instance.
  Gun.chain.user = function() {
    let root = this.back(-1)  // always reference the root gun instance.
    let user = root._.user || (root._.user = root.chain()); // create a user context.
    // then methods...
    [ 'create', // factory
      'auth',   // login
      'leave',  // logout
      'delete', // account delete
      'recall', // existing auth boostrap
      'alive'   // keep/check auth validity
    ].map((method)=> user[method] = User[method])
    return user // return the user!
  }

  // Practical examples about usage found from ./test/common.js

  // These are internal wrappers for ES6 async/await use:
  const seaCallOnStorage = async (...props) => SEA._callonstore_(...props)
  const seaRead = async (...props) => SEA.read(...props)
  const seaWrite = async (...props) => SEA.write(...props)
  const seaEnc = async (...props) => SEA.enc(...props)
  const seaDec = async (...props) => SEA.dec(...props)
  const seaProof = async (...props) => SEA.proof(...props)
  const seaKeyId = async (...props) => SEA.keyid(...props)
  const seaPair = async (...props) => SEA.pair(...props)
  const seaVerify = async (...props) => SEA.verify(...props)
  const seaSign = async (...props) => SEA.sign(...props)
  const seaDerive = async (...props) => SEA.derive(...props)

  const parseProps = (props) => {
    try {
      return props.slice ? JSON.parse(props) : props
    } catch (e) {}  //eslint-disable-line no-empty
    return props
  }
  const seaIndexedDbGetter = async (key, prop) =>
  await seaCallOnStorage((store) => new Promise((resolve) => {
    const getData = store.get(key)
    getData.onsuccess = () => {
      const { result = {} } = getData
      resolve(result[prop])
    }
  }))

  // This is internal func queries public key(s) for alias.
  const querygunaliases = (alias,root) => new Promise((resolve, reject) => {
    // load all public keys associated with the username alias we want to log in with.
    root.get(`alias/${alias}`).get((rat, rev) => {
      rev.off()
      if (!rat.put) {
        // if no user, don't do anything.
        const err = 'No user!'
        Gun.log(err)
        return reject({ err })
      }
      // then figuring out all possible candidates having matching username
      let aliases = []
      let c = 0
      // TODO: how about having real chainable map without callback ?
      Gun.obj.map(rat.put, (at, pub) => {
        if (!pub.slice || 'pub/' !== pub.slice(0, 4)) {
          // TODO: ... this would then be .filter((at, pub))
          return
        }
        ++c
        // grab the account associated with this public key.
        root.get(pub).get((at, ev) => {
          pub = pub.slice(4)
          ev.off()
          --c
          if (at.put){
            aliases.push({ pub, at })
          }
          if (!c && (c = -1)) {
            resolve(aliases)
          }
        })
      })
      if (!c) {
        reject({ err: 'Public key does not exist!' })
      }
    })
  })
  // This is internal User authentication func.
  const authenticate = async (alias, pass, root) => {
    // load all public keys associated with the username alias we want to log in with.
    const aliases = (await querygunaliases(alias, root))
    .filter(({ pub, at: { put } = {} } = {}) => !!pub && !!put)
    // Got any?
    if (!aliases.length) {
      throw { err: 'Public key does not exist!' }
    }
    let err
    // then attempt to log into each one until we find ours!
    // (if two users have the same username AND the same password... that would be bad)
    const [ user ] = await Promise.all(aliases.map(async ({ at, pub }) => {
      // attempt to PBKDF2 extend the password with the salt. (Verifying the signature gives us the plain text salt.)
      const auth = parseProps(at.put.auth)
    // NOTE: aliasquery uses `gun.get` which internally SEA.read verifies the data for us, so we do not need to re-verify it here.
    // seaRead(at.put.auth, pub).then(function(auth){
      try {
        const proof = await seaProof(pass, auth.salt)
        const props = { pub, proof, at }
        // the proof of work is evidence that we've spent some time/effort trying to log in, this slows brute force.
        /*
        MARK TO @mhelander : pub vs epub!???
        */
        const { salt } = auth
        const sea = await seaDec(auth.auth, { pub, key: proof })
        if (!sea) {
          err = 'Failed to decrypt secret!'
          return
        }
        // now we have AES decrypted the private key, from when we encrypted it with the proof at registration.
        // if we were successful, then that meanswe're logged in!
        const { priv, epriv } = sea
        const { epub } = at.put
        // TODO: 'salt' needed?
        err = null
        return Object.assign(props, { priv, salt, epub, epriv })
      } catch (e) {
        err = 'Failed to decrypt secret!'
        return
      }
    }))

    if (!user) {
      throw { err: err || 'Public key does not exist!' }
    }
    return user
  }
  // This internal func finalizes User authentication
  const finalizelogin = async (alias, key, root, opts) => {
    const { user } = root._
    // add our credentials in-memory only to our root gun instance
    user._ = key.at.gun._
    // so that way we can use the credentials to encrypt/decrypt data
    user._.is = user.is = {}
    // that is input/output through gun (see below)
    const { pub, priv, epub, epriv } = key
    Object.assign(user._, { alias, pub, epub, sea: { pub, priv, epub, epriv } })
    //console.log("authorized", user._);
    // persist authentication
    await authpersist(user._, key.proof, opts)
    // emit an auth event, useful for page redirects and stuff.
    try {
      root._.on('auth', user._)
    } catch (e) {
      console.log('Your \'auth\' callback crashed with:', e)
    }
    // returns success with the user data credentials.
    return user._
  }
  // This updates sessionStorage & IndexedDB to persist authenticated "session"
  const updatestorage = (proof, key, pin) => async (props) => {
    if (!Gun.obj.has(props, 'alias')) {
      return  // No 'alias' - we're done.
    }
    if (authsettings.validity && proof && Gun.obj.has(props, 'iat')) {
      props.proof = proof
      delete props.remember   // Not stored if present

      const { alias, alias: id } = props
      const remember = { alias, pin }

      try {
        const signed = await seaWrite(JSON.stringify(remember), key)

        sessionStorage.setItem('user', alias)
        sessionStorage.setItem('remember', signed)

        const encrypted = await seaEnc(props, pin)

        if (encrypted) {
          const auth = await seaWrite(encrypted, key)

          await seaCallOnStorage((store) => {
            const act = store.clear()   // Wipe IndexedDB completedy!
            act.onsuccess = () => {}
          })                            // Then set encrypted auth props
          await seaCallOnStorage((store) => {
            store.put({ id, auth })
          })
        }

        return props
      } catch (err) {
        return reject({ err: 'Session persisting failed!' })
      }
    }

    // Wiping IndexedDB completely when using random PIN
    await seaCallOnStorage((store) => {
      const act = store.clear()
      act.onsuccess = () => {}
    })
    // And remove sessionStorage data
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('remember')

    return props
  }

  // This internal func persists User authentication if so configured
  const authpersist = async (user, proof, opts) => {
    // opts = { pin: 'string' }
    // no opts.pin then uses random PIN
    // How this works:
    // called when app bootstraps, with wanted options
    // IF authsettings.validity === 0 THEN no remember-me, ever
    // IF PIN then signed 'remember' to window.sessionStorage and 'auth' to IndexedDB
    const pin = Buffer.from(
      (Gun.obj.has(opts, 'pin') && opts.pin) || Gun.text.random(10),
      'utf8'
    ).toString('base64')

    const { alias } = user || {}
    const { validity: exp } = authsettings      // seconds

    if (proof && alias && exp) {
      const iat = Math.ceil(Date.now() / 1000)  // seconds
      const remember = Gun.obj.has(opts, 'pin') || undefined  // for hook - not stored
      const props = authsettings.hook({ alias, iat, exp, remember })
      const { pub, epub, sea: { priv, epriv } } = user
      const key = { pub, priv, epub, epriv }
      if (props instanceof Promise) {
        const asyncProps = await props.then()
        return await updatestorage(proof, key, pin)(asyncProps)
      }
      return await updatestorage(proof, key, pin)(props)
    }
    return await updatestorage()({ alias: 'delete' })
  }
  // This internal func recalls persisted User authentication if so configured
  const authrecall = async (root, authprops) => {
    // window.sessionStorage only holds signed { alias, pin } !!!
    const remember = authprops || sessionStorage.getItem('remember')
    const { alias = sessionStorage.getItem('user'), pin: pIn } = authprops || {}
    const pin = pIn && Buffer.from(pIn, 'utf8').toString('base64')
    // Checks for existing proof, matching alias and expiration:
    const checkRememberData = async ({ proof, alias: aLias, iat, exp, remember }) => {
      if (!!proof && alias === aLias) {
        const checkNotExpired = (args) => {
          if (Math.floor(Date.now() / 1000) < (iat + args.exp)) {
            // No way hook to update 'iat'
            return Object.assign(args, { iat, proof })
          } else {
            Gun.log('Authentication expired!')
          }
        }
        // We're not gonna give proof to hook!
        const hooked = authsettings.hook({ alias, iat, exp, remember })
        return ((hooked instanceof Promise)
        && await hooked.then(checkNotExpired)) || checkNotExpired(hooked)
      }
    }
    const readAndDecrypt = async (data, pub, key) =>
      parseProps(await seaDec(await seaRead(data, pub), key))
    // Returns auth value prop from IndexedDB (encryption key)
    const getIndexedDbAuth = async () => await seaIndexedDbGetter(alias, 'auth')

    // Already authenticated?
    if (root._.user
    && Gun.obj.has(root._.user._, 'pub')
    && Gun.obj.has(root._.user._, 'sea')) {
      return root._.user._  // Yes, we're done here.
    }
    // No, got persisted 'alias'?
    if (!alias) {
      throw { err: 'No authentication session found!' }
    }
    // Yes, got persisted 'remember'?
    if (!remember) {
      throw {  // And return proof if for matching alias
        err: (await getIndexedDbAuth() && authsettings.validity
        && 'Missing PIN and alias!') || 'No authentication session found!'
      }
    }
    // Yes, let's get (all?) matching aliases
    const aliases = await querygunaliases(alias, root)
    .filter(({ pub } = {}) => !!pub)
    // Got any?
    if (!aliases.length) {
      throw { err: 'Public key does not exist!' }
    }
    let err
    // Yes, then attempt to log into each one until we find ours!
    // (if two users have the same username AND the same password... that would be bad)
    const [ key ] = await Promise.all(aliases.filter(({ at: { put } = {} }) => !!put)
    .map(async ({ at, pub }) => {
      const readStorageData = async () => {
        const props = parseProps(await seaRead(remember, pub, true))
        const { pin, alias: aLias } = props

        return (!pin || alias === aLias)
        // No PIN, let's try short-term proof if for matching alias
        ? await checkRememberData(props)
        // Got PIN so get IndexedDB secret if signature is ok
        : await checkRememberData(await readAndDecrypt(await getIndexedDbAuth(), pub, pin))
      }
      // got pub, try auth with pin & alias :: or unwrap Storage data...
      const args = pin ? { pin, alias } : await readStorageData()
      const { proof } = args || {}

      if (!proof) {
        if (!args) {
          err = 'No valid authentication session found!'
          return
        }
        try { // Wipes IndexedDB silently
          await updatestorage()(args)
        } catch (e) {}  //eslint-disable-line no-empty
        err = 'Expired session!'
        return
      }

      try { // auth parsing or decryption fails or returns empty - silently done
        const { auth } = JSON.parse(at.put.auth)
        const sea = await seaDec(auth, proof)
        if (!sea) {
          err = 'Failed to decrypt private key!'
          return
        }
        const { priv, epriv } = sea
        const { epub } = at.put
        // Success! we've found our private data!
        err = null
        return { pub, priv, epriv, epub }
      } catch (e) {
        err = 'Failed to decrypt private key!'
        return
      }
    }).filter((props) => !!props))

    if (!key) {
      throw new { err: err || 'Public key does not exist!' }
    }

    // now we have AES decrypted the private key,
    // if we were successful, then that means we're logged in!
    try {
      await updatestorage(proof, key, pin)(args)

      const user = Object.assign(key, { at, proof })

      return await finalizelogin(alias, user, root, { pin })
    } catch (e) { // TODO: right log message ?
      Gun.log('Failed to finalize login with new password!')
      const { err = '' } = e || {}
      throw { err: `Finalizing new password login failed! Reason: ${err}` }
    }
  }

  // This internal func executes logout actions
  const authleave = async (root, alias = root._.user._.alias) => {
    const { user = { _: {} } } = root._
    root._.user = null
    // Removes persisted authentication & CryptoKeys
    try {
      await authpersist({ alias })
    } catch (e) {}  //eslint-disable-line no-empty
    // TODO: is this correct way to 'logout' user from Gun.User ?
    [ 'alias', 'sea', 'pub' ].map((key) => delete user._[key])
    user._.is = user.is = {}
    // Let's use default
    root.user();
    return { ok: 0 }
  }
  // This recalls Web Cryptography API CryptoKeys from IndexedDB or creates & stores
  // {pub, key}|proof, salt, optional:['sign']
  const recallCryptoKey = async (p, s, o = [ 'encrypt', 'decrypt' ]) => {
    const importKey = async (key) => {
      const hashedKey = await makeKey((Gun.obj.has(key, 'key') && key.key) || key, s || getRandomBytes(8))
      return await subtle.importKey(
        'raw',
        new Uint8Array(hashedKey),
        'AES-CBC',
        false,
        o
      )
    }

    if (authsettings.validity && typeof window !== 'undefined'
    && Gun.obj.has(p, 'pub') && Gun.obj.has(p, 'key')) {
      const { pub: id } = p
      const importAndStoreKey = async () => {
        const key = await importKey(p)
        await seaCallOnStorage((store) => {
          store.put({ id, key })
        })
        return key
      }
      if (Gun.obj.has(p, 'set')) {
        return importAndStoreKey()  // proof update so overwrite
      }
      const aesKey = await seaIndexedDbGetter(id, 'key')
      return aesKey ? aesKey : importAndStoreKey()
    }

    // No secure store usage
    return importKey(p)
  }
  // This internal func returns SHA-256 hashed data for signing
  const sha256hash = async (mm) => {
    const hashSubtle = subtleossl || subtle
    const m = parseProps(mm)
    const hash = await hashSubtle.digest(pbkdf2.hash, new TextEncoder().encode(m))
    return Buffer.from(hash)
  }
  // This internal func returns SHA-1 hashed data for KeyID generation
  const sha1hash = (b) => (subtleossl || subtle).digest('SHA-1', new ArrayBuffer(b))

  // How does it work?
  function User(){}
  // Well first we have to actually create a user. That is what this function does.
  Object.assign(User, {
    create(alias, pass, cb) {
      const root = this.back(-1)
      const doIt = (resolve, reject) => {
        // Because more than 1 user might have the same username, we treat the alias as a list of those users.
        root.get(`alias/${alias}`).get((at, ev) => {
          ev.off()
          if (at.put) {
            // If we can enforce that a user name is already taken, it might be nice to try, but this is not guaranteed.
            const err = 'User already created!'
            Gun.log(err)
            return reject({ err })
          }
          const salt = Gun.text.random(64)
          // pseudo-randomly create a salt, then use CryptoJS's PBKDF2 function to extend the password with it.
          seaProof(pass, salt).then((proof) => {
            // this will take some short amount of time to produce a proof, which slows brute force attacks.
            seaPair().then((pairs) => {
              // now we have generated a brand new ECDSA key pair for the user account.
              const { pub, priv, epriv } = pairs
              const user = { pub }
              // the user's public key doesn't need to be signed. But everything else needs to be signed with it!
              seaWrite(alias, pairs).then((alias) =>
                Object.assign(user, {alias }) && seaWrite(pairs.epub, pairs)
              ).then((epub) => Object.assign(user, { epub })
              // to keep the private key safe, we AES encrypt it with the proof of work!
              && seaEnc({ priv, epriv }, { pub: pairs.epub, key: proof })
              ).then((auth) => // TODO: So signedsalt isn't needed?
                // seaWrite(salt, pairs).then((signedsalt) =>
                  seaWrite({ salt, auth }, pairs)
                // )
              ).then((auth) => {
                Object.assign(user, { auth })
                const tmp = `pub/${pairs.pub}`
                //console.log("create", user, pair.pub);
                // awesome, now we can actually save the user with their public key as their ID.
                root.get(tmp).put(user)
                // next up, we want to associate the alias with the public key. So we add it to the alias list.
                root.get(`alias/${alias}`).put(Gun.obj.put({}, tmp, Gun.val.rel.ify(tmp)))
                // callback that the user has been created. (Note: ok = 0 because we didn't wait for disk to ack)
                setTimeout(() => { resolve({ ok: 0, pub: pairs.pub}) }, 10) // TODO: BUG! If `.auth` happens synchronously after `create` finishes, auth won't work. This setTimeout is a temporary hack until we can properly fix it.
              }).catch((e) => { Gun.log('SEA.en or SEA.write calls failed!'); reject(e) })
            }).catch((e) => { Gun.log('SEA.pair call failed!'); reject(e) })
          })
        })
      }
      if (cb){ doIt(cb, cb) } else { return new Promise(doIt) }
    },
    // now that we have created a user, we want to authenticate them!
    auth(alias, pass, cb, opt) {
      const opts = opt || (typeof cb !== 'function' && cb)
      const { pin, newpass } = opts || {}
      const root = this.back(-1)
      cb = typeof cb === 'function' && cb

      const doIt = (resolve, reject) => {
        const putErr = (msg) => (e) => {
          const { message, err = message || '' } = e
          Gun.log(msg)
          reject({ err: `${msg} Reason: ${err}` })
        }

        if (!pass && pin) {
          return authrecall(root, { alias, pin }).then(resolve).catch((e) => {
            reject({ err: 'Auth attempt failed! Reason: No session data for alias & PIN' })
          })
        }
        authenticate(alias, pass, root).then((keys) => {
          if (!keys) {
            return putErr('Auth attempt failed!')({ message: 'No keys' })
          }
          const { pub, priv, epub, epriv } = keys
          // we're logged in!
          if (newpass) {
            // password update so encrypt private key using new pwd + salt
            const salt = Gun.text.random(64)
            seaProof(newpass, salt).then((key) =>
              seaEnc({ priv, epriv }, { pub, key, set: true })
              .then((auth) => seaWrite({ salt, auth }, keys))
            ).then((encSigAuth) =>
              seaWrite(epub, keys).then((signedEpub) =>
                seaWrite(alias, keys).then((signedAlias) => ({
                  pub,
                  alias: signedAlias,
                  auth: encSigAuth,
                  epub: signedEpub
                }))
              )
            ).then((user) => {
              // awesome, now we can update the user using public key ID.
              root.get(`pub/${user.pub}`).put(user)
              // then we're done
              finalizelogin(alias, keys, root, { pin }).then(resolve)
              .catch(putErr('Failed to finalize login with new password!'))
            }).catch(putErr('Password set attempt failed!'))
          } else {
            finalizelogin(alias, keys, root, pin).then(resolve)
            .catch(putErr('Finalizing login failed!'))
          }
        }).catch(putErr('Auth attempt failed!'))
      }
      if (cb){ doIt(cb, cb) } else { return new Promise(doIt) }
    },
    leave(cb) {
      const doIt = (resolve) => authleave(this.back(-1)).then(resolve)
      if (cb) { doIt(cb) } else { return new Promise(doIt) }
    },
    // If authenticated user wants to delete his/her account, let's support it!
    delete(alias, pass, cb) {
      const root = this.back(-1)
      const doIt = (resolve, reject) => {
        authenticate(alias, pass, root)
        .then(({ pub }) => authleave(root, alias).then(() => pub))
        .then((pub) => {
          try {
            // Delete user data
            root.get(`pub/${pub}`).put(null)
            // Wipe user data from memory
            const { user = { _: {} } } = root._
            // TODO: is this correct way to 'logout' user from Gun.User ?
            [ 'alias', 'sea', 'pub' ].map((key) => delete user._[key])
            user._.is = user.is = {}
            root.user()
            resolve({ ok: 0 })
          } catch(e) {
            Gun.log('User.delete failed! Error:', e)
            reject({err: 'Delete attempt failed! Reason: ' + (e && e.err) || e || ''})
          }
        }).catch((e) => {
          Gun.log('User.delete authentication failed! Error:', e)
          reject({err: 'Delete attempt failed! Reason: ' + (e && e.err) || e || ''})
        })
      }
      if (cb) { doIt(cb, cb) } else { return new Promise(doIt) }
    },
    // If authentication is to be remembered over reloads or browser closing,
    // set validity time in minutes.
    recall(setvalidity, cb, options) {
      const root = this.back(-1)

      let validity
      let callback
      let opts

      if (!options && typeof cb !== 'function' && !Gun.val.is(cb)) {
        opts = cb
      } else {
        callback = cb
      }
      if (!callback) {
        if (typeof setvalidity === 'function') {
          callback = setvalidity
          validity = _initial_authsettings.validity
        } else if (!Gun.val.is(setvalidity)) {
          opts = setvalidity
          validity = _initial_authsettings.validity
        } else {
          validity = setvalidity * 60 // minutes to seconds
        }
      }

      var doIt = function(resolve, reject){
        // opts = { hook: function({ iat, exp, alias, proof }) }
        // iat == Date.now() when issued, exp == seconds to expire from iat
        // How this works:
        // called when app bootstraps, with wanted options
        // IF authsettings.validity === 0 THEN no remember-me, ever
        // IF PIN then signed 'remember' to window.sessionStorage and 'auth' to IndexedDB
        authsettings.validity = typeof validity !== 'undefined'
        ? validity : _initial_authsettings.validity
        authsettings.hook = (Gun.obj.has(opts, 'hook') && typeof opts.hook === 'function')
        ? opts.hook : _initial_authsettings.hook
        // All is good. Should we do something more with actual recalled data?
        authrecall(root).then(resolve).catch((e) => {
          const err = 'No session!'
          Gun.log(err)
          resolve({ err: (e && e.err) || err })
        })
      }
      if (callback) { doIt(callback, callback) } else { return new Promise(doIt) }
    },
    alive(cb) {
      const root = this.back(-1)
      const doIt = (resolve, reject) => {
        // All is good. Should we do something more with actual recalled data?
        authrecall(root).then(() => resolve(root._.user._))
        .catch((e) => {
          const err = 'No session!'
          Gun.log(err)
          reject({ err })
        })
      }
      if (cb) { doIt(cb, cb) } else { return new Promise(doIt) }
    }
  })

  Gun.chain.trust = function(user) {
    // TODO: BUG!!! SEA `node` read listener needs to be async, which means core needs to be async too.
    //gun.get('alice').get('age').trust(bob);
    if (Gun.is(user)) {
      user.get('pub').get((ctx, ev) => {
        console.log(ctx, ev)
      })
    }
  }

  // After we have a GUN extension to make user registration/login easy, we then need to handle everything else.

  // We do this with a GUN adapter, we first listen to when a gun instance is created (and when its options change)
  Gun.on('opt', function(at){
    if(!at.sea){ // only add SEA once per instance, on the "at" context.
      at.sea = {own: {}};
      var uuid = at.opt.uuid || Gun.state.lex;
      at.opt.uuid = function(cb){
        if(!cb){ return }
        var id = uuid(), pair = at.user && (at.user._).sea;
        if(!pair){ return id }
        seaSign(id, pair).then(function(sig){
          cb(null, id + '~' + sig);
        }).catch(function(e){cb(e)});
      }
      at.on('in', security, at); // now listen to all input data, acting as a firewall.
      at.on('out', signature, at); // and output listeners, to encrypt outgoing data.
      at.on('node', each, at);
    }
    this.to.next(at); // make sure to call the "next" middleware adapter.
  });

  // Alright, this next adapter gets run at the per node level in the graph database.
  // This will let us verify that every property on a node has a value signed by a public key we trust.
  // If the signature does not match, the data is just `undefined` so it doesn't get passed on.
  // If it does match, then we transform the in-memory "view" of the data into its plain value (without the signature).
  // Now NOTE! Some data is "system" data, not user data. Example: List of public keys, aliases, etc.
  // This data is self-enforced (the value can only match its ID), but that is handled in the `security` function.
  // From the self-enforced data, we can see all the edges in the graph that belong to a public key.
  // Example: pub/ASDF is the ID of a node with ASDF as its public key, signed alias and salt, and
  // its encrypted private key, but it might also have other signed values on it like `profile = <ID>` edge.
  // Using that directed edge's ID, we can then track (in memory) which IDs belong to which keys.
  // Here is a problem: Multiple public keys can "claim" any node's ID, so this is dangerous!
  // This means we should ONLY trust our "friends" (our key ring) public keys, not any ones.
  // I have not yet added that to SEA yet in this alpha release. That is coming soon, but beware in the meanwhile!
  function each(msg){ // TODO: Warning: Need to switch to `gun.on('node')`! Do not use `Gun.on('node'` in your apps!
    // NOTE: THE SECURITY FUNCTION HAS ALREADY VERIFIED THE DATA!!!
    // WE DO NOT NEED TO RE-VERIFY AGAIN, JUST TRANSFORM IT TO PLAINTEXT.
    var to = this.to, vertex = (msg.gun._).put, c = 0, d;
    Gun.node.is(msg.put, function(val, key, node){ c++; // for each property on the node
      seaRead(val, false).then(function(data){ c--; // false just extracts the plain data.
        node[key] = val = data; // transform to plain value.
        if(d && !c && (c = -1)){ to.next(msg) }
      });
    });
    d = true;
    if(d && !c){ to.next(msg) }
    return;
    /*var to = this.to, ctx = this.as;
    var own = ctx.sea.own, soul = msg.get, c = 0;
    var pub = own[soul] || soul.slice(4), vertex = (msg.gun._).put;
    Gun.node.is(msg.put, function(val, key, node){ c++; // for each property on the node.
      seaRead(val, pub).then(function(data){ c--;
        vertex[key] = node[key] = val = data; // verify signature and get plain value.
        if(val && val['#'] && (key = Gun.val.rel.is(val))){ // if it is a relation / edge
          if('alias/' !== soul.slice(0,6)){ own[key] = pub; } // associate the public key with a node if it is itself
        }
        if(!c && (c = -1)){ to.next(msg) }
      });
    });
    if(!c){ to.next(msg) }*/
  }

  // signature handles data output, it is a proxy to the security function.
  function signature(msg){
    if(msg.user){
      return this.to.next(msg);
    }
    var ctx = this.as;
    msg.user = ctx.user;
    security.call(this, msg);
  }

  // okay! The security function handles all the heavy lifting.
  // It needs to deal read and write of input and output of system data, account/public key data, and regular data.
  // This is broken down into some pretty clear edge cases, let's go over them:
  function security(msg){
    var at = this.as, sea = at.sea, to = this.to;
    if(msg.get){
      // if there is a request to read data from us, then...
      var soul = msg.get['#'];
      if(soul){ // for now, only allow direct IDs to be read.
        if('alias' === soul){ // Allow reading the list of usernames/aliases in the system?
          return to.next(msg); // yes.
        } else
        if('alias/' === soul.slice(0,6)){ // Allow reading the list of public keys associated with an alias?
          return to.next(msg); // yes.
        } else { // Allow reading everything?
          return to.next(msg); // yes // TODO: No! Make this a callback/event that people can filter on.
        }
      }
    }
    if(msg.put){
      // potentially parallel async operations!!!
      var check = {}, on = Gun.on(), each = {}, u;
      each.node = function(node, soul){
        if(Gun.obj.empty(node, '_')){ return check['node'+soul] = 0 } // ignore empty updates, don't reject them.
        Gun.obj.map(node, each.way, {soul: soul, node: node});
      };
      each.way = function(val, key){
        var soul = this.soul, node = this.node, tmp;
        if('_' === key){ return } // ignore meta data
        if('alias' === soul){  // special case for shared system data, the list of aliases.
          each.alias(val, key, node, soul); return;
        }
        if('alias/' === soul.slice(0,6)){ // special case for shared system data, the list of public keys for an alias.
          each.pubs(val, key, node, soul); return;
        }
        if('pub/' === soul.slice(0,4)){ // special case, account data for a public key.
          each.pub(val, key, node, soul, soul.slice(4), msg.user); return;
        }
        each.any(val, key, node, soul, msg.user); return;
        return each.end({err: "No other data allowed!"});
        /*if(!(tmp = at.user)){ return }
        if(soul.slice(4) === (tmp = tmp._).pub){ // not a special case, if we are logged in and have outbound data on us.
          each.user(val, key, node, soul, {
            pub: tmp.pub, priv: tmp.sea.priv, epub: tmp.sea.epub, epriv: tmp.sea.epriv
          });
        }
        if((tmp = sea.own[soul])){ // not special case, if we receive an update on an ID associated with a public key, then
          each.own(val, key, node, soul, tmp);
        }*/
      };
      each.alias = function(val, key, node, soul){ // Example: {_:#alias, alias/alice: {#alias/alice}}
        if(!val){ return each.end({err: "Data must exist!"}) } // data MUST exist
        if('alias/'+key === Gun.val.rel.is(val)){ return check['alias'+key] = 0 } // in fact, it must be EXACTLY equal to itself
        each.end({err: "Mismatching alias."}); // if it isn't, reject.
      };
      each.pubs = function(val, key, node, soul){ // Example: {_:#alias/alice, pub/asdf: {#pub/asdf}}
        if(!val){ return each.end({err: "Alias must exist!"}) } // data MUST exist
        if(key === Gun.val.rel.is(val)){ return check['pubs'+soul+key] = 0 } // and the ID must be EXACTLY equal to its property
        each.end({err: "Alias must match!"}); // that way nobody can tamper with the list of public keys.
      };
      each.pub = function(val, key, node, soul, pub, user){ // Example: {_:#pub/asdf, hello:SEA['world',fdsa]}
        if('pub' === key){
          if(val === pub){ return (check['pub'+soul+key] = 0) } // the account MUST match `pub` property that equals the ID of the public key.
          return each.end({err: "Account must match!"});
        }
        check['user'+soul+key] = 1;
        if(user && (user = user._) && user.sea && pub === user.pub){
            var id = Gun.text.random(3);
          seaWrite(val, Gun.obj.to(user.sea, {pub: user.pub, epub: user.epub})).then(function(data){ var rel;
            if(rel = Gun.val.rel.is(val)){
              (at.sea.own[rel] = at.sea.own[rel] || {})[pub] = true;
            }
            node[key] = data;
            check['user'+soul+key] = 0;
            each.end({ok: 1});
          });
          return;
        }
        seaRead(val, pub).then(function(data){ var rel, tmp;
          if(u === data){ // make sure the signature matches the account it claims to be on.
            return each.end({err: "Unverified data."}); // reject any updates that are signed with a mismatched account.
          }
          if((rel = Gun.val.rel.is(data)) && (tmp = rel.split('~')) && 2 === tmp.length){
            seaVerify(tmp[0], pub, tmp[1]).then(function(ok){
              if(!ok){ return each.end({err: "Signature did not match account."}) }
              (at.sea.own[rel] = at.sea.own[rel] || {})[pub] = true;
              check['user'+soul+key] = 0;
              each.end({ok: 1});
            });
            return;
          }
          check['user'+soul+key] = 0;
          each.end({ok: 1});
        });
      };
      each.any = function(val, key, node, soul, user){ var tmp;
        if(!user || !(user = user._) || !(user = user.sea)){
          if(user = at.sea.own[soul]){
            check['any'+soul+key] = 1;
            user = Gun.obj.map(user, function(a,b){ return b });
            seaRead(val, user).then(function(data){ var rel;
              if(!data){ return each.end({err: "Mismatched owner on '" + key + "'.", }) }
              if((rel = Gun.val.rel.is(data)) && (tmp = rel.split('~')) && 2 === tmp.length){
                seaVerify(tmp[0], user, tmp[1]).then(function(ok){
                  if(!ok){ return each.end({err: "Signature did not match account."}) }
                  (at.sea.own[rel] = at.sea.own[rel] || {})[user] = true;
                  check['any'+soul+key] = 0;
                  each.end({ok: 1});
                });
                return;
              }
              check['any'+soul+key] = 0;
              each.end({ok: 1});
            });
            return;
          }
          check['any'+soul+key] = 1;
          if((tmp = soul.split('~')) && 2 == tmp.length){
            setTimeout(function(){ // hacky idea, what would be better?
              each.any(val, key, node, soul);
            },1);
            return;
          }
          at.on('secure', function(msg){ this.off();
            check['any'+soul+key] = 0;
            each.end(msg || {err: "Data cannot be modified."});
          }).on.on('secure', msg);
          //each.end({err: "Data cannot be modified."});
          return;
        }
        if(!(tmp = soul.split('~')) || 2 !== tmp.length){
          each.end({err: "Soul is not signed at '" + key + "'."});
          return;
        }
        var other = Gun.obj.map(at.sea.own[soul], function(v, p){
          if(user.pub !== p){ return p }
        });
        if(other){
          each.any(val, key, node, soul);
          return;
        }
        check['any'+soul+key] = 1;
        seaVerify(tmp[0], user.pub, tmp[1]).then(function(ok){
          if(!ok){ return each.end({err: "Signature did not match account at '" + key + "'."}) }
          (at.sea.own[soul] = at.sea.own[soul] || {})[user.pub] = true;
          seaWrite(val, user).then(function(data){
            node[key] = data;
            check['any'+soul+key] = 0;
            each.end({ok: 1});
          });
        });
      }
      each.end = function(ctx){ // TODO: Can't you just switch this to each.end = cb?
        if(each.err){ return }
        if((each.err = ctx.err) || ctx.no){
          console.log('NO!', each.err, msg.put);
          return;
        }
        if(!each.end.ed){ return }
        if(Gun.obj.map(check, function(no){
          if(no){ return true }
        })){ return }
        to.next(msg);
      };
      Gun.obj.map(msg.put, each.node);
      each.end({end: each.end.ed = true});
      return; // need to manually call next after async.
    }
    to.next(msg); // pass forward any data we do not know how to handle or process (this allows custom security protocols).
  }

  const makeKey = async (p, s) => {
    const ps = Buffer.concat([Buffer.from(p, 'utf8'), s]).toString('utf8')
    return Buffer.from(await sha256hash(ps), 'binary')
  }

  const SEA = {
    // This is Buffer used in SEA and usable from Gun/SEA application also.
    // For documentation see https://nodejs.org/api/buffer.html
    Buffer: SafeBuffer,
    // These SEA functions support both callback AND Promises. Thus no
    // async/await (compatible) code, use those like Promises.
    //
    // Creates a wrapper library around Web Crypto API
    // for various AES, ECDSA, PBKDF2 functions we called above.
    proof(pass, salt, cb) {
      const nodeJsPbkdf2 = (resolve, reject) => {
        try { // For NodeJS crypto.pkdf2 rocks
          const hash = crypto.pbkdf2Sync(
            pass,
            new TextEncoder().encode(salt),
            pbkdf2.iter,
            pbkdf2.ks,
            pbkdf2.hash.replace('-', '').toLowerCase()
          )
          pass = getRandomBytes(pass.length)  // Erase passphrase for app
          resolve(hash && hash.toString('base64'))
        } catch (e) { reject(e) }
      }
      const doIt = (resolve, reject) => (typeof window !== 'undefined'
      && subtle.importKey(  // For browser subtle works fine
          'raw', new TextEncoder().encode(pass), { name: 'PBKDF2' }, false, ['deriveBits']
        ).then((key) => subtle.deriveBits({
            name: 'PBKDF2',
            iterations: pbkdf2.iter,
            salt: new TextEncoder().encode(salt),
            hash: pbkdf2.hash,
          }, key, pbkdf2.ks * 8)
        ).then((result) => {
          pass = getRandomBytes(pass.length)  // Erase passphrase for app
          return Buffer.from(result, 'binary').toString('base64')
        }).then(resolve).catch((e) => { Gun.log(e); reject(e) })
      ) || nodeJsPbkdf2(resolve, reject)
      if (cb) { doIt(cb, () => cb()) } else { return new Promise(doIt) }
    },
    // Calculate public key KeyID aka PGPv4 (result: 8 bytes as hex string)
    keyid(pub, cb) {
      const doIt = (resolve, reject) => {
        // base64('base64(x):base64(y)') => Buffer(xy)
        const pb = Buffer.concat(
          Buffer.from(pub, 'base64').toString('utf8').split(':')
          .map((t) => Buffer.from(t, 'base64'))
        )
        // id is PGPv4 compliant raw key
        const id = Buffer.concat([
          Buffer.from([0x99, pb.length / 0x100, pb.length % 0x100]), pb
        ])
        sha1hash(id).then((sha1) => {
          const hash = Buffer.from(sha1, 'binary')
          resolve(hash.toString('hex', hash.length - 8))  // 16-bit ID as hex
        })
      }
      if (cb) { doIt(cb, () => cb()) } else { return new Promise(doIt) }
    },
    pair(cb) {
      const doIt = (resolve, reject) => {
        const catcher = (e) => { Gun.log(e); reject(e) }
        const ecdhSubtle = subtleossl || subtle
        // First: ECDSA keys for signing/verifying...
        subtle.generateKey(ecdsakeyprops, true, [ 'sign', 'verify' ])
        .then(({ publicKey, privateKey }) => subtle.exportKey('jwk', privateKey)
        // privateKey scope doesn't leak out from here!
          .then(({ d: priv }) => ({ priv }))
          .then((keys) => subtle.exportKey('jwk', publicKey)
            .then(({ x, y }) => Object.assign(keys, {
              pub: Buffer.from([ x, y ].join(':')).toString('base64')
            }))
          ).catch(catcher)
          // return seaKeyid(keys.pub).then(function(id){
          //   keys.pubId = id;
          //   return keys;
          // });
        ).then((signingKeys) => ecdhSubtle.generateKey(ecdhkeyprops, true, ['deriveKey'])
          // Next: ECDH keys for encryption/decryption...
          .then(({ publicKey, privateKey }) => ecdhSubtle.exportKey('jwk', privateKey)
          // privateKey scope doesn't leak out from here!
            .then(({ d: epriv }) => Object.assign(signingKeys, { epriv }))
            .then((bothKeys) => ecdhSubtle.exportKey('jwk', publicKey)
              .then(({ x, y }) => Object.assign(bothKeys, {
                epub: Buffer.from([ x, y ].join(':')).toString('base64')
              }))
            ).catch(catcher)
          ).catch(catcher)
        ).then(resolve)
        .catch(catcher)
      }
      if (cb){ doIt(cb, () => cb()) } else { return new Promise(doIt) }
    },
    // Derive shared secret from other's pub and my epub/epriv
    derive(pub, { epub, epriv }, cb) {
      const ecdhSubtle = subtleossl || subtle
      const keystoecdhjwk = (pub, priv) => {
        const [ x, y ] = Buffer.from(pub, 'base64').toString('utf8').split(':')
        const jwk = priv ? { d: priv, key_ops: ['decrypt'] } : { key_ops: ['encrypt'] }
        return Object.assign(jwk, {
          kty: 'EC',
          crv: 'P-256',
          ext: false,
          x,
          y
        })
      }
      const doIt = (resolve, reject) => {
        const catcher = (e) => { Gun.log(e); reject(e) }
        ecdhSubtle.importKey('jwk', keystoecdhjwk(pub), ecdhkeyprops, false, ['deriveKey'])
        .then((pubKey) => {
          ecdhSubtle.importKey(
            'jwk', keystoecdhjwk(epub, epriv), ecdhkeyprops, false, ['deriveKey']
          ).then((privkey) => {
            const props = Object.assign({}, ecdhkeyprops, { public: pubKey })
            ecdhSubtle.deriveKey(
              props, privkey, { name: 'AES-CBC', length: 256 }, true, [ 'encrypt', 'decrypt' ]
            ).then((derivedkey) => ecdhSubtle.exportKey('jwk', derivedkey)
              .then(({ k }) => resolve(k))
            ).catch(catcher)
          }).catch(catcher)
        }).catch(catcher)
      }
      if (cb) { doIt(cb, () => cb()) } else { return new Promise(doIt) }
    },
    sign(data, { pub, priv }, cb) {
      const doIt = (resolve, reject) => {
        const catcher = (e) => { Gun.log(e); reject(e) }
        const jwk = keystoecdsajwk(pub, priv)
        sha256hash(data).then((hash) =>
          subtle.importKey('jwk', jwk, ecdsakeyprops, false, ['sign'])
          .then((key) => subtle.sign(ecdsasignprops, key, new Uint8Array(hash))
            .then((sig) => resolve(Buffer.from(sig, 'binary').toString('base64')))
            .catch(catcher)
          ).catch(catcher)
        )
      }
      if (cb) { doIt(cb, () => cb()) } else { return new Promise(doIt) }
    },
    verify(data, pub, sig, cb) {
      const doIt = (resolve, reject) => {
        const catcher = (e) => { Gun.log(e); reject(e) }
        subtle.importKey('jwk', keystoecdsajwk(pub), ecdsakeyprops, false, ['verify'])
        .then((key) => sha256hash(data).then((hash) => ({ key, hash })))
        .then(({ key, hash }) => {
          const ss = new Uint8Array(Buffer.from(sig, 'base64'))
          subtle.verify(ecdsasignprops, key, ss, new Uint8Array(hash))
          .then(resolve).catch(catcher)
        }).catch(catcher)
      }
      if (cb) { doIt(cb, () => cb()) } else { return new Promise(doIt) }
    },
    enc(data, priv, cb) {
      const doIt = (resolve, reject) => {
        const rands = { s: getRandomBytes(8), iv: getRandomBytes(16) }
        const r = Object.keys(rands)
        .reduce((obj, key) => Object.assign(obj, { [key]: rands[key].toString('hex') }), {})
        try {
          data = (data.slice && data) || JSON.stringify(data)
        } catch(e) {} //eslint-disable-line no-empty
        try {
          recallCryptoKey(priv, rands.s).then((aesKey) =>
            subtle.encrypt({
              name: 'AES-CBC', iv: new Uint8Array(rands.iv)
            }, aesKey, new TextEncoder().encode(data)).then((ct) => {
              /*
              MARK TO @mhelander : webcrypto has nu handle
              */
              // aesKey.handle.fill(0)
              Object.assign(r, { ct: Buffer.from(ct, 'binary').toString('base64') })
              resolve(JSON.stringify(r))
            }).catch((e) => {
              /*
              MARK TO @mhelander : webcrypto has nu handle
              */
              // aesKey.handle.fill(0)
              throw e
            })
          )
        } catch (e) {
          Gun.log(e)
          reject(e)
        }
      }
      if (cb) { doIt(cb, () => cb()) } else { return new Promise(doIt) }
    },
    dec(data, priv, cb) {
      const doIt = (resolve, reject) => {
        const { s, iv, ct } = parseProps(data)
        const mm = { s, iv, ct }
        const rands = [ 'iv', 's' ].reduce((obj, key) => Object.assign(obj, {
          [key]: new Uint8Array(Buffer.from(mm[key], 'hex'))
        }), {})
        try {
          recallCryptoKey(priv, rands.s).then((aesKey) =>
            subtle.decrypt({
              name: 'AES-CBC', iv: rands.iv
            }, aesKey, new Uint8Array(Buffer.from(mm.ct, 'base64'))).then(
              (ct) => new TextDecoder('utf8').decode(ct)
            ).then((ctUtf8) => {
              /*
              MARK TO @mhelander : webcrypto has nu handle
              */
              // aesKey.handle.fill(0)
              resolve(parseProps(ctUtf8))
            })
          ).catch((e) => { Gun.log(e); reject(e) })
        } catch (e) { Gun.log(e); reject(e) }
      }
      if (cb) { doIt(cb, () => cb()) } else { return new Promise(doIt) }
    },
    write(data, keys, cb) {
      const doIt = (resolve, reject) => {
        // TODO: something's bugging double 'SEA[]' treatment to mm...
        let m = data
        if (m && m.slice && 'SEA[' === m.slice(0, 4)) {
          return resolve(m)
        }
        if (data && data.slice) {
          // Needs to remove previous signature envelope
          while ('SEA[' === m.slice(0, 4)) {
            try {
              m = JSON.parse(m.slice(3))[0]
            } catch (e){
              break
            }
          }
        }
        m = (m && m.slice) ? m : JSON.stringify(m)
        seaSign(m, keys).then(
          (signature) => resolve(`SEA${JSON.stringify([ m, signature ])}`)
        ).catch((e) => { Gun.log(e); reject(e) })
      }
      if (cb) { doIt(cb, () => cb()) } else { return new Promise(doIt) }
    },
    read(data, pub, cb) {
      const doIt = (resolve, reject) => {
        let d
        if (!data) {
          if (false === pub) {
            return resolve(data)
          }
          return resolve()
        }
        if (!data.slice || 'SEA[' !== data.slice(0, 4)) {
          if (false === pub) {
            return resolve(data)
          }
          return resolve()
        }
        m = parseProps(data.slice(3))
        m = m || ''
        d = parseProps(m[0])
        if (false === pub) {
          resolve(d)
        }
        seaVerify(m[0], pub, m[1]).then((ok) => resolve(ok ? d : undefined))
        .catch((e) => reject(e))
      }
      if (cb && typeof cb === 'function') { doIt(cb, () => cb()) } else {
        return new Promise(doIt)
      }
    },
    // Internal helper for IndexedDB use - exposed for testing purposes only
    _callonstore_(fn_) {
      return new Promise((resolve) => {
        const open = indexedDB.open('GunDB', 1) // Open (or create) the database; 1 === 'version'
        open.onupgradeneeded = () => {  // Create the schema; props === current version
          const db = open.result
          db.createObjectStore('SEA', { keyPath: 'id' })
        }
        let result
        open.onsuccess = () => {    // Start a new transaction
          const db = open.result
          const tx = db.transaction('SEA', 'readwrite')
          const store = tx.objectStore('SEA')
          tx.oncomplete = () => {   // Close the db when the transaction is done
            db.close()
            resolve(result)
          }
          result = fn_(store)
        }
      })
    }
  }

  Gun.SEA = SEA

  // all done!
  // Obviously it is missing MANY necessary features. This is only an alpha release.
  // Please experiment with it, audit what I've done so far, and complain about what needs to be added.
  // SEA should be a full suite that is easy and seamless to use.
  // Again, scroll naer the top, where I provide an EXAMPLE of how to create a user and sign in.
  // Once logged in, the rest of the code you just read handled automatically signing/validating data.
  // But all other behavior needs to be equally easy, like opinionated ways of
  // Adding friends (trusted public keys), sending private messages, etc.
  // Cheers! Tell me what you think.

  try {
    module.exports = SEA
  } catch (e) {}  //eslint-disable-line no-empty
}());
