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
	Gun.log.once("AXE relay enabled!");
	var axe = root.axe = {}, tmp, id;
	var mesh = opt.mesh = opt.mesh || Gun.Mesh(root); // DAM!
	var dup = root.dup;

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
		GET.turn(msg, ref.route, 0);
	}
	GET.turn = function(msg, route, turn){
		var tmp = msg['#'], tag = dup.s[tmp], next;
		if(!tmp){ return }
		// Ideas: Save a random seed that sorts the route, store it and the index. // Or indexing on lowest latency is probably better.
		clearTimeout(tag.lack);
		if(tag.ack && (tmp = tag['##']) && msg['##'] === tmp){ return } // hashes match, stop asking other peers!
		next = (Object.maps(route||opt.peers)).slice(turn = turn || 0);
		if(!next.length){
			if(!route){ return } // asked all peers, stop asking!
			GET.turn(msg, u, 0); // asked all subs, now now ask any peers. (not always the best idea, but stays )
			return;
		}
		setTimeout.each(next, function(id){
			var peer = opt.peers[id]; turn++;
			if(!peer || !peer.wire){ route && route.delete(id); return } // bye!
			if(mesh.say(msg, peer) === false){ return } // was self
			if(0 == (turn % 3)){ return 1 }
		}, function(){
			tag['##'] = msg['##']; // should probably set this in a more clever manner, do live `in` checks ++ --, etc. but being lazy for now. // TODO: Yes, see `in` TODO, currently this might match against only in-mem cause no other peers reply, which is "fine", but could cause a false positive.
			tag.lack = setTimeout(function(){ GET.turn(msg, route, turn) }, 25);
		}, 3);
	}
	function fall(msg){ mesh.say(msg, opt.peers) }
	root.on('in', function(msg){ var tmp;
		if((tmp = msg['@']) && (tmp = dup.s[tmp])){
			tmp.ack = (tmp.ack || 0) + 1; // count remote ACKs to GET. // TODO: If mismatch, should trigger next asks.
		} 
		this.to.next(msg);
	});

	root.on('create', function(){
		var Q = {};
		root.on('put', function(msg){
			var eve = this, at = eve.as, put = msg.put, soul = put['#'], has = put['.'], val = put[':'], state = put['>'], id = msg['#'], tmp;
			eve.to.next(msg);
			if(msg['@']){ return } // acks send existing data, not updates, so no need to resend to others.
			if(!soul || !has){ return }
			var ref = root.$.get(soul)._, route = (ref||'').route;
			if(!route){ return }
			if(Q[soul+has]){ return; } (Q[soul+has] = setTimeout(function(){ delete Q[soul+has]; // TODO: add debounce here!? hmm, scope would need sub. // Q is a quick hack!
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
			}, 9));
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