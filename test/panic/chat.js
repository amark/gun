var config = {
	IP: require('ip').address(),
	port: 8765,
	servers: 1,
	browsers: 2, //3,
	each: 100000,
	wait: 1,
	route: {
		'/': __dirname + '/index.html',
		'/gun.js': __dirname + '/../../gun.js',
		'/jquery.js': __dirname + '/../../examples/jquery.js'
	}
}

/*
Assume we have 4 peers in a star topology,

...B...
./.|.\.
A..C..D

And they share a chat room with 10K messages.

A - GET chat -> B (cache miss) -> C
*/

var panic = require('panic-server');
panic.server().on('request', function(req, res){ // Static server
	config.route[req.url] && require('fs').createReadStream(config.route[req.url]).pipe(res);
}).listen(config.port); // Start panic server.

// In order to tell the clients what to do,
// We need a way to reference all of them.
var clients = panic.clients;

// Some of the clients may be NodeJS servers on different machines.
// PANIC manager is a nifty tool that lets us remotely spawn them.
var manager = require('panic-manager')();
manager.start({
    clients: Array(config.servers).fill().map(function(u, i){ // Create a bunch of servers.
			return {
				type: 'node',
				port: config.port + (i + 1) // They'll need unique ports to start their servers on, if we run the test on 1 machine.
			}
    }),
    panic: 'http://' + config.IP + ':' + config.port // Auto-connect to our panic server.
});

// Now lets divide our clients into "servers" and "browsers".
var servers = clients.filter('Node.js');
var browsers = clients.excluding(servers);
var alice = browsers.pluck(1);
var carl = browsers.excluding(alice).pluck(1);
//var dave = browsers.excluding([alice, carl]).pluck(1);

describe("Load test "+ config.browsers +" browser(s) across "+ config.servers +" server(s)!", function(){

	// We'll have to manually launch the browsers,
	// So lets up the timeout so we have time to do that.
	this.timeout(5 * 60 * 1000);

	it("Servers have joined!", function(){
		// Alright, lets wait until enough gun server peers are connected.
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
				try{ require('fs').unlinkSync(env.i+'data.json') }catch(e){}
				var server = require('http').createServer(function(req, res){
					res.end("I am "+ env.i +"!");
				});
				// Launch the server and start gun!
				var Gun = require('gun');
				// Attach the server to gun.
				var gun = Gun({file: env.i+'data', web: server, axe: false, localStorage: false, radisk: false});
				server.listen(env.config.port + env.i, function(){
					// This server peer is now done with the test!
					// It has successfully launched.
					test.done();
				});
				//setInterval(function(){ console.log("CPU turns stacked:", setTimeout.turn.s.length) },1000);
			}, {i: i += 1, config: config})); 
		});
		// NOW, this is very important:
		// Do not proceed to the next test until
		// every single server (in different machines/processes)
		// have ALL successfully launched.
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
				//var gun = Gun('http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun');
				var gun = Gun({localStorage: false, radisk: false, peers: 'http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun'});
				window.gun = gun;
				window.ref = gun.get('chat');
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Carl Create Chats", function(){
		return carl.run(function(test){
			console.log("I AM CARL");
			test.async();
			var rand = String.random || Gun.text.random;
			var i = test.props.each, chat = {}, S = Gun.state();
			while(i--){
				Gun.state.ify(chat, rand(9), S, rand(200), 'chat');
			}
			//window.chat = chat;
			gun._.graph.chat = chat;
			console.log(JSON.stringify(chat,null,2));
			test.done();
		}, config);
	});

	it("Alice Asks for Chat", function(){
		return alice.run(function(test){
			console.log("I AM ALICE");
			test.async();
			var i = 0, t = test.props.each, tmp;
			$('body').append("<div><i></i> / "+t+", seconds to first reply: <span></span>, CPU turns stacked: <u></u> <button onclick='this.innerText = Math.random();'>Can you click me?</button><input id='msg' style='width:100%;'><b></b></div>");
			var $msg = $('#msg'), $i = $('i');
			var V, I, S = +new Date, SS = S, tmp;
			ref.map().once(function(v,k){
				S && console.log('first:', $('span').text(tmp = (+new Date - S)/1000) && tmp) || (S = null);
				if(!v){ no_data }
				V = v; 
				I = ++i;
				//console.log(i, "chat:",k,v);
				if(i === t){
					$('b').text("seconds from start to end: " + ((+new Date - SS)/1000));
					setTimeout(function(){ test.done() },100);
				}
			});
			window.requestAnimationFrame = window.requestAnimationFrame || setTimeout;
			window.requestAnimationFrame(function frame(){
				window.requestAnimationFrame(frame, 16);
				$msg.val(V);
				$i.text(I);
			}, 16);
			setInterval(function(){ $('u').text(setTimeout.turn.s.length) },1000);
		}, config);
	});

	/*it("Carl Recovers Chats", function(){
		return carl.run(function(test){
			console.log("... why not sending ...", window.chat);
			test.async();
			gun.on('in', {'#': 'asdf', put: {chat: chat}});
			//test.done();
		});
	});*/

	after("Everything shut down.", function(){
		// which is to shut down all the browsers.
		browsers.run(function(){
			setTimeout(function(){
				location.reload();
			}, 15 * 1000);
		});
		// And shut down all the servers.
		return servers.run(function(){
			process.exit();
		});
	});
})