
    const Gun = (typeof window !== 'undefined' ? window : global).Gun || require('gun/gun')

    var wc = require('./webcrypto');
    var subtle = wc.subtle;
    var getRandomBytes = wc.random;
    var EasyIndexedDB = require('./indexed');
    var SafeBuffer = require('./buffer');
    var settings = require('./settings');
    var pbKdf2 = settings.pbkdf2;
    var ecdsaKeyProps = settings.ecdsa.pair;
    var ecdhKeyProps = settings.ecdh;
    var keysToEcdsaJwk = settings.jwk;
    var ecdsaSignProps = settings.ecdsa.sign;
    var sha256hash = require('./sha256');
    var recallCryptoKey = require('./remember');
    var parseProps = require('./parse');
    
    // Practical examples about usage found from ./test/common.js
    const SEA = {
      // This is easy way to use IndexedDB, all methods are Promises
      EasyIndexedDB,
      // This is Buffer used in SEA and usable from Gun/SEA application also.
      // For documentation see https://nodejs.org/api/buffer.html
      Buffer: SafeBuffer,
      // These SEA functions support now ony Promises or
      // async/await (compatible) code, use those like Promises.
      //
      // Creates a wrapper library around Web Crypto API
      // for various AES, ECDSA, PBKDF2 functions we called above.
      async proof(pass, salt) {
        try {
          if (typeof window !== 'undefined') {
            // For browser subtle works fine
            const key = await subtle.importKey(
              'raw', new TextEncoder().encode(pass), { name: 'PBKDF2' }, false, ['deriveBits']
            )
            const result = await subtle.deriveBits({
              name: 'PBKDF2',
              iterations: pbKdf2.iter,
              salt: new TextEncoder().encode(salt),
              hash: pbKdf2.hash,
            }, key, pbKdf2.ks * 8)
            pass = getRandomBytes(pass.length)  // Erase passphrase for app
            return Buffer.from(result, 'binary').toString('base64')
          }
          // For NodeJS crypto.pkdf2 rocks
          const hash = crypto.pbkdf2Sync(
            pass,
            new TextEncoder().encode(salt),
            pbKdf2.iter,
            pbKdf2.ks,
            pbKdf2.hash.replace('-', '').toLowerCase()
          )
          pass = getRandomBytes(pass.length)  // Erase passphrase for app
          return hash && hash.toString('base64')
        } catch (e) {
          Gun.log(e)
          throw e
        }
      },
      // Calculate public key KeyID aka PGPv4 (result: 8 bytes as hex string)
      async keyid(pub) {
        try {
          // base64('base64(x):base64(y)') => Buffer(xy)
          const pb = Buffer.concat(
            Buffer.from(pub, 'base64').toString('utf8').split(':')
            .map((t) => Buffer.from(t, 'base64'))
          )
          // id is PGPv4 compliant raw key
          const id = Buffer.concat([
            Buffer.from([0x99, pb.length / 0x100, pb.length % 0x100]), pb
          ])
          const sha1 = await sha1hash(id)
          const hash = Buffer.from(sha1, 'binary')
          return hash.toString('hex', hash.length - 8)  // 16-bit ID as hex
        } catch (e) {
          Gun.log(e)
          throw e
        }
      },
      async pair() {
        try {
          const ecdhSubtle = wc.ossl || subtle
          // First: ECDSA keys for signing/verifying...
          const { pub, priv } = await subtle.generateKey(ecdsaKeyProps, true, [ 'sign', 'verify' ])
          .then(async ({ publicKey, privateKey }) => {
            const { d: priv } = await subtle.exportKey('jwk', privateKey)
            // privateKey scope doesn't leak out from here!
            const { x, y } = await subtle.exportKey('jwk', publicKey)
            const pub = Buffer.from([ x, y ].join(':')).toString('base64')
            return { pub, priv }
          })
          // To include PGPv4 kind of keyId:
          // const pubId = await SEA.keyid(keys.pub)
          // Next: ECDH keys for encryption/decryption...
          const { epub, epriv } = await ecdhSubtle.generateKey(ecdhKeyProps, true, ['deriveKey'])
          .then(async ({ publicKey, privateKey }) => {
            // privateKey scope doesn't leak out from here!
            const { d: epriv } = await ecdhSubtle.exportKey('jwk', privateKey)
            const { x, y } = await ecdhSubtle.exportKey('jwk', publicKey)
            const epub = Buffer.from([ x, y ].join(':')).toString('base64')
            return { epub, epriv }
          })
          return { pub, priv, /* pubId, */ epub, epriv }
        } catch (e) {
          Gun.log(e)
          throw e
        }
      },
      // Derive shared secret from other's pub and my epub/epriv
      async derive(pub, { epub, epriv }) {
        try {
          const { importKey, deriveKey, exportKey } = subtleossl || subtle
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
          const pubLic = await importKey('jwk', keystoecdhjwk(pub), ecdhKeyProps, false, ['deriveKey'])
          const props = Object.assign({}, ecdhKeyProps, { public: pubLic })
          const derived = await importKey('jwk', keystoecdhjwk(epub, epriv), ecdhKeyProps, false, ['deriveKey'])
          .then(async (privKey) => {
            // privateKey scope doesn't leak out from here!
            const derivedKey = await deriveKey(props, privKey, { name: 'AES-CBC', length: 256 }, true, [ 'encrypt', 'decrypt' ])
            return exportKey('jwk', derivedKey).then(({ k }) => k)
          })
          return derived
        } catch (e) {
          Gun.log(e)
          throw e
        }
      },
      async sign(data, { pub, priv }) {
        try {
          const jwk = keysToEcdsaJwk(pub, priv)
          const hash = await sha256hash(data)
          // privateKey scope doesn't leak out from here!
          const binSig = await subtle.importKey(...jwk, ecdsaKeyProps, false, ['sign'])
          .then((privKey) => subtle.sign(ecdsaSignProps, privKey, new Uint8Array(hash)))
          return Buffer.from(binSig, 'binary').toString('base64')
        } catch (e) {
          Gun.log(e)
          throw e
        }
      },
      async verify(data, pub, sig) {
        try {
          const jwk = keysToEcdsaJwk(pub)
          const key = await subtle.importKey(...jwk, ecdsaKeyProps, false, ['verify'])
          const hash = await sha256hash(data)
          const ss = new Uint8Array(Buffer.from(sig, 'base64'))
          return await subtle.verify(ecdsaSignProps, key, ss, new Uint8Array(hash))
        } catch (e) {
          Gun.log(e)
          throw e
        }
      },
      async enc(data, priv) {
        try {
          const rands = { s: getRandomBytes(8), iv: getRandomBytes(16) }
          const r = Object.keys(rands)
          .reduce((obj, key) => Object.assign(obj, { [key]: rands[key].toString('hex') }), {})
          try {
            data = (data.slice && data) || JSON.stringify(data)
          } catch(e) {} //eslint-disable-line no-empty
          const ct = await recallCryptoKey(priv, rands.s)
          .then((aesKey) => subtle.encrypt({ // Keeping aesKey scope as private as possible...
            name: 'AES-CBC', iv: new Uint8Array(rands.iv)
          }, aesKey, new TextEncoder().encode(data)))
          Object.assign(r, { ct: Buffer.from(ct, 'binary').toString('base64') })
          return JSON.stringify(r)
        } catch (e) {
          Gun.log(e)
          throw e
        }
      },
      async dec(data, priv) {
        try {
          const { s, iv, ct } = parseProps(data)
          const mm = { s, iv, ct }
          const rands = [ 'iv', 's' ].reduce((obj, key) => Object.assign(obj, {
            [key]: new Uint8Array(Buffer.from(mm[key], 'hex'))
          }), {})
          const binCt = await recallCryptoKey(priv, rands.s)
          .then((aesKey) => subtle.decrypt({  // Keeping aesKey scope as private as possible...
            name: 'AES-CBC', iv: rands.iv
          }, aesKey, new Uint8Array(Buffer.from(mm.ct, 'base64'))))
          return parseProps(new TextDecoder('utf8').decode(binCt))
        } catch (e) {
          Gun.log(e)
          throw e
        }
      },
      async write(data, keys) {
        try {
          // TODO: something's bugging double 'SEA[]' treatment to mm...
          let m = data
          if (m && m.slice && 'SEA[' === m.slice(0, 4)) {
            return m
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
          const signature = await SEA.sign(m, keys)
          return `SEA${JSON.stringify([ m, signature ])}`
        } catch (e) {
          Gun.log(e)
          throw e
        }
      },
      async read(data, pub) {
        try {
          let d
          if (!data) {
            return false === pub ? data : undefined
          }
          if (!data.slice || 'SEA[' !== data.slice(0, 4)) {
            return false === pub ? data : undefined
          }
          let m = parseProps(data.slice(3)) || ''
          d = parseProps(m[0])
          if (false === pub) {
            return d
          }
          return (await SEA.verify(m[0], pub, m[1])) ? d : undefined
        } catch (e) {
          Gun.log(e)
          throw e
        }
      }
    }
    // Usage of the SEA object changed! Now use like this:
    // const gun = new Gun()
    // const SEA = gun.SEA()
    //Gun.SEA = () => SEA
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
  