/*
	eslint-disable
	no-warning-comments,
	no-underscore-dangle,
*/
'use strict';

var Gun = require('../../gun');
var Socket = require('./Peer');
var Pool = require('./Pool');

// Maps URLs to sockets.
// Shared between all gun instances.
var sockets = Pool();
var sid = Gun.text.random();

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

Gun.on('out', function (ctx) {
	var gun = ctx.gun;
	var opt = ctx.opt || {};
	var peers = opt.peers || gun.Back('opt.peers');

	if (!peers) {
		return;
	}

	var subset = getSocketSubset(peers);

	subset.send({
		headers: { 'gun-sid': sid },
		body: ctx,
	});
});

// Open any new sockets listed,
// adding them to the global pool.
Gun.on('opt', function (context) {
	var gun = context.gun;
	var root = gun.Back(Infinity);

	var peers = gun.Back('opt.peers') || {};

	Gun.obj.map(peers, function (options, url) {
		if (sockets[url]) {
			return;
		}

		var socket = Socket(url, options);
		sockets.add(url, socket);

		socket.on('message', function (msg) {
			var request;

			try {
				request = JSON.parse(msg.utf8Data);
			} catch (error) {
				return;
			}

			// Validate the request.
			if (!request || !request.body) {
				return;
			}
			
			root.on('in', request.body);
		});
	});
});
