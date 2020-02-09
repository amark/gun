
var Type = require('../type');
var puff = (typeof setImmediate !== "undefined")? setImmediate : setTimeout;

function Mesh(root){
	var mesh = function(){};
	var opt = root.opt || {};
	opt.log = opt.log || console.log;
	opt.gap = opt.gap || opt.wait || 1;
	opt.pack = opt.pack || (opt.memory? (opt.memory * 1000 * 1000) : 1399000000) * 0.3; // max_old_space_size defaults to 1400 MB.

	var dup = root.dup;

	// TODO: somewhere in here caused a out-of-memory crash! How? It is inbound!
	mesh.hear = function(raw, peer){
		if(!raw){ return }
		var msg, id, hash, tmp = raw[0];
		if(opt.pack <= raw.length){ return mesh.say({dam: '!', err: "Message too big!"}, peer) }
		if('{' != raw[2]){ mesh.hear.d += raw.length||0; ++mesh.hear.c; } // STATS! // ugh, stupid double JSON encoding
		if('[' === tmp){
			try{msg = JSON.parse(raw);}catch(e){opt.log('DAM JSON parse error', e)}
			if(!msg){ return }
			LOG && opt.log(+new Date, msg.length, 'in hear batch');
			(function go(){
				var S; LOG && (S = +new Date); // STATS!
				var m, c = 100; // hardcoded for now?
				while(c-- && (m = msg.shift())){
					mesh.hear(m, peer);
				}
				LOG && opt.log(S, +new Date - S, 'batch heard');
				if(!msg.length){ return }
				puff(go, 0);
			}());
			return;
		}
		if('{' === tmp || (Type.obj.is(raw) && (msg = raw))){
			try{msg = msg || JSON.parse(raw);
			}catch(e){return opt.log('DAM JSON parse error', e)}
			if(!msg){ return }
			if(!(id = msg['#'])){ id = msg['#'] = Type.text.random(9) }
			if(msg.DBG_s){ opt.log(+new Date - msg.DBG_s, 'to hear', id) }
			if(dup.check(id)){ return }
			dup.track(id, true).it = it(msg); // GUN core also dedups, so `true` is needed. // Does GUN core need to dedup anymore?
			if(!(hash = msg['##']) && u !== msg.put){ hash = msg['##'] = Type.obj.hash(msg.put) }
			if(hash && (tmp = msg['@'] || (msg.get && id))){ // Reduces backward daisy in case varying hashes at different daisy depths are the same.
				if(dup.check(tmp+hash)){ return }
				dup.track(tmp+hash, true).it = it(msg); // GUN core also dedups, so `true` is needed. // Does GUN core need to dedup anymore?
			}
			(msg._ = function(){}).via = peer;
			if(tmp = msg['><']){ (msg._).to = Type.obj.map(tmp.split(','), tomap) }
			if(msg.dam){
				if(tmp = mesh.hear[msg.dam]){
					tmp(msg, peer, root);
				}
				return;
			}
			var S, ST; LOG && (S = +new Date);
			root.on('in', msg);
			LOG && !msg.nts && (ST = +new Date - S) > 9 && opt.log(S, ST, 'msg', msg['#']);
			return;
		}
	}
	var tomap = function(k,i,m){m(k,true)};
	mesh.hear.c = mesh.hear.d = 0;

	;(function(){
		var SMIA = 0;
		var message;
		function each(peer){ mesh.say(message, peer) }
		mesh.say = function(msg, peer){
			if(this.to){ this.to.next(msg) } // compatible with middleware adapters.
			if(!msg){ return false }
			var id, hash, tmp, raw;
			var S; LOG && (S = +new Date); //msg.DBG_s = msg.DBG_s || +new Date;
			var meta = msg._||(msg._=function(){});
			if(!(id = msg['#'])){ id = msg['#'] = Type.text.random(9) }
			if(!(hash = msg['##']) && u !== msg.put){ hash = msg['##'] = Type.obj.hash(msg.put) }
			if(!(raw = meta.raw)){
				raw = mesh.raw(msg);
				if(hash && (tmp = msg['@'])){
					dup.track(tmp+hash).it = it(msg);
					if(tmp = (dup.s[tmp]||ok).it){
						if(hash === tmp['##']){ return false }
						tmp['##'] = hash;
					}
				}
			}
			//LOG && opt.log(S, +new Date - S, 'say prep');
			dup.track(id).it = it(msg); // track for 9 seconds, default. Earth<->Mars would need more!
			if(!peer){ peer = (tmp = dup.s[msg['@']]) && (tmp = tmp.it) && (tmp = tmp._) && (tmp = tmp.via) }
			if(!peer && msg['@']){
				LOG && opt.log(+new Date, ++SMIA, 'total no peer to ack to');
				return false;
			} // TODO: Temporary? If ack via trace has been lost, acks will go to all peers, which trashes browser bandwidth. Not relaying the ack will force sender to ask for ack again. Note, this is technically wrong for mesh behavior.
			if(!peer && mesh.way){ return mesh.way(msg) }
			if(!peer || !peer.id){ message = msg;
				if(!Type.obj.is(peer || opt.peers)){ return false }
				//var S; LOG && (S = +new Date);
				Type.obj.map(peer || opt.peers, each); // in case peer is a peer list.
				//LOG && opt.log(S, +new Date - S, 'say loop');
				return;
			}
			if(!peer.wire && mesh.wire){ mesh.wire(peer) }
			if(id === peer.last){ return } peer.last = id;  // was it just sent?
			if(peer === meta.via){ return false }
			if((tmp = meta.to) && (tmp[peer.url] || tmp[peer.pid] || tmp[peer.id]) /*&& !o*/){ return false }
			if(peer.batch){
				peer.tail = (tmp = peer.tail || 0) + raw.length;
				if(peer.tail <= opt.pack){
					peer.batch.push(raw); // peer.batch += (tmp?'':',')+raw; // TODO: Prevent double JSON! // FOR v1.0 !?
					return;
				}
				flush(peer);
			}
			peer.batch = []; // peer.batch = '['; // TODO: Prevent double JSON!
			setTimeout(function(){flush(peer)}, opt.gap);
			send(raw, peer);
		}
		function flush(peer){
			var tmp = peer.batch; // var tmp = peer.batch + ']'; // TODO: Prevent double JSON!
			peer.batch = peer.tail = null;
			if(!tmp){ return }
			if(!tmp.length){ return } // if(3 > tmp.length){ return } // TODO: ^
			var S; LOG && (S = +new Date);
			try{tmp = (1 === tmp.length? tmp[0] : JSON.stringify(tmp));
			}catch(e){return opt.log('DAM JSON stringify error', e)}
			LOG && opt.log(S, +new Date - S, 'say stringify', tmp.length);
			if(!tmp){ return }
			send(tmp, peer);
		}
		mesh.say.c = mesh.say.d = 0;
	}());
	
	// for now - find better place later.
	function send(raw, peer){ try{
		var wire = peer.wire;
		var S, ST; LOG && (S = +new Date);
		if(peer.say){
			peer.say(raw);
		} else
		if(wire.send){
			wire.send(raw);
		}
		LOG && (ST = +new Date - S) > 9 && opt.log(S, ST, 'wire send', raw.length);
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
			if(typeof msg === 'string'){ return msg }
			if(!msg.dam){
				var i = 0, to = []; Type.obj.map(opt.peers, function(p){
					to.push(p.url || p.pid || p.id); if(++i > 3){ return true } // limit server, fast fix, improve later! // For "tower" peer, MUST include 6 surrounding ids. // REDUCED THIS TO 3 for temporary relay peer performance, towers still should list neighbors.
				}); if(i > 1){ msg['><'] = to.join() }
			}
			var raw = $(msg); // optimize by reusing put = the JSON.stringify from .hash?
			/*if(u !== put){
				tmp = raw.indexOf(_, raw.indexOf('put'));
				raw = raw.slice(0, tmp-1) + put + raw.slice(tmp + _.length + 1);
				//raw = raw.replace('"'+ _ +'"', put); // NEVER USE THIS! ALSO NEVER DELETE IT TO NOT MAKE SAME MISTAKE! https://github.com/amark/gun/wiki/@$$ Heisenbug
			}*/
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
	}
	mesh.bye = function(peer){
		root.on('bye', peer);
		var tmp = +(new Date); tmp = (tmp - (peer.met||tmp));
		mesh.bye.time = ((mesh.bye.time || tmp) + tmp) / 2;
		LOG = console.LOG; // dirty place to cheaply update LOG settings over time.
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
		Type.obj.map(root.next, function(node, soul){
			tmp = {}; tmp[soul] = root.graph[soul];
			mesh.say({'##': Type.obj.hash(tmp), get: {'#': soul}}, peer);
		})
	});

	return mesh;
}

;(function(){
	Type.text.hash = function(s){ // via SO
		if(typeof s !== 'string'){ return {err: 1} }
    var c = 0;
    if(!s.length){ return c }
    for(var i=0,l=s.length,n; i<l; ++i){
      n = s.charCodeAt(i);
      c = ((c<<5)-c)+n;
      c |= 0;
    }
    return c; // Math.abs(c);
  }
	
	var $ = JSON.stringify, u;

	Type.obj.hash = function(obj, hash){
		if(!hash && u === (obj = $(obj, sort))){ return }
		return Type.text.hash(hash || obj || '');
	}

	function sort(k, v){ var tmp;
		if(!(v instanceof Object)){ return v }
		Type.obj.map(Object.keys(v).sort(), map, {to: tmp = {}, on: v});
		return tmp;
	}
	Type.obj.hash.sort = sort;

	function map(k){
		this.to[k] = this.on[k];
	}
}());

function it(msg){ return msg || {_: msg._, '##': msg['##']} } // HNPERF: Only need some meta data, not full reference (took up too much memory). // HNPERF: Garrrgh! We add meta data to msg over time, copying the object happens to early.

	  var empty = {}, ok = true, u;
var LOG = console.LOG;

	  try{ module.exports = Mesh }catch(e){}

	