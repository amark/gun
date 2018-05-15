/* eslint-disable require-jsdoc, no-underscore-dangle */
'use strict';
var Gun = require('../../gun');
var http = require('../http');
var url = require('url');
var WS = require('ws');
var WSS = WS.Server;
var attach = require('./server-push');

// Handles server to server sync.
require('./client.js');

Gun.on('opt', function (at) {
	this.to.next(at);
	var gun = at.gun, opt = at.opt;
	gun.__ = at.root;
	gun.__.opt.ws = opt.ws = gun.__.opt.ws || opt.ws || {};
	gun.__.opt.ws.path = gun.__.opt.ws.path || '/gun';

	if(gun.__.opt.web){
		setTimeout(function(){
			if(gun.__.opt.web.use){
				gun.__.opt.web.use(Gun.serve);
			}
			start(gun.__.opt.web);
		},1);
	}
	function start (server, port, app) {
		if (app && app.use) {
			app.use(gun.wsp.server);
		}
		server = gun.__.opt.ws.server = gun.__.opt.ws.server || gun.__.opt.web || opt.ws.server || server;

		if (!gun.wsp.ws) {
			//console.log("????????", gun.__.opt.ws);
			gun.wsp.ws = new WSS(gun.__.opt.ws);
			attach(gun, gun.wsp.ws);
		}

		require('./ws')(gun.wsp.ws, function (req, res) {
			var ws = this;
			req.headers['gun-sid'] = ws.sid = ws.sid ? ws.sid : req.headers['gun-sid'];
			ws.sub = ws.sub || gun.wsp.on('network', function (msg) {
				var ev = this; ev.to.next(msg);
				if (!ws || !ws.send || !ws._socket || !ws._socket.writable) { return ev.off(); }
				if (!msg || (msg.headers && msg.headers['gun-sid'] === ws.sid)) { return; }
				if (msg && msg.headers) { delete msg.headers['ws-rid']; }
				// TODO: BUG? ^ What if other peers want to ack? Do they use the ws-rid or a gun declared id?
				try { ws.send(Gun.text.ify(msg));
				} catch (e) {} // juuuust in case.
			});
			gun.wsp.wire(req, res);
		}, {headers: {'ws-rid': 1, 'gun-sid': 1}});
		gun.__.opt.ws.port = gun.__.opt.ws.port || opt.ws.port || port || 80;
	}
	var wsp = gun.wsp = gun.wsp || function (server) {
		console.log("WARNING: gun.wsp(server) should be switched to Gun({web: server}) by v0.7!")
		if (!server) { return gun; }
		if (Gun.fns.is(server.address)) {
			if (server.address()) {
				start(server, server.address().port);
				return gun;
			}
		}
		if (Gun.fns.is(server.get) && server.get('port')) {
			start(server, server.get('port'));
			return gun;
		}
		var listen = server.listen;
		server.listen = function (port) {
			var serve = listen.apply(server, arguments);
			start(serve, port, server);
			return serve;
		};
		return gun;
	};
	gun.wsp.on = gun.wsp.on || Gun.on;
	gun.wsp.regex = gun.wsp.regex || opt.route || opt.path || /^\/gun/i;
	gun.wsp.poll = gun.wsp.poll || opt.poll || 1;
	gun.wsp.pull = gun.wsp.pull || opt.pull || gun.wsp.poll * 1000;
	gun.wsp.server = gun.wsp.server || function (req, res, next) { // http
		next = next || function () {};
		if (!req || !res) { return next(), false; }
		if (!req.url) { return next(), false; }
		if (!req.method) { return next(), false; }
		var msg = {};
		msg.url = url.parse(req.url, true);
		if (!gun.wsp.regex.test(msg.url.pathname)) { return next(), false; } // TODO: BUG! If the option isn't a regex then this will fail!
		if (msg.url.pathname.replace(gun.wsp.regex, '').slice(0, 3).toLowerCase() === '.js') {
			res.writeHead(200, {'Content-Type': 'text/javascript'});
			res.end(gun.wsp.js = gun.wsp.js || require('fs').readFileSync(__dirname + '/../../gun.js')); // gun server is caching the gun library for the client
			return true;
		}

		if (!req.upgrade) {
			next();
			return false;
		}

		return http(req, res, function (req, res) {
			if (!req) { return next(); }
			var stream, cb = res = require('../jsonp')(req, res);
			if (req.headers && (stream = req.headers['gun-sid'])) {
				stream = (gun.wsp.peers = gun.wsp.peers || {})[stream] = gun.wsp.peers[stream] || {sid: stream};
				stream.drain = stream.drain || function (res) {
					if (!res || !stream || !stream.queue || !stream.queue.length) { return; }
					res({headers: {'gun-sid': stream.sid}, body: stream.queue });
					stream.off = setTimeout(function () { stream = null; }, gun.wsp.pull);
					stream.reply = stream.queue = null;
					return true;
				};
				stream.sub = stream.sub || gun.wsp.on('network', function (req) {
					var ev = this; ev.to.next(req);
					if (!stream) { return ev.off(); } // self cleans up after itself!
					if (!req || (req.headers && req.headers['gun-sid'] === stream.sid)) { return; }
					(stream.queue = stream.queue || []).push(req);
					stream.drain(stream.reply);
				});
				cb = function (r) { (r.headers || {}).poll = gun.wsp.poll; res(r); };
				clearTimeout(stream.off);
				if (req.headers.pull) {
					if (stream.drain(cb)) { return; }
					return stream.reply = cb;
				}
			}
			gun.wsp.wire(req, cb);
		}), true;
	};
	if ((gun.__.opt.maxSockets = opt.maxSockets || gun.__.opt.maxSockets) !== false) {
		require('https').globalAgent.maxSockets = require('http').globalAgent.maxSockets = gun.__.opt.maxSockets || Infinity;
	}
	gun.wsp.msg = gun.wsp.msg || function (id) {
		if (!id) {
			return gun.wsp.msg.debounce[id = Gun.text.random(9)] = Gun.time.is(), id;
		}
		clearTimeout(gun.wsp.msg.clear);
		gun.wsp.msg.clear = setTimeout(function () {
			var now = Gun.time.is();
			Gun.obj.map(gun.wsp.msg.debounce, function (t, id) {
				if ((now - t) < (1000 * 60 * 5)) { return; }
				Gun.obj.del(gun.wsp.msg.debounce, id);
			});
		}, 500);
		if (id = gun.wsp.msg.debounce[id]) {
			return gun.wsp.msg.debounce[id] = Gun.time.is(), id;
		}
		gun.wsp.msg.debounce[id] = Gun.time.is();
		return;
	};
	gun.wsp.msg.debounce = gun.wsp.msg.debounce || {};
	gun.wsp.wire = gun.wsp.wire || (function () {
		// all streams, technically PATCH but implemented as
		// PUT or POST, are forwarded to other trusted peers
		// except for the ones that are listed in the message
		// as having already been sent to.
		// all states, implemented with GET, are replied to the
		// source that asked for it.
		function tran (req, res) {
			if (!req || !res || !req.body || !req.headers) {
				return;
			}
			if (req.url) {
				req.url = url.format(req.url);
			}
			// var msg = req.body;
			gun.on('in', req.body);
			// // AUTH for non-replies.
			// if(gun.wsp.msg(msg['#'])){ return }
			// gun.wsp.on('network', Gun.obj.copy(req));
			// if(msg['@']){ return } // no need to process.
			// if(msg['$'] && msg['$']['#']){ return tran.get(req, res) }
			// //if(Gun.is.lex(msg['$'])){ return tran.get(req, res) }
			// else { return tran.put(req, res) }
			// cb({body: {hello: 'world'}});
			// // TODO: BUG! server put should push.
		}
		tran.get = function (req, cb) {
			var body = req.body;
			var lex = body.$;
			var reply = {
				headers: { 'Content-Type': tran.json },
			};

			var graph = gun.back(Infinity)._.graph;
			var node = graph[lex['#']];
			var result = Gun.graph.ify(node);

			if (node) {
				cb({
					headers: reply.headers,
					body: {
						'#': gun.wsp.msg(),
						'@': body['#'],
						'$': result,
					},
				});

				return;
			}

			gun.on('out', {
				gun: gun,
				get: lex,
				req: 1,
				'#': body['#'] || Gun.on.ask(function (at, ev) {
					ev.off();
					var graph = at.put;
					return cb({
						headers: reply.headers,
						body: {
							'#': gun.wsp.msg(),
							'@': body['#'],
							'$': graph,
							'!': at.err,
						},
					});
				}),
			});
		};

		tran.put = function (req, cb) {
			// NOTE: It is highly recommended you do your own PUT/POSTs
			// through your own API that then saves to gun manually.
			// This will give you much more fine-grain control over
			// security, transactions, and what not.
			var body = req.body;
			var graph = body.$;
			var reply = {
				headers: { 'Content-Type': tran.json },
			};

			gun.on('out', {
				gun: gun,
				put: graph,
				'#': Gun.on.ask(function (ack, ev) {
					ev.off();
					return cb({
						headers: reply.headers,
						body: {
							'#': gun.wsp.msg(),
							'@': body['#'],
							'$': ack,
							'!': ack.err,
						},
					});
				}),
			});
		};

		tran.json = 'application/json';
		return tran;
	}());

	if (opt.server) {
		wsp(opt.server);
	}
});
