;(function(){
  var SEA = require('./root');
  var shim = require('./shim');
  var S = require('./settings');
  var sha = require('./sha256');
  var u;

  SEA.sign = SEA.sign || (async (data, pair, cb, opt) => { try {
    opt = opt || {};

    // Format and return the final response
    async function next(r, opt, cb) {
      try {
        if(!opt.raw){ r = 'SEA' + await shim.stringify(r) }
        if(cb){ try{ cb(r) }catch(e){} }
        return r;
      } catch(e) {
        console.warn('SEA.sign response error', e);
        return r;
      }
    }
    
    // Validate inputs
    if(u === data){ throw '`undefined` not allowed.' }
    if(!(pair||opt).priv && typeof pair !== 'function'){
      if(!SEA.I){ throw 'No signing key.' }
      pair = await SEA.I(null, {what: data, how: 'sign', why: opt.why});
    }

    var json = await S.parse(data);
    var check = opt.check = opt.check || json;

    // Return early if already signed
    if(SEA.verify && (SEA.opt.check(check) || (check && check.s && check.m))
    && u !== await SEA.verify(check, pair)){
      return next(await S.parse(check), opt, cb);
    }

    // Handle WebAuthn
    if(typeof pair === 'function'){
      const response = await pair(data);
      var r = {
        m: json,
        s: response.signature ? shim.Buffer.from(response.signature, 'binary').toString(opt.encode || 'base64') : undefined,
        a: response.authenticatorData ? shim.Buffer.from(response.authenticatorData, 'binary').toString('base64') : undefined,
        c: response.clientDataJSON ? shim.Buffer.from(response.clientDataJSON, 'binary').toString('base64') : undefined
      };
      if (!r.s || !r.a || !r.c) { throw "WebAuthn signature invalid"; }
      return next(r, opt, cb);
    }

    // Handle regular signing
    var jwk = S.jwk(pair.pub, pair.priv);
    var hash = await sha(json);
    var sig = await (shim.ossl || shim.subtle).importKey('jwk', jwk, {name: 'ECDSA', namedCurve: 'P-256'}, false, ['sign'])
    .then((key) => (shim.ossl || shim.subtle).sign({name: 'ECDSA', hash: {name: 'SHA-256'}}, key, new Uint8Array(hash)))
    .catch(e => { throw new Error('SEA signature failed: ' + e.message) });

    return next({
      m: json, 
      s: shim.Buffer.from(sig, 'binary').toString(opt.encode || 'base64')
    }, opt, cb);

  } catch(e) {
    SEA.err = e;
    if(SEA.throw){ throw e }
    if(cb){ cb() }
    return;
  }});

  module.exports = SEA.sign;
}());
