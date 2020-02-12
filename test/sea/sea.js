var root;
var Gun;
(function(){
  var env;
  if(typeof global !== 'undefined'){ env = global }
  if(typeof window !== 'undefined'){ env = window }
  root = env.window? env.window : global;
  try{ env.window && root.localStorage && root.localStorage.clear() }catch(e){}
  try{ indexedDB.deleteDatabase('radatatest') }catch(e){}
  if(root.Gun){
    root.Gun = root.Gun;
    root.Gun.TESTING = true;
  } else {
    try{ require('fs').unlinkSync('data.json') }catch(e){}
    try{ require('../../lib/fsrm')('radatatest') }catch(e){}
    root.Gun = require('../../gun');
    root.Gun.TESTING = true;
    //require('../lib/file');
    require('../../lib/store');
    require('../../lib/rfs');
  }

  try{ var expect = global.expect = require("../expect") }catch(e){}

  if(!root.Gun.SEA){
    require('../../sea.js');
  }
}(this));

;(function(){
Gun = root.Gun
var SEA = Gun.SEA
if(!SEA){ return }

describe('SEA', function(){
  var user;
  var gun;
  var pub;
  describe('Utility', function(){
    it('generates aeskey from jwk', function(done) {
      console.log("WARNING: THIS DOES NOT WORK IN BROWSER!!!! NEEDS FIX");
      SEA.opt.aeskey('x','x').then(k => {
        //console.log("DATA", k.data);
        expect(k.data.toString('base64')).to.be('Xd6JaIf2dUybFb/jpEGuSAbfL96UABMR4IvxEGIuC74=')
        done()
      })
    })
    it('quickstart', function(done){
      SEA.pair(function(pair){
      SEA.encrypt('hello self', pair, function(enc){
      SEA.sign(enc, pair, function(data){
      SEA.verify(data, pair.pub, function(msg){
      SEA.decrypt(msg, pair, function(dec){
      expect(dec).to.be('hello self');
      SEA.work(dec, pair, function(proof){
      SEA.work('hello self', pair, function(check){
      expect(proof).to.be(check);
      SEA.pair(function(alice){
      SEA.pair(function(bob){
      SEA.secret(bob.epub, alice, function(aes){
      SEA.encrypt('shared data', aes, function(enc){
      SEA.secret(alice.epub, bob, function(aes){
      SEA.decrypt(enc, aes, function(dec){
      expect(dec).to.be('shared data');
      done();
      });});});});});});});});});});});});});
    })

    it('quickwrong', function(done){
      SEA.pair(function(alice){
      SEA.pair(function(bob){
      SEA.sign('asdf', alice, function(data){
      SEA.verify(data, bob.pub, function(msg){
      expect(msg).to.be(undefined);
      SEA.verify(data+1, alice.pub, function(msg){
      expect(msg).to.be(undefined);

      SEA.encrypt('secret', alice, function(enc){
      SEA.decrypt(enc, bob, function(dec){
      expect(dec).to.be(undefined);
      SEA.decrypt(enc+1, alice, function(dec){
      expect(dec).to.be(undefined);
      done();
      });});});});});});});});
    })

    it('types', function(done){
      var pair, s, v;
      SEA.pair(function(pair){
      SEA.sign(null, pair, function(s){
      SEA.verify(s, pair, function(v){
      expect(null).to.be(v);
      SEA.sign(true, pair, function(s){
      SEA.verify(s, pair, function(v){
      expect(true).to.be(v);
      SEA.sign(false, pair, function(s){
      SEA.verify(s, pair, function(v){
      expect(false).to.be(v);
      SEA.sign(0, pair, function(s){
      SEA.verify(s, pair, function(v){
      expect(0).to.be(v);
      SEA.sign(1, pair, function(s){
      SEA.verify(s, pair, function(v){
      expect(1).to.be(v);
      SEA.sign(1.01, pair, function(s){
      SEA.verify(s, pair, function(v){
      expect(1.01).to.be(v);
      SEA.sign('', pair, function(s){
      SEA.verify(s, pair, function(v){
      expect('').to.be(v);
      SEA.sign('a', pair, function(s){
      SEA.verify(s, pair, function(v){
      expect('a').to.be(v);
      SEA.sign([], pair, function(s){
      SEA.verify(s, pair, function(v){
      expect([]).to.eql(v);
      SEA.sign([1], pair, function(s){
      SEA.verify(s, pair, function(v){
      expect([1]).to.eql(v);
      SEA.sign({}, pair, function(s){
      SEA.verify(s, pair, function(v){
      expect({}).to.eql(v);
      SEA.sign({a:1}, pair, function(s){
      SEA.verify(s, pair, function(v){
      expect({a:1}).to.eql(v);
      SEA.sign(JSON.stringify({a:1}), pair, function(s){
      SEA.verify(s, pair, function(v){
      expect({a:1}).to.eql(v);
      done();
      });});});});});});});});});});});});});});});});});});});});});});});});});});});
    })

    it('atypes', function(done){
      var pair, s, v;
      SEA.pair(function(pair){
      SEA.encrypt(null, pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect(null).to.be(v);
      SEA.encrypt(true, pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect(true).to.be(v);
      SEA.encrypt(false, pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect(false).to.be(v);
      SEA.encrypt(0, pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect(0).to.be(v);
      SEA.encrypt(1, pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect(1).to.be(v);
      SEA.encrypt(1.01, pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect(1.01).to.be(v);
      SEA.encrypt('', pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect('').to.be(v);
      SEA.encrypt('a', pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect('a').to.be(v);
      SEA.encrypt([], pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect([]).to.eql(v);
      SEA.encrypt([1], pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect([1]).to.eql(v);
      SEA.encrypt({}, pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect({}).to.eql(v);
      SEA.encrypt({a:1}, pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect({a:1}).to.eql(v);
      SEA.encrypt(JSON.stringify({a:1}), pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect({a:1}).to.eql(v);
      done();
      });});});});});});});});});});});});});});});});});});});});});});});});});});});
    })
    
    /*it('DOESNT DECRYPT SCIENTIFIC NOTATION', function(done){
      var pair, s, v;
      SEA.pair(function(pair){
      SEA.encrypt('4e2', pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect(400).to.be(v);
      done();
      });});});
    })*/
    
    it('legacy', function(done){ (async function(){
      var pw = 'test123';
      // https://cdn.jsdelivr.net/npm/gun@0.9.99999/sea.js !
      var old = JSON.parse(atob("eyJfIjp7IiMiOiJ+TkJhdDdKeUk0REw1ZDlPMEZNbWVFN0RacVZRZUVPblhKcldycDVUUGlyMC5PckV6WVIwc3h0NHRtV0tiajFQdHRaeW1HUmdyc1FVVDNHaTk1UE9vMUdBIiwiPiI6eyJwdWIiOjEsImFsaWFzIjoxLCJlcHViIjoxLCJhdXRoIjoxfX0sInB1YiI6Ik5CYXQ3SnlJNERMNWQ5TzBGTW1lRTdEWnFWUWVFT25YSnJXcnA1VFBpcjAuT3JFellSMHN4dDR0bVdLYmoxUHR0WnltR1JncnNRVVQzR2k5NVBPbzFHQSIsImFsaWFzIjoiU0VBe1wibVwiOlwiXFxcImJvYlxcXCJcIixcInNcIjpcIt4uXFx1MDAwNCpbcECT/sxe83eYe/M+bmBF+q5dQr7eYELndMJkXFx1MDAwYlxcbtFu6HNWUKh6XFxyfrWqwcRcXHUwMDE1e3BMv2poWlxcYktcXHUwMDEzZ5H/Z5VcIn0iLCJlcHViIjoiU0VBe1wibVwiOlwiXFxcIkdJUGY2dl8zeV9DZUpQMWtFZkt2OWpmZ3QwT2ZGeDRycHBKS01wSE9MLVEuTmM2dElDUlpwbGwxMG45V2NsRzhXNC1tdDFXZnI2cmh3c0JyN1pRTlduY1xcXCJcIixcInNcIjpcIlxcdTAwMTZcXHUwMDAwzVxcdTAwMGahrvVcXHUwMDBm9y77iP1V3IhkWOajKMxcXHUwMDEy/VxcdTAwMDHN+VxcbozxNWRcXHUwMDA1Zej5XFx1MDAwMpSOXFx1MDAwNny4IclB+lxcdTAwMWTgoXnR8S1OyuZcXHUwMDAx9PqwXFxiXFx1MDAwMFF3XCJ9IiwiYXV0aCI6IlNFQXtcIm1cIjpcIntcXFwiZWtcXFwiOlxcXCJTRUF7XFxcXFxcXCJjdFxcXFxcXFwiOlxcXFxcXFwiXFxcXFxcXFx1MDAwMGvAI6W0L03DwFxcXFxcXFxcdTAwMDZcXFxcXFxcXHUwMDA0ZibqQdE0XFxcXFxcXFx1MDAxY4VvtTZcXFxcXFxcXG7xXfBcXFxcXFxcXHUwMDAzo5xcXFxcXFxcXHUwMDE3XFxcXFxcXFx1MDAwMf9PXFxcXFxcXFx1MDAxMJhnXFxcXFxcXFx1MDAwNccti2pifouBhtu7qcw4/mPs1SHS4uyBTo1RTuReXFxcXFxcXFx1MDAxMK9W4clcXFxcXFxcXHUwMDBmYt1oSIRcXFxcXFxcXHUwMDE4PF5gxoRS2UYtV/1LwHn1SlxcXFxcXFxcXFxcXFxcXFyYuFU3cUVf09/AXFxcXFxcXFx1MDAwZlxcXFxcXFxcdTAwMDRQN8RlXFxcXFxcXFx1MDAwNlxcXFxcXFxcdTAwMGXM4G3fXFxcXFxcXFx1MDAxZt+eRoV9XFxcXFxcXCIsXFxcXFxcXCJpdlxcXFxcXFwiOlxcXFxcXFwiVU5Lv+Zko1xcXFxcXFxcdTAwMDOt1ET2JHhcXFxcXFxcXHUwMDE1/1xcXFxcXFwiLFxcXFxcXFwic1xcXFxcXFwiOlxcXFxcXFwiz0VOO9GwaJlcXFxcXFxcIn1cXFwiLFxcXCJzXFxcIjpcXFwiZ0F4TFJpa2dEakIzbXJDNGpucUFRak5NNEZXemF0a1Eyb2xDR2Z5TTc2amg3azNEUzAyRlp1MEV1eWg2RGFITlxcXCJ9XCIsXCJzXCI6XCKze+BcXHUwMDBilPlcXHUwMDA2z1srodVcXHUwMDA0P1xcXCJcXFwib2rndUadtqJcXHUwMDE2bFtf0PSvJNdcXHUwMDE2Y71nnlxcdTAwMWOZXFx1MDAwN1xcdTAwMTlcXHUwMDE36NZcXHUwMDA0Uk7DQK/y/oixrIr1XFx1MDAxZnVcXHUwMDE3oCBhXCJ9In0="));
      var okey = {"pub":"NBat7JyI4DL5d9O0FMmeE7DZqVQeEOnXJrWrp5TPir0.OrEzYR0sxt4tmWKbj1PttZymGRgrsQUT3Gi95POo1GA","epub":"GIPf6v_3y_CeJP1kEfKv9jfgt0OfFx4rppJKMpHOL-Q.Nc6tICRZpll10n9WclG8W4-mt1Wfr6rhwsBr7ZQNWnc","priv":"leIA-BOFLECsOOdT_B8B0s1Ii0VHZZGlHz8q_dK-xLs","epriv":"1BTJpYdwSLesrtuB7pYQdsrFHsxKSJ-d9PXt2qp6NyQ"}
      var auth = await SEA.verify(old.auth, old.pub);
      var proof = await SEA.work(pw, auth.s, null, {encode: 'utf8'});
      var dec = await SEA.decrypt(auth.ek, proof, null);
      expect(dec.priv).to.be(okey.priv);
      expect(dec.epriv).to.be(okey.epriv);

      var gun = Gun(), tmp = Gun.node.soul(old);
      var graph = {};
      graph[tmp] = old;
      var alias = await SEA.verify(old.alias, false);
      expect(alias).to.be('bob');
      alias = Gun.state.ify({}, tmp, 1, Gun.val.rel.ify(tmp), tmp = '~@'+alias);
      graph[tmp] = alias;
      gun.on('put', {$: gun, put: graph});
      var use = gun.user();
      use.auth('bob', 'test123', function(ack){
        expect(ack.err).to.not.be.ok();
        done();
      });
    }())})
    
    it('legacy []', function(done){ (async function(){
      var pw = 'test123';
      // https://cdn.jsdelivr.net/npm/gun@0.9.99999/sea.js !
      var old = JSON.parse(atob("eyJfIjp7IiMiOiJ+VThkS0dySFJhX01sMFZ1YlR5OUZBYTlQS1ZlYlh0eTFjS05zWWxnYjduNC5QeVd5cUVVb0ZpYVduUElOV0Nad0xBbzFobjN1MldPWTU3SzZHZnpsNjhVIiwiPiI6eyJwdWIiOjE1NDY5MDI1MDQ5NzksImFsaWFzIjoxNTQ2OTAyNTA0OTc5LCJlcHViIjoxNTQ2OTAyNTA0OTc5LCJhdXRoIjoxNTQ2OTAyNTA0OTc5fX0sInB1YiI6IlU4ZEtHckhSYV9NbDBWdWJUeTlGQWE5UEtWZWJYdHkxY0tOc1lsZ2I3bjQuUHlXeXFFVW9GaWFXblBJTldDWndMQW8xaG4zdTJXT1k1N0s2R2Z6bDY4VSIsImFsaWFzIjoiU0VBe1wibVwiOltcIn5VOGRLR3JIUmFfTWwwVnViVHk5RkFhOVBLVmViWHR5MWNLTnNZbGdiN240LlB5V3lxRVVvRmlhV25QSU5XQ1p3TEFvMWhuM3UyV09ZNTdLNkdmemw2OFVcIixcImFsaWFzXCIsXCJhbGljZVwiLDE1NDY5MDI1MDQ5NzldLFwic1wiOlwienpuaGtIZjhZdFpZM2lGd3FVd0lJUldMTjhZMmlHbmNkcnVTaStGNDNmU1BLYWpSZlI0VzhXVHM4bElSMDBndGJmTWJxS0NjQkpGN3VNSkdGRC9WV2c9PVwifSIsImVwdWIiOiJTRUF7XCJtXCI6W1wiflU4ZEtHckhSYV9NbDBWdWJUeTlGQWE5UEtWZWJYdHkxY0tOc1lsZ2I3bjQuUHlXeXFFVW9GaWFXblBJTldDWndMQW8xaG4zdTJXT1k1N0s2R2Z6bDY4VVwiLFwiZXB1YlwiLFwiRkRzM1VvNTNFZEp6eFNocEpDaVctRGZPQ3lUS0M2U3cxeS1PZVJxam5ZRS5xVGdyYTlFQk1maEpNdVlMVmNaejRZYklLRm85enNBMHpMcV82dEVPMHI0XCIsMTU0NjkwMjUwNDk3OV0sXCJzXCI6XCJPZzRVVjY4OTluSjE4dC9ybWVnV0lkdnNqN01KaEpFc29ranZYQmdteVVRUXVNVjFTdnh4cXJqOFoyV1o2Q25XSkZnTlVDbEVYYWxuMURjUFE3M1R6UT09XCJ9IiwiYXV0aCI6IlNFQXtcIm1cIjpbXCJ+VThkS0dySFJhX01sMFZ1YlR5OUZBYTlQS1ZlYlh0eTFjS05zWWxnYjduNC5QeVd5cUVVb0ZpYVduUElOV0Nad0xBbzFobjN1MldPWTU3SzZHZnpsNjhVXCIsXCJhdXRoXCIsXCJ7XFxcImVrXFxcIjpcXFwiU0VBe1xcXFxcXFwiY3RcXFxcXFxcIjpcXFxcXFxcIi94ZnNPdVNkQUtrNkJiR00zbUV6MnVlSjI3Y0tJNThYMEtUL1FsaExSZXpWcjRkNzVZb2M5QlZNRjkzejl4QXI4N080S2FDNjJUWGVoeERQN0FFa2V4N1paaEpYL2hsVm9kK1FIcVFaaUZMK2lVQzFvL2hpUEJGWElBZmtINGRrcklGOFdqcEVaU3NIVmRSOVRhY2ZzbTB3aHN5NGJXN1ZLSEUySGc9PVxcXFxcXFwiLFxcXFxcXFwiaXZcXFxcXFxcIjpcXFxcXFxcIjhWekduTStEc1lTUktIU3Z4cSszTGc9PVxcXFxcXFwiLFxcXFxcXFwic1xcXFxcXFwiOlxcXFxcXFwibVVSSlJ4TzUvdXM9XFxcXFxcXCJ9XFxcIixcXFwic1xcXCI6XFxcImE1SlA3VFpuVE9jYjEwMGJOejlscEU4dnpqcUE3TWl0NHcwN3pjQTdIOFV0bml1WnVHSmdpZnNNQlFNSGdRdE5cXFwifVwiLDE1NDY5MDI1MDQ5NzldLFwic1wiOlwiSGFzMytJaHFEZTYyN016cElXZVE1cVFrZ2NOMlk3WHRpNGw0TFU3T2JyaktxSlBnSllrVWE2bk9YdlRmQkFzV1BPVzVnemh4Q2RPVGNFQm5icWlpWXc9PVwifSJ9"));
      var okey = {"pub":"U8dKGrHRa_Ml0VubTy9FAa9PKVebXty1cKNsYlgb7n4.PyWyqEUoFiaWnPINWCZwLAo1hn3u2WOY57K6Gfzl68U","epub":"FDs3Uo53EdJzxShpJCiW-DfOCyTKC6Sw1y-OeRqjnYE.qTgra9EBMfhJMuYLVcZz4YbIKFo9zsA0zLq_6tEO0r4","priv":"jMy7WfcldJ4esZEijAj4LTb99smtY_H0yKJLemJl2HI","epriv":"1DszMh-85pGTPLYtRunG-Q-xB78AE4k07PPkbedYYwk"}

      var gun = Gun(), tmp = Gun.node.soul(old);
      var graph = {};
      graph[tmp] = old;
      var alias = SEA.opt.unpack(await SEA.verify(old.alias, false), 'alias', old);
      expect(alias).to.be('alice');
      alias = Gun.state.ify({}, tmp, 1, Gun.val.rel.ify(tmp), tmp = '~@'+alias);
      graph[tmp] = alias;
      gun.on('put', {$: gun, put: graph});
      var use = gun.user();
      use.auth('alice', 'test123', function(ack){
        expect(ack.err).to.not.be.ok();
        done();
      });
    }())})

    it('JSON escape', function(done){
      var plain = "hello world";
      var json = JSON.stringify({hello:'world'});

      var n1 = Gun.state.ify({}, 'key', 1, plain, 'soul');
      var n2 = Gun.state.ify({}, 'key', 1, json, 'soul');
      var tmp = SEA.opt.prep(plain, 'key', n1, 'soul');
      expect(tmp[':']).to.be("hello world");
      tmp = SEA.opt.prep(json, 'key', n2, 'soul');
      expect(tmp[':'].hello).to.be("world");
      tmp = SEA.opt.unpack(tmp);
      expect(tmp.hello).to.be("world");
      done();
    });

    it('double sign', function(done){ (async function(){
      var pair = await SEA.pair();
      var sig = await SEA.sign('hello world', pair);
      var dup = await SEA.sign(sig, pair);
      expect(dup).to.be(sig);

      var json = JSON.stringify({hello:'world'});
      var n1 = Gun.state.ify({}, 'key', 1, json, 'soul');
      var sig = await SEA.sign(SEA.opt.prep(json, 'key', n1, 'soul'), pair, null, {raw:1 , check: SEA.opt.pack(json, 'key', n1, 'soul')});
      var dup = await SEA.sign(SEA.opt.prep(sig, 'key', n1, 'soul'), pair, null, {raw:1 , check: SEA.opt.pack(sig, 'key', n1, 'soul')});
      expect(dup).to.be.eql(sig);

      var json = JSON.stringify({hello:'world'});
      var n1 = Gun.state.ify({}, 'key', 1, json, 'soul');
      var bob = await SEA.pair();
      var sig = await SEA.sign(SEA.opt.prep(json, 'key', n1, 'soul'), bob, null, {raw:1 , check: SEA.opt.pack(json, 'key', n1, 'soul')});
      var dup = await SEA.sign(SEA.opt.prep(sig, 'key', n1, 'soul'), pair, null, {raw:1 , check: SEA.opt.pack(sig, 'key', n1, 'soul')});
      expect(dup).to.not.be.eql(sig);

      var json = JSON.stringify({hello:'world'});
      var bob = await SEA.pair();
      var sig = await SEA.sign(json, bob);
      var dup = await SEA.sign(sig, pair);
      expect(dup).to.not.be.eql(sig);
      done();
    }())})
  });

  describe('User', function(){
    it('is instantiable', function(done){
      gun = Gun();
      user = gun.user();
      done();
    })

    it('register users', function(done){
      user.create('carl', 'test123', function(ack){
        pub = '~'+ack.pub;
        expect(ack.err).to.not.be.ok();
        done();
      })
    })

    it('login users', function(done){
      user.auth('carl', 'test123', function(ack){
        expect(ack.err).to.not.be.ok();
        done()
      })
    })

    it('save data', function(done){
      user.get('a').get('b').put(0, function(ack){
        expect(ack.err).to.not.be.ok();
        done();
      });
    })

    it('read data', function(done){
      user.get('a').get('b').once(function(data){
        expect(data).to.be(0);
        done();
      });
    })

    it('refresh login', function(done){
      this.timeout(9000);
      setTimeout(function(){
        gun = Gun();
        user = gun.user();
        user.auth('carl', 'test123', function(ack){
          expect(ack.err).to.not.be.ok();
          done()
        })
      }, 800);
    })

    it('gun put JSON', function(done){
      gun.get('x').get('y').put(JSON.stringify({hello:'world'}), function(ack){
        expect(ack.err).to.not.be.ok();
        done();
      });
    })

    it('gun get JSON', function(done){
      gun.get('x').get('y').once(function(data){
        expect(data).to.be(JSON.stringify({hello:'world'}));
        done();
      });
    })

    it('set user ref should be found', function(done){
      var gun = Gun();
      var user = gun.user();
      var msg = {what: 'hello world'};
      user.create('zach', 'password');
      gun.on('auth', function(){
        var ref = user.get('who').get('all').set(msg);
        user.get('who').get('said').set(ref);
        user.get('who').get('said').map().once(function(data){
          expect(data.what).to.be.ok();
          done();
        })
      })
    });

    it('set user ref null override', function(done){
      this.timeout(9000);
      var gun = Gun();
      var user = gun.user();
      var msg = {what: 'hello world'};
      user.create('xavier', 'password');
      gun.on('auth', function(){
        var ref = user.get('who').get('all').set(msg);
        var tmp = ref._.dub || ref._.link;
        setTimeout(function(){
          user.get('who').put(1);
          setTimeout(function(){
            user.get('who').get('all').get(tmp).put({boom: 'ah'});
            setTimeout(function(){
              user.get('who').get('all').map().once(function(data){
                expect(data).to.be.ok();
                expect(data.what).to.not.be.ok();
                done();
              });
            },9);
          },9);
        },9);
      });
    });
  });

})

}());
