var root;
var Gun;
(function(env){
  root = env.window ? env.window : global;
  try{ env.window && root.localStorage && root.localStorage.clear() }catch(e){}
  try{ require('fs').unlinkSync('data.json') }catch(e){}
  //root.Gun = root.Gun || require('../gun');
  if(root.Gun){
    //Gun = root.Gun = root.Gun;
  } else {
    var expect = global.expect = require("../expect");
    root.Gun = require('../../gun');
    //Gun.serve = require('../../lib/serve');
    //require('./s3');
    //require('./uws');
    //require('./wsp/server');
    require('../../lib/file');
    require('../../sea.js');
  }
}(this));

;(function(){
Gun = root.Gun
var SEA = Gun.SEA

if(!SEA){ return }

describe.only('SEA', function(){
  var user;
  var gun;
  describe('Utility', function(){

    it('quickstart', async function(done){
      var pair = await SEA.pair();
      var enc = await SEA.encrypt('hello self', pair);
      var data = await SEA.sign(enc, pair);
      var msg = await SEA.verify(data, pair.pub);
      var dec = await SEA.decrypt(msg, pair);
      expect(dec).to.be('hello self');
      var proof = await SEA.work(dec, pair);
      var check = await SEA.work('hello self', pair);
      expect(proof).to.be(check);
      var alice = await SEA.pair();
      var bob = await SEA.pair();
      var enc = await SEA.encrypt('shared data', await SEA.secret(bob.epub, alice));
      var dec = await SEA.decrypt(enc, await SEA.secret(alice.epub, bob));
      expect(dec).to.be('shared data');
      done();
    })

    it('quickwrong', async function(done){
      var alice = await SEA.pair();
      var bob = await SEA.pair();
      var data = await SEA.sign('asdf', alice);
      var msg = await SEA.verify(data, bob.pub);
      expect(msg).to.be(undefined);
      var msg = await SEA.verify(data+1, alice.pub);
      expect(msg).to.be(undefined);

      var enc = await SEA.encrypt('secret', alice);
      var dec = await SEA.decrypt(enc, bob);
      expect(dec).to.be(undefined);
      var dec = await SEA.decrypt(enc+1, alice);
      expect(dec).to.be(undefined);
      done();
    })

    it('types', async function(done){
      var pair = await SEA.pair(), s, v;
      s = await SEA.sign(null, pair);
      v = await SEA.verify(s, pair);
      expect(null).to.be(v);
      s = await SEA.sign(true, pair);
      v = await SEA.verify(s, pair);
      expect(true).to.be(v);
      s = await SEA.sign(false, pair);
      v = await SEA.verify(s, pair);
      expect(false).to.be(v);
      s = await SEA.sign(0, pair);
      v = await SEA.verify(s, pair);
      expect(0).to.be(v);
      s = await SEA.sign(1, pair);
      v = await SEA.verify(s, pair);
      expect(1).to.be(v);
      s = await SEA.sign(1.01, pair);
      v = await SEA.verify(s, pair);
      expect(1.01).to.be(v);
      s = await SEA.sign('', pair);
      v = await SEA.verify(s, pair);
      expect('').to.be(v);
      s = await SEA.sign('a', pair);
      v = await SEA.verify(s, pair);
      expect('a').to.be(v);
      s = await SEA.sign([], pair);
      v = await SEA.verify(s, pair);
      expect([]).to.eql(v);
      s = await SEA.sign([1], pair);
      v = await SEA.verify(s, pair);
      expect([1]).to.eql(v);
      s = await SEA.sign({}, pair);
      v = await SEA.verify(s, pair);
      expect({}).to.eql(v);
      s = await SEA.sign({a:1}, pair);
      v = await SEA.verify(s, pair);
      expect({a:1}).to.eql(v);
      s = await SEA.sign(JSON.stringify({a:1}), pair);
      v = await SEA.verify(s, pair);
      expect({a:1}).to.eql(v);
      done();
    })

    it('atypes', async function(done){
      var pair = await SEA.pair(), s, v;
      s = await SEA.encrypt(null, pair);
      v = await SEA.decrypt(s, pair);
      expect(null).to.be(v);
      s = await SEA.encrypt(true, pair);
      v = await SEA.decrypt(s, pair);
      expect(true).to.be(v);
      s = await SEA.encrypt(false, pair);
      v = await SEA.decrypt(s, pair);
      expect(false).to.be(v);
      s = await SEA.encrypt(0, pair);
      v = await SEA.decrypt(s, pair);
      expect(0).to.be(v);
      s = await SEA.encrypt(1, pair);
      v = await SEA.decrypt(s, pair);
      expect(1).to.be(v);
      s = await SEA.encrypt(1.01, pair);
      v = await SEA.decrypt(s, pair);
      expect(1.01).to.be(v);
      s = await SEA.encrypt('', pair);
      v = await SEA.decrypt(s, pair);
      expect('').to.be(v);
      s = await SEA.encrypt('a', pair);
      v = await SEA.decrypt(s, pair);
      expect('a').to.be(v);
      s = await SEA.encrypt([], pair);
      v = await SEA.decrypt(s, pair);
      expect([]).to.eql(v);
      s = await SEA.encrypt([1], pair);
      v = await SEA.decrypt(s, pair);
      expect([1]).to.eql(v);
      s = await SEA.encrypt({}, pair);
      v = await SEA.decrypt(s, pair);
      expect({}).to.eql(v);
      s = await SEA.encrypt({a:1}, pair);
      v = await SEA.decrypt(s, pair);
      expect({a:1}).to.eql(v);
      s = await SEA.encrypt(JSON.stringify({a:1}), pair);
      v = await SEA.decrypt(s, pair);
      expect({a:1}).to.eql(v);
      done();
    })
    
  });

  describe('User', function(){

    it('is instantiable', function(done){
      gun = Gun();
      user = gun.user();
      done();
    })

    it('register users', function(done){
      user.create('bob', 'test123', function(ack){
        expect(ack.err).to.not.be.ok();
        setTimeout(done, 30)
      })
    })

    it('login users', function(done){
      user.auth('bob', 'test123', function(ack){
        expect(ack.err).to.not.be.ok();
        done()
      })
    })
  });

})

})()