
// WARNING: GUN is very simple, but the JavaScript chaining API around GUN
// is complicated and was extremely hard to build. If you port GUN to another
// language, consider implementing an easier API to build.
var Gun = require('./root');
Gun.chain.chain = function(sub){
	var gun = this, at = gun._, chain = new (sub || gun).constructor(gun), cat = chain._, root;
	cat.root = root = at.root;
	cat.id = ++root.once;
	cat.back = gun._;
	cat.on = Gun.on;
	cat.on('in', input, cat); // For 'in' if I add my own listeners to each then I MUST do it before in gets called. If I listen globally for all incoming data instead though, regardless of individual listeners, I can transform the data there and then as well.
	cat.on('out', output, cat); // However for output, there isn't really the global option. I must listen by adding my own listener individually BEFORE this one is ever called.
	return chain;
}

function output(msg){
	var put, get, at = this.as, back = at.back, root = at.root;
	if(!msg.I){ msg.I = at.gun }
	if(!msg.gun){ msg.gun = at.gun }
	this.to.next(msg);
	if(get = msg.get){
		/*if(u !== at.put){
			at.on('in', at);
			return;
		}*/
		if(get['#'] || at.soul){
			get['#'] = get['#'] || at.soul;
			msg['#'] || (msg['#'] = text_rand(9));
			back = (root.gun.get(get['#'])._);
			if(!(get = get['.'])){
				if(obj_has(back, 'put')){
				//if(u !== back.put){
					back.on('in', back);
				}
				if(back.ack){ return }
				msg.gun = back.gun;
				back.ack = -1;
			} else
			if(obj_has(back.put, get)){
				back.on('in', {
					gun: back.gun,
					put: Gun.state.to(back.put, get),
					get: back.get
				});
				return;
			}
			root.ask(ack, msg);
			return root.on('in', msg);
		}
		if(root.now){
			root.now[at.id] = root.now[at.id] || true;
		}
		if(get['.']){
			if(at.get){
				msg = {get: {'.': at.get}, gun: at.gun};
				(back.ask || (back.ask = {}))[at.get] = msg.gun._; // TODO: PERFORMANCE? More elegant way?
				return back.on('out', msg);
			}
			msg = {get: {}, gun: at.gun};
			return back.on('out', msg);
		}
		at.ack = at.ack || -1;
		if(at.get){
			msg.gun = at.gun;
			get['.'] = at.get;
			(back.ask || (back.ask = {}))[at.get] = msg.gun._; // TODO: PERFORMANCE? More elegant way?
			return back.on('out', msg);
		}
	}
	return back.on('out', msg);
}

function input(msg){
	var ev = this, cat = this.as, gun = msg.gun, at = gun._, change = msg.put, rel, tmp;
	if(cat.get && msg.get !== cat.get){
		msg = obj_to(msg, {get: cat.get});
	}
	if(cat.has && at !== cat){
		msg = obj_to(msg, {gun: cat.gun});
		if(at.ack){
			cat.ack = at.ack;
			//cat.ack = cat.ack || at.ack;
		}
	}
	if(node_ === cat.get && change && change['#']){
		// TODO: Potential bug? What if (soul.has = pointer) gets changed to (soul.has = primitive), we still need to clear out / wipe /reset (soul.has._) to have _id = nothing, or puts might have false positives (revert back to old soul).
		cat._id = change['#'];
	}
	if(u === change){
		ev.to.next(msg);
		if(cat.soul){ return } // TODO: BUG, I believe the fresh input refactor caught an edge case that a `gun.get('soul').get('key')` that points to a soul that doesn't exist will not trigger val/get etc.
		echo(cat, msg, ev);
		if(cat.has){
			not(cat, msg);
		}
		obj_del(at.echo, cat.id);
		obj_del(cat.map, at.id);
		return;
	}
	if(cat.soul){
		ev.to.next(msg);
		echo(cat, msg, ev);
		obj_map(change, map, {at: msg, cat: cat});
		return;
	}
	if(!(rel = Gun.val.rel.is(change))){
		if(Gun.val.is(change)){
			if(cat.has || cat.soul){
				not(cat, msg);
			} else
			if(at.has || at.soul){
				(at.echo || (at.echo = {}))[cat.id] = cat;
				(cat.map || (cat.map = {}))[at.id] = cat.map[at.id] || {at: at};
				//if(u === at.put){ return } // Not necessary but improves performance. If we have it but at does not, that means we got things out of order and at will get it. Once at gets it, it will tell us again.
			}
			ev.to.next(msg);
			echo(cat, msg, ev);
			return;
		}
		if(cat.has && at !== cat && obj_has(at, 'put')){
			cat.put = at.put;
		};
		if((rel = Gun.node.soul(change)) && at.has){
			at.put = (cat.root.gun.get(rel)._).put;
		}
		ev.to.next(msg);
		echo(cat, msg, ev);
		relate(cat, msg, at, rel);
		obj_map(change, map, {at: msg, cat: cat});
		return;
	}
	relate(cat, msg, at, rel);
	ev.to.next(msg);
	echo(cat, msg, ev);
}

