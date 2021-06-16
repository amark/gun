// Gun is supposed to be able to gracefully handle peers going offline and then
// coming back online. If a client has subscribed to some piece of data via the
// gun.on() API method, the subscription should continue to work if a peer goes
// offline briefly and then comes back online. This test confirms that such is
// the case, or fails otherwise.

// Important: It turns out that it's very important that both browsers tabs be
// visible/active throughout the tests, because an inactive tab will NOT
// reconnect to the relay peer until the tab is active again. (Chrome 83)

// Uses a pattern described in https://stackoverflow.com/a/39286581/13564512
// to run multiple configurations of a mocha test.

var config = {
	IP: require('ip').address(),
	port: 8765,
	servers: 2,
	browsers: 2,
	route: {
		'/': __dirname + '/index.html',
		'/gun.js': __dirname + '/../../gun.js',
		'/jquery.js': __dirname + '/../../examples/jquery.js',
		'/radix.js': __dirname + '/../../lib/radix.js',
		'/radisk.js': __dirname + '/../../lib/radisk.js',
		'/store.js': __dirname + '/../../lib/store.js',
		'/rindexed.js': __dirname + '/../../lib/rindexed.js'
	},
	/** Test variants to run */
	variants: ['default', 'radisk'],
	/** Configuration details for each variant. If unspecified, variant will run with no additional configuration. */
	variantConfigs: {
		radisk: {
			/** Options to pass the Gun constructor */
			opts: {
				localStorage: false
			},
			/** Libraries to import before constructing Gun */
			imports: [
				'radix.js',
				'radisk.js',
				'store.js',
				'rindexed.js'
			]
		}
	}
};

var {loadBrowserScripts} = require('./util/load-browser-scripts');
var panic = require('panic-server');
panic.server().on('request', function (req, res) {
	config.route[req.url] && require('fs').createReadStream(config.route[req.url]).pipe(res);
}).listen(config.port);


var manager = require('panic-manager')();

var clients = panic.clients;
var servers = clients.filter('Node.js');
/** The first relay peer */
var bob = servers.pluck(1);
/** The second relay peer */
var carl = servers.excluding(bob).pluck(1);
var browsers = clients.excluding(servers);
/** The "sending" browser */
var alice = browsers.pluck(1);
/** The "receiving" browser */
var dave = browsers.excluding(alice).pluck(1);

