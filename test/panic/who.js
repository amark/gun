var config = {
	IP: require('ip').address(),
	port: 8765,
	servers: 1,
	browsers: 2,
	route: {
		'/': __dirname + '/index.html',
		'/gun.js': __dirname + '/../../gun.js',
		'/jquery.js': __dirname + '/../../examples/jquery.js',
		'/sea.js': __dirname + '/../../sea.js'
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
var spawn = servers.excluding(server).pluck(1);
var browsers = clients.excluding(servers);
var alice = browsers.pluck(1);
var bob = browsers.excluding(alice).pluck(1);
var again = {};

describe("Make sure SEA syncs correctly", function(){
	//this.timeout(5 * 60 * 1000);
	this.timeout(10 * 60 * 1000);

	it("Servers have joined!", function(){
		return servers.atLeast(config.servers);
	});

	it("GUN started!", function(){
		return server.run(function(test){
			var env = test.props;
			test.async();
			try{ require('fs').unlinkSync(env.i+'data') }catch(e){}
			try{ require('fs').unlinkSync((env.i+1)+'data') }catch(e){}
			var port = env.config.port + env.i;
			var server = require('http').createServer(function(req, res){
				res.end("I am "+ env.i +"!");
			});
			var Gun = require('gun');
			require('gun/sea');
			var gun = Gun({file: env.i+'data', web: server});
			server.listen(port, function(){
				test.done();
			});
		}, {i: 1, config: config}); 
	});

	it(config.browsers +" browser(s) have joined!", function(){
		require('./util/open').web(config.browsers, "http://"+ config.IP +":"+ config.port);
		return browsers.atLeast(config.browsers);
	});

	it("Browsers load SEA!", function(){
		var tests = [], i = 0;
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				test.async();
				//console.log("load?");
				function load(src, cb){
					var script = document.createElement('script');
					script.onload = cb; script.src = src;
					document.head.appendChild(script);
				}
				load('sea.js', function(){
					test.done();
				});
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Browsers initialized gun!", function(){
		var tests = [], i = 0;
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				localStorage.clear();
				var env = test.props;
				var gun = Gun('http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun');
				window.gun = gun;
				var user = window.user = gun.user();
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Create Alice", function(){
		return alice.run(function(test){
			console.log("I AM ALICE");
			test.async();
			window.user.create('alice', 'xyzabcmnopq', function(ack){
				if(ack.err || !ack.pub){ return }
				window.user.auth('alice', 'xyzabcmnopq', function(ack){
					if(ack.err || !ack.pub){ return }
					user.get('who').get('said').set({
						what: "Hello world!"
					}, function(ack){
						if(ack.err){ return }
						test.done();
					});
				});
			});
		});
	});

	it("Create Bob", function(){
		return bob.run(function(test){
			test.async();
			window.user.create('bob', 'zyxcbaqponm', function(ack){
				if(ack.err || !ack.pub){ return }
				window.user.auth('bob', 'zyxcbaqponm', function(ack){
					if(ack.err || !ack.pub){ return }
					test.done();
				});
			});
		});
	});

	it("Have Bob find Alice", function(){
		return bob.run(function(test){
			test.async();

			window.gun.get('~@alice').map().once(function(data){
				window.ref = gun.get('~'+data.pub);
				test.done();
			});
		});
	});

	it("Have Bob listen", function(){
		return bob.run(function(test){
			test.async();

			window.count = [];
			ref.get('who').get('said').map().once(function(data){
				console.log("read...", data);
				window.count.push(data);
				if(window.count.length - 1){ return }
				test.done();
			});
		});
	});

	it("Alice reloading.", function(){
		return alice.run(function(test){
			location.reload();
		});
	});

	it("Got Alice.", function(){
		again.alice = browsers.excluding(new panic.ClientList([alice, bob])).pluck(1);
		return again.alice.atLeast(1);
	});

	it("Alice reloaded.", function(){
		return again.alice.run(function(test){
			test.async();
			//console.log("load?");
			function load(src, cb){
				var script = document.createElement('script');
				script.onload = cb; script.src = src;
				document.head.appendChild(script);
			}
			load('sea.js', function(){
				test.done();
			});
		}, {i: 1, config: config});
	});

	it("Alice loaded.", function(){
		return again.alice.run(function(test){
			test.async();

			var env = test.props;
			var gun = Gun('http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun');
			window.gun = gun;
			var user = window.user = gun.user();
			user.auth('alice', 'xyzabcmnopq', function(ack){
				if(ack.err || !ack.pub){ return }
				test.done();
			});
		}, {i: 1, config: config})
	});

	it("Alice write.", function(){
		return again.alice.run(function(test){
			test.async();
			console.log("write...");
			user.get('who').get('said').set({
				what: "AAA"
			}, function(ack){
				if(ack.err){ return }
				test.done();
			});
		});
	});

	it("Have Bob listen", function(){
		return bob.run(function(test){
			test.async();
			console.log(window.count);
			setTimeout(function(){
				if('AAA' === window.count[1].what){
					test.done();
				}
			}, 1200);
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