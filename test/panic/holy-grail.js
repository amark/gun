// <-- PANIC template, copy & paste, tweak a few settings if needed...
var ip; try{ ip = require('ip').address() }catch(e){}
var config = {
	IP: ip || 'localhost',
	port: 8765,
	relays: 2,
	browsers: 2,
	route: {
		'/': __dirname + '/index.html',
		'/gun.js': __dirname + '/../../gun.js',
		'/jquery.js': __dirname + '/../../examples/jquery.js'
	}
}

var panic; try{ panic = require('panic-server') } catch(e){ console.log("PANIC not installed! `npm install panic-server panic-manager panic-client`") }

panic.server().on('request', function(req, res){
	config.route[req.url] && require('fs').createReadStream(config.route[req.url]).pipe(res);
}).listen(config.port);

var clients = panic.clients;
var manager = require('panic-manager')();

manager.start({
    clients: Array(config.relays).fill().map(function(u, i){
			return {
				type: 'node',
				port: config.port + (i + 1)
			}
    }),
    panic: 'http://' + config.IP + ':' + config.port
});

var relays = clients.filter('Node.js');
var relay = relays.pluck(1);
var spawn = relays.excluding(relay).pluck(1);
var browsers = clients.excluding(relays);
var alice = browsers.pluck(1);
var bob = browsers.excluding(alice).pluck(1);
var again = {};

