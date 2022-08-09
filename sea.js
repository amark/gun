;(function(){

  /* UNBUILD */
  function USE(arg, req){
    return req? require(arg) : arg.slice? USE[R(arg)] : function(mod, path){
      arg(mod = {exports: {}});
      USE[R(path)] = mod.exports;
    }
    function R(p){
      return p.split('/').slice(-1).toString().replace('.js','');
    }
  }
  if(typeof module !== "undefined"){ var MODULE = module }
  /* UNBUILD */

  ;USE(function(module){
    // Security, Encryption, and Authorization: SEA.js
    // MANDATORY READING: https://gun.eco/explainers/data/security.html
    // IT IS IMPLEMENTED IN A POLYFILL/SHIM APPROACH.
    // THIS IS AN EARLY ALPHA!

    if(typeof window !== "undefined"){ module.window = window }

    var tmp = module.window || module, u;
    var SEA = tmp.SEA || {};

    if(SEA.window = module.window){ SEA.window.SEA = SEA }

    try{ if(u+'' !== typeof MODULE){ MODULE.exports = SEA } }catch(e){}
    module.exports = SEA;
  })(USE, './root');

  ;USE(function(module){
    var SEA = USE('./root');
    try{ if(SEA.window){
      if(location.protocol.indexOf('s') < 0
      && location.host.indexOf('localhost') < 0
      && ! /^127\.\d+\.\d+\.\d+$/.test(location.hostname)
      && location.protocol.indexOf('file:') < 0){
        console.warn('HTTPS needed for WebCrypto in SEA, redirecting...');
        location.protocol = 'https:'; // WebCrypto does NOT work without HTTPS!
      }
    } }catch(e){}
  })(USE, './https');

  ;USE(function(module){
    var u;
    if(u+''== typeof btoa){
      if(u+'' == typeof Buffer){
        try{ global.Buffer = USE("buffer", 1).Buffer }catch(e){ console.log("Please `npm install buffer` or add it to your package.json !") }
      }
      global.btoa = function(data){ return Buffer.from(data, "binary").toString("base64") };
      global.atob = function(data){ return Buffer.from(data, "base64").toString("binary") };
    }
  })(USE, './base64');

  ;USE(function(module){
    USE('./base64');
    // This is Array extended to have .toString(['utf8'|'hex'|'base64'])
    function SeaArray() {}
    Object.assign(SeaArray, { from: Array.from })
    SeaArray.prototype = Object.create(Array.prototype)
    SeaArray.prototype.toString = function(enc, start, end) { enc = enc || 'utf8'; start = start || 0;
      const length = this.length
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
    USE('./base64');
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
        if (!Object.keys(arguments).length || arguments[0]==null) {
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
          } else if (enc === 'utf8' || 'binary' === enc) { // EDIT BY MARK: I think this is safe, tested it against a couple "binary" strings. This lets SafeBuffer match NodeJS Buffer behavior more where it safely btoas regular strings.
            const length = input.length
            const words = new Uint16Array(length)
            Array.from({ length: length }, (_, i) => words[i] = input.charCodeAt(i))
            buf = SeaArray.from(words)
          } else if (enc === 'base64') {
            const dec = atob(input)
            const length = dec.length
            const bytes = new Uint8Array(length)
            Array.from({ length: length }, (_, i) => bytes[i] = dec.charCodeAt(i))
            buf = SeaArray.from(bytes)
          } else if (enc === 'binary') { // deprecated by above comment
            buf = SeaArray.from(input) // some btoas were mishandled.
          } else {
            console.info('SafeBuffer.from unknown encoding: '+enc)
          }
          return buf
        }
        const byteLength = input.byteLength // what is going on here? FOR MARTTI
        const length = input.byteLength ? input.byteLength : input.length
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
        return SeaArray.from(new Uint8Array(Array.from({ length: length }, () => fill)))
      },
      // This is normal UNSAFE 'buffer.alloc' or 'new Buffer(length)' - don't use!
      allocUnsafe(length) {
        return SeaArray.from(new Uint8Array(Array.from({ length : length })))
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
    const SEA = USE('./root')
    const api = {Buffer: USE('./buffer')}
    var o = {}, u;

    // ideally we can move away from JSON entirely? unlikely due to compatibility issues... oh well.
    JSON.parseAsync = JSON.parseAsync || function(t,cb,r){ var u; try{ cb(u, JSON.parse(t,r)) }catch(e){ cb(e) } }
    JSON.stringifyAsync = JSON.stringifyAsync || function(v,cb,r,s){ var u; try{ cb(u, JSON.stringify(v,r,s)) }catch(e){ cb(e) } }

    api.parse = function(t,r){ return new Promise(function(res, rej){
      JSON.parseAsync(t,function(err, raw){ err? rej(err) : res(raw) },r);
    })}
    api.stringify = function(v,r,s){ return new Promise(function(res, rej){
      JSON.stringifyAsync(v,function(err, raw){ err? rej(err) : res(raw) },r,s);
    })}

    if(SEA.window){
      api.crypto = window.crypto || window.msCrypto
      api.subtle = (api.crypto||o).subtle || (api.crypto||o).webkitSubtle;
      api.TextEncoder = window.TextEncoder;
      api.TextDecoder = window.TextDecoder;
      api.random = (len) => api.Buffer.from(api.crypto.getRandomValues(new Uint8Array(api.Buffer.alloc(len))));
    }
    if(!api.TextDecoder)
    {
      const { TextEncoder, TextDecoder } = USE((u+'' == typeof MODULE?'.':'')+'./lib/text-encoding', 1);
      api.TextDecoder = TextDecoder;
      api.TextEncoder = TextEncoder;
    }
    if(!api.crypto)
    {
      try
      {
      var crypto = USE('crypto', 1);
      Object.assign(api, {
        crypto,
        random: (len) => api.Buffer.from(crypto.randomBytes(len))
      });      
      const { Crypto: WebCrypto } = USE('@peculiar/webcrypto', 1);
      api.ossl = api.subtle = new WebCrypto({directory: 'ossl'}).subtle // ECDH
    }
    catch(e){
      console.log("Please `npm install @peculiar/webcrypto` or add it to your package.json !");
    }}

    module.exports = api
  })(USE, './shim');

  ;USE(function(module){
    var SEA = USE('./root');
    var shim = USE('./shim');
    var s = {};
    s.pbkdf2 = {hash: {name : 'SHA-256'}, iter: 100000, ks: 64};
    s.ecdsa = {
      pair: {name: 'ECDSA', namedCurve: 'P-256'},
      sign: {name: 'ECDSA', hash: {name: 'SHA-256'}}
    };
    s.ecdh = {name: 'ECDH', namedCurve: 'P-256'};

    // This creates Web Cryptography API compliant JWK for sign/verify purposes
    s.jwk = function(pub, d){  // d === priv
      pub = pub.split('.');
      var x = pub[0], y = pub[1];
      var jwk = {kty: "EC", crv: "P-256", x: x, y: y, ext: true};
      jwk.key_ops = d ? ['sign'] : ['verify'];
      if(d){ jwk.d = d }
      return jwk;
    };
    
    s.keyToJwk = function(keyBytes) {
      const keyB64 = keyBytes.toString('base64');
      const k = keyB64.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
      return { kty: 'oct', k: k, ext: false, alg: 'A256GCM' };
    }

    s.recall = {
      validity: 12 * 60 * 60, // internally in seconds : 12 hours
      hook: function(props){ return props } // { iat, exp, alias, remember } // or return new Promise((resolve, reject) => resolve(props)
    };

    s.check = function(t){ return (typeof t == 'string') && ('SEA{' === t.slice(0,4)) }
    s.parse = async function p(t){ try {
      var yes = (typeof t == 'string');
      if(yes && 'SEA{' === t.slice(0,4)){ t = t.slice(3) }
      return yes ? await shim.parse(t) : t;
      } catch (e) {}
      return t;
    }

    SEA.opt = s;
    module.exports = s
  })(USE, './settings');

  ;USE(function(module){
    var shim = USE('./shim');
    module.exports = async function(d, o){
      var t = (typeof d == 'string')? d : await shim.stringify(d);
      var hash = await shim.subtle.digest({name: o||'SHA-256'}, new shim.TextEncoder().encode(t));
      return shim.Buffer.from(hash);
    }
  })(USE, './sha256');

  ;USE(function(module){
    // This internal func returns SHA-1 hashed data for KeyID generation
    const __shim = USE('./shim')
    const subtle = __shim.subtle
    const ossl = __shim.ossl ? __shim.ossl : subtle
    const sha1hash = (b) => ossl.digest({name: 'SHA-1'}, new ArrayBuffer(b))
    module.exports = sha1hash
  })(USE, './sha1');

  ;USE(function(module){
    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var sha = USE('./sha256');
    var u;

    SEA.work = SEA.work || (async (data, pair, cb, opt) => { try { // used to be named `proof`
      var salt = (pair||{}).epub || pair; // epub not recommended, salt should be random!
      opt = opt || {};
      if(salt instanceof Function){
        cb = salt;
        salt = u;
      }
      data = (typeof data == 'string')? data : await shim.stringify(data);
      if('sha' === (opt.name||'').toLowerCase().slice(0,3)){
        var rsha = shim.Buffer.from(await sha(data, opt.name), 'binary').toString(opt.encode || 'base64')
        if(cb){ try{ cb(rsha) }catch(e){console.log(e)} }
        return rsha;
      }
      salt = salt || shim.random(9);
      var key = await (shim.ossl || shim.subtle).importKey('raw', new shim.TextEncoder().encode(data), {name: opt.name || 'PBKDF2'}, false, ['deriveBits']);
      var work = await (shim.ossl || shim.subtle).deriveBits({
        name: opt.name || 'PBKDF2',
        iterations: opt.iterations || S.pbkdf2.iter,
        salt: new shim.TextEncoder().encode(opt.salt || salt),
        hash: opt.hash || S.pbkdf2.hash,
      }, key, opt.length || (S.pbkdf2.ks * 8))
      data = shim.random(data.length)  // Erase data in case of passphrase
      var r = shim.Buffer.from(work, 'binary').toString(opt.encode || 'base64')
      if(cb){ try{ cb(r) }catch(e){console.log(e)} }
      return r;
    } catch(e) { 
      console.log(e);
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    module.exports = SEA.work;
  })(USE, './work');

  ;USE(function(module){
    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');

    SEA.name = SEA.name || (async (cb, opt) => { try {
      if(cb){ try{ cb() }catch(e){console.log(e)} }
      return;
    } catch(e) {
      console.log(e);
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    //SEA.pair = async (data, proof, cb) => { try {
    SEA.pair = SEA.pair || (async (cb, opt) => { try {

      var ecdhSubtle = shim.ossl || shim.subtle;
      // First: ECDSA keys for signing/verifying...
      var sa = await shim.subtle.generateKey({name: 'ECDSA', namedCurve: 'P-256'}, true, [ 'sign', 'verify' ])
      .then(async (keys) => {
        // privateKey scope doesn't leak out from here!
        //const { d: priv } = await shim.subtle.exportKey('jwk', keys.privateKey)
        var key = {};
        key.priv = (await shim.subtle.exportKey('jwk', keys.privateKey)).d;
        var pub = await shim.subtle.exportKey('jwk', keys.publicKey);
        //const pub = Buff.from([ x, y ].join(':')).toString('base64') // old
        key.pub = pub.x+'.'+pub.y; // new
        // x and y are already base64
        // pub is UTF8 but filename/URL safe (https://www.ietf.org/rfc/rfc3986.txt)
        // but split on a non-base64 letter.
        return key;
      })
      
      // To include PGPv4 kind of keyId:
      // const pubId = await SEA.keyid(keys.pub)
      // Next: ECDH keys for encryption/decryption...

      try{
      var dh = await ecdhSubtle.generateKey({name: 'ECDH', namedCurve: 'P-256'}, true, ['deriveKey'])
      .then(async (keys) => {
        // privateKey scope doesn't leak out from here!
        var key = {};
        key.epriv = (await ecdhSubtle.exportKey('jwk', keys.privateKey)).d;
        var pub = await ecdhSubtle.exportKey('jwk', keys.publicKey);
        //const epub = Buff.from([ ex, ey ].join(':')).toString('base64') // old
        key.epub = pub.x+'.'+pub.y; // new
        // ex and ey are already base64
        // epub is UTF8 but filename/URL safe (https://www.ietf.org/rfc/rfc3986.txt)
        // but split on a non-base64 letter.
        return key;
      })
      }catch(e){
        if(SEA.window){ throw e }
        if(e == 'Error: ECDH is not a supported algorithm'){ console.log('Ignoring ECDH...') }
        else { throw e }
      } dh = dh || {};

      var r = { pub: sa.pub, priv: sa.priv, /* pubId, */ epub: dh.epub, epriv: dh.epriv }
      if(cb){ try{ cb(r) }catch(e){console.log(e)} }
      return r;
    } catch(e) {
      console.log(e);
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    module.exports = SEA.pair;
  })(USE, './pair');

  ;USE(function(module){
    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var sha = USE('./sha256');
    var u;

    SEA.sign = SEA.sign || (async (data, pair, cb, opt) => { try {
      opt = opt || {};
      if(!(pair||opt).priv){
        if(!SEA.I){ throw 'No signing key.' }
        pair = await SEA.I(null, {what: data, how: 'sign', why: opt.why});
      }
      if(u === data){ throw '`undefined` not allowed.' }
      var json = await S.parse(data);
      var check = opt.check = opt.check || json;
      if(SEA.verify && (SEA.opt.check(check) || (check && check.s && check.m))
      && u !== await SEA.verify(check, pair)){ // don't sign if we already signed it.
        var r = await S.parse(check);
        if(!opt.raw){ r = 'SEA' + await shim.stringify(r) }
        if(cb){ try{ cb(r) }catch(e){console.log(e)} }
        return r;
      }
      var pub = pair.pub;
      var priv = pair.priv;
      var jwk = S.jwk(pub, priv);
      var hash = await sha(json);
      var sig = await (shim.ossl || shim.subtle).importKey('jwk', jwk, {name: 'ECDSA', namedCurve: 'P-256'}, false, ['sign'])
      .then((key) => (shim.ossl || shim.subtle).sign({name: 'ECDSA', hash: {name: 'SHA-256'}}, key, new Uint8Array(hash))) // privateKey scope doesn't leak out from here!
      var r = {m: json, s: shim.Buffer.from(sig, 'binary').toString(opt.encode || 'base64')}
      if(!opt.raw){ r = 'SEA' + await shim.stringify(r) }

      if(cb){ try{ cb(r) }catch(e){console.log(e)} }
      return r;
    } catch(e) {
      console.log(e);
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    module.exports = SEA.sign;
  })(USE, './sign');

  ;USE(function(module){
    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var sha = USE('./sha256');
    var u;

    SEA.verify = SEA.verify || (async (data, pair, cb, opt) => { try {
      var json = await S.parse(data);
      if(false === pair){ // don't verify!
        var raw = await S.parse(json.m);
        if(cb){ try{ cb(raw) }catch(e){console.log(e)} }
        return raw;
      }
      opt = opt || {};
      // SEA.I // verify is free! Requires no user permission.
      var pub = pair.pub || pair;
      var key = SEA.opt.slow_leak? await SEA.opt.slow_leak(pub) : await (shim.ossl || shim.subtle).importKey('jwk', S.jwk(pub), {name: 'ECDSA', namedCurve: 'P-256'}, false, ['verify']);
      var hash = await sha(json.m);
      var buf, sig, check, tmp; try{
        buf = shim.Buffer.from(json.s, opt.encode || 'base64'); // NEW DEFAULT!
        sig = new Uint8Array(buf);
        check = await (shim.ossl || shim.subtle).verify({name: 'ECDSA', hash: {name: 'SHA-256'}}, key, sig, new Uint8Array(hash));
        if(!check){ throw "Signature did not match." }
      }catch(e){
        if(SEA.opt.fallback){
          return await SEA.opt.fall_verify(data, pair, cb, opt);
        }
      }
      var r = check? await S.parse(json.m) : u;

      if(cb){ try{ cb(r) }catch(e){console.log(e)} }
      return r;
    } catch(e) {
      console.log(e); // mismatched owner FOR MARTTI
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    module.exports = SEA.verify;
    // legacy & ossl memory leak mitigation:

    var knownKeys = {};
    var keyForPair = SEA.opt.slow_leak = pair => {
      if (knownKeys[pair]) return knownKeys[pair];
      var jwk = S.jwk(pair);
      knownKeys[pair] = (shim.ossl || shim.subtle).importKey("jwk", jwk, {name: 'ECDSA', namedCurve: 'P-256'}, false, ["verify"]);
      return knownKeys[pair];
    };

    var O = SEA.opt;
    SEA.opt.fall_verify = async function(data, pair, cb, opt, f){
      if(f === SEA.opt.fallback){ throw "Signature did not match" } f = f || 1;
      var tmp = data||'';
      data = SEA.opt.unpack(data) || data;
      var json = await S.parse(data), pub = pair.pub || pair, key = await SEA.opt.slow_leak(pub);
      var hash = (f <= SEA.opt.fallback)? shim.Buffer.from(await shim.subtle.digest({name: 'SHA-256'}, new shim.TextEncoder().encode(await S.parse(json.m)))) : await sha(json.m); // this line is old bad buggy code but necessary for old compatibility.
      var buf; var sig; var check; try{
        buf = shim.Buffer.from(json.s, opt.encode || 'base64') // NEW DEFAULT!
        sig = new Uint8Array(buf)
        check = await (shim.ossl || shim.subtle).verify({name: 'ECDSA', hash: {name: 'SHA-256'}}, key, sig, new Uint8Array(hash))
        if(!check){ throw "Signature did not match." }
      }catch(e){ try{
        buf = shim.Buffer.from(json.s, 'utf8') // AUTO BACKWARD OLD UTF8 DATA!
        sig = new Uint8Array(buf)
        check = await (shim.ossl || shim.subtle).verify({name: 'ECDSA', hash: {name: 'SHA-256'}}, key, sig, new Uint8Array(hash))
        }catch(e){
        if(!check){ throw "Signature did not match." }
        }
      }
      var r = check? await S.parse(json.m) : u;
      O.fall_soul = tmp['#']; O.fall_key = tmp['.']; O.fall_val = data; O.fall_state = tmp['>'];
      if(cb){ try{ cb(r) }catch(e){console.log(e)} }
      return r;
    }
    SEA.opt.fallback = 2;

  })(USE, './verify');

  ;USE(function(module){
    var shim = USE('./shim');
    var S = USE('./settings');
    var sha256hash = USE('./sha256');

    const importGen = async (key, salt, opt) => {
      //const combo = shim.Buffer.concat([shim.Buffer.from(key, 'utf8'), salt || shim.random(8)]).toString('utf8') // old
      opt = opt || {};
      const combo = key + (salt || shim.random(8)).toString('utf8'); // new
      const hash = shim.Buffer.from(await sha256hash(combo), 'binary')
      
      const jwkKey = S.keyToJwk(hash)      
      return await shim.subtle.importKey('jwk', jwkKey, {name:'AES-GCM'}, false, ['encrypt', 'decrypt'])
    }
    module.exports = importGen;
  })(USE, './aeskey');

  ;USE(function(module){
    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var aeskey = USE('./aeskey');
    var u;

    SEA.encrypt = SEA.encrypt || (async (data, pair, cb, opt) => { try {
      opt = opt || {};
      var key = (pair||opt).epriv || pair;
      if(u === data){ throw '`undefined` not allowed.' }
      if(!key){
        if(!SEA.I){ throw 'No encryption key.' }
        pair = await SEA.I(null, {what: data, how: 'encrypt', why: opt.why});
        key = pair.epriv || pair;
      }
      var msg = (typeof data == 'string')? data : await shim.stringify(data);
      var rand = {s: shim.random(9), iv: shim.random(15)}; // consider making this 9 and 15 or 18 or 12 to reduce == padding.
      var ct = await aeskey(key, rand.s, opt).then((aes) => (/*shim.ossl ||*/ shim.subtle).encrypt({ // Keeping the AES key scope as private as possible...
        name: opt.name || 'AES-GCM', iv: new Uint8Array(rand.iv)
      }, aes, new shim.TextEncoder().encode(msg)));
      var r = {
        ct: shim.Buffer.from(ct, 'binary').toString(opt.encode || 'base64'),
        iv: rand.iv.toString(opt.encode || 'base64'),
        s: rand.s.toString(opt.encode || 'base64')
      }
      if(!opt.raw){ r = 'SEA' + await shim.stringify(r) }

      if(cb){ try{ cb(r) }catch(e){console.log(e)} }
      return r;
    } catch(e) { 
      console.log(e);
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    module.exports = SEA.encrypt;
  })(USE, './encrypt');

  ;USE(function(module){
    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var aeskey = USE('./aeskey');

    SEA.decrypt = SEA.decrypt || (async (data, pair, cb, opt) => { try {
      opt = opt || {};
      var key = (pair||opt).epriv || pair;
      if(!key){
        if(!SEA.I){ throw 'No decryption key.' }
        pair = await SEA.I(null, {what: data, how: 'decrypt', why: opt.why});
        key = pair.epriv || pair;
      }
      var json = await S.parse(data);
      var buf, bufiv, bufct; try{
        buf = shim.Buffer.from(json.s, opt.encode || 'base64');
        bufiv = shim.Buffer.from(json.iv, opt.encode || 'base64');
        bufct = shim.Buffer.from(json.ct, opt.encode || 'base64');
        var ct = await aeskey(key, buf, opt).then((aes) => (/*shim.ossl ||*/ shim.subtle).decrypt({  // Keeping aesKey scope as private as possible...
          name: opt.name || 'AES-GCM', iv: new Uint8Array(bufiv), tagLength: 128
        }, aes, new Uint8Array(bufct)));
      }catch(e){
        if('utf8' === opt.encode){ throw "Could not decrypt" }
        if(SEA.opt.fallback){
          opt.encode = 'utf8';
          return await SEA.decrypt(data, pair, cb, opt);
        }
      }
      var r = await S.parse(new shim.TextDecoder('utf8').decode(ct));
      if(cb){ try{ cb(r) }catch(e){console.log(e)} }
      return r;
    } catch(e) { 
      console.log(e);
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    module.exports = SEA.decrypt;
  })(USE, './decrypt');

  ;USE(function(module){
    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    // Derive shared secret from other's pub and my epub/epriv 
    SEA.secret = SEA.secret || (async (key, pair, cb, opt) => { try {
      opt = opt || {};
      if(!pair || !pair.epriv || !pair.epub){
        if(!SEA.I){ throw 'No secret mix.' }
        pair = await SEA.I(null, {what: key, how: 'secret', why: opt.why});
      }
      var pub = key.epub || key;
      var epub = pair.epub;
      var epriv = pair.epriv;
      var ecdhSubtle = shim.ossl || shim.subtle;
      var pubKeyData = keysToEcdhJwk(pub);
      var props = Object.assign({ public: await ecdhSubtle.importKey(...pubKeyData, true, []) },{name: 'ECDH', namedCurve: 'P-256'}); // Thanks to @sirpy !
      var privKeyData = keysToEcdhJwk(epub, epriv);
      var derived = await ecdhSubtle.importKey(...privKeyData, false, ['deriveBits']).then(async (privKey) => {
        // privateKey scope doesn't leak out from here!
        var derivedBits = await ecdhSubtle.deriveBits(props, privKey, 256);
        var rawBits = new Uint8Array(derivedBits);
        var derivedKey = await ecdhSubtle.importKey('raw', rawBits,{ name: 'AES-GCM', length: 256 }, true, [ 'encrypt', 'decrypt' ]);
        return ecdhSubtle.exportKey('jwk', derivedKey).then(({ k }) => k);
      })
      var r = derived;
      if(cb){ try{ cb(r) }catch(e){console.log(e)} }
      return r;
    } catch(e) {
      console.log(e);
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    // can this be replaced with settings.jwk?
    var keysToEcdhJwk = (pub, d) => { // d === priv
      //var [ x, y ] = shim.Buffer.from(pub, 'base64').toString('utf8').split(':') // old
      var [ x, y ] = pub.split('.') // new
      var jwk = d ? { d: d } : {}
      return [  // Use with spread returned value...
        'jwk',
        Object.assign(
          jwk,
          { x: x, y: y, kty: 'EC', crv: 'P-256', ext: true }
        ), // ??? refactor
        {name: 'ECDH', namedCurve: 'P-256'}
      ]
    }

    module.exports = SEA.secret;
  })(USE, './secret');

  ;USE(function(module){
    var SEA = USE('./root');
    // This is to certify that a group of "certificants" can "put" anything at a group of matched "paths" to the certificate authority's graph
    SEA.certify = SEA.certify || (async (certificants, policy = {}, authority, cb, opt = {}) => { try {
      /*
      The Certify Protocol was made out of love by a Vietnamese code enthusiast. Vietnamese people around the world deserve respect!
      IMPORTANT: A Certificate is like a Signature. No one knows who (authority) created/signed a cert until you put it into their graph.
      "certificants": '*' or a String (Bob.pub) || an Object that contains "pub" as a key || an array of [object || string]. These people will have the rights.
      "policy": A string ('inbox'), or a RAD/LEX object {'*': 'inbox'}, or an Array of RAD/LEX objects or strings. RAD/LEX object can contain key "?" with indexOf("*") > -1 to force key equals certificant pub. This rule is used to check against soul+'/'+key using Gun.text.match or String.match.
      "authority": Key pair or priv of the certificate authority.
      "cb": A callback function after all things are done.
      "opt": If opt.expiry (a timestamp) is set, SEA won't sync data after opt.expiry. If opt.block is set, SEA will look for block before syncing.
      */
      console.log('SEA.certify() is an early experimental community supported method that may change API behavior without warning in any future version.')

      certificants = (() => {
        var data = []
        if (certificants) {
          if ((typeof certificants === 'string' || Array.isArray(certificants)) && certificants.indexOf('*') > -1) return '*'
          if (typeof certificants === 'string') return certificants
          if (Array.isArray(certificants)) {
            if (certificants.length === 1 && certificants[0]) return typeof certificants[0] === 'object' && certificants[0].pub ? certificants[0].pub : typeof certificants[0] === 'string' ? certificants[0] : null
            certificants.map(certificant => {
              if (typeof certificant ==='string') data.push(certificant)
              else if (typeof certificant === 'object' && certificant.pub) data.push(certificant.pub)
            })
          }

          if (typeof certificants === 'object' && certificants.pub) return certificants.pub
          return data.length > 0 ? data : null
        }
        return
      })()

      if (!certificants) return console.log("No certificant found.")

      const expiry = opt.expiry && (typeof opt.expiry === 'number' || typeof opt.expiry === 'string') ? parseFloat(opt.expiry) : null
      const readPolicy = (policy || {}).read ? policy.read : null
      const writePolicy = (policy || {}).write ? policy.write : typeof policy === 'string' || Array.isArray(policy) || policy["+"] || policy["#"] || policy["."] || policy["="] || policy["*"] || policy[">"] || policy["<"] ? policy : null
      // The "blacklist" feature is now renamed to "block". Why ? BECAUSE BLACK LIVES MATTER!
      // We can now use 3 keys: block, blacklist, ban
      const block = (opt || {}).block || (opt || {}).blacklist || (opt || {}).ban || {}
      const readBlock = block.read && (typeof block.read === 'string' || (block.read || {})['#']) ? block.read : null
      const writeBlock = typeof block === 'string' ? block : block.write && (typeof block.write === 'string' || block.write['#']) ? block.write : null

      if (!readPolicy && !writePolicy) return console.log("No policy found.")

      // reserved keys: c, e, r, w, rb, wb
      const data = JSON.stringify({
        c: certificants,
        ...(expiry ? {e: expiry} : {}), // inject expiry if possible
        ...(readPolicy ? {r: readPolicy }  : {}), // "r" stands for read, which means read permission.
        ...(writePolicy ? {w: writePolicy} : {}), // "w" stands for write, which means write permission.
        ...(readBlock ? {rb: readBlock} : {}), // inject READ block if possible
        ...(writeBlock ? {wb: writeBlock} : {}), // inject WRITE block if possible
      })

      const certificate = await SEA.sign(data, authority, null, {raw:1})

      var r = certificate
      if(!opt.raw){ r = 'SEA'+JSON.stringify(r) }
      if(cb){ try{ cb(r) }catch(e){console.log(e)} }
      return r;
    } catch(e) {
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    module.exports = SEA.certify;
  })(USE, './certify');

  ;USE(function(module){
    var shim = USE('./shim');
    // Practical examples about usage found in tests.
    var SEA = USE('./root');
    SEA.work = USE('./work');
    SEA.sign = USE('./sign');
    SEA.verify = USE('./verify');
    SEA.encrypt = USE('./encrypt');
    SEA.decrypt = USE('./decrypt');
    SEA.certify = USE('./certify');
    //SEA.opt.aeskey = USE('./aeskey'); // not official! // this causes problems in latest WebCrypto.

    SEA.random = SEA.random || shim.random;

    // This is Buffer used in SEA and usable from Gun/SEA application also.
    // For documentation see https://nodejs.org/api/buffer.html
    SEA.Buffer = SEA.Buffer || USE('./buffer');

    // These SEA functions support now ony Promises or
    // async/await (compatible) code, use those like Promises.
    //
    // Creates a wrapper library around Web Crypto API
    // for various AES, ECDSA, PBKDF2 functions we called above.
    // Calculate public key KeyID aka PGPv4 (result: 8 bytes as hex string)
    SEA.keyid = SEA.keyid || (async (pub) => {
      try {
        // base64('base64(x):base64(y)') => shim.Buffer(xy)
        const pb = shim.Buffer.concat(
          pub.replace(/-/g, '+').replace(/_/g, '/').split('.')
          .map((t) => shim.Buffer.from(t, 'base64'))
        )
        // id is PGPv4 compliant raw key
        const id = shim.Buffer.concat([
          shim.Buffer.from([0x99, pb.length / 0x100, pb.length % 0x100]), pb
        ])
        const sha1 = await sha1hash(id)
        const hash = shim.Buffer.from(sha1, 'binary')
        return hash.toString('hex', hash.length - 8)  // 16-bit ID as hex
      } catch (e) {
        console.log(e)
        throw e
      }
    });
    // all done!
    // Obviously it is missing MANY necessary features. This is only an alpha release.
    // Please experiment with it, audit what I've done so far, and complain about what needs to be added.
    // SEA should be a full suite that is easy and seamless to use.
    // Again, scroll naer the top, where I provide an EXAMPLE of how to create a user and sign in.
    // Once logged in, the rest of the code you just read handled automatically signing/validating data.
    // But all other behavior needs to be equally easy, like opinionated ways of
    // Adding friends (trusted public keys), sending private messages, etc.
    // Cheers! Tell me what you think.
    ((SEA.window||{}).GUN||{}).SEA = SEA;

    module.exports = SEA
    // -------------- END SEA MODULES --------------------
    // -- BEGIN SEA+GUN MODULES: BUNDLED BY DEFAULT UNTIL OTHERS USE SEA ON OWN -------
  })(USE, './sea');

  ;USE(function(module){
    var SEA = USE('./sea'), Gun, u;
    if(SEA.window){
      Gun = SEA.window.GUN || {chain:{}};
    } else {
      Gun = USE((u+'' == typeof MODULE?'.':'')+'./gun', 1);
    }
    SEA.GUN = Gun;

    function User(root){ 
      this._ = {$: this};
    }
    User.prototype = (function(){ function F(){}; F.prototype = Gun.chain; return new F() }()) // Object.create polyfill
    User.prototype.constructor = User;

    // let's extend the gun chain with a `user` function.
    // only one user can be logged in at a time, per gun instance.
    Gun.chain.user = function(pub){
      var gun = this, root = gun.back(-1), user;
      if(pub){
        pub = SEA.opt.pub((pub._||'')['#']) || pub;
        return root.get('~'+pub);
      }
      if(user = root.back('user')){ return user }
      var root = (root._), at = root, uuid = at.opt.uuid || lex;
      (at = (user = at.user = gun.chain(new User))._).opt = {};
      at.opt.uuid = function(cb){
        var id = uuid(), pub = root.user;
        if(!pub || !(pub = pub.is) || !(pub = pub.pub)){ return id }
        id = '~' + pub + '/' + id;
        if(cb && cb.call){ cb(null, id) }
        return id;
      }
      return user;
    }
    function lex(){ return Gun.state().toString(36).replace('.','') }
    Gun.User = User;
    User.GUN = Gun;
    User.SEA = Gun.SEA = SEA;
    module.exports = User;
  })(USE, './user');

  ;USE(function(module){
    var u, Gun = (''+u != typeof window)? (window.Gun||{chain:{}}) : USE((''+u === typeof MODULE?'.':'')+'./gun', 1);
    Gun.chain.then = function(cb, opt){
      var gun = this, p = (new Promise(function(res, rej){
        gun.once(res, opt);
      }));
      return cb? p.then(cb) : p;
    }
  })(USE, './then');

  ;USE(function(module){
    var User = USE('./user'), SEA = User.SEA, Gun = User.GUN, noop = function(){};

    // Well first we have to actually create a user. That is what this function does.
    User.prototype.create = function(...args){
      var pair = typeof args[0] === 'object' && (args[0].pub || args[0].epub) ? args[0] : typeof args[1] === 'object' && (args[1].pub || args[1].epub) ? args[1] : null;
      var alias = pair && (pair.pub || pair.epub) ? pair.pub : typeof args[0] === 'string' ? args[0] : null;
      var pass = pair && (pair.pub || pair.epub) ? pair : alias && typeof args[1] === 'string' ? args[1] : null;
      var cb = args.filter(arg => typeof arg === 'function')[0] || null; // cb now can stand anywhere, after alias/pass or pair
      var opt = args && args.length > 1 && typeof args[args.length-1] === 'object' ? args[args.length-1] : {}; // opt is always the last parameter which typeof === 'object' and stands after cb
      
      var gun = this, cat = (gun._), root = gun.back(-1);
      cb = cb || noop;
      opt = opt || {};
      if(false !== opt.check){
        var err;
        if(!alias){ err = "No user." }
        if((pass||'').length < 8){ err = "Password too short!" }
        if(err){
          cb({err: Gun.log(err)});
          return gun;
        }
      }
      if(cat.ing){
        (cb || noop)({err: Gun.log("User is already being created or authenticated!"), wait: true});
        return gun;
      }
      cat.ing = true;
      var act = {}, u;
      act.a = function(pubs){
        act.pubs = pubs;
        if(pubs && !opt.already){
          // If we can enforce that a user name is already taken, it might be nice to try, but this is not guaranteed.
          var ack = {err: Gun.log('User already created!')};
          cat.ing = false;
          (cb || noop)(ack);
          gun.leave();
          return;
        }
        act.salt = String.random(64); // pseudo-randomly create a salt, then use PBKDF2 function to extend the password with it.
        SEA.work(pass, act.salt, act.b); // this will take some short amount of time to produce a proof, which slows brute force attacks.
      }
      act.b = function(proof){
        act.proof = proof;
        pair ? act.c(pair) : SEA.pair(act.c) // generate a brand new key pair or use the existing.
      }
      act.c = function(pair){
        var tmp
        act.pair = pair || {};
        if(tmp = cat.root.user){
          tmp._.sea = pair;
          tmp.is = {pub: pair.pub, epub: pair.epub, alias: alias};
        }
        // the user's public key doesn't need to be signed. But everything else needs to be signed with it! // we have now automated it! clean up these extra steps now!
        act.data = {pub: pair.pub};
        act.d();
      }
      act.d = function(){
        act.data.alias = alias;
        act.e();
      }
      act.e = function(){
        act.data.epub = act.pair.epub; 
        SEA.encrypt({priv: act.pair.priv, epriv: act.pair.epriv}, act.proof, act.f, {raw:1}); // to keep the private key safe, we AES encrypt it with the proof of work!
      }
      act.f = function(auth){
        act.data.auth = JSON.stringify({ek: auth, s: act.salt}); 
        act.g(act.data.auth);
      }
      act.g = function(auth){ var tmp;
        act.data.auth = act.data.auth || auth;
        root.get(tmp = '~'+act.pair.pub).put(act.data).on(act.h); // awesome, now we can actually save the user with their public key as their ID.
        var link = {}; link[tmp] = {'#': tmp}; root.get('~@'+alias).put(link).get(tmp).on(act.i); // next up, we want to associate the alias with the public key. So we add it to the alias list.
      }
      act.h = function(data, key, msg, eve){
        eve.off(); act.h.ok = 1; act.i();
      }
      act.i = function(data, key, msg, eve){
        if(eve){ act.i.ok = 1; eve.off() }
        if(!act.h.ok || !act.i.ok){ return }
        cat.ing = false;
        cb({ok: 0, pub: act.pair.pub}); // callback that the user has been created. (Note: ok = 0 because we didn't wait for disk to ack)
        if(noop === cb){ pair ? gun.auth(pair) : gun.auth(alias, pass) } // if no callback is passed, auto-login after signing up.
      }
      root.get('~@'+alias).once(act.a);
      return gun;
    }
    User.prototype.leave = function(opt, cb){
      var gun = this, user = (gun.back(-1)._).user;
      if(user){
        delete user.is;
        delete user._.is;
        delete user._.sea;
      }
      if(SEA.window){
        try{var sS = {};
        sS = window.sessionStorage;
        delete sS.recall;
        delete sS.pair;
        }catch(e){};
      }
      return gun;
    }
  })(USE, './create');

  ;USE(function(module){
    var User = USE('./user'), SEA = User.SEA, Gun = User.GUN, noop = function(){};
    // now that we have created a user, we want to authenticate them!
    User.prototype.auth = function(...args){ // TODO: this PR with arguments need to be cleaned up / refactored.
      var pair = typeof args[0] === 'object' && (args[0].pub || args[0].epub) ? args[0] : typeof args[1] === 'object' && (args[1].pub || args[1].epub) ? args[1] : null;
      var alias = !pair && typeof args[0] === 'string' ? args[0] : null;
      var pass = (alias || (pair && !(pair.priv && pair.epriv))) && typeof args[1] === 'string' ? args[1] : null;
      var cb = args.filter(arg => typeof arg === 'function')[0] || null; // cb now can stand anywhere, after alias/pass or pair
      var opt = args && args.length > 1 && typeof args[args.length-1] === 'object' ? args[args.length-1] : {}; // opt is always the last parameter which typeof === 'object' and stands after cb
      
      var gun = this, cat = (gun._), root = gun.back(-1);
      
      if(cat.ing){
        (cb || noop)({err: Gun.log("User is already being created or authenticated!"), wait: true});
        return gun;
      }
      cat.ing = true;
      
      var act = {}, u, tries = 9;
      act.a = function(data){
        if(!data){ return act.b() }
        if(!data.pub){
          var tmp = []; Object.keys(data).forEach(function(k){ if('_'==k){ return } tmp.push(data[k]) })
          return act.b(tmp);
        }
        if(act.name){ return act.f(data) }
        act.c((act.data = data).auth);
      }
      act.b = function(list){
        var get = (act.list = (act.list||[]).concat(list||[])).shift();
        if(u === get){
          if(act.name){ return act.err('Your user account is not published for dApps to access, please consider syncing it online, or allowing local access by adding your device as a peer.') }
          if(alias && tries--){
            root.get('~@'+alias).once(act.a);
            return;
          }
          return act.err('Wrong user or password.') 
        }
        root.get(get).once(act.a);
      }
      act.c = function(auth){
        if(u === auth){ return act.b() }
        if('string' == typeof auth){ return act.c(obj_ify(auth)) } // in case of legacy
        SEA.work(pass, (act.auth = auth).s, act.d, act.enc); // the proof of work is evidence that we've spent some time/effort trying to log in, this slows brute force.
      }
      act.d = function(proof){
        SEA.decrypt(act.auth.ek, proof, act.e, act.enc);
      }
      act.e = function(half){
        if(u === half){
          if(!act.enc){ // try old format
            act.enc = {encode: 'utf8'};
            return act.c(act.auth);
          } act.enc = null; // end backwards
          return act.b();
        }
        act.half = half;
        act.f(act.data);
      }
      act.f = function(pair){
        var half = act.half || {}, data = act.data || {};
        act.g(act.lol = {pub: pair.pub || data.pub, epub: pair.epub || data.epub, priv: pair.priv || half.priv, epriv: pair.epriv || half.epriv});
      }
      act.g = function(pair){
        if(!pair || !pair.pub || !pair.epub){ return act.b() }
        act.pair = pair;
        var user = (root._).user, at = (user._);
        var tmp = at.tag;
        var upt = at.opt;
        at = user._ = root.get('~'+pair.pub)._;
        at.opt = upt;
        // add our credentials in-memory only to our root user instance
        user.is = {pub: pair.pub, epub: pair.epub, alias: alias || pair.pub};
        at.sea = act.pair;
        cat.ing = false;
        try{if(pass && u == (obj_ify(cat.root.graph['~'+pair.pub].auth)||'')[':']){ opt.shuffle = opt.change = pass; } }catch(e){} // migrate UTF8 & Shuffle!
        opt.change? act.z() : (cb || noop)(at);
        if(SEA.window && ((gun.back('user')._).opt||opt).remember){
          // TODO: this needs to be modular.
          try{var sS = {};
          sS = window.sessionStorage; // TODO: FIX BUG putting on `.is`!
          sS.recall = true;
          sS.pair = JSON.stringify(pair); // auth using pair is more reliable than alias/pass
          }catch(e){}
        }
        try{
          if(root._.tag.auth){ // auth handle might not be registered yet
          (root._).on('auth', at) // TODO: Deprecate this, emit on user instead! Update docs when you do.
          } else { setTimeout(function(){ (root._).on('auth', at) },1) } // if not, hackily add a timeout.
          //at.on('auth', at) // Arrgh, this doesn't work without event "merge" code, but "merge" code causes stack overflow and crashes after logging in & trying to write data.
        }catch(e){
          Gun.log("Your 'auth' callback crashed with:", e);
        }
      }
      act.h = function(data){
        if(!data){ return act.b() }
        alias = data.alias
        if(!alias)
          alias = data.alias = "~" + pair.pub        
        if(!data.auth){
          return act.g(pair);
        }
        pair = null;
        act.c((act.data = data).auth);
      }
      act.z = function(){
        // password update so encrypt private key using new pwd + salt
        act.salt = String.random(64); // pseudo-random
        SEA.work(opt.change, act.salt, act.y);
      }
      act.y = function(proof){
        SEA.encrypt({priv: act.pair.priv, epriv: act.pair.epriv}, proof, act.x, {raw:1});
      }
      act.x = function(auth){
        act.w(JSON.stringify({ek: auth, s: act.salt}));
      }
      act.w = function(auth){
        if(opt.shuffle){ // delete in future!
          console.log('migrate core account from UTF8 & shuffle');
          var tmp = {}; Object.keys(act.data).forEach(function(k){ tmp[k] = act.data[k] });
          delete tmp._;
          tmp.auth = auth;
          root.get('~'+act.pair.pub).put(tmp);
        } // end delete
        root.get('~'+act.pair.pub).get('auth').put(auth, cb || noop);
      }
      act.err = function(e){
        var ack = {err: Gun.log(e || 'User cannot be found!')};
        cat.ing = false;
        (cb || noop)(ack);
      }
      act.plugin = function(name){
        if(!(act.name = name)){ return act.err() }
        var tmp = [name];
        if('~' !== name[0]){
          tmp[1] = '~'+name;
          tmp[2] = '~@'+name;
        }
        act.b(tmp);
      }
      if(pair){
        if(pair.priv && pair.epriv)
          act.g(pair);
        else
          root.get('~'+pair.pub).once(act.h);
      } else
      if(alias){
        root.get('~@'+alias).once(act.a);
      } else
      if(!alias && !pass){
        SEA.name(act.plugin);
      }
      return gun;
    }
    function obj_ify(o){
      if('string' != typeof o){ return o }
      try{o = JSON.parse(o);
      }catch(e){o={}};
      return o;
    }
  })(USE, './auth');

  ;USE(function(module){
    var User = USE('./user'), SEA = User.SEA, Gun = User.GUN;
    User.prototype.recall = function(opt, cb){
      var gun = this, root = gun.back(-1), tmp;
      opt = opt || {};
      if(opt && opt.sessionStorage){
        if(SEA.window){
          try{
            var sS = {};
            sS = window.sessionStorage; // TODO: FIX BUG putting on `.is`!
            if(sS){
              (root._).opt.remember = true;
              ((gun.back('user')._).opt||opt).remember = true;
              if(sS.recall || sS.pair) root.user().auth(JSON.parse(sS.pair), cb); // pair is more reliable than alias/pass
            }
          }catch(e){}
        }
        return gun;
      }
      /*
        TODO: copy mhelander's expiry code back in.
        Although, we should check with community,
        should expiry be core or a plugin?
      */
      return gun;
    }
  })(USE, './recall');

  ;USE(function(module){
    var User = USE('./user'), SEA = User.SEA, Gun = User.GUN, noop = function(){};
    User.prototype.pair = function(){
      var user = this, proxy; // undeprecated, hiding with proxies.
      try{ proxy = new Proxy({DANGER:'\u2620'}, {get: function(t,p,r){
        if(!user.is || !(user._||'').sea){ return }
        return user._.sea[p];
      }})}catch(e){}
      return proxy;
    }
    // If authenticated user wants to delete his/her account, let's support it!
    User.prototype.delete = async function(alias, pass, cb){
      console.log("user.delete() IS DEPRECATED AND WILL BE MOVED TO A MODULE!!!");
      var gun = this, root = gun.back(-1), user = gun.back('user');
      try {
        user.auth(alias, pass, function(ack){
          var pub = (user.is||{}).pub;
          // Delete user data
          user.map().once(function(){ this.put(null) });
          // Wipe user data from memory
          user.leave();
          (cb || noop)({ok: 0});
        });
      } catch (e) {
        Gun.log('User.delete failed! Error:', e);
      }
      return gun;
    }
    User.prototype.alive = async function(){
      console.log("user.alive() IS DEPRECATED!!!");
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
      console.log("`.trust` API MAY BE DELETED OR CHANGED OR RENAMED, DO NOT USE!");
      // TODO: BUG!!! SEA `node` read listener needs to be async, which means core needs to be async too.
      //gun.get('alice').get('age').trust(bob);
      if (Gun.is(user)) {
        user.get('pub').get((ctx, ev) => {
          console.log(ctx, ev)
        })
      }
      user.get('trust').get(path).put(theirPubkey);

      // do a lookup on this gun chain directly (that gets bob's copy of the data)
      // do a lookup on the metadata trust table for this path (that gets all the pubkeys allowed to write on this path)
      // do a lookup on each of those pubKeys ON the path (to get the collab data "layers")
      // THEN you perform Jachen's mix operation
      // and return the result of that to...
    }
    User.prototype.grant = function(to, cb){
      console.log("`.grant` API MAY BE DELETED OR CHANGED OR RENAMED, DO NOT USE!");
      var gun = this, user = gun.back(-1).user(), pair = user._.sea, path = '';
      gun.back(function(at){ if(at.is){ return } path += (at.get||'') });
      (async function(){
      var enc, sec = await user.get('grant').get(pair.pub).get(path).then();
      sec = await SEA.decrypt(sec, pair);
      if(!sec){
        sec = SEA.random(16).toString();
        enc = await SEA.encrypt(sec, pair);
        user.get('grant').get(pair.pub).get(path).put(enc);
      }
      var pub = to.get('pub').then();
      var epub = to.get('epub').then();
      pub = await pub; epub = await epub;
      var dh = await SEA.secret(epub, pair);
      enc = await SEA.encrypt(sec, dh);
      user.get('grant').get(pub).get(path).put(enc, cb);
      }());
      return gun;
    }
    User.prototype.secret = function(data, cb){
      console.log("`.secret` API MAY BE DELETED OR CHANGED OR RENAMED, DO NOT USE!");
      var gun = this, user = gun.back(-1).user(), pair = user.pair(), path = '';
      gun.back(function(at){ if(at.is){ return } path += (at.get||'') });
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

    /**
     * returns the decrypted value, encrypted by secret
     * @returns {Promise<any>}
     // Mark needs to review 1st before officially supported
    User.prototype.decrypt = function(cb) {
      let gun = this,
        path = ''
      gun.back(function(at) {
        if (at.is) {
          return
        }
        path += at.get || ''
      })
      return gun
        .then(async data => {
          if (data == null) {
            return
          }
          const user = gun.back(-1).user()
          const pair = user.pair()
          let sec = await user
            .get('trust')
            .get(pair.pub)
            .get(path)
          sec = await SEA.decrypt(sec, pair)
          if (!sec) {
            return data
          }
          let decrypted = await SEA.decrypt(data, sec)
          return decrypted
        })
        .then(res => {
          cb && cb(res)
          return res
        })
    }
    */
    module.exports = User
  })(USE, './share');

  ;USE(function(module){
    var SEA = USE('./sea'), S = USE('./settings'), noop = function() {}, u;
    var Gun = (''+u != typeof window)? (window.Gun||{on:noop}) : USE((''+u === typeof MODULE?'.':'')+'./gun', 1);
    // After we have a GUN extension to make user registration/login easy, we then need to handle everything else.

    // We do this with a GUN adapter, we first listen to when a gun instance is created (and when its options change)
    Gun.on('opt', function(at){
      if(!at.sea){ // only add SEA once per instance, on the "at" context.
        at.sea = {own: {}};
        at.on('put', check, at); // SEA now runs its firewall on HAM diffs, not all i/o.
      }
      this.to.next(at); // make sure to call the "next" middleware adapter.
    });

    // Alright, this next adapter gets run at the per node level in the graph database.
    // correction: 2020 it gets run on each key/value pair in a node upon a HAM diff.
    // This will let us verify that every property on a node has a value signed by a public key we trust.
    // If the signature does not match, the data is just `undefined` so it doesn't get passed on.
    // If it does match, then we transform the in-memory "view" of the data into its plain value (without the signature).
    // Now NOTE! Some data is "system" data, not user data. Example: List of public keys, aliases, etc.
    // This data is self-enforced (the value can only match its ID), but that is handled in the `security` function.
    // From the self-enforced data, we can see all the edges in the graph that belong to a public key.
    // Example: ~ASDF is the ID of a node with ASDF as its public key, signed alias and salt, and
    // its encrypted private key, but it might also have other signed values on it like `profile = <ID>` edge.
    // Using that directed edge's ID, we can then track (in memory) which IDs belong to which keys.
    // Here is a problem: Multiple public keys can "claim" any node's ID, so this is dangerous!
    // This means we should ONLY trust our "friends" (our key ring) public keys, not any ones.
    // I have not yet added that to SEA yet in this alpha release. That is coming soon, but beware in the meanwhile!

    function check(msg){ // REVISE / IMPROVE, NO NEED TO PASS MSG/EVE EACH SUB?
      var eve = this, at = eve.as, put = msg.put, soul = put['#'], key = put['.'], val = put[':'], state = put['>'], id = msg['#'], tmp;
      if(!soul || !key){ return }
      if((msg._||'').faith && (at.opt||'').faith && 'function' == typeof msg._){
        SEA.opt.pack(put, function(raw){
        SEA.verify(raw, false, function(data){ // this is synchronous if false
          put['='] = SEA.opt.unpack(data);
          eve.to.next(msg);
        })})
        return 
      }
      var no = function(why){ at.on('in', {'@': id, err: msg.err = why}) }; // exploit internal relay stun for now, maybe violates spec, but testing for now. // Note: this may be only the sharded message, not original batch.
      //var no = function(why){ msg.ack(why) };
      (msg._||'').DBG && ((msg._||'').DBG.c = +new Date);
      if(0 <= soul.indexOf('<?')){ // special case for "do not sync data X old" forget
        // 'a~pub.key/b<?9'
        tmp = parseFloat(soul.split('<?')[1]||'');
        if(tmp && (state < (Gun.state() - (tmp * 1000)))){ // sec to ms
          (tmp = msg._) && (tmp.stun) && (tmp.stun--); // THIS IS BAD CODE! It assumes GUN internals do something that will probably change in future, but hacking in now.
          return; // omit!
        }
      }
      
      if('~@' === soul){  // special case for shared system data, the list of aliases.
        check.alias(eve, msg, val, key, soul, at, no); return;
      }
      if('~@' === soul.slice(0,2)){ // special case for shared system data, the list of public keys for an alias.
        check.pubs(eve, msg, val, key, soul, at, no); return;
      }
      //if('~' === soul.slice(0,1) && 2 === (tmp = soul.slice(1)).split('.').length){ // special case, account data for a public key.
      if(tmp = SEA.opt.pub(soul)){ // special case, account data for a public key.
        check.pub(eve, msg, val, key, soul, at, no, at.user||'', tmp); return;
      }
      if(0 <= soul.indexOf('#')){ // special case for content addressing immutable hashed data.
        check.hash(eve, msg, val, key, soul, at, no); return;
      } 
      check.any(eve, msg, val, key, soul, at, no, at.user||''); return;
      eve.to.next(msg); // not handled
    }
    check.hash = function(eve, msg, val, key, soul, at, no){ // mark unbuilt @i001962 's epic hex contrib!
      SEA.work(val, null, function(data){
        function hexToBase64(hexStr) {
          let base64 = "";
          for(let i = 0; i < hexStr.length; i++) {
            base64 += !(i - 1 & 1) ? String.fromCharCode(parseInt(hexStr.substring(i - 1, i + 1), 16)) : ""}
          return btoa(base64);}  
        if(data && data === key.split('#').slice(-1)[0]){ return eve.to.next(msg) }
          else if (data && data === hexToBase64(key.split('#').slice(-1)[0])){ 
          return eve.to.next(msg) }
        no("Data hash not same as hash!");
      }, {name: 'SHA-256'});
    }
    check.alias = function(eve, msg, val, key, soul, at, no){ // Example: {_:#~@, ~@alice: {#~@alice}}
      if(!val){ return no("Data must exist!") } // data MUST exist
      if('~@'+key === link_is(val)){ return eve.to.next(msg) } // in fact, it must be EXACTLY equal to itself
      no("Alias not same!"); // if it isn't, reject.
    };
    check.pubs = function(eve, msg, val, key, soul, at, no){ // Example: {_:#~@alice, ~asdf: {#~asdf}}
      if(!val){ return no("Alias must exist!") } // data MUST exist
      if(key === link_is(val)){ return eve.to.next(msg) } // and the ID must be EXACTLY equal to its property
      no("Alias not same!"); // that way nobody can tamper with the list of public keys.
    };
    check.pub = async function(eve, msg, val, key, soul, at, no, user, pub){ var tmp // Example: {_:#~asdf, hello:'world'~fdsa}}
      const raw = await S.parse(val) || {}
      const verify = (certificate, certificant, cb) => {
        if (certificate.m && certificate.s && certificant && pub)
          // now verify certificate
          return SEA.verify(certificate, pub, data => { // check if "pub" (of the graph owner) really issued this cert
            if (u !== data && u !== data.e && msg.put['>'] && msg.put['>'] > parseFloat(data.e)) return no("Certificate expired.") // certificate expired
            // "data.c" = a list of certificants/certified users
            // "data.w" = lex WRITE permission, in the future, there will be "data.r" which means lex READ permission
            if (u !== data && data.c && data.w && (data.c === certificant || data.c.indexOf('*' || certificant) > -1)) {
              // ok, now "certificant" is in the "certificants" list, but is "path" allowed? Check path
              let path = soul.indexOf('/') > -1 ? soul.replace(soul.substring(0, soul.indexOf('/') + 1), '') : ''
              String.match = String.match || Gun.text.match
              const w = Array.isArray(data.w) ? data.w : typeof data.w === 'object' || typeof data.w === 'string' ? [data.w] : []
              for (const lex of w) {
                if ((String.match(path, lex['#']) && String.match(key, lex['.'])) || (!lex['.'] && String.match(path, lex['#'])) || (!lex['#'] && String.match(key, lex['.'])) || String.match((path ? path + '/' + key : key), lex['#'] || lex)) {
                  // is Certificant forced to present in Path
                  if (lex['+'] && lex['+'].indexOf('*') > -1 && path && path.indexOf(certificant) == -1 && key.indexOf(certificant) == -1) return no(`Path "${path}" or key "${key}" must contain string "${certificant}".`)
                  // path is allowed, but is there any WRITE block? Check it out
                  if (data.wb && (typeof data.wb === 'string' || ((data.wb || {})['#']))) { // "data.wb" = path to the WRITE block
                    var root = eve.as.root.$.back(-1)
                    if (typeof data.wb === 'string' && '~' !== data.wb.slice(0, 1)) root = root.get('~' + pub)
                    return root.get(data.wb).get(certificant).once(value => { // TODO: INTENT TO DEPRECATE.
                      if (value && (value === 1 || value === true)) return no(`Certificant ${certificant} blocked.`)
                      return cb(data)
                    })
                  }
                  return cb(data)
                }
              }
              return no("Certificate verification fail.")
            }
          })
        return
      }
      
      if ('pub' === key && '~' + pub === soul) {
        if (val === pub) return eve.to.next(msg) // the account MUST match `pub` property that equals the ID of the public key.
        return no("Account not same!")
      }

      if ((tmp = user.is) && tmp.pub && !raw['*'] && !raw['+'] && (pub === tmp.pub || (pub !== tmp.pub && ((msg._.msg || {}).opt || {}).cert))){
        SEA.opt.pack(msg.put, packed => {
          SEA.sign(packed, (user._).sea, async function(data) {
            if (u === data) return no(SEA.err || 'Signature fail.')
            msg.put[':'] = {':': tmp = SEA.opt.unpack(data.m), '~': data.s}
            msg.put['='] = tmp
  
            // if writing to own graph, just allow it
            if (pub === user.is.pub) {
              if (tmp = link_is(val)) (at.sea.own[tmp] = at.sea.own[tmp] || {})[pub] = 1
              JSON.stringifyAsync(msg.put[':'], function(err,s){
                if(err){ return no(err || "Stringify error.") }
                msg.put[':'] = s;
                return eve.to.next(msg);
              })
              return
            }
  
            // if writing to other's graph, check if cert exists then try to inject cert into put, also inject self pub so that everyone can verify the put
            if (pub !== user.is.pub && ((msg._.msg || {}).opt || {}).cert) {
              const cert = await S.parse(msg._.msg.opt.cert)
              // even if cert exists, we must verify it
              if (cert && cert.m && cert.s)
                verify(cert, user.is.pub, _ => {
                  msg.put[':']['+'] = cert // '+' is a certificate
                  msg.put[':']['*'] = user.is.pub // '*' is pub of the user who puts
                  JSON.stringifyAsync(msg.put[':'], function(err,s){
                    if(err){ return no(err || "Stringify error.") }
                    msg.put[':'] = s;
                    return eve.to.next(msg);
                  })
                  return
                })
            }
          }, {raw: 1})
        })
        return;
      }

      SEA.opt.pack(msg.put, packed => {
        SEA.verify(packed, raw['*'] || pub, function(data){ var tmp;
          data = SEA.opt.unpack(data);
          if (u === data) return no("Unverified data.") // make sure the signature matches the account it claims to be on. // reject any updates that are signed with a mismatched account.
          if ((tmp = link_is(data)) && pub === SEA.opt.pub(tmp)) (at.sea.own[tmp] = at.sea.own[tmp] || {})[pub] = 1
          
          // check if cert ('+') and putter's pub ('*') exist
          if (raw['+'] && raw['+']['m'] && raw['+']['s'] && raw['*'])
            // now verify certificate
            verify(raw['+'], raw['*'], _ => {
              msg.put['='] = data;
              return eve.to.next(msg);
            })
          else {
            msg.put['='] = data;
            return eve.to.next(msg);
          }
        });
      })
      return
    };
    check.any = function(eve, msg, val, key, soul, at, no, user){ var tmp, pub;
      if(at.opt.secure){ return no("Soul missing public key at '" + key + "'.") }
      // TODO: Ask community if should auto-sign non user-graph data.
      at.on('secure', function(msg){ this.off();
        if(!at.opt.secure){ return eve.to.next(msg) }
        no("Data cannot be changed.");
      }).on.on('secure', msg);
      return;
    }

    var valid = Gun.valid, link_is = function(d,l){ return 'string' == typeof (l = valid(d)) && l }, state_ify = (Gun.state||'').ify;

    var pubcut = /[^\w_-]/; // anything not alphanumeric or _ -
    SEA.opt.pub = function(s){
      if(!s){ return }
      s = s.split('~');
      if(!s || !(s = s[1])){ return }
      s = s.split(pubcut).slice(0,2);
      if(!s || 2 != s.length){ return }
      if('@' === (s[0]||'')[0]){ return }
      s = s.slice(0,2).join('.');
      return s;
    }
    SEA.opt.stringy = function(t){
      // TODO: encrypt etc. need to check string primitive. Make as breaking change.
    }
    SEA.opt.pack = function(d,cb,k, n,s){ var tmp, f; // pack for verifying
      if(SEA.opt.check(d)){ return cb(d) }
      if(d && d['#'] && d['.'] && d['>']){ tmp = d[':']; f = 1 }
      JSON.parseAsync(f? tmp : d, function(err, meta){
        var sig = ((u !== (meta||'')[':']) && (meta||'')['~']); // or just ~ check?
        if(!sig){ cb(d); return }
        cb({m: {'#':s||d['#'],'.':k||d['.'],':':(meta||'')[':'],'>':d['>']||Gun.state.is(n, k)}, s: sig});
      });
    }
    var O = SEA.opt;
    SEA.opt.unpack = function(d, k, n){ var tmp;
      if(u === d){ return }
      if(d && (u !== (tmp = d[':']))){ return tmp }
      k = k || O.fall_key; if(!n && O.fall_val){ n = {}; n[k] = O.fall_val }
      if(!k || !n){ return }
      if(d === n[k]){ return d }
      if(!SEA.opt.check(n[k])){ return d }
      var soul = (n && n._ && n._['#']) || O.fall_soul, s = Gun.state.is(n, k) || O.fall_state;
      if(d && 4 === d.length && soul === d[0] && k === d[1] && fl(s) === fl(d[3])){
        return d[2];
      }
      if(s < SEA.opt.shuffle_attack){
        return d;
      }
    }
    SEA.opt.shuffle_attack = 1546329600000; // Jan 1, 2019
    var fl = Math.floor; // TODO: Still need to fix inconsistent state issue.
    // TODO: Potential bug? If pub/priv key starts with `-`? IDK how possible.

  })(USE, './index');
}());
