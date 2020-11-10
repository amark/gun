var config = {
	IP: require('ip').address(),
	port: 8765,
	servers: 1,
	browsers: 2,
	route: {
		'/': __dirname + '/index.html',
		'/gun.js': __dirname + '/../../gun.js',
		'/jquery.js': __dirname + '/../../examples/jquery.js',
		'/sea.js': __dirname + '/../../sea.js'
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

describe("Private Message Threading", function(){
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
			server.listen(port, function(){
				test.done();
			});
		}, {i: 1, config: config}); 
	});

	it(config.browsers +" browser(s) have joined!", function(){
		require('./util/open').web(config.browsers, "http://"+ config.IP +":"+ config.port);
		return browsers.atLeast(config.browsers);
	});

	it("Browsers load SEA!", function(){
		var tests = [], i = 0;
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				test.async();
				//console.log("load?");
				function load(src, cb){
					var script = document.createElement('script');
					script.onload = cb; script.src = src;
					document.head.appendChild(script);
				}
				load('sea.js', function(){
					test.done();
				});
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Browsers initiate user!", function(){
		var tests = [], i = 0;
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				test.async();
				localStorage.clear();
				var env = test.props;
				console.log("I AM!!!!", env.i);
				var gun = window.gun = Gun('http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun');
				var alice = window.alice = {
				  "pub": "iYIONCL4rq6-SqmXHjDBoWBJIuhReIHy7MtzBp0zEiw.OXqW4c-FnmcbG2K9IM4avl8WyULHvZxQIyvgTH25PSo",
				  "priv": "5xIKfcjHSrPPr9u80YVJjDITMsif-MHYQyKY7xH-474",
				  "epub": "4Goj7wufxhuyc7IdIMInEOqXgNHaZi8mCWgDGrQIikI.2oTovqZJb8Ez-GB4VEIVU4ixWlshPwt-99hcZk9i63E",
				  "epriv": "6ut8nfxpGSBbyBoZso7QU7jyhiYGRgZZ4LPAtJvWQsQ"
				};
				var bob = window.bob = {
				  "pub": "xDAF7JiabamDhUiUFuh4dI8cjRM-yIZwYInzoKoOLlQ.qyBHHKvFhNs0BesfWmpkkg-AyBslWgQ5NtIjZjtzpRM",
				  "priv": "skNy4i4FGFZudqxgkPYMjnggylMu_fZnl-vLref1Hl0",
				  "epub": "ZiCAyWdAixUxYr0I4KRI2raWDXwj0dQltMvdR0_Eld8.Vjz_pGf2LE6i1Qi-8je9U42mnjoPyB50S2dmXZpnC_E",
				  "epriv": "JdGqj9E_VzfjgLdi0fpj1VjeP5tKPYfstpd1n9DQklg"
				}
				var me = window.me = (env.i-1)? bob : alice; // keep it DRY since both need to login.
				var them = window.them = (env.i-1)? alice : bob;
				window.count = 0;
				window.check = {};
				window.thread = function thread(node, my, their){
					node.on(msgs => {
						//console.log("THREAD!!!", msgs);
						for(var time in msgs){
							// don't load ones already loaded
							if(thread[time]){ continue } thread[time] = 1;
							//console.log("get...", time, msgs);
							node.get(time).on(async function(chat){
								if(!chat.msg){ return }
								var msg = await SEA.decrypt(chat.msg, sec);
								console.log('chat:::::::::::::::::', msg);
								window.check[chat.pub + chat.count] = msg;
								$('<li>').text(msg).appendTo('#chats');
								//gun.get('pchat').get(my).get(their).get('new').get(time).put(null);
							})
						}
					})
				}
				var to, fro, sec;
				gun.user().auth(me, null, function(){
					console.log("logged in");
					start();
					setTimeout(function(){
						//return;
						test.done();
					}, 2000);
				});
				async function start(){
					sec = window.sec = await SEA.secret(me.epub, them);
					to = window.to = gun.user().get('pchat').get(them.pub);
					fro = window.fro = gun.user(them.pub).get('pchat').get(me.pub);
					// TODO: THIS SHOULD DO THE THREADING FOR US LOL!! We have to manually do it.
					thread(to, me.pub, them.pub);
					thread(fro, me.pub, them.pub);
				}
				window.send = async function send(text, my, their, me, cb){
					var time = +new Date;
					var enc = await SEA.encrypt(text, sec);
					var msg = {
						msg: enc,
						pub: my.pub,
						time: time,
						count: ++window.count,
						only_for_test: text
					}
					console.log('send', msg);
					me.get(time).put(msg, cb);
				}
				console.log("*****", gun._.opt.pid);
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Alice send PM", function(){
		return alice.run(function(test){
			test.async();
			console.log("I AM ALICE");
			send("I am Alice!", window.alice, window.bob, window.to, function(ack){
				console.log("Alice saved!", ack);
				setTimeout(function(){
					test.done();
				}, 2000);
			});
		});
	});

	it("Bob send PM", function(){
		return bob.run(function(test){
			test.async();
			console.log("I AM BOB");
			send("I am Bob!", window.bob, window.alice, window.to, function(ack){
				console.log("Bob saved!", ack);
				setTimeout(function(){
					test.done();
				}, 2000);
			});
		})
	});
	
	it("Wait...", function(done){
		setTimeout(done, 2000);
	});

	it("Alice & Bob both got each other PM", function(){
		var tests = [], i = 0;
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				if(Object.keys(window.check).length !== 2){ more_messages }
				if(!window.check[window.me.pub + 1]){ no_me_message }
				if(!window.check[window.them.pub + 1]){ no_me_message }
				test.done();
			}, {i: i += 1, config: config})); 
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
		require('./util/open').cleanup();
		return servers.run(function(){
			process.exit();
		});
	});
});