// continue boiler plate, tweak a few defaults if needed, but give descriptive test names...
describe("The Holy Grail Test!", function(){
	//this.timeout(5 * 60 * 1000);
	this.timeout(10 * 60 * 1000);

	it("relays have joined!", function(){
		return relays.atLeast(config.relays);
	});

	it("GUN started!", function(){
		return relay.run(function(test){
			var env = test.props;
			var port = env.config.port + env.i;
			test.async();

			if (process.env.ROD_PATH) {
				console.log('testing with rod');
				const sp = require('child_process').spawn(process.env.ROD_PATH, ['start', '--port', port, '--sled-storage=false']);
				sp.stdout.on('data', function(data){
					console.log(data.toString());
				});
				sp.stderr.on('data', function(data){
					console.log(data.toString());
				});
				test.done();
				return;
			}

			try{ require('fs').unlinkSync(env.i+'data') }catch(e){}
			try{ require('fs').unlinkSync((env.i+1)+'data') }catch(e){}
			try{ require('gun/lib/fsrm')(env.i+'data') }catch(e){}
			try{ require('gun/lib/fsrm')((env.i+1)+'data') }catch(e){}
			var server = require('http').createServer(function(req, res){
				res.end("I am "+ env.i +"!");
			});
			var Gun; try{ Gun = require('gun') }catch(e){ console.log("GUN not found! You need to link GUN to PANIC. Nesting the `gun` repo inside a `node_modules` parent folder often fixes this.") }
			var gun = Gun({file: env.i+'data', web: server});
			server.listen(port, function(){
				test.done();
			});
		}, {i: 1, config: config});
	});

	it(config.browsers +" browser(s) have joined!", function(){
		require('./util/open').web(config.browsers, "http://"+ config.IP +":"+ config.port);
		return browsers.atLeast(config.browsers);
	});

	it("Browsers initialized gun!", function(){
		var tests = [], i = 0;
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				window.ENV = test.props;
				localStorage.clear();
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});
// end PANIC template --> 

	it("Write initial value", function(){
		return alice.run(function(test){
			console.log("I AM ALICE");
			var env = window.ENV;
			var gun = Gun({peers: ['http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun'], file: 'alicedata'});
			window.ref = gun.get('holy').get('grail');
			ref.put("value");
			setTimeout(test.async(), 2000);
		});
	});

	it("Read initial value", function(){
		return bob.run(function(test){
			console.log("I AM BOB");
			var env = window.ENV;
			var gun = Gun({peers: ['http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun'], file: 'bobdata'});
			window.ref = gun.get('holy').get('grail');
			test.async();
			ref.on(function(data){
				if("value" === data){
					return test.done();
				}
			})
		})
	});

	it("Relay has crashed and been wiped!", function(){
		return relay.run(function(test){
			console.log(3);
			var env = test.props;
			try{ require('fs').unlinkSync(env.i+'data') }catch(e){}
			try{ require('gun/lib/fsrm')(env.i+'data') }catch(e){}
			process.exit(0);
		}, {i: 1, config: config})
	});

	it("Wait...", function(done){
		console.log(4);
		setTimeout(done, 2000);
	});

	it("Alice conflicted.", function(){
		return alice.run(function(test){
			var env = test.props;
			if(window.WebSocket){
				var err;
				try{ new WebSocket('http://'+ env.config.IP + ':' + (env.config.port + 2) + '/gun') }catch(e){ err = e }
				if(!err){
					test.fail("Relay did not crash.");
				}
			}
			ref.put("Alice");
			setTimeout(test.async(), 100);
		}, {config: config});
	});

	it("Bob conflicted.", function(){
		return bob.run(function(test){
			var env = test.props;
			if(window.WebSocket){
				var err;
				try{ new WebSocket('http://'+ env.config.IP + ':' + (env.config.port + 2) + '/gun') }catch(e){ err = e }
				if(!err){
					test.fail("Relay did not crash.");
				}
			}
			ref.put("Bob");
			setTimeout(test.async(), 2000);
		}, {config: config});
	});

	it("Alice reloading.", function(){
		return alice.run(function(test){
			console.log(localStorage);
			location.reload();
		});
	});

	it("Got Alice.", function(){
		again.alice = browsers.excluding(new panic.ClientList([alice, bob])).pluck(1);
		return again.alice.atLeast(1);
	});

	it("Wait for Bob...", function(done){
		setTimeout(done, 1000);
	});

	it("Bob reloading.", function(){
		return bob.run(function(test){
			location.reload();
		});
	});

	it("Got Bob.", function(){
		again.bob = browsers.excluding(new panic.ClientList([alice, bob, again.alice])).pluck(1);
		return again.bob.atLeast(1);
	});

	it("GUN spawned!", function(){
		return spawn.run(function(test){
			var env = test.props;
			var port = env.config.port + env.i;
			test.async();

			if (process.env.ROD_PATH) {
				console.log('testing with rod');
				const sp = require('child_process').spawn(process.env.ROD_PATH, ['start', '--port', port, '--sled-storage=false']);
				sp.stdout.on('data', function(data){
					console.log(data.toString());
				});
				sp.stderr.on('data', function(data){
					console.log(data.toString());
				});
				test.done();
				return;
			}


			try{ require('fs').unlinkSync(env.i+'data') }catch(e){}
			try{ require('gun/lib/fsrm')(env.i+'data') }catch(e){}
			var server = require('http').createServer(function(req, res){
				res.end("I am "+ env.i +"!");
			});
			var Gun = require('gun');
			var gun = Gun({file: env.i+'data', web: server});
			server.listen(port, function(){
				test.done();
			});
		}, {i: 2, config: config}); 
	});

	it("Browsers ready!", function(){
		var tests = [], i = 0;
		new panic.ClientList([again.alice, again.bob]).each(function(client, id){
			tests.push(client.run(function(test){
				window.ENV = test.props;
				// NOTE: WE DO NOT CLEAR localStorage!
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Alice re-initialized gun!", function(){
		return again.alice.run(function(test){
			var env = window.ENV;
			var gun = Gun({peers: ['http://'+ env.config.IP + ':' + (env.config.port + 2) + '/gun'], file: 'alicedata'});
			window.ref = gun.get('holy').get('grail');
		});
	});

	it("Bob re-initialized gun!", function(){
		return again.bob.run(function(test){
			var env = window.ENV;
			var gun = Gun({peers: ['http://'+ env.config.IP + ':' + (env.config.port + 2) + '/gun'], file: 'bobdata'});
			window.ref = gun.get('holy').get('grail');
		});
	});

	it("Alice conflict.", function(){
		return again.alice.run(function(test){
			test.async();
			ref.on(function(data){
				console.log("======", data);
				window.stay = data;
				if("Bob" == data){
					setTimeout(function(){
						if(window.ALICE){ return }
						window.ALICE = true;
						test.done();
					}, 1000);
				}
			});
		});
	});

	it("Bob converged.", function(){
		return again.bob.run(function(test){
			test.async();
			ref.on(function(data){
				console.log("======", data);
				window.stay = data;
				if("Bob" != data){
					test.fail("wrong local value!");
					return;
				}
				setTimeout(function(){
					if(window.BOB){ return }
					window.BOB = true;
					test.done();
				}, 1000);
			});
		});
	});

	it("Alice converged.", function(){
		return again.alice.run(function(test){
			//console.log(stay);return;
			if("Bob" != stay){
				test.fail("wrong local value!");
			}
		});
	});

	it("All finished!", function(done){
		console.log("Done! Cleaning things up...");
		setTimeout(function(){
			done();
		},1000);
	});

	after("Everything shut down.", function(){
		require('./util/open').cleanup();
		return relays.run(function(){
			process.exit();
		});
	});
});

