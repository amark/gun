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
// 		try{ require('../../lib/fsrm')('radatatest') }catch(e){}
		try{ var expect = global.expect = require("../expect") }catch(e){}

		//root.Gun = root.Gun || require('../gun');
		if(root.Gun){
			root.Gun = root.Gun;
			root.Gun.TESTING = true;
		} else {
			root.Gun = require('../../gun');
			root.Gun.TESTING = true;
			Gun.serve = require('../../lib/serve');
//			require('../../lib/file');
			require('../../lib/store');
			require('../../lib/rfs');
//			require('../../sea.js');
		}
	}(this));

	describe('API - on', function(){
		it('put(0) does not trigger map().on(cb) when using file.js', function(done) {
			var gun = Gun({ localStorage:true, radisk:false }); /// this not works
// 			var gun = Gun(); /// this works
			var All = gun.get('AllTests');
			var Test = gun.get('triggerTest').put({type:'test'});
			var triggertotal=0;
			All.set(Test);
			All.map().on(function(node){
// 				console.log('ON %s: ', ++triggertotal, node); /// must trigger 2 times
				++triggertotal;
				if (triggertotal===2) { done(); }
			});
			Test.get('tags').get('test_01').put(1/*, function(ack) { console.log('ACK 1: ', ack); }*/); // does trigger
			Test.get('tags').get('test_01').put(0/*, function(ack) { console.log('ACK 2: ', ack); }*/); // does not trigger
		});
	});
});
