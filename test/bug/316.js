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
//			require('../../sea.js');
		}
	}(this));

	var opt = { file: 'radatatest' };

	describe('API - put', function(){
		it('put reference', function(done) {
			var gun = Gun(opt);
			g = Gun();
			var alice, bob;
			alice = g.get('alice').put({name: 'alice'}, function(ack) {
				bob = g.get('bob').put({name: 'bob'}, function(ack) {
// 					bob.get('partner').put(alice, function(ack) { /// this works!
					bob.put({partner: alice}, function(ack) {
						expect(!ack.err).to.be(true);
						done();
					});
				});
			});
		});
	});
});
