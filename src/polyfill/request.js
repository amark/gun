
var Gun = require('./core');

// Check for stone-age browsers.
if (typeof JSON === 'undefined') {
	throw new Error(
		'Gun depends on JSON. Please load it first:\n' +
		'ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js'
	);
}

function Client (url, options, wscOptions ) {
	if (!(this instanceof Client)) {
		return new Client(url, options, wscOptions);
	}

	this.url = Client.formatURL(url);
	this.socket = null;
	this.queue = [];
	this.sid = Gun.text.random(10);

	this.on = Gun.on;

	this.options = options || {};
	this.options.wsc = wscOptions;
	this.resetBackoff();
}

Client.prototype = {
	constructor: Client,

	drainQueue: function () {
		var queue = this.queue;
		var client = this;

		// Reset the queue.
		this.queue = [];

		// Send each message.
		queue.forEach(function (msg) {
			client.send(msg);
		});

		return queue.length;
	},

	connect: function () {
		var client = this;
		var socket = new Client.WebSocket(this.url, this.options.wsc.protocols, this.options.wsc );
		this.socket = socket;

		// Forward messages into the emitter.
		socket.addEventListener('message', function (msg) {
			client.on('message', msg);
		});

		// Reconnect on close events.
		socket.addEventListener('close', function () {
			client.scheduleReconnect();
		});

		// Send the messages in the queue.
		this.ready(function () {
			client.drainQueue();
		});

		return socket;
	},

	resetBackoff: function () {
		var backoff = this.options;

		this.backoff = {
			time: backoff.time || 100,
			max: backoff.max || 2000,
			factor: backoff.factor || 2
		};

		return this.backoff;
	},

	nextBackoff: function () {
		var backoff = this.backoff;
		var next = backoff.time * backoff.factor;
		var max = backoff.max;

		if (next > max) {
			next = max;
		}

		return (backoff.time = next);
	},

	// Try to efficiently reconnect.
	scheduleReconnect: function () {
		var client = this;
		var time = this.backoff.time;
		this.nextBackoff();

		setTimeout(function () {
			client.connect();

			client.ready(function () {
				client.resetBackoff();
			});
		}, time);
	},

	isClosed: function () {
		var socket = this.socket;

		if (!socket) {
			return true;
		}

		var state = socket.readyState;

		if (state === socket.CLOSING || state === socket.CLOSED) {
			return true;
		}

		return false;
	},

	ready: function (callback) {
		var socket = this.socket;
		var state = socket.readyState;

		if (state === socket.OPEN) {
			callback();
			return;
		}

		if (state === socket.CONNECTING) {
			socket.addEventListener('open', callback);
		}
	},

	send: function (msg) {
		if (this.isClosed()) {
			this.queue.push(msg);

			// Will send once connected.
			this.connect();
			return false;
		}

		var socket = this.socket;

		// Make sure the socket is open.
		this.ready(function () {
			socket.send(msg);
		});

		return true;
	}
};

if (typeof window !== 'undefined') {
	Client.WebSocket = window.WebSocket ||
		window.webkitWebSocket ||
		window.mozWebSocket ||
		null;
}

Client.isSupported = !!Client.WebSocket;

if(!Client.isSupported){ return } // TODO: For now, don't do anything in browsers/servers that don't work. Later, use JSONP fallback and merge with server code?

// Ensure the protocol is correct.
Client.formatURL = function (url) {
	return url.replace('http', 'ws');
};

// Send a message to a group of peers.
Client.broadcast = function (urls, msg) {
	var pool = Client.pool;
	msg.headers = msg.headers || {};

	Gun.obj.map(urls, function (options, addr) {

		var url = Client.formatURL(addr);

		var peer = pool[url];

		var envelope = {
			headers: Gun.obj.to(msg.headers, {
				'gun-sid': peer.sid
			}),
			body: msg.body
		};

		var serialized = Gun.text.ify(envelope);

		peer.send(serialized);
	});

};

// A map of URLs to client instances.
Client.pool = {};

// Close all WebSockets when the window closes.
if (typeof window !== 'undefined') {
	window.addEventListener('unload', function () {
		Gun.obj.map(Client.pool, function (client) {
			if (client.isClosed()) {
				return;
			}

			client.socket.close();
		});
	});
}

