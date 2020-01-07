
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
	var put, get, at = this.as, back = at.back, root = at.root, tmp;
	if(!msg.$){ msg.$ = at.$ }
	this.to.next(msg);
	if(get = msg.get){
		/*if(u !== at.put){
			at.on('in', at);
			return;
		}*/
		if(at.lex){ msg.get = obj_to(at.lex, msg.get) }
		if(get['#'] || at.soul){
			get['#'] = get['#'] || at.soul;
			msg['#'] || (msg['#'] = text_rand(9));
			back = (root.$.get(get['#'])._);
			if(!(get = get['.'])){
				tmp = back.ack;
				if(!tmp){ back.ack = -1 }
				if(obj_has(back, 'put')){
					back.on('in', back);
				}
				if(tmp && u !== back.put){ return } //if(tmp){ return }
				msg.$ = back.$;
			} else
			if(obj_has(back.put, get)){ // TODO: support #LEX !
				put = (back.$.get(get)._);
				if(!(tmp = put.ack)){ put.ack = -1 }
				back.on('in', {
					$: back.$,
					put: Gun.state.to(back.put, get),
					get: back.get
				});
				if(tmp){ return }
			} else
			if('string' != typeof get){
				var put = {}, meta = (back.put||{})._;
				Gun.obj.map(back.put, function(v,k){
					if(!Gun.text.match(k, get)){ return }
					put[k] = v;
				})
				if(!Gun.obj.empty(put)){
					put._ = meta;
					back.on('in', {$: back.$, put: put, get: back.get})
				}
			}
			root.ask(ack, msg);
			return root.on('in', msg);
		}
		if(root.now){ root.now[at.id] = root.now[at.id] || true; at.pass = {} }
		if(get['.']){
			if(at.get){
				msg = {get: {'.': at.get}, $: at.$};
				//if(back.ask || (back.ask = {})[at.get]){ return }
				(back.ask || (back.ask = {}));
				back.ask[at.get] = msg.$._; // TODO: PERFORMANCE? More elegant way?
				return back.on('out', msg);
			}
			msg = {get: {}, $: at.$};
			return back.on('out', msg);
		}
		at.ack = at.ack || -1;
		if(at.get){
			msg.$ = at.$;
			get['.'] = at.get;
			(back.ask || (back.ask = {}))[at.get] = msg.$._; // TODO: PERFORMANCE? More elegant way?
			return back.on('out', msg);
		}
	}
	return back.on('out', msg);
}

function input(msg){
	var eve = this, cat = eve.as, root = cat.root, gun = msg.$, at = (gun||empty)._ || empty, change = msg.put, rel, tmp;
	if(cat.get && msg.get !== cat.get){
		msg = obj_to(msg, {get: cat.get});
	}
	if(cat.has && at !== cat){
		msg = obj_to(msg, {$: cat.$});
		if(at.ack){
			cat.ack = at.ack;
			//cat.ack = cat.ack || at.ack;
		}
	}
	if(u === change){
		tmp = at.put;
		eve.to.next(msg);
		if(cat.soul){ return } // TODO: BUG, I believee the fresh input refactor caught an edge case that a `gun.get('soul').get('key')` that points to a soul that doesn't exist will not trigger val/get etc.
		if(u === tmp && u !== at.put){ return }
		echo(cat, msg, eve);
		if(cat.has){
			not(cat, msg);
		}
		obj_del(at.echo, cat.id);
		obj_del(cat.map, at.id);
		return;
	}
	if(cat.soul){
		eve.to.next(msg);
		echo(cat, msg, eve);
		if(cat.next){ obj_map(change, map, {msg: msg, cat: cat}) }
		return;
	}
	if(!(rel = Gun.val.link.is(change))){
		if(Gun.val.is(change)){
			if(cat.has || cat.soul){
				not(cat, msg);
			} else
			if(at.has || at.soul){
				(at.echo || (at.echo = {}))[cat.id] = at.echo[at.id] || cat;
				(cat.map || (cat.map = {}))[at.id] = cat.map[at.id] || {at: at};
				//if(u === at.put){ return } // Not necessary but improves performance. If we have it but at does not, that means we got things out of order and at will get it. Once at gets it, it will tell us again.
			}
			eve.to.next(msg);
			echo(cat, msg, eve);
			return;
		}
		if(cat.has && at !== cat && obj_has(at, 'put')){
			cat.put = at.put;
		};
		if((rel = Gun.node.soul(change)) && at.has){
			at.put = (cat.root.$.get(rel)._).put;
		}
		tmp = (root.stop || {})[at.id];
		//if(tmp && tmp[cat.id]){ } else {
			eve.to.next(msg);
		//}
		relate(cat, msg, at, rel);
		echo(cat, msg, eve);
		if(cat.next){ obj_map(change, map, {msg: msg, cat: cat}) }
		return;
	}
	var was = root.stop;
	tmp = root.stop || {};
	tmp = tmp[at.id] || (tmp[at.id] = {});
	//if(tmp[cat.id]){ return }
	tmp.is = tmp.is || at.put;
	tmp[cat.id] = at.put || true;
	//if(root.stop){
		eve.to.next(msg)
	//}
	relate(cat, msg, at, rel);
	echo(cat, msg, eve);
}

