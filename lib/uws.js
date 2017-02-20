var Gun = require('gun/gun');

var WebSocket = require('uws');

var url = require('url');

var con;

Gun.on('opt', function(at){
	this.to.next(at);
	if(at.once){ return }
	var opt = at.opt.uws || at.opt.ws || (at.opt.uws = {});
	var cat = at.gun.back(-1)._;

	opt.server = new WebSocket.Server(opt || {port: 8080});
	var peers = cat.opt.peers;

	console.log("????", opt.server);
	opt.server.on('connection', function(ws){
		ws.upgradeReq = ws.upgradeReq || {};
		ws.url = url.parse(ws.upgradeReq.url||'', true);
		ws.id = ws.id || Gun.text.random(6);
		peers[ws.id] = {wire: ws};
		ws.on('message', function(msg){
			console.log("MESSAGE", msg);
			receive(msg, ws, cat);
		});
		ws.on('close', function(){
			Gun.obj.del(peers, ws.id);
		});
	});
});

function receive(msg, wire, cat){
	if(!cat){ return }
	try{msg = JSON.parse(msg);
		msg.url = wire.url;
	}catch(e){}
	cat.gun.on('in', msg.body || msg);
}

var message;
Gun.on('out', function(at){
	this.to.next(at);
	var cat = at.gun._.root._;
	message = JSON.stringify({body: at, headers: {}});
	Gun.obj.map(cat.opt.peers, send, cat);
});

function send(peer){
	var msg = message, cat = this;
	var wire = peer.wire || open(peer, cat);
	if(!wire){ return }
	if(wire.readyState === wire.OPEN){
		wire.send(msg);
		return;
	}
	(peer.queue = peer.queue || []).push(msg);
}

function open(peer, as){
	if(!peer || !peer.url){ return }
	var url = peer.url.replace('http', 'ws');
	var wire = peer.wire = new WebSocket(url);
	wire.on('close', function(){
		reconnect(peer, as);
	});
	wire.on('error', function(error){
		if(error.code === 'ECONNREFUSED'){
			reconnect(peer, as);
		}
	});
	wire.on('open', function(){
		var queue = peer.queue;
		peer.queue = [];
		Gun.obj.map(queue, function(msg){
			message = msg;
			send.call(as, peer);
		});
	});
	wire.on('message', function(msg){
		receive(msg, wire, as);
	});
	return wire;
}

function reconnect(peer, as){
	clearTimeout(peer.defer);
	peer.defer = setTimeout(function(){
		open(peer, as);
	}, 2 * 1000);
}