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

    SEA.pair = SEA.pair || (async (cb, opt) => { try {
      const e = new shim.TextEncoder();
      const h = async d => shim.Buffer.from(await shim.subtle.digest('SHA-256', e.encode(d))).toString('base64').replace(/[+/=]/g,c=>({'+':'-','/':'_','=':''})[c]).slice(0,43);
      const g = async k => (await Promise.all([h(k+'-x'), h(k+'-y')])).join('.');
      let r = {};

      if(opt && opt.seed){
        r = { priv: await h(opt.seed+'-sign'), epriv: await h(opt.seed+'-encrypt') };
      }
      else if(opt && opt.priv){
        r = { priv: opt.priv, epriv: opt.epriv || await h(opt.priv+'-encrypt') };
      }
      else if(opt && opt.epriv){
        r = { epriv: opt.epriv, priv: await h(opt.epriv+'-sign') };
      }
      else {
        const keys = await shim.subtle.generateKey({name: 'ECDSA', namedCurve: 'P-256'}, true, ['sign', 'verify']);
        const [priv, pub] = await Promise.all([shim.subtle.exportKey('jwk', keys.privateKey), shim.subtle.exportKey('jwk', keys.publicKey)]);
        r = { priv: priv.d, pub: pub.x+'.'+pub.y };
        try {
          const dhKeys = await (shim.ossl || shim.subtle).generateKey({name: 'ECDH', namedCurve: 'P-256'}, true, ['deriveKey']);
          const [dhPriv, dhPub] = await Promise.all([shim.subtle.exportKey('jwk', dhKeys.privateKey), shim.subtle.exportKey('jwk', dhKeys.publicKey)]);
          r.epriv = dhPriv.d;
          r.epub = dhPub.x+'.'+dhPub.y;
        } catch(e) {
          if(SEA.window){ throw e }
          if(e == 'Error: ECDH is not a supported algorithm'){ console.log('Ignoring ECDH...') }
          else { throw e }
        }
      }

      r.pub = r.pub || await g(r.priv);
      r.epub = r.epub || await g(r.epriv);
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
