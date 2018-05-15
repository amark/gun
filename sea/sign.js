
    var SEA = require('./root');
    var shim = require('./shim');
    var S = require('./settings');
    var sha256hash = require('./sha256');

    SEA.sign = async (data, pair, cb) => { try {
      if(data.slice
      && 'SEA{' === data.slice(0,4)
      && '"m":' === data.slice(4,8)){
        // TODO: This would prevent pair2 signing pair1's signature.
        // So we may want to change this in the future.
        // but for now, we want to prevent duplicate double signature.
        if(cb){ cb(data) }
        return data;
      }
      const pub = pair.pub
      const priv = pair.priv
      const jwk = S.jwk(pub, priv)
      const msg = JSON.stringify(data)
      const hash = await sha256hash(msg)
      const sig = await shim.subtle.importKey('jwk', jwk, S.ecdsa.pair, false, ['sign'])
      .then((key) => shim.subtle.sign(S.ecdsa.sign, key, new Uint8Array(hash))) // privateKey scope doesn't leak out from here!
      const r = 'SEA'+JSON.stringify({m: msg, s: shim.Buffer.from(sig, 'binary').toString('utf8')});

      if(cb){ cb(r) }
      return r;
    } catch(e) { 
      SEA.err = e;
      if(cb){ cb() }
      return;
    }}

    module.exports = SEA.sign;
  