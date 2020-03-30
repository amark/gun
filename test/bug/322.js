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
//			require('../../lib/file');
			require('../../lib/store');
			require('../../lib/rfs');
//			require('../../sea.js');
		}
	}(this));

    var opt = { file: 'radatatest' };

	describe('API - map', function(){
		it('Save example data', function(done) {
			var gun = Gun(opt);
			gun.get('users').set({u:1});
			gun.get('users').set({u:2});
			gun.get('users').set({u:2});
			gun.get('users').map().on(function(user) { user.index = 'someIndex'; });
			setTimeout(function() { done(); }, 200);
		});
		it('Make sure the value "someIndex" not be saved in storage', function(done) {
			var gun = Gun(opt), values=[];
			gun.get('users').map().once(function(v) { values.push(v.index); });
			setTimeout(function() {
				expect(values.indexOf('someIndex')===-1).to.be(true);
				done();
			}, 200);
		});
	});
});
