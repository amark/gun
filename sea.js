/*eslint max-len: ["error", 95, { "ignoreComments": true }]*/
/*eslint semi: ["error", "always", { "omitLastInOneLineBlock": true}]*/
/*eslint object-curly-spacing: ["error", "never"]*/
/*eslint node/no-deprecated-api: [error, {ignoreModuleItems: ["new buffer.Buffer()"]}] */

;(function(){ // eslint-disable-line no-extra-semi
  /*
    Security, Encryption, and Authorization: SEA.js
  */

  // NECESSARY PRE-REQUISITE: http://gun.js.org/explainers/data/security.html

  /* THIS IS AN EARLY ALPHA!!! */

  var crypto = require('crypto');
  var ecCrypto = require('eccrypto');

  var Gun = (typeof window !== 'undefined' ? window : global).Gun || require('./gun');

  if(typeof Buffer === 'undefined'){
    var Buffer = require('buffer').Buffer;
  }

  var subtle, TextEncoder, TextDecoder, getRandomBytes;
  var localStorage, sessionStorage, indexedDB;

  if(typeof window !== 'undefined'){
    var wc = window.crypto || window.msCrypto;  // STD or M$
    subtle = wc.subtle || wc.webkitSubtle;      // STD or iSafari
    getRandomBytes = function(len){ return wc.getRandomValues(new Buffer(len)) };
    TextEncoder = window.TextEncoder;
    TextDecoder = window.TextDecoder;
    localStorage = window.localStorage;
    sessionStorage = window.sessionStorage;
    indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB
    || window.msIndexedDB || window.shimIndexedDB;
  } else {
    subtle = require('@trust/webcrypto').subtle;
    getRandomBytes = function(len){ return crypto.randomBytes(len) };
    TextEncoder = require('text-encoding').TextEncoder;
    TextDecoder = require('text-encoding').TextDecoder;
    // Let's have Storage for NodeJS / testing
    localStorage = new require('node-localstorage').LocalStorage('local');
    sessionStorage = new require('node-localstorage').LocalStorage('session');
    indexedDB = undefined;  // TODO: simulate IndexedDB in NodeJS but how?
  }

  // Encryption parameters - TODO: maybe to be changed via init?
  var pbkdf2 = {
    hash: 'SHA-256',  // Was 'SHA-1'
    iter: 50000,
    ks: 64
  };

  var _initial_authsettings = {
    validity: 12 * 60 * 60, // internally in seconds : 12 hours
    session: true,
    hook: function(props){ return props } // { iat, exp, alias, remember }
    // or return new Promise(function(resolve, reject){(resolve(props))})
  };
  // These are used to persist user's authentication "session"
  var authsettings = {
    validity: _initial_authsettings.validity,
    session: _initial_authsettings.session,
    hook: _initial_authsettings.hook
  };

  // let's extend the gun chain with a `user` function.
  // only one user can be logged in at a time, per gun instance.
  Gun.chain.user = function(){
    var root = this.back(-1); // always reference the root gun instance.
    var user = root._.user || (root._.user = root.chain()); // create a user context.
    // then methods...
    [ 'create', // factory
      'auth',   // login
      'leave',  // logout
      'delete', // account delete
      'recall', // existing auth boostrap
      'alive'   // keep/check auth validity
    ].forEach(function(method){
      user[method] = User[method];
    });
    return user; // return the user!
  };

  // Practical examples about usage found from ./test/common.js

  // This is internal func queries public key(s) for alias.
  function querygunaliases(alias,root){
    return new Promise(function(resolve, reject){
      // load all public keys associated with the username alias we want to log in with.
      root.get('alias/'+alias).get(function(rat, rev){
        rev.off();
        if(!rat.put){
          // if no user, don't do anything.
          var err = 'No user!';
          Gun.log(err);
          return reject(err);
        }
        // then figuring out all possible candidates having matching username
        var aliases = [];
        Gun.obj.map(rat.put, function(at, pub){
          // grab the account associated with this public key.
          root.get(pub).get(function(at, ev){
            if(!pub.slice || 'pub/' !== pub.slice(0,4)){ return }
            pub = pub.slice(4);
            ev.off();
            if(!at.put){ return }
            aliases.push({pub: pub, at: at});
          });
        });
        return aliases.length && resolve(aliases)
        || reject('Public key does not exist!');
      });
    });
  }

  // This is internal User authentication func.
  function authenticate(alias,pass,root){
    return new Promise(function(resolve, reject){
      // load all public keys associated with the username alias we want to log in with.
      querygunaliases(alias, root).then(function(aliases){
        // then attempt to log into each one until we find ours!
        // (if two users have the same username AND the same password... that would be bad)
        aliases.forEach(function(one, index){
          var at = one.at, pub = one.pub;
          var remaining = (aliases.length - index) > 1;
          if(!at.put){
            return !remaining && reject({err: 'Public key does not exist!'});
          }
          // attempt to PBKDF2 extend the password with the salt. (Verifying the signature gives us the plain text salt.)
          SEA.read(at.put.salt, pub).then(function(salt){
            return SEA.proof(pass, salt)
            .catch(function(e){ reject({err: 'Failed to create proof!'}) });
          }).catch(function(e){ reject({err: 'Failed to create proof!'}) })
          .then(function(proof){
            // the proof of work is evidence that we've spent some time/effort trying to log in, this slows brute force.
            SEA.read(at.put.auth, pub).then(function(auth){
              return SEA.dec(auth, {pub: pub, key: proof})
              .catch(function(e){ reject({err: 'Failed to decrypt secret!'}) });
            }).then(function(priv){
              // now we have AES decrypted the private key, from when we encrypted it with the proof at registration.
              // if we were successful, then that meanswe're logged in!
              if(priv){
                resolve({pub: pub, priv: priv, at: at, proof: proof});
              } else if(!remaining){
                reject({err: 'Public key does not exist!'});
              }
              // return remaining ? undefined // Not done yet
              // : priv ? resolve({pub: pub, priv: priv, at: at, proof: proof})
              // // Or else we failed to log in...
              // : reject({err: 'Failed to decrypt private key!'});
            }).catch(function(e){ reject({err: 'Failed read secret!'})} );
          });
        });
      }).catch(function(e){ reject({err: e}) });
    });
  }

  // This internal func finalizes User authentication
  function finalizelogin(alias,key,root,opts){
    var user = root._.user;
    // add our credentials in-memory only to our root gun instance
    user._ = key.at.gun._;
    // so that way we can use the credentials to encrypt/decrypt data
    user._.is = user.is = {};
    // that is input/output through gun (see below)
    user._.alias = alias;
    user._.sea = key.priv;
    user._.pub = key.pub;
    //console.log("authorized", user._);
    // persist authentication
    return authpersist(user._, key.proof, opts).then(function(){
      // emit an auth event, useful for page redirects and stuff.
      root._.on('auth', user._);
      // returns success with the user data credentials.
      return user._;
    });
  }

  function callOnStore(fn_, resolve_){
    var open = indexedDB.open("GunDB", 1);  // Open (or create) the database; 1 === 'version'
    open.onupgradeneeded = function(){  // Create the schema; props === current version
      var db = open.result;
      db.createObjectStore('SEA', {keyPath: 'id'});
    };
    open.onsuccess = function(){  // Start a new transaction
      var db = open.result;
      var tx = db.transaction('SEA', 'readwrite');
      var store = tx.objectStore('SEA');
      fn_(store);
      tx.oncomplete = function(){   // Close the db when the transaction is done
        db.close();
        if(typeof resolve_ === 'function'){ resolve_() }
      };
    };
  }

  function updatestorage(proof,priv,pin){
    return function(props){
      return new Promise(function(resolve, reject){
        if(!Gun.obj.has(props, 'alias')){ return resolve() }
        if(proof && Gun.obj.has(props, 'iat')){
          props.proof = proof;
          delete props.remember;  // Not stored if present

          var remember = (pin && {alias: props.alias, pin: pin}) || props;
          var encrypted = !authsettings.session && pin && props;

          return SEA.write(JSON.stringify(remember), priv).then(function(signed){
            sessionStorage.setItem('user', props.alias);
            sessionStorage.setItem('remember', signed);
            if(!encrypted){
              localStorage.removeItem('remember');
            }
            return !encrypted || SEA.enc(encrypted, pin).then(function(encrypted){
              return encrypted && SEA.write(encrypted, priv).then(function(encsig){
                localStorage.setItem('remember', encsig);
              }).catch(reject);
            }).catch(reject);
          }).then(function(){ resolve(props) })
          .catch(function(e){ reject({err: 'Session persisting failed!'}) });
        } else  {
          localStorage.removeItem('remember');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('remember');
        }
        resolve(props);
      });
    };
  }

  // This internal func persists User authentication if so configured
  function authpersist(user,proof,opts){
    // opts = { pin: 'string' }
    // authsettings.session = true // disables PIN method
    // TODO: how this works:
    // called when app bootstraps, with wanted options
    // IF authsettings.validity === 0 THEN no remember-me, ever
    // IF authsettings.session === true THEN no window.localStorage in use; nor PIN
    // ELSE if no PIN then window.sessionStorage
    var pin = Gun.obj.has(opts, 'pin') && opts.pin
    && new Buffer(opts.pin, 'utf8').toString('base64');

    if(proof && user && user.alias && authsettings.validity){
      var args = {alias: user.alias};
      args.iat = Math.ceil(Date.now() / 1000);  // seconds
      args.exp = authsettings.validity;         // seconds
      if(Gun.obj.has(opts, 'pin')){
        args.remember = true;                   // for hook - not stored
      }
      var props = authsettings.hook(args);
      if(props instanceof Promise){
        return props.then(updatestorage(proof, user.sea, pin));
      }
      return updatestorage(proof, user.sea, pin)(props);
    }
    return updatestorage()({alias: 'delete'});
  }
  // This internal func recalls persisted User authentication if so configured
  function authrecall(root,authprops){
    return new Promise(function(resolve, reject){
      var remember = authprops || sessionStorage.getItem('remember');
      var alias = Gun.obj.has(authprops, 'alias') && authprops.alias
      || sessionStorage.getItem('user');
      var pin = Gun.obj.has(authprops, 'pin')
      && new Buffer(authprops.pin, 'utf8').toString('base64');

      var checkRememberData = function(decr){
        if(Gun.obj.has(decr, 'proof')
        && Gun.obj.has(decr, 'alias') && decr.alias === alias){
          var proof = decr.proof;
          var iat = decr.iat; // No way hook to update this
          delete decr.proof;  // We're not gonna give proof to hook!
          var checkNotExpired = function(args){
            if(Math.floor(Date.now() / 1000) < (iat + args.exp)){
              args.iat = iat;
              args.proof = proof;
              return args;
            } else { Gun.log('Authentication expired!') }
          };
          var hooked = authsettings.hook(decr);
          return ((hooked instanceof Promise)
          && hooked.then(checkNotExpired)) || checkNotExpired(hooked);
        }
      };
      var readAndDecrypt = function(data, pub, key){
        return SEA.read(data, pub).then(function(encrypted){
          return SEA.dec(encrypted, key);
        }).then(function(decrypted){
          try{ return decrypted.slice ? JSON.parse(decrypted) : decrypted }catch(e){} //eslint-disable-line no-empty
          return decrypted;
        });
      };

      // Already authenticated?
      if(Gun.obj.has(root._.user._, 'pub') && Gun.obj.has(root._.user._, 'sea')){
        return resolve(root._.user._);
      }
      // No, got alias?
      if(alias && remember){
        return querygunaliases(alias, root).then(function(aliases){
          return new Promise(function(resolve, reject){
            // then attempt to log into each one until we find ours!
            // (if two users have the same username AND the same password... that would be bad)
            aliases.forEach(function(one, index){
              var at = one.at, pub = one.pub;
              var remaining = (aliases.length - index) > 1;
              if(!at.put){
                return !remaining && reject({err: 'Public key does not exist!'});
              }
              // got pub, time to try auth with alias & PIN...
              return ((pin && Promise.resolve({pin: pin, alias: alias}))
              // or just unwrap Storage data...
              || SEA.read(remember, pub, true)).then(function(props){
                try{ props = props.slice ? JSON.parse(props) : props }catch(e){}  //eslint-disable-line no-empty
                if(Gun.obj.has(props, 'pin') && Gun.obj.has(props, 'alias')
                && props.alias === alias){
                  pin = props.pin; // Got PIN so get localStorage secret if signature is ok
                  return readAndDecrypt(localStorage.getItem('remember'), pub, pin)
                  .then(checkRememberData); // And return proof if for matching alias
                }
                // No PIN, let's try short-term proof if for matching alias
                return checkRememberData(props);
              }).then(function(args){
                var proof = args && args.proof;
                if(!proof){
                  return (!args && reject({err: 'No valid authentication session found!'}))
                  || updatestorage()(args).then(function(){
                    reject({err: 'Expired session!'});
                  }).catch(function(){
                    reject({err: 'Expired session!'});
                  });
                }
                return readAndDecrypt(at.put.auth, pub, proof).catch(function(e){
                  return !remaining && reject({err: 'Failed to decrypt private key!'});
                }).then(function(priv){
                  // now we have AES decrypted the private key,
                  // if we were successful, then that means we're logged in!
                  return updatestorage(proof, priv, pin)(args).then(function(){
                    return remaining ? undefined // Not done yet
                    : priv ? resolve({pub: pub, priv: priv, at: at, proof: proof})
                    // Or else we failed to log in...
                    : reject({err: 'Failed to decrypt private key!'});
                  }).catch(function(e){ reject({err: 'Failed to store credentials!'}) });
                }).catch(function(e){ reject({err: 'Failed read secret!'}) });
              }).catch(function(e){ reject({err: 'Failed to access stored credentials!'}) });
            });
          });
        }).then(function(user){
          finalizelogin(alias, user, root).then(resolve).catch(function(e){
            Gun.log('Failed to finalize login with new password!');
            reject({
              err: 'Finalizing new password login failed! Reason: '+(e && e.err) || e || ''
            });
          });
        }).catch(function(e){
          reject({err: 'No authentication session found!'});
        });
      }
      reject({
        err: (localStorage.getItem('remember') && 'Missing PIN and alias!')
        || 'No authentication session found!'});
    });
  }

  // This internal func executes logout actions
  function authleave(root, alias){
    return function(resolve, reject){
      // remove persisted authentication
      var user = root._.user;
      alias = alias || (user._ && user._.alias);
      var doIt = function(){
        // TODO: is this correct way to 'logout' user from Gun.User ?
        [ 'alias', 'sea', 'pub' ].forEach(function(key){
          delete user._[key];
        });
        user._.is = user.is = {};
        // Let's use default
        resolve({ok: 0});
      };
      authpersist(alias && {alias: alias}).then(doIt).catch(doIt);
    };
  }
  // This recalls Web Cryptography API CryptoKeys from IndexedDB or creates & stores
  function recallCryptoKey(p,s,o){  // {pub, key}|proof, salt, optional:['sign']
    o = o || ['encrypt', 'decrypt'];  // Default operations
    var importKey = function(key){ return subtle.importKey(
      'raw',
      makeKey((Gun.obj.has(key, 'key') && key.key) || key, s || getRandomBytes(8)),
      'AES-CBC',
      false,
      o
    ); };
    return new Promise(function(resolve){
      if(authsettings.validity && Gun.obj.has(p, 'pub') && Gun.obj.has(p, 'key')){
        var importAndStoreKey = function(){ // Creates new CryptoKey & stores it
          importKey(p).then(function(key){ callOnStore(function(store){
            store.put({id: p.pub, key: key, auth: 'just testing'});
          }, function(){ resolve(key) }); });
        };
        if(Gun.obj.has(p, 'set')){ return importAndStoreKey() } // proof update so overwrite
        var aesKey;
        callOnStore(function(store) {
          var getData = store.get(p.pub);
          getData.onsuccess = function(){ aesKey = getData.result && getData.result.key };
        }, function(){ return aesKey ? resolve(aesKey) : importAndStoreKey() });
      } else { // No secure store usage
        importKey(p).then(function(aesKey){ resolve(aesKey) });
      }
    });
  }
  // Takes data (defaults as Buffer) and returns 'md5' hash
  function hashData(data,intype,outtype){
    return crypto.createHash(outtype || 'md5').update(data, intype).digest();
  }

  // This internal func returns hashed data for signing
  function nodehash(m){
    try{
      m = m.slice ? m : JSON.stringify(m);
      return hashData(m, 'utf8', nHash);
    }catch(e){ return m }
  }

  // How does it work?
  function User(){}
  // Well first we have to actually create a user. That is what this function does.
  User.create = function(alias, pass, cb){
    var root = this.back(-1);
    var doIt = function(resolve, reject){
      // Because more than 1 user might have the same username, we treat the alias as a list of those users.
      root.get('alias/'+alias).get(function(at, ev){
        ev.off();
        if(at.put){
          // If we can enforce that a user name is already taken, it might be nice to try, but this is not guaranteed.
          var err = 'User already created!';
          Gun.log(err);
          return reject({err: err});
        }
        var salt = Gun.text.random(64);
        // pseudo-randomly create a salt, then use CryptoJS's PBKDF2 function to extend the password with it.
        SEA.proof(pass, salt).then(function(proof){
          // this will take some short amount of time to produce a proof, which slows brute force attacks.
          SEA.pair().then(function(pair){
            // now we have generated a brand new ECDSA key pair for the user account.
            var user = {pub: pair.pub};
            var tmp = pair.priv;
            // the user's public key doesn't need to be signed. But everything else needs to be signed with it!
            SEA.write(alias, tmp).then(function(signedalias){
              user.alias = signedalias;
              return SEA.write(salt, tmp);
            }).then(function(signedsalt){
              user.salt = signedsalt;
              // to keep the private key safe, we AES encrypt it with the proof of work!
              return SEA.enc(tmp, {pub: pair.pub, key: proof});
            }).then(function(encryptedpriv){
              return SEA.write(encryptedpriv, tmp);
            }).then(function(encsigauth){
              user.auth = encsigauth;
              var tmp = 'pub/'+pair.pub;
              //console.log("create", user, pair.pub);
              // awesome, now we can actually save the user with their public key as their ID.
              root.get(tmp).put(user);
              // next up, we want to associate the alias with the public key. So we add it to the alias list.
              root.get('alias/'+alias).put(Gun.obj.put({}, tmp, Gun.val.rel.ify(tmp)));
              // callback that the user has been created. (Note: ok = 0 because we didn't wait for disk to ack)
              resolve({ok: 0, pub: pair.pub});
            }).catch(function(e){ Gun.log('SEA.en or SEA.write calls failed!'); reject(e) });
          }).catch(function(e){ Gun.log('SEA.pair call failed!'); reject(e) });
        });
      });
    };
    if(cb){doIt(cb, cb)} else { return new Promise(doIt) }
  };
  // now that we have created a user, we want to authenticate them!
  User.auth = function(alias,pass,cb,opt){
    var opts = opt || (typeof cb !== 'function' && cb);
    var root = this.back(-1);
    cb = typeof cb === 'function' && cb;

    var doIt = function(resolve, reject){
      // TODO: !pass && opt.pin => try to recall
      // return reject({err: 'Auth attempt failed! Reason: No session data for alias & PIN'});
      if(!pass && Gun.obj.has(opts, 'pin')){
        return authrecall(root, {alias: alias, pin: opts.pin}).then(function(props){
          resolve(props);
        }).catch(function(e){
          reject({err: 'Auth attempt failed! Reason: No session data for alias & PIN'});
        });
      }

      authenticate(alias, pass, root).then(function(key){
        // we're logged in!
        var pin = Gun.obj.has(opts, 'pin') && {pin: opts.pin};
        if(Gun.obj.has(opts, 'newpass')){
          // password update so encrypt private key using new pwd + salt
          var newsalt = Gun.text.random(64);
          SEA.proof(opts.newpass, newsalt).then(function(newproof){
            return SEA.enc(key.priv, {pub: key.pub, key: newproof, set: true})
            .then(function(encryptedpriv){
              return SEA.write(encryptedpriv, key.priv);
            });
          }).then(function(encsigauth){
            return SEA.write(newsalt, key.priv).then(function(signedsalt){
              return SEA.write(alias, key.priv).then(function(signedalias){
                return {
                  alias: signedalias,
                  salt: signedsalt,
                  auth: encsigauth,
                  pub: key.pub
                };
              });
            });
          }).then(function(user){
            var tmp = 'pub/'+user.pub;
            // awesome, now we can update the user using public key ID.
            // root.get(tmp).put(null);
            root.get(tmp).put(user);
            // then we're done
            finalizelogin(alias, key, root, pin).then(resolve).catch(function(e){
              Gun.log('Failed to finalize login with new password!');
              reject({
                err: 'Finalizing new password login failed! Reason: '+(e && e.err) || e || ''
              });
            });
          }).catch(function(e){
            Gun.log('Failed encrypt private key using new password!');
            reject({err: 'Password set attempt failed! Reason: ' + (e && e.err) || e || ''});
          });
        } else {
          finalizelogin(alias, key, root, pin).then(resolve).catch(function(e){
            Gun.log('Failed to finalize login!');
            reject({err: 'Finalizing login failed! Reason: ' + (e && e.err) || e || ''});
          });
        }
      }).catch(function(e){
        Gun.log('Failed to sign in!');
        reject({err: 'Auth attempt failed! Reason: ' + (e && e.err) || e || ''});
      });
    };
    if(cb){doIt(cb, cb)} else { return new Promise(doIt) }
  };
  Gun.chain.trust = function(user){
    // TODO: BUG!!! SEA `node` read listener needs to be async, which means core needs to be async too.
    //gun.get('alice').get('age').trust(bob);
    if(Gun.is(user)){
      user.get('pub').get(function(ctx, ev){
        console.log(ctx, ev);
      });
    }
  };
  User.leave = function(cb){
    var root = this.back(-1);
    if(cb){authleave(root)(cb, cb)} else { return new Promise(authleave(root)) }
  };
  // If authenticated user wants to delete his/her account, let's support it!
  User.delete = function(alias,pass,cb){
    var root = this.back(-1);
    var doIt = function(resolve, reject){
      authenticate(alias, pass, root).then(function(key){
        new Promise(authleave(root, alias)).catch(function(){})
        .then(function(){
          // Delete user data
          root.get('pub/'+key.pub).put(null);
          // Wipe user data from memory
          var user = root._.user;
          // TODO: is this correct way to 'logout' user from Gun.User ?
          [ 'alias', 'sea', 'pub' ].forEach(function(key){
            delete user._[key];
          });
          user._.is = user.is = {};
          resolve({ok: 0});
        }).catch(function(e){
          Gun.log('User.delete failed! Error:', e);
          reject({err: 'Delete attempt failed! Reason: ' + (e && e.err) || e || ''});
        });
      }).catch(function(e){
        Gun.log('User.delete authentication failed! Error:', e);
        reject({err: 'Delete attempt failed! Reason: ' + (e && e.err) || e || ''});
      });
    };
    if(cb){doIt(cb, cb)} else { return new Promise(doIt) }
  };
  // If authentication is to be remembered over reloads or browser closing,
  // set validity time in minutes.
  User.recall = function(v,cb,o){
    var root = this.back(-1);
    var validity, callback, opts;
    if(!o && typeof cb !== 'function' && !Gun.val.is(cb)){
      opts = cb;
    } else {
      callback = cb;
    }
    if(!callback){
      if(typeof v === 'function'){
        callback = v;
        validity = _initial_authsettings.validity;
      } else if(!Gun.val.is(v)){
        opts = v;
        validity = _initial_authsettings.validity;
      } else {
        validity = v * 60;  // minutes to seconds
      }
    }
    var doIt = function(resolve, reject){
      // opts = { hook: function({ iat, exp, alias, proof }),
      //   session: false } // true disables PIN requirement/support
      // iat == Date.now() when issued, exp == seconds to expire from iat
      // TODO: how this works:
      // called when app bootstraps, with wanted options
      // IF validity === 0 THEN no remember-me, ever
      // IF opt.session === true THEN no window.localStorage in use; nor PIN
      authsettings.validity = typeof validity !== 'undefined' ? validity
      :  _initial_authsettings.validity;
      if(Gun.obj.has(opts, 'session')){
        authsettings.session = opts.session;
      }
      authsettings.hook = (Gun.obj.has(opts, 'hook') && typeof opts.hook === 'function')
      ? opts.hook : _initial_authsettings.hook;
      // All is good. Should we do something more with actual recalled data?
      authrecall(root).then(resolve).catch(function(e){
        var err = 'No session!';
        Gun.log(err);
        resolve({err: (e && e.err) || err});
      });
    };
    if(callback){doIt(callback, callback)} else { return new Promise(doIt) }
  };
  User.alive = function(cb){
    var root = this.back(-1);
    var doIt = function(resolve, reject){
      authrecall(root).then(function(){
        // All is good. Should we do something more with actual recalled data?
        resolve(root._.user._);
      }).catch(function(e){
        var err = 'No session!';
        Gun.log(err);
        reject({err: err});
      });
    };
    if(cb){doIt(cb, cb)} else { return new Promise(doIt) }
  };

  // After we have a GUN extension to make user registration/login easy, we then need to handle everything else.

  // We do this with a GUN adapter, we first listen to when a gun instance is created (and when its options change)
  Gun.on('opt', function(at){
    if(!at.sea){ // only add SEA once per instance, on the "at" context.
      at.sea = {own: {}};
      at.on('in', security, at); // now listen to all input data, acting as a firewall.
      at.on('out', signature, at); // and output listeners, to encrypt outgoing data.
      at.on('node', each, at);
    }
    this.to.next(at); // make sure to call the "next" middleware adapter.
  });

  // Alright, this next adapter gets run at the per node level in the graph database.
  // This will let us verify that every property on a node has a value signed by a public key we trust.
  // If the signature does not match, the data is just `undefined` so it doesn't get passed on.
  // If it does match, then we transform the in-memory "view" of the data into its plain value (without the signature).
  // Now NOTE! Some data is "system" data, not user data. Example: List of public keys, aliases, etc.
  // This data is self-enforced (the value can only match its ID), but that is handled in the `security` function.
  // From the self-enforced data, we can see all the edges in the graph that belong to a public key.
  // Example: pub/ASDF is the ID of a node with ASDF as its public key, signed alias and salt, and
  // its encrypted private key, but it might also have other signed values on it like `profile = <ID>` edge.
  // Using that directed edge's ID, we can then track (in memory) which IDs belong to which keys.
  // Here is a problem: Multiple public keys can "claim" any node's ID, so this is dangerous!
  // This means we should ONLY trust our "friends" (our key ring) public keys, not any ones.
  // I have not yet added that to SEA yet in this alpha release. That is coming soon, but beware in the meanwhile!
  function each(at){ // TODO: Warning: Need to switch to `gun.on('node')`! Do not use `Gun.on('node'` in your apps!
    var own = (at.gun.back(-1)._).sea.own, soul = at.get;
    var pub = own[soul] || soul.slice(4), vertex = (at.gun._).put;
    Gun.node.is(at.put, function(val, key, node){ // for each property on the node.
      SEA.read(val, pub).then(function(data){
        vertex[key] = node[key] = val = data; // verify signature and get plain value.
        if(val && val['#'] && (key = Gun.val.rel.is(val))){ // if it is a relation / edge
          if('alias/' === soul.slice(0,6)){ return } // if it is itself
          own[key] = pub; // associate the public key with a node
        }
      });
    });
  }

  // signature handles data output, it is a proxy to the security function.
  function signature(at){
    at.user = at.gun.back(-1)._.user;
    security.call(this, at);
  }

  // okay! The security function handles all the heavy lifting.
  // It needs to deal read and write of input and output of system data, account/public key data, and regular data.
  // This is broken down into some pretty clear edge cases, let's go over them:
  function security(msg){
    var at = this.as, sea = at.sea, to = this.to;
    if(msg.get){
      // if there is a request to read data from us, then...
      var soul = msg.get['#'];
      if(soul){ // for now, only allow direct IDs to be read.
        if('alias' === soul){ // Allow reading the list of usernames/aliases in the system?
          return to.next(msg); // yes.
        } else
        if('alias/' === soul.slice(0,6)){ // Allow reading the list of public keys associated with an alias?
          return to.next(msg); // yes.
        } else { // Allow reading everything?
          return to.next(msg); // yes // TODO: No! Make this a callback/event that people can filter on.
        }
      }
    }
    if(msg.put){
      // potentially parallel async operations!!!
      var check = {}, on = Gun.on(), each = {};
      each.node = function(node, soul){
        if(Gun.obj.empty(node, '_')){ return check['node'+soul] = 0 } // ignore empty updates, don't reject them.
        Gun.obj.map(node, each.way, {soul: soul, node: node});
      };
      each.way = function(val, key){
        var soul = this.soul, node = this.node, tmp;
        if('_' === key){ return } // ignore meta data
        if('alias' === soul){  // special case for shared system data, the list of aliases.
          each.alias(val, key, node, soul);
        }
        if('alias/' === soul.slice(0,6)){ // special case for shared system data, the list of public keys for an alias.
          each.pubs(val, key, node, soul);
        }
        if('pub/' === soul.slice(0,4)){ // special case, account data for a public key.
          each.pub(val, key, node, soul, soul.slice(4));
        }
        if(at.user && (tmp = at.user._.sea)){ // not special case, if we are logged in, then
          each.user(val, key, node, soul, tmp);
        }
        if((tmp = sea.own[soul])){ // not special case, if we receive an update on an ID associated with a public key, then
          each.own(val, key, node, soul, tmp);
        }
      };
      each.alias = function(val, key, node, soul){
        if(!val){ return on.to('end', {err: "Data must exist!"}) } // data MUST exist
        if('alias/'+key !== Gun.val.rel.is(val)){ // in fact, it must be EXACTLY equal to itself
          return on.to('end', {err: "Mismatching alias."}); // if it isn't, reject.
        }
      };
      each.pubs = function(val, key, node, soul){
        if(!val){ return on.to('end', {err: "Alias must exist!"}) } // data MUST exist
        if(key === Gun.val.rel.is(val)){ return check['pubs'+soul+key] = 0 } // and the ID must be EXACTLY equal to its property
        return on.to('end', {err: "Alias must match!"}); // that way nobody can tamper with the list of public keys.
      };
      each.pub = function(val, key, node, soul, pub){
        //console.log("WE ARE HERE", key, val, soul, node, pub);
        if('pub' === key){
          if(val === pub){ return check['pub'+soul+key] = 0 } // the account MUST have a `pub` property that equals the ID of the public key.
          return on.to('end', {err: "Account must match!"});
        }
        /*
        if(at.user && at.user._){ // if we are logged in
          if(pub === at.user._.pub){ // as this user
            SEA.write(val, at.user._.sea).then(function(data){
              val = node[key] = data; // then sign our updates as we output them.
            });
          } // (if we are lying about our signature, other peer's will reject our update)
        }
        SEA.read(val, pub).then(function(data){
          if(u === (val = data)){ // make sure the signature matches the account it claims to be on.
            return no = true; // reject any updates that are signed with a mismatched account.
          }
        });
        */
      };
      each.user = function(val, key, node, soul, tmp){
        check['user'+soul+key] = 1;
        SEA.write(val, tmp, function(data){ // TODO: BUG! Convert to use imported.
          node[key] = data; // be signed by our logged in account.
          check['user'+soul+key] = 0;
          on.to('end', {ok: 1});
        });
      };
      each.own = function(val, key, node, soul, tmp){
        check['own'+soul+key] = 1;
        SEA.read(val, tmp, function(data){
          var u;
          check['own'+soul+key] = 0;
          // TODO: hopefully fixed this right, typeof u === 'undefined' thus
          // if there is signature, and data is undefined, then:
          on.to('end', {no: tmp = (u === (val = data)), err: tmp && "Signature mismatch!"});
        });
      };
      on.to('end', function(ctx){ // TODO: Can't you just switch this to each.end = cb?
        if(each.err || !each.end){ return }
        if((each.err = ctx.err) || ctx.no){
          console.log('NO!', each.err);
          return;
        }
        if(Gun.obj.map(check, function(no){
          if(no){ return true }
        })){ return }
        to.next(msg);
      });
      Gun.obj.map(msg.put, each.node);
      on.to('end', {end: each.end = true});
      return; // need to manually call next after async.
    }
    to.next(msg); // pass forward any data we do not know how to handle or process (this allows custom security protocols).
  }

  // Does enc/dec key like OpenSSL - works with CryptoJS encryption/decryption
  function makeKey(p,s){
    var ps = Buffer.concat([new Buffer(p, 'utf8'), s]);
    // TODO: 'md5' is insecure, do we need OpenSSL compatibility anymore ?
    var h128 = hashData(ps);
    return Buffer.concat([h128, hashData(Buffer.concat([h128, ps]))]);
  }

  var nHash = pbkdf2.hash.replace('-', '').toLowerCase();

  // These SEA functions support both callback AND Promises
  var SEA = {};
  // create a wrapper library around NodeJS crypto & ecCrypto and Web Crypto API.
  // now wrap the various AES, ECDSA, PBKDF2 functions we called above.
  SEA.proof = function(pass,salt,cb){
    var doIt = (typeof window !== 'undefined' && function(resolve, reject){
      subtle.importKey(  // For browser subtle works fine
        'raw', new TextEncoder().encode(pass), {name: 'PBKDF2'}, false, ['deriveBits']
      ).then(function(key){
        return subtle.deriveBits({
          name: 'PBKDF2',
          iterations: pbkdf2.iter,
          salt: new TextEncoder().encode(salt),
          hash: pbkdf2.hash,
        }, key, pbkdf2.ks*8);
      }).then(function(result){
        pass = getRandomBytes(pass.length);
        return new Buffer(result, 'binary').toString('base64');
      }).then(resolve).catch(function(e){ Gun.log(e); reject(e) });
    }) || function(resolve, reject){  // For NodeJS crypto.pkdf2 rocks
      try{
        var hash = crypto.pbkdf2Sync(
          pass, new Buffer(salt, 'utf8'), pbkdf2.iter, pbkdf2.ks, nHash
        );
        pass = getRandomBytes(pass.length);
        resolve(hash && hash.toString('base64'));
      }catch(e){ reject(e) }
    };
    if(cb){ doIt(cb, function(){cb()}) } else { return new Promise(doIt) }
  };
  SEA.pair = function(cb){
    var doIt = function(resolve, reject){
      var priv = getRandomBytes(32);
      resolve({
        pub: new Buffer(ecCrypto.getPublic(priv), 'binary').toString('hex'),
        priv: new Buffer(priv, 'binary').toString('hex')
      });
    };
    if(cb){ doIt(cb, function(){cb()}) } else { return new Promise(doIt) }
  };
  SEA.derive = function(m,p,cb){
    var doIt = function(resolve, reject){
      ecCrypto.derive(new Buffer(p, 'hex'), new Buffer(m, 'hex'))
      .then(function(secret){
        resolve(new Buffer(secret, 'binary').toString('hex'));
      }).catch(function(e){ Gun.log(e); reject(e) });
    };
    if(cb){ doIt(cb, function(){cb()}) } else { return new Promise(doIt) }
  };
  SEA.sign = function(m,p,cb){
    var doIt = function(resolve, reject){
      ecCrypto.sign(new Buffer(p, 'hex'), nodehash(m)).then(function(sig){
        resolve(new Buffer(sig, 'binary').toString('hex'));
      }).catch(function(e){Gun.log(e); reject(e)});
    };
    if(cb){ doIt(cb, function(){cb()}) } else { return new Promise(doIt) }
  };
  SEA.verify = function(m, p, s, cb){
    var doIt = function(resolve, reject){
      ecCrypto.verify(new Buffer(p, 'hex'), nodehash(m), new Buffer(s, 'hex'))
      .then(function(){ resolve(true)})
      .catch(function(e){ Gun.log(e); reject(e) });
    };
    if(cb){ doIt(cb, function(){cb()}) } else { return new Promise(doIt) }
  };
  SEA.enc = function(m,p,cb){
    var doIt = function(resolve, reject){
      var s = getRandomBytes(8);
      var iv = getRandomBytes(16);
      var r = {iv: iv.toString('hex'), s: s.toString('hex')};
      m = (m.slice && m) || JSON.stringify(m);
      recallCryptoKey(p, s).then(function(aesKey){
        subtle.encrypt({
          name: 'AES-CBC', iv: iv
        }, aesKey, new TextEncoder().encode(m)).then(function(ct){
          aesKey = getRandomBytes(32);
          r.ct = new Buffer(ct, 'binary').toString('base64');
          return JSON.stringify(r);
        }).then(resolve).catch(function(e){ Gun.log(e); reject(e) });
      }).catch(function(e){ Gun.log(e); reject(e)} );
    };
    if(cb){ doIt(cb, function(){cb()}) } else { return new Promise(doIt) }
  };
  SEA.dec = function(m,p,cb){
    var doIt = function(resolve, reject){
      try{ m = m.slice ? JSON.parse(m) : m }catch(e){}  //eslint-disable-line no-empty
      var iv = new Buffer(m.iv, 'hex');
      var s = new Buffer(m.s, 'hex');
      recallCryptoKey(p, s).then(function(aesKey){
        subtle.decrypt({
          name: 'AES-CBC', iv: iv
        }, aesKey, new Buffer(m.ct, 'base64')).then(function(ct){
          aesKey = getRandomBytes(32);
          var ctUtf8 = new TextDecoder('utf8').decode(ct);
          try{ return ctUtf8.slice ? JSON.parse(ctUtf8) : ctUtf8;
          }catch(e){ return ctUtf8 }
        }).then(resolve).catch(function(e){Gun.log(e); reject(e)});
      }).catch(function(e){Gun.log(e); reject(e)});
    };
    if(cb){ doIt(cb, function(){cb()}) } else { return new Promise(doIt) }
  };
  SEA.write = function(mm,p,cb){
    var doIt = function(resolve, reject) {
      // TODO: something's bugging double 'SEA[]' treatment to mm...
      var m = mm;
      if(mm.slice){
        // Needs to remove previous signature envelope
        while('SEA[' === m.slice(0,4)){
          try{ m = JSON.parse(m.slice(3))[0];
          }catch(e){ m = mm; break }
        }
      }
      m = m.slice ? m : JSON.stringify(m);
      SEA.sign(m, p).then(function(signature){
        resolve('SEA'+JSON.stringify([m,signature]));
      }).catch(function(e){Gun.log(e); reject(e)});
    };
    if(cb){ doIt(cb, function(){cb()}) } else { return new Promise(doIt) }
  };
  SEA.read = function(m,p,cb){
    var doIt = function(resolve, reject) {
      if(!m){ return resolve() }
      if(!m.slice || 'SEA[' !== m.slice(0,4)){ return resolve(m) }
      m = m.slice(3);
      try{ m = m.slice ? JSON.parse(m) : m;
      }catch(e){ return reject(e) }
      m = m || '';
      SEA.verify(m[0], p, m[1]).then(function(ok){
        resolve(ok && m[0]);
      }).catch(function(e){reject(e)});
    };
    if(cb && typeof cb === 'function'){
      doIt(cb, function(){cb()});
    } else { return new Promise(doIt) }
  };

  Gun.SEA = SEA;

  // all done!
  // Obviously it is missing MANY necessary features. This is only an alpha release.
  // Please experiment with it, audit what I've done so far, and complain about what needs to be added.
  // SEA should be a full suite that is easy and seamless to use.
  // Again, scroll naer the top, where I provide an EXAMPLE of how to create a user and sign in.
  // Once logged in, the rest of the code you just read handled automatically signing/validating data.
  // But all other behavior needs to be equally easy, like opinionated ways of
  // Adding friends (trusted public keys), sending private messages, etc.
  // Cheers! Tell me what you think.

  try{module.exports = SEA}catch(e){} //eslint-disable-line no-empty
}());
