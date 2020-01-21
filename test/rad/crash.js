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
 
}(this));
 
;(function(){
Gun = root.Gun

if(Gun.window && !Gun.window.RindexedDB){ return }
 
var opt = {};
opt.file = 'radatatest';
var Radisk = (Gun.window && Gun.window.Radisk) || require('../../lib/radisk');
opt.store = ((Gun.window && Gun.window.RindexedDB) || require('../../lib/rfs'))(opt);
opt.chunk = 170;
var Radix = Radisk.Radix;
var rad = Radisk(opt), esc = String.fromCharCode(27);
 
describe('RAD Crashes', function(){
 
  describe('If Some of Split Fails, Keep Original Data', function(){
    var gun = Gun({chunk: opt.chunk});
 
    it('write initial', function(done){
        var all = {}, to, start, tmp;
        var names = ['al', 'alex', 'alexander', 'alice'];
        names.forEach(function(v,i){
            all[++i] = true;
            tmp = v.toLowerCase();
            gun.get('names').get(tmp).put(i, function(ack){
                expect(ack.err).to.not.be.ok();
                delete all[i];
                if(!Gun.obj.empty(all)){ return }
                done();
            })
        });
    });

    it('write alan', function(done){
        var all = {}, to, start, tmp;
        var names = ['alan'];
        console.log("DID YOU ADD `Gun.CRASH` to Radisk f.swap?");
        Gun.CRASH = true; // add check for this in f.swap!
        names.forEach(function(v,i){
            all[++i] = true;
            tmp = v.toLowerCase();
            gun.get('names').get(tmp).put(i);
        });
        setTimeout(function(){
            Gun.CRASH = false;
            done();
        }, 1000);
    });

    it('read names', function(done){
        console.log("Better to .skip 1st run, .only 2nd run & prevent clearing radatatest.");
        var g = Gun();
        var all = {al: 1, alex: 2, alexander: 3, alice: 4};
        g.get('names').map().on(function(v,k){
            //console.log("DATA:", k, v);
            if(all[k] === v){ delete all[k] }
            if(!Gun.obj.empty(all)){ return }
            done();
        });
    });
 
  });
 
});
 
}());