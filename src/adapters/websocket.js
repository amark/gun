
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

	var wire = opt.wire;
	opt.wire = open;
	function open(peer){ try{
		if(!peer || !peer.url){ return wire && wire(peer) }
		var url = peer.url.replace('http', 'ws');
		var wire = peer.wire = new opt.WebSocket(url);
		wire.onclose = function(){
			opt.mesh.bye(peer);
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
			opt.mesh.hi(peer);
		}
		wire.onmessage = function(msg){
			if(!msg){ return }
			opt.mesh.hear(msg.data || msg, peer);
		};
		return wire;
	}catch(e){}}

	function reconnect(peer){
		clearTimeout(peer.defer);
		peer.defer = setTimeout(function(){
			open(peer);
		}, 2 * 1000);
	}
});
var noop = function(){};
	