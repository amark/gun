
var Gun = require('./index');
var websocket;
if(typeof WebSocket !== 'undefined'){
	websocket = WebSocket;
} else {
	if(typeof webkitWebSocket !== 'undefined'){
		websocket = webkitWebSocket;
	}
	if(typeof mozWebSocket !== 'undefined'){
		websocket = mozWebSocket;
	}
}

Gun.on('opt', function(root){
	this.to.next(root);
	var opt = root.opt;
	if(root.once){ return }
	if(!websocket || false === opt.WebSocket){ return }
	var ws = opt.ws || (opt.ws = {}); ws.who = 0;
	Gun.obj.map(opt.peers, function(){ ++ws.who });
	if(root.once){ return }
	var batch;

	root.on('out', function(at){
		this.to.next(at);
		if(at.ws && 1 == ws.who){ return } // performance hack for reducing echoes.
		batch = JSON.stringify(at);
		if(ws.drain){
			ws.drain.push(batch);
			return;
		}
		ws.drain = [];
		setTimeout(function(){
			if(!ws.drain){ return }
			var tmp = ws.drain;
			ws.drain = null;
			if(!tmp.length){ return }
			batch = JSON.stringify(tmp);
			Gun.obj.map(opt.peers, send, root);
		}, opt.wait || 1);
		Gun.obj.map(opt.peers, send, root);
	});
	function send(peer){
		var root = this, msg = batch;
		var wire = peer.wire || open(peer, root);
		if(!wire){ return }
		if(wire.readyState === wire.OPEN){
			wire.send(msg);
			return;
		}
		(peer.queue = peer.queue || []).push(msg);
	}
	function receive(msg, peer, root){
		if(!root || !msg){ return }
		try{msg = JSON.parse(msg.data || msg);
		}catch(e){}
		if(msg instanceof Array){
			var i = 0, m;
			while(m = msg[i++]){
				receive(m, peer, root);
			}
			return;
		}
		if(1 == ws.who){ msg.ws = noop } // If there is only 1 client, just use noop since it doesn't matter.
		root.on('in', msg);
	}
	function open(peer, as){
		if(!peer || !peer.url){ return }
		var url = peer.url.replace('http', 'ws');
		var wire = peer.wire = new websocket(url);
		wire.onclose = function(){
			root.on('bye', peer);
			reconnect(peer, as);
		};
		wire.onerror = function(error){
			reconnect(peer, as); // placement?
			if(!error){ return }
			if(error.code === 'ECONNREFUSED'){
				//reconnect(peer, as);
			}
		};
		wire.onopen = function(){
			root.on('hi', peer);
			var queue = peer.queue;
			peer.queue = [];
			Gun.obj.map(queue, function(msg){
				batch = msg;
				send.call(as, peer);
			});
		}
		wire.onmessage = function(msg){
			receive(msg, peer, as); // diff: peer not wire!
		};
		return wire;
	}
	function reconnect(peer, as){
		clearTimeout(peer.defer);
		peer.defer = setTimeout(function(){
			open(peer, as);
		}, 2 * 1000);
	}
});
var noop = function(){};
	