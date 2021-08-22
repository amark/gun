
    var SEA = require('./root');
    var shim = require('./shim');
    var s = {};
    s.pbkdf2 = {hash: {name : 'SHA-256'}, iter: 100000, ks: 64};
    s.ecdsa = {
      pair: {name: 'ECDSA', namedCurve: 'P-256'},
      sign: {name: 'ECDSA', hash: {name: 'SHA-256'}}
    };
    s.ecdh = {name: 'ECDH', namedCurve: 'P-256'};

    // This creates Web Cryptography API compliant JWK for sign/verify purposes
    s.jwk = function(pub, d){  // d === priv
      pub = pub.split('.');
      var x = pub[0], y = pub[1];
      var jwk = {kty: "EC", crv: "P-256", x: x, y: y, ext: true};
      jwk.key_ops = d ? ['sign'] : ['verify'];
      if(d){ jwk.d = d }
      return jwk;
    };
    
    s.keyToJwk = function(keyBytes) {
      const keyB64 = keyBytes.toString('base64');
      const k = keyB64.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
      return { kty: 'oct', k: k, ext: false, alg: 'A256GCM' };
    }

    s.recall = {
      validity: 12 * 60 * 60, // internally in seconds : 12 hours
      hook: function(props){ return props } // { iat, exp, alias, remember } // or return new Promise((resolve, reject) => resolve(props)
    };

    s.check = function(t){ return (typeof t == 'string') && ('SEA{' === t.slice(0,4)) }
    s.parse = async function p(t){ try {
      var yes = (typeof t == 'string');
      if(yes && 'SEA{' === t.slice(0,4)){ t = t.slice(3) }
      return yes ? await shim.parse(t) : t;
      } catch (e) {}
      return t;
    }

    SEA.opt = s;
    module.exports = s
  