
    var SEA = require('./root');
    var shim = require('./shim');
    var S = require('./settings');
    var aescbckey = require('./aescbc');

    SEA.encrypt = async (data, pair, cb) => { try {
      const key = pair.epriv || pair;
      const msg = JSON.stringify(data)
      const rand = {s: shim.random(8), iv: shim.random(16)};
      const ct = await aescbckey(key, rand.s)
      .then((aes) => shim.subtle.encrypt({ // Keeping the AES key scope as private as possible...
        name: 'AES-CBC', iv: new Uint8Array(rand.iv)
      }, aes, new shim.TextEncoder().encode(msg)))
      const r = 'SEA'+JSON.stringify({
        ct: shim.Buffer.from(ct, 'binary').toString('utf8'),
        iv: rand.iv.toString('utf8'),
        s: rand.s.toString('utf8')
      });

      if(cb){ cb(r) }
      return r;
    } catch(e) { 
      SEA.err = e;
      if(cb){ cb() }
      return;
    }}

    module.exports = SEA.encrypt;
  