
     // How does it work?
    // TODO: Bug! Need to include SEA!
    const Gun = (typeof window !== 'undefined' ? window : global).Gun || require('gun/gun')
    var SEA = require('./sea');
    var authRecall = require('./recall');
    var authenticate = require('./authenticate');
    var finalizeLogin = require('./login');
    var authLeave = require('./leave');
    // let's extend the gun chain with a `user` function.
    // only one user can be logged in at a time, per gun instance.
    Gun.chain.user = function() {
      const root = this.back(-1)  // always reference the root gun instance.
      let user = root._.user || (root._.user = root.chain()); // create a user context.
      // then methods...
      [ 'create', // factory
        'auth',   // login
        'leave',  // logout
        'delete', // account delete
        'recall', // existing auth boostrap
        'alive'   // keep/check auth validity
      ].map((method)=> user[method] = User[method])
      return user // return the user!
    }
    function User(){}
    // Well first we have to actually create a user. That is what this function does.
    Object.assign(User, {
      async create(username, pass, cb) {
        const root = this.back(-1)
        var gun = this, cat = (gun._);
        cb = cb || function(){};
        if(cat.ing){
          cb({err: Gun.log("User is already being created or authenticated!"), wait: true});
          return gun;
        }
        cat.ing = true;
        var p = new Promise((resolve, reject) => { // Because no Promises or async
          // Because more than 1 user might have the same username, we treat the alias as a list of those users.
          if(cb){ resolve = reject = cb }
          root.get(`alias/${username}`).get(async (at, ev) => {
            ev.off()
            if (at.put) {
              // If we can enforce that a user name is already taken, it might be nice to try, but this is not guaranteed.
              const err = 'User already created!'
              Gun.log(err)
              cat.ing = false;
              gun.leave();
              return reject({ err })
            }
            const salt = Gun.text.random(64)
            // pseudo-randomly create a salt, then use CryptoJS's PBKDF2 function to extend the password with it.
            try {
              const proof = await SEA.proof(pass, salt)
              // this will take some short amount of time to produce a proof, which slows brute force attacks.
              const pairs = await SEA.pair()
              // now we have generated a brand new ECDSA key pair for the user account.
              const { pub, priv, epriv } = pairs
              // the user's public key doesn't need to be signed. But everything else needs to be signed with it!
              const alias = await SEA.write(username, pairs)
              const epub = await SEA.write(pairs.epub, pairs)
              // to keep the private key safe, we AES encrypt it with the proof of work!
              const auth = await SEA.enc({ priv, epriv }, { pub: pairs.epub, key: proof })
              .then((auth) => // TODO: So signedsalt isn't needed?
              // SEA.write(salt, pairs).then((signedsalt) =>
                SEA.write({ salt, auth }, pairs)
              // )
              ).catch((e) => { Gun.log('SEA.en or SEA.write calls failed!'); cat.ing = false; gun.leave(); reject(e) })
              const user = { alias, pub, epub, auth }
              const tmp = `pub/${pairs.pub}`
              // awesome, now we can actually save the user with their public key as their ID.
              root.get(tmp).put(user)
              // next up, we want to associate the alias with the public key. So we add it to the alias list.
              root.get(`alias/${username}`).put(Gun.obj.put({}, tmp, Gun.val.rel.ify(tmp)))
              // callback that the user has been created. (Note: ok = 0 because we didn't wait for disk to ack)
              setTimeout(() => { cat.ing = false; resolve({ ok: 0, pub: pairs.pub}) }, 10) // TODO: BUG! If `.auth` happens synchronously after `create` finishes, auth won't work. This setTimeout is a temporary hack until we can properly fix it.
            } catch (e) {
              Gun.log('SEA.create failed!')
              cat.ing = false;
              gun.leave();
              reject(e)
            }
          })
        })
        return gun; // gun chain commands must return gun chains!
      },
      // now that we have created a user, we want to authenticate them!
      async auth(alias, pass, cb, opts) {
        if(cb && !(cb instanceof Function)){ opts = cb; cb = function(){} }
        const { pin, newpass } = opts || {}
        const root = this.back(-1)
        cb = cb || function(){};

        var gun = this, cat = (gun._);
        if(cat.ing){
          cb({err: "User is already being created or authenticated!", wait: true});
          return gun;
        }
        cat.ing = true;

        if (!pass && pin) {
          try {
            var r = await authRecall(root, { alias, pin })
            return cat.ing = false, cb(r), gun;
          } catch (e) {
            var err = { err: 'Auth attempt failed! Reason: No session data for alias & PIN' }
            return cat.ing = false, gun.leave(), cb(err), gun;
          }
        }

        const putErr = (msg) => (e) => {
          const { message, err = message || '' } = e
          Gun.log(msg)
          var error = { err: `${msg} Reason: ${err}` }
          return cat.ing = false, gun.leave(), cb(error), gun;
        }

        try {
          const keys = await authenticate(alias, pass, root)
          if (!keys) {
            return putErr('Auth attempt failed!')({ message: 'No keys' })
          }
          const { pub, priv, epub, epriv } = keys
          // we're logged in!
          if (newpass) {
            // password update so encrypt private key using new pwd + salt
            try {
              const salt = Gun.text.random(64)
              const encSigAuth = await SEA.proof(newpass, salt)
              .then((key) =>
                SEA.enc({ priv, epriv }, { pub, key, set: true })
                .then((auth) => SEA.write({ salt, auth }, keys))
              )
              const signedEpub = await SEA.write(epub, keys)
              const signedAlias = await SEA.write(alias, keys)
              const user = {
                pub,
                alias: signedAlias,
                auth: encSigAuth,
                epub: signedEpub
              }
              // awesome, now we can update the user using public key ID.
              root.get(`pub/${user.pub}`).put(user)
              // then we're done
              var login = finalizeLogin(alias, keys, root, { pin })
              login.catch(putErr('Failed to finalize login with new password!'))
              return cat.ing = false, cb(login), gun;
            } catch (e) {
              return putErr('Password set attempt failed!')(e)
            }
          } else {
            var login = finalizeLogin(alias, keys, root, { pin })
            login.catch(putErr('Finalizing login failed!'))
            return cat.ing = false, cb(login), gun;
          }
        } catch (e) {
          return putErr('Auth attempt failed!')(e)
        }
        return gun;
      },
      async leave() {
        return await authLeave(this.back(-1))
      },
      // If authenticated user wants to delete his/her account, let's support it!
      async delete(alias, pass) {
        const root = this.back(-1)
        try {
          const { pub } = await authenticate(alias, pass, root)
          await authLeave(root, alias)
          // Delete user data
          root.get(`pub/${pub}`).put(null)
          // Wipe user data from memory
          const { user = { _: {} } } = root._;
          // TODO: is this correct way to 'logout' user from Gun.User ?
          [ 'alias', 'sea', 'pub' ].map((key) => delete user._[key])
          user._.is = user.is = {}
          root.user()
          return { ok: 0 }  // TODO: proper return codes???
        } catch (e) {
          Gun.log('User.delete failed! Error:', e)
          throw e // TODO: proper error codes???
        }
      },
      // If authentication is to be remembered over reloads or browser closing,
      // set validity time in minutes.
      async recall(setvalidity, options) {
        const root = this.back(-1)

        let validity
        let opts

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
          return await authRecall(root)
        } catch (e) {
          const err = 'No session!'
          Gun.log(err)
          // NOTE! It's fine to resolve recall with reason why not successful
          // instead of rejecting...
          return { err: (e && e.err) || err }
        }
      },
      async alive() {
        const root = this.back(-1)
        try {
          // All is good. Should we do something more with actual recalled data?
          await authRecall(root)
          return root._.user._
        } catch (e) {
          const err = 'No session!'
          Gun.log(err)
          throw { err }
        }
      }
    })
    Gun.chain.trust = function(user) {
      // TODO: BUG!!! SEA `node` read listener needs to be async, which means core needs to be async too.
      //gun.get('alice').get('age').trust(bob);
      if (Gun.is(user)) {
        user.get('pub').get((ctx, ev) => {
          console.log(ctx, ev)
        })
      }
    }

    module.exports = User;
  