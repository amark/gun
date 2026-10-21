/// Test default uuid
var root={};
var Gun;
(function(){
  if(root.Gun){
    root.Gun = root.Gun;
    root.Gun.TESTING = true;
  } else {
    root.Gun = require('../gun');
    root.Gun.TESTING = true;
  }

  try{ var expect = global.expect = require("./expect") }catch(e){}

}(this));

;(function(){
  Gun = root.Gun;
  var opt ={
    localstorage:false, axe:false, multicast:false,
    //uuid: function(){ return (Gun.state()*1000).toString(36)+'-'+Gun.text.random(12); }
  };
  var gun = Gun(opt);

  describe('uuid', function(){
    it('Ordering - uuid default with lexical order', function(done){
      //- https://github.com/amark/gun/issues/852
      var soulslist=[];
      for (var i=0;i<10;++i) {
        var uuid = gun._.opt.uuid();
        soulslist.push(uuid);
      }
      var soulshash = soulslist.join(', ');
      var soulshash2= soulslist.sort().join(', ');

      expect(soulshash === soulshash2).to.be(true); /// the souls must stay in the same position in the array.
      done();
    });
  });

}());
