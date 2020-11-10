/*
This is the first in a series of basic networking correctness tests.
Each test itself might be dumb and simple, but built up together,
they prove desired end goals for behavior at scale.

Alice: [Bob]
Bob: [Carl]
Carl: [Bob]
Dave: [Carl]

Ed: [?]

100,000 browsers
1 relay peer

50,000 browsers on Bob
50,000 browsers on Carl

//var gun = Gun(['https://gunjs.herokuapp.com/gun', 'https://guntest.herokuapp.com/gun']);

pretend we have 3TB of data.
300K browsers.

suppose we have 3 nodejs peers that are shards

var superpeer1 = Gun(AXE({shard: 'a~m'}));
var superpeer2 = Gun(AXE({shard: 'n~r'}));
var superpeer3 = Gun(AXE({shard: 's~z'}));

300K browsers join a popular app and they have to do this
via the browser, so they all go to superpeer1.com
then 2/3 of them should get sharded to superpeer2 & superpeer3

first all connect to:
..s1-----s2--s3
./\.\.
b1.b2.b3

then be load balanced to:
..s1--s2--s3
./....|....\.
b1....b2....b3
*/

var config = {
	IP: require('ip').address(),
	port: 8765,
	servers: 3,
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
var s1 = servers.pluck(1);
var s2 = servers.excluding(s1).pluck(1);
var s3 = servers.excluding([s1,s2]).pluck(1);

var browsers = clients.excluding(servers);
var b1 = browsers.pluck(1);
var b2 = servers.excluding(b1).pluck(1);
var b3 = servers.excluding([b1,b2]).pluck(1);


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
					//if(port != tmp){ // ignore ourselves
						peers.push('http://'+ env.config.IP + ':' + tmp + '/gun');
					//}
				}
				console.log(port, " connect to ", peers);
				var gun = Gun({file: env.i+'data', peers: peers, web: server, mob: 4});
				global.gun = gun;
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
		browsers.each(function(browser, id){
			tests.push(browser.run(function(test){
				try{ localStorage.clear() }catch(e){}
				try{ indexedDB.deleteDatabase('radata') }catch(e){}
				var env = test.props;
				var gun = Gun('http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun');

				var mesh = gun.back('opt.mesh');
				mesh.hear['mob'] = function(msg, peer){
					// TODO: NOTE, code AXE DHT to aggressively drop new peers AFTER superpeer sends this rebalance/disconnect message that contains some other superpeers.
					if(!msg.peers){ return }
					var one = msg.peers[Math.floor(Math.random()*msg.peers.length)];
					console.log("CONNECT TO THIS PEER:", one);
					gun.opt(one);
					mesh.bye(peer);

					if(test.c){ return }
					test.c = 1;
					test.done();
				}

				console.log("connected to who superpeer(s)?", gun._.opt.peers);
				window.gun = gun;
				window.ref = gun.get('test');
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Got Load Balanced to Different Peer", function(){
		var tests = [], i = 0;
		browsers.each(function(browser, id){
			tests.push(browser.run(function(test){

				console.log("...", gun._.opt.peers);

			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("All finished!", function(done){
		console.log("Done! Cleaning things up...");
		setTimeout(function(){
			done();
		//},1000);
		},1000 * 60);
	});

	after("Everything shut down.", function(){
		require('./util/open').cleanup();
		return servers.run(function(){
			process.exit();
		});
	});
});