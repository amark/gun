
    var SEA = require('./root');
    var shim = require('./shim');
    var S = require('./settings');
    var sha256hash = require('./sha256');
    var u;

    SEA.sign = SEA.sign || (async (data, pair, cb, opt) => { try {
      opt = opt || {};
      if(!(pair||opt).priv){
        pair = await SEA.I(null, {what: data, how: 'sign', why: opt.why});
      }
      const pub = pair.pub
      const priv = pair.priv
      const jwk = S.jwk(pub, priv)
      const hash = await sha256hash(JSON.stringify(data))
      const sig = await (shim.ossl || shim.subtle).importKey('jwk', jwk, S.ecdsa.pair, false, ['sign'])
      .then((key) => (shim.ossl || shim.subtle).sign(S.ecdsa.sign, key, new Uint8Array(hash))) // privateKey scope doesn't leak out from here!
      const r = 'SEA'+JSON.stringify({m: data, s: shim.Buffer.from(sig, 'binary').toString(opt.encode || 'base64')});

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
  