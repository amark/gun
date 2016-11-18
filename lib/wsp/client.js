/*
	eslint-disable
	no-warning-comments,
	no-underscore-dangle,
*/
'use strict';

var Gun = require('../../gun');
var Socket = require('./Peer');
var Pool = require('./Pool');
var duplicate = require('./duplicate');

// Maps URLs to sockets.
// Shared between all gun instances.
var sockets = Pool();
var emitter = { on: Gun.on };
var server = {

	// Session id.
	sid: Gun.text.random(),

	// Request handlers.
	handlers: [],

	// Call handlers.
	handle: function (req, res) {
		server.handlers.forEach(function (server) {
			server(req, res);
		});
	},
};

/**
 * Take a map of URLs pointing to options and ensure the
 * urls are using the WS protocol.
 * @param  {Object} peers - Any object with URLs as keys.
 * @return {Object} - Object with normalized URL keys.
 */
function normalizeURLs (peers) {
	var formatted = {};

	Object.keys(peers).forEach(function (url) {
		var options = peers[url];
		var id = Socket.formatURL(url);
		formatted[id] = options;
	});

	return formatted;
}

/**
 * Turns a map of URLs into a socket pool.
 * @param  {Object} peers - Any object with URLs as keys.
 * @return {Pool} - A pool of sockets corresponding to the URLs.
 */
function getSocketSubset (peers) {
	var urls = normalizeURLs(peers);

	return sockets.filter(function (socket) {
		return urls.hasOwnProperty(socket.url);
	});
}

// Handle read requests.
Gun.on('get', function (at) {
	var gun = at.gun;
	var opt = at.opt || {};
	var peers = opt.peers || gun.Back('opt.peers');

	if (!peers || Gun.obj.empty(peers)) {
		at.gun.Back(Infinity).on('in', {
			'@': at['#'],
		});

		return;
	}

	var id = at['#'] || Gun.text.random(9);

	// Create a new message.
	var msg = {

		// msg ID
		'#': id,

		// msg BODY
		'$': at.get,
	};

	// Listen for a response.
	// TODO: ONE? PERF! Clear out listeners, maybe with setTimeout?
	emitter.on(id, function (err, data) {
		var obj = {
			'@': at['#'],
			err: err,
			put: data,
		};

		if (data) {
			at.gun.Back(-1).on('out', obj);
		} else {
			at.gun.Back(-1).on('in', obj);
		}
	});

	var subset = getSocketSubset(peers);

	// Broadcast to the connected peers.
	subset.send({
		headers: { 'gun-sid': server.sid },
		body: msg,
	});
});

// Handle write requests.
Gun.on('put', function (at) {
	if (at['@']) {
		return;
	}

	var peers = at.gun.Back('opt.peers');
	var enabled = at.gun.Back('opt.websocket');
	var options = at.opt || {};

	if (!peers || Gun.obj.empty(peers)) {

		// TODO: What about wsp/server clients? Maybe we shouldn't
		// immediately assume there's no data to be found.
		at.gun.Back(-1).on('in', {
			'@': at['#'],
		});

		return;
	}

	if (options.websocket === false || enabled === false) {
		return;
	}

	var id = at['#'] || Gun.text.random(9);

	var msg = {

		// Message ID.
		'#': id,

		// Message body.
		'$': at.put,
	};

	// TODO: ONE? PERF! Clear out listeners, maybe with setTimeout?
	// Listen for acknowledgement(s).
	Gun.on(id, function (err, ok) {
		at.gun.Back(-1).on('in', {
			'@': at['#'],
			err: err,
			ok: ok,
		});
	});

	var subset = getSocketSubset(peers);

	subset.send({
		headers: { 'gun-sid': server.sid },
		body: msg,
	});
});

// Open any new sockets listed,
// adding them to the global pool.
Gun.on('opt', function (context) {
	var gun = context.gun;

	var peers = gun.Back('opt.peers') || {};

	Gun.obj.map(peers, function (options, url) {
		if (sockets[url]) {
			return;
		}

		var socket = Socket(url, options);
		sockets.add(url, socket);

		/**
		 * Handle responses to requests, adding default headers.
		 * @param  {Object} reply - A gun reply object.
		 * @return {undefined}
		 */
		function respond (reply) {

			// Make sure headers are defined.
			var headers = reply.headers = reply.headers || {};

			// Add 'gun-sid' if it doesn't exist.
			headers['gun-sid'] = headers['gun-sid'] || server.sid;

			socket.send(reply);
		}

		socket.on('message', function (msg) {
			var request;

			try {
				request = JSON.parse(msg);
			} catch (error) {
				return;
			}

			// Validate the request.
			if (!request || !request.body) {
				return;
			}

			request.headers = request.headers || {};

			// emit extra events.
			server.handle(request, respond);
		});
	});
});

Gun.on('opt', function (at) {
	var gun = at.gun;
	var root = gun.Back(Infinity);
	var options = (root._.opt = root._.opt || {});

	// Only register once per gun instance.
	if (options['@client']) {
		return;
	}

	var driver = options['@client'] = {

		/**
		 * Handles get requests sent from other peers.
		 * @param  {Object} req - The get request.
		 * @param  {Function} cb - Handles replies.
		 * @return {undefined}
		 */
		get: function (req, cb) {
			var body = req.body;
			var lex = body.$;
			var graph = gun._.root._.graph;
			var node = graph[lex['#']];

			// TODO: Reply even if it's not in memory.
			if (!node) {
				return;
			}

			cb({
				body: {
					'#': duplicate.track.newID(),
					'@': body['#'],
					'$': node,
				},
			});
		},

		/**
		 * Handles put requests sent from other peers.
		 * @param  {Object} req - The put request.
		 * @param  {Function} cb - A response callback.
		 * @return {undefined}
		 */
		put: function (req, cb) {
			var body = req.body;
			var graph = body.$;

			// Cached gun paths.
			var path = gun._.root._.path || {};

			graph = Gun.obj.map(graph, function (node, soul, map) {
				if (!path[soul]) {
					return;
				}
				map(soul, node);
			});

			// filter out what we don't have in memory.
			if (!graph) {
				return;
			}

			var id = Gun.on.ask(function (ack, event) {
				if (!ack) {
					return;
				}

				event.off();

				cb({
					body: {
						'#': duplicate.track.newID(),
						'@': body['#'],
						'$': ack,
						'!': ack.err,
					},
				});
			});

			gun.on('out', {
				'#': duplicate.track(id),
				gun: gun,
				opt: { websocket: false },
				put: graph,
			});
		},
	};

	server.handlers.push(function (req, res) {

		// Validate request.
		if (!req || !res || !req.body || !req.headers) {
			return;
		}

		var msg = req.body;

		if (duplicate(msg['#'])) {
			return;
		}

		// It's a response, no need to reply.
		if (msg['@']) {
			var reqID = msg['@'];

			emitter.on(reqID, [
				msg['!'],
				msg.$,
			]);

			return;
		}

		var isLex = msg.$ && msg.$['#'];
		var method = isLex ? 'get' : 'put';

		driver[method](req, res);
	});

});
