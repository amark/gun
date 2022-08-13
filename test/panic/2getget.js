/*
This test is almost the opposite of the first test.
1. Alice saves data ""offline"" so nobody knows it exists.
2. Then Carl & Dave simultaneously ask for it, even tho they are not connected to Alice and Bob does not know where it is.
3. They must receive the data, and their requests must not conflict or cause the other's to drop.
4. Optionally: Then Ed comes along and asks for the data again, he must receive it from the closest cached peer.
*/

// <-- PANIC template, copy & paste, tweak a few settings if needed...
var ip; try{ ip = require('ip').address() }catch(e){}
var config = {
	IP: ip || 'localhost',
	port: 8765,
	relays: 1,
	browsers: 4,
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
var bob = relays.pluck(1);
var browsers = clients.excluding(relays);
var alice = browsers.pluck(1);
var carl = browsers.excluding(alice).pluck(1);
var dave = browsers.excluding([alice, carl]).pluck(1);
var cd = new panic.ClientList([carl, dave]);
var ed = browsers.excluding([alice, carl, dave]).pluck(1);

// continue boiler plate, tweak a few defaults if needed, but give descriptive test names...
describe("GET GET", function(){
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
				console.log(port, " connect to ", peers);

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

				/* BELOW IS HACKY NON-STANDARD TEST STUFF, DO NOT REUSE */
				setInterval(function(){
					var tmp = gun._.graph.a;
					if(!tmp || !tmp.hello){ return }
					tmp.hello = "bob_cache";
				}, 1);
				// END HACKY STUFF.

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
				var gun = Gun({peers: 'http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun', localStorage: false});
				window.gun = gun;
				window.ref = gun.get('a');
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});
// end PANIC template -->

	it("connect", function(){
		return alice.run(function(test){
			console.log("I AM ALICE");
			test.async();
			gun.get('random').get(function(ack){
				setTimeout(function(){
					test.done();
				}, 1000);
			})
		});
	});

	it("Put", function(){
		return alice.run(function(test){
			test.async();
			
			var dam = ref.back('opt.mesh');
			var say = dam.say;
			dam.say = function(){}; // prevent from syncing

			var c = 0;
			ref.put({hello: 'world'}, function(ack){ ++c }); // count acks, which should be none because disconnected
			setTimeout(function(){
				if(c){ return should_not_have_ack } // make sure there were none.
				dam.say = say; // restore normal code
				test.done();
			}, 1000);
		});
	});

	it("Get", function(){
		return cd.run(function(test){
			test.async();
			console.log("I am Carl or Dave");
			ref.get(function(ack){ // this makes sure data was found p2p, even without subscription knowledge.
				if(ack.put){
					test.done();
				}
			});
		});
	});

	it("Get Cached", function(){
		return ed.run(function(test){
			test.async();

			ref.get(function(ack){ // the data should reply from a cache in the daisy chain now.
				if(test.c){ return }
				if(ack.put.hello !== 'bob_cache'){
					console.log("FAIL: we_want_bob_only");
					return we_want_bob_only;
				}
				test.done();test.c=1;
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
		require('./util/open').cleanup();
		return relays.run(function(){
			process.exit();
		});
	});
});