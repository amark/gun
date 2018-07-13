
    // TODO: This needs to be split into all separate functions.
    // Not just everything thrown into 'create'.

    const SEA = require('./sea')
    const User = require('./user')
    const authRecall = require('./recall')
    const authsettings = require('./settings')
    const authenticate = require('./authenticate')
    const finalizeLogin = require('./login')
    const authLeave = require('./leave')
    const _initial_authsettings = require('./settings').recall
    const Gun = SEA.Gun;

    var u;
    // Well first we have to actually create a user. That is what this function does.
    User.prototype.create = function(username, pass, cb){
      // TODO: Needs to be cleaned up!!!
      const gunRoot = this.back(-1)
      var gun = this, cat = (gun._);
      cb = cb || function(){};
      if(cat.ing){
        cb({err: Gun.log("User is already being created or authenticated!"), wait: true});
        return gun;
      }
      cat.ing = true;
      var resolve = function(){}, reject = resolve;
      // Because more than 1 user might have the same username, we treat the alias as a list of those users.
      if(cb){ resolve = reject = cb }
      gunRoot.get('~@'+username).get(async (at, ev) => {
        ev.off()
        if (at.put) {
          // If we can enforce that a user name is already taken, it might be nice to try, but this is not guaranteed.
          const err = 'User already created!'
          Gun.log(err)
          cat.ing = false;
          gun.leave();
          return reject({ err: err })
        }
        const salt = Gun.text.random(64)
        // pseudo-randomly create a salt, then use CryptoJS's PBKDF2 function to extend the password with it.
        try {
          const proof = await SEA.work(pass, salt)
          // this will take some short amount of time to produce a proof, which slows brute force attacks.
          const pairs = await SEA.pair()
          // now we have generated a brand new ECDSA key pair for the user account.
          const pub = pairs.pub
          const priv = pairs.priv
          const epriv = pairs.epriv
          // the user's public key doesn't need to be signed. But everything else needs to be signed with it!
          const alias = await SEA.sign(username, pairs)
          if(u === alias){ throw SEA.err }
          const epub = await SEA.sign(pairs.epub, pairs)
          if(u === epub){ throw SEA.err }
          // to keep the private key safe, we AES encrypt it with the proof of work!
          const auth = await SEA.encrypt({ priv: priv, epriv: epriv }, proof)
          .then((auth) => // TODO: So signedsalt isn't needed?
          // SEA.sign(salt, pairs).then((signedsalt) =>
            SEA.sign({ek: auth, s: salt}, pairs)
          // )
          ).catch((e) => { Gun.log('SEA.en or SEA.write calls failed!'); cat.ing = false; gun.leave(); reject(e) })
          const user = { alias: alias, pub: pub, epub: epub, auth: auth }
          const tmp = '~'+pairs.pub;
          // awesome, now we can actually save the user with their public key as their ID.
          try{

          gunRoot.get(tmp).put(user)
        }catch(e){console.log(e)}
          // next up, we want to associate the alias with the public key. So we add it to the alias list.
          gunRoot.get('~@'+username).put(Gun.obj.put({}, tmp, Gun.val.link.ify(tmp)))
          // callback that the user has been created. (Note: ok = 0 because we didn't wait for disk to ack)
          setTimeout(() => { cat.ing = false; resolve({ ok: 0, pub: pairs.pub}) }, 10) // TODO: BUG! If `.auth` happens synchronously after `create` finishes, auth won't work. This setTimeout is a temporary hack until we can properly fix it.
        } catch (e) {
          Gun.log('SEA.create failed!')
          cat.ing = false;
          gun.leave();
          reject(e)
        }
      })
      return gun;  // gun chain commands must return gun chains!
    }
    // now that we have created a user, we want to authenticate them!
    User.prototype.auth = function(alias, pass, cb, opt){
      // TODO: Needs to be cleaned up!!!!
      const opts = opt || (typeof cb !== 'function' && cb)
      let pin = opts && opts.pin
      let newpass = opts && opts.newpass
      const gunRoot = this.back(-1)
      cb = typeof cb === 'function' ? cb : () => {}
      newpass = newpass || (opts||{}).change;
      var gun = this, cat = (gun._);
      if(cat.ing){
        cb({err: "User is already being created or authenticated!", wait: true});
        return gun;
      }
      cat.ing = true;

      if (!pass && pin) { (async function(){
        try {
          var r = await authRecall(gunRoot, { alias: alias, pin: pin })
          return cat.ing = false, cb(r), gun;
        } catch (e) {
          var err = { err: 'Auth attempt failed! Reason: No session data for alias & PIN' }
          return cat.ing = false, gun.leave(), cb(err), gun;
        }}())
        return gun;
      }

      const putErr = (msg) => (e) => {
        const { message, err = message || '' } = e
        Gun.log(msg)
        var error = { err: msg+' Reason: '+err }
        return cat.ing = false, gun.leave(), cb(error), gun;
      }

      (async function(){ try {
        const keys = await authenticate(alias, pass, gunRoot)
        if (!keys) {
          return putErr('Auth attempt failed!')({ message: 'No keys' })
        }
        const pub = keys.pub
        const priv = keys.priv
        const epub = keys.epub
        const epriv = keys.epriv
        // we're logged in!
        if (newpass) {
          // password update so encrypt private key using new pwd + salt
          try {
            const salt = Gun.text.random(64);
            const encSigAuth = await SEA.work(newpass, salt)
            .then((key) =>
              SEA.encrypt({ priv: priv, epriv: epriv }, key)
              .then((auth) => SEA.sign({ek: auth, s: salt}, keys))
            )
            const signedEpub = await SEA.sign(epub, keys)
            const signedAlias = await SEA.sign(alias, keys)
            const user = {
              pub: pub,
              alias: signedAlias,
              auth: encSigAuth,
              epub: signedEpub
            }
            // awesome, now we can update the user using public key ID.
            gunRoot.get('~'+user.pub).put(user)
            // then we're done
            const login = finalizeLogin(alias, keys, gunRoot, { pin })
            login.catch(putErr('Failed to finalize login with new password!'))
            return cat.ing = false, cb(await login), gun
          } catch (e) {
            return putErr('Password set attempt failed!')(e)
          }
        } else {
          const login = finalizeLogin(alias, keys, gunRoot, { pin: pin })
          login.catch(putErr('Finalizing login failed!'))
          return cat.ing = false, cb(await login), gun;
        }
      } catch (e) {
        return putErr('Auth attempt failed!')(e)
      } }());
      return gun;
    }
    User.prototype.pair = function(){
      var user = this;
      if(!user.is){ return false }
      return user._.sea;
    }
    User.prototype.leave = async function(){
      return await authLeave(this.back(-1))
    }
    // If authenticated user wants to delete his/her account, let's support it!
    User.prototype.delete = async function(alias, pass){
      const gunRoot = this.back(-1)
      try {
        const __gky40 = await authenticate(alias, pass, gunRoot)
        const pub = __gky40.pub
        await authLeave(gunRoot, alias)
        // Delete user data
        gunRoot.get('~'+pub).put(null)
        // Wipe user data from memory
        const { user = { _: {} } } = gunRoot._;
        // TODO: is this correct way to 'logout' user from Gun.User ?
        [ 'alias', 'sea', 'pub' ].map((key) => delete user._[key])
        user._.is = user.is = {}
        gunRoot.user()
        return { ok: 0 }  // TODO: proper return codes???
      } catch (e) {
        Gun.log('User.delete failed! Error:', e)
        throw e // TODO: proper error codes???
      }
    }
    // If authentication is to be remembered over reloads or browser closing,
    // set validity time in minutes.
    User.prototype.recall = async function(setvalidity, options){ 
      const gunRoot = this.back(-1)

      let validity
      let opts
      
      var o = setvalidity;
      if(o && o.sessionStorage){
        if(typeof window !== 'undefined'){
          var tmp = window.sessionStorage;
          if(tmp){
            gunRoot._.opt.remember = true;
            if(tmp.alias && tmp.tmp){
              gunRoot.user().auth(tmp.alias, tmp.tmp);
            }
          }
        }
        return this;
      }

      if (!Gun.val.is(setvalidity)) {
        opts = setvalidity
        validity = _initial_authsettings.validity
      } else {
        opts = options
        validity = setvalidity * 60 // minutes to seconds
      }

      try {
        // opts = { hook: function({ iat, exp, alias, proof }) }
        // iat == Date.now() when issued, exp == seconds to expire from iat
        // How this works:
        // called when app bootstraps, with wanted options
        // IF authsettings.validity === 0 THEN no remember-me, ever
        // IF PIN then signed 'remember' to window.sessionStorage and 'auth' to IndexedDB
        authsettings.validity = typeof validity !== 'undefined'
        ? validity : _initial_authsettings.validity
        authsettings.hook = (Gun.obj.has(opts, 'hook') && typeof opts.hook === 'function')
        ? opts.hook : _initial_authsettings.hook
        // All is good. Should we do something more with actual recalled data?
        return await authRecall(gunRoot)
      } catch (e) {
        const err = 'No session!'
        Gun.log(err)
        // NOTE! It's fine to resolve recall with reason why not successful
        // instead of rejecting...
        return { err: (e && e.err) || err }
      }
    }
    User.prototype.alive = async function(){
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
    }
    User.prototype.grant = function(to, cb){
      console.log("`.grant` API MAY BE DELETED OR CHANGED OR RENAMED, DO NOT USE!");
      var gun = this, user = gun.back(-1).user(), pair = user.pair(), path = '';
      gun.back(function(at){ if(at.pub){ return } path += (at.get||'') });
      (async function(){
      var enc, sec = await user.get('trust').get(pair.pub).get(path).then();
      sec = await SEA.decrypt(sec, pair);
      if(!sec){
        sec = SEA.random(16).toString();
        enc = await SEA.encrypt(sec, pair);
        user.get('trust').get(pair.pub).get(path).put(enc);
      }
      var pub = to.get('pub').then();
      var epub = to.get('epub').then();
      pub = await pub; epub = await epub;
      var dh = await SEA.secret(epub, pair);
      enc = await SEA.encrypt(sec, dh);
      user.get('trust').get(pub).get(path).put(enc, cb);
      }());
      return gun;
    }
    User.prototype.secret = function(data, cb){
      console.log("`.secret` API MAY BE DELETED OR CHANGED OR RENAMED, DO NOT USE!");
      var gun = this, user = gun.back(-1).user(), pair = user.pair(), path = '';
      gun.back(function(at){ if(at.pub){ return } path += (at.get||'') });
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
    module.exports = User
  