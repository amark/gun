/*
  This file should be one
  folder deeper than every
  other file. It requires
  mocha to run.
*/
var panic = require('panic-server');
var spawn = require('child_process').spawn;
var path = require('path');
var http = require('http');
var fs = require('fs');
var ports = require('./ports');

var wd = require('selenium-webdriver');

function open(url) {
	var driver = new wd.Builder()
		.forBrowser('firefox')
		.build();

	driver.get(url);

	return driver;
}

open('http://localhost:' + ports.panic + '/index.html');
open('http://localhost:' + ports.panic + '/index.html');

var staticServer = new http.Server(function (req, res) {
	if (req.url === '/') {
		req.url = '/index.html';
	}
	var file = path.join(__dirname, req.url);
	try {
		var page = fs.readFileSync(file, 'utf8');
		res.end(page);
	} catch (e) {
		// don't care
	}
});

var server = panic.clients.filter('Node.js').pluck(1);
var browsers = panic.clients.excluding(server);

var alice = browsers.pluck(1);
var bob = browsers.excluding(alice).pluck(1);

var serverPath = path.join(__dirname, 'gun-server.js');

// start the server on :8765
spawn('node', [serverPath]);

function waitFor (num, list) {
	return new Promise(function (res) {

		function ready() {
			if (list.length < num) {
				return;
			}

			res();
			list.removeListener('add', ready);

			return true;
		}

		if (!ready()) {
			list.on('add', ready);
		}

	});
}

before(function () {

	this.timeout(1500000);

	// start the panic server
	panic.server(staticServer).listen(ports.panic);

	return waitFor(2, browsers)
		.then(function () {
			return waitFor(1, server);
		});
});

var scope = {
	uniqueKey: Math.random().toString(16).slice(2),
	file: path.join(process.cwd(), 'delete-me.json'),
	'@scope': true
}

describe('The holy grail', function () {

	it('should allow full recovery', function () {
		this.timeout(1500000);

		return browsers.run(function () {
			localStorage.clear();
		})
		.then(function () {
			return browsers.run(function () {
				window.ref = gun.get(uniqueKey).put({
					text: 'ignore'
				});
			}, scope)
		})
		.then(function () {
			return alice.run(function (done) {
				// alice saves some data
				//ref.path('text').put('Initial text', done); // TODO: USE THIS LINE INSTEAD!
				ref.path('text').put('Initial text');
				setTimeout(done, 50);
			});
		})
		.then(function () {
			return bob.run(function (done) {
				var ctx = this;
				ref.path('text').on(function (data) {
					if (data === 'ignore') {
						return;
					}
					// bob sees alice's data
					if (data !== 'Initial text') {
						ctx.fail('Wrong data showed up: ' + JSON.stringify(data));
					}
					done();
				});
			});
		})
		.then(function () {
			return server.run(function () {
				var fs = require('fs');

				// destroy the data
				fs.unlinkSync(file);

				// crash the server
				process.exit(0);
			}, scope);
		})
		.then(function () {
			return alice.run(function (done) {
				ref.path('text').put('A conflicting update');
				setTimeout(done, 50);
			});
		})
		.then(function () {
			return bob.run(function () {
				ref.path('text').put('B conflicting update');
			});
		})
		.then(function () {
			spawn('node', [serverPath]);
			return waitFor(1, server);
		})
		.then(function () {
			return browsers.run(function (done) {
				var ctx = this;
				ref.path('text').on(function (value) {
					if (value === 'B conflicting update') {
						done();
					}
				});
			});
		});
	});
});


after(function () {
	if (server.length) {
		return server.run(function () {
			process.exit(0);
		});
	}
});