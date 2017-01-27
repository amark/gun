'use strict';
var Gun = require('../../gun.js');

/**
 * Whether the gun instance is attached to a socket server.
 * @param  {Gun} gun - The gun instance in question.
 * @param  {WebSocket.Server} server - A socket server gun might be attached to.
 * @return {Boolean} - Whether it's attached.
 */
function isUsingServer (gun, server) {
	var servers = gun.back(-1)._.servers;

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
 * Send a message to a group of clients.
 * @param  {Obejct} msg - An http envelope-like message.
 * @param  {Object} clients - IDs mapped to socket instances.
 * @return {undefined}
 */
function send (msg, clients) {
	Gun.obj.map(clients, function (client) {
		ready(client, function () {
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
	var root = gun.back(-1);
	root._.servers = root._.servers || [];
	root._.servers.push(server);
	var pool = {};
	var sid = Gun.text.random();
	server.on('connection', function (socket) {
		socket.id = socket.id || Gun.text.random(10);
		pool[socket.id] = socket;
		/*
		socket.on('message', function (message) {
			var data = Gun.obj.ify(message);

			if (!data || !data.body) {
				return;
			}
			root.on('in', data.body);
		});
		*/
		socket.once('close', function () {
			delete pool[socket.id];
		});
	});

	Gun.on('out', function (context) {
		this.to.next(context);
		if (!isUsingServer(context.gun, server) || Gun.obj.empty(pool)) {
			return;
		}

		var msg = {
			headers: { 'gun-sid': sid },
			body: context,
		};
		send(msg, pool);
	});
}

module.exports = attach;
