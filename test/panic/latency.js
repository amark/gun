// this has Alice read data, measuring its latency, while other browsers are flooding relay with updates.
var config = {
	IP: require('ip').address(),
	port: 8765,
	servers: 1,
	browsers: 2,
	each: 10000,
	burst: 10,
	wait: 1,
	route: {
		'/': __dirname + '/index.html',
		'/gun.js': __dirname + '/../../gun.js',
		'/jquery.js': __dirname + '/../../examples/jquery.js',
		'/sea.js': __dirname + '/../../sea.js',
		'/yson.js': __dirname + '/../../lib/yson.js'
	},
	dir: __dirname
}

var panic = require('panic-server');
panic.server().on('request', function(req, res){ // Static server
	config.route[req.url] && require('fs').createReadStream(config.route[req.url]).pipe(res);
}).listen(config.port); // Start panic server.

// In order to tell the clients what to do,
// We need a way to reference all of them.
var clients = panic.clients;

// Some of the clients may be NodeJS servers on different machines.
// PANIC manager is a nifty tool that lets us remotely spawn them.
var manager = require('panic-manager')();
manager.start({
    clients: Array(config.servers).fill().map(function(u, i){ // Create a bunch of servers.
			return {
				type: 'node',
				port: config.port + (i + 1) // They'll need unique ports to start their servers on, if we run the test on 1 machine.
			}
    }),
    panic: 'http://' + config.IP + ':' + config.port // Auto-connect to our panic server.
});

// Now lets divide our clients into "servers" and "browsers".
var servers = clients.filter('Node.js');
var browsers = clients.excluding(servers);
var alice = browsers.pluck(1);
var others = browsers.excluding(alice);

describe("Test vanishing property "+ config.browsers +" browser(s) across "+ config.servers +" server(s)!", function(){

	// We'll have to manually launch the browsers,
	// So lets up the timeout so we have time to do that.
	this.timeout(5 * 60 * 1000);

	it("Servers have joined!", function(){
		// Alright, lets wait until enough gun server peers are connected.
		return servers.atLeast(config.servers);
	});

	it("GUN has spawned!", function(){
		// Once they are, we need to actually spin up the gun server.
		var tests = [], i = 0;
		servers.each(function(client){
			// for each server peer, tell it to run this code:
			tests.push(client.run(function(test){
				// NOTE: Despite the fact this LOOKS like we're in a closure...
				// it is not! This code is actually getting run
				// in a DIFFERENT machine or process!
				var env = test.props;
				// As a result, we have to manually pass it scope.
				test.async();
				// Clean up from previous test.
				try{ require('fs').unlinkSync(env.i+'data.json') }catch(e){}
				var server = require('http').createServer(function(req, res){
					res.end("I am "+ env.i +"!");
				});
				// Launch the server and start gun!
				var Gun = require(env.config.dir+'/../../');
				// Attach the server to gun.
				//var gun = Gun({file: env.i+'data', web: server});
				var gun = Gun({file: env.i+'data', web: server, rad: false, localStorage: false});
				server.listen(env.config.port + env.i, function(){
					// This server peer is now done with the test!
					// It has successfully launched.
					test.done();
				});
				//setInterval(function(){ console.log("CPU turns stacked:", setTimeout.turn.s.length) },1000);
			}, {i: i += 1, config: config})); 
		});
		// NOW, this is very important:
		// Do not proceed to the next test until
		// every single server (in different machines/processes)
		// have ALL successfully launched.
		return Promise.all(tests);
	});

	it(config.browsers +" browser(s) have joined!", function(){
		console.log("PLEASE OPEN http://"+ config.IP +":"+ config.port +" IN "+ config.browsers +" BROWSER(S)!");
		return browsers.atLeast(config.browsers);
	});

	it("Browsers initialized gun!", function(){
		var tests = [], i = 0;
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				try{ localStorage.clear() }catch(e){}
				try{ indexedDB.deleteDatabase('radata') }catch(e){}
				var env = test.props;
				var gun = Gun({retry: 2, peers: 'http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun'});
				window.gun = gun;
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Start flooding", function(){
		var tests = [], i = 0;
		others.each(function(client, id){
			tests.push(client.run(function(test){
				console.log("I SHALL FLOOD");
				test.async();
				var config = test.props.config;

				gun.get('test').get('latency').put("hello world");
				
				var go = setInterval(function(){
					var burst = config.burst;
					while(--burst){
						console.log(burst);
						gun.get(String.random(Math.random()*100)).get(String.random(Math.random()*10)).put(String.random(Math.random()*1000))
					}
				},config.wait);

				setTimeout(function(){
					test.done();
					setTimeout(function(){ clearInterval(go) }, 2000);
				}, 1000 * 10);
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Alice reads during flood", function(){
		return alice.run(function(test){
			console.log("I AM ALICE", gun.back('opt.pid'));
			$('body').css('background', 'red');
			test.async();
			var S = +new Date;
			gun.get('test').get('latency').on(function(data){
				var latency = +new Date - S;
				console.log(latency, data);
				if(!data){ return }
				//test.done();
			});
		}, config);
	});

	after("Everything shut down.", function(){
		// which is to shut down all the browsers.
		browsers.run(function(){
			setTimeout(function(){
				return;
				location.reload();
			}, 15 * 1000);
		});
		// And shut down all the servers.
		return servers.run(function(){
			process.exit();
		});
	});
})