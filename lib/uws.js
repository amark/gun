var Gun = require('../gun');

var WebSocket = require('uws');

var url = require('url');

console.log("Experimental high performance uWS server is being used.");

Gun.on('opt', function mount(at){
	this.to.next(at);
	if(at.once){ return }
	var opt = at.opt.uws || at.opt.ws || (at.opt.uws = {});
	var cat = (at.gun.back(-1)._);

	opt.server = opt.server || at.opt.web;
	opt.path = opt.path || at.opt.path || '/gun';

	opt.web = new WebSocket.Server(opt);
	var peers = cat.opt.peers;

	opt.web.on('connection', function(ws){
		ws.upgradeReq = ws.upgradeReq || {};
		ws.url = url.parse(ws.upgradeReq.url||'', true);
		ws.id = ws.id || Gun.text.random(6);
		peers[ws.id] = {wire: ws};
		ws.on('message', function(msg){
			//console.log("MESSAGE", msg);
			receive(msg, ws, cat);
		});
		ws.on('close', function(){
			Gun.obj.del(peers, ws.id);
		});
	});
});

var message;

Gun.on('out', function(at){
	this.to.next(at);
	var cat = at.gun._.root._;
	message = JSON.stringify(at);
	if(cat.udrain){
		cat.udrain.push(message);
		return;
	}
	cat.udrain = [];
	setTimeout(function(){
		if(!cat.udrain){ return }
		//if(count += cat.udrain.length){ console.log("msg out:", count) }
		var tmp = cat.udrain;
		cat.udrain = null;
		message = JSON.stringify(tmp);
		Gun.obj.map(cat.opt.peers, send, cat);
	},1);
	Gun.obj.map(cat.opt.peers, send, cat);
});

var count = 0;
function receive(msg, wire, cat){
	if(!cat){ return }
	try{msg = JSON.parse(msg);
	}catch(e){}

	if(msg instanceof Array){
		var i = 0, m; while(m = msg[i++]){
			receive(m, wire, cat);
		}
		return;
	}
	//if(++count){ console.log("msg in:", count) }

	//msg.url = wire.url;
	cat.gun.on('in', msg.body || msg);
}

// EVERY message taken care of. The "extra" ones are from in-memory not having "asked" for it yet - which we won't want it to do for foreign requests. Likewise, lots of chattyness because the put/ack replies happen before the `get` syncs so everybody now has it in-memory already to reply with.
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
		if(!error){ return }
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
