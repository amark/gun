'use strict';

/**
 * Simpler interface over a collection of sockets. Works with
 * WebSocket clients, or sockets from a WebSocket server.
 * @class
 */
function Pool () {
	if (!(this instanceof Pool)) {
		return new Pool();
	}

	// Maps IDs to sockets.
	this.sockets = {};
}

var API = Pool.prototype;

/**
 * Returns the socket by the given ID.
 * @param  {String} id - The unique socket ID.
 * @return {WebSocket|Null} - The WebSocket, if found.
 */
API.get = function (id) {
	return this.sockets[id] || null;
};

/**
 * Adds a socket to the pool.
 * @param  {String} id - The socket ID.
 * @param  {WebSocket} socket - A websocket instance.
 * @return {Pool} - The context.
 */
API.add = function (id, socket) {
	this.sockets[id] = socket;

	return this;
};

/**
 * Removes a socket from the pool.
 * @param  {String} id - The ID of the socket to remove.
 * @return {Boolean} - Whether the pool contained the socket.
 */
API.remove = function (id) {
	var sockets = this.sockets;
	var hasSocket = sockets.hasOwnProperty(id);

	if (hasSocket) {
		delete sockets[id];
	}

	return hasSocket;
};

/**
 * Creates a filtered pool of sockets. Works the same as Array#filter.
 * @param  {Function} fn - Called for each socket in the pool.
 * @param  {Mixed} [_this] - The `this` context to use when invoking
 * the callback.
 * @return {Pool} - A new, filtered socket pool.
 */
API.filter = function (fn, _this) {
	var filtered = Pool();
	var pool = this;

	_this = _this || pool;

	Object.keys(this.sockets).forEach(function (id) {
		var socket = pool.sockets[id];

		var shouldAdd = fn.call(_this, socket, id, pool);

		// Add it to the new pool.
		if (shouldAdd) {
			filtered.add(id, socket);
		}
	});

	return filtered;
};

/**
 * Send a message through each socket in the pool.
 * @param  {String} msg - The message to send.
 * @return {Number} - How many sockets the message was sent to.
 */
API.send = function (msg) {
	var pool = this;

	var ids = Object.keys(this.sockets);

	ids.forEach(function (id) {
		var socket = pool.sockets[id];
		socket.send(msg);
	});

	return ids.length;
};

module.exports = Pool;
