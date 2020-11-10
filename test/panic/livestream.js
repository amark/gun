/*
This is the first in a series of basic networking correctness tests.
Each test itself might be dumb and simple, but built up together,
they prove desired end goals for behavior at scale.
1. (this file) Is a browser write is confirmed as save by multiple peers even if by daisy chain.
2. 
*/

var config = {
	IP: require('ip').address(),
	port: 8765,
	servers: 1,
	browsers: 2,
	route: {
		'/': __dirname + '/index.html',
		'/gun.js': __dirname + '/../../gun.js',
		'/jquery.js': __dirname + '/../../examples/jquery.js',
		'/livestream.html': __dirname + '/livestream.html',
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
var browsers = clients.excluding(servers);
var alice = browsers.pluck(1);
var others = browsers.excluding(alice);

describe("Broadcast Video", function(){
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
				var gun = Gun({file: env.i+'data', peers: peers, web: server});
				server.listen(port, function(){
					test.done();
				});
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it(config.browsers +" browser(s) have joined!", function(){
		require('./util/open').web(config.browsers, "http://"+ config.IP +":"+ config.port);
		return browsers.atLeast(config.browsers);
	});

	it("Browsers load QVDev's streaming!", function(){
		var tests = [], i = 0;
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				test.async();
				console.log("load?");
				function load(src, cb){
					var script = document.createElement('script');
					script.onload = cb; script.src = src;
					document.head.appendChild(script);
				}
				load('https://cdn.jsdelivr.net/gh/QVDev/GunStreamer/js/GunRecorder.js', function(){
					load('https://cdn.jsdelivr.net/gh/QVDev/GunStreamer/js/GunStreamer.js', function(){
						load('https://cdn.jsdelivr.net/gh/QVDev/GunStreamer/js/GunViewer.js', function(){
							load('https://cdn.jsdelivr.net/gh/QVDev/GunStreamer/js/mediabuffer.js', function(){
								test.done();
							});
						});
					});
				});
				$('body').append('<video id="video" width="100%" autoplay></video>');
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Browsers initialized gun!", function(){
		var tests = [], i = 0;
		browsers.each(function(client, id){
			tests.push(client.run(function(test){
				try{ localStorage.clear() }catch(e){}
				try{ indexedDB.deleteDatabase('radata') }catch(e){}
				var env = test.props;
				var gun = Gun('http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun');
				window.gun = gun;
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Stream", function(){
		return alice.run(function(test){
			console.log("I AM ALICE");
			test.async();
			var stream = window.stream = new GunStreamer({
				url: "https://cdn.jsdelivr.net/gh/QVDev/GunStreamer/js/parser_worker.js",
				gun: gun,
				streamId: 'livestream',
				dbRecord: 'streams'
			});
			var record = window.record = new GunRecorder({
				mimeType: 'video/webm; codecs="opus,vp8"',
				//audioBitsPerSecond: 6000,//Audio bits per second this is the lowest quality
				//videoBitsPerSecond: 100000,//Video bits per second this is the lowest quality
				cameraOptions: {video:{width: 1280, height: 720, facingMode: "environment", frameRate: 60}, audio: false},
				video_id: "video",
				recordInterval: 1000, // how long each chunk?
				onRecordStateChange: function(state){ /* change play/pause buttons */ },
				onDataAvailable: function(data){ stream.onDataAvailable(data) } // pass recorded data to streamer
			});
			record.startCamera();
			$('#video').on('playing', function(eve){
			  record.record();
			  test.done();
			});
  		console.log("start recording!");
		}, {acks: config.servers});
	});

	it("View", function(){
		return others.run(function(test){
			console.log("I AM A VIEWER!");
			test.async();
			var view = new GunViewer({
				//mimeType: 'video/webm; codecs="opus,vp8"', // NEED THIS ONE FOR AUDIO+VIDEO
				mimeType: 'video/webm; codecs="vp8"',
				streamerId: "video",
				debug: true,//For debug logs  
			});
			gun.get('livestream').on(function(data){
				window.data = data;
				view.onStreamerData(data);
			});
		}, {acks: config.servers});
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