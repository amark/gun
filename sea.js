;(function(){
  /*
    Security, Encryption, and Authorization: SEA.js
  */

  // NECESSARY PRE-REQUISITE: http://gun.js.org/explainers/data/security.html

  /* THIS IS AN EARLY ALPHA!!! */

  var nodeCrypto = require('crypto');
  var ecCrypto = require('eccrypto');

  var Gun = (typeof window !== 'undefined' ? window : global).Gun || require('./gun');

  var crypto, TextEncoder, TextDecoder, localStorage, sessionStorage;

  if (typeof window !== 'undefined') {
    crypto = window.crypto;
    TextEncoder = window.TextEncoder;
    TextDecoder = window.TextDecoder;
    localStorage = window.localStorage;
    sessionStorage = window.sessionStorage;
  } else {
    crypto = { subtle: require('subtle') }; // Web Cryptography API for NodeJS
    TextEncoder = require('text-encoding').TextEncoder;
    TextDecoder = require('text-encoding').TextDecoder;
    // Let's have Storage for NodeJS / testing
    localStorage = new require('node-localstorage').LocalStorage('local');
    sessionStorage = new require('node-localstorage').LocalStorage('session');
  }

  if(typeof Buffer === 'undefined'){
    var Buffer = require('buffer').Buffer;
  }

  // Encryption parameters - TODO: maybe to be changed via init?
  var pbkdf2 = {
    hash: 'SHA-256',  // Was 'SHA-1'
    iter: 50000,
    ks: 64
  };
  var ecdh = {
    enc: (typeof window !== 'undefined' && 'secp256r1') || 'prime256v1'
  };
  var aes = {
    enc: 'aes-256-cbc'
  };

  // These are used to persist user's authentication "session"
  var authsettings = {
    validity: 60 * 60 * 12,  // 12 hours
    session: true,
    hook: function(props) { return props }  // { iat, exp, alias, remember }
    // or return new Promise(function(resolve, reject){(resolve(props))})
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
  }

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
          return reject({err: err});
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
        || reject({err: 'Public key does not exist!'})
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
              return SEA.de(auth, proof)
              .catch(function(e){ reject({err: 'Failed to decrypt secret!'}) });
            }).then(function(priv){
              // now we have AES decrypted the private key, from when we encrypted it with the proof at registration.
              // if we were successful, then that meanswe're logged in!
              if(priv){
                resolve({pub: pub, priv: priv, at: at, proof: proof})
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
  };

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
      Gun.on('auth', user._);
      // returns success with the user data credentials.
      return user._;
    });
  }

  function updatestorage(proof,priv,pin){
    return function(props){
      return new Promise(function(resolve, reject){
        if(!Gun.obj.has(props, 'alias')){ return resolve() }
        if (proof && Gun.obj.has(props, 'iat')) {
          props.proof = proof;
          delete props.remember;  // Not stored if present

          var remember = (pin && {alias: props.alias, pin: pin }) || props;
          var protected = !authsettings.session && pin && props;

          return SEA.write(JSON.stringify(remember), priv).then(function(signed){
            sessionStorage.setItem('user', props.alias);
            sessionStorage.setItem('remember', signed);
            if (!protected) {
              localStorage.removeItem('remember');
            }
            return !protected || SEA.en(protected, pin).then(function(encrypted){
              return encrypted && SEA.write(encrypted, priv)
              .then(function(encsig){
                localStorage.setItem('remember', encsig);
              }).catch(reject);
            }).catch(reject);
          }).then(function(){
            resolve(props);
          }).catch(function(e){ reject({err: 'Session persisting failed!'}) });
        } else  {
          localStorage.removeItem('remember');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('remember');
        }
        resolve(props);
      });
    }
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
    var args = { alias: user.alias };

    if(proof && authsettings.validity){
      args.iat = Math.ceil(Date.now() / 1000);  // seconds
      args.exp = authsettings.validity * 60;    // seconds
      if (Gun.obj.has(opts, 'pin')){
        args.remember = true;                   // for hook - not stored
      }
      var props = authsettings.hook(args);
      if(props instanceof Promise){
        return props.then(updatestorage(proof, user.sea, pin));
      } else {
        return updatestorage(proof, user.sea, pin)(props);
      }
    } else {
      return updatestorage()(args);
    }
  }

  // This internal func recalls persisted User authentication if so configured
  function authrecall(root){
    return new Promise(function(resolve, reject){
      var remember = sessionStorage.getItem('remember');
      var alias = sessionStorage.getItem('user');
      var err = 'Not authenticated';
      var pin;

      // Already authenticated?
      if(Gun.obj.has(root._.user._, 'pub')){
        return resolve(root._.user._.pub);
      }
      // No, got alias?
      if (alias && remember){
        return querygunaliases(alias, root).then(function(aliases){
          return new Promise(function(resolve, reject){
            // then attempt to log into each one until we find ours!
            // (if two users have the same username AND the same password... that would be bad)
            aliases.forEach(function(one, index){
              var at = one.at, pub = one.pub;
              var remaining = (aliases.length - index) > 1;
              if(!at.put){
                return !remaining && reject({err: 'Public key does not exist!'})
              }
              // got pub, time to unwrap Storage data...
              return SEA.read(remember, pub, true).then(function(props){
                props = !props.slice ? props : JSON.parse(props);
                var checkProps = function(decr){
                  return new Promise(function(resolve){
                    if(Gun.obj.has(decr, 'proof')
                    && Gun.obj.has(decr, 'alias') && decr.alias === alias){
                      var proof = decr.proof;
                      var iat = decr.iat; // No way hook to update this
                      delete decr.proof;  // We're not gonna give proof to hook!
                      var doIt = function(args){
                        if(Math.floor(Date.now() / 1000) < (iat + args.exp)){
                          args.iat = iat;
                          args.proof = proof;
                          return args;
                        } else { Gun.log('Authentication expired!') }
                      };
                      var hooked = authsettings.hook(decr);
                      return resolve(((hooked instanceof Promise)
                      && hooked.then(doIt))
                      || doIt(decr));
                    }
                    resolve();
                  });
                };
                // Got PIN ?
                if(Gun.obj.has(props, 'pin')){
                  pin = props.pin;
                  // Yes! We can get localStorage secret if signature is ok
                  return SEA.read(localStorage.getItem('remember'), pub)
                  .then(function(encrypted){
                    // And decrypt it
                    return SEA.de(encrypted, pin);
                  }).then(function(decr){
                    decr = !decr.slice ? decr : JSON.parse(decr);
                    // And return proof if for matching alias
                    return checkProps(decr);
                  });
                }
                // No PIN, let's try short-term proof if for matching alias
                return checkProps(props);
              }).then(function(args){
                var proof = args && args.proof;
                if (!proof){
                  return updatestorage()(args).then(function(){
                    reject({err: 'No secret found!'});
                  }).catch(function(){
                    reject({err: 'No secret found!'});
                  });
                }
                // the proof of work is evidence that we've spent some time/effort trying to log in, this slows brute force.
                return SEA.read(at.put.auth, pub).then(function(auth){
                  return SEA.de(auth, proof)
                  .catch(function(e){ reject({err: 'Failed to decrypt secret!'}) });
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
              }).catch(function(e){ reject({err: 'Failed to access stored credentials!'}) })
            });
          });
        }).then(function(user){
          finalizelogin(alias, user, root).then(resolve).catch(function(e){
            Gun.log('Failed to finalize login with new password!');
            reject({err: 'Finalizing new password login failed! Reason: '+(e && e.err) || e || ''});
          });
        }).catch(function(e){
          reject({err: 'No authentication session found!'});
        });
      }
      reject({err: 'No authentication session found!'});
    });
  }

  // This internal func executes logout actions
  function authleave(root, alias){
    return function(resolve, reject){
      // remove persisted authentication
      authpersist((alias && { alias: alias }) || root._.user._).then(function(){
        root._.user = root.chain();
        resolve({ok: 0});
      });
    };
  }

  // This internal func returns hashed data for signing
  function nodehash(m){
    try{
      m = m.slice ? m : JSON.stringify(m);
      var ret = nodeCrypto.createHash(nHash).update(m, 'utf8').digest();
      return ret;
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
            var user = { pub: pair.pub, priv: pair.priv };
            // the user's public key doesn't need to be signed. But everything else needs to be signed with it!
            SEA.write(alias, pair.priv).then(function(signedalias){
              user.alias = signedalias;
              return SEA.write(salt, pair.priv);
            }).then(function(signedsalt){
              user.salt = signedsalt;
              // to keep the private key safe, we AES encrypt it with the proof of work!
              return SEA.en(pair.priv, proof);
            }).then(function(encryptedpriv){
              return SEA.write(encryptedpriv, pair.priv);
            }).then(function(encsigauth){
              user.auth = encsigauth;
              var tmp = 'pub/'+pair.pub;
              //console.log("create", user, pair.pub);
              // awesome, now we can actually save the user with their public key as their ID.
              root.get(tmp).put(user);
              // next up, we want to associate the alias with the public key. So we add it to the alias list.
              var ref = root.get('alias/'+alias).put(Gun.obj.put({}, tmp, Gun.val.rel.ify(tmp)));
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
      authenticate(alias, pass, root).then(function(key){
        // we're logged in!
        var pin = Gun.obj.has(opts, 'pin') && { pin: opts.pin };
        if(Gun.obj.has(opts, 'newpass')){
          // password update so encrypt private key using new pwd + salt
          var newsalt = Gun.text.random(64);
          SEA.proof(opts.newpass, newsalt).then(function(newproof){
            return SEA.en(key.priv, newproof).then(function(encryptedpriv){
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
              reject({err: 'Finalizing new password login failed! Reason: '+(e && e.err) || e || ''});
            });
          }).catch(function(e){
            Gun.log('Failed encrypt private key using new password!');
            reject({err: 'Password set attempt failed! Reason: '+(e && e.err) || e || ''});
          });
        } else {
          finalizelogin(alias, key, root, pin).then(resolve).catch(function(e){
            Gun.log('Failed to finalize login!');
            reject({err: 'Finalizing login failed! Reason: '+(e && e.err) || e || ''});
          });
        }
      }).catch(function(e){
        Gun.log('Failed to sign in!');
        reject({err: 'Auth attempt failed! Reason: '+(e && e.err) || e || ''});
      });
    };
    if(cb){doIt(cb, cb)} else { return new Promise(doIt) }
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
          root.get('pub/'+key.pub).put(null);
          root._.user = root.chain();
          resolve({ok: 0});
        }).catch(function(e){
          Gun.log('User.delete failed! Error:', e);
          reject({err: 'Delete attempt failed! Reason:'+(e && e.err) || e || ''});
        });
      }).catch(function(e){
        Gun.log('User.delete authentication failed! Error:', e);
        reject({err: 'Delete attempt failed! Reason:'+(e && e.err) || e || ''});
      });
    };
    if(cb){doIt(cb, cb)} else { return new Promise(doIt) }
  };
  // If authentication is to be remembered over reloads or browser closing,
  // set validity time in seconds.
  User.recall = function(validity,cb,opts){
    var root = this.back(-1);
    if(!opts){
      if(typeof cb !== 'function' && !Gun.val.is(cb)){
        opts = cb;
        cb = undefined;
      }
    }
    if(!cb){
      if(typeof validity === 'function'){
        cb = validity;
        validity = undefined;
      } else if(!Gun.val.is(validity)){
        opts = validity;
        validity = undefined;
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
      if(Gun.val.is(validity)){
        authsettings.validity = validity;
      }
      if(Gun.obj.has(opts, 'session')){
        authsettings.session = opts.session;
      }
      if(Gun.obj.has(opts, 'hook')){
        authsettings.hook = opt.hook;
      }
      authrecall(root).then(function(props){
        // All is good. Should we do something more with actual recalled data?
        resolve(root._.user._)
      }).catch(function(e){
        var err = 'No session!';
        Gun.log(err);
        resolve({ err: err });
      });
    };
    if(cb){doIt(cb, cb)} else { return new Promise(doIt) }
  };
  User.alive = function(cb){
    var root = this.back(-1);
    var doIt = function(resolve, reject){
      authrecall(root).then(function(){
        // All is good. Should we do something more with actual recalled data?
        resolve(root._.user._)
      }).catch(function(e){
        var err = 'No session!';
        Gun.log(err);
        reject({ err: err });
      });
    };
    if(cb){doIt(cb, cb)} else { return new Promise(doIt) }
  };

  // After we have a GUN extension to make user registration/login easy, we then need to handle everything else.

  // We do this with a GUN adapter, we first listen to when a gun instance is created (and when its options change)
  Gun.on('opt', function(at){
    if(!at.sea){ // only add SEA once per instance, on the "at" context.
      at.sea = {own: {}};
      at.gun.on('in', security, at); // now listen to all input data, acting as a firewall.
      at.gun.on('out', signature, at); // and output listeners, to encrypt outgoing data.
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
  Gun.on('node', function(at){ // TODO: Warning: Need to switch to `gun.on('node')`! Do not use `Gun.on('node'` in your apps!
    var own = (at.gun.back(-1)._).sea.own, soul = at.get, pub = own[soul] || soul.slice(4), vertex = (at.gun._).put;
    Gun.node.is(at.put, function(val, key, node){ // for each property on the node.
      SEA.read(val, pub).then(function(data){
        vertex[key] = node[key] = val = data; // verify signature and get plain value.
        if(val && val['#'] && (key = Gun.val.rel.is(val))){ // if it is a relation / edge
          if('alias/' === soul.slice(0,6)){ return } // if it is itself
          own[key] = pub; // associate the public key with a node
        }
      });
    });
  });

  // signature handles data output, it is a proxy to the security function.
  function signature(at){
    at.user = at.gun.back(-1)._.user;
    security.call(this, at);
  }

  // okay! The security function handles all the heavy lifting.
  // It needs to deal read and write of input and output of system data, account/public key data, and regular data.
  // This is broken down into some pretty clear edge cases, let's go over them:
  function security(at){
    var cat = this.as, sea = cat.sea, to = this.to;
    if(at.get){
      // if there is a request to read data from us, then...
      var soul = at.get['#'];
      if(soul){ // for now, only allow direct IDs to be read.
        if('alias' === soul){ // Allow reading the list of usernames/aliases in the system?
          return to.next(at); // yes.
        } else
        if('alias/' === soul.slice(0,6)){ // Allow reading the list of public keys associated with an alias?
          return to.next(at); // yes.
        } else { // Allow reading everything?
          return to.next(at); // yes // TODO: No! Make this a callback/event that people can filter on.
        }
      }
    }
    if(at.put){
      // if there is a request to write data to us, then...
      var no, tmp, u;
      Gun.obj.map(at.put, function(node, soul){ // for each over every node in the graph
        if(no){ return no = true }
        if(Gun.obj.empty(node, '_')){ return } // ignore empty updates, don't reject them.
        if('alias' === soul){ // special case for shared system data, the list of aliases.
          Gun.obj.map(node, function(val, key){ // for each over the node to look at each property/value.
            if('_' === key){ return } // ignore meta data
            if(!val){ return no = true } // data MUST exist
            if('alias/'+key !== Gun.val.rel.is(val)){ // in fact, it must be EXACTLY equal to itself
              return no = true; // if it isn't, reject.
            }
          });
        } else
        if('alias/' === soul.slice(0,6)){ // special case for shared system data, the list of public keys for an alias.
          Gun.obj.map(node, function(val, key){ // for each over the node to look at each property/value.
            if('_' === key){ return } // ignore meta data
            if(!val){ return no = true } // data MUST exist
            if(key === Gun.val.rel.is(val)){ return } // and the ID must be EXACTLY equal to its property
            return no = true; // that way nobody can tamper with the list of public keys.
          });
        } else
        if('pub/' === soul.slice(0,4)){ // special case, account data for a public key.
          tmp = soul.slice(4); // ignore the 'pub/' prefix on the public key.
          Gun.obj.map(node, function(val, key){ // for each over the account data, looking at each property/value.
            if('_' === key){ return } // ignore meta data.
            if('pub' === key){
              if(val === tmp){ return } // the account MUST have a `pub` property that equals the ID of the public key.
              return no = true; // if not, reject the update.
            }
            if(at.user){ // if we are logged in
              if(tmp === at.user._.pub){ // as this user
                SEA.write(val, at.user._.sea).then(function(data){
                  val = node[key] = data; // then sign our updates as we output them.
                });
              } // (if we are lying about our signature, other peer's will reject our update)
            }
            SEA.read(val, tmp).then(function(data){
              if(u === (val = data)){ // make sure the signature matches the account it claims to be on.
                return no = true; // reject any updates that are signed with a mismatched account.
              }
            });
          });
        } else
        if(at.user && (tmp = at.user._.sea)){ // not special case, if we are logged in, then
          Gun.obj.map(node, function(val, key){ // any data we output needs to
            if('_' === key){ return }
            SEA.write(val, tmp).then(function(data){
              node[key] = data; // be signed by our logged in account.
            });
          });
        } else // TODO: BUG! These two if-statements are not exclusive to each other!!!
        if(tmp = sea.own[soul]){ // not special case, if we receive an update on an ID associated with a public key, then
          Gun.obj.map(node, function(val, key){ // for each over the property/values
            if('_' === key){ return }
            SEA.read(val, tmp).then(function(data){
              if(u === (val = data)){ // and verify they were signed by the associated public key!
                return no = true; // reject the update if it fails to match.
              }
            });
          });
        } else { // reject any/all other updates by default.
          return no = true;
        }
      });
      if(no){ // if we got a rejection then...
        if(!at || !Gun.tag.secure){ return }
        Gun.on('secure', function(at){ // (below) emit a special event for the developer to handle security.
          this.off();
          if(!at){ return }
          to.next(at); // and if they went ahead and explicitly called "next" (to us) with data, then approve.
        });
        Gun.on('secure', at);
        return; // else wise, reject.
      }
      //console.log("SEA put", at.put);
      // if we did not get a rejection, then pass forward to the "next" adapter middleware.
      return to.next(at);
    }
    to.next(at); // pass forward any data we do not know how to handle or process (this allows custom security protocols).
  };

  // Does enc/dec key like OpenSSL - works with CryptoJS encryption/decryption
  function makeKey(p,s){
    var ps = Buffer.concat([new Buffer(p, 'utf8'), s]);
    var h128 = nodeCrypto.createHash('md5').update(ps).digest();
    // TODO: 'md5' is insecure, do we need OpenSSL compatibility anymore ?
    return Buffer.concat([
      h128,
      nodeCrypto.createHash('md5').update(Buffer.concat([h128, ps])).digest()
    ]);
  }

  var nHash = pbkdf2.hash.replace('-', '').toLowerCase();

  // These SEA functions support both callback AND Promises
  var SEA = {};
  // create a wrapper library around NodeJS crypto & ecCrypto and Web Crypto API.
  // now wrap the various AES, ECDSA, PBKDF2 functions we called above.
  SEA.proof = function(pass,salt,cb){
    var doIt = (typeof window !== 'undefined' && function(resolve, reject){
      crypto.subtle.importKey(  // For browser crypto.subtle works fine
        'raw', new TextEncoder().encode(pass), {name: 'PBKDF2'}, false, ['deriveBits']
      ).then(function(key){
        return crypto.subtle.deriveBits({
          name: 'PBKDF2',
          iterations: pbkdf2.iter,
          salt: new TextEncoder().encode(salt),
          hash: pbkdf2.hash,
        }, key, pbkdf2.ks*8);
      }).then(function(result){
        return new Buffer(result, 'binary').toString('base64');
      }).then(resolve).catch(function(e){ Gun.log(e); reject(e) });
    }) || function(resolve, reject){  // For NodeJS crypto.pkdf2 rocks
      try{
        var hash = nodeCrypto.pbkdf2Sync(pass,new Buffer(salt, 'utf8'),pbkdf2.iter,pbkdf2.ks,nHash);
        resolve(hash && hash.toString('base64'));
      }catch(e){ reject(e) };
    };
    if(cb){doIt(cb, function(){cb()})} else { return new Promise(doIt) }
  };
  SEA.pair = function(cb){
    var doIt = function(resolve, reject){
      var priv = nodeCrypto.randomBytes(32);
      resolve({
        pub: new Buffer(ecCrypto.getPublic(priv), 'binary').toString('hex'),
        priv: new Buffer(priv, 'binary').toString('hex')
      });
    };
    if(cb){doIt(cb, function(){cb()})} else { return new Promise(doIt) }
  };
  SEA.derive = function(m,p,cb){
    var doIt = function(resolve, reject){
      ecCrypto.derive(new Buffer(p, 'hex'), new Buffer(m, 'hex'))
      .then(function(secret){
        resolve(new Buffer(secret, 'binary').toString('hex'));
      }).catch(function(e){ Gun.log(e); reject(e) });
    };
    if(cb){doIt(cb, function(){cb()})} else { return new Promise(doIt) }
  };
  SEA.sign = function(m,p,cb){
    var doIt = function(resolve, reject){
      ecCrypto.sign(new Buffer(p, 'hex'), nodehash(m)).then(function(sig){
        resolve(new Buffer(sig, 'binary').toString('hex'));
      }).catch(function(e){Gun.log(e); reject(e)});
    };
    if(cb){doIt(cb, function(){cb()})} else { return new Promise(doIt) }
  };
  SEA.verify = function(m, p, s, cb){
    var doIt = function(resolve, reject){
      ecCrypto.verify(new Buffer(p, 'hex'), nodehash(m), new Buffer(s, 'hex'))
      .then(function(){resolve(true)})
      .catch(function(e){ Gun.log(e);reject(e) })
    };
    if(cb){doIt(cb, function(){cb()})} else { return new Promise(doIt) }
  };
  SEA.en = function(m,p,cb){
    var doIt = function(resolve, reject){
      var s = nodeCrypto.randomBytes(8);
      var iv = nodeCrypto.randomBytes(16);
      var r = {iv: iv.toString('hex'), s: s.toString('hex')};
      var key = makeKey(p, s);
      m = (m.slice && m) || JSON.stringify(m);
      if(typeof window !== 'undefined'){ // Browser doesn't run createCipheriv
        crypto.subtle.importKey('raw', key, 'AES-CBC', false, ['encrypt'])
        .then(function(aesKey){
          crypto.subtle.encrypt({
            name: 'AES-CBC', iv: iv
          }, aesKey, new TextEncoder().encode(m)).then(function(ct){
            r.ct = new Buffer(ct, 'binary').toString('base64');
            return JSON.stringify(r);
          }).then(resolve).catch(function(e){ Gun.log(e); reject(e) });
        }).catch(function(e){ Gun.log(e); reject(e)} );
      } else {  // NodeJS doesn't support crypto.subtle.importKey properly
        try{
          var cipher = nodeCrypto.createCipheriv(aes.enc, key, iv);
          r.ct = cipher.update(m, 'utf8', 'base64');
          r.ct += cipher.final('base64');
        }catch(e){ Gun.log(e); return reject(e) }
        resolve(JSON.stringify(r));
      }
    };
    if(cb){doIt(cb, function(){cb()})} else { return new Promise(doIt) }
  };
  SEA.de = function(m,p,cb){
    var doIt = function(resolve, reject){
      var d = !m.slice ? m : JSON.parse(m);
      var key = makeKey(p, new Buffer(d.s, 'hex'));
      var iv = new Buffer(d.iv, 'hex');
      if(typeof window !== 'undefined'){ // Browser doesn't run createDecipheriv
        crypto.subtle.importKey('raw', key, 'AES-CBC', false, ['decrypt'])
        .then(function(aesKey){
          crypto.subtle.decrypt({
            name: 'AES-CBC', iv: iv
          }, aesKey, new Buffer(d.ct, 'base64')).then(function(ct){
            var ctUtf8 = new TextDecoder('utf8').decode(ct);
            return !ctUtf8.slice ? ctUtf8 : JSON.parse(ctUtf8);
          }).then(resolve).catch(function(e){Gun.log(e); reject(e)});
        }).catch(function(e){Gun.log(e); reject(e)});
      } else {  // NodeJS doesn't support crypto.subtle.importKey properly
        try{
          var decipher = nodeCrypto.createDecipheriv(aes.enc, key, iv);
          r = decipher.update(d.ct, 'base64', 'utf8') + decipher.final('utf8');
        }catch(e){ Gun.log(e); return reject(e) }
        resolve(r);
      }
    };
    if(cb){doIt(cb, function(){cb()})} else { return new Promise(doIt) }
  };
  SEA.write = function(mm,p,cb){
    var doIt = function(resolve, reject) {
      // TODO: something's bugging double 'SEA[]' treatment to mm...
      var m = mm;
      if(mm.slice){
        // Needs to remove previous signature envelope
        while('SEA[' === m.slice(0,4)){
          try{m = JSON.parse(m.slice(3))[0];
          }catch(e){ m = mm; break }
        }
      }
      m = m.slice ? m : JSON.stringify(m);
      SEA.sign(m, p).then(function(signature){
        resolve('SEA'+JSON.stringify([m,signature]));
      }).catch(function(e){Gun.log(e); reject(e)});
    };
    if(cb){doIt(cb, function(){cb()})} else { return new Promise(doIt) }
  };
  SEA.read = function(m,p,cb){
    var doIt = function(resolve, reject) {
      if(!m){ return resolve() }
      if(!m.slice || 'SEA[' !== m.slice(0,4)){ return resolve(m) }
      m = m.slice(3);
      try{m = !m.slice ? m : JSON.parse(m);
      }catch(e){ return reject(e) }
      m = m || '';
      SEA.verify(m[0], p, m[1]).then(function(ok){
        resolve(ok && m[0])
      }).catch(function(e){reject(e)});
    };
    if(cb && typeof cb === 'function'){doIt(cb, function(){cb()})
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

  module.exports = SEA;
}());
