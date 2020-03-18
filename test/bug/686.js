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
	var opt = { file: 'radatatest' };
	describe('SEA', function() {
		it('put null string', function(done) {
			var gun = Gun(opt);
			gun.get('test').get('key').put('null', function(ack) {
				if (ack.err) { expect(!ack.err).to.be(true); done(); }
				gun.get('test').get('key').once(function(v) {
					expect(v === 'null').to.be(true);
					done();
				});
			});
		});
		it('put null string in user land', function(done) {
			var gun = Gun(opt);
			var user = gun.user();
			var u={a:'usr', p:'pass'};
			var value = 'null';
			user.create(u.a, u.p, function(ack) {
				usr = user.auth(u.a, u.p, function() {
					usr.get('test').get('key').put(value, function(ack) {
						if (ack.err) { expect(!ack.err).to.be(true); done(); }
						usr.get('test').get('key').once(function(v) {
							expect(v === value).to.be(true); /// must be null string.
							done();
						});
					});
				});
			});
		});
	});
});
