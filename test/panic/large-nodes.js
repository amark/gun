var config = {
	IP: require('ip').address(),
	port: 8765,
	servers: 1,
	browsers: 2,
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
var bob = servers.pluck(1);
//var carl = servers.excluding(bob).pluck(1);
var browsers = clients.excluding(servers);
var alice = browsers.pluck(1);
var dave = browsers.excluding(alice).pluck(1);

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
				var gun = Gun({file: env.i+'data', peers: peers, web: server, chunk: 1024 * 10});
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
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				try{ localStorage.clear() }catch(e){}
				try{ indexedDB.deleteDatabase('radata') }catch(e){}
				var env = test.props;
				var gun = Gun('http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun');
				window.ref = gun.get('a');
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Put", function(){
		return alice.run(function(test){
			console.log("I AM ALICE");
			test.async();
			var i = test.props.each || 25000;
			var put = {};
			while(--i){
				put[Gun.text.random(9)] = i;
			}
			var S = +new Date;
			ref.put(put, function(ack){
				console.log("acks:", +new Date - S, ack);
				test.done();
			});

		}, {acks: config.servers});
	});
	return;

	it("Get", function(){
		/*
			Here is the recursive rule for GET, keep replying while hashes mismatch.
			1. Receive a GET message.
			2. If it has a hash, and if you have a thing matching the GET, then see if the hashes are the same, if they are then don't ACK, don't relay, end.
			3. If you would have the thing but do not, then ACK that YOU have nothing.
			4. If you have a thing matching the GET or an ACK for the GET's message, add the hash to the GET message, and ACK with the thing or ideally the remaining difference.
			5. Pick ?3? OTHER peers preferably by priority that they have got the thing, send them the GET, plus all "up" peers.
			6. If no ACKs you are done, end.
			7. If you get ACKs back to the GET with things and different hashes, optionally merge into the thing you have GOT and update the hash.
			8. Go to 4.
		*/
		return dave.run(function(test){
			console.log("I AM DAVE");
			test.async();
			var c = 0, to;
			ref.hear = ref.hear || [];
			var hear = ref._.root.opt.mesh.hear;
			ref._.root.opt.mesh.hear = function(raw, peer){
				var msg = Gun.obj.ify(raw);
				console.log('hear:', msg);
				hear(raw, peer);
				ref.hear.push(msg);

				if(msg.put){ ++c }
			}
			ref.get(function(ack){
				if(!ack.put || ack.put.hello !== 'world'){ return }
				if(c > 1){ too_many_acks }

				clearTimeout(to);
				to = setTimeout(test.done, 1000);
			});
		}, {acks: config.servers});
	});

	it("DAM", function(){
		return alice.run(function(test){
			test.async();
			if(ref.say){ said_too_much }
			if(ref.hear.length > 1){ heard_to_much }
			test.done()
		}, {acks: config.servers});
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