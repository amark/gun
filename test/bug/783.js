
///// bug-783

describe('Gun', function(){
	var root;
	(function(){
		var env;
		if(typeof global !== 'undefined'){ env = global }
		if(typeof window !== 'undefined'){ env = window }
		root = env.window? env.window : global;
		try{ env.window && root.localStorage && root.localStorage.clear() }catch(e){}
		try{ localStorage.clear() }catch(e){}
		try{ indexedDB.deleteDatabase('radatatest') }catch(e){}
		try{ require('fs').unlinkSync('data.json') }catch(e){}
 		try{ require('../../lib/fsrm')('radatatest') }catch(e){}
		try{ var expect = global.expect = require("../expect") }catch(e){}

		//root.Gun = root.Gun || require('../gun');
		if(root.Gun){
			root.Gun = root.Gun;
			root.Gun.TESTING = true;
		} else {
			root.Gun = require('../../gun');
			root.Gun.TESTING = true;
			Gun.serve = require('../../lib/serve');
			//require('../lib/file');
			require('../../lib/store');
			require('../../lib/rfs');
			require('../../sea.js');
		}
	}(this));

	describe('erro sea', function(){
		it('verbose console.log debugging', function(done) {
			var gun = Gun({multicast:false, axe:false});
			var ref = gun.get('test').get('1');
			var vput = 'SEA{}';
			ref.put(vput, function(ack, yay){ console.log('ACK: ', ack); /// must ack all
		          ref.once(function(v,k) { console.log('SALVOU k:%s, v:', k, v);
                            expect(v===vput).to.be(true);
			    done();
			});
	            });
		});
	} );
});
