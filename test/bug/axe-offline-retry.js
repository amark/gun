var assert = require('assert');
var fs = require('fs');
var vm = require('vm');

function loadAxe(navigator) {
	var events = {};
	var mesh = { hi: function(peer){ mesh.hiCalls.push(peer); } };
	mesh.hiCalls = [];

	function Gun() {}
	Gun.window = {
		GUN: Gun,
		localStorage: { peers: 'https://relay.example/gun' },
		location: { origin: 'https://app.example', search: '' },
		navigator: navigator
	};
	Gun.on = function(name, handler){ events[name] = handler; };
	Gun.log = { once: function(){} };
	Gun.Mesh = function(){ return mesh; };

	var context = {
		window: Gun.window,
		setTimeout: setTimeout,
		clearTimeout: clearTimeout,
		console: console,
		require: function(){ return Gun; },
		module: { exports: {} }
	};
	vm.runInNewContext(fs.readFileSync(__dirname + '/../../axe.js', 'utf8'), context);

	var root = {
		opt: { axe: true, peers: {}, localStorage: false },
		on: function(name, handler){ this.events[name] = handler; },
		events: {}
	};
	root.opt.peers['https://relay.example/gun'] = { id: 'https://relay.example/gun', url: 'https://relay.example/gun' };
	events.opt.call({ to: { next: function(){} } }, root);
	return { root: root, bye: root.events.bye, mesh: mesh };
}

describe('AXE offline retry guard', function(){
	it('does not treat a missing navigator.onLine as offline', function(){
		var loaded = loadAxe({});
		var peer = { id: 'peer-a', url: 'https://peer-a.example/gun', retry: 0 };
		loaded.bye.call({ to: { next: function(){} } }, peer);
		assert.strictEqual(peer.retry, 0);
		assert.strictEqual(loaded.mesh.hiCalls.length, 1);
	});

	it('keeps retry suppressed while explicitly offline', function(){
		var loaded = loadAxe({ onLine: false });
		var peer = { id: 'peer-b', url: 'https://peer-b.example/gun', retry: 0 };
		loaded.bye.call({ to: { next: function(){} } }, peer);
		assert.strictEqual(peer.retry, 1);
		assert.strictEqual(loaded.mesh.hiCalls.length, 0);
	});

	it('clears a stale offline retry when online again', function(){
		var loaded = loadAxe({ onLine: true });
		var peer = { id: 'peer-c', url: 'https://peer-c.example/gun', retry: 1 };
		loaded.bye.call({ to: { next: function(){} } }, peer);
		assert.strictEqual(peer.retry, 0);
		assert.strictEqual(loaded.mesh.hiCalls.length, 1);
	});
});
