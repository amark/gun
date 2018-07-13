
    var SEA = require('./root');
    var shim = require('./shim');
    var S = require('./settings');
    var Buff = (typeof Buffer !== 'undefined')? Buffer : shim.Buffer;

    //SEA.pair = async (data, proof, cb) => { try {
    SEA.pair = async (cb) => { try {

      const ecdhSubtle = shim.ossl || shim.subtle
      // First: ECDSA keys for signing/verifying...
      var sa = await shim.subtle.generateKey(S.ecdsa.pair, true, [ 'sign', 'verify' ])
      .then(async (keys) => {
        // privateKey scope doesn't leak out from here!
        //const { d: priv } = await shim.subtle.exportKey('jwk', keys.privateKey)
        const key = {};
        key.priv = (await shim.subtle.exportKey('jwk', keys.privateKey)).d;
        const pub = await shim.subtle.exportKey('jwk', keys.publicKey)
        //const pub = Buff.from([ x, y ].join(':')).toString('base64') // old
        key.pub = pub.x+'.'+pub.y // new
        // x and y are already base64
        // pub is UTF8 but filename/URL safe (https://www.ietf.org/rfc/rfc3986.txt)
        // but split on a non-base64 letter.
        return key;
      })
      
      // To include PGPv4 kind of keyId:
      // const pubId = await SEA.keyid(keys.pub)
      // Next: ECDH keys for encryption/decryption...

      try{
      var dh = await ecdhSubtle.generateKey(S.ecdh, true, ['deriveKey'])
      .then(async (keys) => {
        // privateKey scope doesn't leak out from here!
        const key = {};
        key.epriv = (await ecdhSubtle.exportKey('jwk', keys.privateKey)).d;
        const pub = await ecdhSubtle.exportKey('jwk', keys.publicKey)
        //const epub = Buff.from([ ex, ey ].join(':')).toString('base64') // old
        key.epub = pub.x+'.'+pub.y // new
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

      const r = { pub: sa.pub, priv: sa.priv, /* pubId, */ epub: dh.epub, epriv: dh.epriv }
      if(cb){ try{ cb(r) }catch(e){console.log(e)} }
      return r;
    } catch(e) { 
      SEA.err = e;
      if(cb){ cb() }
      return;
    }}

    module.exports = SEA.pair;
  