/*
Assume we have 5000 peers in a star topology:

 ..______r1______..
 ./.../..|...\...\.
 b1..b2..b3..b4..b5

They are all subscribed to the same data and Alice makes a 1 byte change to it. Even if a save acknowledgement is 1 byte, that would be 5K times the change. This does not scale. So instead, Alice states a sample size of 3/X and then the peers saving data use that ratio to decide whether they ack.

Each time the message gets relayed we modify X to be how many peers this hop sent it to. We also should decrease the sample size by 1.

This test checks that we get fewer acks than (half) the peers connected.
This also tests that custom ACKs get sent back thru AXE to one of the sending peers.
*/

// <-- PANIC template, copy & paste, tweak a few settings if needed...
var ip; try{ ip = require('ip').address() }catch(e){}
var config = {
	IP: ip || 'localhost',
	port: 8765,
	relays: 1,
	browsers: 9,
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
var r1 = relays.pluck(1);

var browsers = clients.excluding(relays);
var b1 = browsers.pluck(1);
var others = browsers.excluding(b1);
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
				while(i--){
					var tmp = (env.config.port + (i + 1));
					if(port != tmp){ // ignore ourselves
						peers.push('http://'+ env.config.IP + ':' + tmp + '/gun');
					}
				}
				var gun = Gun({peers: peers, web: server, rad: false, radisk: false, file: false, localStorage: false, axe: false});
				server.listen(port, function(){
					test.done();
				});
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it(config.browsers +" browser(s) have joined!", function(){
		require('./util/open').web(config.browsers, "http://"+ config.IP +":"+ config.port);
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
				var gun = Gun({peers: 'http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun', localStorage: false});

				window.gun = gun;
				window.ref = gun.get('test');

				ref.on(function(data){ });

			}, {i: i += 1, config: config}));
		});
		return Promise.all(tests);
	});

	it("ACK", function(){
		var tests = [], i = 0;
		others.each(function(browser, id){
			tests.push(browser.run(function(test){
				var id = test.props.i;

				// these lines are for debugging...
				/*var dam = ref.back('opt.mesh');
				var say = dam.say;
				dam.say = function(raw, peer){
					say(raw, peer);
					//console.log("said:", JSON.stringify(raw));
				}
				var hear = dam.hear;
				dam.hear = function(raw, peer){
					//console.log("heard:", raw);
					hear(raw, peer);
				}*/

				gun.on('put', function(msg){
					var ok = msg.ok;
					if(ok['@'] > 2){
						console.log("Relay did not decrement!")
						test.fail("Relay did not decrement!");
						_relay_did_not_decrement;
						return;
					}
					if(Math.random() > (ok['@'] / ok['/'])){ return }
					console.log('ack?', JSON.stringify(msg));
					//console.log("WAS THE SPECIAL ONE TO ACK!", JSON.stringify(msg));
					gun.on('out', {'@': msg['#'], ok: {yay: 1}});
				});

			}, {i: i += 1, config: config}));
		});
		return Promise.all(tests);
	});
	
	it("wait...", function(done){
		setTimeout(function(){
			done();
		},2000);
	});

	it("Alice saves data", function(){
		return b1.run(function(test){
			test.async();

			// these lines are for debugging...
			/*var dam = ref.back('opt.mesh');
			var say = dam.say;
			dam.say = function(raw, peer){
				say(raw, peer);
				//console.log("said:", JSON.stringify(raw), dam.near, Object.keys(gun._.opt.peers).join(','));
			}
			var hear = dam.hear;
			dam.hear = function(raw, peer){
				hear(raw, peer);
				//console.log("heard:", raw);
			}*/

			var many = test.props.config.browsers;
			console.log("Alice is saving...");
			test.c = 0;
			ref.put({hello: 'world'}, function(ack){
				if(!ack.ok.yay){
					test.fail("ERROR: No custom ack!");
					console.log("ERROR: No custom ack!");
					return no_custom_ack;
				}
				//console.log("I saved data, this is the ACK", JSON.stringify(ack));
				test.c++;
				clearTimeout(test.to);
				test.to = setTimeout(function(){
					if(test.c >= (many/2)){
						test.fail("ERROR: Too many acks!");
						console.log("ERROR: Too many acks!");
						return too_many_acks;
					}
					test.done();
				}, 999);
				
			}, {ok: 3, acks: 9999});
		}, {config: config});
	});

	it("All finished!", function(done){
		console.log("Done! Cleaning things up...");
		setTimeout(function(){
			done();
		},1000);
	});

	after("Everything shut down.", function(){
		console.log("REMINDER: RUN THIS TEST WITH AXE ON & OFF!");
		require('./util/open').cleanup();
		return relays.run(function(){
			process.exit();
		});
	});
});