/**
 * AXE test data balance webrtc
 * What we want here: (1) Superpeer and (n) peers
 *  - The peers receives only the requested data.
 *  - If the Superpeer crash, after restart, must recreate all subscriptions and update the peers.
 *  - If some peer crash or go offline, must receive the changes via RTC.
 */
var config = {
	IP: require('ip').address(),
	port: 8765,
	servers: 2,
	browsers: 3,
	route: {
		'/': __dirname + '/index.html',
		'/gun.js': __dirname + '/../../../gun.js',
		'/gun/axe.js': __dirname + '/../../../axe.js',
		'/gun/lib/webrtc.js': __dirname + '/../../../lib/webrtc.js',
		'/jquery.js': __dirname + '/../../../examples/jquery.js'
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
var server2 = servers.excluding(server).pluck(1);
var browsers = clients.excluding(servers);
var alice = browsers.pluck(1);
var bob = browsers.excluding(alice).pluck(1);
var john = browsers.excluding(alice).excluding(bob).pluck(1);
var again = {};

describe("The Holy Grail AXE Test!", function(){
	this.timeout(5 * 60 * 1000);
// 	this.timeout(10 * 60 * 1000);

	it("Servers have joined!", function(){
		return servers.atLeast(config.servers);
	});

	it("GUN started!", function(){
		return server.run(function(test){
			var env = test.props;
			test.async();
			try{ require('fs').unlinkSync(env.i+'dataaxe') }catch(e){}
			try{ require('fs').unlinkSync((env.i+1)+'dataaxe') }catch(e){}
			var port = env.config.port + env.i;
			var server = require('http').createServer(function(req, res){
				res.end("I am "+ env.i +"!");
			});
			var Gun = require('gun');
			require('gun/axe');
			var gun = Gun({
				file: env.i+'dataaxe',
				web: server
			});
			server.listen(port, function(){
				test.done();
			});
		}, {i: 1, config: config});
	});

	it(config.browsers +" browser(s) have joined!", function(){
	    require('../util/open').web(config.browsers, "http://"+ config.IP +":"+ config.port);
// 		console.log("PLEASE OPEN http://"+ config.IP +":"+ config.port +" IN "+ config.browsers +" BROWSER(S)!");
		return browsers.atLeast(config.browsers);
	});

	it("Browsers initialized gun!", function(){
		var tests = [], i = 0;
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				localStorage.clear(); console.log('Clear localStorage!!!');
				var env = test.props;
				var opt = {peers:['http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun'], wait: 1000};
				var pid = location.hash.slice(1);
				if (pid) { opt.pid = pid; }
				Gun.on('opt', function(ctx) {
					this.to.next(ctx);
					ctx.on('hi', function(opt) {
						document.getElementById('pid').innerHTML = (document.getElementById('pid').innerHTML || "-")  + ', ' + this.on.opt.pid;
					});
				});
				var gun = window.gun = Gun(opt);
				window.ref = gun.get('holy').get('grail');
			}, {i: i += 1, config: config}));
		});
		return Promise.all(tests);
	});

	it("Wait for Alice, Bob and John...", function(done){
		setTimeout(done, 1000);
	});

	it("Alice Write: Hi Bob!", function(){
		return alice.run(function(test){
			console.log("I AM ALICE");
			$('#name').text('Alice');
			test.async();
			ref.once(function() { // TODO: Need `.once` first for subscription. If Alice do a `.put` before a `.once`, Alice will get old data from localStorage if Bob update
				ref.put('Hi Bob!', function(ack) {
					console.log(ack);
					setTimeout(test.done, 2000);
				});
			});
		});
	});

	it("Bob receive ONCE from Alice: Hi Bob!", function(){
		return bob.run(function(test){
			console.log("I AM BOB");
			$('#name').text('Bob');
			test.async();
			ref.once(function(data){
				if('Hi Bob!' === data){
					console.log('[OK] Bob receive the question: ', data);
					return test.done();
				} else {
					var err = '[FAIL] Bob MUST receive: Hi Bob! but receive: ' + data + ' Storage: ' + localStorage.getItem('gun/');
					console.log(err);
					return test.fail(err);
				}
			})
		})
	});

	it("Bob Write response: Hi Alice!", function(){
		return bob.run(function(test){
			test.async();
			ref.put('Hi Alice!', function(ack) {
				console.log('[OK] Bob Write response: Hi Alice!', ack);
				setTimeout(test.done, 2000);
			});
		});
	});

	it("Alice Read response from Bob: Hi Alice!", function(){
		return alice.run(function(test){
			test.async();
			ref.once(function(data){
				if('Hi Alice!' === data){
					console.log('[OK] Alice receive the response: ', data);
					return test.done();
				} else {
					//TODO: aqui em duvida.. está pegando do localStorage, mas Bob alterou o dado.
					var err = '[FAIL] Alice receive wrong response: "' + data + '" and must be "Hi Alice!"';
					console.log(err);
					return test.fail(err);
				}
			})
		})
	});

	it("John Read what Bob say to Alice: Hi Alice!", function(){
		return john.run(function(test){
			test.async();
			console.log("I AM JOHN");
			$('#name').text('John');
			ref.once(function(data){
				if('Hi Alice!' === data){
					console.log('[OK] John receive the data: ', data);
					return test.done();
				} else {
					//TODO: aqui em duvida.. está pegando do localStorage, mas Bob alterou o dado.
					var err = '[FAIL] John receive wrong data: "' + data + '" and must be "Hi Alice!"';
					console.log(err);
					return test.fail(err);
				}
			})
		})
	});

	it("Bob Write in some data, Alice not subscribed", function(){
		return bob.run(function(test){
			test.async();
			gun.get('bob').get('mine').put('Alice dont want this data now!', function() {
				setTimeout(test.done, 2000);
			});
		});
	});

	it("Alice not subscribed. Must NOT receive data from Bob", function(){
		return alice.run(function(test){
			test.async();
			/// This must be empty, because alice don't make a subscription to this node.
			var bobdata = JSON.parse(localStorage.getItem('gun/')).bob;
			if (bobdata) {
				var err = '[FAIL] Alice receive not subscribed data in localStorage: ' + JSON.stringify(bobdata);
				console.log(err);
				return test.fail(err);
			}
			if (gun._.graph.bob) {
				var err = '[FAIL] Alice receive not subscribed data in in graph: ' + JSON.stringify(gun._.graph.bob);
				console.log(err);
				return test.fail(err);
			}
			console.log('[OK] Alice Read must NOT receive data from Bob: ', bobdata);
			return test.done();
		})
	});

	it("Alice subscription Bob data with ONCE, MUST receive", function(){
		return alice.run(function(test){
			test.async();
			gun.get('bob').once(function(data){
				if(data){
					console.log('[OK] Alice receive the value: ', data);
					return test.done();
				} else {
					var err = '[FAIL] Alice receive the value: ' + data;
					console.log(err);
					return test.fail(err);
				}
			})
		})
	});

	it("Bob Write in some data. Now Alice is subscribed.", function(){
		return bob.run(function(test){
			test.async();
			gun.get('bob').get('mine').put('Alice WANT this data now!', function() {
				setTimeout(test.done, 5000);
			});
		});
	});

	it("Alice must receive 'Alice WANT this data now!' from Bob node", function(){
		return alice.run(function(test){
			test.async();
			if (gun._.graph.bob && gun._.graph.bob.mine === 'Alice WANT this data now!') {
				console.log('[OK] GRAPH: ', gun._.graph.bob);
				test.done();
			} else {
				var err = '[FAIL] GRAPH: ' + JSON.stringify(gun._.graph.bob);
				console.log(err);
				test.fail(err);
			}
		})
	});

	it("Server has crashed!", function(){
		return server.run(function(test){
// 			var env = test.props;
// 			try{ require('fs').unlinkSync(env.i+'data'); }catch(e){}
			process.exit(0);
		}, {i: 1, config: config})
	});

	it("Wait...", function(done){
		setTimeout(done, 2000);
	});

	it("Alice change the data (superpeer crashed yet).", function(){
		return alice.run(function(test){
			var env = test.props;
			if(window.WebSocket){
				var err;
				try{ new WebSocket('http://'+ env.config.IP + ':' + (env.config.port + 2) + '/gun') }catch(e){ err = e }
				if(!err){
					test.fail("Server did not crash.");
				}
			}
			test.async()
			ref.put("Superpeer? Where are you?", function() {
				setTimeout(test.done, 1000);
			});
		}, {config: config});
	});

	it("Bob receive what Alice change via WebRTC.", function(){
		return bob.run(function(test){
			test.async();
			ref.once(function(data){
				if('Superpeer? Where are you?' === data){
					console.log('[OK] Bob received data via WebRTC: ', data);
					return test.done();
				} else {
					var err = '[FAIL] Bob MUST not receive: "Superpeer? Where are you?", but receive: ' + data;
					console.log(err);
					return test.fail(err);
				}
			})
		})
	});

	it("Bob change the data again (superpeer crashed yet).", function(){
		return alice.run(function(test){
			var env = test.props;
			if(window.WebSocket){
				var err;
				try{ new WebSocket('http://'+ env.config.IP + ':' + (env.config.port + 2) + '/gun') }catch(e){ err = e }
				if(!err){
					test.fail("Server did not crash.");
				}
			}
			test.async()
			ref.put("Alice, can you hear me?", function() {
				setTimeout(test.done, 1000);
			});
		}, {config: config});
	});

	it("Alice MUST receive 'Alice, can you hear me?' via WebRTC.", function(){
		return bob.run(function(test){
			test.async();
			ref.once(function(data){
				if('Alice, can you hear me?' === data){
					console.log('[OK] Alice received data via WebRTC: ', data);
					return test.done();
				} else {
					var err = '[FAIL] Alice MUST not receive: "Superpeer? Where are you?", but receive: ' + data;
					console.log(err);
					return test.fail(err);
				}
			})
		})
	});

	it("Superpeer come started again!", function(){
		return server2.run(function(test){
			var env = test.props;
			test.async();
// 			try{ require('fs').unlinkSync(env.i+'dataaxe') }catch(e){}
// 			try{ require('fs').unlinkSync((env.i+1)+'dataaxe') }catch(e){}
			var port = env.config.port + env.i;
			var server = require('http').createServer(function(req, res){
				res.end("I am "+ env.i +"!");
			});
			var Gun = require('gun');
			require('gun/axe');
			var gun = Gun({
				file: env.i+'dataaxe',
				web: server
			});
			server.listen(port, function(){
				test.done();
			});
		}, {i: 1, config: config});
	});

	it("Wait sync...", function(done){
		setTimeout(done, 5000);
	});

	it("Alice change the data again (superpeer is UP!).", function(){
		return alice.run(function(test){
			var env = test.props;
			test.async()
			ref.put("Yes Bob! Thanks for asking!", function() {
				setTimeout(test.done, 1000);
			});
		}, {config: config});
	});

	it("Bob MUST receive 'Yes Bob! Thanks for asking!'", function(){
		return bob.run(function(test){
			test.async();
			ref.once(function(data){
				if('Yes Bob! Thanks for asking!' === data){
					console.log('[OK] Bob received the data change: ', data);
					return test.done();
				} else {
					var err = '[FAIL] Bob MUST not receive: "Yes Bob! Thanks for asking!", but receive: ' + data;
					console.log(err);
					return test.fail(err);
				}
			})
		})
	});

	it("John dont want to know what Bob say in his node!", function(){
		return john.run(function(test){
			test.async();
			/// This must be empty, because John don't make a subscription to this node.
			var bobdata = JSON.parse(localStorage.getItem('gun/')).bob;
			if (bobdata) {
				var err = '[FAIL] John receive not subscribed data: ' + JSON.stringify(bobdata);
				console.log(err);
				return test.fail(err);
			}
			if (gun._.graph.bob) {
				var err = '[FAIL] John receive not subscribed data in in graph: ' + JSON.stringify(gun._.graph.bob);
				console.log(err);
				return test.fail(err);
			}
			console.log('[OK] John Read must NOT receive data from Bob: ', bobdata, gun._.graph.bob);
			return test.done();
		})
	});

	it("All finished!", function(done){
		console.log("Done! Cleaning things up...");
		setTimeout(function(){
			done();
		},1000);
	});
	after("Everything shut down.", function(){
		require('../util/open').cleanup() ||	browsers.run(function(){
			setTimeout(location.reload, 15 * 1000);
		});
		return servers.run(function(){
			process.exit();
		});
	});
});
