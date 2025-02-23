;(function(){
  var SEA = require('./root');
  var shim = require('./shim');
  var S = require('./settings');
  var sha = require('./sha256');
  var u;

  SEA.sign = SEA.sign || (async (data, pair, cb, opt) => { try {
    opt = opt || {};

    // Format and return the final response
    async function next(r) {
      try {
        if(!opt.raw){ r = 'SEA' + await shim.stringify(r) }
        if(cb){ try{ cb(r) }catch(e){} }
        return r;
      } catch(e) {
        console.warn('SEA.sign response error', e);
        return r;
      }
    }

    // WebAuthn
    async function wa(res, json) {
      var r = {
        m: json,
        s: res.signature ? shim.Buffer.from(res.signature, 'binary').toString(opt.encode || 'base64') : undefined,
        a: shim.Buffer.from(res.authenticatorData, 'binary').toString('base64'),
        c: shim.Buffer.from(res.clientDataJSON, 'binary').toString('base64')
      };
      if (!r.s || !r.a || !r.c) throw "WebAuthn signature invalid";
      return next(r);
    }

    // External auth fn
    async function ea(res, json) {
      if (!res) throw new Error('Empty auth response');
      if (typeof res === 'string') {
        return next({ m: json, s: res });
      }
      if (res.signature) {
        return next({
          m: json,
          s: shim.Buffer.from(res.signature, 'binary').toString(opt.encode || 'base64')
        });
      }
      throw new Error('Invalid auth format');
    }

    // Key pair
    async function kp(pair, json) {
      var jwk = S.jwk(pair.pub, pair.priv);
      if (!jwk) throw new Error('Invalid key pair');
      
      var hash = await sha(json);
      var sig = await (shim.ossl || shim.subtle).importKey('jwk', jwk, {name: 'ECDSA', namedCurve: 'P-256'}, false, ['sign'])
      .then((key) => (shim.ossl || shim.subtle).sign({name: 'ECDSA', hash: {name: 'SHA-256'}}, key, new Uint8Array(hash)))
      .catch(e => { throw new Error('SEA signature failed: ' + e.message) });

      return next({
        m: json,
        s: shim.Buffer.from(sig, 'binary').toString(opt.encode || 'base64')
      });
    }

    if(u === data) throw '`undefined` not allowed.';
    if(!(pair||opt).priv && typeof pair !== 'function'){
      if(!SEA.I) throw 'No signing key.';
      pair = await SEA.I(null, {what: data, how: 'sign', why: opt.why});
    }

    var json = await S.parse(data);
    var check = opt.check = opt.check || json;

    if(SEA.verify && (SEA.opt.check(check) || (check && check.s && check.m))
    && u !== await SEA.verify(check, pair)){
      return next(await S.parse(check));
    }

    if(typeof pair === 'function') {
      const response = await pair(data);
      const fn = response.authenticatorData ? wa : ea;
      return fn(response, json);
    }
    
    return kp(pair, json);
  } catch(e) {
    SEA.err = e;
    if(SEA.throw){ throw e }
    if(cb){ cb() }
    return;
  }});

  module.exports = SEA.sign;
}());
