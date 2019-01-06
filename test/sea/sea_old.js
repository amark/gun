/* global Gun,describe,expect,it,beforeEach */
/*eslint max-len: ["error", 95, { "ignoreComments": true }]*/
/*eslint semi: ["error", "always", { "omitLastInOneLineBlock": true}]*/
/*eslint object-curly-spacing: ["error", "never"]*/
/*eslint node/no-deprecated-api: [error, {ignoreModuleItems: ["new buffer.Buffer()"]}] */

var root;
(function(env){
  root = env.window ? env.window : global;
  env.window && root.localStorage && root.localStorage.clear();
  try{ require('fs').unlinkSync('data.json') }catch(e){}
  //root.Gun = root.Gun || require('../gun');
  if(root.Gun){
    root.Gun = root.Gun;
  } else {
    var expect = global.expect = require("./expect");
    root.Gun = require('../gun');
    Gun.serve = require('../lib/serve');
    //require('./s3');
    //require('./uws');
    //require('./wsp/server');
    require('../lib/file');
    require('../sea');
  }
}(this));

;(function(){

const SEA = Gun.SEA

if(!SEA){ return }

const { Buffer, EasyIndexedDB } = SEA

const seaIndexedDb = new SEA.EasyIndexedDB('SEA', 'GunDB', 1)

const checkIndexedDB = (key, prop, resolve_) => {
  const doIt = (resolve, reject) => seaIndexedDb.get(key, prop)
  .then(resolve).catch(reject)

  if (resolve_) {
    doIt(resolve_, (e) => { throw e })
  } else {
    return new Promise(doIt)
  }
}

const setIndexedDB = (key, auth, resolve_) => {
  const doIt = (resolve, reject) => seaIndexedDb.put(key, { auth })
  .then(resolve).catch(reject)

  if (resolve_) {
    doIt(resolve_, (e) => { throw e })
  } else {
    return new Promise(doIt)
  }
}

SEA && describe('SEA', function(){
  console.log('TODO: SEA! THIS IS AN EARLY ALPHA!!!');
  var alias = 'dude';
  var pass = 'my secret password';
  var userKeys = ['pub', 'priv'];
  var clearText = 'My precious secret!';
  var encKeys = ['ct', 'iv', 's'];

  const type = 'Promise'  // TODO: this is leftover...
  it('proof', function(done){
    var check = function(proof){
      expect(proof).to.not.be(undefined);
      expect(proof).to.not.be('');
      done();
    };
    // proof - generates PBKDF2 hash from user's alias and password
    // which is then used to decrypt user's auth record
    SEA.proof(pass, Gun.text.random(64)).then(check).catch(done);
  });

  it('pair', function(done){
    var check = function(key){
      expect(key).to.not.be(undefined);
      expect(key).to.not.be('');
      expect(key).to.have.keys(userKeys);
      userKeys.map(function(fld){
        expect(key[fld]).to.not.be(undefined);
        expect(key[fld]).to.not.be('');
      });
      done();
    };
    // pair - generates ECDH key pair (for new user when created)
    SEA.pair().then(check).catch(done);
  });

  it('keyid', function(done){
    SEA.pair().then(function(key){
      var check = function(keyid){
        expect(keyid).to.not.be(undefined);
        expect(keyid).to.not.be('');
        expect(keyid.length).to.eql(16);
        done();
      };
      // keyid - creates 8 byte KeyID from public key
      SEA.keyid(key.pub).then(check);
    }).catch(function(e){done(e)});
  });

  it('enc', function(done){
    SEA.pair().then(function(key){
      var check = function(jsonSecret){
        expect(jsonSecret).to.not.be(undefined);
        expect(jsonSecret).to.not.be('');
        expect(jsonSecret).to.not.eql(clearText);
        var objSecret = JSON.parse(jsonSecret);
        expect(objSecret).to.have.keys(encKeys);
        encKeys.map(function(key){
          expect(objSecret[key]).to.not.be(undefined);
          expect(objSecret[key]).to.not.be('');
        });
        done();
      };
      // en - encrypts JSON data using user's private or derived ECDH key
      SEA.enc(clearText, key.priv).then(check);
    }).catch(function(e){done(e)});
  });

  it('sign', function(done){
    SEA.pair().then(function(key){
      var check = function(signature){
        expect(signature).to.not.be(undefined);
        expect(signature).to.not.be('');
        expect(signature).to.not.eql(key.pub);
        done();
      };
      // sign - calculates signature for data using user's private ECDH key
      SEA.sign(key.pub, key).then(check);
    }).catch(function(e){done(e)});
  });

  it('verify', function(done){
    SEA.pair().then(function(key){
      var check = function(ok){
        expect(ok).to.not.be(undefined);
        expect(ok).to.not.be('');
        expect(ok).to.be(true);
        done();
      };
      // sign - calculates signature for data using user's private ECDH key
      SEA.sign(key.pub, key).then(function(signature){
        SEA.verify(key.pub, key.pub, signature).then(check);
      });
    }).catch(function(e){done(e)});
  });

  it('dec', function(done){
    SEA.pair().then(function(key){
      var check = function(decText){
        expect(decText).to.not.be(undefined);
        expect(decText).to.not.be('');
        expect(decText).to.be.eql(clearText);
        done();
      };
      SEA.enc(clearText, key.priv).then(function(jsonSecret){
        // de - decrypts JSON data using user's private or derived ECDH key
        SEA.dec(jsonSecret, key.priv).then(check);
      });
    }).catch(function(e){done(e)});
  });

  it('derive', function(done){
    SEA.pair().then(function(txKey){
      return SEA.pair().then(function(rxKey){
        return {tx: txKey, rx: rxKey};
      });
    }).then(function(keys){
      var check = function(shared){
        expect(shared).to.not.be(undefined);
        expect(shared).to.not.be('');
        [keys.rx.pub, keys.rx.priv, keys.tx.pub, keys.tx.priv]
        .map(function(val){
          expect(shared).to.not.eql(val);
        });
        done();
      };
      // derive - provides shared secret for both receiver and sender
      // which can be used to encrypt or sign data
      SEA.derive(keys.rx.pub, keys.tx).then(check);
    }).catch(function(e){done(e)});
  });

  it('write', function(done){
    SEA.pair().then(function(key){
      SEA.sign(key.pub, key).then(function(signature){
        var check = function(result){
          var parts;
          try{
            expect(result).to.not.be(undefined);
            expect(result).to.not.be('');
            expect(result.slice(0, 4)).to.eql('SEA[');
            parts = JSON.parse(result.slice(3));
            expect(parts).to.not.be(undefined);
            expect(parts[0]).to.be.eql(key.pub);
            // expect(parts[1]).to.be.eql(signature);
          }catch(e){ return done(e) }
          SEA.verify(key.pub, key.pub, parts[1]).then(function(flag){
            expect(flag).to.be.true;
            done();
          });
        };
        // write - wraps data to 'SEA["data","signature"]'
        SEA.write(key.pub, key).then(check);
      });
    }).catch(function(e){done(e)});
  });

  it('read', function(done){
    SEA.pair().then(function(key){
      var check = function(result){
        expect(result).to.not.be(undefined);
        expect(result).to.not.be('');
        expect(result).to.be.equal(key.pub);
        done();
      };
      SEA.sign(key.pub, key).then(function(signature){
        SEA.write(key.pub, key).then(function(signed){
          // read - unwraps data from 'SEA["data","signature"]'
          SEA.read(signed, key.pub).then(check);
        });
      });
    }).catch(function(e){done(e)});
  });
});

Gun().user && describe('Gun', function(){
  describe('User', function(){
    console.log('TODO: User! THIS IS AN EARLY ALPHA!!!');
    var alias = 'dude';
    var pass = 'my secret password';
    var gun = Gun();
    var user = gun.user();
    Gun.log.off = true;  // Supress all console logging

    const throwOutUser = (wipeStorageData, done) => {
      // Get rid of authenticated Gun user
      var user = gun.back(-1)._.user;
      // TODO: is this correct way to 'logout' user from Gun.User ?
      [ 'alias', 'sea', 'pub' ].forEach(function(key){
        delete user._[key];
      });
      user._.is = user.is = {};

      if(wipeStorageData){
        // ... and persisted session
        sessionStorage.removeItem('remember');
        sessionStorage.removeItem('alias');
        if (typeof done === 'function') {
          seaIndexedDb.wipe().then(done)
          return
        } else {
          return seaIndexedDb.wipe()
        }
      }
      return Promise.resolve()
    }

    const type = 'Promise'  // TODO: this is leftover...
    // Simulate browser reload
    beforeEach((done) => { throwOutUser(true, done) })

    describe('create', function(){

      it('new', function(done){
        var check = function(ack){
          try{
            expect(ack).to.not.be(undefined);
            expect(ack).to.not.be('');
            expect(ack).to.have.keys([ 'ok', 'pub' ]);
          }catch(e){ done(e); return }
          done();
        };
        // Gun.user.create - creates new user
        user.create(alias+type, pass).then(check).catch(done);
      });

      it('conflict', function(done){
        Gun.log.off = true;  // Supress all console logging
        var check = function(ack){
          try{
            expect(ack).to.not.be(undefined);
            expect(ack).to.not.be('');
            expect(ack).to.have.key('err');
            expect(ack.err).not.to.be(undefined);
            expect(ack.err).not.to.be('');
            expect(ack.err.toLowerCase().indexOf('already created')).not.to.be(-1);
          }catch(e){ done(e); return }
          done();
        };
        // Gun.user.create - fails to create existing user
        user.create(alias+type, pass).then(function(ack){
          done('Failed to decline creating existing user!');
        }).catch(check);
      });
    });

    describe('auth', function(){
      const checkStorage = (done, notStored) => () => {
        const checkValue = (data, val) => {
          if (notStored) {
            expect(typeof data !== 'undefined' && data !== null && data !== '')
            .to.not.eql(true)
          } else {
            expect(data).to.not.be(undefined)
            expect(data).to.not.be('')
            if (val) {
              expect(data).to.eql(val)
            }
          }
        }
        const alias = root.sessionStorage.getItem('user')
        checkValue(alias)
        checkValue(root.sessionStorage.getItem('remember'))
        if (alias) {
          checkIndexedDB(alias, 'auth').then((auth) => {
            checkValue(auth)
            done()
          }).catch(done)
        } else {
          done()
        }
      }

      it('login', function(done){
        var check = function(ack){
          try{
            expect(ack).to.not.be(undefined);
            expect(ack).to.not.be('');
            expect(ack).to.not.have.key('err');
          }catch(e){ done(e); return }
          done();
        };
        // Gun.user.auth - authenticates existing user
        user.auth(alias+type, pass).then(check).catch(done);
      });

      it('wrong password', function(done){
        var check = function(ack){
          try{
            expect(ack).to.not.be(undefined);
            expect(ack).to.not.be('');
            expect(ack).to.have.key('err');
            expect(ack.err).to.not.be(undefined);
            expect(ack.err).to.not.be('');
            expect(ack.err.toLowerCase().indexOf('failed to decrypt secret'))
            .not.to.be(-1);
          }catch(e){ done(e); return }
          done();
        };
        user.auth(alias+type, pass+'not').then(function(ack){
          done('Unexpected login success!');
        }).catch(check);
      });

      it('unknown alias', function(done){
        var check = function(ack){
          try{
            expect(ack).to.not.be(undefined);
            expect(ack).to.not.be('');
            expect(ack).to.have.key('err');
            expect(ack.err).to.not.be(undefined);
            expect(ack.err).to.not.be('');
            expect(ack.err.toLowerCase().indexOf('no user')).not.to.be(-1);
          }catch(e){ done(e); return }
          done();
        };
        user.auth(alias+type+'not', pass).then(function(ack){
          done('Unexpected login success!');
        }).catch(check);
      });

      it('new password', function(done){
        var check = function(ack){
          try{
            expect(ack).to.not.be(undefined);
            expect(ack).to.not.be('');
            expect(ack).to.not.have.key('err');
          }catch(e){ done(e); return }
          done();
        };
        // Gun.user.auth - with newpass props sets new password
        user.auth(alias+type, pass, {newpass: pass+' new'}).then(check)
        .catch(done);
      });

      it('failed new password', function(done){
        var check = function(ack){
          try{
            expect(ack).to.not.be(undefined);
            expect(ack).to.not.be('');
            expect(ack).to.have.key('err');
            expect(ack.err).to.not.be(undefined);
            expect(ack.err).to.not.be('');
            expect(ack.err.toLowerCase().indexOf('failed to decrypt secret'))
            .not.to.be(-1);
          }catch(e){ done(e); return }
          done();
        };
        user.auth(alias+type, pass+'not', {newpass: pass+' new'})
        .then(function(ack){
          done('Unexpected password change success!');
        }).catch(check);
      });

      it('without PIN auth session stored', function(done){
        user.auth(alias+type, pass+' new').then(checkStorage(done)).catch(done);
      });

      it('with PIN auth session stored', function(done){
        user.auth(alias+type, pass+' new', { pin: 'PIN' })
        .then(checkStorage(done)).catch(done)
      })

      it('without PIN and zero validity no auth session storing', function(done){
        user.recall(0).then(function(){
          user.auth(alias+type, pass+' new')
          .then(checkStorage(done, true)).catch(done);
        });
      });

      it('with PIN and zero validity no auth session storing', function(done){
        user.recall(0).then(function(){
          user.auth(alias+type, pass+' new', {pin: 'PIN'})
          .then(checkStorage(done, true)).catch(done);
        });
      });
    });

    describe('leave', function(){
      it('valid session', function(done){
        var check = function(ack){
          try{
            expect(ack).to.not.be(undefined);
            expect(ack).to.not.be('');
            expect(ack).to.not.have.key('err');
            expect(ack).to.have.key('ok');
            expect(gun.back(-1)._.user._).to.not.have.keys([ 'sea', 'pub' ]);
            // expect(gun.back(-1)._.user).to.not.be.ok();
          }catch(e){ done(e); return }
          done();
        };
        var usr = alias+type+'leave';
        user.create(usr, pass).then(function(ack){
          expect(ack).to.not.be(undefined);
          expect(ack).to.not.be('');
          expect(ack).to.have.keys([ 'ok', 'pub' ]);
          user.auth(usr, pass).then(function(usr){
            try{
              expect(usr).to.not.be(undefined);
              expect(usr).to.not.be('');
              expect(usr).to.not.have.key('err');
              expect(usr).to.have.key('put');
            }catch(e){ done(e); return }
            // Gun.user.leave - performs logout for authenticated user
            user.leave().then(check).catch(done);
          }).catch(done);
        }).catch(done);
      });

      it('no session', function(done){
        var check = function(ack){
          try{
            expect(ack).to.not.be(undefined);
            expect(ack).to.not.be('');
            expect(ack).to.not.have.key('err');
            expect(ack).to.have.key('ok');
          }catch(e){ done(e); return }
          done();
        };
        expect(gun.back(-1)._.user).to.not.have.keys([ 'sea', 'pub' ]);
        user.leave().then(check).catch(done);
      });
    });

    describe('delete', function(){
      var usr = alias+type+'del';

      var createUser = function(a, p){
        return user.create(a, p).then(function(ack){
          expect(ack).to.not.be(undefined);
          expect(ack).to.not.be('');
          expect(ack).to.have.keys([ 'ok', 'pub' ]);
          return ack;
        });
      };
      var check = function(done){
        return function(ack){
          try{
            expect(ack).to.not.be(undefined);
            expect(ack).to.not.be('');
            expect(ack).to.not.have.key('err');
            expect(ack).to.have.key('ok');
            expect(gun.back(-1)._.user).to.not.have.keys([ 'sea', 'pub' ]);
          }catch(e){ done(e); return }
          done();
        };
      };

      it('existing authenticated user', function(done){
        createUser(usr, pass).then(function(){
          user.auth(usr, pass).then(function(ack){
            try{
              expect(ack).to.not.be(undefined);
              expect(ack).to.not.be('');
              expect(ack).to.not.have.key('err');
              expect(ack).to.have.key('put');
            }catch(e){ done(e); return }
            // Gun.user.delete - deletes existing user account
            user.delete(usr, pass).then(check(done)).catch(done);
          }).catch(done);
        }).catch(done);
      });

      it('unauthenticated existing user', function(done){
        createUser(usr, pass).catch(function(){})
        .then(function(){
          user.delete(usr, pass).then(check(done)).catch(done);
        });
      });

      it('non-existing user', function(done){
        var notFound = function(ack){
          try{
            expect(ack).to.not.be(undefined);
            expect(ack).to.not.be('');
            expect(ack).to.not.have.key('put');
            expect(ack).to.have.key('err');
            expect(ack.err.toLowerCase().indexOf('no user')).not.to.be(-1);
          }catch(e){ done(e); return }
          done();
        };
        user.delete('someone', 'password guess').then(function(){
          done('Unexpectedly deleted guessed user!');
        }).catch(notFound);
      });
    });

    describe('recall (from IndexedDB)', function(){
      var doCheck = function(done, hasPin, wantAck){
        expect(typeof done).to.be('function');
        return function(ack){
          var user = root.sessionStorage.getItem('user');
          var sRemember = root.sessionStorage.getItem('remember');
          expect(user).to.not.be(undefined);
          expect(user).to.not.be('');
          expect(sRemember).to.not.be(undefined);
          expect(sRemember).to.not.be('');

          var ret;
          if(wantAck && ack){
            ['err', 'pub', 'sea', 'alias', 'put'].forEach(function(key){
              if(typeof ack[key] !== 'undefined'){
                (ret = ret || {})[key] = ack[key];
              }
            });
          }
          // NOTE: done can be Promise returning function
          return !hasPin || !wantAck || !ack ? done(ret)
          : new Promise(function(resolve){
            checkIndexedDB(ack.alias, 'auth', function(auth){
              expect(auth).to.not.be(undefined);
              expect(auth).to.not.be('');
              resolve(done(wantAck && Object.assign(ret || {}, {auth: auth})));
            });
          });
        };
      };
      // This re-constructs 'remember-me' data modified by manipulate func
      var manipulateStorage = function(manipulate, pin){
        expect(typeof manipulate).to.be('function');
        // We'll use Gun internal User data
        var usr = gun.back(-1)._.user;
        expect(usr).to.not.be(undefined);
        expect(usr).to.have.key('_');
        expect(usr._).to.have.keys(['pub', 'sea']);
        // ... to validate 'remember' data
        pin = pin && Buffer.from(pin, 'utf8').toString('base64');
        return !pin ? Promise.resolve(sessionStorage.getItem('remember'))
        : new Promise(function(resolve){
          checkIndexedDB(usr._.alias, 'auth', resolve);
        }).then(function(remember){
          return SEA.read(remember, usr._.pub).then(function(props){
            return !pin ? props
            : SEA.dec(props, pin);
          });
        }).then(function(props){
          try{ props && (props = JSON.parse(props)) }catch(e){} //eslint-disable-line no-empty
          return props;
        }).then(manipulate).then(function(props){
          expect(props).to.not.be(undefined);
          expect(props).to.not.be('');
          var keys = {pub: usr._.pub, priv: usr._.sea.priv};
          return SEA.write(JSON.stringify(props), keys)
          .then(function(remember){
            return !pin ? sessionStorage.setItem('remember', remember)
            : SEA.enc(remember, pin).then(function(encauth){
              return new Promise(function(resolve){
                setIndexedDB(usr._.alias, encauth, resolve);
              });
            });
          });
        });
      };

      it('with PIN auth session stores', function(done){
        var doAction = function(){
          user.auth(alias+type, pass+' new', {pin: 'PIN'})
          .then(doCheck(done, true)).catch(done);
        };
        user.recall().then(doAction).catch(done);
      });

      it('without PIN auth session stores', function(done){
        var doAction = function(){
          user.auth(alias+type, pass+' new').then(doCheck(done));
        };
        user.leave().then(function(){
          user.recall().then(doAction).catch(done);
        }).catch(done);
      });

      it('no validity no session storing', function(done){
        var doAction = function(){
          user.auth(alias+type, pass+' new').then(doCheck(done)).catch(done);
        };
        user.recall(0).then(doAction).catch(done);
      });

      it('with validity but no PIN stores using random PIN', function(done){
        var doAction = function(){
          user.auth(alias+type, pass+' new').then(doCheck(done)).catch(done);
        };
        user.recall(12 * 60).then(doAction)
        .catch(done);
      });

      it('validity and auth with PIN but storage empty', function(done){
        user.auth(alias+type, pass+' new').then(function(usr){
          var sUser;
          var sRemember;
          try{
            expect(usr).to.not.be(undefined);
            expect(usr).to.not.be('');
            expect(usr).to.not.have.key('err');
            expect(usr).to.have.key('put');

            sUser = root.sessionStorage.getItem('user');
            expect(sUser).to.be(alias+type);

            sRemember = root.sessionStorage.getItem('remember');
            expect(sRemember).to.not.be(undefined);
            expect(sRemember).to.not.be('');
          }catch(e){ done(e); return }
          user.leave().then(function(ack){
            try{
              expect(ack).to.have.key('ok');
              expect(gun.back(-1)._.user).to.not.have.keys([ 'sea', 'pub' ]);
              expect(root.sessionStorage.getItem('user')).to.not.be(sUser);
              expect(root.sessionStorage.getItem('remember')).to.not.be(sRemember);
            }catch(e){ done(e); return }
            // Restore but leave IndexedDB empty
            root.sessionStorage.setItem('user', sUser);
            root.sessionStorage.setItem('remember', sRemember);

            user.recall(12 * 60).then(
              doCheck(function(ack){
                expect(ack).to.have.key('err');
                expect(ack.err.toLowerCase().indexOf('no session')).to.not.be(-1);
                  checkIndexedDB(alias+type, 'auth', function(auth){
                    expect((typeof auth !== 'undefined' && auth !== null && auth !== ''))
                    .to.not.eql(true);
                    done();
                  });
              }, false, true))
            .catch(done);
          }).catch(done);
        }).catch(done);
      });

      it('valid session bootstrap', function(done){
        var sUser;
        var sRemember;
        var iAuth;
        user.auth(alias+type, pass+' new', {pin: 'PIN'}).then(function(usr){
          try{
            expect(usr).to.not.be(undefined);
            expect(usr).to.not.be('');
            expect(usr).to.not.have.key('err');
            expect(usr).to.have.key('put');
            expect(root.sessionStorage.getItem('user')).to.be(alias+type);
            expect(root.sessionStorage.getItem('remember')).to.not.be(undefined);
            expect(root.sessionStorage.getItem('remember')).to.not.be('');

            sUser = root.sessionStorage.getItem('user');
            sRemember = root.sessionStorage.getItem('remember');
          }catch(e){ done(e); return }

          return new Promise(function(resolve){
            checkIndexedDB(sUser, 'auth', function(auth){ resolve(iAuth = auth) });
          });
        }).then(function(){
          return user.leave().then(function(ack){
            try{
              expect(ack).to.have.key('ok');
              expect(gun.back(-1)._.user).to.not.have.keys([ 'sea', 'pub' ]);
              expect(root.sessionStorage.getItem('user')).to.not.be(sUser);
              expect(root.sessionStorage.getItem('remember')).to.not.be(sRemember);
            }catch(e){ done(e); return }

            return new Promise(function(resolve){
              checkIndexedDB(sUser, 'auth', function(auth){
                expect(auth).to.not.be(iAuth);
                resolve();
              });
            });
          }).then(function(){
            root.sessionStorage.setItem('user', sUser);
            root.sessionStorage.setItem('remember', sRemember);

            return new Promise(function(resolve){
              setIndexedDB(sUser, iAuth, resolve);
            });
          }).then(function(){
            user.recall(12 * 60).then(doCheck(done))
            .catch(done);
          }).catch(done);
        }).catch(done);
      });

      it('valid session bootstrap using alias & PIN', function(done){
        let sRemember
        user.recall(12 * 60).then(function(){
          return user.auth(alias+type, pass+' new', {pin: 'PIN'});
        }).then(doCheck(function(ack){
          // Let's save remember props
          var sUser = root.sessionStorage.getItem('user');
          sRemember = root.sessionStorage.getItem('remember')
          var iAuth = ack.auth;
          return new Promise(function(resolve){
            checkIndexedDB(sUser, 'auth', function(auth){
              iAuth = auth;
              resolve(user.leave());  // Then logout user
            });
          }).then(function(ack){
            try{
              expect(ack).to.have.key('ok');
              expect(gun.back(-1)._.user).to.not.have.keys([ 'sea', 'pub' ]);
              expect(root.sessionStorage.getItem('user')).to.not.be(sUser);
              expect(root.sessionStorage.getItem('remember')).to.not.be(sRemember);
            }catch(e){ done(e); return }
            return new Promise(function(resolve){
              checkIndexedDB(sUser, 'auth', function(auth){
                try{ expect(auth).to.not.be(iAuth) }catch(e){ done(e) }
                // Then restore IndexedDB but skip sessionStorage remember
                setIndexedDB(sUser, iAuth, function(){
                  root.sessionStorage.setItem('user', sUser);
                  resolve(ack);
                });
              });
            });
          });
        }, true, true)).then(function(){
          // Then try to recall authentication
          return user.recall(12 * 60).then(function(props){
            try{
              expect(props).to.not.be(undefined);
              expect(props).to.not.be('');
              expect(props).to.have.key('err');
              // Which fails to missing PIN
              expect(props.err.toLowerCase()
              .indexOf('missing pin')).not.to.be(-1);
            }catch(e){ done(e); return }
            root.sessionStorage.setItem('remember', sRemember)
            // Ok, time to try auth with alias & PIN
            return user.auth(alias+type, undefined, {pin: 'PIN'});
          });
        }).then(doCheck(function(usr){
          try{
            expect(usr).to.not.be(undefined);
            expect(usr).to.not.be('');
            expect(usr).to.not.have.key('err');
            expect(usr).to.have.key('put');
          }catch(e){ done(e); return }
          // We've recalled authenticated session using alias & PIN!
          done();
        }, true, true)).catch(done);
      });

      it('valid session fails to bootstrap with alias & wrong PIN',
      function(done){
        user.recall(12 * 60).then(function(){
          return user.auth(alias+type, pass+' new', {pin: 'PIN'});
        }).then(doCheck(function(ack){
          var sUser = root.sessionStorage.getItem('user');
          var sRemember = root.sessionStorage.getItem('remember');
          var iAuth = ack.auth;
          return new Promise(function(resolve){
            checkIndexedDB(sUser, 'auth', function(auth){
              iAuth = auth;
              resolve(user.leave());  // Then logout user
            });
          }).then(function(ack){
            try{
              expect(ack).to.have.key('ok');
              expect(gun.back(-1)._.user).to.not.have.keys([ 'sea', 'pub' ]);
              expect(root.sessionStorage.getItem('user')).to.not.be(sUser);
              expect(root.sessionStorage.getItem('remember')).to.not.be(sRemember);
            }catch(e){ done(e); return }
            return new Promise(function(resolve){
              checkIndexedDB(sUser, 'auth', function(auth){
                try{ expect(auth).to.not.be(iAuth) }catch(e){ done(e) }
                // Then restore IndexedDB auth data, skip sessionStorage
                setIndexedDB(sUser, iAuth, function(){
                  root.sessionStorage.setItem('user', sUser);
                  resolve(ack);
                });
              });
            });
          });
        }, true, true)).then(function(){
            // Ok, time to try auth with alias & PIN
            return user.auth(alias+type, undefined, {pin: 'PiN'});
        }).then(function(){
          done('Unexpected login success!');
        }).catch(function(ack){
          try{
            expect(ack).to.not.be(undefined);
            expect(ack).to.not.be('');
            expect(ack).to.have.key('err');
            expect(ack.err.toLowerCase()
            .indexOf('no session data for alias & pin')).not.to.be(-1);
          }catch(e){ done(e); return }
          // We've recalled authenticated session using alias & PIN!
          done();
        });
      });

      it('expired session fails to bootstrap', function(done){
        var pin = 'PIN';
        user.recall(60).then(function(){
          return user.auth(alias+type, pass+' new', {pin: pin});
        }).then(doCheck(function(){
          // Storage data OK, let's back up time of auth to exp + 65 seconds
          return manipulateStorage(function(props){
            var ret = Object.assign({}, props, {iat: props.iat - 65 - props.exp});
            return ret;
          }, pin);
        })).then(() => throwOutUser(false)) // Simulate browser reload
        .then(() => user.recall(60).then((ack) => {
          expect(ack).to.not.be(undefined)
          expect(ack).to.not.be('')
          expect(ack).to.not.have.keys([ 'pub', 'sea' ])
          expect(ack).to.have.key('err')
          expect(ack.err).to.not.be(undefined)
          expect(ack.err).to.not.be('')
          expect(ack.err.toLowerCase()
          .indexOf('no session')).not.to.be(-1)
          done()
        })).catch(done)
      });

      it('changed password', function(done){
        var pin = 'PIN';
        var sUser;
        var sRemember;
        var iAuth;
        user.recall(60).then(function(){
          return user.auth(alias+type, pass+' new', {pin: pin});
        }).then(function(usr){
          try{
            expect(usr).to.not.be(undefined);
            expect(usr).to.not.be('');
            expect(usr).to.not.have.key('err');
            expect(usr).to.have.key('put');

            sUser = root.sessionStorage.getItem('user');
            expect(sUser).to.be(alias+type);

            sRemember = root.sessionStorage.getItem('remember');
            expect(sRemember).to.not.be(undefined);
            expect(sRemember).to.not.be('');
          }catch(e){ done(e); return }

          return new Promise(function(resolve){
            checkIndexedDB(sUser, 'auth', function(auth){ resolve(iAuth = auth) });
          });
        }).then(function(){
          return user.leave().then(function(ack){
            try{ expect(ack).to.have.key('ok') }catch(e){ done(e); return }

            return user.auth(alias+type, pass+' new', {newpass: pass, pin: pin})
            .then(function(usr){ expect(usr).to.not.have.key('err') });
          }).then(() => user.leave().then((ack) => {
            try {
              expect(ack).to.have.key('ok')
            } catch (e) { done(e); return }
            return throwOutUser(false)
          })).then(function(){
            // Simulate browser reload
            // Call back pre-update remember...
            root.sessionStorage.setItem('user', sUser);
            root.sessionStorage.setItem('remember', sRemember);
            // ... and IndexedDB auth
            return new Promise(function(resolve){
              setIndexedDB(sUser, iAuth, resolve);
            });
          }).then(function(){
            user.recall(60).then(function(props){
              expect(props).to.not.be(undefined);
              expect(props).to.not.be('');
              expect(props).to.have.key('err');
              expect(props.err).to.not.be(undefined);
              expect(props.err).to.not.be('');
              expect(props.err.toLowerCase()
              .indexOf('failed to decrypt')).not.to.be(-1);
              done();
            }).catch(done);
          }).catch(done);
        }).catch(done);
      });

      it('recall hook session manipulation', function(done){
        var pin = 'PIN';
        var exp;
        var hookFunc = function(props){
          exp = props.exp * 2;  // Doubles session expiration time
          var ret = Object.assign({}, props, {exp: exp});
          return new Promise(function(resolve){
            resolve(ret); // Both callback & Promise methods here
          });
        };
        user.recall(60, {hook: hookFunc}).then(function(){
          return user.auth(alias+type, pass, {pin: pin});
        }).then(function(){
          return manipulateStorage(function(props){
            expect(props).to.not.be(undefined);
            expect(props).to.have.key('exp');
            expect(props.exp).to.be(exp);
            return props;
          }, pin);
        }).then(done).catch(done);
      });
    });

    describe('alive', function(){
      it('valid session', function(done){
        var check = function(ack){
          try{
            expect(ack).to.not.be(undefined);
            expect(ack).to.not.be('');
            expect(ack).to.not.have.key('err');
            expect(ack).to.have.keys([ 'sea', 'pub' ]);
          }catch(e){ done(e); return }
          done();
        };
        var aliveUser = alias+type+'alive';
        user.create(aliveUser, pass).then(function(ack){
          expect(ack).to.not.be(undefined);
          expect(ack).to.not.be('');
          expect(ack).to.have.keys([ 'ok', 'pub' ]);
          user.auth(aliveUser, pass, {pin: 'PIN'}).then(function(usr){
            try{
              expect(usr).to.not.be(undefined);
              expect(usr).to.not.be('');
              expect(usr).to.not.have.key('err');
              expect(usr).to.have.key('put');
            }catch(e){ done(e); return }
            // Gun.user.alive - keeps/checks User authentiation state
            user.alive().then(check).catch(done);
          }).catch(done);
        }).catch(done);
      });

      it('expired session', function(done){
        var check = function(ack){
          try{
            expect(ack).to.not.be(undefined);
            expect(ack).to.not.be('');
            expect(ack).to.not.have.keys([ 'sea', 'pub' ]);
            expect(ack).to.have.key('err');
            expect(ack.err.toLowerCase().indexOf('no session')).not.to.be(-1);
          }catch(e){ done(e); return }
          done();
        };
        user.leave().catch(function(){}).then(function(){
          user.alive().then(function(){
            done('Unexpected alive session!');
          }).catch(check);
        }).catch(done);
      });
    });

    process.env.SEA_CHANNEL && describe('User channel', function(){
      it.skip('create');
      it.skip('add member');
    });

    Gun.log.off = false;
  });
});

}());
