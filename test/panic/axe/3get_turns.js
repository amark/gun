/*
Assume we have 6 peers in a star topology,

 ..______r1______..
 ./.../..|...\...\.
 b1..b2..b3..b4..b5

 Alice, Bob, Carl, Dave, Ed using 1 relay. Alice joins later, asks for data all the others are subscribed to. The GET should be load balanced to ?3? other peers at a time. If ack hashes are not the same, keep asking. If they do match, stop asking other peers - this test checks that.
*/

// <-- PANIC template, copy & paste, tweak a few settings if needed...
var ip; try{ ip = require('ip').address() }catch(e){}
var config = {
	IP: ip || 'localhost',
	port: 8765,
	relays: 1,
	browsers: 5,
	route: {
		'/': __dirname + '/../index.html',
		'/gun.js': __dirname + '/../../../gun.js',
		'/jquery.js': __dirname + '/../../../examples/jquery.js'
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
var r1 = relays.pluck(1);

var browsers = clients.excluding(relays);
var b1 = browsers.pluck(1);
var b2 = relays.excluding(b1).pluck(1);
var b3 = relays.excluding([b1,b2]).pluck(1);
var b4 = relays.excluding([b1,b2]).pluck(1);
var b5 = relays.excluding([b1,b2]).pluck(1);

// continue boiler plate, tweak a few defaults if needed, but give descriptive test names...
describe("Dedup load balancing GETs", function(){
	//this.timeout(5 * 60 * 1000);
	this.timeout(10 * 60 * 1000);

	it("Relays have joined!", function(){
		return relays.atLeast(config.relays);
	});

	it("GUN started!", function(){
		var tests = [], i = 0;
		relays.each(function(client){
			tests.push(client.run(function(test){
				var env = test.props;
				test.async();
				try{ require('fs').unlinkSync(env.i+'data') }catch(e){}
  			try{ require('gun/lib/fsrm')(env.i+'data') }catch(e){}
				var server = require('http').createServer(function(req, res){
					res.end("I am "+ env.i +"!");
				});
				var port = env.config.port + env.i;
				var Gun; try{ Gun = require('gun') }catch(e){ console.log("GUN not found! You need to link GUN to PANIC. Nesting the `gun` repo inside a `node_modules` parent folder often fixes this.") }
				var peers = [], i = env.config.relays;
				while(i--){ // make sure to connect to self/same.
					var tmp = (env.config.port + (i + 1));
					peers.push('http://'+ env.config.IP + ':' + tmp + '/gun');
				}

				if (process.env.ROD_PATH) {
					console.log('testing with rod');
					var args = ['start', '--port', port, '--sled-storage=false'];
					if (peers.length) {
						args.push('--peers=' + peers.join(',').replaceAll('http', 'ws'));
					}
					const sp = require('child_process').spawn(process.env.ROD_PATH, args);
					sp.stdout.on('data', function(data){
						console.log(data.toString());
					});
					sp.stderr.on('data', function(data){
						console.log(data.toString());
					});
					test.done();
					return;
				}

				var gun = Gun({file: env.i+'data', peers: peers, web: server});
				server.listen(port, function(){
					test.done();
				});
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it(config.browsers +" browser(s) have joined!", function(){
		require('../util/open').web(config.browsers, "http://"+ config.IP +":"+ config.port);
		return browsers.atLeast(config.browsers);
	});
// end PANIC template -->

	it("Browsers initialized gun!", function(){
		var tests = [], i = 0;
		browsers.each(function(browser, id){
			tests.push(browser.run(function(test){
				try{ localStorage.clear() }catch(e){}
				try{ indexedDB.deleteDatabase('radata') }catch(e){}
				
				// start with the first peer:
				var env = test.props;
				var gun = Gun('http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun');

				window.gun = gun;
				window.ref = gun.get('test');
				window.ID = test.props.i;

				if(window.ID === 1){ return } // everyone BUT NOT alice yet.
				test.async();

				gun.get('test').on(function(data){
					if(window.C){ return } window.C = 1;
					setTimeout(function(){
						var dam = ref.back('opt.mesh');
						var hear = dam.hear;
						dam.hear = function(raw, peer){
							//console.log(window.ID, "HEARD:", raw);
							window.HEARD = 1;
							hear(raw, peer);
						}
					}, 1000);
					test.done();
				})
				if(window.ID == 2){
					setTimeout(function(){ gun.get('test').put({hello: 'world'}) },1000);
				}
			}, {i: i += 1, config: config}));
		});
		return Promise.all(tests);
	});
	
	it("wait...", function(done){
		setTimeout(function(){
			done();
		},2000);
	});

	it("Carl already has the data.", function(){
		return b3.run(function(test){
			test.async();
			if('world' === gun._.graph.test.hello){ // TODO: BAD! Tests should probably not use non-API ways to check things. But whatever, hacky for now.
				test.done();
			}
		}, {acks: config.relays});
	});

	it("Alice does not have the data, needs to ask for it.", function(){
		return b1.run(function(test){
			if(window.ID !== 1){
				console.log("FAIL: Alice not match ID");
				alice_mismatch;
			}
			if(gun._.graph.test){ // TODO: BAD! Tests should probably not use non-API ways to check things. But whatever, hacky for now.
				console.log("FAIL: Alice got synced data she was not subscribed to. This may mean a more basic feature (pub/sub) of AXE is broken.");
				alice_already_had_the_data;
			}
			test.async();

			ref.once(function(data){
				if('world' === data.hello){
					test.done();
				}
			})
		}, {acks: config.relays});
	});

	it("How many heard?", function(){ // This test is a little weird...
		this.timeout(2000);
		var heard = 0, missed = 0;
		var tests = [], i = 0;
		browsers.each(function(browser, id){
			tests.push(browser.run(function(test){
				//console.log(window.ID, 'heard?', window.HEARD);
				test.async();
				if(window.HEARD){
					test.done();
				} else {
					throw new Error("DID NOT HEAR");
				}
			}, {i: i += 1, config: config}).then(function(){
				console.log(id.slice(0,2), "was asked");
				 heard += 1;
			}).catch(function(err){
				if(0 <= err.message.indexOf('NOT HEAR')){
					console.log(id.slice(0,2), "was NOT asked.");
					missed += 1;
					return;
				}
				throw new Error("other error");
			}));
		});
		return Promise.all(tests).then(function(){
			console.log("COMPARE?", heard, missed);
			if(missed >= 2 && heard <= 3){ return }
			console.log("ERROR! Note: This test was hardcoded to 3 AXE turns. If turns are dynamic or different or variable now, you need to update this test.")
			throw new Error("GET was heard by too many peers!");
		})
	});

	it("All finished!", function(done){
		console.log("Done! Cleaning things up...");
		setTimeout(function(){
			done();
		},1000);
	});

	after("Everything shut down.", function(){
		require('../util/open').cleanup();
		return relays.run(function(){
			process.exit();
		});
	});
});