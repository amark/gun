/*
Make sure that our writes are all saved by the other browser.
// Note: This test has many manual adjustments: Many features disabled, etc. consider some variations.
// Bug: Failing due to lS ack disabled if peered, need to fix with advanced probabilistic mode.
*/

// <-- PANIC template, copy & paste, tweak a few settings if needed...
var ip; try{ ip = require('ip').address() }catch(e){}
var config = {
	IP: ip || 'localhost',
	port: 8765,
	relays: 1,
	browsers: 2,
	puts: 1000,
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
				while(i--){
					var tmp = (env.config.port + (i + 1));
					if(port != tmp){ // ignore ourselves
						peers.push('http://'+ env.config.IP + ':' + tmp + '/gun');
					}
				}
				console.log(port, " connect to ", peers);
				var gun = Gun({file: false, rad: false, localStorage: false, file: env.i+'data', peers: peers, web: server, axe: false});
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

	it("Alice", function(){
		return alice.run(function(test){
			window.ALICE = 1;
		}, {puts: config.puts});
	});

	it("Browsers initialized gun!", function(){
		var tests = [], i = 0;
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				try{ localStorage.clear() }catch(e){}
				try{ indexedDB.deleteDatabase('radata') }catch(e){}
				var env = test.props;
				var gun = Gun({peers: 'http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun', localStorage: window.ALICE? false : true});
				window.ref = gun.get('test').on(function(){ });
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Puts", function(){
		return alice.run(function(test){
			console.log("I AM ALICE");
			test.async();
			var i = test.props.puts, d = 0;
			while(i--){ go(i) }
			function go(i){
				ref.get(i).put({hello: 'world'}, function(ack){
					//console.log("acked:", JSON.stringify(ack.ok) || ('err:'+ack.err));
					if(ack.err){ put_failed }
					if(++d !== test.props.puts){ return }
					console.log("all success", d);
					test.done();
				});
			}
		}, {puts: config.puts});
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