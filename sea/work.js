
    var SEA = require('./root');
    var shim = require('./shim');
    var S = require('./settings');
    var u;

    SEA.work = async (data, pair, cb) => { try { // used to be named `proof`
      var salt = pair.epub || pair; // epub not recommended, salt should be random!
      if(salt instanceof Function){
        cb = salt;
        salt = u;
      }
      salt = salt || shim.random(9);
      if (SEA.window) {
        // For browser subtle works fine
        const key = await shim.subtle.importKey(
          'raw', new shim.TextEncoder().encode(data), { name: 'PBKDF2' }, false, ['deriveBits']
        )
        const result = await shim.subtle.deriveBits({
          name: 'PBKDF2',
          iterations: S.pbkdf2.iter,
          salt: new shim.TextEncoder().encode(salt),
          hash: S.pbkdf2.hash,
        }, key, S.pbkdf2.ks * 8)
        data = shim.random(data.length)  // Erase data in case of passphrase
        const r = shim.Buffer.from(result, 'binary').toString('utf8')
        if(cb){ cb(r) }
        return r;
      }
      // For NodeJS crypto.pkdf2 rocks
      const hash = crypto.pbkdf2Sync(
        data,
        new shim.TextEncoder().encode(salt),
        S.pbkdf2.iter,
        S.pbkdf2.ks,
        S.pbkdf2.hash.replace('-', '').toLowerCase()
      )
      data = shim.random(data.length)  // Erase passphrase for app
      const r = hash && hash.toString('utf8')
      if(cb){ cb(r) }
      return r;
    } catch(e) { 
      SEA.err = e;
      if(cb){ cb() }
      return;
    }}

    module.exports = SEA.work;
  