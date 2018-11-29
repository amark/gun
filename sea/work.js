
    var SEA = require('./root');
    var shim = require('./shim');
    var S = require('./settings');
    var sha = require('./sha256');
    var u;

    SEA.work = SEA.work || (async (data, pair, cb, opt) => { try { // used to be named `proof`
      var salt = (pair||{}).epub || pair; // epub not recommended, salt should be random!
      var opt = opt || {};
      if(salt instanceof Function){
        cb = salt;
        salt = u;
      }
      salt = salt || shim.random(9);
      if('SHA-256' === opt.name){
        var rsha = shim.Buffer.from(await sha(data), 'binary').toString('utf8')
        if(cb){ try{ cb(rsha) }catch(e){console.log(e)} }
        return rsha;
      }
      const key = await (shim.ossl || shim.subtle).importKey(
        'raw', new shim.TextEncoder().encode(data), { name: opt.name || 'PBKDF2' }, false, ['deriveBits']
      )
      const result = await (shim.ossl || shim.subtle).deriveBits({
        name: opt.name || 'PBKDF2',
        iterations: opt.iterations || S.pbkdf2.iter,
        salt: new shim.TextEncoder().encode(opt.salt || salt),
        hash: opt.hash || S.pbkdf2.hash,
      }, key, opt.length || (S.pbkdf2.ks * 8))
      data = shim.random(data.length)  // Erase data in case of passphrase
      const r = shim.Buffer.from(result, 'binary').toString('utf8')
      if(cb){ try{ cb(r) }catch(e){console.log(e)} }
      return r;
    } catch(e) { 
      SEA.err = e;
      if(cb){ cb() }
      return;
    }});

    module.exports = SEA.work;
  