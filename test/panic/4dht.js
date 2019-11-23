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
					if(port != tmp){ // ignore ourselves
						peers.push('http://'+ env.config.IP + ':' + tmp + '/gun');
					}
				}
				console.log(port, " connect to ", peers);
				var gun = Gun({file: env.i+'data', peers: peers, web: server});
				global.gun = gun;
				server.listen(port, function(){
					test.done();
				});
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it(config.browsers +" browser(s) have joined!", function(){
		console.log("PLEASE OPEN http://"+ config.IP +":"+ config.port +" IN "+ config.browsers +" BROWSER(S)!");
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
				console.log("connected to who superpeer(s)?", gun._.opt.peers);
				window.gun = gun;
				window.ref = gun.get('test');
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	return;
	return;
	return;
	return;
	return;
	return;
	return;
	return;

	it("Alice", function(){
		return alice.run(function(test){
			test.async();
			console.log("I AM ALICE");
			console.log(gun._.opt.peers);
			gun.get('not-dave').put({hello: 'world'}, function(ack){
				if(ack.err){
					alice_start_did_not_save;
				}
				test.done();
			});
		});
	});

	it("Dave", function(){
		return dave.run(function(test){
			console.log("I AM DAVE");
			console.log(gun._.opt.peers);
		});
	});

	it("Carl", function(){
		return carl.run(function(test){
			console.log("I AM CARL");
			console.log(global.gun);
		});
	});

	it("All finished!", function(done){
		console.log("Done! Cleaning things up...");
		setTimeout(function(){
			done();
		//},1000);
		},1000 * 60);
	});

	after("Everything shut down.", function(){
		browsers.run(function(){
			//location.reload();
			//setTimeout(function(){
			//}, 15 * 1000);
		});
		return servers.run(function(){
			process.exit();
		});
	});
});