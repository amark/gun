var root;

(function(env){
  root = env.window ? env.window : global;
}(this));

Gun.SEA && describe('SEA', function(){
  console.log('TODO: SEA! THIS IS AN EARLY ALPHA!!!');
  var alias = 'dude';
  var pass = 'my secret password';
  var userKeys = ['pub', 'priv'];
  var clearText = 'My precious secret!';
  var encKeys = ['ct', 'iv', 's'];

  ['callback', 'Promise'].forEach(function(type){
    describe(type+':', function(){
      it('proof', function(done){
        var check = function(proof){
          expect(proof).to.not.be(undefined);
          expect(proof).to.not.be('');
          done();
        }
        // proof - generates PBKDF2 hash from user's alias and password
        // which is then used to decrypt user's auth record
        if(type === 'callback'){
          Gun.SEA.proof(alias, pass, check);
        } else {
          Gun.SEA.proof(alias, pass).then(check).catch(done);
        }
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
        if(type === 'callback'){
          Gun.SEA.pair(check);
        } else {
          Gun.SEA.pair().then(check).catch(done);;
        }
      });

      it('en', function(done){
        Gun.SEA.pair().then(function(key){
          var check = function(jsonSecret){
            expect(jsonSecret).to.not.be(undefined);
            expect(jsonSecret).to.not.be('');
            expect(jsonSecret).to.not.eql(clearText);
            expect(jsonSecret).to.not.eql(JSON.stringify(clearText));
            var objSecret = JSON.parse(jsonSecret);
            expect(objSecret).to.have.keys(encKeys);
            encKeys.map(function(key){
              expect(objSecret[key]).to.not.be(undefined);
              expect(objSecret[key]).to.not.be('');
            });
            done();
          };
          // en - encrypts JSON data using user's private or derived ECDH key
          if(type === 'callback'){
            Gun.SEA.en(JSON.stringify(clearText), key.priv, check);
          } else {
            Gun.SEA.en(JSON.stringify(clearText), key.priv).then(check);
          }
        }).catch(function(e){done(e)});
      });

      it('sign', function(done){
        Gun.SEA.pair().then(function(key){
          var check = function(signature){
            expect(signature).to.not.be(undefined);
            expect(signature).to.not.be('');
            expect(signature).to.not.eql(key.pub);
            done();
          };
          // sign - calculates signature for data using user's private ECDH key
          if(type === 'callback'){
            Gun.SEA.sign(key.pub, key.priv, check);
          } else {
            Gun.SEA.sign(key.pub, key.priv).then(check);
          }
        }).catch(function(e){done(e)});
      });

      it('verify', function(done){
        Gun.SEA.pair().then(function(key){
          var check = function(ok){
            expect(ok).to.not.be(undefined);
            expect(ok).to.not.be('');
            expect(ok).to.be(true);
            done();
          };
          // sign - calculates signature for data using user's private ECDH key
          Gun.SEA.sign(key.pub, key.priv).then(function(signature){
            if(type === 'callback'){
              Gun.SEA.verify(key.pub, key.pub, signature, check);
            } else {
              Gun.SEA.verify(key.pub, key.pub, signature).then(check);
            }
          });
        }).catch(function(e){done(e)});
      });

      it('de', function(done){
        Gun.SEA.pair().then(function(key){
          var check = function(jsonText){
            expect(jsonText).to.not.be(undefined);
            expect(jsonText).to.not.be('');
            expect(jsonText).to.not.eql(clearText);
            var decryptedSecret = JSON.parse(jsonText);
            expect(decryptedSecret).to.not.be(undefined);
            expect(decryptedSecret).to.not.be('');
            expect(decryptedSecret).to.be.eql(clearText);
            done();
          };
          Gun.SEA.en(JSON.stringify(clearText), key.priv).then(function(jsonSecret){
            // de - decrypts JSON data using user's private or derived ECDH key
            if(type === 'callback'){
              Gun.SEA.de(jsonSecret, key.priv, check);
            } else {
              Gun.SEA.de(jsonSecret, key.priv).then(check);
            }
          });
        }).catch(function(e){done(e)});
      });

      it('derive', function(done){
        Gun.SEA.pair().then(function(txKey){
          return Gun.SEA.pair().then(function(rxKey){
            return { tx: txKey, rx: rxKey };
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
          if(type === 'callback'){
            Gun.SEA.derive(keys.rx.pub, keys.tx.priv, check);
          } else {
            Gun.SEA.derive(keys.rx.pub, keys.tx.priv).then(check);
          }
        }).catch(function(e){done(e)});
      });

      it('write', function(done){
        Gun.SEA.pair().then(function(key){
          Gun.SEA.sign(key.pub, key.priv).then(function(signature){
            var check = function(result){
              expect(result).to.not.be(undefined);
              expect(result).to.not.be('');
              expect(result.slice(0, 4)).to.eql('SEA[');
              var parts = JSON.parse(result.slice(3));
              expect(parts).to.not.be(undefined);
              expect(parts[0]).to.be.eql(key.pub);
              expect(parts[1]).to.be.eql(signature);
              done();
            };
            // write - wraps data to 'SEA["data","signature"]'
            if(type === 'callback'){
              Gun.SEA.write(key.pub, key.priv, check);
            } else {
              Gun.SEA.write(key.pub, key.priv).then(check);
            }
          });
        }).catch(function(e){done(e)});
      });

      it('read', function(done){
        Gun.SEA.pair().then(function(key){
          var check = function(result){
            expect(result).to.not.be(undefined);
            expect(result).to.not.be('');
            expect(result).to.be.equal(key.pub);
            done();
          };
          Gun.SEA.sign(key.pub, key.priv).then(function(signature){
            Gun.SEA.write(key.pub, key.priv).then(function(signed){
              // read - unwraps data from 'SEA["data","signature"]'
              if(type === 'callback'){
                Gun.SEA.read(signed, key.pub, check);
              } else {
                Gun.SEA.read(signed, key.pub).then(check);
              }
            });
          });
        }).catch(function(e){done(e)});
      });
    });
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

    // Simulate browser reload
    gun.back(-1)._.user = gun.back(-1).chain();

    ['callback', 'Promise'].forEach(function(type){
      describe(type+':', function(){
        describe('create', function(){
          it('new', function(done){
            var check = function(ack){
              try{
                expect(ack).to.not.be(undefined);
                expect(ack).to.not.be('');
                expect(ack).to.have.keys(['ok','pub']);
              }catch(e){ done(e); return };
              done();
            };
            // Gun.user.create - creates new user
            if(type === 'callback'){
              user.create(alias+type, pass, check);
            } else {
              user.create(alias+type, pass).then(check).catch(done);
            }
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
              }catch(e){ done(e); return };
              done();
            };
            // Gun.user.create - fails to create existing user
            if(type === 'callback'){
              user.create(alias+type, pass, check);
            } else {
              user.create(alias+type, pass).then(function(ack){
                done('Failed to decline creating existing user!');
              }).catch(check);
            }
          });
        });

        describe('auth', function(){
          var checkStorage = function(done, hasPin){
            return function(){
              expect(root.sessionStorage.getItem('user')).to.not.be(undefined);
              expect(root.sessionStorage.getItem('user')).to.not.be('');
              expect(root.sessionStorage.getItem('remember')).to.not.be(undefined);
              expect(root.sessionStorage.getItem('remember')).to.not.be('');
              if(hasPin){
                expect(root.localStorage.getItem('remember')).to.not.be(undefined);
                expect(root.localStorage.getItem('remember')).to.not.be('');
              }
              done();
            };
          };

          it('login', function(done){
            var check = function(ack){
              try{
                expect(ack).to.not.be(undefined);
                expect(ack).to.not.be('');
                expect(ack).to.not.have.key('err');
              }catch(e){ done(e); return };
              done();
            };
            // Gun.user.auth - authenticates existing user
            if(type === 'callback'){
              user.auth(alias+type, pass, check);
            } else {
              user.auth(alias+type, pass).then(check).catch(done);
            }
          });

          it('wrong password', function(done){
            var check = function(ack){
              try{
                expect(ack).to.not.be(undefined);
                expect(ack).to.not.be('');
                expect(ack).to.have.key('err');
                expect(ack.err).to.not.be(undefined);
                expect(ack.err).to.not.be('');
              }catch(e){ done(e); return };
              done();
            };
            if(type === 'callback'){
              user.auth(alias+type, pass+'not', check);
            } else {
              user.auth(alias+type, pass+'not').then(function(ack){
                done('Unexpected login success!');
              }).catch(check);
            }
          });

          it('unknown alias', function(done){
            var check = function(ack){
              try{
                expect(ack).to.not.be(undefined);
                expect(ack).to.not.be('');
                expect(ack).to.have.key('err');
                expect(ack.err).to.not.be(undefined);
                expect(ack.err).to.not.be('');
              }catch(e){ done(e); return };
              done();
            };
            if(type === 'callback'){
              user.auth(alias+type+'not', pass, check);
            } else {
              user.auth(alias+type+'not', pass).then(function(ack){
                done('Unexpected login success!');
              }).catch(check);
            }
          });

          it('new password', function(done){
            var check = function(ack){
              try{
                expect(ack).to.not.be(undefined);
                expect(ack).to.not.be('');
                expect(ack).to.not.have.key('err');
              }catch(e){ done(e); return };
              done();
            };
            // Gun.user.auth - with newpass props sets new password
            if(type === 'callback'){
              user.auth(alias+type, pass, check, {newpass: pass+' new'});
            } else {
              user.auth(alias+type, pass, {newpass: pass+' new'}).then(check)
              .catch(done);
            }
          });

          it('failed new password', function(done){
            var check = function(ack){
              try{
                expect(ack).to.not.be(undefined);
                expect(ack).to.not.be('');
                expect(ack).to.have.key('err');
                expect(ack.err).to.not.be(undefined);
                expect(ack.err).to.not.be('');
              }catch(e){ done(e); return };
              done();
            };
            var props = {alias: alias+type, pass: pass+'not', newpass: pass+' new'};
            if(type === 'callback'){
              user.auth(alias+type, pass+'not', check, {newpass: pass+' new'});
            } else {
              user.auth(alias+type, pass+'not', {newpass: pass+' new'})
              .then(function(ack){
                done('Unexpected password change success!');
              }).catch(check);
            }
          });

          it('without PIN auth session stored to sessionStorage', function(done){
            user.auth(alias+type, pass+' new').then(checkStorage(done)).catch(done);
          });

          it('with PIN auth session stored to sessionStorage', function(done){
            if(type === 'callback'){
              user.auth(alias+type, pass+' new', checkStorage(done, true), {pin: 'PIN'});
            } else {
              user.auth(alias+type, pass+' new', {pin: 'PIN'})
              .then(checkStorage(done, true)).catch(done);
            }
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
                expect(gun.back(-1)._.user).to.not.have.keys(['sea', 'pub']);
              }catch(e){ done(e); return };
              done();
            };
            var usr = alias+type+'leave';
            user.create(usr, pass).then(function(ack){
              expect(ack).to.not.be(undefined);
              expect(ack).to.not.be('');
              expect(ack).to.have.keys(['ok','pub']);
              user.auth(usr, pass).then(function(usr){
                try{
                  expect(usr).to.not.be(undefined);
                  expect(usr).to.not.be('');
                  expect(usr).to.not.have.key('err');
                  expect(usr).to.have.key('put');
                }catch(e){ done(e); return };
                // Gun.user.leave - performs logout for authenticated user
                if(type === 'callback'){
                  user.leave(check);
                } else {
                  user.leave().then(check).catch(done);
                }
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
              }catch(e){ done(e); return };
              done();
            };
            expect(gun.back(-1)._.user).to.not.have.keys(['sea', 'pub']);
            if(type === 'callback'){
              user.leave(check);
            } else {
              user.leave().then(check).catch(done);
            }
          });
        });

        describe('delete', function(){
          var usr = alias+type+'del';

          var createUser = function(a, p){
            return user.create(a, p).then(function(ack){
              expect(ack).to.not.be(undefined);
              expect(ack).to.not.be('');
              expect(ack).to.have.keys(['ok','pub']);
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
                expect(gun.back(-1)._.user).to.not.have.keys(['sea', 'pub']);
              }catch(e){ done(e); return };
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
                }catch(e){ done(e); return };
                // Gun.user.delete - deletes existing user account
                if(type === 'callback'){
                  user.delete(usr, pass, check(done));
                } else {
                  user.delete(usr, pass).then(check(done)).catch(done);
                }
              }).catch(done);
            }).catch(done);
          });

          it('unauthenticated existing user', function(done){
            createUser(usr, pass).catch(function(){})
            .then(function(){
              if(type === 'callback'){
                user.delete(usr, pass, check(done));
              } else {
                user.delete(usr, pass).then(check(done)).catch(done);
              }
            });
          });

          it('non-existing user', function(done){
            var notFound = function(ack){
              try{
                expect(ack).to.not.be(undefined);
                expect(ack).to.not.be('');
                expect(ack).to.not.have.key('put');
                expect(ack).to.have.key('err');
              }catch(e){ done(e); return };
              done();
            };
            if(type === 'callback'){
              user.delete('someone', 'password guess', notFound);
            } else {
              user.delete('someone', 'password guess').then(function(){
                done('Unexpectedly deleted guessed user!');
              }).catch(notFound);
            }
          });
        });

        describe('recall', function(){
          var doCheck = function(done, hasPin){
            return function(){
              expect(root.sessionStorage.getItem('user')).to.not.be(undefined);
              expect(root.sessionStorage.getItem('user')).to.not.be('');
              expect(root.sessionStorage.getItem('remember')).to.not.be(undefined);
              expect(root.sessionStorage.getItem('remember')).to.not.be('');
              if(hasPin){
                expect(root.localStorage.getItem('remember')).to.not.be(undefined);
                expect(root.localStorage.getItem('remember')).to.not.be('');
              }
              return done();
            };
          };
          // This re-constructs 'remember-me' data modified by manipulate func
          var manipulateStorage = function(manipulate, hasPin){
            var usr = gun.back(-1)._.user;
            var remember = hasPin ? localStorage.getItem('remember')
            : sessionStorage.getItem('remember');
            return Gun.SEA.read(remember, usr._.pub).then(function(props){
              props = manipulate(JSON.parse(props));
              return Gun.SEA.write(JSON.stringify(props), usr._.sea)
              .then(function(remember){
                // remember = JSON.stringify(remember);
                return hasPin ? sessionStorage.setItem('remember', remember)
                : sessionStorage.setItem('remember', remember);
              });
            });
          };

          it('with PIN auth session stored to localStorage', function(done){
            var doAction = function(){
              user.auth(alias+type, pass+' new', { pin: 'PIN' })
              .then(doCheck(done, true)).catch(done);
            };
            if(type === 'callback'){
              user.recall(doAction, { session: false });
            } else {
              user.recall({ session: false }).then(doAction).catch(done)
            }
          });

          it('without PIN auth session stored to sessionStorage', function(done){
            var doAction = function(){
              user.auth(alias+type, pass+' new').then(doCheck(done));
            };
            user.leave().then(function(){
              if(type === 'callback'){
                user.recall(doAction, { session: false });
              } else {
                user.recall({ session: false }).then(doAction).catch(done)
              }
            }).catch(done);
          });

          it('no validity no session storing', function(done){
            var doAction = function(){
              user.auth(alias+type, pass+' new').then(doCheck(done)).catch(done);
            };
            if(type === 'callback'){
              user.recall(0, doAction);
            } else {
              user.recall(0).then(doAction).catch(done);
            }
          });

          it('validity but no PIN stored to sessionStorage', function(done){
            var doAction = function(){
              user.auth(alias+type, pass+' new').then(doCheck(done)).catch(done);
            };
            if(type === 'callback'){
              user.recall(12 * 60 * 60, doAction, {session: false});
            } else {
              user.recall(12 * 60 * 60, {session: false}).then(doAction)
              .catch(done);
            }
          });

          it('valid sessionStorage session', function(done){
            user.auth(alias+type, pass+' new').then(function(usr){
              var sUser;
              var sRemember;
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
              }catch(e){ done(e); return };
              user.leave().then(function(ack){
                try{
                  expect(ack).to.have.key('ok');
                  expect(gun.back(-1)._.user).to.not.have.keys(['sea', 'pub']);
                  expect(root.sessionStorage.getItem('user')).to.not.be(sUser);
                  expect(root.sessionStorage.getItem('remember')).to.not.be(sRemember);
                }catch(e){ done(e); return };

                root.sessionStorage.setItem('user', sUser);
                root.sessionStorage.setItem('remember', sRemember);

                user.recall(12 * 60 * 60, {session: false}).then(doCheck(done))
                .catch(done);
              }).catch(done);
            }).catch(done);
          });

          it('valid localStorage session bootstrap', function(done){
            user.auth(alias+type, pass+' new', { pin: 'PIN' }).then(function(usr){
              var sUser;
              var sRemember;
              var lRemember;
              try{
                expect(usr).to.not.be(undefined);
                expect(usr).to.not.be('');
                expect(usr).to.not.have.key('err');
                expect(usr).to.have.key('put');
                expect(root.sessionStorage.getItem('user')).to.be(alias+type);
                expect(root.sessionStorage.getItem('remember')).to.not.be(undefined);
                expect(root.sessionStorage.getItem('remember')).to.not.be('');
                expect(root.localStorage.getItem('remember')).to.not.be(undefined);
                expect(root.localStorage.getItem('remember')).to.not.be('');

                sUser = root.sessionStorage.getItem('user');
                sRemember = root.sessionStorage.getItem('remember');
                lRemember = root.localStorage.getItem('remember');
              }catch(e){ done(e); return };

              user.leave().then(function(ack){
                try{
                  expect(ack).to.have.key('ok');
                  expect(gun.back(-1)._.user).to.not.have.keys(['sea', 'pub']);
                  expect(root.sessionStorage.getItem('user')).to.not.be(sUser);
                  expect(root.sessionStorage.getItem('remember')).to.not.be(sRemember);
                  expect(root.localStorage.getItem('remember')).to.not.be(lRemember);
                }catch(e){ done(e); return };

                root.sessionStorage.setItem('user', sUser);
                root.sessionStorage.setItem('remember', sRemember);
                root.localStorage.setItem('remember', lRemember);

                user.recall(12 * 60 * 60, {session: false}).then(doCheck(done))
                .catch(done);
              }).catch(done);
            }).catch(done);
          });

          it.skip('invalid sessionStorage session');
          it.skip('valid localStorage data but not in sessionStorage');

          it('expired session', function(done){
            user.recall(60, {session: true}).then(function(){
              return user.auth(alias+type, pass+' new');
            }).then(doCheck(function(){
              // Storage data OK, let's back up time of auth 65 minutes
              return manipulateStorage(function(props){
                props.iat -= 65 * 60;
                return props;
              }, false);
            })).then(function(){
              // Simulate browser reload
              gun.back(-1)._.user = gun.back(-1).chain();
              // TODO: re-make sessionStorage.remember to 65 seconds past
              user.recall(60, {session: true}).then(function(props){
                expect(props).to.not.be(undefined);
                expect(props).to.not.be('');
                expect(props).to.have.key('err');
                expect(props.err).to.not.be(undefined);
                expect(props.err).to.not.be('');
                done();
              }).catch(done);
            }).catch(done);
          });

          it('changed password', function(done){
            user.recall(60, {session: false}).then(function(){
              return user.auth(alias+type, pass+' new', { pin: 'PIN' });
            }).then(function(usr){
              var sUser;
              var sRemember;
              var lRemember;
              try{
                expect(usr).to.not.be(undefined);
                expect(usr).to.not.be('');
                expect(usr).to.not.have.key('err');
                expect(usr).to.have.key('put');
                expect(root.sessionStorage.getItem('user')).to.be(alias+type);
                expect(root.sessionStorage.getItem('remember')).to.not.be(undefined);
                expect(root.sessionStorage.getItem('remember')).to.not.be('');
                expect(root.localStorage.getItem('remember')).to.not.be(undefined);
                expect(root.localStorage.getItem('remember')).to.not.be('');

                sUser = root.sessionStorage.getItem('user');
                sRemember = root.sessionStorage.getItem('remember');
                lRemember = root.localStorage.getItem('remember');
              }catch(e){ done(e); return };
              // Time to do new login with new password set
              user.leave().then(function(ack){
                try{
                  expect(ack).to.have.key('ok');
                }catch(e){ done(e); return };

                return user.auth(alias+type, pass+' new', {newpass: pass, pin: 'PIN' }).then(function(usr){
                  expect(usr).to.not.have.key('err');
                });
              }).then(function(){
                return user.leave().then(function(ack){
                  try{
                    expect(ack).to.have.key('ok');
                  }catch(e){ done(e); return };
                  gun.back(-1)._.user = gun.back(-1).chain();
                });
              }).then(function(){
                // Simulate browser reload
                // Call back previous remember data
                root.sessionStorage.setItem('user', sUser);
                root.sessionStorage.setItem('remember', sRemember);
                root.localStorage.setItem('remember', lRemember);

                user.recall(60, {session: false}).then(function(props){
                  expect(props).to.not.be(undefined);
                  expect(props).to.not.be('');
                  expect(props).to.have.key('err');
                  expect(props.err).to.not.be(undefined);
                  expect(props.err).to.not.be('');
                  done();
                }).catch(done);
              }).catch(done);
            }).catch(done);
          });

          it.skip('no session');
        });

        describe('alive', function(){
          it('valid session', function(done){
            var check = function(ack){
              try{
                expect(ack).to.not.be(undefined);
                expect(ack).to.not.be('');
                expect(ack).to.not.have.key('err');
                expect(ack).to.have.keys(['sea', 'pub']);
              }catch(e){ done(e); return };
              done();
            };
            var usr = alias+type+'alive';
            user.create(usr, pass).then(function(ack){
              expect(ack).to.not.be(undefined);
              expect(ack).to.not.be('');
              expect(ack).to.have.keys(['ok','pub']);
              user.auth(usr, pass, { pin: 'PIN' }).then(function(usr){
                try{
                  expect(usr).to.not.be(undefined);
                  expect(usr).to.not.be('');
                  expect(usr).to.not.have.key('err');
                  expect(usr).to.have.key('put');
                }catch(e){ done(e); return };
                // Gun.user.alive - keeps/checks User authentiation state
                if(type === 'callback'){
                  user.alive(check);
                } else {
                  user.alive().then(check).catch(done);
                }
              }).catch(done);
            }).catch(done);
          });

          it('expired session', function(done){
            var check = function(ack){
              try{
                expect(ack).to.not.be(undefined);
                expect(ack).to.not.be('');
                expect(ack).to.not.have.keys(['sea', 'pub']);
                expect(ack).to.have.key('err');
              }catch(e){ done(e); return };
              done();
            };
            user.leave().catch(function(){}).then(function(){
              user.alive().then(function(){
                done('Unexpected alive session!');
              }).catch(check);
            }).catch(done);
          });

          it.skip('recall hook session manipulation');
        });
      });
    });
    Gun.log.off = false;
  });
});
