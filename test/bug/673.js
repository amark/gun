/// Test bug 673: 
var root={};
var Gun;
(function(){
  if(root.Gun){
    root.Gun = root.Gun;
    root.Gun.TESTING = true;
  } else {
    root.Gun = require('../../gun');
    root.Gun.TESTING = true;
  }
  try{ var expect = global.expect = require("../expect") }catch(e){}
}(this));

;(function(){
  Gun = root.Gun;
  var opt = {
    // localstorage:false,
    file: 'radata',
    axe:false, multicast:false,
    //uuid: function(){ return (Gun.state()*1000).toString(36)+'-'+Gun.text.random(12); }
  };
  var gun = Gun(opt);
  try{ require('../../lib/fsrm')('data') }catch(e){}

  describe('Cant replace data by setting fields to null', function() {
    it('Save obj', function(done) {
      gun.get("root").put({obj: {foo: "bar"}}, function(ack) {
        gun.get("root").get("obj").get("foo").once(function(v) {
          expect(v==='bar').to.be(true);
          done();
        }); /// "bar"
      });   /// {"@":"tzl7m987uth","ok":1,"#":"tdvAEE8Wu","><":"n0iA31,cM9pgq"} debugger eval code:1:18
    });
//     it('Replace by null', function(done) {
//       // So far so good, now let's null it out and ensure it's gone
//       gun.get("root").put({obj: null}, function(ack) {
//         gun.get("root").get("obj").get("foo").once(function(v) {
//         var u;
//         expect(v===u).to.be(true);
//         done();
//       });   /// undefined
//       });             /// {"@":"z3eyv9rz4g","ok":1,"#":"M84KfQife","><":"n0iA31,cM9pgq"}
//     });
//     it('Add new obj', function(done) {
//       // Great! Now let's add a new object in its place.
//       gun.get("root").put({obj: {foo2: "bar2"}}, function(ack) {
//         gun.get("root").get("obj").get("foo2").once(function(v) {
//           expect(v==='bar2').to.be(true);
//           done();
//         });  /// "bar2"
//       });   /// {"@":"0jf8umgkfcru","ok":1,"#":"yxbZJst7a","><":"n0iA31,cM9pgq"}
//     }); 
//     it('Add new obj', function(done) {
//       // This looks good, but we've actually brought back the whole object!
//       gun.get("root").get("obj").get("foo").once(function(v) {
//         var u;
//         expect(u===v).to.be(true);
//         done();
//       }); // "bar"
//       //gun.get("root").get("obj").once(log);
//     });
  });
}());
