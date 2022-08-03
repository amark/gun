// I don't quite know where this should go yet, so putting it here
// what will probably wind up happening is that minimal AXE logic added to end of gun.js
// and then rest of AXE logic (here) will be moved back to gun/axe.js
// but for now... I gotta rush this out!
var Gun = (typeof window !== "undefined")? window.Gun : require('../gun'), u;
Gun.on('opt', function(at){ start(at); this.to.next(at) }); // make sure to call the "next" middleware adapter.
// TODO: BUG: panic test/panic/1 & test/panic/3 fail when AXE is on.
function start(root){
	if(root.axe){ return }
	var opt = root.opt, peers = opt.peers;
	if(false === opt.axe){ return }
	if((typeof process !== "undefined") && 'false' === ''+(process.env||'').AXE){ return }
	Gun.log.once("AXE", "AXE relay enabled!");
	var axe = root.axe = {}, tmp, id;
	var mesh = opt.mesh = opt.mesh || Gun.Mesh(root); // DAM!
	var dup = root.dup;

	mesh.way = function(msg){
		if(!msg){ return }
		relayUp(msg); // TEMPORARY!!!
		if(msg.get){ return GET(msg) }
		if(msg.put){ return }
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
		if(!tmp || !tag){ return } // message timed out, GUN may require us to relay, tho AXE does not like that. Rethink?
		// TOOD: BUG! Handle edge case where live updates occur while these turn hashes are being checked (they'll never be consistent), but we don't want to degrade to O(N), if we know the via asking peer got an update, then we should do something like cancel these turns asking for data.
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
	
	root.on('in', function(msg){ var to = this.to, tmp;
		if((tmp = msg['@']) && (tmp = dup.s[tmp])){
			tmp.ack = (tmp.ack || 0) + 1; // count remote ACKs to GET. // TODO: If mismatch, should trigger next asks.
			if((tmp = tmp.back)){ // backtrack OKs since AXE splits PUTs up.
				setTimeout.each(Object.keys(tmp), function(id){
					to.next({'#': msg['#'], '@': id, ok: msg.ok});
				});
				return;
			}
		}
		to.next(msg);
	});

	root.on('create', function(){
		var Q = {};
		root.on('put', function(msg){
			var eve = this, at = eve.as, put = msg.put, soul = put['#'], has = put['.'], val = put[':'], state = put['>'], q, tmp;
			eve.to.next(msg);
			if(msg['@']){ return } // acks send existing data, not updates, so no need to resend to others.
			if(!soul || !has){ return }
			var ref = root.$.get(soul)._, route = (ref||'').route;
			//'test' === soul && console.log(Object.port, ''+msg['#'], has, val, route && route.keys());
			if(!route){ return }
			if(ref.skip){ ref.skip.now = msg['#']; return }
			(ref.skip = {now: msg['#']}).to = setTimeout(function(){
			setTimeout.each(Object.maps(route), function(pid){ var peer, tmp;
				var skip = ref.skip||''; ref.skip = null;
				if(!(peer = route.get(pid))){ return }
				if(!peer.wire){ route.delete(pid); return } // bye!
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
				tmp = dup.track(peer.next = peer.next || String.random(9));
				(tmp.back || (tmp.back = {}))[''+skip.now||msg['#']] = 1;
				if(peer.to){ return }
				peer.to = setTimeout(function(){ flush(peer) }, opt.gap);
			}) }, 9);
		});
	});

	function flush(peer){
		var msg = {'#': peer.next, put: peer.put, ok: {'@': 3, '/': mesh.near}}; // BUG: TODO: sub count!
		// TODO: what about DAM's >< dedup? Current thinking is, don't use it, however, you could store first msg# & latest msg#, and if here... latest === first then likely it is the same >< thing, so if(firstMsg['><'][peer.id]){ return } don't send.
		peer.next = peer.put = peer.to = null;
		mesh.say(msg, peer);
	}
	var state_ify = Gun.state.ify, state_is = Gun.state.is;

	function relayUp(msg){
		mesh.say(msg, axe.up);
	}

	;(function(){ // THIS IS THE UP MODULE;
		axe.up = {};
		var hi = mesh.hear['?']; // lower-level integration with DAM! This is abnormal but helps performance.
		mesh.hear['?'] = function(msg, peer){ var p; // deduplicate unnecessary connections:
			hi(msg, peer);
			if(!peer.pid){ return }
			if(peer.pid === opt.pid){ mesh.bye(peer); return } // if I connected to myself, drop.
			if(p = axe.up[peer.pid]){ // if we both connected to each other...
				if(p === peer){ return } // do nothing if no conflict,
				if(opt.pid > peer.pid){ // else deterministically sort
					p = peer; // so we will wind up choosing the same to keep
					peer = axe.up[p.pid]; // and the same to drop.
				}
				p.url = p.url || peer.url; // copy if not
				mesh.bye(peer); // drop
				axe.up[p.pid] = p; // update same to be same.
				return;
			}
			if(!peer.url){ return }
			axe.up[peer.pid] = peer;
			if(axe.stay){ axe.stay() }
		};

		mesh.hear['opt'] = function(msg, peer){
			if(msg.ok){ return }
			var tmp = msg.opt;
			if(!tmp){ return }
			tmp = tmp.peers;
			if(!tmp || 'string' != typeof tmp){ return }
			if(99 <= Object.keys(axe.up).length){ return } // 99 TEMPORARILY UNTIL BENCHMARKED!
			mesh.hi({id: tmp, url: tmp, retry: 9});
			if(peer){ mesh.say({dam: 'opt', ok: 1, '@': msg['#']}, peer) }
		}

		axe.stay = function(){
			clearTimeout(axe.stay.to);
			axe.stay.to = setTimeout(function(tmp, urls){
				if(!(tmp = root.stats && root.stats.stay)){ return }
				urls = {}; Object.keys(axe.up||'').forEach(function(p){
					p = (axe.up||'')[p]; if(p.url){ urls[p.url] = {} }
				});
				(tmp.axe = tmp.axe || {}).up = urls;
			}, 1000 * 9);//1000 * 60);
		};
		setTimeout(function(tmp){
			if(!(tmp = root.stats && root.stats.stay && root.stats.stay.axe)){ return }
			if(!(tmp = tmp.up)){ return }
			if(!(tmp instanceof Array)){ tmp = Object.keys(tmp) }
			setTimeout.each(tmp||[], function(url){ mesh.hear.opt({opt: {peers: url}}) });
		},1000);
	}());

	;(function(){ // THIS IS THE MOB MODULE;
		//return; // WORK IN PROGRESS, TEST FINALIZED, NEED TO MAKE STABLE.
		/*
			AXE should have a couple of threshold items...
			let's pretend there is a variable max peers connected
			mob = 10000
			if we get more peers than that...
			we should start sending those peers a remote command
			that they should connect to this or that other peer
			and then once they (or before they do?) drop them from us.
			sake of the test... gonna set that peer number to 1.
			The mob threshold might be determined by other factors,
			like how much RAM or CPU stress we have.
		*/
		opt.mob = opt.mob || 9900; // should be based on ulimit, some clouds as low as 10K.

		// handle rebalancing a mob of peers:
		root.on('hi', function(peer){
			this.to.next(peer);
			if(peer.url){ return } // I am assuming that if we are wanting to make an outbound connection to them, that we don't ever want to drop them unless our actual config settings change.
			var count = /*Object.keys(opt.peers).length ||*/ mesh.near; // TODO: BUG! This is slow, use .near, but near is buggy right now, fix in DAM.
			//console.log("are we mobbed?", opt.mob, Object.keys(opt.peers).length, mesh.near);
			if(opt.mob >= count){ return }  // TODO: Make dynamic based on RAM/CPU also. Or possibly even weird stuff like opt.mob / axe.up length?
			var peers = {};Object.keys(axe.up).forEach(function(p){ p = axe.up[p]; p.url && (peers[p.url]={}) });
			// TODO: BUG!!! Infinite reconnection loop happens if not enough relays, or if some are missing. For instance, :8766 says to connect to :8767 which then says to connect to :8766. To not DDoS when system overload, figure clever way to tell peers to retry later, that network does not have enough capacity?
			mesh.say({dam: 'mob', mob: count, peers: peers}, peer);
			setTimeout(function(){ mesh.bye(peer) }, 9); // something with better perf?
		});
		root.on('bye', function(peer){
			this.to.next(peer);
		});

	}());
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
