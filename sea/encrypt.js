
    var SEA = require('./root');
    var shim = require('./shim');
    var S = require('./settings');
    var aeskey = require('./aeskey');

    SEA.encrypt = async (data, pair, cb, opt) => { try {
      var opt = opt || {};
      const key = pair.epriv || pair;
      const msg = JSON.stringify(data)
      const rand = {s: shim.random(8), iv: shim.random(16)};
      const ct = await aeskey(key, rand.s, opt)
      .then((aes) => shim.subtle.encrypt({ // Keeping the AES key scope as private as possible...
        name: opt.name || 'AES-GCM', iv: new Uint8Array(rand.iv)
      }, aes, new shim.TextEncoder().encode(msg)))
      const r = 'SEA'+JSON.stringify({
        ct: shim.Buffer.from(ct, 'binary').toString('utf8'),
        iv: rand.iv.toString('utf8'),
        s: rand.s.toString('utf8')
      });

      if(cb){ try{ cb(r) }catch(e){console.log(e)} }
      return r;
    } catch(e) { 
      SEA.err = e;
      if(cb){ cb() }
      return;
    }}

    module.exports = SEA.encrypt;
  