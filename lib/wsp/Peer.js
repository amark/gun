/* eslint-disable no-underscore-dangle */
'use strict';

var WebSocket = require('ws');
var Emitter = require('events');
var util = require('util');

/**
 * Calculates backoff instances.
 * @param {Object} [options] - Override the default settings.
 * @param {Object} options.time=50 - Initial backoff time.
 * @param {Object} options.factor=2 - How much to multiply the time by.
 * @param {Object} options.max=1min - Maximum backoff time.
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
	var next = this.time * this.factor;

	if (next > this.max) {
		this.time = this.max;
		return this.max;
	}

	this.time = next;

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
	this.max = options.max || 1 * 60 * 1000;

	return this;
};

/**
 * Schedules the next connection, according to the backoff.
 * @param  {Peer} peer - A peer instance.
 * @return {Timeout} - The timeout value from `setTimeout`.
 */
function scheduleReconnect (peer) {
	var backoff = peer.backoff;
	var time = backoff.time;
	backoff.next();

	var reconnect = peer.connect.bind(peer);

	return setTimeout(reconnect, time);
}

/**
 * Handles reconnections and defers messages until the socket is ready.
 * @param {String} url - The address to connect to.
 * @param {Object} [options] - Override how the socket is managed.
 * @param {Object} options.backoff - Backoff options (see the constructor).
 * @class
 */
function Peer (url, options) {
	if (!(this instanceof Peer)) {
		return new Peer(url, options);
	}

	// Extend EventEmitter.
	Emitter.call(this);
	this.setMaxListeners(Infinity);

	this.options = options || {};

	// Messages sent before the socket is ready.
	this.deferredMsgs = [];

	this.url = Peer.formatURL(url);
	this.backoff = new Backoff(this.options.backoff);

	// Set up the websocket.
	this.connect();

	var peer = this;
	var reconnect = scheduleReconnect.bind(null, peer);

	// Handle reconnection.
	this.on('close', reconnect);
	this.on('error', function (error) {
		if (error.code === 'ECONNREFUSED') {
			reconnect();
		}
	});

	// Send deferred messages.
	this.on('open', function () {
		peer.drainQueue();
		peer.backoff.reset();
	});

}

/**
 * Turns http URLs into WebSocket URLs.
 * @param  {String} url - The url to format.
 * @return {String} - A correctly formatted WebSocket URL.
 */
Peer.formatURL = function (url) {

	// Works for `https` and `wss` URLs, too.
	return url.replace(/^http/, 'ws');
};

util.inherits(Peer, Emitter);
var API = Peer.prototype;

/**
 * Attempts a websocket connection.
 * @return {WebSocket} - The new websocket instance.
 */
API.connect = function () {
	var url = this.url;

	// Open a new websocket.
	var socket = new WebSocket(url, this.options.wsc.protocols, this.options.wsc);

	// Re-use the previous listeners.
	socket._events = this._events;

	this.socket = socket;

	return socket;
};

/**
 * Sends all the messages in the deferred queue.
 * @return {Peer} - The context.
 */
API.drainQueue = function () {
	var peer = this;

	this.deferredMsgs.forEach(function (msg) {
		peer.send(msg);
	});

	// Reset the queue.
	this.deferredMsgs = [];

	return this;
};

/**
 * Send data through the socket, or add it to a queue
 * of deferred messages if it's not ready yet.
 * @param  {Mixed} msg - String, or anything that JSON can handle.
 * @return {Peer} - The context.
 */
API.send = function (msg) {
	var socket = this.socket;
	var state = socket.readyState;
	var ready = socket.OPEN;

	// Make sure it's a string.
	if (typeof msg !== 'string') {
		msg = JSON.stringify(msg);
	}

	// Make sure the socket is ready.
	if (state === ready) {
		socket.send(msg);
	} else {
		this.deferredMsgs.push(msg);
	}

	return this;
};

module.exports = Peer;
