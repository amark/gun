/*
If Alice calls Bob and Bob calls Alice, 2 connections will be formed, which wastes bandwidth. This test checks for that and deduplicates the connections.
*/

// <-- PANIC template, copy & paste, tweak a few settings if needed...
var ip; try{ ip = require('ip').address() }catch(e){}
var config = {
	IP: ip || 'localhost',
	port: 8765,
	relays: 3,
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

// continue boiler plate, tweak a few defaults if needed, but give descriptive test names...
describe("Put ACK", function(){
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
				global.peerID = String.fromCharCode(64 + env.i);
				console.log(env.i, port, " connect to ", peers);
				var gun = Gun({file: env.i+'data', pid: peerID, peers: peers, web: server});
				global.gun = gun;
				server.listen(port, function(){
					test.done();
				});
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});
// end PANIC template -->

	it("Drop duplicates", function(){
		var tests = [], i = 0;
		relays.each(function(client){
			tests.push(client.run(function(test){
				var env = test.props;
				test.async();
				var peers = gun.back('opt.peers');

				gun.get('test').on(function(a){ }); // connections are lazy, so trigger a read. A feature, tho also a bug in this case, should probably have its own tests to determine if this ought be intended or not.

				setTimeout(function(){
					var p = [], o = {}, err; Object.keys(peers).forEach(function(id){
						id = peers[id];
						p.push(id.pid);
						err = err || (o[id.pid] = (o[id.pid] || 0) + 1) - 1;
					});
					console.log(peerID, 'connected to:', p);
					if(p.length > 2 || err){
						console.log("FAIL: too_many_connections");
						too_many_connections;
						return;
					}
					test.done();
				},2000);
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("All finished!", function(done){
		console.log("Done! Cleaning things up...");
		setTimeout(function(){
			done();
		},1);
	});

	after("Everything shut down.", function(){
		require('../util/open').cleanup();
		return relays.run(function(){
			process.exit();
		});
	});
});