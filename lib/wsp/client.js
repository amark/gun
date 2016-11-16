/* eslint-env node*/
/*
	eslint-disable
	require-jsdoc,
	no-warning-comments,
	no-underscore-dangle,
	max-params,
*/
'use strict';

var Gun = require('../../gun');
var WS = require('ws');

var Tab = {};
Tab.on = Gun.on;
Tab.peers = (function () {

	function Peer (peers) {
		if (!Peer.is(this)) {
			return new Peer(peers);
		}

		this.peers = peers;
	}

	Peer.is = function (peer) {
		return peer instanceof Peer;
	};

	function map (peer, url) {
		var msg = this.msg;
		var opt = this.opt || {};
		opt.out = true;
		Peer.request(url, msg, null, opt);
	}

	Peer.prototype.send = function (msg, opt) {
		Peer.request.each(this.peers, map, {
			msg: msg,
			opt: opt,
		});
	};

	Peer.request = (function () {

		function request (base, body, cb, opt) {

			var obj = base.length ? { base: base } : {};
			obj.base = opt.base || base;
			obj.body = opt.body || body;
			obj.headers = opt.headers;
			obj.url = opt.url;
			obj.out = opt.out;
			cb = cb || function () {};

			if (!obj.base) {
				return;
			}

			request.transport(obj, cb);
		}

		request.createServer = function (fn) {
			request.createServer.list.push(fn);
		};

		request.createServer.ing = function (req, cb) {
			var index = request.createServer.list.length;
			var server;
			while (index) {
				index -= 1;
				server = request.createServer.list[index] || function () {};
				server(req, cb);
			}
		};

		request.createServer.list = [];
		request.back = 2;
		request.backoff = 2;

		request.transport = function (opt, cb) {
			if (request.ws(opt, cb)) {
				return;
			}
		};

		request.ws = function (opt, cb, req) {
			var ws;
			if (!WS) {
				return false;
			}

			ws = request.ws.peers[opt.base];
			if (ws) {
				req = req || {};
				if (opt.headers) {
					req.headers = opt.headers;
				}
				if (opt.body) {
					req.body = opt.body;
				}

				if (opt.url) {
					req.url = opt.url;
				}

				req.headers = req.headers || {};

				if (!opt.out && !ws.cbs[req.headers['ws-rid']]) {
					var rid = 'WS' +
						new Date().getTime() +
						'.' +
						Math.floor((Math.random() * 65535) + 1);

					req.headers['ws-rid'] = rid;

					ws.cbs[rid] = function (err, res) {
						if (!res || res.body || res.end) {
							delete ws.cbs[req.headers['ws-rid']];
						}

						cb(err, res);
					};
				}

				if (!ws.readyState) {
					setTimeout(function () {
						request.ws(opt, cb, req);
					}, 100);

					return true;
				}

				ws.sending = true;
				ws.send(JSON.stringify(req));
				return true;
			}

			if (ws === false) {
				return false;
			}

			var wsURL = opt.base.replace('http', 'ws');

			ws = request.ws.peers[opt.base] = new WS(wsURL);
			ws.cbs = {};

			ws.onopen = function () {
				request.back = 2;
				request.ws(opt, cb);
			};

			ws.onclose = function (event) {

				if (!ws || !event) {
					return;
				}

				if (ws.close instanceof Function) {
					ws.close();
				}

				if (!ws.sending) {
					ws = request.ws.peers[opt.base] = false;
					request.transport(opt, cb);
					return;
				}

				request.each(ws.cbs, function (cb) {
					cb({
						err: 'WebSocket disconnected!',
						code: ws.sending ? (ws || {}).err || event.code : -1,
					});
				});

				// This will make the next request try to reconnect
				ws = request.ws.peers[opt.base] = null;

				// TODO: Have the driver handle this!
				setTimeout(function () {

					// opt here is a race condition,
					// is it not? Does this matter?
					request.ws(opt, function () {});
				}, request.back *= request.backoff);
			};

			ws.onmessage = function (msg) {
				var res;
				if (!msg || !msg.data) {
					return;
				}
				try {
					res = JSON.parse(msg.data);
				} catch (error) {
					return;
				}
				if (!res) {
					return;
				}
				res.headers = res.headers || {};
				if (res.headers['ws-rid']) {
					var cb = ws.cbs[res.headers['ws-rid']] || function () {};
					cb(null, res);
					return;
				}

				// emit extra events.
				if (res.body) {
					request.createServer.ing(res, function (res) {
						res.out = true;
						request(opt.base, null, null, res);
					});
				}
			};

			ws.onerror = function (error) {
				(ws || {}).err = error;
			};

			return true;
		};
		request.ws.peers = {};
		request.ws.cbs = {};

		request.each = function (obj, cb, as) {
			if (!obj || !cb) {
				return;
			}

			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					cb.call(as, obj[key], key);
				}
			}
		};

		return request;
	}());

	return Peer;
}());

