var config = {
	IP: require('ip').address(),
	port: 8765,
	servers: 2,
	browsers: 3,
	each: 100000, //1000000,
	burst: 1,
	wait: 1,
	dir: __dirname,
	chunk: 1024 * 1024 * 10,
	notrad: false,
	route: {
		'/': __dirname + '/index.html',
		'/gun.js': __dirname + '/../../gun.js',
		'/jquery.js': __dirname + '/../../examples/jquery.js'
	}
}
config.gundir = require('path').resolve(config.dir, '../../')+'/';

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
var carl = browsers.excluding(new panic.ClientList([alice, bob])).pluck(1);

describe("Make sure the Radix Storage Engine (RAD) works.", function(){
	//this.timeout(5 * 60 * 1000);
	this.timeout(5 * 60 * 60 * 1000);

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
			console.log('??? ===', require('gun/package.json').version);
			var Gun = require('gun');
			var gun = Gun({web: server, localStorage: env.config.notrad, chunk: env.config.chunk, file: 'radata'});
			server.listen(port, function(){
				test.done();
			});
		}, {i: 1, config: config}); 
	});

	it(config.browsers +" browser(s) have joined!", function(){
		require('./util/open').web(config.browsers, "http://"+ config.IP +":"+ config.port);
		return browsers.atLeast(config.browsers);
	});

	it("Alice save data", function(){
		return alice.run(function(test){
			test.async();
			console.log("I AM ALICE");
			localStorage.clear();
			var env = test.props;
			var gun = Gun({peers: 'http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun', localStorage: false, lack: 1000 * 60 * 60});
			window.gun = gun;

			var n = Gun.time.is(), i = 0, c = 0, b = env.config.burst, l = env.config.each;
			var raw = Gun.text.random(200, 'a');// "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"

			function save(i){
				if(i > l){
					return clearTimeout(t);
				}
				var d;
				var ref = window.gun.get('asdf'+i);
				ref.put({hello: raw + i}, function(ack){
					if(ack.err){
						if(ack.lack){
							console.log("!!!???", i);
							return test.fail("ACK timed out, turn your lack of ack up or thruput down."); 
						}
						return test.fail(ack.err);
					}
					//console.log('ack?', ack.rad);
					if(d){ return } d = true;
					c++;
					!(i % (b * 4)) && console.log(i+'/'+l);//, '@'+Math.floor(b/((-n + (n = Gun.time.is()))/1000))+'/sec');
					//localStorage.clear();
					ref.off();
					//console.log("gl:", Object.keys(window.gun._.graph).length);
					if(c < l){ return }
					console.log("DONE!", c+'/'+l);
					setTimeout(function(){
						test.done();
						setTimeout(function(){
							location = 'http://asdf';
						}, 1500)
					}, 1);
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
			test.async();
			console.log("giving server time to cool down...");
			setTimeout(function(){
				process.exit();
				test.done();
			}, 100);
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
			/*setInterval(function(){
				var mem = process.memoryUsage();
				var u = Math.round(mem.heapUsed / 1024 / 1024 * 100) / 100;
				console.log(u, 'MB');
			}, 1000);*/
			var port = env.config.port + env.i;
			var server = require('http').createServer(function(req, res){
				res.end("I am "+ env.i +"!");
			});
			var Gun = require('gun');
			var gun = Gun({web: server, localStorage: env.config.notrad, chunk: env.config.notrad, file: 'radata', lack: 1000 * 60 * 60});
			server.listen(port, function(){
				test.done();
			});
		}, {i: 2, config: config}); 
	});

	it("Bob read data", function(){
		this.timeout(1000 * 60 * 60 * 5);
		//return alice.run(function(test){
		return bob.run(function(test){
			test.async();
			console.log("I AM BOB");
			localStorage.clear();
			var env = test.props;
			var gun = Gun({peers: 'http://'+ env.config.IP + ':' + (env.config.port + 2) + '/gun', localStorage: false});
			window.gun = gun;

			var n = Gun.time.is(), i = 0, c = 0, b = env.config.burst, l = env.config.each/2;
			var raw = Gun.text.random(200, 'a');// "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
			$('body').append($("<div id='log'></div>")); var $log = $('#log');

			function check(i){
				if(i > l){
					return;
				}
				var d;
				var ref = window.gun.get('asdf' + i);
				ref.on(function(data){
					if((raw+i) !== data.hello){ return test.fail('wrong ' + i) }
					if(d){ return } d = true;
					c++;
					!(i % 1000) && console.log(i+'/'+l);
					!(i % 1000) && $log.prepend('<p>'+i+'/'+l+'</p>');
					//console.log(i+'/'+l);
					ref.off();
					if(c < l){ return }
					console.log("DONE!", c+'/'+l);
					$log.prepend('<p>DONE! '+i+'/'+l+'</p>');
					setTimeout(function(){
						test.done();
						setTimeout(function(){
							location = 'http://asdf';
						}, 1500)
					}, 1);
				});
			}
			function burst(){
				if(i > l){
					return;
				}
				for(var j = 0; j <= b; j++){
					check(++i);	
				}
				setTimeout(burst, env.config.wait);
			}
			burst();
		}, {i: 1, config: config}); 
	});

	it("Carl read data", function(){
		this.timeout(1000 * 60 * 60 * 5);
		//return alice.run(function(test){
		return carl.run(function(test){
			test.async();
			console.log("I AM CARL");
			localStorage.clear();
			var env = test.props;
			var gun = Gun({peers: 'http://'+ env.config.IP + ':' + (env.config.port + 2) + '/gun', localStorage: false});
			window.gun = gun;
			var n = Gun.time.is(), i = env.config.each / 2, c = 0, b = env.config.burst, l = env.config.each;
			var raw = Gun.text.random(200, 'a');// "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
			$('body').append($("<div id='log'></div>")); var $log = $('#log');

			function check(i){
				if(i > l){
					return;
				}
				var d;
				var ref = window.gun.get('asdf' + i);
				ref.on(function(data){
					if((raw+i) !== data.hello){ return test.fail('wrong ' + i) }
					if(d){ return } d = true;
					c++;
					!(i % 1000) && console.log(i+'/'+l);
					!(i % 1000) && $log.prepend('<p>'+i+'/'+l+'</p>');
					//console.log(i+'/'+l);
					ref.off();
					if(c < (l / 2)){ return }
					console.log("DONE!", c+'/'+l);
					$log.prepend('<p>DONE! '+i+'/'+l+'</p>');
					test.done();
				});
			}
			function burst(){
				if(i > l){
					return;
				}
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
		require('./util/open').cleanup();
		return servers.run(function(){
			process.exit();
		});
	});
});