/*
If WebRTC fails browsers will fallback to using a relay.
A relay may be running on a Raspberry Pi or some low-end cloud VM.
There is a limit to how many peers it can help before it crashes.
It can only handle a "mob" of a certain size.
So what happens then?

It would be useful if it could tell newly connecting peers to connect to someone else.
This will rebalance the load on the network.

Imagine there are 3 relays that can handle 100K peers,
But then 300K peers connect to the 1st one.
We want to then see the peers move to the other relays, such that the 3 have 100K peers each.

(1) To simulate this, we will have 3 peers connect starting like this:
  ..r1-----r2--r3
  ./\.\..........
  b1.b2.b3.......

(2) By the end of the test, the "mob" logic should rebalance the load to look like this:
  ..r1--r2--r3..
  ./....|.....\.
  b1....b2....b3

If it does, the test passes.

(Note: At the end of this test, it uses GUN to sync data about what peers are connected to whom. While this is useful in that it also verifies that sync between b1 <-> b3 works regardless of whether direct or indirect connections, as such it could result in errors: If GUN has a bug, the AXE test may fail even if it is not the fault of AXE, and likewise - the usage of GUN in this test is contrived, it passing has 0 correlation that GUN is correctly handling the sync logic. In fact, assume it is not, make sure you use another test to verify that.)

Thanks @Draeder for helping with these tests!!!!
*/

// <-- PANIC template, copy & paste, tweak a few settings if needed...
var ip; try{ ip = require('ip').address() }catch(e){}
var config = {
	IP: ip || 'localhost',
	port: 8765,
	relays: 3,
	browsers: 3,
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
var r2 = relays.excluding(r1).pluck(1);
var r3 = relays.excluding([r1,r2]).pluck(1);

var browsers = clients.excluding(relays);
var b1 = browsers.pluck(1);
var b2 = relays.excluding(b1).pluck(1);
var b3 = relays.excluding([b1,b2]).pluck(1);

// continue boiler plate, tweak a few defaults if needed, but give descriptive test names...
describe("Mob test.", function(){
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
				var port = env.config.port + env.i;
				test.async();

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

				try {
					require('fs').unlinkSync(env.i + 'data')
				} catch (e) {
				}
				try {
					require('gun/lib/fsrm')(env.i + 'data')
				} catch (e) {
				}
				var server = require('http').createServer(function (req, res) {
					res.end("I am " + env.i + "!");
				});
				var Gun;
				try {
					Gun = require('gun')
				} catch (e) {
					console.log("GUN not found! You need to link GUN to PANIC. Nesting the `gun` repo inside a `node_modules` parent folder often fixes this.")
				}

				console.log(port, " connect to ", peers);
				var gun = Gun({file: env.i+'data', peers: peers, web: server, mob: 3, multicast: false});
				global.gun = gun;
				server.listen(port, function(){
					test.done();
				});
				
				gun.get('a').on(function(){ }); // TODO: Wrong! This is an example of the test using GUN in weird ways to work around bugs at the time of writing. This line should not be necessary, AXE should still pass even if this line is commented out, however if it fails then that is a bug in GUN's logic, not AXE.
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
				test.async();
				try{ localStorage.clear() }catch(e){}
				try{ indexedDB.deleteDatabase('radata') }catch(e){}
				
				// start with the first peer:
				var env = test.props;
				var gun = Gun('http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun');

				// NOTE: This "mob" logic will be moved into axe.js (or maybe gun.js itself), but while we're building the logic it is easier to quickly hack/iterate by prototyping here in the test itself until it passes. But it needs to be refactored into the actual code or else you might have false positives of this test overloading "mob" logic.
				// ^^^^^^^^^ THIS HAS BEEN MOVED TO GUN CORE, HOWEVER,
				// ^^^^^^^^^ EXPERIMENT WITH MORE ADVANCED LOGIC THAT AXE OVERLOADS CORE.
				var mesh = gun.back('opt.mesh'); // overload...
				/*mesh.hear['mob'] = function(msg, peer){
					// TODO: NOTE, code AXE DHT to aggressively drop new peers AFTER superpeer sends this rebalance/disconnect message that contains some other superpeers.
					clearTimeout(gun.TO); gun.TO = setTimeout(end, 2000);
					if(!msg.peers){ return }
					var peers = Object.keys(msg.peers), one = peers[Math.floor(Math.random()*peers.length)];
					console.log('Browser', env.i, 'chooses', one, 'from', JSON.stringify(peers), 'that', peer.url, 'suggested, because it is mobbed.');//, 'from', msg.peers+'');
					mesh.bye(peer); // Idea: Should keep track of failed ones to reduce repeats. For another feature/module that deserves its own separate test.
					mesh.hi(one);
				}*/

				//console.log('Browser', env.i, "started with:", Object.keys(gun._.opt.peers)+'');
				window.gun = gun;
				window.ref = gun.get('test');
				function end(){
					test.done();
				}
				gun.TO = setTimeout(end, 3000);
			}, {i: i += 1, config: config}));
		});
		return Promise.all(tests);
	});
	
	it("wait...", function(done){
		setTimeout(function(){
			done();
		},3000);
	});

	it("Got Load Balanced to Different Peer", function(){
		var tests = [], i = 0;
		browsers.each(function(browser, id){
			tests.push(browser.run(function(test){
				test.async();
				ref.get('b'+test.props.i).put(''+Object.keys(gun.back('opt.peers')));
				// NOTE: Above line was put here as a workaround. Even if this line was in the prior step, this test should still pass. Make sure there is another test that correctly checks for reconnect logic properly restoring sync.

				ref.on(function(data){
					if(!data.b1 || !data.b2 || !data.b3){ return }
					clearTimeout(test.to);
					test.to = setTimeout(function(){
						var d = {}; Object.keys(data).sort().forEach(function(i){ d[i] = data[i] }); delete d._; console.log(test.props.i, "sees", JSON.stringify(d));
						var now = Object.keys(gun.back('opt.peers'));
						if(now.length > 1){
							console.log("FAIL: too_many_connections");
							too_many_connections;
							return;
						}
						var not = {};
						Object.keys(data).forEach(function(k,v){ v = data[k];
							if('_' === k){ return }
							if(v.split(',').length > 1){
								console.log("FAIL: too_many");
								too_many;
								return;
							}
							if(not[v]){
								console.log("FAIL: already");
								already_;
								return;
							}
							not[v] = 1;
						});
						test.done();
					}, 2000);
				});

			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
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