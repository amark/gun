
// WARNING: GUN is very simple, but the JavaScript chaining API around GUN
// is complicated and was extremely hard to build. If you port GUN to another
// language, consider implementing an easier API to build.
var Gun = require('./root');
Gun.chain.chain = function(){
	var at = this._, chain = new this.constructor(this), cat = chain._, root;
	cat.root = root = at.root;
	cat.id = ++root._.once;
	cat.back = this;
	cat.on = Gun.on;
	cat.on('in', input, cat); // For 'in' if I add my own listeners to each then I MUST do it before in gets called. If I listen globally for all incoming data instead though, regardless of individual listeners, I can transform the data there and then as well.
	cat.on('out', output, cat); // However for output, there isn't really the global option. I must listen by adding my own listener individually BEFORE this one is ever called.
	return chain;
}

function output(msg){
	var put, get, at = this.as, back = at.back._, root = at.root._;
	if(!msg.gun){ msg.gun = at.gun }
	this.to.next(msg);
	if(get = msg.get){
		/*if(u !== at.put){
			at.on('in', at);
			return;
		}*/
		if(get['#'] || at.soul){
			get['#'] = get['#'] || at.soul;
			msg['#'] || (msg['#'] = root.opt.uuid());
			back = (root.gun.get(get['#'])._);
			if(!(get = get['.'])){
				if(obj_has(back, 'put')){
				//if(u !== back.put){
					back.on('in', back);
				}
				if(back.ack){
					return;
				}
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
				(back.ask || (back.ask = {}))[at.get] = msg.gun; // TODO: PERFORMANCE? More elegant way?
				return back.on('out', msg);
			}
			msg = {get: {}, gun: at.gun};
			return back.on('out', msg);
		}
		at.ack = at.ack || -1;
		if(at.get){
			msg.gun = at.gun;
			get['.'] = at.get;
			(back.ask || (back.ask = {}))[at.get] = msg.gun; // TODO: PERFORMANCE? More elegant way?
			return back.on('out', msg);
		}
	}
	return back.on('out', msg);
}

