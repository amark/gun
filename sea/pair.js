;(function(){

    var SEA = require('./root');
    var shim = require('./shim');

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
      var sa;
      var dh = {};

      if(opt && opt.seed){
        const e = new shim.TextEncoder();
        const h = await shim.subtle.digest('SHA-256', e.encode(opt.seed+'-sign'));
        sa = {
          priv: shim.Buffer.from(h).toString('base64').replace(/[+/=]/g,c=>({'+':'-','/':'_','=':''})[c]).slice(0,43)
        };
        const [x,y,eh] = await Promise.all([
          shim.subtle.digest('SHA-256', e.encode(sa.priv+'-x')),
          shim.subtle.digest('SHA-256', e.encode(sa.priv+'-y')),
          shim.subtle.digest('SHA-256', e.encode(opt.seed+'-encrypt'))
        ]);
        sa.pub = shim.Buffer.from(x).toString('base64').replace(/[+/=]/g,c=>({'+':'-','/':'_','=':''})[c]).slice(0,43) + 
                 '.' + 
                 shim.Buffer.from(y).toString('base64').replace(/[+/=]/g,c=>({'+':'-','/':'_','=':''})[c]).slice(0,43);
        
        dh.epriv = shim.Buffer.from(eh).toString('base64').replace(/[+/=]/g,c=>({'+':'-','/':'_','=':''})[c]).slice(0,43);
        const [ex,ey] = await Promise.all([
          shim.subtle.digest('SHA-256', e.encode(dh.epriv+'-x')),
          shim.subtle.digest('SHA-256', e.encode(dh.epriv+'-y'))
        ]);
        dh.epub = shim.Buffer.from(ex).toString('base64').replace(/[+/=]/g,c=>({'+':'-','/':'_','=':''})[c]).slice(0,43) + 
                  '.' + 
                  shim.Buffer.from(ey).toString('base64').replace(/[+/=]/g,c=>({'+':'-','/':'_','=':''})[c]).slice(0,43);
      } else {
        // First: ECDSA keys for signing/verifying...
        const keys = await shim.subtle.generateKey({name: 'ECDSA', namedCurve: 'P-256'}, true, [ 'sign', 'verify' ]);
        const priv = await shim.subtle.exportKey('jwk', keys.privateKey);
        const pub = await shim.subtle.exportKey('jwk', keys.publicKey);
        sa = {
          priv: priv.d,
          pub: pub.x + '.' + pub.y
        };

        // Next: ECDH keys for encryption/decryption...
        try {
          const dhKeys = await ecdhSubtle.generateKey({name: 'ECDH', namedCurve: 'P-256'}, true, ['deriveKey']);
          const dhPriv = await ecdhSubtle.exportKey('jwk', dhKeys.privateKey);
          const dhPub = await ecdhSubtle.exportKey('jwk', dhKeys.publicKey);
          dh = {
            epriv: dhPriv.d,
            epub: dhPub.x + '.' + dhPub.y
          };
        } catch(e) {
          if(SEA.window){ throw e }
          if(e == 'Error: ECDH is not a supported algorithm'){ console.log('Ignoring ECDH...') }
          else { throw e }
        }
      }

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
  
}());
