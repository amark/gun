;(function(){

    var SEA = require('./root');
    var shim = require('./shim');
    var S = require('./settings');

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

    SEA.pair = SEA.pair || (async (cb, opt) => { try {
      var ecdhSubtle = shim.ossl || shim.subtle;

      // Generate deterministic keys if opt.seed is provided
      if (opt && opt.seed) {
        const encoder = new shim.TextEncoder();
        
        // Generate deterministic private keys using SHA-256
        const signPrivateKeyBytes = new Uint8Array(
          await shim.subtle.digest('SHA-256', encoder.encode(opt.seed + '-sign'))
        );
        const encryptPrivateKeyBytes = new Uint8Array(
          await shim.subtle.digest('SHA-256', encoder.encode(opt.seed + '-encrypt'))
        );

        // Convert to base64url format
        const toBase64Url = buffer => 
          shim.Buffer.from(buffer)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

        // Format private keys
        const signPriv = toBase64Url(signPrivateKeyBytes).slice(0, 43);
        const encryptPriv = toBase64Url(encryptPrivateKeyBytes).slice(0, 43);

        // Generate public key components deterministically
        const signPubXBytes = await shim.subtle.digest(
          'SHA-256',
          encoder.encode(signPriv + '-x')
        );
        const signPubYBytes = await shim.subtle.digest(
          'SHA-256',
          encoder.encode(signPriv + '-y')
        );
        const encryptPubXBytes = await shim.subtle.digest(
          'SHA-256',
          encoder.encode(encryptPriv + '-x')
        );
        const encryptPubYBytes = await shim.subtle.digest(
          'SHA-256',
          encoder.encode(encryptPriv + '-y')
        );

        // Format public keys
        const signPubX = toBase64Url(signPubXBytes).slice(0, 43);
        const signPubY = toBase64Url(signPubYBytes).slice(0, 43);
        const encryptPubX = toBase64Url(encryptPubXBytes).slice(0, 43);
        const encryptPubY = toBase64Url(encryptPubYBytes).slice(0, 43);

        // Format the result
        var r = {
          pub: signPubX + '.' + signPubY,
          priv: signPriv,
          epub: encryptPubX + '.' + encryptPubY,
          epriv: encryptPriv
        };

        if(cb){ try{ cb(r) }catch(e){console.log(e)} }
        return r;
      }

      // If no seed provided, generate random keys (existing logic)
      var sa = await shim.subtle.generateKey(
        {name: 'ECDSA', namedCurve: 'P-256'},
        true,
        ['sign', 'verify']
      ).then(async (keys) => {
        var key = {};
        key.priv = (await shim.subtle.exportKey('jwk', keys.privateKey)).d;
        var pub = await shim.subtle.exportKey('jwk', keys.publicKey);
        key.pub = pub.x+'.'+pub.y;
        return key;
      });
      
      try{
        var dh = await ecdhSubtle.generateKey(
          {name: 'ECDH', namedCurve: 'P-256'},
          true,
          ['deriveKey']
        ).then(async (keys) => {
          var key = {};
          key.epriv = (await ecdhSubtle.exportKey('jwk', keys.privateKey)).d;
          var pub = await ecdhSubtle.exportKey('jwk', keys.publicKey);
          key.epub = pub.x+'.'+pub.y;
          return key;
        });
      }catch(e){
        if(SEA.window){ throw e }
        if(e == 'Error: ECDH is not a supported algorithm'){ console.log('Ignoring ECDH...') }
        else { throw e }
      } dh = dh || {};

      var r = { pub: sa.pub, priv: sa.priv, epub: dh.epub, epriv: dh.epriv }
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
  
}());