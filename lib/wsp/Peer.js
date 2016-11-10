var WebSocket = require('ws');

/**
 * Calculates backoff instances.
 * @param {Object} [options] - Override the default settings.
 * @param {Object} options.time=50 - Initial backoff time.
 * @param {Object} options.factor=2 - How much to multiply the time by.
 * @class
 */
function Backoff (options) {
	this.options = options || {};

	// Sets the initial backoff settings.
	this.reset();
}

/**
 * Increments the time by the factor.
 * @return {Number} - The next backoff time.
 */
Backoff.prototype.next = function () {
	this.time *= this.factor;

	return this.time;
};

/**
 * Resets the backoff state to it's original condition.
 * @return {Backoff} - The context.
 */
Backoff.prototype.reset = function () {
	var options = this.options;

	this.time = options.time || 50;
	this.factor = options.factor || 2;

	return this;
};

/**
 * Create a websocket client and handle reconnect backoff logic.
 * @param {String} url - A preformatted url (starts with ws://)
 * @param {Object} [options] - Override how the socket is managed.
 * @param {Object} options.backoff - Backoff options (see the constructor).
 * @class
 */
function Peer (url, options) {
	if (!(this instanceof Peer)) {
		return new Peer(url, options);
	}

	this.options = options || {};

	// Messages sent while offline.
	this.offline = [];

	this.url = Peer.formatURL(url);
	this.backoff = new Backoff(this.options.backoff);
	this.retry(url);
}

/**
 * Turns http URLs into WebSocket URLs.
 * @param  {String} url - The url to format.
 * @return {String} - A correctly formatted WebSocket URL.
 */
Peer.formatURL = function (url) {

	// Works for `https` and `wss` URLs, too.
	return url.replace('http', 'ws');
};

var API = Peer.prototype;

/**
 * Attempts a websocket connection.
 * @param  {String} url - The websocket URL.
 * @return {WebSocket} - The new websocket instance.
 */
API.retry = function () {
	var url = this.url;

	var socket = new WebSocket(url);
	this.socket = socket;

	this.retryOnDisconnect(socket);

	this.sendOnConnection();

	return socket;
};

/**
 * Sends the messages that couldn't be sent before once
 * the connection is open.
 * @return {Peer} - The context.
 */
API.sendOnConnection = function () {
	var peer = this;
	var queue = this.offline;
	var socket = this.socket;

	// Wait for the socket to connect.
	socket.once('open', function () {
		queue.forEach(function (msg) {
			socket.send(msg);
		});

		peer.offline = [];
	});

	return this;
};

/**
 * Schedules the next retry, according to the backoff.
 * @param  {Peer} peer - A peer instance.
 * @return {Timeout} - The timeout value from `setTimeout`.
 */
function schedule (peer) {
	var backoff = peer.backoff;
	var time = backoff.time;
	backoff.next();

	return setTimeout(function () {
		var socket = peer.retry();

		// Successfully reconnected? Reset the backoff.
		socket.once('open', backoff.reset.bind(backoff));
	}, time);
}

/**
 * Attaches handlers to the socket, attempting reconnection
 * when it's closed.
 * @param  {WebSocket} socket - The websocket instance to bind to.
 * @return {WebSocket} - The same websocket.
 */
API.retryOnDisconnect = function (socket) {
	var peer = this;

	// Listen for socket close events.
	socket.once('close', function () {
		schedule(peer);
	});

	socket.on('error', function (error) {
		if (error.code === 'ECONNREFUSED') {
			schedule(peer);
		}
	});

	return socket;
};

/**
 * Send data through the socket, or add it to a queue
 * of offline requests if it's not ready yet.
 * @param  {String} msg - The data to send.
 * @return {Peer} - The context.
 */
API.send = function (msg) {
	var socket = this.socket;
	var state = socket.readyState;
	var ready = socket.OPEN;

	if (state === ready) {
		socket.send(msg);
	} else {
		this.offline.push(msg);
	}

	return this;
};

module.exports = Peer;
