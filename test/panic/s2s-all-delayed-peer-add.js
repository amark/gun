var config = {
	IP: require('ip').address(),
	port: 8080,
	servers: 2,
	browsers: 0,
	dir: __dirname,
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

//var servers = clients.filter('Node.js');
var servers = clients;
var alice = servers.pluck(1);
var bob = clients.excluding(alice).pluck(1);

describe("Sync all data from one server to another one added as peer after initialisation!", function(){
	//this.timeout(5 * 60 * 1000);
	this.timeout(10 * 60 * 1000);

	it("Servers have joined!", function(){
		return servers.atLeast(config.servers);
	});

	it("Alice GUN has spawned!", function(){
		return alice.run(function(test){
			var env = test.props;
			test.async();
			global.ALICE = true;
			try{ require('fs').unlinkSync(env.i+'alldata') }catch(e){}
			var server = require('http').createServer(function(req, res){
				res.end("I am "+ env.i +"!");
			});
			var port = env.config.port + env.i;
			var Gun = require(env.config.dir + '/../../');

			var peers = [], i = env.config.servers;
			var gun = Gun({file: env.i+'alldata', peers: peers, web: server});

			gun.get('a1').put({a:1});
			gun.get('b2').put({b:2});
			gun.get('c3').put({c:3});
			gun.get('d4').put({d:4});

			server.listen(port, function(){
				setTimeout(function(){
					test.done();
				},1000);
			});
		}, {i: 1, config: config});
	});

	it("Bob GUN has spawned!", function(){
		return bob.run(function(test){
			var env = test.props;
			test.async();
			try{ require('fs').unlinkSync(env.i+'alldata') }catch(e){}
			var server = require('http').createServer(function(req, res){
				res.end("I am "+ env.i +"!");
			});
			var port = env.config.port + env.i;
			var Gun = require(env.config.dir + '/../../');

			// Initialise gun with no peers
			var peers = [];
			var gun = Gun({file: env.i+'alldata', peers: peers, web: server});

			server.listen(port);
			console.log("IGNORE 'invalid' WARNINGS!");
			gun.on('out', {'#': 'loadthemall', get: {'#': {'*': ''}}});

			// Add the other server as a peer
			var i = env.config.servers;
			while(i--){
				var tmp = (env.config.port + (i + 1));
				if(port != tmp){ // ignore ourselves
					peers.push('http://'+ env.config.IP + ':' + tmp + '/gun');
				}
			}
			console.log(port, " connect to ", peers);
			gun.opt({peers: peers});

			setTimeout(function(){
				test.done();
			}, 2000);
		}, {i: 2, config: config});
	});


	it("Bob checked his file!", function(){
		return bob.run(function(test){
			var env = test.props;
			test.async();
			var raw = require('fs').readFileSync(env.i+'alldata');
			var json = JSON.parse(raw);
			var graph = json.graph;
			console.log("Bob's graph on disk:", json);

			if(!graph.a1 || graph.a1.a !== 1){
				throw "a1 was not synced!";
			}
			if(!graph.b2 || graph.b2.b !== 2){
				throw "b2 was not synced!";
			}
			if(!graph.c3 || graph.c3.c !== 3){
				throw "c3 was not synced!";
			}
			if(!graph.d4 || graph.d4.d !== 4){
				throw "b4 was not synced!";
			}

			test.done();
		}, {i: 2, config: config});
	});

	it("All finished!", function(done){
		console.log("Done! Cleaning things up...");
		setTimeout(function(){
			done();
		},1000);
	});

	after("Everything shut down.", function(){
		return servers.run(function(){
			process.exit();
		});
	});
});
