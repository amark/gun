
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
	root.on('create', function(at){
		this.to.next(at);
		root.on('out', mesh.out);
	});

	opt.wire = opt.wire || open;
	function open(peer){
		if(!peer || !peer.url){ return }
		var url = peer.url.replace('http', 'ws');
		var wire = peer.wire = new opt.WebSocket(url);
		wire.onclose = function(){
			root.on('bye', peer);
			reconnect(peer);
		};
		wire.onerror = function(error){
			reconnect(peer); // placement?
			if(!error){ return }
			if(error.code === 'ECONNREFUSED'){
				//reconnect(peer, as);
			}
		};
		wire.onopen = function(){
			mesh.hi(peer);
		}
		wire.onmessage = function(msg){
			if(!msg){ return }
			env.inLength = (env.inLength || 0) + (msg.data || msg).length; // TEMPORARY, NON-STANDARD, FOR DEBUG
			mesh.hear(msg.data || msg, peer);
		};
		return wire;
	}

	function reconnect(peer){
		clearTimeout(peer.defer);
		peer.defer = setTimeout(function(){
			open(peer);
		}, 2 * 1000);
	}
});
var noop = function(){};
	