// Handle read requests.
Gun.on('get', function (at) {
	var gun = at.gun;
	var opt = at.opt || {};
	var peers = opt.peers || gun.Back('opt.peers');
	var server = Tab.server || {};

	var duplicated = server.msg || function () {
		return false;
	};

	if (!peers || Gun.obj.empty(peers)) {
		Gun.log.once('peers', 'Warning! You have no peers to connect to!');
		at.gun.Back(-1).on('in', {'@': at['#']});

		return;
	}

	// Create a new message.
	var msg = {

		// msg ID
		'#': at['#'] || Gun.text.random(9),

		// msg BODY
		'$': at.get,
	};

	if (duplicated(msg['#'])) {
		return;
	}

	// Listen for a response.
	// TODO: ONE? PERF! Clear out listeners, maybe with setTimeout?
	Tab.on(msg['#'], function (err, data) {
		var id = Gun.text.random();
		var root = at.gun.Back(Infinity);

		var obj = {
			'#': id,
			'@': at['#'],
			err: err,
			put: data,

			// Flag, prevents rebroadcast.
			nopush: true,
		};

		root.on(data ? 'out' : 'in', obj);
	});

	// Broadcast to all other peers.
	Tab.peers(peers).send(msg, {
		headers: {
			'gun-sid': Tab.server.sid,
		},
	});
});

// Handle write requests.
Gun.on('put', function (at) {
	if (at['@']) {
		return;
	}
	var opt = at.gun.Back('opt') || {}, peers = opt.peers;
	if (!peers || Gun.obj.empty(peers)) {
		Gun.log.once('peers', 'Warning! You have no peers to save to!');
		at.gun.Back(-1).on('in', {'@': at['#']});
		return;
	}
	if (opt.websocket === false || (at.opt && at.opt.websocket === false)) {
		return;
	}
	var msg = {

		// msg ID
		'#': at['#'] || Gun.text.random(9),

		// msg BODY
		'$': at.put,
	};

	// TODO: ONE? PERF! Clear out listeners, maybe with setTimeout?
	Tab.on(msg['#'], function (err, ok) {
		at.gun.Back(-1).on('in', {
			'@': at['#'],
			err: err,
			ok: ok,
		});
	});

	Tab.peers(peers).send(msg, {
		headers: {
			'gun-sid': Tab.server.sid,
		},
	});
});

// REVIEW: Do I need this on a server client?
// browser/client side Server!
// TODO: BUG! Does not respect separate instances!!!
Gun.on('opt', function (at) {
	if (Tab.server) {
		return;
	}

	var gun = at.gun;
	var server = Tab.server = Tab.server || {};
	var tmp;

	server.sid = Gun.text.random();

	Tab.peers.request.createServer(function (req, res) {

		// Validate request.
		if (!req || !res || !req.body || !req.headers) {
			return;
		}

		var msg = req.body;

		// AUTH for non-replies.
		if (server.msg(msg['#'])) {
			return;
		}

		// no need to process.
		if (msg['@']) {
			if (Tab.ons[tmp = msg['@'] || msg['#']]) {
				Tab.on(tmp, [msg['!'], msg.$]);
			}
			return;
		}

		if (msg.$ && msg.$['#']) {
			server.get(req, res);
			return;
		}

		server.put(req, res);
	});

	server.get = function (req, cb) {
		var body = req.body;
		var lex = body.$;
		var graph = gun._.root._.graph;
		var node;

		// Don't reply to data we don't have it in memory.
		// TODO: Add localStorage?
		if (!(node = graph[lex['#']])) {
			return;
		}

		cb({
			body: {
				'#': server.msg(),
				'@': body['#'],
				'$': node,
			},
		});
	};

	server.put = function (req, cb) {
		var body = req.body, graph = body.$;
		var __ = gun._.root._;

		// filter out what we don't have in memory.
		if (!(graph = Gun.obj.map(graph, function (node, soul, map) {
			if (!__.path[soul]) {
				return;
			}
			map(soul, node);
		}))) {
			return;
		}
		gun.on('out', {
			gun: gun,
			opt: {
				websocket: false,
			},
			put: graph,
			'#': Gun.on.ask(function (ack, ev) {
				if (!ack) {
					return undefined;
				}
				ev.off();
				return cb({
					body: {
						'#': server.msg(),
						'@': body['#'],
						'$': ack,
						'!': ack.err,
					},
				});
			}),
		});
	};

	server.msg = function (id) {
		if (!id) {
			id = Gun.text.random(9);
			server.msg.debounce[id] = Gun.time.is();
			return id;
		}

		clearTimeout(server.msg.clear);
		server.msg.clear = setTimeout(function () {
			var now = Gun.time.is();
			Gun.obj.map(server.msg.debounce, function (time, id) {
				if ((now - time) < (1000 * 60 * 5)) {
					return;
				}

				Gun.obj.del(server.msg.debounce, id);
			});
		}, 500);

		if (server.msg.debounce[id]) {
			server.msg.debounce[id] = Gun.time.is();
			return id;
		}

		server.msg.debounce[id] = Gun.time.is();
		return undefined;
	};

	server.msg.debounce = server.msg.debounce || {};
});
