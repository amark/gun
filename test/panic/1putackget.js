/*
This is the first in a series of basic networking correctness tests.
Each test itself might be dumb and simple, but built up together,
they prove desired end goals for behavior at scale.

1. (this file) Makes sure that a browser receives daisy chain acks that data was saved.
2. (this file) Makes sure the browser receives a deduplicated ACK when data is requested across the daisy chains.

Assume we have a 4 peer federated-like topology,

..B--C..
./....\.
A......D

Alice's data can be saved by more than just Bob.
Dave asking for the data should not flood him with more than necessary responses.
*/

// <-- PANIC template, copy & paste, tweak a few settings if needed...
var ip; try{ ip = require('ip').address() }catch(e){}
var config = {
	IP: ip || 'localhost',
	port: 8765,
	servers: 2,
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
    clients: Array(config.servers).fill().map(function(u, i){
			return {
				type: 'node',
				port: config.port + (i + 1)
			}
    }),
    panic: 'http://' + config.IP + ':' + config.port
});

var servers = clients.filter('Node.js');
var bob = servers.pluck(1);
var carl = servers.excluding(bob).pluck(1);
var browsers = clients.excluding(servers);
var alice = browsers.pluck(1);
var dave = browsers.excluding(alice).pluck(1);

// continue boiler plate, tweak a few defaults if needed, but give descriptive test names...
describe("Put ACK", function(){
	//this.timeout(5 * 60 * 1000);
	this.timeout(10 * 60 * 1000);

	it("Servers have joined!", function(){
		return servers.atLeast(config.servers);
	});

	it("GUN started!", function(){
		var tests = [], i = 0;
		servers.each(function(client){
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
				var peers = [], i = env.config.servers;
				while(i--){
					var tmp = (env.config.port + (i + 1));
					if(port != tmp){ // ignore ourselves
						peers.push('http://'+ env.config.IP + ':' + tmp + '/gun');
					}
				}
				console.log(port, " connect to ", peers);
				var gun = Gun({file: env.i+'data', peers: peers, web: server, axe: false}); // not working with axe currently!
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

	it("Browsers initialized gun!", function(){
		var tests = [], i = 0;
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				try{ localStorage.clear() }catch(e){}
				try{ indexedDB.deleteDatabase('radata') }catch(e){}
				var env = test.props;
				var gun = Gun('http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun');
				window.ref = gun.get('a');
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});
// end PANIC template --> 

	it("Put", function(){
		return alice.run(function(test){
			console.log("I AM ALICE");
			test.async();
			var c = test.props.acks, acks = {}, tmp;
			c = c < 2? 2 : c; // at least 2 acks.
			ref.put({hello: 'world'}, function(ack){
				//console.log("ack:", ack['#']);
				acks[ack['#']] = 1; // uniquely list all the ack IDs.
				tmp = Object.keys(acks).length;
				console.log(tmp, "save");
				if(tmp >= c){ // when there are enough
					test.done(); // confirm test passes
					wire(); // start sniffing for future tests
					return;
				}
			}, {acks: c});
			
			function wire(){ // for the future tests, track how many wire messages are heard/sent.
				ref.hear = ref.hear || [];
				var dam = ref.back('opt.mesh');
				var hear = dam.hear;
				dam.hear = function(raw, peer){ // hijack the listener
					try{var msg = JSON.parse(raw);
					}catch(e){ console.log("Note: This test not support RAD serialization format yet, use JSON.") }
					hear(raw, peer);
					ref.hear.push(msg); // add to count
				}
				var say = dam.say;
				dam.say = function(raw, peer){
					var yes = say(raw, peer);
					if(yes === false){ return }
					console.log(msg);
					(ref.say || (ref.say = [])).push(JSON.parse(msg)); // add to count.
				}
			}
		}, {acks: config.servers});
	});

	it("Get", function(){
		/*
			Here is the recursive rule for GET, keep replying while hashes mismatch.
			1. Receive a GET message.
			2. If it has a hash, and if you have a thing matching the GET, then see if the hashes are the same, if they are then don't ACK, don't relay, end. (Tho subscribe them)
			3. If you would have the thing but do not, then ACK that YOU have nothing.
			4. If you have a thing matching the GET or an ACK for the GET's message, add the hash to the GET message, and ACK with the thing or ideally the remaining difference.
			5. Pick ?3? OTHER peers preferably by priority that they have got the thing, send them the GET, plus to all "up" peers.
			6. If no ACKs you are done, end. (Or sample other peers until confident)
			7. If you get ACKs back to the GET with things and different hashes, optionally merge into the thing you have GOT and update the hash.
			8. Go to 4.
			// Deduplicated reply hashes cannot be global, they need to be request specific to avoid other bugs.
		*/
		return dave.run(function(test){
			console.log("I AM DAVE");
			test.async();
			var c = 0, to;
			ref.hear = ref.hear || [];
			var dam = ref.back('opt.mesh');
			var hear = dam.hear;
			dam.hear = function(raw, peer){ // hijack listener
				var msg = JSON.parse(raw);
				console.log('hear:', msg);
				hear(raw, peer);
				ref.hear.push(msg);

				if(msg.put){ ++c } // count how many acks our GET gets.
			}
			ref.get(function(ack){ // GET data
				if(!ack.put || ack.put.hello !== 'world'){ return } // reject any wrong data.
				// because the data is the same on all peers,
				// we should only get 1 ack because the others dedup off the 1st ACK's hash.
				if(c > 1){ return too_many_acks }

				clearTimeout(to);
				to = setTimeout(test.done, 1000);
			});
		}, {acks: config.servers});
	});

	it("DAM", function(){
		return alice.run(function(test){
			test.async();
			if(ref.hear.length > 1){ return heard_to_much } // Alice should hear the GET
			if(ref.say){ return said_too_much } // But should not reply because their reply hash dedups with an earlier reply that was added to the GET.
			test.done()
		}, {acks: config.servers});
	});

	it("All finished!", function(done){
		console.log("Done! Cleaning things up...");
		setTimeout(function(){
			done();
		},1000);
	});

	after("Everything shut down.", function(){
		require('./util/open').cleanup();
		return servers.run(function(){
			process.exit();
		});
	});
});