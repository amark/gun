
var Gun = require('./root');
Gun.chain.put = function(data, cb, as){ // I rewrote it :)
	var gun = this, at = gun._, root = at.root;
	as = as || {};
	as.root = at.root;
	as.run || (as.run = root.once);
	stun(as, at.id); // set a flag for reads to check if this chain is writing.
	as.ack = as.ack || cb;
	as.via = as.via || gun;
	as.data = as.data || data;
	as.soul || (as.soul = at.soul || ('string' == typeof cb && cb));
	var s = as.state = as.state || Gun.state();
	if('function' == typeof data){ data(function(d){ as.data = d; gun.put(u,u,as) }); return gun }
	if(!as.soul){ return get(as), gun }
	as.$ = root.$.get(as.soul); // TODO: This may not allow user chaining and similar?
	as.todo = [{it: as.data, ref: as.$}];
	as.turn = as.turn || turn;
	as.ran = as.ran || ran;
	//var path = []; as.via.back(at => { at.get && path.push(at.get.slice(0,9)) }); path = path.reverse().join('.');
	// TODO: Perf! We only need to stun chains that are being modified, not necessarily written to.
	(function walk(){
		var to = as.todo, at = to.pop(), d = at.it, cid = at.ref && at.ref._.id, v, k, cat, tmp, g;
		stun(as, at.ref);
		if(tmp = at.todo){
			k = tmp.pop(); d = d[k];
			if(tmp.length){ to.push(at) }
		}
		k && (to.path || (to.path = [])).push(k);
		if(!(v = valid(d)) && !(g = Gun.is(d))){
			if(!Object.plain(d)){ ran.err(as, "Invalid data: "+ check(d) +" at " + (as.via.back(function(at){at.get && tmp.push(at.get)}, tmp = []) || tmp.join('.'))+'.'+(to.path||[]).join('.')); return }
			var seen = as.seen || (as.seen = []), i = seen.length;
			while(i--){ if(d === (tmp = seen[i]).it){ v = d = tmp.link; break } }
		}
		if(k && v){ at.node = state_ify(at.node, k, s, d) } // handle soul later.
		else {
			if(!as.seen){ ran.err(as, "Data at root of graph must be a node (an object)."); return }
			as.seen.push(cat = {it: d, link: {}, todo: g? [] : Object.keys(d).sort().reverse(), path: (to.path||[]).slice(), up: at}); // Any perf reasons to CPU schedule this .keys( ?
			at.node = state_ify(at.node, k, s, cat.link);
			!g && cat.todo.length && to.push(cat);
			// ---------------
			var id = as.seen.length;
			(as.wait || (as.wait = {}))[id] = '';
			tmp = (cat.ref = (g? d : k? at.ref.get(k) : at.ref))._;
			(tmp = (d && (d._||'')['#']) || tmp.soul || tmp.link)? resolve({soul: tmp}) : cat.ref.get(resolve, {run: as.run, /*hatch: 0,*/ v2020:1, out:{get:{'.':' '}}}); // TODO: BUG! This should be resolve ONLY soul to prevent full data from being loaded. // Fixed now?
			//setTimeout(function(){ if(F){ return } console.log("I HAVE NOT BEEN CALLED!", path, id, cat.ref._.id, k) }, 9000); var F; // MAKE SURE TO ADD F = 1 below!
			function resolve(msg, eve){
				var end = cat.link['#'];
				if(eve){ eve.off(); eve.rid(msg) } // TODO: Too early! Check all peers ack not found.
				// TODO: BUG maybe? Make sure this does not pick up a link change wipe, that it uses the changign link instead.
				var soul = end || msg.soul || (tmp = (msg.$$||msg.$)._||'').soul || tmp.link || ((tmp = tmp.put||'')._||'')['#'] || tmp['#'] || (((tmp = msg.put||'') && msg.$$)? tmp['#'] : (tmp['=']||tmp[':']||'')['#']);
				!end && stun(as, msg.$);
				if(!soul && !at.link['#']){ // check soul link above us
					(at.wait || (at.wait = [])).push(function(){ resolve(msg, eve) }) // wait
					return;
				}
				if(!soul){
					soul = [];
					(msg.$$||msg.$).back(function(at){
						if(tmp = at.soul || at.link){ return soul.push(tmp) }
						soul.push(at.get);
					});
					soul = soul.reverse().join('/');
				}
				cat.link['#'] = soul;
				!g && (((as.graph || (as.graph = {}))[soul] = (cat.node || (cat.node = {_:{}})))._['#'] = soul);
				delete as.wait[id];
				cat.wait && setTimeout.each(cat.wait, function(cb){ cb && cb() });
				as.ran(as);
			};
			// ---------------
		}
		if(!to.length){ return as.ran(as) }
		as.turn(walk);
	}());
	return gun;
}