function relate(at, msg, from, rel){
	if(!rel || node_ === at.get){ return }
	var tmp = (at.root.gun.get(rel)._);
	if(at.has){
		from = tmp;
	} else 
	if(from.has){
		relate(from, msg, from, rel);
	}
	if(from === at){ return }
	(from.echo || (from.echo = {}))[at.id] = at;
	if(at.has && !(at.map||empty)[from.id]){ // if we haven't seen this before.
		not(at, msg);
	}
	tmp = (at.map || (at.map = {}))[from.id] = at.map[from.id] || {at: from};
	var now = at.root.now;
	//now = now || at.root.stop;
	if(rel === tmp.rel){
		// NOW is a hack to get synchronous replies to correctly call.
		// and STOP is a hack to get async behavior to correctly call.
		// neither of these are ideal, need to be fixed without hacks,
		// but for now, this works for current tests. :/
		if(!now){
			return;
			/*var stop = at.root.stop;
			if(!stop){ return }
			if(stop[at.id] === rel){ return }
			stop[at.id] = rel;*/
		} else {
			if(u === now[at.id]){ return }
			if((now._ || (now._ = {}))[at.id] === rel){ return }
			now._[at.id] = rel;
		}
	}
	ask(at, tmp.rel = rel);
}
function echo(at, msg, ev){
	if(!at.echo){ return } // || node_ === at.get ?
	if(at.has){ msg = obj_to(msg, {event: ev}) }
	obj_map(at.echo, reverb, msg);
}
function reverb(to){
	to.on('in', this);
}
function map(data, key){ // Map over only the changes on every update.
	var cat = this.cat, next = cat.next || empty, via = this.at, chain, at, tmp;
	if(node_ === key && !next[key]){ return }
	if(!(at = next[key])){
		return;
	}
	//if(data && data[_soul] && (tmp = Gun.val.rel.is(data)) && (tmp = (cat.root.gun.get(tmp)._)) && obj_has(tmp, 'put')){
	//	data = tmp.put;
	//}
	if(at.has){
		if(!(data && data[_soul] && Gun.val.rel.is(data) === Gun.node.soul(at.put))){
			at.put = data;
		}
		chain = at.gun;
	} else {
		chain = via.gun.get(key);
	}
	at.on('in', {
		put: data,
		get: key,
		gun: chain,
		via: via
	});
}
function not(at, msg){
	if(!(at.has || at.soul)){ return }
	var tmp = at.map, root = at.root;
	at.map = null;
	if(!root.now || !root.now[at.id]){
		if((!msg['@']) && null === tmp){ return }
	}
	if(u === tmp && Gun.val.rel.is(at.put)){ return } // TODO: Bug? Threw second condition in for a particular test, not sure if a counter example is tested though.
	obj_map(tmp, function(proxy){
		if(!(proxy = proxy.at)){ return }
		obj_del(proxy.echo, at.id);
	});
	obj_map(at.next, function(neat, key){
		neat.put = u;
		if(neat.ack){
			neat.ack = -1;
		}
		neat.on('in', {
			get: key,
			gun: neat.gun,
			put: u
		});
	});
}
function ask(at, soul){
	var tmp = (at.root.gun.get(soul)._);
	if(at.ack){
		tmp.on('out', {get: {'#': soul}});
		if(!at.ask){ return } // TODO: PERFORMANCE? More elegant way?
	}
	obj_map(at.ask || at.next, function(neat, key){
		//(tmp.gun.get(key)._).on('out', {get: {'#': soul, '.': key}});
		//tmp.on('out', {get: {'#': soul, '.': key}});
		neat.on('out', {get: {'#': soul, '.': key}});
		//at.on('out', {get: {'#': soul, '.': key}});
	});
	Gun.obj.del(at, 'ask'); // TODO: PERFORMANCE? More elegant way?
}
function ack(msg, ev){
	var as = this.as, get = as.get || empty, at = as.gun._, tmp = (msg.put||empty)[get['#']];
	if(at.ack){ at.ack = (at.ack + 1) || 1 }
	if(!msg.put /*|| node_ == get['.']*/ || (get['.'] && !obj_has(tmp, at.get))){
		if(at.put !== u){ return }
		//at.ack = 0;
		at.on('in', {
			get: at.get,
			put: at.put = u,
			gun: at.gun,
			'@': msg['@']
		})
		return;
	}
	if(node_ == get['.']){ // is this a security concern?
		at.on('in', {get: at.get, put: tmp[at.get], gun: at.gun, '@': msg['@']});
		return;
	}
	//if(/*!msg.gun &&*/ !get['.'] && get['#']){ at.ack = (at.ack + 1) || 1 }
	//msg = obj_to(msg);
	msg.gun = at.root.gun;
	//Gun.on('put', at);
	Gun.on.put(msg, at.root.gun);
}
var empty = {}, u;
var obj = Gun.obj, obj_has = obj.has, obj_put = obj.put, obj_del = obj.del, obj_to = obj.to, obj_map = obj.map;
var text_rand = Gun.text.random;
var _soul = Gun.val.rel._, node_ = Gun.node._;
	