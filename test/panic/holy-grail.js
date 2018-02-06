var config = {
	IP: require('ip').address(),
	port: 8080,
	servers: 2,
	browsers: 2,
	route: {
		'/': __dirname + '/index.html',
		'/gun.js': __dirname + '/../../gun.js',
		'/jquery.js': __dirname + '/../../examples/jquery.js'
	}
}

var panic = require('panic-server');
panic.server().on('request', function(req, res){
	config.route[req.url] && require('fs').createReadStream(config.route[req.url]).pipe(res);
}).listen(config.port);

var clients = panic.clients;
var manager = require('panic-manager')();

manager.start({
    clients: Array(config.servers).fill().map(function(u, i){
			return {
				type: 'node',
				port: config.port + (i + 1)
			}
    }),
    panic: 'http://' + config.IP + ':' + config.port
});

var servers = clients.filter('Node.js');
var server = servers.pluck(1);
var spawn = servers.excluding(server).pluck(1);
var browsers = clients.excluding(servers);
var alice = browsers.pluck(1);
var bob = browsers.excluding(alice).pluck(1);
var again = {};

describe("The Holy Grail Test!", function(){
	//this.timeout(5 * 60 * 1000);
	this.timeout(10 * 60 * 1000);

	it("Servers have joined!", function(){
		return servers.atLeast(config.servers);
	});

	it("GUN started!", function(){
		return server.run(function(test){
			var env = test.props;
			test.async();
			try{ require('fs').unlinkSync(env.i+'data') }catch(e){}
			try{ require('fs').unlinkSync((env.i+1)+'data') }catch(e){}
			var port = env.config.port + env.i;
			var server = require('http').createServer(function(req, res){
				res.end("I am "+ env.i +"!");
			});
			var Gun = require('gun');
			var gun = Gun({file: env.i+'data', web: server, localStorage: false});
			server.listen(port, function(){
				test.done();
			});
		}, {i: 1, config: config}); 
	});

	it(config.browsers +" browser(s) have joined!", function(){
		console.log("PLEASE OPEN http://"+ config.IP +":"+ config.port +" IN "+ config.browsers +" BROWSER(S)!");
		return browsers.atLeast(config.browsers);
	});

	it("Browsers initialized gun!", function(){
		var tests = [], i = 0;
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				localStorage.clear();
				var env = test.props;
				var gun = Gun('http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun');
				window.ref = gun.get('holy').get('grail');
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Write initial value", function(){
		return alice.run(function(test){
			console.log("I AM ALICE");
			ref.put("value");
			setTimeout(test.async(), 2000);
		});
	});

	it("Read initial value", function(){
		return bob.run(function(test){
			console.log("I AM BOB");
			test.async();
			ref.on(function(data){
				if("value" === data){
					return test.done();
				}
			})
		})
	});

	it("Server has crashed and been wiped!", function(){
		return server.run(function(test){
			console.log(3);
			var env = test.props;
			try{ require('fs').unlinkSync(env.i+'data'); }catch(e){}
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
					test.fail("Server did not crash.");
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
					test.fail("Server did not crash.");
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
			test.async();
			try{ require('fs').unlinkSync(env.i+'data') }catch(e){}
			var port = env.config.port + env.i;
			var server = require('http').createServer(function(req, res){
				res.end("I am "+ env.i +"!");
			});
			var Gun = require('gun');
			var gun = Gun({file: env.i+'data', web: server, localStorage: false});
			server.listen(port, function(){
				test.done();
			});
		}, {i: 2, config: config}); 
	});

	it("Browsers re-initialized gun!", function(){
		var tests = [], i = 0;
		new panic.ClientList([again.alice, again.bob]).each(function(client, id){
			tests.push(client.run(function(test){
				// NOTE: WE DO NOT CLEAR localStorage!
				console.log(localStorage['gun/holy']);
				var env = test.props;
				var gun = Gun('http://'+ env.config.IP + ':' + (env.config.port + 2) + '/gun');
				window.ref = gun.get('holy').get('grail');
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Alice conflict.", function(){
		return again.alice.run(function(test){
			test.async();
			var c = 0;
			ref.on(function(data){
				console.log("======", data);
				window.stay = data;
				if(!c){
					c++;
					if("Alice" == data){
						setTimeout(function(){
							window.ALICE = true;
							test.done();
						}, 2000);
					}
					return;
				}
			});
		});
	});

	it("Bob converged.", function(){
		return again.bob.run(function(test){
			test.async();
			var c = 0;
			ref.on(function(data){
				console.log("======", data);
				//return;
				window.stay = data;
				if("Bob" != data){
					test.fail("wrong local value!");
					return;
				}
				setTimeout(function(){
					if(c){ return }
					c++;
					if("Bob" === data){
						test.done();
					}
				}, 2000);
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
		browsers.run(function(){
			//location.reload();
			//setTimeout(function(){
			//}, 15 * 1000);
		});
		return servers.run(function(){
			process.exit();
		});
	});
});