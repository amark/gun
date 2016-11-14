'use strict';
var Gun = require('../../gun.js');

/**
 * Whether the gun instance is attached to a socket server.
 * @param  {Gun} gun - The gun instance in question.
 * @param  {WebSocket.Server} server - A socket server gun might be attached to.
 * @return {Boolean} - Whether it's attached.
 */
function isUsingServer (gun, server) {
	var servers = gun.Back(-1)._.servers;

	return servers ? servers.indexOf(server) !== -1 : false;
}

/**
 * Calls a function when (or if) a socket is ready for messages.
 * @param  {WebSocket} socket - A websocket connection.
 * @param  {Function} cb - Called if or when the socket is ready.
 * @return {Boolean} - Whether the socket is able to take messages.
 */
function ready (socket, cb) {
	var state = socket.readyState;

	// The socket is ready.
	if (state === socket.OPEN) {
		cb();
		return true;
	}

	// Still opening.
	if (state === socket.OPENING) {
		socket.once('open', cb);
	}

	// Nope, closing or closed.
	return false;
}

/**
 * Send a request to a list of clients.
 * @param  {Obejct} context - A gun request context.
 * @param  {Object} clients - IDs mapped to socket instances.
 * @param  {Function} cb - Called for each response.
 * @return {undefined}
 */
function request (context, clients, cb) {
	Gun.obj.map(clients, function (client) {
		ready(client, function () {
			var msg = {
				headers: {},
				body: {
					'#': Gun.on.ask(cb),
					'$': context.get,
				},
			};

			var serialized = JSON.stringify(msg);
			client.send(serialized);
		});
	});
}

/**
 * Pushes a graph update to a collection of clients.
 * @param  {Object} context - The context object passed by gun.
 * @param  {Object} clients - An object mapping URLs to clients.
 * @param  {Function} cb - Invoked on each client response.
 * @return {undefined}
 */
function update (context, clients, cb) {
	Gun.obj.map(clients, function (client) {
		ready(client, function () {
			var msg = {
				headers: {},
				body: {
					'#': Gun.on.ask(cb),
					'$': context.put,
				},
			};

			var serialized = JSON.stringify(msg);

			client.send(serialized);
		});
	});
}

/** * Attaches server push middleware to gun.
 * @param  {Gun} gun - The gun instance to attach to.
 * @param  {WebSocket.Server} server - A websocket server instance.
 * @return {server} - The socket server.
 */
function attach (gun, server) {
	var root = gun.Back(-1);
	root._.servers = root._.servers || [];
	root._.servers.push(server);
	var pool = {};

	server.on('connection', function (socket) {
		socket.id = socket.id || Gun.text.random(10);
		pool[socket.id] = socket;

		socket.on('message', function (message) {
			var data = Gun.obj.ify(message);

			if (!data || !data.body) {
				return;
			}

			var msg = data.body;

			if (msg['@']) {
				Gun.on.ack(msg['@'], [msg['!'], msg.$]);
				return;
			}
		});

		socket.once('close', function () {
			delete pool[socket.id];
		});
	});

	Gun.on('get', function (context) {
		if (!isUsingServer(context.gun, server)) {
			return;
		}
		request(context, pool, function (err, data) {
			var response = {
				'@': context['#'],
				put: data,
				err: err,
			};

			var root = context.gun.Back(Infinity);

			root.on(data ? 'out' : 'in', response);
		});
	});

	Gun.on('put', function (context) {
		if (!isUsingServer(context.gun, server)) {
			return;
		}

		update(context, pool, function (err, data) {
			var ack = {
				'!': err || null,
				'$': data.$,
			};
			Gun.on.ack(context, ack);
		});
	});
}

module.exports = attach;
