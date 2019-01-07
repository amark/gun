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

describe('SEA', function(){
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
    
    it('legacy', async function(done){
      var pw = 'test123';
      // https://cdn.jsdelivr.net/npm/gun@0.9.99999/sea.js !
      var old = JSON.parse(atob("eyJfIjp7IiMiOiJ+TkJhdDdKeUk0REw1ZDlPMEZNbWVFN0RacVZRZUVPblhKcldycDVUUGlyMC5PckV6WVIwc3h0NHRtV0tiajFQdHRaeW1HUmdyc1FVVDNHaTk1UE9vMUdBIiwiPiI6eyJwdWIiOjEsImFsaWFzIjoxLCJlcHViIjoxLCJhdXRoIjoxfX0sInB1YiI6Ik5CYXQ3SnlJNERMNWQ5TzBGTW1lRTdEWnFWUWVFT25YSnJXcnA1VFBpcjAuT3JFellSMHN4dDR0bVdLYmoxUHR0WnltR1JncnNRVVQzR2k5NVBPbzFHQSIsImFsaWFzIjoiU0VBe1wibVwiOlwiXFxcImJvYlxcXCJcIixcInNcIjpcIt4uXFx1MDAwNCpbcECT/sxe83eYe/M+bmBF+q5dQr7eYELndMJkXFx1MDAwYlxcbtFu6HNWUKh6XFxyfrWqwcRcXHUwMDE1e3BMv2poWlxcYktcXHUwMDEzZ5H/Z5VcIn0iLCJlcHViIjoiU0VBe1wibVwiOlwiXFxcIkdJUGY2dl8zeV9DZUpQMWtFZkt2OWpmZ3QwT2ZGeDRycHBKS01wSE9MLVEuTmM2dElDUlpwbGwxMG45V2NsRzhXNC1tdDFXZnI2cmh3c0JyN1pRTlduY1xcXCJcIixcInNcIjpcIlxcdTAwMTZcXHUwMDAwzVxcdTAwMGahrvVcXHUwMDBm9y77iP1V3IhkWOajKMxcXHUwMDEy/VxcdTAwMDHN+VxcbozxNWRcXHUwMDA1Zej5XFx1MDAwMpSOXFx1MDAwNny4IclB+lxcdTAwMWTgoXnR8S1OyuZcXHUwMDAx9PqwXFxiXFx1MDAwMFF3XCJ9IiwiYXV0aCI6IlNFQXtcIm1cIjpcIntcXFwiZWtcXFwiOlxcXCJTRUF7XFxcXFxcXCJjdFxcXFxcXFwiOlxcXFxcXFwiXFxcXFxcXFx1MDAwMGvAI6W0L03DwFxcXFxcXFxcdTAwMDZcXFxcXFxcXHUwMDA0ZibqQdE0XFxcXFxcXFx1MDAxY4VvtTZcXFxcXFxcXG7xXfBcXFxcXFxcXHUwMDAzo5xcXFxcXFxcXHUwMDE3XFxcXFxcXFx1MDAwMf9PXFxcXFxcXFx1MDAxMJhnXFxcXFxcXFx1MDAwNccti2pifouBhtu7qcw4/mPs1SHS4uyBTo1RTuReXFxcXFxcXFx1MDAxMK9W4clcXFxcXFxcXHUwMDBmYt1oSIRcXFxcXFxcXHUwMDE4PF5gxoRS2UYtV/1LwHn1SlxcXFxcXFxcXFxcXFxcXFyYuFU3cUVf09/AXFxcXFxcXFx1MDAwZlxcXFxcXFxcdTAwMDRQN8RlXFxcXFxcXFx1MDAwNlxcXFxcXFxcdTAwMGXM4G3fXFxcXFxcXFx1MDAxZt+eRoV9XFxcXFxcXCIsXFxcXFxcXCJpdlxcXFxcXFwiOlxcXFxcXFwiVU5Lv+Zko1xcXFxcXFxcdTAwMDOt1ET2JHhcXFxcXFxcXHUwMDE1/1xcXFxcXFwiLFxcXFxcXFwic1xcXFxcXFwiOlxcXFxcXFwiz0VOO9GwaJlcXFxcXFxcIn1cXFwiLFxcXCJzXFxcIjpcXFwiZ0F4TFJpa2dEakIzbXJDNGpucUFRak5NNEZXemF0a1Eyb2xDR2Z5TTc2amg3azNEUzAyRlp1MEV1eWg2RGFITlxcXCJ9XCIsXCJzXCI6XCKze+BcXHUwMDBilPlcXHUwMDA2z1srodVcXHUwMDA0P1xcXCJcXFwib2rndUadtqJcXHUwMDE2bFtf0PSvJNdcXHUwMDE2Y71nnlxcdTAwMWOZXFx1MDAwN1xcdTAwMTlcXHUwMDE36NZcXHUwMDA0Uk7DQK/y/oixrIr1XFx1MDAxZnVcXHUwMDE3oCBhXCJ9In0="));
      var okey = {"pub":"NBat7JyI4DL5d9O0FMmeE7DZqVQeEOnXJrWrp5TPir0.OrEzYR0sxt4tmWKbj1PttZymGRgrsQUT3Gi95POo1GA","epub":"GIPf6v_3y_CeJP1kEfKv9jfgt0OfFx4rppJKMpHOL-Q.Nc6tICRZpll10n9WclG8W4-mt1Wfr6rhwsBr7ZQNWnc","priv":"leIA-BOFLECsOOdT_B8B0s1Ii0VHZZGlHz8q_dK-xLs","epriv":"1BTJpYdwSLesrtuB7pYQdsrFHsxKSJ-d9PXt2qp6NyQ"}
      var auth = await SEA.verify(old.auth, old.pub);
      var proof = await SEA.work(pw, auth.s, null, {encode: 'utf8'});
      var dec = await SEA.decrypt(auth.ek, proof);
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
      console.log("+", gun._);
    })
  });

  describe('User', function(){

    it('is instantiable', function(done){
      gun = Gun();
      user = window.user = gun.user();
      done();
    })

    it('register users', function(done){
      /*var p = SEA.pair;
      SEA.pair = async function(a,b,c,d){
        var r = await p(a,b,c,d);
        console.log("++++++++++++", r);
        return r;
      }*/
      user.create('alice', 'test123', function(ack){
        expect(ack.err).to.not.be.ok();
        setTimeout(done, 30)
      })
    })

    it('login users', function(done){
      user.auth('alice', 'test123', function(ack){
        expect(ack.err).to.not.be.ok();
        done()
      })
    })
  });

})

})()