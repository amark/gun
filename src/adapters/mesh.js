
var Type = require('../type');

function Mesh(root){
	var mesh = function(){};
	var opt = root.opt || {};
	opt.log = opt.log || console.log;
	opt.gap = opt.gap || opt.wait || 0;
	opt.pack = opt.pack || (opt.memory? (opt.memory * 1000 * 1000) : 1399000000) * 0.3; // max_old_space_size defaults to 1400 MB.
	opt.puff = opt.puff || 9; // IDEA: do a start/end benchmark, divide ops/result.
	var puff = setTimeout.puff || setTimeout;

	var dup = root.dup, dup_check = dup.check, dup_track = dup.track;

	var hear = mesh.hear = function(raw, peer){
		if(!raw){ return }
		if(opt.pack <= raw.length){ return mesh.say({dam: '!', err: "Message too big!"}, peer) }
		var msg, id, hash, tmp = raw[0], DBG;
		if(mesh === this){ hear.d += raw.length||0 ; ++hear.c } // STATS!
		if('[' === tmp){
			try{msg = JSON.parse(raw)}catch(e){opt.log('DAM JSON parse error', e)}
			raw = '';
			if(!msg){ return }
			console.STAT && console.STAT(+new Date, msg.length, '# on hear batch');
			var P = opt.puff;
			(function go(){
				var S = +new Date;
				//var P = peer.puff || opt.puff, s = +new Date; // TODO: For future, but in mix?
				var i = 0, m; while(i < P && (m = msg[i++])){ hear(m, peer) }
				//peer.puff = Math.ceil((+new Date - s)? P * 1.1 : P * 0.9);
				msg = msg.slice(i); // slicing after is faster than shifting during.
				console.STAT && console.STAT(S, +new Date - S, 'hear loop');
				flush(peer); // force send all synchronously batched acks.
				if(!msg.length){ return }
				puff(go, 0);
			}());
			return;
		}
		if('{' === tmp || ((raw['#'] || obj_is(raw)) && (msg = raw))){
			try{msg = msg || JSON.parse(raw);
			}catch(e){return opt.log('DAM JSON parse error', e)}
			if(!msg){ return }
			if(msg.DBG){ msg.DBG = DBG = {DBG: msg.DBG} }
			DBG && (DBG.hp = +new Date);
			if(!(id = msg['#'])){ id = msg['#'] = Type.text.random(9) }
			if(tmp = dup_check(id)){ return }
			/*if(!(hash = msg['##']) && u !== msg.put){ hash = msg['##'] = Type.obj.hash(msg.put) }
			if(hash && (tmp = msg['@'] || (msg.get && id))){ // Reduces backward daisy in case varying hashes at different daisy depths are the same.
				if(dup.check(tmp+hash)){ return }
				dup.track(tmp+hash, true).it = it(msg); // GUN core also dedups, so `true` is needed. // Does GUN core need to dedup anymore?
			}
			if(tmp = msg['><']){ (msg._).to = Type.obj.map(tmp.split(','), tomap) }
			*/ // TOOD: COME BACK TO THIS LATER!!! IMPORTANT MESH STUFF!!
			(msg._ = function(){}).via = mesh.leap = peer;
			if(tmp = msg.dam){
				if(tmp = mesh.hear[tmp]){
					tmp(msg, peer, root);
				}
				dup_track(id);
				return;
			}
			var S = +new Date, ST;
			DBG && (DBG.is = S);
			root.on('in', msg);
			//ECHO = msg.put || ECHO; !(msg.ok !== -3740) && mesh.say({ok: -3740, put: ECHO, '@': msg['#']}, peer);
			DBG && (DBG.hd = +new Date);
			console.STAT && (ST = +new Date - S) > 9 && console.STAT(S, ST, 'msg'); // TODO: PERF: caught one > 1.5s on tgif
			dup_track(id).via = peer;
			mesh.leap = null; // warning! mesh.leap could be buggy.
		}
	}
	var tomap = function(k,i,m){m(k,true)};
	var noop = function(){};
	hear.c = hear.d = 0;

	;(function(){
		var SMIA = 0;
		var message, loop;
		function each(peer){ mesh.say(message, peer) }
		var say = mesh.say = function(msg, peer){
			if(this && this.to){ this.to.next(msg) } // compatible with middleware adapters.
			if(!msg){ return false }
			var id, hash, tmp, raw;
			var DBG = msg.DBG, S; if(!peer){ S = +new Date ; DBG && (DBG.y = S) }
			var meta = msg._||(msg._=function(){});
			if(!(id = msg['#'])){ id = msg['#'] = Type.text.random(9) }
			//if(!(hash = msg['##']) && u !== msg.put){ hash = msg['##'] = Type.obj.hash(msg.put) }
			if(!(raw = meta.raw)){
				raw = mesh.raw(msg);
				/*if(hash && (tmp = msg['@'])){
					dup.track(tmp+hash).it = it(msg);
					if(tmp = (dup.s[tmp]||ok).it){
						if(hash === tmp['##']){ return false }
						tmp['##'] = hash;
					}
				}*/
			}
			S && console.STAT && console.STAT(S, +new Date - S, 'say prep');
			!loop && dup_track(id);//.it = it(msg); // track for 9 seconds, default. Earth<->Mars would need more! // always track, maybe move this to the 'after' logic if we split function.
			//console.log("SEND!", JSON.parse(JSON.stringify(msg)));
			if(!peer && (tmp = msg['@'])){ peer = ((tmp = dup.s[tmp]) && (tmp.via || ((tmp = tmp.it) && (tmp = tmp._) && tmp.via))) || mesh.leap } // warning! mesh.leap could be buggy!
			if(!peer && msg['@']){
				console.STAT && console.STAT(+new Date, ++SMIA, 'total no peer to ack to');
				return false;
			} // TODO: Temporary? If ack via trace has been lost, acks will go to all peers, which trashes browser bandwidth. Not relaying the ack will force sender to ask for ack again. Note, this is technically wrong for mesh behavior.
			if(!peer && mesh.way){ return mesh.way(msg) }
			if(!peer || !peer.id){ message = msg;
				if(!Type.obj.is(peer || opt.peers)){ return false }
				var P = opt.puff, ps = opt.peers, pl = Object.keys(peer || opt.peers || {}); // TODO: BETTER PERF? No object.keys? It is polyfilled by Type.js tho.
				;(function go(){
					var S = +new Date;
					//Type.obj.map(peer || opt.peers, each); // in case peer is a peer list.
					loop = 1; var wr = meta.raw; meta.raw = raw; // quick perf hack
					var i = 0, p; while(i < 9 && (p = (pl||'')[i++])){
						if(!(p = ps[p])){ continue }
						say(msg, p);
					}
					meta.raw = wr; loop = 0;
					pl = pl.slice(i); // slicing after is faster than shifting during.
					console.STAT && console.STAT(S, +new Date - S, 'say loop');
					if(!pl.length){ return }
					puff(go, 0);
					dup_track(msg['@']); // keep for later
				}());
				return;
			}
			// TODO: PERF: consider splitting function here, so say loops do less work.
			if(!peer.wire && mesh.wire){ mesh.wire(peer) }
			if(id === peer.last){ return } peer.last = id;  // was it just sent?
			if(peer === meta.via){ return false } // don't send back to self.
			if((tmp = meta.to) && (tmp[peer.url] || tmp[peer.pid] || tmp[peer.id]) /*&& !o*/){ return false }
			if(peer.batch){
				peer.tail = (tmp = peer.tail || 0) + raw.length;
				if(peer.tail <= opt.pack){
					//peer.batch.push(raw);
					peer.batch += (tmp?',':'')+raw; // TODO: Prevent double JSON! // FOR v1.0 !?
					return;
				}
				flush(peer);
			}
			//peer.batch = [];
			peer.batch = '['; // TODO: Prevent double JSON!
			var S = +new Date, ST;
			setTimeout(function(){
				console.STAT && (ST = +new Date - S) > 9 && console.STAT(S, ST, '0ms TO', id, peer.id);
				flush(peer);
			}, opt.gap);
			send(raw, peer);
		}
		mesh.say.c = mesh.say.d = 0;
	}());

	function flush(peer){
		var tmp = peer.batch, t = 'string' == typeof tmp, l;
		if(t){ tmp += ']' }// TODO: Prevent double JSON!
		peer.batch = peer.tail = null;
		if(!tmp){ return }
		if(t? 3 > tmp.length : !tmp.length){ return } // TODO: ^
		if(!t){try{tmp = (1 === tmp.length? tmp[0] : JSON.stringify(tmp));
		}catch(e){return opt.log('DAM JSON stringify error', e)}}
		if(!tmp){ return }
		send(tmp, peer);
	}
	// for now - find better place later.
	function send(raw, peer){ try{
		var wire = peer.wire;
		if(peer.say){
			peer.say(raw);
		} else
		if(wire.send){
			wire.send(raw);
		}
		mesh.say.d += raw.length||0; ++mesh.say.c; // STATS!
	}catch(e){
		(peer.queue = peer.queue || []).push(raw);
	}}

	;(function(){
		// TODO: this caused a out-of-memory crash!
		mesh.raw = function(msg){ // TODO: Clean this up / delete it / move logic out!
			if(!msg){ return '' }
			var meta = (msg._) || {}, put, hash, tmp;
			if(tmp = meta.raw){ return tmp }
			if('string' == typeof msg){ return msg }
			/*if(!msg.dam){ // TOOD: COME BACK TO THIS LATER!!! IMPORTANT MESH STUFF!!
				var i = 0, to = []; Type.obj.map(opt.peers, function(p){
					to.push(p.url || p.pid || p.id); if(++i > 3){ return true } // limit server, fast fix, improve later! // For "tower" peer, MUST include 6 surrounding ids. // REDUCED THIS TO 3 for temporary relay peer performance, towers still should list neighbors.
				}); if(i > 1){ msg['><'] = to.join() }
			}*/  // TOOD: COME BACK TO THIS LATER!!! IMPORTANT MESH STUFF!!
			var raw = $(msg); // optimize by reusing put = the JSON.stringify from .hash?
			/*if(u !== put){
				tmp = raw.indexOf(_, raw.indexOf('put'));
				raw = raw.slice(0, tmp-1) + put + raw.slice(tmp + _.length + 1);
				//raw = raw.replace('"'+ _ +'"', put); // NEVER USE THIS! ALSO NEVER DELETE IT TO NOT MAKE SAME MISTAKE! https://github.com/amark/gun/wiki/@$$ Heisenbug
			}*/
			// TODO: PERF: tgif, CPU way too much on re-JSONifying ^ it.
			/*
				// NOTE TO SELF: Switch NTS to DAM now.
			*/
			if(meta && (raw||'').length < (1000 * 100)){ meta.raw = raw } // HNPERF: If string too big, don't keep in memory.
			return raw;
		}
		var $ = JSON.stringify, _ = ':])([:';

	}());

	mesh.hi = function(peer){
		var tmp = peer.wire || {};
		if(peer.id){
			opt.peers[peer.url || peer.id] = peer;
		} else {
			tmp = peer.id = peer.id || Type.text.random(9);
			mesh.say({dam: '?', pid: root.opt.pid}, opt.peers[tmp] = peer);
			delete dup.s[peer.last]; // IMPORTANT: see https://gun.eco/docs/DAM#self
		}
		peer.met = peer.met || +(new Date);
		if(!tmp.hied){ root.on(tmp.hied = 'hi', peer) }
		// @rogowski I need this here by default for now to fix go1dfish's bug
		tmp = peer.queue; peer.queue = [];
		Type.obj.map(tmp, function(msg){
			send(msg, peer);
		});
		Type.obj.native && Type.obj.native(); // dirty place to check if other JS polluted.
	}
	mesh.bye = function(peer){
		root.on('bye', peer);
		var tmp = +(new Date); tmp = (tmp - (peer.met||tmp));
		mesh.bye.time = ((mesh.bye.time || tmp) + tmp) / 2;
	}
	mesh.hear['!'] = function(msg, peer){ opt.log('Error:', msg.err) }
	mesh.hear['?'] = function(msg, peer){
		if(msg.pid){
			if(!peer.pid){ peer.pid = msg.pid }
			if(msg['@']){ return }
		}
		mesh.say({dam: '?', pid: opt.pid, '@': msg['#']}, peer);
		delete dup.s[peer.last]; // IMPORTANT: see https://gun.eco/docs/DAM#self
	}

	root.on('create', function(root){
		root.opt.pid = root.opt.pid || Type.text.random(9);
		this.to.next(root);
		root.on('out', mesh.say);
	});

	root.on('bye', function(peer, tmp){
		peer = opt.peers[peer.id || peer] || peer;
		this.to.next(peer);
		peer.bye? peer.bye() : (tmp = peer.wire) && tmp.close && tmp.close();
		Type.obj.del(opt.peers, peer.id);
		peer.wire = null;
	});

	var gets = {};
	root.on('bye', function(peer, tmp){ this.to.next(peer);
		if(!(tmp = peer.url)){ return } gets[tmp] = true;
		setTimeout(function(){ delete gets[tmp] },opt.lack || 9000);
	});
	root.on('hi', function(peer, tmp){ this.to.next(peer);
		if(!(tmp = peer.url) || !gets[tmp]){ return } delete gets[tmp];
		if(opt.super){ return } // temporary (?) until we have better fix/solution?
		Type.obj.map(root.next, function(node, soul){
			tmp = {}; tmp[soul] = root.graph[soul];
			mesh.say({'##': Type.obj.hash(tmp), get: {'#': soul}}, peer);
		})
	});

	return mesh;
}

;(function(){
	var $ = JSON.stringify, u;

	Type.obj.hash = function(obj, hash){
		if(!hash && u === (obj = $(obj, sort))){ return }
		return Type.text.hash(hash || obj || '');
	}

	function sort(k, v){ var tmp;
		if(!(v instanceof Object)){ return v }
		var S = +new Date;
		Type.obj.map(Object.keys(v).sort(), map, {to: tmp = {}, on: v});
		console.STAT && console.STAT(S, +new Date - S, 'sort');
		return tmp;
	}
	Type.obj.hash.sort = sort;

	function map(k){
		this.to[k] = this.on[k];
	}
}());

function it(msg){ return msg || {_: msg._, '##': msg['##']} } // HNPERF: Only need some meta data, not full reference (took up too much memory). // HNPERF: Garrrgh! We add meta data to msg over time, copying the object happens to early.

	  var empty = {}, ok = true, u;
var obj_is = Type.obj.is, obj_map = Type.obj.map;

	  try{ module.exports = Mesh }catch(e){}

	