;(function(){

  /* UNBUILD */
  var root;
  if(typeof window !== "undefined"){ root = window }
  if(typeof global !== "undefined"){ root = global }
  root = root || {};
  var console = root.console || {log: function(){}};
  function USE(arg){
    return arg.slice? USE[R(arg)] : function(mod, path){
      arg(mod = {exports: {}});
      USE[R(path)] = mod.exports;
    }
    function R(p){
      return p.split('/').slice(-1).toString().replace('.js','');
    }
  }
  if(typeof module !== "undefined"){ var common = module }
  /* UNBUILD */

  ;USE(function(module){
    // Security, Encryption, and Authorization: SEA.js
    // MANDATORY READING: http://gun.js.org/explainers/data/security.html
    // THIS IS AN EARLY ALPHA!

    function SEA(){}
    if(typeof window !== "undefined"){ SEA.window = window }

    module.exports = SEA;
  })(USE, './root');

  ;USE(function(module){
    var SEA = USE('./root');
    if(SEA.window){
      if(location.protocol.indexOf('s') < 0
      && location.host.indexOf('localhost') < 0
      && location.protocol.indexOf('file:') < 0){
        location.protocol = 'https:';
      }
    }
  })(USE, './https');

  ;USE(function(module){
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
    module.exports = SeaArray;
  })(USE, './array');

  ;USE(function(module){
    // This is Buffer implementation used in SEA. Functionality is mostly
    // compatible with NodeJS 'safe-buffer' and is used for encoding conversions
    // between binary and 'hex' | 'utf8' | 'base64'
    // See documentation and validation for safe implementation in:
    // https://github.com/feross/safe-buffer#update
    var SeaArray = USE('./array');
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

    module.exports = SafeBuffer;
  })(USE, './buffer');

  ;USE(function(module){
    const Buffer = USE('./buffer')
    const api = {Buffer: Buffer}

    if (typeof __webpack_require__ === 'function' || typeof window !== 'undefined') {
      const { msCrypto, crypto = msCrypto } = window          // STD or M$
      const { webkitSubtle, subtle = webkitSubtle } = crypto  // STD or iSafari
      const { TextEncoder, TextDecoder } = window
      Object.assign(api, {
        crypto,
        subtle,
        TextEncoder,
        TextDecoder,
        random: (len) => Buffer.from(crypto.getRandomValues(new Uint8Array(Buffer.alloc(len))))
      })
    } else {
      try{
      const crypto = require('crypto')
      //const WebCrypto = require('node-webcrypto-ossl')
      //const { subtle: ossl } = new WebCrypto({directory: 'key_storage'}) // ECDH
      const { subtle } = require('@trust/webcrypto')             // All but ECDH
      const { TextEncoder, TextDecoder } = require('text-encoding')
      Object.assign(api, {
        crypto,
        subtle,
        //ossl,
        TextEncoder,
        TextDecoder,
        random: (len) => Buffer.from(crypto.randomBytes(len))
      })
      }catch(e){
        console.log("@trust/webcrypto and text-encoding are not included by default, you must add it to your package.json!");
        TRUST_WEBCRYPTO_OR_TEXT_ENCODING_NOT_INSTALLED;
      }
    }

    module.exports = api
  })(USE, './shim');

  ;USE(function(module){
    const Buffer = USE('./buffer')
    const settings = {}
    // Encryption parameters
    const pbkdf2 = { hash: 'SHA-256', iter: 100000, ks: 64 }

    const ecdsaSignProps = { name: 'ECDSA', hash: { name: 'SHA-256' } }
    const ecdsaKeyProps = { name: 'ECDSA', namedCurve: 'P-256' }
    const ecdhKeyProps = { name: 'ECDH', namedCurve: 'P-256' }

    const _initial_authsettings = {
      validity: 12 * 60 * 60, // internally in seconds : 12 hours
      hook: (props) => props  // { iat, exp, alias, remember }
      // or return new Promise((resolve, reject) => resolve(props)
    }
    // These are used to persist user's authentication "session"
    const authsettings = Object.assign({}, _initial_authsettings)
    // This creates Web Cryptography API compliant JWK for sign/verify purposes
    const keysToEcdsaJwk = (pub, d) => {  // d === priv
      //const [ x, y ] = Buffer.from(pub, 'base64').toString('utf8').split(':') // old
      const [ x, y ] = pub.split('.') // new
      var jwk = { kty: "EC", crv: "P-256", x: x, y: y, ext: true }
      jwk.key_ops = d ? ['sign'] : ['verify'];
      if(d){ jwk.d = d }
      return jwk;
    }

    Object.assign(settings, {
      pbkdf2,
      ecdsa: {
        pair: ecdsaKeyProps,
        sign: ecdsaSignProps
      },
      ecdh: ecdhKeyProps,
      jwk: keysToEcdsaJwk,
      recall: authsettings
    })
    module.exports = settings
  })(USE, './settings');

  ;USE(function(module){
    module.exports = (props) => {
      try {
        if(props.slice && 'SEA{' === props.slice(0,4)){
          props = props.slice(3);
        }
        return props.slice ? JSON.parse(props) : props
      } catch (e) {}  //eslint-disable-line no-empty
      return props
    }
  })(USE, './parse');

  ;USE(function(module){
    const {
      subtle, ossl = subtle, random: getRandomBytes, TextEncoder, TextDecoder
    } = USE('./shim')
    const Buffer = USE('./buffer')
    const parse = USE('./parse')
    const { pbkdf2 } = USE('./settings')
    // This internal func returns SHA-256 hashed data for signing
    const sha256hash = async (mm) => {
      const m = parse(mm)
      const hash = await ossl.digest({name: pbkdf2.hash}, new TextEncoder().encode(m))
      return Buffer.from(hash)
    }
    module.exports = sha256hash
  })(USE, './sha256');

  ;USE(function(module){
    // This internal func returns SHA-1 hashed data for KeyID generation
    const { subtle, ossl = subtle } = USE('./shim')
    const sha1hash = (b) => ossl.digest({name: 'SHA-1'}, new ArrayBuffer(b))
    module.exports = sha1hash
  })(USE, './sha1');

  ;USE(function(module){
    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var u;

    SEA.work = async (data, pair, cb) => { try { // used to be named `proof`
      var salt = pair.epub || pair; // epub not recommended, salt should be random!
      if(salt instanceof Function){
        cb = salt;
        salt = u;
      }
      salt = salt || shim.random(9);
      if (SEA.window) {
        // For browser subtle works fine
        const key = await shim.subtle.importKey(
          'raw', new shim.TextEncoder().encode(data), { name: 'PBKDF2' }, false, ['deriveBits']
        )
        const result = await shim.subtle.deriveBits({
          name: 'PBKDF2',
          iterations: S.pbkdf2.iter,
          salt: new shim.TextEncoder().encode(salt),
          hash: S.pbkdf2.hash,
        }, key, S.pbkdf2.ks * 8)
        data = shim.random(data.length)  // Erase data in case of passphrase
        const r = shim.Buffer.from(result, 'binary').toString('utf8')
        if(cb){ cb(r) }
        return r;
      }
      // For NodeJS crypto.pkdf2 rocks
      const hash = crypto.pbkdf2Sync(
        data,
        new shim.TextEncoder().encode(salt),
        S.pbkdf2.iter,
        S.pbkdf2.ks,
        S.pbkdf2.hash.replace('-', '').toLowerCase()
      )
      data = shim.random(data.length)  // Erase passphrase for app
      const r = hash && hash.toString('utf8')
      if(cb){ cb(r) }
      return r;
    } catch(e) { 
      SEA.err = e;
      if(cb){ cb() }
      return;
    }}

    module.exports = SEA.work;
  })(USE, './work');

  ;USE(function(module){
    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var Buff = (typeof Buffer !== 'undefined')? Buffer : shim.Buffer;

    //SEA.pair = async (data, proof, cb) => { try {
    SEA.pair = async (cb) => { try {

      const ecdhSubtle = shim.ossl || shim.subtle
      // First: ECDSA keys for signing/verifying...
      const { pub, priv } = await shim.subtle.generateKey(S.ecdsa.pair, true, [ 'sign', 'verify' ])
      .then(async (keys) => {
        // privateKey scope doesn't leak out from here!
        const { d: priv } = await shim.subtle.exportKey('jwk', keys.privateKey)
        const { x, y } = await shim.subtle.exportKey('jwk', keys.publicKey)
        //const pub = Buff.from([ x, y ].join(':')).toString('base64') // old
        const pub = x+'.'+y // new
        // x and y are already base64
        // pub is UTF8 but filename/URL safe (https://www.ietf.org/rfc/rfc3986.txt)
        // but split on a non-base64 letter.
        return { pub, priv }
      })
      
      // To include PGPv4 kind of keyId:
      // const pubId = await SEA.keyid(keys.pub)
      // Next: ECDH keys for encryption/decryption...

      const { epub, epriv } = await ecdhSubtle.generateKey(S.ecdh, true, ['deriveKey'])
      .then(async (keys) => {
        // privateKey scope doesn't leak out from here!
        const { d: epriv } = await ecdhSubtle.exportKey('jwk', keys.privateKey)
        const { x, y } = await ecdhSubtle.exportKey('jwk', keys.publicKey)
        //const epub = Buff.from([ ex, ey ].join(':')).toString('base64') // old
        const epub = x+'.'+y // new
        // ex and ey are already base64
        // epub is UTF8 but filename/URL safe (https://www.ietf.org/rfc/rfc3986.txt)
        // but split on a non-base64 letter.
        return { epub, epriv }
      })

      const r = { pub, priv, /* pubId, */ epub, epriv }
      if(cb){ cb(r) }
      return r;
    } catch(e) { 
      SEA.err = e;
      if(cb){ cb() }
      return;
    }}

    module.exports = SEA.pair;
  })(USE, './pair');

  ;USE(function(module){
    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var sha256hash = USE('./sha256');

    SEA.sign = async (data, pair, cb) => { try {
      if(data.slice
      && 'SEA{' === data.slice(0,4)
      && '"m":' === data.slice(4,8)){
        // TODO: This would prevent pair2 signing pair1's signature.
        // So we may want to change this in the future.
        // but for now, we want to prevent duplicate double signature.
        if(cb){ cb(data) }
        return data;
      }
      const pub = pair.pub
      const priv = pair.priv
      const jwk = S.jwk(pub, priv)
      const msg = JSON.stringify(data)
      const hash = await sha256hash(msg)
      const sig = await shim.subtle.importKey('jwk', jwk, S.ecdsa.pair, false, ['sign'])
      .then((key) => shim.subtle.sign(S.ecdsa.sign, key, new Uint8Array(hash))) // privateKey scope doesn't leak out from here!
      const r = 'SEA'+JSON.stringify({m: msg, s: shim.Buffer.from(sig, 'binary').toString('utf8')});

      if(cb){ cb(r) }
      return r;
    } catch(e) { 
      SEA.err = e;
      if(cb){ cb() }
      return;
    }}

    module.exports = SEA.sign;
  })(USE, './sign');

  ;USE(function(module){
    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var sha256hash = USE('./sha256');
    var parse = USE('./parse');
    var u;

    SEA.verify = async (data, pair, cb) => { try {
      const json = parse(data)
      if(false === pair){ // don't verify!
        const raw = (json === data)? json : parse(json.m)
        if(cb){ cb(raw) }
        return raw;
      }
      const pub = pair.pub || pair
      const jwk = S.jwk(pub)
      const key = await shim.subtle.importKey('jwk', jwk, S.ecdsa.pair, false, ['verify'])
      const hash = await sha256hash(json.m)
      const sig = new Uint8Array(shim.Buffer.from(json.s, 'utf8'))
      const check = await shim.subtle.verify(S.ecdsa.sign, key, sig, new Uint8Array(hash))
      if(!check){ throw "Signature did not match." }
      const r = check? parse(json.m) : u;

      if(cb){ cb(r) }
      return r;
    } catch(e) { 
      SEA.err = e;
      if(cb){ cb() }
      return;
    }}

    module.exports = SEA.verify;
  })(USE, './verify');

  ;USE(function(module){
    var shim = USE('./shim');
    var sha256hash = USE('./sha256');

    const importGen = async (key, salt) => {
      //const combo = shim.Buffer.concat([shim.Buffer.from(key, 'utf8'), salt || shim.random(8)]).toString('utf8') // old
      const combo = key + (salt || shim.random(8)).toString('utf8'); // new
      const hash = shim.Buffer.from(await sha256hash(combo), 'binary')
      return await shim.subtle.importKey('raw', new Uint8Array(hash), 'AES-CBC', false, ['encrypt', 'decrypt'])
    }
    module.exports = importGen;
  })(USE, './aescbc');

  ;USE(function(module){
    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var aescbckey = USE('./aescbc');

    SEA.encrypt = async (data, pair, cb) => { try {
      const key = pair.epriv || pair;
      const msg = JSON.stringify(data)
      const rand = {s: shim.random(8), iv: shim.random(16)};
      const ct = await aescbckey(key, rand.s)
      .then((aes) => shim.subtle.encrypt({ // Keeping the AES key scope as private as possible...
        name: 'AES-CBC', iv: new Uint8Array(rand.iv)
      }, aes, new shim.TextEncoder().encode(msg)))
      const r = 'SEA'+JSON.stringify({
        ct: shim.Buffer.from(ct, 'binary').toString('utf8'),
        iv: rand.iv.toString('utf8'),
        s: rand.s.toString('utf8')
      });

      if(cb){ cb(r) }
      return r;
    } catch(e) { 
      SEA.err = e;
      if(cb){ cb() }
      return;
    }}

    module.exports = SEA.encrypt;
  })(USE, './encrypt');

  ;USE(function(module){
    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var aescbckey = USE('./aescbc');
    var parse = USE('./parse');

    SEA.decrypt = async (data, pair, cb) => { try {
      const key = pair.epriv || pair;
      const json = parse(data)
      const ct = await aescbckey(key, shim.Buffer.from(json.s, 'utf8'))
      .then((aes) => shim.subtle.decrypt({  // Keeping aesKey scope as private as possible...
        name: 'AES-CBC', iv: new Uint8Array(shim.Buffer.from(json.iv, 'utf8'))
      }, aes, new Uint8Array(shim.Buffer.from(json.ct, 'utf8'))))
      const r = parse(new shim.TextDecoder('utf8').decode(ct))
      
      if(cb){ cb(r) }
      return r;
    } catch(e) { 
      SEA.err = e;
      if(cb){ cb() }
      return;
    }}

    module.exports = SEA.decrypt;
  })(USE, './decrypt');

  ;USE(function(module){
    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    // Derive shared secret from other's pub and my epub/epriv
    SEA.secret = async (key, pair, cb) => { try {
      const pub = key.epub || key
      const epub = pair.epub
      const epriv = pair.epriv
      const ecdhSubtle = shim.ossl || shim.subtle
      const pubKeyData = keysToEcdhJwk(pub)
      const props = {
        ...S.ecdh,
        public: await ecdhSubtle.importKey(...pubKeyData, true, [])
      }
      const privKeyData = keysToEcdhJwk(epub, epriv)
      const derived = await ecdhSubtle.importKey(...privKeyData, false, ['deriveKey'])
      .then(async (privKey) => {
        // privateKey scope doesn't leak out from here!
        const derivedKey = await ecdhSubtle.deriveKey(props, privKey, { name: 'AES-CBC', length: 256 }, true, [ 'encrypt', 'decrypt' ])
        return ecdhSubtle.exportKey('jwk', derivedKey).then(({ k }) => k)
      })
      const r = derived;
      if(cb){ cb(r) }
      return r;
    } catch(e) { 
      SEA.err = e;
      if(cb){ cb() }
      return;
    }}

    const keysToEcdhJwk = (pub, d) => { // d === priv
      //const [ x, y ] = Buffer.from(pub, 'base64').toString('utf8').split(':') // old
      const [ x, y ] = pub.split('.') // new
      const jwk = d ? { d } : {}
      return [  // Use with spread returned value...
        'jwk',
        { ...jwk, x, y, kty: 'EC', crv: 'P-256', ext: true }, // ??? refactor
        S.ecdh
      ]
    }

    module.exports = SEA.secret;
  })(USE, './secret');

  ;USE(function(module){
    // Old Code...
    const {
      crypto,
      subtle,
      ossl,
      random: getRandomBytes,
      TextEncoder,
      TextDecoder
    } = USE('./shim')
    const EasyIndexedDB = USE('./indexed')
    const Buffer = USE('./buffer')
    var settings = USE('./settings');
    const {
      pbkdf2: pbKdf2,
      ecdsa: { pair: ecdsaKeyProps, sign: ecdsaSignProps },
      ecdh: ecdhKeyProps,
      jwk: keysToEcdsaJwk
    } = USE('./settings')
    const sha1hash = USE('./sha1')
    const sha256hash = USE('./sha256')
    const recallCryptoKey = USE('./remember')
    const parseProps = USE('./parse')

    // Practical examples about usage found from ./test/common.js
    const SEA = USE('./root');
    SEA.work = USE('./work');
    SEA.sign = USE('./sign');
    SEA.verify = USE('./verify');
    SEA.encrypt = USE('./encrypt');
    SEA.decrypt = USE('./decrypt');

    SEA.random = getRandomBytes;

    // This is easy way to use IndexedDB, all methods are Promises
    // Note: Not all SEA interfaces have to support this.
    SEA.EasyIndexedDB = EasyIndexedDB;

    // This is Buffer used in SEA and usable from Gun/SEA application also.
    // For documentation see https://nodejs.org/api/buffer.html
    SEA.Buffer = Buffer;

    // These SEA functions support now ony Promises or
    // async/await (compatible) code, use those like Promises.
    //
    // Creates a wrapper library around Web Crypto API
    // for various AES, ECDSA, PBKDF2 functions we called above.
    // Calculate public key KeyID aka PGPv4 (result: 8 bytes as hex string)
    SEA.keyid = async (pub) => {
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
        console.log(e)
        throw e
      }
    }
    // all done!
    // Obviously it is missing MANY necessary features. This is only an alpha release.
    // Please experiment with it, audit what I've done so far, and complain about what needs to be added.
    // SEA should be a full suite that is easy and seamless to use.
    // Again, scroll naer the top, where I provide an EXAMPLE of how to create a user and sign in.
    // Once logged in, the rest of the code you just read handled automatically signing/validating data.
    // But all other behavior needs to be equally easy, like opinionated ways of
    // Adding friends (trusted public keys), sending private messages, etc.
    // Cheers! Tell me what you think.
    var Gun = (SEA.window||{}).Gun || require('./gun');
    Gun.SEA = SEA;
    SEA.Gun = Gun;

    module.exports = SEA
  })(USE, './sea');

  ;USE(function(module){
    var SEA = USE('./sea');
    var Gun = SEA.Gun;
    // This is internal func queries public key(s) for alias.
    const queryGunAliases = (alias, gunRoot) => new Promise((resolve, reject) => {
      // load all public keys associated with the username alias we want to log in with.
      gunRoot.get(`alias/${alias}`).get((rat, rev) => {
        rev.off();
        if (!rat.put) {
          // if no user, don't do anything.
          const err = 'No user!'
          Gun.log(err)
          return reject({ err })
        }
        // then figuring out all possible candidates having matching username
        const aliases = []
        let c = 0
        // TODO: how about having real chainable map without callback ?
        Gun.obj.map(rat.put, (at, pub) => {
          if (!pub.slice || 'pub/' !== pub.slice(0, 4)) {
            // TODO: ... this would then be .filter((at, pub))
            return
          }
          ++c
          // grab the account associated with this public key.
          gunRoot.get(pub).get((at, ev) => {
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
    module.exports = queryGunAliases
  })(USE, './query');

  ;USE(function(module){
    var SEA = USE('./sea');
    var Gun = SEA.Gun;
    const queryGunAliases = USE('./query')
    const parseProps = USE('./parse')
    // This is internal User authentication func.
    const authenticate = async (alias, pass, gunRoot) => {
      // load all public keys associated with the username alias we want to log in with.
      const aliases = (await queryGunAliases(alias, gunRoot))
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
      // SEA.verify(at.put.auth, pub).then(function(auth){
        try {
          const proof = await SEA.work(pass, auth.s)
          const props = { pub, proof, at }
          // the proof of work is evidence that we've spent some time/effort trying to log in, this slows brute force.
          /*
          MARK TO @mhelander : pub vs epub!???
          */
          const { salt } = auth
          const sea = await SEA.decrypt(auth.ek, proof)
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
          if(typeof window !== 'undefined'){
            var tmp = window.sessionStorage;
            if(tmp && gunRoot._.opt.remember){
              window.sessionStorage.alias = alias;
              window.sessionStorage.tmp = pass;
            }
          }
          return Object.assign(props, { priv, salt, epub, epriv })
        } catch (e) {
          err = 'Failed to decrypt secret!'
          throw { err }
        }
      }))

      if (!user) {
        throw { err: err || 'Public key does not exist!' }
      }
      return user
    }
    module.exports = authenticate;
  })(USE, './authenticate');

  ;USE(function(module){
    // TODO: BUG! `SEA` needs to be USED!
    const Gun = (typeof window !== 'undefined' ? window : global).Gun || USE('gun/gun')
    const authsettings = USE('./settings')
    const SEA = USE('./sea');
    //const { scope: seaIndexedDb } = USE('./indexed')
    // This updates sessionStorage & IndexedDB to persist authenticated "session"
    const updateStorage = (proof, key, pin) => async (props) => {
      if (!Gun.obj.has(props, 'alias')) {
        return  // No 'alias' - we're done.
      }
      if (authsettings.validity && proof && Gun.obj.has(props, 'iat')) {
        props.proof = proof
        delete props.remember   // Not stored if present

        const { alias, alias: id } = props
        const remember = { alias, pin }

        try {
          const signed = await SEA.sign(JSON.stringify(remember), key)

          sessionStorage.setItem('user', alias)
          sessionStorage.setItem('remember', signed)

          const encrypted = await SEA.encrypt(props, pin)

          if (encrypted) {
            const auth = await SEA.sign(encrypted, key)
            await seaIndexedDb.wipe() // NO! Do not do this. It ruins other people's sessionStorage code. This is bad/wrong, commenting it out.
            await seaIndexedDb.put(id, { auth })
          }

          return props
        } catch (err) {
          throw { err: 'Session persisting failed!' }
        }
      }

      // Wiping IndexedDB completely when using random PIN
      await seaIndexedDb.wipe() // NO! Do not do this. It ruins other people's sessionStorage code. This is bad/wrong, commenting it out.
      // And remove sessionStorage data
      sessionStorage.removeItem('user')
      sessionStorage.removeItem('remember')

      return props
    }
    module.exports = updateStorage
  })(USE, './update');

  ;USE(function(module){
    const Gun = (typeof window !== 'undefined' ? window : global).Gun || USE('gun/gun')
    const Buffer = USE('./buffer')
    const authsettings = USE('./settings')
    const updateStorage = USE('./update')
    // This internal func persists User authentication if so configured
    const authPersist = async (user, proof, opts) => {
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
      const { validity: exp } = authsettings      // seconds // @mhelander what is `exp`???

      if (proof && alias && exp) {
        const iat = Math.ceil(Date.now() / 1000)  // seconds
        const remember = Gun.obj.has(opts, 'pin') || undefined  // for hook - not stored
        const props = authsettings.hook({ alias, iat, exp, remember })
        const { pub, epub, sea: { priv, epriv } } = user
        const key = { pub, priv, epub, epriv }
        if (props instanceof Promise) {
          const asyncProps = await props.then()
          return await updateStorage(proof, key, pin)(asyncProps)
        }
        return await updateStorage(proof, key, pin)(props)
      }
      return await updateStorage()({ alias: 'delete' })
    }
    module.exports = authPersist
  })(USE, './persist');

  ;USE(function(module){
    const authPersist = USE('./persist')
    // This internal func finalizes User authentication
    const finalizeLogin = async (alias, key, gunRoot, opts) => {
      const { user } = gunRoot._
      // add our credentials in-memory only to our root gun instance
      //var tmp = user._.tag;
      user._ = key.at.gun._
      //user._.tag = tmp || user._.tag;
      // so that way we can use the credentials to encrypt/decrypt data
      // that is input/output through gun (see below)
      const { pub, priv, epub, epriv } = key
      user._.is = user.is = {alias: alias, pub: pub};
      Object.assign(user._, { alias, pub, epub, sea: { pub, priv, epub, epriv } })
      //console.log("authorized", user._);
      // persist authentication
      //await authPersist(user._, key.proof, opts) // temporarily disabled
      // emit an auth event, useful for page redirects and stuff.  
      try {
        gunRoot._.on('auth', user._)
      } catch (e) {
        console.log('Your \'auth\' callback crashed with:', e)
      }
      // returns success with the user data credentials.
      return user._
    }
    module.exports = finalizeLogin
  })(USE, './login');

  ;USE(function(module){
    // TODO: BUG! `SEA` needs to be USEd!
    const Gun = (typeof window !== 'undefined' ? window : global).Gun || USE('gun/gun')

    const Buffer = USE('./buffer')
    const authsettings = USE('./settings')
    //const { scope: seaIndexedDb } = USE('./indexed')
    const queryGunAliases = USE('./query')
    const parseProps = USE('./parse')
    const updateStorage = USE('./update')
    const SEA = USE('./sea')
    const finalizeLogin = USE('./login')

    // This internal func recalls persisted User authentication if so configured
    const authRecall = async (gunRoot, authprops) => {
      // window.sessionStorage only holds signed { alias, pin } !!!
      const remember = authprops || sessionStorage.getItem('remember')
      const { alias = sessionStorage.getItem('user'), pin: pIn } = authprops || {} // @mhelander what is pIn?
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
        parseProps(await SEA.decrypt(await SEA.verify(data, pub), key))

      // Already authenticated?
      if (gunRoot._.user
      && Gun.obj.has(gunRoot._.user._, 'pub')
      && Gun.obj.has(gunRoot._.user._, 'sea')) {
        return gunRoot._.user._  // Yes, we're done here.
      }
      // No, got persisted 'alias'?
      if (!alias) {
        throw { err: 'No authentication session found!' }
      }
      // Yes, got persisted 'remember'?
      if (!remember) {
        throw {  // And return proof if for matching alias
          err: (await seaIndexedDb.get(alias, 'auth') && authsettings.validity
          && 'Missing PIN and alias!') || 'No authentication session found!'
        }
      }
      // Yes, let's get (all?) matching aliases
      const aliases = (await queryGunAliases(alias, gunRoot))
      .filter(({ pub } = {}) => !!pub)
      // Got any?
      if (!aliases.length) {
        throw { err: 'Public key does not exist!' }
      }
      let err
      // Yes, then attempt to log into each one until we find ours!
      // (if two users have the same username AND the same password... that would be bad)
      const [ { key, at, proof, pin: newPin } = {} ] = await Promise
      .all(aliases.filter(({ at: { put } = {} }) => !!put)
      .map(async ({ at, pub }) => {
        const readStorageData = async (args) => {
          const props = args || parseProps(await SEA.verify(remember, pub, true))
          let { pin, alias: aLias } = props

          const data = (!pin && alias === aLias)
          // No PIN, let's try short-term proof if for matching alias
          ? await checkRememberData(props)
          // Got PIN so get IndexedDB secret if signature is ok
          : await checkRememberData(await readAndDecrypt(await seaIndexedDb.get(alias, 'auth'), pub, pin))
          pin = pin || data.pin
          delete data.pin
          return { pin, data }
        }
        // got pub, try auth with pin & alias :: or unwrap Storage data...
        const { data, pin: newPin } = await readStorageData(pin && { pin, alias })
        const { proof } = data || {}

        if (!proof) {
          if (!data) {
            err = 'No valid authentication session found!'
            return
          }
          try { // Wipes IndexedDB silently
            await updateStorage()(data)
          } catch (e) {}  //eslint-disable-line no-empty
          err = 'Expired session!'
          return
        }

        try { // auth parsing or decryption fails or returns empty - silently done
          const { auth } = at.put.auth
          const sea = await SEA.decrypt(auth, proof)
          if (!sea) {
            err = 'Failed to decrypt private key!'
            return
          }
          const { priv, epriv } = sea
          const { epub } = at.put
          // Success! we've found our private data!
          err = null
          return { proof, at, pin: newPin, key: { pub, priv, epriv, epub } }
        } catch (e) {
          err = 'Failed to decrypt private key!'
          return
        }
      }).filter((props) => !!props))

      if (!key) {
        throw { err: err || 'Public key does not exist!' }
      }

      // now we have AES decrypted the private key,
      // if we were successful, then that means we're logged in!
      try {
        await updateStorage(proof, key, newPin || pin)(key)

        const user = Object.assign(key, { at, proof })
        const pIN = newPin || pin

        const pinProp = pIN && { pin: Buffer.from(pIN, 'base64').toString('utf8') }

        return await finalizeLogin(alias, user, gunRoot, pinProp)
      } catch (e) { // TODO: right log message ?
        Gun.log('Failed to finalize login with new password!')
        const { err = '' } = e || {}
        throw { err: `Finalizing new password login failed! Reason: ${err}` }
      }
    }
    module.exports = authRecall
  })(USE, './recall');

  ;USE(function(module){
    const authPersist = USE('./persist')
    const authsettings = USE('./settings')
    //const { scope: seaIndexedDb } = USE('./indexed')
    // This internal func executes logout actions
    const authLeave = async (gunRoot, alias = gunRoot._.user._.alias) => {
      var user = gunRoot._.user._ || {};
      [ 'get', 'soul', 'ack', 'put', 'is', 'alias', 'pub', 'epub', 'sea' ].map((key) => delete user[key])
      if(user.gun){
        delete user.gun.is;
      }
      // Let's use default
      gunRoot.user();
      // Removes persisted authentication & CryptoKeys
      try {
        await authPersist({ alias })
      } catch (e) {}  //eslint-disable-line no-empty
      return { ok: 0 }
    }
    module.exports = authLeave
  })(USE, './leave');

  ;USE(function(module){
    var Gun = USE('./sea').Gun;
    Gun.chain.then = function(cb){
      var gun = this, p = (new Promise(function(res, rej){
        gun.once(res);
      }));
      return cb? p.then(cb) : p;
    }
  })(USE, './then');

  ;USE(function(module){
    var SEA = USE('./sea');
    var Gun = SEA.Gun;
    var then = USE('./then');

    function User(){ 
      this._ = {gun: this}
      Gun.call()
    }
    User.prototype = (function(){ function F(){}; F.prototype = Gun.chain; return new F() }()) // Object.create polyfill
    User.prototype.constructor = User;

    // let's extend the gun chain with a `user` function.
    // only one user can be logged in at a time, per gun instance.
    Gun.chain.user = function(pub){
      var gun = this, root = gun.back(-1);
      if(pub){ return root.get('pub/'+pub) }
      return root.back('user') || ((root._).user = gun.chain(new User));
    }
    module.exports = User;
  })(USE, './user');

  ;USE(function(module){
    // TODO: This needs to be split into all separate functions.
    // Not just everything thrown into 'create'.

    const SEA = USE('./sea')
    const User = USE('./user')
    const authRecall = USE('./recall')
    const authsettings = USE('./settings')
    const authenticate = USE('./authenticate')
    const finalizeLogin = USE('./login')
    const authLeave = USE('./leave')
    const { recall: _initial_authsettings } = USE('./settings')
    const Gun = SEA.Gun;

    var u;
    // Well first we have to actually create a user. That is what this function does.
    User.prototype.create = function(username, pass, cb){
      // TODO: Needs to be cleaned up!!!
      const gunRoot = this.back(-1)
      var gun = this, cat = (gun._);
      cb = cb || function(){};
      if(cat.ing){
        cb({err: Gun.log("User is already being created or authenticated!"), wait: true});
        return gun;
      }
      cat.ing = true;
      var resolve = function(){}, reject = resolve;
      // Because more than 1 user might have the same username, we treat the alias as a list of those users.
      if(cb){ resolve = reject = cb }
      gunRoot.get(`alias/${username}`).get(async (at, ev) => {
        ev.off()
        if (at.put) {
          // If we can enforce that a user name is already taken, it might be nice to try, but this is not guaranteed.
          const err = 'User already created!'
          Gun.log(err)
          cat.ing = false;
          gun.leave();
          return reject({ err })
        }
        const salt = Gun.text.random(64)
        // pseudo-randomly create a salt, then use CryptoJS's PBKDF2 function to extend the password with it.
        try {
          const proof = await SEA.work(pass, salt)
          // this will take some short amount of time to produce a proof, which slows brute force attacks.
          const pairs = await SEA.pair()
          // now we have generated a brand new ECDSA key pair for the user account.
          const { pub, priv, epriv } = pairs
          // the user's public key doesn't need to be signed. But everything else needs to be signed with it!
          const alias = await SEA.sign(username, pairs)
          if(u === alias){ throw SEA.err }
          const epub = await SEA.sign(pairs.epub, pairs)
          if(u === epub){ throw SEA.err }
          // to keep the private key safe, we AES encrypt it with the proof of work!
          const auth = await SEA.encrypt({ priv, epriv }, proof)
          .then((auth) => // TODO: So signedsalt isn't needed?
          // SEA.sign(salt, pairs).then((signedsalt) =>
            SEA.sign({ek: auth, s: salt}, pairs)
          // )
          ).catch((e) => { Gun.log('SEA.en or SEA.write calls failed!'); cat.ing = false; gun.leave(); reject(e) })
          const user = { alias, pub, epub, auth }
          const tmp = `pub/${pairs.pub}`
          // awesome, now we can actually save the user with their public key as their ID.
          try{

          gunRoot.get(tmp).put(user)
        }catch(e){console.log(e)}
          // next up, we want to associate the alias with the public key. So we add it to the alias list.
          gunRoot.get(`alias/${username}`).put(Gun.obj.put({}, tmp, Gun.val.rel.ify(tmp)))
          // callback that the user has been created. (Note: ok = 0 because we didn't wait for disk to ack)
          setTimeout(() => { cat.ing = false; resolve({ ok: 0, pub: pairs.pub}) }, 10) // TODO: BUG! If `.auth` happens synchronously after `create` finishes, auth won't work. This setTimeout is a temporary hack until we can properly fix it.
        } catch (e) {
          Gun.log('SEA.create failed!')
          cat.ing = false;
          gun.leave();
          reject(e)
        }
      })
      return gun;  // gun chain commands must return gun chains!
    }
    // now that we have created a user, we want to authenticate them!
    User.prototype.auth = function(alias, pass, cb, opt){
      // TODO: Needs to be cleaned up!!!!
      const opts = opt || (typeof cb !== 'function' && cb)
      let { pin, newpass } = opts || {}
      const gunRoot = this.back(-1)
      cb = typeof cb === 'function' ? cb : () => {}
      newpass = newpass || (opts||{}).change;
      var gun = this, cat = (gun._);
      if(cat.ing){
        cb({err: "User is already being created or authenticated!", wait: true});
        return gun;
      }
      cat.ing = true;

      if (!pass && pin) { (async function(){
        try {
          var r = await authRecall(gunRoot, { alias, pin })
          return cat.ing = false, cb(r), gun;
        } catch (e) {
          var err = { err: 'Auth attempt failed! Reason: No session data for alias & PIN' }
          return cat.ing = false, gun.leave(), cb(err), gun;
        }}())
        return gun;
      }

      const putErr = (msg) => (e) => {
        const { message, err = message || '' } = e
        Gun.log(msg)
        var error = { err: `${msg} Reason: ${err}` }
        return cat.ing = false, gun.leave(), cb(error), gun;
      }

      (async function(){ try {
        const keys = await authenticate(alias, pass, gunRoot)
        if (!keys) {
          return putErr('Auth attempt failed!')({ message: 'No keys' })
        }
        const { pub, priv, epub, epriv } = keys
        // we're logged in!
        if (newpass) {
          // password update so encrypt private key using new pwd + salt
          try {
            const salt = Gun.text.random(64);
            const encSigAuth = await SEA.work(newpass, salt)
            .then((key) =>
              SEA.encrypt({ priv, epriv }, key)
              .then((auth) => SEA.sign({ek: auth, s: salt}, keys))
            )
            const signedEpub = await SEA.sign(epub, keys)
            const signedAlias = await SEA.sign(alias, keys)
            const user = {
              pub,
              alias: signedAlias,
              auth: encSigAuth,
              epub: signedEpub
            }
            // awesome, now we can update the user using public key ID.
            gunRoot.get(`pub/${user.pub}`).put(user)
            // then we're done
            const login = finalizeLogin(alias, keys, gunRoot, { pin })
            login.catch(putErr('Failed to finalize login with new password!'))
            return cat.ing = false, cb(await login), gun
          } catch (e) {
            return putErr('Password set attempt failed!')(e)
          }
        } else {
          const login = finalizeLogin(alias, keys, gunRoot, { pin })
          login.catch(putErr('Finalizing login failed!'))
          return cat.ing = false, cb(await login), gun;
        }
      } catch (e) {
        return putErr('Auth attempt failed!')(e)
      } }());
      return gun;
    }
    User.prototype.pair = function(){
      var user = this;
      if(!user.is){ return false }
      return user._.sea;
    }
    User.prototype.leave = async function(){
      return await authLeave(this.back(-1))
    }
    // If authenticated user wants to delete his/her account, let's support it!
    User.prototype.delete = async function(alias, pass){
      const gunRoot = this.back(-1)
      try {
        const { pub } = await authenticate(alias, pass, gunRoot)
        await authLeave(gunRoot, alias)
        // Delete user data
        gunRoot.get(`pub/${pub}`).put(null)
        // Wipe user data from memory
        const { user = { _: {} } } = gunRoot._;
        // TODO: is this correct way to 'logout' user from Gun.User ?
        [ 'alias', 'sea', 'pub' ].map((key) => delete user._[key])
        user._.is = user.is = {}
        gunRoot.user()
        return { ok: 0 }  // TODO: proper return codes???
      } catch (e) {
        Gun.log('User.delete failed! Error:', e)
        throw e // TODO: proper error codes???
      }
    }
    // If authentication is to be remembered over reloads or browser closing,
    // set validity time in minutes.
    User.prototype.recall = async function(setvalidity, options){ 
      const gunRoot = this.back(-1)

      let validity
      let opts
      
      var o = setvalidity;
      if(o && o.sessionStorage){
        if(typeof window !== 'undefined'){
          var tmp = window.sessionStorage;
          if(tmp){
            gunRoot._.opt.remember = true;
            if(tmp.alias && tmp.tmp){
              gunRoot.user().auth(tmp.alias, tmp.tmp);
            }
          }
        }
        return this;
      }

      if (!Gun.val.is(setvalidity)) {
        opts = setvalidity
        validity = _initial_authsettings.validity
      } else {
        opts = options
        validity = setvalidity * 60 // minutes to seconds
      }

      try {
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
        return await authRecall(gunRoot)
      } catch (e) {
        const err = 'No session!'
        Gun.log(err)
        // NOTE! It's fine to resolve recall with reason why not successful
        // instead of rejecting...
        return { err: (e && e.err) || err }
      }
    }
    User.prototype.alive = async function(){
      const gunRoot = this.back(-1)
      try {
        // All is good. Should we do something more with actual recalled data?
        await authRecall(gunRoot)
        return gunRoot._.user._
      } catch (e) {
        const err = 'No session!'
        Gun.log(err)
        throw { err }
      }
    }
    User.prototype.trust = async function(user){
      // TODO: BUG!!! SEA `node` read listener needs to be async, which means core needs to be async too.
      //gun.get('alice').get('age').trust(bob);
      if (Gun.is(user)) {
        user.get('pub').get((ctx, ev) => {
          console.log(ctx, ev)
        })
      }
    }
    User.prototype.grant = function(to, cb){
      console.log("`.grant` API MAY BE DELETED OR CHANGED OR RENAMED, DO NOT USE!");
      var gun = this, user = gun.back(-1).user(), pair = user.pair(), path = '';
      gun.back(function(at){ if(at.pub){ return } path += (at.get||'') });
      (async function(){
      var enc, sec = await user.get('trust').get(pair.pub).get(path).then();
      sec = await SEA.decrypt(sec, pair);
      if(!sec){
        sec = SEA.random(16).toString();
        enc = await SEA.encrypt(sec, pair);
        user.get('trust').get(pair.pub).get(path).put(enc);
      }
      var pub = to.get('pub').then();
      var epub = to.get('epub').then();
      pub = await pub; epub = await epub;
      var dh = await SEA.secret(epub, pair);
      enc = await SEA.encrypt(sec, dh);
      user.get('trust').get(pub).get(path).put(enc, cb);
      }());
      return gun;
    }
    User.prototype.secret = function(data, cb){
      console.log("`.secret` API MAY BE DELETED OR CHANGED OR RENAMED, DO NOT USE!");
      var gun = this, user = gun.back(-1).user(), pair = user.pair(), path = '';
      gun.back(function(at){ if(at.pub){ return } path += (at.get||'') });
      (async function(){
      var enc, sec = await user.get('trust').get(pair.pub).get(path).then();
      sec = await SEA.decrypt(sec, pair);
      if(!sec){
        sec = SEA.random(16).toString();
        enc = await SEA.encrypt(sec, pair);
        user.get('trust').get(pair.pub).get(path).put(enc);
      }
      enc = await SEA.encrypt(data, sec);
      gun.put(enc, cb);
      }());
      return gun;
    }
    module.exports = User
  })(USE, './create');

  ;USE(function(module){
    const Gun = (typeof window !== 'undefined' ? window : global).Gun || USE('gun/gun')
    const SEA = USE('./sea')
    // After we have a GUN extension to make user registration/login easy, we then need to handle everything else.

    // We do this with a GUN adapter, we first listen to when a gun instance is created (and when its options change)
    Gun.on('opt', function(at){
      if(!at.sea){ // only add SEA once per instance, on the "at" context.
        at.sea = {own: {}};
        var uuid = at.opt.uuid || Gun.state.lex;
        at.opt.uuid = function(cb){ // TODO: consider async/await and drop callback pattern...
          var id = uuid(), pub = at.user;
          if(!pub || !(pub = at.user._.sea) || !(pub = pub.pub)){ return id }
          id = id + '~' + pub;
          if(cb && cb.call){ cb(null, id) }
          return id;
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
        // TODO: consider async/await use here...
        SEA.verify(val, false).then(function(data){ c--; // false just extracts the plain data.
          node[key] = val = data; // transform to plain value.
          if(d && !c && (c = -1)){ to.next(msg) }
        });
      });
      d = true;
      if(d && !c){ to.next(msg) }
      return;
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
        var check = {}, each = {}, u;
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
            //var id = Gun.text.random(3);
            SEA.sign(val, user.sea, function(data){ var rel;
              if(u === data){ return each.end({err: SEA.err || 'Pub signature fail.'}) }
              if(rel = Gun.val.rel.is(val)){
                (at.sea.own[rel] = at.sea.own[rel] || {})[pub] = true;
              }
              node[key] = data;
              check['user'+soul+key] = 0;
              each.end({ok: 1});
            });
            // TODO: Handle error!!!!
            return;
          }
          // TODO: consider async/await and drop callback pattern...
          SEA.verify(val, pub, function(data){ var rel, tmp;
            if(u === data){ // make sure the signature matches the account it claims to be on.
              return each.end({err: "Unverified data."}); // reject any updates that are signed with a mismatched account.
            }
            if((rel = Gun.val.rel.is(data)) && (tmp = rel.split('~')) && 2 === tmp.length){
              if(pub === tmp[1]){
                (at.sea.own[rel] = at.sea.own[rel] || {})[pub] = true;
              }
            }
            check['user'+soul+key] = 0;
            each.end({ok: 1});
          });
        };
        each.any = function(val, key, node, soul, user){ var tmp, pub;
          if(!user || !(user = user._) || !(user = user.sea)){
            if((tmp = soul.split('~')) && 2 == tmp.length){
              check['any'+soul+key] = 1;
              SEA.verify(val, (pub = tmp[1]), function(data){ var rel;
                if(!data){ return each.end({err: "Mismatched owner on '" + key + "'."}) }
                if((rel = Gun.val.rel.is(data)) && (tmp = rel.split('~')) && 2 === tmp.length){
                  if(pub === tmp[1]){
                    (at.sea.own[rel] = at.sea.own[rel] || {})[pub] = true;
                  }
                }
                check['any'+soul+key] = 0;
                each.end({ok: 1});
              });
              return;
            }
            check['any'+soul+key] = 1;
            at.on('secure', function(msg){ this.off();
              check['any'+soul+key] = 0;
              if(at.opt.secure){ msg = null }
              each.end(msg || {err: "Data cannot be modified."});
            }).on.on('secure', msg);
            //each.end({err: "Data cannot be modified."});
            return;
          }
          if(!(tmp = soul.split('~')) || 2 !== tmp.length){
            if(at.opt.secure){
              each.end({err: "Soul is missing public key at '" + key + "'."});
              return;
            }
            if(val && val.slice && 'SEA{' === (val).slice(0,4)){
              check['any'+soul+key] = 0;
              each.end({ok: 1});
              return;
            }
            check['any'+soul+key] = 1;
            SEA.sign(val, user, function(data){
              if(u === data){ return each.end({err: 'Any signature failed.'}) }
              node[key] = data;
              check['any'+soul+key] = 0;
              each.end({ok: 1});
            });
            return;
          }
          var pub = tmp[1];
          if(pub !== user.pub){
            each.any(val, key, node, soul);
            return;
          }
          /*var other = Gun.obj.map(at.sea.own[soul], function(v, p){
            if(user.pub !== p){ return p }
          });
          if(other){
            each.any(val, key, node, soul);
            return;
          }*/
          check['any'+soul+key] = 1;
          SEA.sign(val, user, function(data){
            if(u === data){ return each.end({err: 'My signature fail.'}) }
            node[key] = data;
            check['any'+soul+key] = 0;
            each.end({ok: 1});
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

  })(USE, './index');
}());