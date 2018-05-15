var config = {
	IP: require('ip').address(),
	port: 8080,
	servers: 2,
	browsers: 2,
	each: 12000,
	burst: 1000,
	wait: 1,
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
var browsers = clients.excluding(servers);

describe("Load test "+ config.browsers +" browser(s) across "+ config.servers +" server(s)!", function(){
	//this.timeout(5 * 60 * 1000);
	this.timeout(10 * 60 * 1000);

	it("Servers have joined!", function(){
		return servers.atLeast(config.servers);
	});

	it("GUN has spawned!", function(){
		var tests = [], i = 0;
		servers.each(function(client){
			tests.push(client.run(function(test){
				var env = test.props;
				test.async();
				try{ require('fs').unlinkSync(env.i+'data') }catch(e){}
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
				var gun = Gun({file: env.i+'data', peers: peers, web: server, localStorage: false});
				server.listen(port, function(){
					test.done();
				});
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it(config.browsers +" browser(s) have joined!", function(){
		console.log("PLEASE OPEN http://"+ config.IP +":"+ config.port +" IN "+ config.browsers +" BROWSER(S)!");
		browsers.atLeast(1).then(function(){
			browsers.run(function(test){
				var env = test.props;
				$('body').prepend("<button onclick='allopen()'>Open All Browsers</button>");
				window.allopen = function(i){
					if(env.config.browsers <= i){ return }
					i = i || 1;
					var win = window.open(location, '_blank');
					win.focus();
					setTimeout(function(){allopen(i+1)},0);
				}
			}, {config: config});
		});
		return browsers.atLeast(config.browsers);
	});

	it("Data was saved and synced across all browsers!", function(){
		var tests = [], ids = {}, i = 0;
		browsers.each(function(client, id){
			ids[id] = 1;
		});
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				Gun.state.drift = Math.random() * 10000;	
				localStorage.clear();
				var env = test.props;
				test.async();
				var peers = [], i = env.i;
				//while(i--){
					peers.push('http://'+ env.config.IP + ':' + (env.config.port + (i)) + '/gun');
				//}
				console.log("Connect to", peers);
				var gun = Gun(peers);
				var num = 0, total = 0, check = Gun.obj.map(env.ids, function(v,id,t){
					var i = env.config.each;
					while(i--){
						t(id + (i + 1), 1);
						total += 1;
					}
				});
				var report = $("<div>").css({position: 'fixed', top: 0, right: 0, background: 'white', padding: 10}).text(num +" / "+ total +" Verified").prependTo('body');
				var wait;
				gun.get('test').map().on(function(data, key){
					//$(log).text(key +": "+ data);
					if(("Hello world, "+key+"!") === data){
						if(check[key]){ num += 1 }
						check[key] = 0;
						report.text(num +" / "+ total +" Verified");
					}
					if(wait){ return }
					wait = setTimeout(function(){
						wait = false;
						if(Gun.obj.map(check, function(still){
							if(still){ return true }
						})){ return }
						console.log("SUCCESS");
						test.done();
					},10);
				});
				setTimeout(function(){
					console.log("<<<<< START >>>>>");
					var i = 0, burst = false, to = setInterval(function go(){
						if(!burst){
							burst = env.config.burst;
							while(--burst){
								go();
							}
							burst = false;
							return;
						}
						if(env.config.each <= i){
							clearTimeout(to);
							return;
						}
						i += 1;
						var p = env.id + i;
						gun.get('test').get(p).put('Hello world, '+ p +'!');
					}, env.config.wait);
				},500);
			}, {i: i += 1, id: id, ids: ids, config: config})); 
		});
		return Promise.all(tests);
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