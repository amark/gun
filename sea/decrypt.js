
    var SEA = require('./root');
    var shim = require('./shim');
    var S = require('./settings');
    var aeskey = require('./aeskey');
    var parse = require('./parse');

    SEA.decrypt = SEA.decrypt || (async (data, pair, cb, opt) => { try {
      opt = opt || {};
      var key = (pair||opt).epriv || pair;
      if(!key){
        pair = await SEA.I(null, {what: data, how: 'decrypt', why: opt.why});
        key = pair.epriv || pair;
      }
      const json = parse(data)

      var buf; try{buf = shim.Buffer.from(json.s, opt.encode || 'base64') // NEW DEFAULT!
      }catch(e){buf = shim.Buffer.from(json.s, 'utf8')} // AUTO BACKWARD OLD UTF8 DATA!
      var bufiv; try{bufiv = shim.Buffer.from(json.iv, opt.encode || 'base64') // NEW DEFAULT!
      }catch(e){bufiv = shim.Buffer.from(json.iv, 'utf8')} // AUTO BACKWARD OLD UTF8 DATA!
      var bufct; try{bufct = shim.Buffer.from(json.ct, opt.encode || 'base64') // NEW DEFAULT!
      }catch(e){bufct = shim.Buffer.from(json.ct, 'utf8')} // AUTO BACKWARD OLD UTF8 DATA!

      const ct = await aeskey(key, buf, opt)
      .then((aes) => (/*shim.ossl ||*/ shim.subtle).decrypt({  // Keeping aesKey scope as private as possible...
        name: opt.name || 'AES-GCM', iv: new Uint8Array(bufiv)
      }, aes, new Uint8Array(bufct)))
      const r = parse(new shim.TextDecoder('utf8').decode(ct))
      if(cb){ try{ cb(r) }catch(e){console.log(e)} }
      return r;
    } catch(e) { 
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    module.exports = SEA.decrypt;
  