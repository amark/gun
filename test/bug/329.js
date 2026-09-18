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
// 			require('../../lib/open');
//			require('../../sea.js');
		}
	}(this));
	var opt = { file: 'radatatest' };
	describe('API - map', function(){
		it('map and put', function(done) {
			var gun = Gun(opt);
			var ref = gun.get('pic').put({ empty: true }, function(ack) {
// 				console.log('added pic');
				ref.get('people').put({a:{b:{c:true}}}, function(ack) {
// 					console.log('updated pic', ack);
					if (ack && ack.err) { console.log('ERR: ', ack); expect(!ack.err).to.be(true); done(); }
					ref.get('a').get('b').get('c').once(function(v) {
						expect(v).to.be(true);
						done();
					});
// 					ref.open(function(v) {
// 						var s = JSON.stringify(v);
// 						expect(s==='{"empty":true,"people":{"a":{"b":{"c":true}}}}').to.be(true);
// 						done();
// 					});
				});
			});
		});
	});
});
