var Gun = require('../gun');

/*
	An Ad-Hoc Mesh-Network Daisy-Chain
	should work even if humans are
	communicating with each other blind.

	To prevent infinite broadcast loops,
	we use a deduplication process
	based on the message's identifier.
	This is currently implemented in core.

	However, because this still creates a
	N*2 (where N is the number of connections)
	flood, it is not scalable for traditional
	services that have a hub network topology.

	Does this mean we have to abandon mesh
	algorithms? No, we can simply layer more
	efficient optimizations in based on constraints.
	If these constraints exist, it automatically
	upgrades, but if not, it falls back to the
	brute-force mesh based robust algorithm.
	A simple example is to limit peer connections
	and rely upon daisy chaining to relay messages.

	Another example, is if peers are willing to
	identify themselves, then we can improve the
	efficiency of the network by having each peer
	include the names of peers it is connected in
	each message. Then each subsequent peer will
	not relay it to them, since it is unnecessary.
	This should create N (where N is the number of
	peers) messages (or possibly N+ if there is a
	common peer of uncommon peers that receives it
	and relays at exact latency timings), which is
	optimal.

	Since computer networks aren't actually blind,
	we will implement the above method to improve
	the performance of the ad-hoc mesh network.

	But why not have every message contain the
	whole history of peers that it relayed through?
	Because in sufficiently large enough networks,
	with extensive daisy chaining, this will cause
	the message to become prohibitively slow and
	increase indefinitely in size.

*/

var WebSocket = require('ws');

var url = require('url');

Gun.on('opt', function(ctx){
	var opt = ctx.opt;
	if(false === opt.ws){
		this.to.next(ctx);
		return;
	}

	opt.WebSocket = opt.WebSocket || WebSocket;
	var ws = opt.ws || {};
	ws.server = ws.server || opt.web;

	if(ws.server && !ws.web){

		ws.path = ws.path || '/gun';
		ws.web = new opt.WebSocket.Server(ws);
		ws.web.on('connection', function(wire){
			wire.upgradeReq = wire.upgradeReq || {};
			wire.url = url.parse(wire.upgradeReq.url||'', true);
			wire.id = wire.id || Gun.text.random(6);
			var peer = opt.peers[wire.id] = {id: wire.id, wire: wire};
			wire.peer = function(){ return peer };
			ctx.on('hi', peer);
			wire.on('message', function(msg){
				//console.log("MESSAGE", msg);
				opt.mesh.hear(msg.data || msg, peer);
			});
			wire.on('close', function(){
				ctx.on('bye', peer);
				Gun.obj.del(opt.peers, wire.id);
			});
			wire.on('error', function(e){});
		});
	}

	this.to.next(ctx);
});