// Define client instances as gun needs them.
// Sockets will not be opened until absolutely necessary.
Gun.on('opt', function (ctx) {
	this.to.next(ctx);

	var gun = ctx.gun;
	var peers = gun.back('opt.peers') || {};

	Gun.obj.map(peers, function (options, addr) {
		var url = Client.formatURL(addr);

		// Ignore clients we've seen before.
		if (Client.pool.hasOwnProperty(url)) {
			return;
		}

		var client = new Client(url, options.backoff, gun.back('opt.wsc') || {protocols:null});

		// Add it to the pool.
		Client.pool[url] = client;

		// Listen to incoming messages.
		client.on('message', function (msg) {
			var data;

			try {
				data = Gun.obj.ify(msg.data);
			} catch (err) {
				// Invalid message, discard it.
				return;
			}

			if (!data || !data.body) {
				return;
			}

			gun.on('in', data.body);
		});
	});
});

function request (peers, ctx) {
	if (Client.isSupported) {
		Client.broadcast(peers, ctx);
	}
}

// Broadcast the messages.
Gun.on('out', function (ctx) {
	this.to.next(ctx);
	var gun = ctx.gun;
	var peers = gun.back('opt.peers') || {};
	var headers = gun.back('opt.headers') || {};
	// Validate.
	if (Gun.obj.empty(peers)) {
		return;
	}

	request(peers, {body: ctx, headers: headers});
});

request.jsonp = function (opt, cb) {
	request.jsonp.ify(opt, function (url) {
		if (!url) {
			return;
		}
		request.jsonp.send(url, function (err, reply) {
			cb(err, reply);
			request.jsonp.poll(opt, reply);
		}, opt.jsonp);
	});
};
request.jsonp.send = function (url, cb, id) {
	var js = document.createElement('script');
	js.src = url;
	js.onerror = function () {
		(window[js.id] || function () {})(null, {
			err: 'JSONP failed!'
		});
	};
	window[js.id = id] = function (res, err) {
		cb(err, res);
		cb.id = js.id;
		js.parentNode.removeChild(js);
		delete window[cb.id];
	};
	js.async = true;
	document.getElementsByTagName('head')[0].appendChild(js);
	return js;
};
request.jsonp.poll = function (opt, res) {
	if (!opt || !opt.base || !res || !res.headers || !res.headers.poll) {
		return;
	}
	var polls = request.jsonp.poll.s = request.jsonp.poll.s || {};
	polls[opt.base] = polls[opt.base] || setTimeout(function () {
		var msg = {
			base: opt.base,
			headers: { pull: 1 }
		};

		request.each(opt.headers, function (header, name) {
			msg.headers[name] = header;
		});

		request.jsonp(msg, function (err, reply) {
			delete polls[opt.base];

			var body = reply.body || [];
			while (body.length && body.shift) {
				var res = reply.body.shift();
				if (res && res.body) {
					request.createServer.ing(res, function () {
						request(opt.base, null, null, res);
					});
				}
			}
		});
	}, res.headers.poll);
};
request.jsonp.ify = function (opt, cb) {
	var uri = encodeURIComponent, query = '?';
	if (opt.url && opt.url.pathname) {
		query = opt.url.pathname + query;
	}
	query = opt.base + query;
	request.each((opt.url || {}).query, function (value, key) {
		query += (uri(key) + '=' + uri(value) + '&');
	});
	if (opt.headers) {
		query += uri('`') + '=' + uri(
			JSON.stringify(opt.headers)
		) + '&';
	}
	if (request.jsonp.max < query.length) {
		return cb();
	}
	var random = Math.floor(Math.random() * (0xffff + 1));
	query += (uri('jsonp') + '=' + uri(opt.jsonp = 'P' + random));
	if (opt.body) {
		query += '&';
		var w = opt.body, wls = function (w, l, s) {
			return uri('%') + '=' + uri(w+'-'+(l||w)+'/'+(s||w)) + '&' + uri('$') + '=';
		}
		if (typeof w != 'string') {
			w = JSON.stringify(w);
			query += uri('^') + '=' + uri('json') + '&';
		}
		w = uri(w);
		var i = 0, l = w.length
		, s = request.jsonp.max - (query.length + wls(l.toString()).length);
		if (s < 0){
			return cb();
		}
		while (w) {
			cb(query + wls(i, (i += s), l) + w.slice(0, i));
			w = w.slice(i);
		}
	} else {
		cb(query);
	}
};
request.jsonp.max = 2000;
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
module.exports = Client;
	