
var Gun = require('../index');
Gun.Mesh = require('./mesh');

Gun.on('opt', function(root){
	this.to.next(root);
	var opt = root.opt;
	if(root.once){ return }
	if(false === opt.WebSocket){ return }

	var env;
	if(typeof window !== "undefined"){ env = window }
	if(typeof global !== "undefined"){ env = global }
	env = env || {};

	var websocket = opt.WebSocket || env.WebSocket || env.webkitWebSocket || env.mozWebSocket;
	if(!websocket){ return }
	opt.WebSocket = websocket;

	var mesh = opt.mesh = opt.mesh || Gun.Mesh(root);

	var wire = mesh.wire || opt.wire;
	mesh.wire = opt.wire = open;
	function open(peer){ try{
		if(!peer || !peer.url){ return wire && wire(peer) }
		var url = peer.url.replace('http', 'ws');
		var wire = peer.wire = new opt.WebSocket(url);
		wire.onclose = function(){
			opt.mesh.bye(peer);
			reconnect(peer);
		};
		wire.onerror = function(error){
			reconnect(peer);
		};
		wire.onopen = function(){
			opt.mesh.hi(peer);
		}
		wire.onmessage = function(msg){
			if(!msg){ return }
			opt.mesh.hear(msg.data || msg, peer);
		};
		return wire;
	}catch(e){}}

	setTimeout(function(){ root.on('out', {dam:'hi'}) },1); // it can take a while to open a socket, so maybe no longer lazy load for perf reasons?

	var wait = 2 * 1000;
	function reconnect(peer){
		clearTimeout(peer.defer);
		let retry = 60;
		if (peer.retry !== undefined) {
			retry = peer.retry;
		} else if (opt.retry !== undefined) {
			retry = opt.retry;
		}
		peer.retry = retry;
		if (doc && peer.retry <= 0) { return }
		peer.retry -= 1;
		peer.defer = setTimeout(function to(){
			if(doc && doc.hidden){ return setTimeout(to,wait) }
			open(peer);
		}, wait);
	}
	var doc = 'undefined' !== typeof document && document;
});
var noop = function(){};
	