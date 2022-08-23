
require('./shim');

var noop = function(){}
var parse = JSON.parseAsync || function(t,cb,r){ var u, d = +new Date; try{ cb(u, JSON.parse(t,r), json.sucks(+new Date - d)) }catch(e){ cb(e) } }
var json = JSON.stringifyAsync || function(v,cb,r,s){ var u, d = +new Date; try{ cb(u, JSON.stringify(v,r,s), json.sucks(+new Date - d)) }catch(e){ cb(e) } }
json.sucks = function(d){ if(d > 99){ console.log("Warning: JSON blocking CPU detected. Add `gun/lib/yson.js` to fix."); json.sucks = noop } }

function Mesh(root){
	var mesh = function(){};
	var opt = root.opt || {};
	opt.log = opt.log || console.log;
	opt.gap = opt.gap || opt.wait || 0;
	opt.max = opt.max || (opt.memory? (opt.memory * 999 * 999) : 300000000) * 0.3;
	opt.pack = opt.pack || (opt.max * 0.01 * 0.01);
	opt.puff = opt.puff || 9; // IDEA: do a start/end benchmark, divide ops/result.
	var puff = setTimeout.turn || setTimeout;

	var dup = root.dup, dup_check = dup.check, dup_track = dup.track;

	var ST = +new Date, LT = ST;

	var hear = mesh.hear = function(raw, peer){
		if(!raw){ return }
		if(opt.max <= raw.length){ return mesh.say({dam: '!', err: "Message too big!"}, peer) }
		if(mesh === this){
			/*if('string' == typeof raw){ try{
				var stat = console.STAT || {};
				//console.log('HEAR:', peer.id, (raw||'').slice(0,250), ((raw||'').length / 1024 / 1024).toFixed(4));
				
				//console.log(setTimeout.turn.s.length, 'stacks', parseFloat((-(LT - (LT = +new Date))/1000).toFixed(3)), 'sec', parseFloat(((LT-ST)/1000 / 60).toFixed(1)), 'up', stat.peers||0, 'peers', stat.has||0, 'has', stat.memhused||0, stat.memused||0, stat.memax||0, 'heap mem max');
			}catch(e){ console.log('DBG err', e) }}*/
			hear.d += raw.length||0 ; ++hear.c } // STATS!
		var S = peer.SH = +new Date;
		var tmp = raw[0], msg;
		//raw && raw.slice && console.log("hear:", ((peer.wire||'').headers||'').origin, raw.length, raw.slice && raw.slice(0,50)); //tc-iamunique-tc-package-ds1
		if('[' === tmp){
			parse(raw, function(err, msg){
				if(err || !msg){ return mesh.say({dam: '!', err: "DAM JSON parse error."}, peer) }
				console.STAT && console.STAT(+new Date, msg.length, '# on hear batch');
				var P = opt.puff;
				(function go(){
					var S = +new Date;
					var i = 0, m; while(i < P && (m = msg[i++])){ mesh.hear(m, peer) }
					msg = msg.slice(i); // slicing after is faster than shifting during.
					console.STAT && console.STAT(S, +new Date - S, 'hear loop');
					flush(peer); // force send all synchronously batched acks.
					if(!msg.length){ return }
					puff(go, 0);
				}());
			});
			raw = ''; // 
			return;
		}
		if('{' === tmp || ((raw['#'] || Object.plain(raw)) && (msg = raw))){
			if(msg){ return hear.one(msg, peer, S) }
			parse(raw, function(err, msg){
				if(err || !msg){ return mesh.say({dam: '!', err: "DAM JSON parse error."}, peer) }
				hear.one(msg, peer, S);
			});
			return;
		}
	}
	hear.one = function(msg, peer, S){ // S here is temporary! Undo.
		var id, hash, tmp, ash, DBG;
		if(msg.DBG){ msg.DBG = DBG = {DBG: msg.DBG} }
		DBG && (DBG.h = S);
		DBG && (DBG.hp = +new Date);
		if(!(id = msg['#'])){ id = msg['#'] = String.random(9) }
		if(tmp = dup_check(id)){ return }
		// DAM logic:
		if(!(hash = msg['##']) && false && u !== msg.put){ /*hash = msg['##'] = Type.obj.hash(msg.put)*/ } // disable hashing for now // TODO: impose warning/penalty instead (?)
		if(hash && (tmp = msg['@'] || (msg.get && id)) && dup.check(ash = tmp+hash)){ return } // Imagine A <-> B <=> (C & D), C & D reply with same ACK but have different IDs, B can use hash to dedup. Or if a GET has a hash already, we shouldn't ACK if same.
		(msg._ = function(){}).via = mesh.leap = peer;
		if((tmp = msg['><']) && 'string' == typeof tmp){ tmp.slice(0,99).split(',').forEach(function(k){ this[k] = 1 }, (msg._).yo = {}) } // Peers already sent to, do not resend.
		// DAM ^
		if(tmp = msg.dam){
			if(tmp = mesh.hear[tmp]){
				tmp(msg, peer, root);
			}
			dup_track(id);
			return;
		}
		if(tmp = msg.ok){ msg._.near = tmp['/'] }
		var S = +new Date;
		DBG && (DBG.is = S); peer.SI = id;
		root.on('in', mesh.last = msg);
		//ECHO = msg.put || ECHO; !(msg.ok !== -3740) && mesh.say({ok: -3740, put: ECHO, '@': msg['#']}, peer);
		DBG && (DBG.hd = +new Date);
		console.STAT && console.STAT(S, +new Date - S, msg.get? 'msg get' : msg.put? 'msg put' : 'msg');
		(tmp = dup_track(id)).via = peer; // don't dedup message ID till after, cause GUN has internal dedup check.
		if(msg.get){ tmp.it = msg }
		if(ash){ dup_track(ash) } //dup.track(tmp+hash, true).it = it(msg);
		mesh.leap = mesh.last = null; // warning! mesh.leap could be buggy.
	}
	var tomap = function(k,i,m){m(k,true)};
	hear.c = hear.d = 0;

	;(function(){
		var SMIA = 0;
		var loop;
		mesh.hash = function(msg, peer){ var h, s, t;
			var S = +new Date;
			json(msg.put, function hash(err, text){
				var ss = (s || (s = t = text||'')).slice(0, 32768); // 1024 * 32
			  h = String.hash(ss, h); s = s.slice(32768);
			  if(s){ puff(hash, 0); return }
				console.STAT && console.STAT(S, +new Date - S, 'say json+hash');
			  msg._.$put = t;
			  msg['##'] = h;
			  mesh.say(msg, peer);
			  delete msg._.$put;
			}, sort);
		}
		function sort(k, v){ var tmp;
			if(!(v instanceof Object)){ return v }
			Object.keys(v).sort().forEach(sorta, {to: tmp = {}, on: v});
			return tmp;
		} function sorta(k){ this.to[k] = this.on[k] }

		var say = mesh.say = function(msg, peer){ var tmp;
			if((tmp = this) && (tmp = tmp.to) && tmp.next){ tmp.next(msg) } // compatible with middleware adapters.
			if(!msg){ return false }
			var id, hash, raw, ack = msg['@'];
//if(opt.super && (!ack || !msg.put)){ return } // TODO: MANHATTAN STUB //OBVIOUSLY BUG! But squelch relay. // :( get only is 100%+ CPU usage :(
			var meta = msg._||(msg._=function(){});
			var DBG = msg.DBG, S = +new Date; meta.y = meta.y || S; if(!peer){ DBG && (DBG.y = S) }
			if(!(id = msg['#'])){ id = msg['#'] = String.random(9) }
			!loop && dup_track(id);//.it = it(msg); // track for 9 seconds, default. Earth<->Mars would need more! // always track, maybe move this to the 'after' logic if we split function.
			//if(msg.put && (msg.err || (dup.s[id]||'').err)){ return false } // TODO: in theory we should not be able to stun a message, but for now going to check if it can help network performance preventing invalid data to relay.
			if(!(hash = msg['##']) && u !== msg.put && !meta.via && ack){ mesh.hash(msg, peer); return } // TODO: Should broadcasts be hashed?
			if(!peer && ack){ peer = ((tmp = dup.s[ack]) && (tmp.via || ((tmp = tmp.it) && (tmp = tmp._) && tmp.via))) || ((tmp = mesh.last) && ack === tmp['#'] && mesh.leap) } // warning! mesh.leap could be buggy! mesh last check reduces this.
			if(!peer && ack){ // still no peer, then ack daisy chain 'tunnel' got lost.
				if(dup.s[ack]){ return } // in dups but no peer hints that this was ack to ourself, ignore.
				console.STAT && console.STAT(+new Date, ++SMIA, 'total no peer to ack to'); // TODO: Delete this now. Dropping lost ACKs is protocol fine now.
				return false;
			} // TODO: Temporary? If ack via trace has been lost, acks will go to all peers, which trashes browser bandwidth. Not relaying the ack will force sender to ask for ack again. Note, this is technically wrong for mesh behavior.
			if(!peer && mesh.way){ return mesh.way(msg) }
			DBG && (DBG.yh = +new Date);
			if(!(raw = meta.raw)){ mesh.raw(msg, peer); return }
			DBG && (DBG.yr = +new Date);
			if(!peer || !peer.id){
				if(!Object.plain(peer || opt.peers)){ return false }
				var S = +new Date;
				var P = opt.puff, ps = opt.peers, pl = Object.keys(peer || opt.peers || {}); // TODO: .keys( is slow
				console.STAT && console.STAT(S, +new Date - S, 'peer keys');
				;(function go(){
					var S = +new Date;
					//Type.obj.map(peer || opt.peers, each); // in case peer is a peer list.
					loop = 1; var wr = meta.raw; meta.raw = raw; // quick perf hack
					var i = 0, p; while(i < 9 && (p = (pl||'')[i++])){
						if(!(p = ps[p] || (peer||'')[p])){ continue }
						mesh.say(msg, p);
					}
					meta.raw = wr; loop = 0;
					pl = pl.slice(i); // slicing after is faster than shifting during.
					console.STAT && console.STAT(S, +new Date - S, 'say loop');
					if(!pl.length){ return }
					puff(go, 0);
					ack && dup_track(ack); // keep for later
				}());
				return;
			}
			// TODO: PERF: consider splitting function here, so say loops do less work.
			if(!peer.wire && mesh.wire){ mesh.wire(peer) }
			if(id === peer.last){ return } peer.last = id;  // was it just sent?
			if(peer === meta.via){ return false } // don't send back to self.
			if((tmp = meta.yo) && (tmp[peer.url] || tmp[peer.pid] || tmp[peer.id]) /*&& !o*/){ return false }
			console.STAT && console.STAT(S, ((DBG||meta).yp = +new Date) - (meta.y || S), 'say prep');
			!loop && ack && dup_track(ack); // streaming long responses needs to keep alive the ack.
			if(peer.batch){
				peer.tail = (tmp = peer.tail || 0) + raw.length;
				if(peer.tail <= opt.pack){
					peer.batch += (tmp?',':'')+raw;
					return;
				}
				flush(peer);
			}
			peer.batch = '['; // Prevents double JSON!
			var ST = +new Date;
			setTimeout(function(){
				console.STAT && console.STAT(ST, +new Date - ST, '0ms TO');
				flush(peer);
			}, opt.gap); // TODO: queuing/batching might be bad for low-latency video game performance! Allow opt out?
			send(raw, peer);
			console.STAT && (ack === peer.SI) && console.STAT(S, +new Date - peer.SH, 'say ack');
		}
		mesh.say.c = mesh.say.d = 0;
		// TODO: this caused a out-of-memory crash!
		mesh.raw = function(msg, peer){ // TODO: Clean this up / delete it / move logic out!
			if(!msg){ return '' }
			var meta = (msg._) || {}, put, tmp;
			if(tmp = meta.raw){ return tmp }
			if('string' == typeof msg){ return msg }
			var hash = msg['##'], ack = msg['@'];
			if(hash && ack){
				if(!meta.via && dup_check(ack+hash)){ return false } // for our own out messages, memory & storage may ack the same thing, so dedup that. Tho if via another peer, we already tracked it upon hearing, so this will always trigger false positives, so don't do that!
				if((tmp = (dup.s[ack]||'').it) || ((tmp = mesh.last) && ack === tmp['#'])){
					if(hash === tmp['##']){ return false } // if ask has a matching hash, acking is optional.
					if(!tmp['##']){ tmp['##'] = hash } // if none, add our hash to ask so anyone we relay to can dedup. // NOTE: May only check against 1st ack chunk, 2nd+ won't know and still stream back to relaying peers which may then dedup. Any way to fix this wasted bandwidth? I guess force rate limiting breaking change, that asking peer has to ask for next lexical chunk.
				}
			}
			if(!msg.dam && !msg['@']){
				var i = 0, to = []; tmp = opt.peers;
				for(var k in tmp){ var p = tmp[k]; // TODO: Make it up peers instead!
					to.push(p.url || p.pid || p.id);
					if(++i > 6){ break }
				}
				if(i > 1){ msg['><'] = to.join() } // TODO: BUG! This gets set regardless of peers sent to! Detect?
			}
			if(msg.put && (tmp = msg.ok)){ msg.ok = {'@':(tmp['@']||1)-1, '/': (tmp['/']==msg._.near)? mesh.near : tmp['/']}; }
			if(put = meta.$put){
				tmp = {}; Object.keys(msg).forEach(function(k){ tmp[k] = msg[k] });
				tmp.put = ':])([:';
				json(tmp, function(err, raw){
					if(err){ return } // TODO: Handle!!
					var S = +new Date;
					tmp = raw.indexOf('"put":":])([:"');
					res(u, raw = raw.slice(0, tmp+6) + put + raw.slice(tmp + 14));
					console.STAT && console.STAT(S, +new Date - S, 'say slice');
				});
				return;
			}
			json(msg, res);
			function res(err, raw){
				if(err){ return } // TODO: Handle!!
				meta.raw = raw; //if(meta && (raw||'').length < (999 * 99)){ meta.raw = raw } // HNPERF: If string too big, don't keep in memory.
				mesh.say(msg, peer);
			}
		}
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

	mesh.near = 0;
	mesh.hi = function(peer){
		var wire = peer.wire, tmp;
		if(!wire){ mesh.wire((peer.length && {url: peer, id: peer}) || peer); return }
		if(peer.id){
			opt.peers[peer.url || peer.id] = peer;
		} else {
			tmp = peer.id = peer.id || peer.url || String.random(9);
			mesh.say({dam: '?', pid: root.opt.pid}, opt.peers[tmp] = peer);
			delete dup.s[peer.last]; // IMPORTANT: see https://gun.eco/docs/DAM#self
		}
		if(!peer.met){
			mesh.near++;
			peer.met = +(new Date);
			root.on('hi', peer)
		}
		// @rogowski I need this here by default for now to fix go1dfish's bug
		tmp = peer.queue; peer.queue = [];
		setTimeout.each(tmp||[],function(msg){
			send(msg, peer);
		},0,9);
		//Type.obj.native && Type.obj.native(); // dirty place to check if other JS polluted.
	}
	mesh.bye = function(peer){
		peer.met && --mesh.near;
		delete peer.met;
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
	mesh.hear['mob'] = function(msg, peer){ // NOTE: AXE will overload this with better logic.
		if(!msg.peers){ return }
		var peers = Object.keys(msg.peers), one = peers[(Math.random()*peers.length) >> 0];
		if(!one){ return }
		mesh.bye(peer);
		mesh.hi(one);
	}

	root.on('create', function(root){
		root.opt.pid = root.opt.pid || String.random(9);
		this.to.next(root);
		root.on('out', mesh.say);
	});

	root.on('bye', function(peer, tmp){
		peer = opt.peers[peer.id || peer] || peer;
		this.to.next(peer);
		peer.bye? peer.bye() : (tmp = peer.wire) && tmp.close && tmp.close();
		delete opt.peers[peer.id];
		peer.wire = null;
	});

	var gets = {};
	root.on('bye', function(peer, tmp){ this.to.next(peer);
		if(tmp = console.STAT){ tmp.peers = mesh.near; }
		if(!(tmp = peer.url)){ return } gets[tmp] = true;
		setTimeout(function(){ delete gets[tmp] },opt.lack || 9000);
	});
	root.on('hi', function(peer, tmp){ this.to.next(peer);
		if(tmp = console.STAT){ tmp.peers = mesh.near }
		if(opt.super){ return } // temporary (?) until we have better fix/solution?
		var souls = Object.keys(root.next||''); // TODO: .keys( is slow
		if(souls.length > 9999 && !console.SUBS){ console.log(console.SUBS = "Warning: You have more than 10K live GETs, which might use more bandwidth than your screen can show - consider `.off()`.") }
		setTimeout.each(souls, function(soul){ var node = root.next[soul];
			if(opt.super || (node.ask||'')['']){ mesh.say({get: {'#': soul}}, peer); return }
			setTimeout.each(Object.keys(node.ask||''), function(key){ if(!key){ return }
				// is the lack of ## a !onion hint?
				mesh.say({'##': String.hash((root.graph[soul]||'')[key]), get: {'#': soul, '.': key}}, peer);
				// TODO: Switch this so Book could route?
			})
		});
	});

	return mesh;
}
	  var empty = {}, ok = true, u;

	  try{ module.exports = Mesh }catch(e){}

	