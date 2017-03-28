
var Gun = require('./core');

if (typeof JSON === 'undefined') {
	throw new Error(
		'Gun depends on JSON. Please load it first:\n' +
		'ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js'
	);
}

var WebSocket;
if(typeof window !== 'undefined'){
	WebSocket = window.WebSocket || window.webkitWebSocket || window.mozWebSocket;
} else {
	return;
}
var message, count = 0, noop = function(){}, wait;

Gun.on('out', function(at){
	this.to.next(at);
	var cat = at.gun._.root._, wsp = cat.wsp || (cat.wsp = {});
	if(at.wsp && 1 === wsp.count){ return } // if the message came FROM the only peer we are connected to, don't echo it back.
	message = JSON.stringify(at);
	//if(++count){ console.log("msg OUT:", count, Gun.obj.ify(message)) }
	if(cat.udrain){
		cat.udrain.push(message);
		return;
	}
	cat.udrain = [];
	clearTimeout(wait);
	wait = setTimeout(function(){
		if(!cat.udrain){ return }
		var tmp = cat.udrain;
		cat.udrain = null;
		if( tmp.length ) {
			message = JSON.stringify(tmp);
			Gun.obj.map(cat.opt.peers, send, cat);
		}
	},1);
	wsp.count = 0;
	Gun.obj.map(cat.opt.peers, send, cat);
});

function send(peer){
	var msg = message, cat = this;
	var wire = peer.wire || open(peer, cat);
	if(cat.wsp){ cat.wsp.count++ }
	if(!wire){ return }
	if(wire.readyState === wire.OPEN){
		wire.send(msg);
		return;
	}
	(peer.queue = peer.queue || []).push(msg);
}

function receive(msg, peer, cat){
	if(!cat || !msg){ return }
	try{msg = JSON.parse(msg.data || msg);
	}catch(e){}
	if(msg instanceof Array){
		var i = 0, m;
		while(m = msg[i++]){
			receive(m, peer, cat);
		}
		return;
	}
	//if(++count){ console.log("msg in:", count, msg.body || msg) }
	if(cat.wsp && 1 === cat.wsp.count){ (msg.body || msg).wsp = noop } // If there is only 1 client, just use noop since it doesn't matter.
	cat.gun.on('in', msg.body || msg);
}

function open(peer, as){
	if(!peer || !peer.url){ return }
	var url = peer.url.replace('http', 'ws');
	var wire = peer.wire = new WebSocket(url, as.opt.wsc.protocols, as.opt.wsc );
	wire.onclose = function(){
		reconnect(peer, as);
	};
	wire.onerror = function(error){
		reconnect(peer, as);
		if(!error){ return }
		if(error.code === 'ECONNREFUSED'){
			//reconnect(peer, as);
		}
	};
	wire.onopen = function(){
		var queue = peer.queue;
		peer.queue = [];
		Gun.obj.map(queue, function(msg){
			message = msg;
			send.call(as, peer);
		});
	}
	wire.onmessage = function(msg){
		receive(msg, peer, as);
	};
	return wire;
}

function reconnect(peer, as){
	clearTimeout(peer.defer);
	peer.defer = setTimeout(function(){
		open(peer, as);
	}, 2 * 1000);
}
	