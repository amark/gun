
    // TODO: This needs to be split into all separate functions.
    // Not just everything thrown into 'create'.

    var SEA = require('./sea');
    var User = require('./user');
    var authsettings = require('./settings');
    var Gun = SEA.Gun;

    var noop = function(){};

    // Well first we have to actually create a user. That is what this function does.
    User.prototype.create = function(alias, pass, cb, opt){
      var gun = this, cat = (gun._), root = gun.back(-1);
      cb = cb || noop;
      if(cat.ing){
        cb({err: Gun.log("User is already being created or authenticated!"), wait: true});
        return gun;
      }
      cat.ing = true;
      opt = opt || {};
      var act = {}, u;
      act.a = function(pubs){
        act.pubs = pubs;
        if(pubs && !opt.already){
          // If we can enforce that a user name is already taken, it might be nice to try, but this is not guaranteed.
          var ack = {err: Gun.log('User already created!')};
          cat.ing = false;
          cb(ack);
          gun.leave();
          return;
        }
        act.salt = Gun.text.random(64); // pseudo-randomly create a salt, then use PBKDF2 function to extend the password with it.
        SEA.work(pass, act.salt, act.b); // this will take some short amount of time to produce a proof, which slows brute force attacks.
      }
      act.b = function(proof){
        act.proof = proof;
        SEA.pair(act.c); // now we have generated a brand new ECDSA key pair for the user account.
      }
      act.c = function(pair){ var tmp;
        act.pair = pair || {};
        if(tmp = cat.root.user){
          tmp._.sea = pair;
          tmp.is = {pub: pair.pub, epub: pair.epub, alias: alias};
        }
        // the user's public key doesn't need to be signed. But everything else needs to be signed with it! // we have now automated it! clean up these extra steps now!
        act.data = {pub: pair.pub};
        act.d();
      }
      act.d = function(){
        act.data.alias = alias;
        act.e();
      }
      act.e = function(){
        act.data.epub = act.pair.epub; 
        SEA.encrypt({priv: act.pair.priv, epriv: act.pair.epriv}, act.proof, act.f, {raw:1}); // to keep the private key safe, we AES encrypt it with the proof of work!
      }
      act.f = function(auth){
        act.data.auth = JSON.stringify({ek: auth, s: act.salt}); 
        act.g(act.data.auth);
      }
      act.g = function(auth){ var tmp;
        act.data.auth = act.data.auth || auth;
        root.get(tmp = '~'+act.pair.pub).put(act.data); // awesome, now we can actually save the user with their public key as their ID.
        root.get('~@'+alias).put(Gun.obj.put({}, tmp, Gun.val.link.ify(tmp))); // next up, we want to associate the alias with the public key. So we add it to the alias list.
        setTimeout(function(){ // we should be able to delete this now, right?
        cat.ing = false;
        cb({ok: 0, pub: act.pair.pub}); // callback that the user has been created. (Note: ok = 0 because we didn't wait for disk to ack)
        if(noop === cb){ gun.auth(alias, pass) } // if no callback is passed, auto-login after signing up.
        },10);
      }
      root.get('~@'+alias).then(act.a);
      return gun;
    }
    // now that we have created a user, we want to authenticate them!
    User.prototype.auth = function(){
      const alias = typeof arguments[0] === 'string' ? arguments[0] : null
      const pass = alias && typeof arguments[1] === 'string' ? arguments[1] : null
      const pair = typeof arguments[0] === 'object' && (arguments[0].pub || arguments[0].epub) ? arguments[0] : typeof arguments[1] === 'object' && (arguments[1].pub || arguments[1].epub) ? arguments[1] : null
      const cb = Array.prototype.slice.call(arguments).filter(arg => typeof arg === 'function')[0] || function(){} // cb now can stand anywhere, after alias/pass or pair
      const opt = arguments && arguments.length > 1 && typeof arguments[arguments.length-1] === 'object' ? arguments[arguments.length-1] : {} // opt is always the last parameter which typeof === 'object' and stands after cb
      
      var gun = this, cat = (gun._), root = gun.back(-1);
      
      if(cat.ing){
        cb({err: Gun.log("User is already being created or authenticated!"), wait: true});
        return gun;
      }
      cat.ing = true;
      
      var act = {}, u;
      act.a = function(data){
        if(!data){ return act.b() }
        if(!data.pub){
          var tmp = [];
          Gun.node.is(data, function(v){ tmp.push(v) })
          return act.b(tmp);
        }
        if(act.name){ return act.f(data) }
        act.c((act.data = data).auth);
      }
      act.b = function(list){
        var get = (act.list = (act.list||[]).concat(list||[])).shift();
        if(u === get){
          if(act.name){ return act.err('Your user account is not published for dApps to access, please consider syncing it online, or allowing local access by adding your device as a peer.') }
          return act.err('Wrong user or password.') 
        }
        root.get(get).then(act.a);
      }
      act.c = function(auth){
        if(u === auth){ return act.b() }
        if(Gun.text.is(auth)){ return act.c(Gun.obj.ify(auth)) } // in case of legacy
        SEA.work(pass, (act.auth = auth).s, act.d, act.enc); // the proof of work is evidence that we've spent some time/effort trying to log in, this slows brute force.
      }
      act.d = function(proof){
        SEA.decrypt(act.auth.ek, proof, act.e, act.enc);
      }
      act.e = function(half){
        if(u === half){
          if(!act.enc){ // try old format
            act.enc = {encode: 'utf8'};
            return act.c(act.auth);
          } act.enc = null; // end backwards
          return act.b();
        }
        act.half = half;
        act.f(act.data);
      }
      act.f = function(data){
        if(!data || !data.pub){ return act.b() }
        var tmp = act.half || {};
        act.g({pub: data.pub, epub: data.epub, priv: tmp.priv, epriv: tmp.epriv});
      }
      act.g = function(pair){
        act.pair = pair;
        var user = (root._).user, at = (user._);
        var tmp = at.tag;
        var upt = at.opt;
        at = user._ = root.get('~'+pair.pub)._;
        at.opt = upt;
        // add our credentials in-memory only to our root user instance
        user.is = {pub: pair.pub, epub: pair.epub, alias: alias};
        at.sea = act.pair;
        cat.ing = false;
        try{if(pass && !Gun.obj.has(Gun.obj.ify(cat.root.graph['~'+pair.pub].auth), ':')){ opt.shuffle = opt.change = pass; } }catch(e){} // migrate UTF8 & Shuffle!
        opt.change? act.z() : cb(at);
        if(SEA.window && ((gun.back('user')._).opt||opt).remember){
          // TODO: this needs to be modular.
          try{var sS = {};
          sS = window.sessionStorage;
          sS.recall = true;
          sS.pair = JSON.stringify(pair); // auth using pair is more reliable than alias/pass
          }catch(e){}
        }
        try{
          (root._).on('auth', at) // TODO: Deprecate this, emit on user instead! Update docs when you do.
          //at.on('auth', at) // Arrgh, this doesn't work without event "merge" code, but "merge" code causes stack overflow and crashes after logging in & trying to write data.
        }catch(e){
          Gun.log("Your 'auth' callback crashed with:", e);
        }
      }
      act.z = function(){
        // password update so encrypt private key using new pwd + salt
        act.salt = Gun.text.random(64); // pseudo-random
        SEA.work(opt.change, act.salt, act.y);
      }
      act.y = function(proof){
        SEA.encrypt({priv: act.pair.priv, epriv: act.pair.epriv}, proof, act.x, {raw:1});
      }
      act.x = function(auth){
        act.w(JSON.stringify({ek: auth, s: act.salt}));
      }
      act.w = function(auth){
        if(opt.shuffle){ // delete in future!
          console.log('migrate core account from UTF8 & shuffle');
          var tmp = Gun.obj.to(act.data);
          Gun.obj.del(tmp, '_');
          tmp.auth = auth;
          root.get('~'+act.pair.pub).put(tmp);
        } // end delete
        root.get('~'+act.pair.pub).get('auth').put(auth, cb);
      }
      act.err = function(e){
        var ack = {err: Gun.log(e || 'User cannot be found!')};
        cat.ing = false;
        cb(ack);
      }
      act.plugin = function(name){
        if(!(act.name = name)){ return act.err() }
        var tmp = [name];
        if('~' !== name[0]){
          tmp[1] = '~'+name;
          tmp[2] = '~@'+name;
        }
        act.b(tmp);
      }
      if(pair){
        act.g(pair);
      } else
      if(alias){
        root.get('~@'+alias).then(act.a);
      } else
      if(!alias && !pass){
        SEA.name(act.plugin);
      }
      return gun;
    }
    User.prototype.pair = function(){
      console.log("user.pair() IS DEPRECATED AND WILL BE DELETED!!!");
      var user = this;
      if(!user.is){ return false }
      return user._.sea;
    }
    User.prototype.leave = function(opt, cb){
      var gun = this, user = (gun.back(-1)._).user;
      if(user){
        delete user.is;
        delete user._.is;
        delete user._.sea;
      }
      if(SEA.window){
        try{var sS = {};
        sS = window.sessionStorage;
        delete sS.recall;
        delete sS.pair;
        }catch(e){};
      }
      return gun;
    }
    // If authenticated user wants to delete his/her account, let's support it!
    User.prototype.delete = async function(alias, pass, cb){
      console.log("user.delete() IS DEPRECATED AND WILL BE MOVED TO A MODULE!!!");
      var gun = this, root = gun.back(-1), user = gun.back('user');
      try {
        user.auth(alias, pass, function(ack){
          var pub = (user.is||{}).pub;
          // Delete user data
          user.map().once(function(){ this.put(null) });
          // Wipe user data from memory
          user.leave();
          (cb || noop)({ok: 0});
        });
      } catch (e) {
        Gun.log('User.delete failed! Error:', e);
      }
      return gun;
    }
    User.prototype.recall = function(opt, cb){
      var gun = this, root = gun.back(-1);
      opt = opt || {};
      if(opt && opt.sessionStorage){
        if(SEA.window){
          try{var sS = {};
          sS = window.sessionStorage;
          if(sS){
            (root._).opt.remember = true;
            ((gun.back('user')._).opt||opt).remember = true;
            if(sS.recall || sS.pair){
              root.user().auth(JSON.parse(sS.pair), cb); // pair is more reliable than alias/pass
            }
          }
          }catch(e){}
        }
        return gun;
      }
      /*
        TODO: copy mhelander's expiry code back in.
        Although, we should check with community,
        should expiry be core or a plugin?
      */
      return gun;
    }
    User.prototype.alive = async function(){
      console.log("user.alive() IS DEPRECATED!!!");
      const gunRoot = this.back(-1)
      try {
        // All is good. Should we do something more with actual recalled data?
        await authRecall(gunRoot)
        return gunRoot._.user._
      } catch (e) {
        const err = 'No session!'
        Gun.log(err)
        throw { err }
      }
    }
    User.prototype.trust = async function(user){
      // TODO: BUG!!! SEA `node` read listener needs to be async, which means core needs to be async too.
      //gun.get('alice').get('age').trust(bob);
      if (Gun.is(user)) {
        user.get('pub').get((ctx, ev) => {
          console.log(ctx, ev)
        })
      }
      user.get('trust').get(path).put(theirPubkey);

      // do a lookup on this gun chain directly (that gets bob's copy of the data)
      // do a lookup on the metadata trust table for this path (that gets all the pubkeys allowed to write on this path)
      // do a lookup on each of those pubKeys ON the path (to get the collab data "layers")
      // THEN you perform Jachen's mix operation
      // and return the result of that to...
    }
    User.prototype.grant = function(to, cb){
      console.log("`.grant` API MAY BE DELETED OR CHANGED OR RENAMED, DO NOT USE!");
      var gun = this, user = gun.back(-1).user(), pair = user._.sea, path = '';
      gun.back(function(at){ if(at.is){ return } path += (at.get||'') });
      (async function(){
      var enc, sec = await user.get('grant').get(pair.pub).get(path).then();
      sec = await SEA.decrypt(sec, pair);
      if(!sec){
        sec = SEA.random(16).toString();
        enc = await SEA.encrypt(sec, pair);
        user.get('grant').get(pair.pub).get(path).put(enc);
      }
      var pub = to.get('pub').then();
      var epub = to.get('epub').then();
      pub = await pub; epub = await epub;
      var dh = await SEA.secret(epub, pair);
      enc = await SEA.encrypt(sec, dh);
      user.get('grant').get(pub).get(path).put(enc, cb);
      }());
      return gun;
    }
    User.prototype.secret = function(data, cb){
      console.log("`.secret` API MAY BE DELETED OR CHANGED OR RENAMED, DO NOT USE!");
      var gun = this, user = gun.back(-1).user(), pair = user.pair(), path = '';
      gun.back(function(at){ if(at.is){ return } path += (at.get||'') });
      (async function(){
      var enc, sec = await user.get('trust').get(pair.pub).get(path).then();
      sec = await SEA.decrypt(sec, pair);
      if(!sec){
        sec = SEA.random(16).toString();
        enc = await SEA.encrypt(sec, pair);
        user.get('trust').get(pair.pub).get(path).put(enc);
      }
      enc = await SEA.encrypt(data, sec);
      gun.put(enc, cb);
      }());
      return gun;
    }

    /**
     * returns the decrypted value, encrypted by secret
     * @returns {Promise<any>}
     // Mark needs to review 1st before officially supported
    User.prototype.decrypt = function(cb) {
      let gun = this,
        path = ''
      gun.back(function(at) {
        if (at.is) {
          return
        }
        path += at.get || ''
      })
      return gun
        .then(async data => {
          if (data == null) {
            return
          }
          const user = gun.back(-1).user()
          const pair = user.pair()
          let sec = await user
            .get('trust')
            .get(pair.pub)
            .get(path)
          sec = await SEA.decrypt(sec, pair)
          if (!sec) {
            return data
          }
          let decrypted = await SEA.decrypt(data, sec)
          return decrypted
        })
        .then(res => {
          cb && cb(res)
          return res
        })
    }
    */
    module.exports = User
  