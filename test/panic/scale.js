var config = {
	IP: require('ip').address(),
	port: 8080,
	servers: 1,
	browsers: 2,
	each: 2500,
	burst: 25, // do not go below 1!
	wait: 1,
	route: {
		'/': __dirname + '/index.html',
		'/gun.js': __dirname + '/../../gun.js',
		'/jquery.js': __dirname + '/../../examples/jquery.js',
		'/cryptomodules.js': __dirname + '/../../lib/cryptomodules.js',
		'/sea.js': __dirname + '/../../sea.js'
	}
}

var fs = require('fs');
var server = require('https').createServer({
	key: fs.readFileSync(__dirname+'/../https/server.key'),
	cert: fs.readFileSync(__dirname+'/../https/server.crt'),
	ca: fs.readFileSync(__dirname+'/../https/ca.crt'),
	requestCert: true,
	rejectUnauthorized: false
});

var panic = require('panic-server');
panic.server(server).on('request', function(req, res){
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
    panic: 'https://' + config.IP + ':' + config.port
});

// Now lets divide our clients into "servers" and "browsers".
var servers = clients.filter('Node.js');
var browsers = clients.excluding(servers);

// Sweet! Now we can start the tests.
// PANIC works with Mocha and other testing libraries!
// So it is easy to use PANIC.

describe("Stress test GUN with SEA users causing PANIC!", function(){
	this.timeout(10 * 60 * 1000);
	
	it("Servers have joined!", function(){
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
				try{ require('fs').unlinkSync(env.i+'data') }catch(e){ console.log("!!! WARNING !!!! MUST MANUALLY REMOVE OLD DATA!!!!, e") }
				var purl = 'https://'+env.config.IP+':'+env.config.port;
				require('gun/test/https/test')(env.config.port + env.i, env.i+'data', function(){
					// This server peer is now done with the test!
					// It has successfully launched.
					test.done();
				}, function(file){
					file = file.toString();
					if(0 >= file.indexOf('<script src="/gun.js"></script>')){ return }
					file = file.replace('<script src="/gun.js"></script>',
							"<script src='"+purl+"/panic.js'></script><script>panic.server('"+purl+"')</script><script src='/gun.js'></script><script>localStorage.clear();sessionStorage.clear();</script>");
					return file;
				});
			}, {i: i += 1, config: config})); 
		});
		// NOW, this is very important:
		// Do not proceed to the next test until
		// every single server (in different machines/processes)
		// have ALL successfully launched.
		return Promise.all(tests);
	});

	it(config.browsers +" browser(s) have joined!", function(){
		console.log("PLEASE OPEN https://"+ config.IP +":"+ (config.port+1) +"/contact/index.html IN "+ config.browsers +" BROWSER(S)!");
		return browsers.atLeast(config.browsers);
	});

	it("Use UI to create user.", function(){
		var tests = [], ids = {}, i = 0;
		browsers.each(function(client, id){
			ids[id] = 1;
		});
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				var env = test.props;
				test.async();
				localStorage.clear();sessionStorage.clear();
				$('#sign').find('input').first().val(env.id);
				setTimeout(function(){
					$('#sign').find('input').last().val('pass'+env.id+'phrase');
				},750 * 1);
				setTimeout(function(){
					$('#sign').find('button').last().trigger('click');
				},750 * 2);
				setTimeout(function(){
					c.tell("Wait until we are logged in...");
					test.done();
				},750 * 3);
			}, {i: i += 1, id: id, ids: ids, config: config}));  
		});
		return Promise.all(tests);
	});

	it("Load user UI once logged in.", function(){
		var tests = [], ids = {}, i = 0;
		browsers.each(function(client, id){
			ids[id] = 1;
		});
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				var env = test.props;
				test.async();
				setTimeout(function waitlogin(){
					console.log(user._.pub);
					if(!user._.pub){ return setTimeout(waitlogin, 500) }
					test.done();
				}, 750);
			}, {i: i += 1, id: id, ids: ids, config: config}));  
		});
		return Promise.all(tests);
	});

	it("Update user's name!", function(){
		var tests = [], ids = {}, i = 0;
		browsers.each(function(client, id){
			ids[id] = 1;
		});
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				var env = test.props;
				test.async();
				setTimeout(function(){
					location.hash = 'person/' + user._.pub;
					var $name = $('#person').find('h2').first(), t = 250;
					setTimeout(function(){
						$name.text(env.id.slice(0,1));
						$name.trigger('keyup');
					},t * 1);
					setTimeout(function(){
						$name.text(env.id.slice(0,2));
						$name.trigger('keyup');
					},t * 2);
					setTimeout(function(){
						$name.text(env.id.slice(0,3));
						$name.trigger('keyup');
					},t * 3);
					setTimeout(function(){
						$name.text(env.id.slice(0,4));
						$name.trigger('keyup');
					},t * 4);
					setTimeout(function(){
						$name.text(env.id.slice(0,5));
						$name.trigger('keyup');
					},t * 5);
					setTimeout(function(){
						location.hash = 'people';
						test.done();
					}, 2000);
				}, 3000 * env.i);
			}, {i: i += 1, id: id, ids: ids, config: config}));  
		});
		return Promise.all(tests);
	});

	it("Reset", function(){
		var tests = [], ids = {}, i = 0;
		browsers.each(function(client, id){
			ids[id] = 1;
		});
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				localStorage.clear();sessionStorage.clear();
				setTimeout(function(){
					location.hash = '#sign';
					location.reload();
				}, 9000);
			}, {i: i += 1, id: id, ids: ids, config: config}));  
		});
		return Promise.all(tests);
	});

	/* MODEL TEST
	it("Browsers initialized gun!", function(){
		var tests = [], ids = {}, i = 0;
		browsers.each(function(client, id){
			ids[id] = 1;
		});
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				// code here
			}, {i: i += 1, id: id, ids: ids, config: config}));  
		});
		return Promise.all(tests);
	});
	*/

	it("All finished!", function(done){
		console.log("Done! Cleaning things up...");
		setTimeout(function(){
			done();
		}, 2000);
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