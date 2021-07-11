// I don't quite know where this should go yet, so putting it here
// what will probably wind up happening is that minimal AXE logic added to end of gun.js
// and then rest of AXE logic (here) will be moved back to gun/axe.js
// but for now... I gotta rush this out!
var Gun = (typeof window !== "undefined")? window.Gun : require('../gun'), u;
Gun.on('opt', function(at){ start(at) ; this.to.next(at) }); // make sure to call the "next" middleware adapter.

function start(root){
	if(root.axe){ return }
	var opt = root.opt, peers = opt.peers;
	if(false === opt.axe){ return }
	if((typeof process !== "undefined") && 'false' === ''+(process.env||'').AXE){ return }
	console.log("AXE relay enabled!");
	var axe = root.axe = {}, tmp, id;
	var mesh = opt.mesh = opt.mesh || Gun.Mesh(root); // DAM!
	mesh.way = function(msg){
		if(!msg){ return }
		if(msg.get){ return GET(msg) }
		if(msg.put){ return } // relaying handled by HAM aggregation, no message forwarding!
		fall(msg);
	}
	function GET(msg){
		if(!msg){ return }
		var via = (msg._||'').via, soul, has, tmp, ref;
		if(!via || !via.id){ return fall(msg) }
		var sub = (via.sub || (via.sub = new Object.Map));
		if('string' == typeof (soul = msg.get['#'])){ ref = root.$.get(soul) }
		if('string' == typeof (tmp = msg.get['.'])){ has = tmp } else { has = '' }
		ref && (sub.get(soul) || (sub.set(soul, tmp = new Object.Map) && tmp)).set(has, 1); // {soul: {'':1, has: 1}}
		if(!(ref = (ref||'')._)){ return fall(msg) }
		ref.asked = +new Date;
		(ref.route || (ref.route = new Object.Map)).set(via.id, via); // this approach is not gonna scale how I want it to, but try for now.
		var c = 0, route = ref.route;
		setTimeout.each(Object.maps(route), function(id){ var peer;
			if(!(peer = route.get(id))){ return }
			if(!peer.wire){ route.delete(id); return } // bye!
			if(!mesh.say(msg, peer)){ return } // self
			c++;
		}, function(){
			if(c){ return }
			mesh.say(msg, opt.peers);
		});
	}
	function fall(msg){ mesh.say(msg, opt.peers) }
	
	root.on('create', function(){
		root.on('put', function(msg){
			var eve = this, at = eve.as, put = msg.put, soul = put['#'], has = put['.'], val = put[':'], state = put['>'], id = msg['#'], tmp;
			eve.to.next(msg);
			if(!soul || !has){ return }
			var ref = root.$.get(soul)._, route = (ref||'').route;
			if(!route){ return }
			setTimeout.each(Object.maps(route), function(id){ var peer, tmp;
				if(!(peer = route.get(id))){ return }
				if(!peer.wire){ route.delete(id); return } // bye!
				var sub = (peer.sub || (peer.sub = new Object.Map)).get(soul);
				if(!sub){ return }
				if(!sub.get(has) && !sub.get('')){ return }
				var put = peer.put || (peer.put = {});
				var node = root.graph[soul], tmp;
				if(node && u !== (tmp = node[has])){
					state = state_is(node, has);
					val = tmp;
				}
				put[soul] = state_ify(put[soul], has, state, val, soul);
				if(peer.to){ return }
				peer.to = setTimeout(function(){ flush(peer) }, opt.gap);
			});
		});
	});
	function flush(peer){
		var msg = {put: peer.put};
		peer.put = peer.to = null;
		mesh.say(msg, peer);
	}
	var state_ify = Gun.state.ify, state_is = Gun.state.is;
}

;(function(){
	var from = Array.from;
	Object.maps = function(o){
		if(from && o instanceof Map){ return from(o.keys()) }
		if(o instanceof Object.Map){ o = o.s }
		return Object.keys(o);
	}
	if(from){ return Object.Map = Map }
	(Object.Map = function(){ this.s = {} }).prototype = {set:function(k,v){this.s[k]=v;return this},get:function(k){return this.s[k]},delete:function(k){delete this.s[k]}};
}());