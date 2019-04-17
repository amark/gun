var config = {
	IP: require('ip').address(),
	port: 8765,
	servers: 2,
	dir: __dirname
}

var panic = require('panic-server');
panic.server().listen(config.port);

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
var alice = servers.pluck(1);
var bob = servers.excluding(alice).pluck(1);

describe("Server to server sync", function(){
	this.timeout(5000);

	it("Servers have joined!", function(){
		return servers.atLeast(config.servers);
	});

	it("Start GUN Bob server.", function(){
		return bob.run(function(test){
			test.async();
						
			var express = require('express');
			var bodyParser = require('body-parser');
			var Gun = require('gun');

			var app = express();

			app.use(Gun.serve)
			app.use(bodyParser.json())

			app.post('/foo', function(req, res) {
			    gun.get('bar').put(req.body)
			    res.sendStatus(200)
			});

			var server = app.listen(8082, function(){ test.done() })

			var gun = Gun({peers: 'http://localhost:8081/gun', web: server})

			gun.get('bar').on(function(data, key){
			    console.log('bob', data, key)
			})

		}, {i: 1, config: config}); 
	});

	it("Start GUN Alice server.", function(){
		return alice.run(function(test){
			test.async();
			
			var express = require('express');
			var bodyParser = require('body-parser');
			var Gun = require('gun');


			var app = express()

			app.use(Gun.serve)

			var server = app.listen(8081, function(){ test.done() })

			var gun = Gun({peers: 'http://localhost:8082/gun', web: server})

			gun.get('bar').on(function(data, key){
			    console.log('alice', data, key)
			    global.DATA = data;
			})

		}, {i: 1, config: config}); 
	});

	it("Curl Bob!", function(){
		var reply = require('child_process').execSync("curl --request POST "
		+	"--url http://localhost:8082/foo "
		+	"--header 'content-type: application/json' "
		+ "--data '"+JSON.stringify({bar: "FOOBAR"})+"'");
		console.log("REPLY:", reply.toString());
	  if(reply.toString().indexOf("err") >= 0){
	  	console.log(reply.toString());
			throw new Error("Server did not like the request!");
		}
		return;
	});

	it("Did Alice get it?", function(){
		return alice.run(function(test){
			test.async();
						
			setTimeout(function(){
				console.log("does Alice have it?", global.DATA);
				if(!global.DATA){
					console.log("no data!");
					return;
				}
				test.done();
			}, 1000);

		}, {i: 1, config: config}); 
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