// Regression test for existing collection membership discovered through map().on().
//
// Two browser peers connect through one relay. Alice writes item records and their
// dynamic index fields before Bob initializes GUN and subscribes. Bob must discover
// every existing item; a browser reload or a second explicit get must not be required.

var config = {
	IP: require('ip').address(),
	port: 8765,
	relays: 1,
	browsers: 2,
	items: Number(process.env.PANIC_ITEMS || 250),
	gunRoot: process.env.PANIC_GUN_ROOT || __dirname + '/../..',
	route: {
		'/': __dirname + '/index.html',
		'/gun.js': process.env.PANIC_GUN_BROWSER || __dirname + '/../../gun.js',
		'/jquery.js': __dirname + '/../../examples/jquery.js'
	}
};

var panic = require('panic-server');
var panicServer = panic.server();
panicServer.on('request', function(req, res){
	var file = config.route[req.url];
	file && require('fs').createReadStream(file).pipe(res);
}).listen(config.port);

var clients = panic.clients;
var manager = require('panic-manager')();
manager.start({
	clients: Array(config.relays).fill().map(function(u, i){
		return {
			type: 'node',
			port: config.port + i + 1
		};
	}),
	panic: 'http://' + config.IP + ':' + config.port
});

var relays = clients.filter('Node.js');
var browsers = clients.excluding(relays);
var alice = browsers.pluck(1);
var bob = browsers.excluding(alice).pluck(1);
var run = Date.now();

describe('map().on() discovers existing dynamic index entries without reload', function(){
	this.timeout(2 * 60 * 1000);

	it('relay joined', function(){
		return relays.atLeast(config.relays);
	});

	it('relay started GUN', function(){
		return relays.run(function(test){
			var env = test.props;
			test.async();
			var http = require('http');
			var server = http.createServer(function(req, res){
				res.end('GUN relay');
			});
			var Gun = require(env.config.gunRoot);
			Gun({localStorage: false, web: server});
			server.listen(env.config.port + 1, test.done);
		}, {config: config, dir: __dirname});
	});

	it('browser peers joined', function(){
		require('./util/open').web(config.browsers, 'http://' + config.IP + ':' + config.port, {
			headless: true,
			executablePath: process.env.PANIC_CHROMIUM_EXECUTABLE || undefined,
			args: ['--no-sandbox', '--disable-dev-shm-usage']
		});
		return browsers.atLeast(config.browsers);
	});

	it('Alice initialized GUN', function(){
		return alice.run(function(test){
			localStorage.clear();
			var env = test.props;
			window.testRun = 'map-live-sync-' + env.run;
			window.gun = Gun({
				localStorage: false,
				peers: ['http://' + env.config.IP + ':' + (env.config.port + 1) + '/gun']
			});
		}, {config: config, run: run});
	});

	it('Alice wrote records and dynamic index fields', function(){
		return alice.run(function(test){
			test.async();
			var env = test.props;
			var root = gun.get(testRun);
			var pending = env.config.items;
			var failed = false;
			var done = function(ack){
				if(failed){ return }
				if(ack && ack.err){
					failed = true;
					return test.fail(ack.err);
				}
				pending -= 1;
				if(!pending){ test.done() }
			};
			var i = env.config.items;
			while(i--){
				(function(index){
					var id = 'item-' + index;
					root.get('items').get(id).put({
						id: id,
						value: 'value-' + index
					}, function(itemAck){
						if(itemAck && itemAck.err){ return done(itemAck) }
						var update = {};
						update[id] = true;
						root.get('item-index').put(update, done);
					});
				}(i));
			}
		}, {config: config});
	});

	it('Bob joined and subscribed after the writes', function(){
		return bob.run(function(test){
			test.async();
			localStorage.clear();
			var env = test.props;
			window.testRun = 'map-live-sync-' + env.run;
			window.gun = Gun({
				localStorage: false,
				peers: ['http://' + env.config.IP + ':' + (env.config.port + 1) + '/gun']
			});
			window.seen = {};
			window.seenCount = 0;
			var root = gun.get(testRun);
			root.get('item-index').map().on(function(enabled, id){
				if(enabled !== true || seen[id]){ return }
				root.get('items').get(id).once(function(item){
					if(!item || item.id !== id || seen[id]){ return }
					seen[id] = true;
					seenCount += 1;
				});
			});
			test.done();
		}, {config: config, run: run});
	});

	it('Bob discovered every existing indexed record without reload', function(){
		return bob.run(function(test){
			test.async();
			var env = test.props;
			var started = Date.now();
			var timeout = setInterval(function(){
				if(seenCount === env.config.items){
					clearInterval(timeout);
					console.log('Received ' + seenCount + ' items live in ' +
						(Date.now() - started) + 'ms.');
					return test.done();
				}
				if(Date.now() - started > 30 * 1000){
					clearInterval(timeout);
					return test.fail('Only received ' + seenCount + ' of ' +
						env.config.items + ' items without reload.');
				}
			}, 50);
		}, {config: config});
	});

	after('shut down browsers and relay', function(){
		var browserCleanup = require('./util/open').cleanup() || Promise.resolve();
		var relayCleanup = relays.run(function(){ process.exit() });
		return Promise.all([browserCleanup, relayCleanup]).then(function(){
			return new Promise(function(resolve){
				panicServer.close(resolve);
			});
		});
	});
});
