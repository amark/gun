
    var SEA = require('./root');
    var shim = require('./shim');
    var S = require('./settings');
    var sha256hash = require('./sha256');
    var parse = require('./parse');
    var u;

    SEA.verify = async (data, pair, cb) => { try {
      const json = parse(data)
      if(false === pair){ // don't verify!
        const raw = (json === data)? json : parse(json.m)
        if(cb){ cb(raw) }
        return raw;
      }
      const pub = pair.pub || pair
      const jwk = S.jwk(pub)
      const key = await shim.subtle.importKey('jwk', jwk, S.ecdsa.pair, false, ['verify'])
      const hash = await sha256hash(json.m)
      const sig = new Uint8Array(shim.Buffer.from(json.s, 'utf8'))
      const check = await shim.subtle.verify(S.ecdsa.sign, key, sig, new Uint8Array(hash))
      if(!check){ throw "Signature did not match." }
      const r = check? parse(json.m) : u;

      if(cb){ cb(r) }
      return r;
    } catch(e) { 
      SEA.err = e;
      if(cb){ cb() }
      return;
    }}

    module.exports = SEA.verify;
  