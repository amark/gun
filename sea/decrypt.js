
    var SEA = require('./root');
    var shim = require('./shim');
    var S = require('./settings');
    var aescbckey = require('./aescbc');
    var parse = require('./parse');

    SEA.decrypt = async (data, pair, cb) => { try {
      const key = pair.epriv || pair;
      const json = parse(data)
      const ct = await aescbckey(key, shim.Buffer.from(json.s, 'utf8'))
      .then((aes) => shim.subtle.decrypt({  // Keeping aesKey scope as private as possible...
        name: 'AES-CBC', iv: new Uint8Array(shim.Buffer.from(json.iv, 'utf8'))
      }, aes, new Uint8Array(shim.Buffer.from(json.ct, 'utf8'))))
      const r = parse(new shim.TextDecoder('utf8').decode(ct))
      
      if(cb){ cb(r) }
      return r;
    } catch(e) { 
      SEA.err = e;
      if(cb){ cb() }
      return;
    }}

    module.exports = SEA.decrypt;
  