// Describe the test itself
describe("gun.on should receive updates after crashed relay peer comes back online", function () {
	this.timeout(10 * 1000);
	config.variants.forEach((variant) => {
		var variantConfig = config.variantConfigs[variant] || {};

		// Describe the variant
		describe(`with ${variant} plugin configuration`, function () {
			before('PANIC manager setup servers', function () {
				// we are terminating the gun servers after each test variant, so we need to start them up again before each test variant
				manager.start({
					clients: Array(config.servers).fill().map(function (u, i) {
						return {
							type: 'node',
							port: config.port + (i + 1)
						}
					}),
					panic: 'http://' + config.IP + ':' + config.port
				});
			});

			before("Servers have joined!", function () {
				return servers.atLeast(config.servers);
			});

			it("GUN started!", function () {
				return bob.run(function (test) {
					var env = test.props;
					var filepath = env.dir + '/data';
					test.async();
					var fs = require('fs');
					try {if (fs.existsSync(filepath)) {fs.rmdirSync(filepath, {recursive: true});} } catch (e) {console.error(e); test.fail('');}
					var server = require('http').createServer(function (req, res) {
						res.end("I AM BOB");
					});
					var port = env.config.port + 1;
					try {var Gun = require(env.dir + '/../../index.js');} catch (e) {console.error(e); test.fail('');}
					var gun = Gun({file: filepath, web: server});
					server.listen(port, function () {
						test.done();
					});
				}, {config: config, dir: __dirname});
			});

			it(config.browsers + " browser(s) have joined!", function () {
				require('./util/open').web(config.browsers, "http://" + config.IP + ":" + config.port, {
					headless: true,
				});
				return browsers.atLeast(config.browsers);
			});

			it(`Browsers loaded ${variant} plugin libraries`, function () {
				return loadBrowserScripts(browsers, variantConfig.imports);
			});

			it("Browsers initialized gun!", function () {
				var tests = [], i = 0;
				browsers.each(function (client, id) {
					tests.push(client.run(function (test) {
						try {localStorage.clear()} catch (e) { }
						try {indexedDB.deleteDatabase('radata')} catch (e) { }
						var env = test.props;
						var configOpts = env.variantConfig.opts || {};
						var opts = {
							peers: ['http://' + env.config.IP + ':' + (env.config.port + 1) + '/gun'],
							...configOpts
						};

						console.log('using constructor options: ', JSON.stringify(opts));
						var gun = Gun(opts);
						window.ref = gun.get('a');
					}, {i: i += 1, config: config, variantConfig: variantConfig}));
				});
				return Promise.all(tests);
			});

			it("Dave subscribed to updates using gun.on()", function () {
				return dave.run(function (test) {
					console.log("I AM DAVE");
					test.async();
					ref.on(function (data) {
						console.log("Just received data: ", JSON.stringify(data));
						if (data.hello === 'world') {window.receivedFirst = true;}
						if (data.foo === 'bar') {window.receivedSecond = true;}
					});
					test.done();
				});
			});

			it("Alice put first data", function () {
				return alice.run(function (test) {
					console.log("I AM ALICE");
					test.async();
					ref.put({hello: 'world'}, function (ack) {
						if (!ack.err) {
							test.done();
						} else {
							console.log('ALICE WAS UNABLE TO PUT DATA!');
							test.fail();
						}
					});
				});
			});

			it("Dave received first data", function () {
				return dave.run(function (test) {
					test.async();
					var myInterval;
					myInterval = setInterval(function () {
						if (window.receivedFirst) {
							clearInterval(myInterval);
							test.done();
						}
					}, 10);
				});
			});

			it("Killed relay peer", function () {
				return bob.run(function (test) {
					test.async();
					process.exit();
				});
			});

			it("Waited 1 second", function (done) {
				setTimeout(done, 1000);
			});

			it("Alice put second data", function () {
				return alice.run(function (test) {
					test.async();
					ref.put({foo: 'bar'}, function (ack) {
						if (!ack.err) {
							test.done();
						}
					});
				});
			});

			// FIXME: Don't copy paste the entire block!!
			it("Restored relay peer", function () {
				return carl.run(function (test) {
					var env = test.props;
					var filepath = env.dir + '/data';
					test.async();
					var fs = require('fs');
					try {if (fs.existsSync(filepath)) {fs.rmdirSync(filepath, {recursive: true});} } catch (e) {console.error(e); test.fail('');}
					var server = require('http').createServer(function (req, res) {
						res.end("I AM CARL");
					});
					var port = env.config.port + 1;
					try {var Gun = require(env.dir + '/../../index.js');} catch (e) {console.error(e); test.fail('');}
					var gun = Gun({file: filepath, web: server});
					server.listen(port, function () {
						test.done();
					});
				}, {config: config, dir: __dirname});
			});

			it("Browsers reconnected", function () {
				var tests = [], i = 0;
				browsers.each(function (client, id) {
					tests.push(client.run(function (test) {
						test.async();
						var config = test.props.config;
						var seconds = 15;
						var timeout = Date.now() + seconds * 1000;
						var url = "http://" + config.IP + ":" + (config.port + 1) + "/gun";
						var peers = ref.back(1)._.opt.peers;
						var i;
						i = setInterval(function () {
							if (peers[url] && peers[url].wire.readyState === 1) {
								clearInterval(i);
								test.done();
								return;
							}
							if (Date.now() >= timeout) {
								test.fail('Timed out after ' + seconds + ' seconds');
								return;
							}
						}, 10);
					}, {config: config}));
				});
				return Promise.all(tests);
			});

			it("Dave received second data", function () {
				return dave.run(function (test) {
					test.async();
					var seconds = 60;
					var timeout = Date.now() + seconds * 1000;
					var i;
					i = setInterval(function () {
						if (window.receivedSecond) {
							test.done();
							return;
						}
						if (Date.now() >= timeout) {
							test.fail('Timed out after ' + seconds + ' seconds');
							return;
						}
					}, 10);
				});
			});

			it('Closed browsers & servers', function () {
				var promises = [];
				promises.push(bob.run(function () {
					process.exit();
				}));
				promises.push(carl.run(function () {
					process.exit();
				}));
				promises.push(require('./util/open').cleanup());
				return Promise.all(promises);
			});
		});
	});
});
