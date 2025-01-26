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
      var sa = {};
      var dh = {};

      const e = new shim.TextEncoder();

      // Helper function to generate pub from priv
      const pubFromPriv = async (priv) => {
        const [x,y] = await Promise.all([
          shim.subtle.digest('SHA-256', e.encode(priv+'-x')),
          shim.subtle.digest('SHA-256', e.encode(priv+'-y'))
        ]);
        return shim.Buffer.from(x).toString('base64').replace(/[+/=]/g,c=>({'+':'-','/':'_','=':''})[c]).slice(0,43) + 
               '.' + 
               shim.Buffer.from(y).toString('base64').replace(/[+/=]/g,c=>({'+':'-','/':'_','=':''})[c]).slice(0,43);
      }

      // Helper function to generate epub from epriv
      const epubFromEpriv = async (epriv) => {
        const [ex,ey] = await Promise.all([
          shim.subtle.digest('SHA-256', e.encode(epriv+'-x')),
          shim.subtle.digest('SHA-256', e.encode(epriv+'-y'))
        ]);
        return shim.Buffer.from(ex).toString('base64').replace(/[+/=]/g,c=>({'+':'-','/':'_','=':''})[c]).slice(0,43) + 
               '.' + 
               shim.Buffer.from(ey).toString('base64').replace(/[+/=]/g,c=>({'+':'-','/':'_','=':''})[c]).slice(0,43);
      }

      if(opt && opt.seed){ // Case 0: Generate from seed
        const h = await shim.subtle.digest('SHA-256', e.encode(opt.seed+'-sign'));
        sa.priv = shim.Buffer.from(h).toString('base64').replace(/[+/=]/g,c=>({'+':'-','/':'_','=':''})[c]).slice(0,43);
        sa.pub = await pubFromPriv(sa.priv);
        const eh = await shim.subtle.digest('SHA-256', e.encode(opt.seed+'-encrypt'));
        dh.epriv = shim.Buffer.from(eh).toString('base64').replace(/[+/=]/g,c=>({'+':'-','/':'_','=':''})[c]).slice(0,43);
        dh.epub = await epubFromEpriv(dh.epriv);
      }
      else if(opt && opt.priv){ // Case 1 & 3: Given priv
        sa.priv = opt.priv;
        sa.pub = await pubFromPriv(sa.priv);
        if(!opt.epriv){ // Case 1: Generate epriv
          // Generate a virtual seed from priv to maintain compatibility
          const virtualSeed = sa.priv;
          const eh = await shim.subtle.digest('SHA-256', e.encode(virtualSeed+'-encrypt'));
          dh.epriv = shim.Buffer.from(eh).toString('base64').replace(/[+/=]/g,c=>({'+':'-','/':'_','=':''})[c]).slice(0,43);
        } else { // Case 3: Use provided epriv
          dh.epriv = opt.epriv;
        }
        dh.epub = await epubFromEpriv(dh.epriv);
      }
      else if(opt && opt.epriv){ // Case 2: Given epriv
        dh.epriv = opt.epriv;
        dh.epub = await epubFromEpriv(dh.epriv);
        // Generate a virtual seed from epriv to maintain compatibility
        const virtualSeed = dh.epriv;
        const h = await shim.subtle.digest('SHA-256', e.encode(virtualSeed+'-sign'));
        sa.priv = shim.Buffer.from(h).toString('base64').replace(/[+/=]/g,c=>({'+':'-','/':'_','=':''})[c]).slice(0,43);
        sa.pub = await pubFromPriv(sa.priv);
      }
      else { // Case 4: Generate new keypair
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
