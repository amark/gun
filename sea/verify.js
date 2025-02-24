;(function(){
  var SEA = require('./root');
  var shim = require('./shim');
  var S = require('./settings');
  var sha = require('./sha256');
  var u;

  async function w(j, k, s) {
    var a = new Uint8Array(shim.Buffer.from(j.a, 'base64'));
    var c = shim.Buffer.from(j.c, 'base64').toString('utf8');
    var m = new TextEncoder().encode(j.m);
    var e = btoa(String.fromCharCode(...new Uint8Array(m))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    if (JSON.parse(c).challenge !== e) throw "Challenge verification failed";
    var h = await (shim.ossl || shim.subtle).digest(
        {name: 'SHA-256'},
        new TextEncoder().encode(c)
    );
    var d = new Uint8Array(a.length + h.byteLength);
    d.set(a);
    d.set(new Uint8Array(h), a.length);
    if (s[0] !== 0x30) throw "Invalid DER signature format";
    var o = 2, r = new Uint8Array(64);
    for(var i = 0; i < 2; i++) {
      var l = s[o + 1];
      o += 2;
      if (s[o] === 0x00) { o++; l--; }
      var p = new Uint8Array(32).fill(0);
      p.set(s.slice(o, o + l), 32 - l);
      r.set(p, i * 32);
      o += l;
    }
    return (shim.ossl || shim.subtle).verify({ name: 'ECDSA', hash: {name: 'SHA-256'} }, k, r, d);
  }

  async function v(j, k, s, h) {
    return (shim.ossl || shim.subtle).verify(
      {name: 'ECDSA', hash: {name: 'SHA-256'}}, 
      k, s, new Uint8Array(h)
    );
  }

  SEA.verify = SEA.verify || (async (d, p, cb, o) => { try {
    var j = await S.parse(d);
    if(false === p) return cb ? cb(await S.parse(j.m)) : await S.parse(j.m);
    
    o = o || {};
    var pub = p.pub || p;
    var [x, y] = pub.split('.');
    
    try {
      var k = await (shim.ossl || shim.subtle).importKey('jwk', {
          kty: 'EC', crv: 'P-256', x, y, ext: true, key_ops: ['verify']
      }, {name: 'ECDSA', namedCurve: 'P-256'}, false, ['verify']);

      var h = await sha(j.m);
      var s = new Uint8Array(shim.Buffer.from(j.s || '', o.encode || 'base64'));
      
      var c = j.a && j.c ? await w(j, k, s) : await v(j, k, s, h);
      
      if(!c) throw "Signature did not match";
      
      var r = await S.parse(j.m);
      if(cb){ try{ cb(r) }catch(e){} }
      return r;
    } catch(e) {
      if(SEA.opt.fallback){
          return await SEA.opt.fall_verify(d, p, cb, o);
      }
      if(cb){ cb() }
      return;
    }
  } catch(e) {
    SEA.err = e;
    if(SEA.throw){ throw e }
    if(cb){ cb() }
    return;
  }});

  module.exports = SEA.verify;

  var knownKeys = {};
  SEA.opt.slow_leak = pair => {
    if (knownKeys[pair]) return knownKeys[pair];
    var jwk = S.jwk(pair);
    knownKeys[pair] = (shim.ossl || shim.subtle).importKey("jwk", jwk, {name: 'ECDSA', namedCurve: 'P-256'}, false, ["verify"]);
    return knownKeys[pair];
  };

  SEA.opt.fall_verify = async function(data, pair, cb, opt, f){
    if(f === SEA.opt.fallback){ throw "Signature did not match" }
    var tmp = data||'';
    data = SEA.opt.unpack(data) || data;
    var json = await S.parse(data), key = await SEA.opt.slow_leak(pair.pub || pair);
    var hash = (!f || f <= SEA.opt.fallback)? 
      shim.Buffer.from(await shim.subtle.digest({name: 'SHA-256'}, 
        new shim.TextEncoder().encode(await S.parse(json.m)))) : await sha(json.m);
    
    try {
      var buf = shim.Buffer.from(json.s, opt.encode || 'base64');
      var sig = new Uint8Array(buf);
      var check = await (shim.ossl || shim.subtle).verify(
        {name: 'ECDSA', hash: {name: 'SHA-256'}}, 
        key, sig, new Uint8Array(hash)
      );
      if(!check) throw "";
    } catch(e) {
      try {
        buf = shim.Buffer.from(json.s, 'utf8');
        sig = new Uint8Array(buf);
        check = await (shim.ossl || shim.subtle).verify(
          {name: 'ECDSA', hash: {name: 'SHA-256'}}, 
          key, sig, new Uint8Array(hash)
        );
        if(!check) throw "";
      } catch(e){ throw "Signature did not match." }
    }

    var r = check ? await S.parse(json.m) : u;
    SEA.opt.fall_soul = tmp['#']; SEA.opt.fall_key = tmp['.'];
    SEA.opt.fall_val = data; SEA.opt.fall_state = tmp['>'];
    if(cb){ try{ cb(r) }catch(e){console.log(e)} }
    return r;
  }
  SEA.opt.fallback = 2;
}());