function relate(at, msg, from, rel){
	if(!rel || node_ === at.get){ return }
	var tmp = (at.root.$.get(rel)._);
	if(at.has){
		from = tmp;
	} else
	if(from.has){
		relate(from, msg, from, rel);
	}
	if(from === at){ return }
	if(!from.$){ from = {} }
	(from.echo || (from.echo = {}))[at.id] = from.echo[at.id] || at;
	if(at.has && !(at.map||empty)[from.id]){ // if we haven't seen this before.
		not(at, msg);
	}
	tmp = from.id? ((at.map || (at.map = {}))[from.id] = at.map[from.id] || {at: from}) : {};
	if(rel === tmp.link){
		if(!(tmp.pass || at.pass)){
			return;
		}
	}
	if(at.pass){
		Gun.obj.map(at.map, function(tmp){ tmp.pass = true })
		obj_del(at, 'pass');
	}
	if(tmp.pass){ obj_del(tmp, 'pass') }
	if(at.has){ at.link = rel }
	ask(at, tmp.link = rel);
}
function echo(at, msg, ev){
	if(!at.echo){ return } // || node_ === at.get ?
	//if(at.has){ msg = obj_to(msg, {event: ev}) }
	obj_map(at.echo, reverb, msg);
}
function reverb(to){
	if(!to || !to.on){ return }
	to.on('in', this);
}
function map(data, key){ // Map over only the changes on every update.
	var cat = this.cat, next = cat.next || empty, via = this.msg, chain, at, tmp;
	if(node_ === key && !next[key]){ return }
	if(!(at = next[key])){
		return;
	}
	//if(data && data[_soul] && (tmp = Gun.val.link.is(data)) && (tmp = (cat.root.$.get(tmp)._)) && obj_has(tmp, 'put')){
	//	data = tmp.put;
	//}
	if(at.has){
		//if(!(data && data[_soul] && Gun.val.link.is(data) === Gun.node.soul(at.put))){
		if(u === at.put || !Gun.val.link.is(data)){
			at.put = data;
		}
		chain = at.$;
	} else
	if(tmp = via.$){
		tmp = (chain = via.$.get(key))._;
		if(u === tmp.put || !Gun.val.link.is(data)){
			tmp.put = data;
		}
	}
	at.on('in', {
		put: data,
		get: key,
		$: chain,
		via: via
	});
}
function not(at, msg){
	if(!(at.has || at.soul)){ return }
	var tmp = at.map, root = at.root;
	at.map = null;
	if(at.has){
		if(at.dub && at.root.stop){ at.dub = null }
		at.link = null;
	}
	//if(!root.now || !root.now[at.id]){
	if(!at.pass){
		if((!msg['@']) && null === tmp){ return }
		//obj_del(at, 'pass');
	}
	if(u === tmp && Gun.val.link.is(at.put)){ return } // This prevents the very first call of a thing from triggering a "clean up" call. // TODO: link.is(at.put) || !val.is(at.put) ?
	obj_map(tmp, function(proxy){
		if(!(proxy = proxy.at)){ return }
		obj_del(proxy.echo, at.id);
	});
	tmp = at.put;
	obj_map(at.next, function(neat, key){
		if(u === tmp && u !== at.put){ return true }
		neat.put = u;
		if(neat.ack){
			neat.ack = -1; // Shouldn't this be reset to 0? If we do that, SEA test `set user ref should be found` fails, odd.
		}
		neat.on('in', {
			get: key,
			$: neat.$,
			put: u
		});
	});
}
function ask(at, soul){
	var tmp = (at.root.$.get(soul)._), lex = at.lex;
	if(at.ack || lex){
		(lex = lex||{})['#'] = soul;
		tmp.on('out', {get: lex});
		if(!at.ask){ return } // TODO: PERFORMANCE? More elegant way?
	}
	tmp = at.ask; Gun.obj.del(at, 'ask');
	obj_map(tmp || at.next, function(neat, key){
		var lex = neat.lex || {}; lex['#'] = soul; lex['.'] = lex['.'] || key;
		neat.on('out', {get: lex});
	});
	Gun.obj.del(at, 'ask'); // TODO: PERFORMANCE? More elegant way?
}
function ack(msg, ev){
	var as = this.as, get = as.get || empty, at = as.$._, tmp = (msg.put||empty)[get['#']];
	if(at.ack){ at.ack = (at.ack + 1) || 1; }
	if(!msg.put || ('string' == typeof get['.'] && !obj_has(tmp, at.get))){
		if(at.put !== u){ return }
		at.on('in', {
			get: at.get,
			put: at.put = u,
			$: at.$,
			'@': msg['@']
		});
		return;
	}
	if(node_ == get['.']){ // is this a security concern?
		at.on('in', {get: at.get, put: Gun.val.link.ify(get['#']), $: at.$, '@': msg['@']});
		return;
	}
	Gun.on.put(msg, at.root.$);
}
var empty = {}, u;
var obj = Gun.obj, obj_has = obj.has, obj_put = obj.put, obj_del = obj.del, obj_to = obj.to, obj_map = obj.map;
var text_rand = Gun.text.random;
var _soul = Gun.val.link._, node_ = Gun.node._;
	