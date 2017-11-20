var config = {
	IP: require('ip').address(),
	port: 8080,
	servers: 1,
	browsers: 2,
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

var servers = clients.filter('Node.js');
var server = servers.pluck(1);
var browsers = clients.excluding(servers);
var alice = browsers.pluck(1);
var bob = browsers.excluding(alice).pluck(1);

describe("Make sure the Radix Storage Engine (RSE) works.", function(){
	//this.timeout(5 * 60 * 1000);
	this.timeout(10 * 60 * 1000);

	it("Servers have joined!", function(){
		return servers.atLeast(config.servers);
	});

	it("GUN started!", function(){
		return server.run(function(test){
			var env = test.props;
			test.async();
			if(require('fs').existsSync('radata')){
				console.log("Please delete previous data first!");
				explode;
				return;
			}
			var port = env.config.port + env.i;
			var server = require('http').createServer(function(req, res){
				res.end("I am "+ env.i +"!");
			});
			var Gun = require('gun');
			require('gun/lib/store');
			var gun = Gun({web: server, localStorage: false, thrash: 6000});
			server.listen(port, function(){
				test.done();
			});
		}, {i: 1, config: config}); 
	});

	it(config.browsers +" browser(s) have joined!", function(){
		console.log("PLEASE OPEN http://"+ config.IP +":"+ config.port +" IN "+ config.browsers +" BROWSER(S)!");
		return browsers.atLeast(config.browsers);
	});

	it("Browsers initialized gun!", function(){
		var tests = [], i = 0;
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				localStorage.clear();
				var env = test.props;
				var gun = Gun('http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun');
				window.gun = gun;
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Alice save data", function(){
		return alice.run(function(test){
			console.log("I AM ALICE");
			test.async();
			var n = Gun.time.is();
			window.gun.get('foo').put({hello: "world!"}, function(ack){
				console.log("???", (Gun.time.is() - n)/1000, ack);
				test.done();
			});
		});
	});

	it("Bob read data", function(){
		return bob.run(function(test){
			console.log("I AM BOB");
			test.async();
			var n = Gun.time.is();
			window.gun.get('foo').on(function(data){
				console.log("???", (Gun.time.is() - n)/1000, data);
				test.done();
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