function stun(as, id){
	if(!id){ return } id = (id._||'').id||id;
	var run = as.root.stun || (as.root.stun = {on: Gun.on}), test = {}, tmp;
	as.stun || (as.stun = run.on('stun', function(){ }));
	if(tmp = run.on(''+id)){ tmp.the.last.next(test) }
	if(test.run >= as.run){ return }
	run.on(''+id, function(test){
		if(as.stun.end){
			this.off();
			this.to.next(test);
			return;
		}
		test.run = test.run || as.run;
		test.stun = test.stun || as.stun; return;
		if(this.to.to){
			this.the.last.next(test);
			return;
		}
		test.stun = as.stun;
	});
}

function ran(as){
	if(as.err){ ran.end(as.stun, as.root); return } // move log handle here.
	if(as.todo.length || as.end || !Object.empty(as.wait)){ return } as.end = 1;
	//(as.retry = function(){ as.acks = 0;
	var cat = (as.$.back(-1)._), root = cat.root, ask = cat.ask(function(ack){
		root.on('ack', ack);
		if(ack.err && !ack.lack){ Gun.log(ack) }
		if(++acks > (as.acks || 0)){ this.off() } // Adjustable ACKs! Only 1 by default.
		if(!as.ack){ return }
		as.ack(ack, this);
	}, as.opt), acks = 0, stun = as.stun, tmp;
	(tmp = function(){ // this is not official yet, but quick solution to hack in for now.
		if(!stun){ return }
		ran.end(stun, root);
		setTimeout.each(Object.keys(stun = stun.add||''), function(cb){ if(cb = stun[cb]){cb()} }); // resume the stunned reads // Any perf reasons to CPU schedule this .keys( ?
	}).hatch = tmp; // this is not official yet ^
	//console.log(1, "PUT", as.run, as.graph);
	if(as.ack && !as.ok){ as.ok = as.acks || 9 } // TODO: In future! Remove this! This is just old API support.
	(as.via._).on('out', {put: as.out = as.graph, ok: as.ok && {'@': as.ok+1}, opt: as.opt, '#': ask, _: tmp});
	//})();
}; ran.end = function(stun,root){
	stun.end = noop; // like with the earlier id, cheaper to make this flag a function so below callbacks do not have to do an extra type check.
	if(stun.the.to === stun && stun === stun.the.last){ delete root.stun }
	stun.off();
}; ran.err = function(as, err){
	(as.ack||noop).call(as, as.out = { err: as.err = Gun.log(err) });
	as.ran(as);
}

function get(as){
	var at = as.via._, tmp;
	as.via = as.via.back(function(at){
		if(at.soul || !at.get){ return at.$ }
		tmp = as.data; (as.data = {})[at.get] = tmp;
	});
	if(!as.via || !as.via._.soul){
		as.via = at.root.$.get(((as.data||'')._||'')['#'] || at.$.back('opt.uuid')())
	}
	as.via.put(as.data, as.ack, as);
	

	return;
	if(at.get && at.back.soul){
		tmp = as.data;
		as.via = at.back.$;
		(as.data = {})[at.get] = tmp; 
		as.via.put(as.data, as.ack, as);
		return;
	}
}
function check(d, tmp){ return ((d && (tmp = d.constructor) && tmp.name) || typeof d) }

var u, empty = {}, noop = function(){}, turn = setTimeout.turn, valid = Gun.valid, state_ify = Gun.state.ify;
var iife = function(fn,as){fn.call(as||empty)}
	