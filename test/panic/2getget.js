/*
This is the first in a series of basic networking correctness tests.
Each test itself might be dumb and simple, but built up together,
they prove desired end goals for behavior at scale.
1. (this file) Is a browser write is confirmed as save by multiple peers even if by daisy chain.
2. 
*/

var config = {
	IP: require('ip').address(),
	port: 8765,
	servers: 1,
	browsers: 3,
	route: {
		'/': __dirname + '/index.html',
		'/gun.js': __dirname + '/../../gun.js',
		'/jquery.js': __dirname + '/../../examples/jquery.js'
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
var bob = servers.pluck(1);
var browsers = clients.excluding(servers);
var alice = browsers.pluck(1);
var carl = browsers.excluding(alice).pluck(1);
var dave = browsers.excluding([alice, carl]).pluck(1);
var cd = new panic.ClientList([carl, dave]);

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
				var Gun = require('gun');
				var peers = [], i = env.config.servers;
				while(i--){
					var tmp = (env.config.port + (i + 1));
					if(port != tmp){ // ignore ourselves
						peers.push('http://'+ env.config.IP + ':' + tmp + '/gun');
					}
				}
				console.log(port, " connect to ", peers);
				var gun = Gun({file: env.i+'data', peers: peers, web: server});
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
				window.gun = gun;
				window.ref = gun.get('a');
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});


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
			
			var say = ref._.root.opt.mesh.say;
			ref._.root.opt.mesh.say = function(){}; // prevent from syncing

			var c = 0;
			ref.put({hello: 'world'}, function(ack){ ++c });
			setTimeout(function(){
				ref._.root.opt.mesh.say = say;
				if(c){ should_not_have_ack }
				test.done();
			}, 1000);
		});
	});

	it("Get", function(){
		return cd.run(function(test){
			test.async();
			console.log("I am Carl or Dave");
			ref.get(function(ack){
				console.log('ack', ack);
				if(ack.put){
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
		require('./util/open').cleanup();
		return servers.run(function(){
			process.exit();
		});
	});
});