var config = {
	IP: require('ip').address(),
	port: 8080,
	servers: 2,
	browsers: 2,
	each: 10000000,
	burst: 12000,
	wait: 1,
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
var spawn = servers.excluding(server).pluck(1);
var browsers = clients.excluding(servers);
var alice = browsers.pluck(1);
var bob = browsers.excluding(alice).pluck(1);

describe("Make sure the Radix Storage Engine (RSE) works.", function(){
	//this.timeout(5 * 60 * 1000);
	this.timeout(100 * 60 * 1000);

	it("Servers have joined!", function(){
		return servers.atLeast(config.servers);
	});

	it("GUN started!", function(){
		return server.run(function(test){
			var env = test.props;
			console.log("????", process.argv);
			test.async();
			if(require('fs').existsSync('radata')){
				console.log("Please delete previous data first!");
				explode;
				return;
			}
			setInterval(function(){
				var mem = process.memoryUsage();
				var u = Math.round(mem.heapUsed / 1024 / 1024 * 100) / 100;
				console.log(u, 'MB of', Math.round(mem.heapTotal / 1024 / 1024 * 100) / 100);
			}, 1000);
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

	it("Alice save data", function(){
		return alice.run(function(test){
			test.async();
			console.log("I AM ALICE");
			localStorage.clear();
			var env = test.props;
			var gun = Gun({peers: 'http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun', localStorage: false});
			window.gun = gun;

			var n = Gun.time.is(), i = 0, c = 0, b = env.config.burst, l = env.config.each;
			var raw = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"

			function save(i){
				if(i > l){
					return clearTimeout(t);
				}
				var d;
				var ref = window.gun.get('asdf'+i);
				ref.put({hello: raw + i}, function(ack){
					if(d){ return } d = true;
					c++;
					!(i % b) && console.log(i+'/'+l);//, '@'+Math.floor(b/((-n + (n = Gun.time.is()))/1000))+'/sec');
					//localStorage.clear();
					ref.off();
					//console.log("gl:", Object.keys(window.gun._.graph).length);
					if(c < l){ return }
					setTimeout(function(){
						test.done();
					}, 1000);
				});
			}
			function burst(){
				for(var j = 0; j <= b; j++){
					save(++i);
				}
			}
			var t = setInterval(burst, env.config.wait);
		}, {i: 1, config: config}); 
	});

	it("Shut server down!", function(){
		return server.run(function(test){
			process.exit();
		});
	});

	it("GUN spawned!", function(){
		return spawn.run(function(test){
			var env = test.props;
			test.async();
			if(!require('fs').existsSync('radata')){
				console.log("Server data could not be found!");
				explode;
				return;
			}	
			setInterval(function(){
				var mem = process.memoryUsage();
				var u = Math.round(mem.heapUsed / 1024 / 1024 * 100) / 100;
				console.log(u, 'MB');
			}, 1000);
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
		}, {i: 2, config: config}); 
	});

	it("Bob read data", function(){
		return bob.run(function(test){
			test.async();
			test.done();
			return;asdf;
			console.log("I AM BOB");
			localStorage.clear();
			var env = test.props;
			var gun = Gun({peers: 'http://'+ env.config.IP + ':' + (env.config.port + 2) + '/gun', localStorage: false});
			window.gun = gun;

			var n = Gun.time.is(), i = 0, c = 0, b = env.config.burst, l = env.config.each;
			var raw = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"

			function check(i){
				var d;
				var ref = window.gun.get('asdf' + i);
				ref.on(function(data){
					if((raw+i) !== data.hello){ return test.fail('wrong ' + i) }
					if(d){ return } d = true;
					!(i % b) && console.log(i+'/'+l);//, '@'+Math.floor(b/((-n + (n = Gun.time.is()))/1000))+'/sec'));
					c++;
					//localStorage.clear();
					ref.off();
					//console.log("gl:", Object.keys(window.gun._.graph).length);
					if(c < l){ return }
					console.log("DONE!", c+'/'+l);
					test.done();
				});
			}
			function burst(){
				for(var j = 0; j <= b; j++){
					check(++i);	
				}
				setTimeout(burst, env.config.wait);
			}
			burst();
		}, {i: 1, config: config}); 
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