var config = {
	IP: require('ip').address(),
	port: 8080,
	servers: 2,
	browsers: 2,
	route: {
		'/': __dirname + '/index.html',
		'/gun.js': __dirname + '/../../gun.js',
		'/jquery.js': __dirname + '/../../examples/jquery.js',
		'/cryptomodules.js': __dirname + '/../../lib/cryptomodules.js',
		'/sea.js': __dirname + '/../../sea.js'
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

describe("End-to-End Encryption on User Accounts", function(){
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
			var gun = Gun({file: env.i+'data', web: server});
			server.listen(port, function(){
				test.done();
			});
		}, {i: 1, config: config}); 
	});

	it(config.browsers +" browser(s) have joined!", function(){
		console.log("PLEASE OPEN http://"+ config.IP +":"+ config.port +" IN "+ config.browsers +" BROWSER(S)!");
		return browsers.atLeast(config.browsers);
	});

	it("Browsers load SEA!", function(){
		var tests = [], i = 0;
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				test.async();
				console.log("load?");
				function load(src, cb){
					var script = document.createElement('script');
					script.onload = cb; script.src = src;
					document.head.appendChild(script);
				}
				load('cryptomodules.js', function(){
					load('sea.js', function(){
						test.done();
					});
				});
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Browsers initialized gun!", function(){
		var tests = [], i = 0;
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				localStorage.clear();
				var env = test.props;
				var gun = Gun('http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun');
				window.gun = gun;
				window.user = gun.user();
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Create Alice", function(){
		return alice.run(function(test){
			console.log("I AM ALICE");
			test.async();
			window.user.create('alice', 'xyzabcmnopq', function(ack){
				if(ack.err || !ack.pub){ return }
				test.done();
			});
		});
	});

	it("Create Bob", function(){
		return bob.run(function(test){
			test.async();
			window.user.create('bob', 'zyxcbaqponm', function(ack){
				if(ack.err || !ack.pub){ return }
				test.done();
			});
		});
	});

	it("Auth Alice", function(){
		return alice.run(function(test){
			test.async();
			window.user.auth('alice', 'xyzabcmnopq', function(ack){
				if(ack.err || !ack.pub){ return }
				test.done();
			});
		});
	});

/*
	it("Auth Bob typo", function(){
		return bob.run(function(test){
			test.async();
			window.user.auth('bob', 'zyxcbaqponmb', function(ack){
				if(ack.err && !ack.pub){ console.log("BAD SAUCE"); return test.done() }
			});
		});
	});
*/

	it("Auth Bob", function(){
		return bob.run(function(test){
			test.async();
			window.user.auth('bob', 'zyxcbaqponm', function(ack){
				if(ack.err || !ack.pub){ return }
					console.log("AWESOME");
				test.done();
			});
		});
	});

	it("Alice save & subscribe to Bob", function(){
		return alice.run(function(test){
			test.async();
			window.user.on(function(alice){
				console.log('alice!', alice);
				if(alice.hello === 'world'){
					test.done();
				}
			});

			setTimeout(function(){
				window.user.get('hello').put('world');
			}, 100);

			window.gun.get('alias/bob').map().on(function(data){
				console.log("WOOOHOOOOOO!!!", data);
				window.MARS = data.hello;
				window.PUB = data.pub;
			});
		});
	});

	it("Bob save", function(){
		return bob.run(function(test){
			test.async();
			window.user.on(function(bob){
				console.log('bob!', bob);
				if(bob.hello === 'mars'){
					test.done();
				}
			});

			setTimeout(function(){
				window.user.get('hello').put('mars');
			}, 100);
		});
	});

	it("Alice should have Bob", function(){
		return alice.run(function(test){
			test.async();
			setTimeout(function(){
				if(window.PUB && 'mars' === window.MARS){
					test.done();
				}
			}, 100);
		});
	});

	it("Alice tries to crack Bob", function(){
		return alice.run(function(test){
			test.async();
			gun.get('pub/' + window.PUB).get('crackers').put('gonna crack');
			setTimeout(function(){
				test.done();
			}, 100);
		});
	});

	it("Alice has no cracked Bob", function(){
		return alice.run(function(test){
			test.async();
			gun.get('pub/' + window.PUB).val(function(data){
				if(data.pub === window.PUB
				&& data.hello === 'mars'
				&& data.alias === 'bob'
				&& data.crackers !== 'gonna crack'
				&& undefined === data.crackers){
					test.done();
				}
			});
		});
	});

	it("Bob has no cracked Bob", function(){
		return bob.run(function(test){
			test.async();
			user.val(function(data){
				if(data.hello === 'mars'
				&& data.alias === 'bob'
				&& data.crackers !== 'gonna crack'
				&& undefined === data.crackers){
					test.done();
				}
			});
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