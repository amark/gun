var config = {
	IP: require('ip').address(),
	port: 8765,
	servers: 1,
	browsers: 2,
	each: 250,
	burst: 1, // do not go below 1!
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
				//setInterval(function(){ var u, t; u = process.memoryUsage().heapUsed; t = require('os').totalmem(); console.log((u/t).toFixed(2)) }, 1000)
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
		console.log("PLEASE OPEN https://"+ config.IP +":"+ (config.port) +" IN "+ config.browsers +" BROWSER(S)!");
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

	it("Browsers initialized gun!", function(){
		var tests = [], ids = {}, i = 0;
		// Let us create a list of all the browsers IDs connected.
		// This will later let each browser check against every other browser.
		browsers.each(function(client, id){
			ids[id] = 1;
		});
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				localStorage.clear();
				var env = window.env = test.props;
				var peers = [], i = env.config.servers;
				while(i--){
					// For the total number of servers listed in the configuration
					// Add their URL into an array.
					peers.push('https://'+ env.config.IP + ':' + (env.config.port + (i + 1)) + '/gun');
				}
				var gun = window.gun = Gun(peers);
				var user = window.user = gun.user();
				var go = window.go = {num: 0, total: 0, users: {}, pub: {}};
				window.ID = env.id;
				go.check = Gun.obj.map(env.ids, function(v,id,t){
					// for each browser ID
					// they will be saving X number of messages each.
					go.users[id] = true; // set an outstanding flag to check against.
					var i = env.config.each;
					while(i--){
						// So add a deterministic key we can check against.
						t(id + (i + 1), 1);
						// And count up the total number of messages we expect for all.
						go.total += 1;
					}
				});

				console.log(peers, go);
			}, {i: i += 1, id: id, ids: ids, config: config}));  
		});
		return Promise.all(tests);
	});

	it("All users created!", function(){
		var tests = [], ids = {}, i = 0;
		browsers.each(function(client, id){
			ids[id] = 1;
		});
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				test.async();

				gun.on('secure', function(at){
					/* enforce some rules about shared app level data */
					if(!at.put || !at.put.users){ return }
					var no;
					Gun.node.is(at.put.users, function(val, key){
						Gun.SEA.read(val, false, function(val){
							if('alias/'+key === Gun.val.link.is(val)){ return }
							no = true;
						})
						if(no){ return no }
					});
					if(no){ return }
					this.to.next(at);
				});

				var unsafepassword = 'asdf'+ID;
				console.log("sign in and up:", ID);
				window.user.create(ID, unsafepassword, function(ack){
					if(ack.err || !ack.pub){ return }
					window.pub = ack.pub;
					gun.get('users').get(ID).put(gun.get('alias/'+ID));
					console.log("signed up", ack.pub);
					console.debug.j = 1;
					window.user.auth(ID, unsafepassword, function(ack){
						console.debug.j = 0;
						console.log("signed in", ack);
						if(ack.err || !ack.pub){ return }
						test.done();
					});
				});

			}, {i: i += 1, id: id, ids: ids, config: config}));  
		});
		return Promise.all(tests);
	});

	it("Start reading and sending messages!", function(){
		var tests = [], ids = {}, i = 0;
		browsers.each(function(client, id){
			ids[id] = 1;
		});
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				test.async();

				gun.get('users').map().map()
					.get('who').get('said').map().on(function(msg){
						check(msg);
				});

				var said = user.get('who').get('said');

				function run(i){

					var what = i +"|||"+ "Hello world!" +"|||"+ pub +"|||"+ ID;
					said.set({
						what: what
					});/*, function(ack){
						if(ack.err){ return }
						test.done();
					});*/

				}
				/* TODO: sometimes sign in hangs */
				console.log("<<<<< START >>>>>");
				var i = 0, to = setInterval(function frame(a, b){
					if(!b && 2 <= (b = env.config.burst)){
						while(--b){
							frame(i, true);
						}
						return;
					}
					if(env.config.each <= i){
						clearTimeout(to);
						return;
					}
					run(i += 1);
				}, env.config.wait || 1);


				var col = $("<div>").css({width: 250, position: 'relative', float: 'left', border: 'solid 1px black'}), cols = {};
				var report = $("<div>").css({position: 'fixed', top: 0, right: 0, background: 'white', padding: 10}).text(" / "+ go.total +" Verified").prependTo('body');
				var reportc = $('<span>').text(0).prependTo(report);
				var last = $("<div>").text("Processing: ").css({border: "solid 1px black"}).appendTo("body");
				last = $("<span>").text(" ").appendTo(last);

				function check(data){
					data = data.what.split("|||");
					var msg = {num: data[0], what: data[0] +' '+ data[1], who: data[2], id: data[3]};
					var who;
					if(!go.pub[msg.who]){
						go.pub[msg.who] = msg.id;
						go.users[msg.id] = false;
						//who = cols[msg.id] = col.clone(true).appendTo('body');
						//who.prepend("<input value='"+ msg.who +"'>");
						//who.prepend("<input value='"+ msg.id +"'>");
					}
					if(!go.check[msg.id + msg.num]){
						return;
					}
					go.check[msg.id + msg.num] = false;
					clearTimeout(end.to); end.to = setTimeout(end, 9);
					reportc.text(++go.num);
					last.text(msg.what);
					//who = cols[msg.id];
					//$("<div>").css({border: 'solid 1px blue'}).text(msg.what).appendTo(who);
				}

				function end(){
					var wait = Gun.obj.map(go.users, function(v){ if(v){ return true }});
					if(wait){ return }
					var more = Gun.obj.map(go.check, function(v){ if(v){ return true }});
					if(more){ return }
					test.done();
				}

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
		require('./util/open').cleanup();
		return servers.run(function(){
			process.exit();
		});
	});
});