var config = {
	IP: require('ip').address(),
	port: 8765,
	servers: 1,
	browsers: 1,
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
var again = {};

describe("No Empty Object on .Once", function(){
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
			try{ require('gun/lib/fsrm')(env.i+'data') }catch(e){}
			try{ require('gun/lib/fsrm')((env.i+1)+'data') }catch(e){}
			var port = env.config.port + env.i;
			var server = require('http').createServer(function(req, res){
				res.end("I am "+ env.i +"!");
			});
			var Gun = require('gun');
			var gun = Gun({file: env.i+'data', web: server});
			server.listen(port, function(){});
			setTimeout(function(){

				gun.get('survey').get('231119').get('x').put({z:1})
				gun.get('survey').get('231119').get('y').put({z:1})
				gun.get('survey').get('231119').once(function(data){
					console.log(data);
					if(!data.x || !data.y){
						no_data_explode;
					}
					test.done();
				});

			},500);
		}, {i: 1, config: config}); 
	});

	it(config.browsers +" browser(s) have joined!", function(){
		require('./util/open').web(config.browsers, "http://"+ config.IP +":"+ config.port);
		return browsers.atLeast(config.browsers);
	});

	it("Browsers initialized gun!", function(){
		var tests = [], i = 0;
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				localStorage.clear();
				var env = test.props;
				var gun = Gun('http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun');
				window.ref = gun.get('survey').get('231119');
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Write initial value", function(){
		return alice.run(function(test){
			test.async();
			console.log("I AM ALICE");
			ref.get('z').put({z:1});
			setTimeout(function(){
				ref.once(function(data){
					console.log("DOES X Y & Z EXIST?", data);
					if(!data.x || !data.y || !data.z){
						test.fail("overwrote old object!");
						return;
					}
					test.done();
				})
			}, 500);
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