function input(at){
	at = at._ || at;
	var ev = this, cat = this.as, gun = at.gun, coat = gun._, change = at.put, back = cat.back._ || empty, rel, tmp;
	if(cat.get && at.get !== cat.get){
		at = obj_to(at, {get: cat.get});
	}
	if(cat.field && coat !== cat){
		at = obj_to(at, {gun: cat.gun});
		if(coat.ack){
			cat.ack = coat.ack;
			//cat.ack = cat.ack || coat.ack;
		}
	}
	if(u === change){
		ev.to.next(at);
		if(cat.soul){ return }
		echo(cat, at, ev);
		if(cat.field){
			not(cat, at);
		}
		obj_del(coat.echo, cat.id);
		obj_del(cat.map, coat.id);
		return;
	}
	if(cat.soul){
		//if(cat.root._.now){ at = obj_to(at, {put: change = coat.put}) } // TODO: Ugly hack for uncached synchronous maps.
		ev.to.next(at);
		echo(cat, at, ev);
		obj_map(change, map, {at: at, cat: cat});
		return;
	}
	/*if(rel = Gun.val.rel.is(change)){
		if(tmp = (gun.back(-1).get(rel)._).put){
			change = tmp; // this will cause performance to turn to mush, maybe use `.now` check?
		}
		//if(tmp.put){ change = tmp.put; }
	}
	if(!rel || tmp){*/
	if(!(rel = Gun.val.rel.is(change))){
		if(Gun.val.is(change)){
			if(cat.field || cat.soul){
				not(cat, at);
			} else
			if(coat.field || coat.soul){
				(coat.echo || (coat.echo = {}))[cat.id] = cat;
				(cat.map || (cat.map = {}))[coat.id] = cat.map[coat.id] || {at: coat};
				//if(u === coat.put){ return } // Not necessary but improves performance. If we have it but coat does not, that means we got things out of order and coat will get it. Once coat gets it, it will tell us again.
			}
			ev.to.next(at);
			echo(cat, at, ev);
			return;
		}
		if(cat.field && coat !== cat && obj_has(coat, 'put')){
			cat.put = coat.put;
		};
		if((rel = Gun.node.soul(change)) && coat.field){
			coat.put = (cat.root.get(rel)._).put;
		}
		ev.to.next(at);
		echo(cat, at, ev);
		relate(cat, at, coat, rel);
		obj_map(change, map, {at: at, cat: cat});
		return;
	}
	relate(cat, at, coat, rel);
	ev.to.next(at);
	echo(cat, at, ev);
}
Gun.chain.chain.input = input;
function relate(at, msg, from, rel){
	if(!rel || node_ === at.get){ return }
	var tmp = (at.root.get(rel)._);
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
	var now = at.root._.now;
	if(rel === tmp.rel){
		if(!now){ return }
		if(u === now[at.id]){ return }
		if((now._ || (now._ = {}))[at.id]){ return } now._[at.id] = true;
	}
	ask(at, tmp.rel = rel);
}
function echo(at, msg, ev){
	if(!at.echo){ return } // || node_ === at.get ?
	if(at.has || at.field){ msg = obj_to(msg, {event: ev}) }
	obj_map(at.echo, reverb, msg);
}
function reverb(to){
	to.on('in', this);
}
function map(data, key){ // Map over only the changes on every update.
	var cat = this.cat, next = cat.next || empty, via = this.at, gun, chain, at, tmp;
	if(node_ === key && !next[key]){ return }
	if(!(gun = next[key])){
		return;
	}
	at = (gun._);
	//if(data && data[_soul] && (tmp = Gun.val.rel.is(data)) && (tmp = (cat.root.get(tmp)._)) && obj_has(tmp, 'put')){
	//	data = tmp.put;
	//}
	if(at.field){
		if(!(data && data[_soul] && Gun.val.rel.is(data) === Gun.node.soul(at.put))){
			at.put = data;
		}
		chain = gun;
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
	var tmp = at.map, root = at.root._;
	at.map = null;
	if(!root.now || !root.now[at.id]){
		if((u === msg.put && !msg['@']) && null === tmp){ return }
	}
	if(u === tmp && Gun.val.rel.is(at.put)){ return } // TODO: Bug? Threw second condition in for a particular test, not sure if a counter example is tested though.
	obj_map(tmp, function(proxy){
		if(!(proxy = proxy.at)){ return }
		obj_del(proxy.echo, at.id);
	});
	obj_map(at.next, function(gun, key){
		var coat = (gun._);
		coat.put = u;
		if(coat.ack){
			coat.ack = -1;
		}
		coat.on('in', {
			get: key,
			gun: gun,
			put: u
		});
	});
}
function ask(at, soul){
	var tmp = (at.root.get(soul)._);
	if(at.ack){
		//tmp.ack = tmp.ack || -1;
		tmp.on('out', {get: {'#': soul}});
		if(!at.ask){ return } // TODO: PERFORMANCE? More elegant way?
	}
	obj_map(at.ask || at.next, function(gun, key){
		//(tmp.gun.get(key)._).on('out', {get: {'#': soul, '.': key}});
		//tmp.on('out', {get: {'#': soul, '.': key}});
		(gun._).on('out', {get: {'#': soul, '.': key}});
		//at.on('out', {get: {'#': soul, '.': key}});
	});
	Gun.obj.del(at, 'ask'); // TODO: PERFORMANCE? More elegant way?
}
function ack(msg, ev){
	var as = this.as, get = as.get || empty, at = as.gun._;
	if(at.ack){ at.ack = (at.ack + 1) || 1 }
	if(!msg.put || node_ == get['.'] || (get['.'] && !obj_has(msg.put[get['#']], at.get))){
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
	//if(/*!msg.gun &&*/ !get['.'] && get['#']){ at.ack = (at.ack + 1) || 1 }
	//msg = obj_to(msg);
	msg.gun = at.root;
	//Gun.on('put', at);
	Gun.on.put(msg, at.root);
}
var empty = {}, u;
var obj = Gun.obj, obj_has = obj.has, obj_put = obj.put, obj_del = obj.del, obj_to = obj.to, obj_map = obj.map;
var _soul = Gun._.soul, _field = Gun._.field, node_ = Gun.node._;
	