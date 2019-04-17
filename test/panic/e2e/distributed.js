require('./holy/grail');

describe('PANIC!', function(){
	this.timeout(1000 * 100);

	var Gun = require('../');
	var gun = Gun();

	var panic = require('panic-server');

	var server = require('http').createServer(function(req, res){
		var path = require('path');
		if (req.url === '/') {
			req.url = '/panic.html';
		}
		if(gun.wsp.server(req, res)){ 
			return; // filters gun requests!
		}
		require('fs').createReadStream(path.join(__dirname, req.url))
		.on('error',function(){}).pipe(res); // stream
	});

	panic.server(server);
	gun.wsp(server);
	server.listen(8765);

	var clients = panic.clients;

	var wd = require('selenium-webdriver');
	var ff1 = new wd.Builder()
		.forBrowser('firefox').build()
		.get('http://localhost:8765/panic.html');
	var ff2 = new wd.Builder()
		.forBrowser('firefox').build()
		.get('http://localhost:8765/panic.html');

	function min(n, done, list){
		list = list || clients;
		function ready() {
			if (list.length >= n) {
				done();
				list.removeListener('add', ready);
				return true;
			}
		}
		if (!ready()) {
			list.on('add', ready);
		}
	}

	function gunify(done, ctx){
		var s = document.createElement('script');
		s.src = 'gun.js';
		s.onload = done;
		s.onerror = ctx.fail;
		document.body.appendChild(s);
	}

	describe('Should sync', function(){

		var alice = clients.pluck(1);
		var bob = clients.excluding(alice).pluck(1);

		before(function(done){
			min(2, done, clients);
		});

		it('browsers', function(done){

			alice.run(function(){
				var sync = gun.get('sync');
				sync.put({hello: 'world'})
			}).then(function(){
				return bob.run(function(done, ctx){
					var sync = gun.get('sync');
					sync.on(function(val){
						if(val.hello === 'world'){
							done();
						} else {
							ctx.fail("Wrong data");
						}
					});
				});
			}).then(function(){
				done();
			}).catch(function(e){
				done(new Error(e.message));
			});

		});
		
	});

});
