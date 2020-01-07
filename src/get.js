
var Gun = require('./root');
Gun.chain.get = function(key, cb, as){
	var gun, tmp;
	if(typeof key === 'string'){
		var back = this, cat = back._;
		var next = cat.next || empty;
		if(!(gun = next[key])){
			gun = cache(key, back);
		}
		gun = gun.$;
	} else
	if(key instanceof Function){
		if(true === cb){ return soul(this, key, cb, as), this }
		gun = this;
		var at = gun._, root = at.root, tmp = root.now, ev;
		as = cb || {};
		as.at = at;
		as.use = key;
		as.out = as.out || {};
		as.out.get = as.out.get || {};
		(ev = at.on('in', use, as)).rid = rid;
		(root.now = {$:1})[as.now = at.id] = ev;
		var mum = root.mum; root.mum = {};
		at.on('out', as.out);
		root.mum = mum;
		root.now = tmp;
		return gun;
	} else
	if(num_is(key)){
		return this.get(''+key, cb, as);
	} else
	if(tmp = rel.is(key)){
		return this.get(tmp, cb, as);
	} else
	if(obj.is(key)){
		gun = this;
		if(tmp = ((tmp = key['#'])||empty)['='] || tmp){ gun = gun.get(tmp) }
		gun._.lex = key;
		return gun;
	} else {
		(as = this.chain())._.err = {err: Gun.log('Invalid get request!', key)}; // CLEAN UP
		if(cb){ cb.call(as, as._.err) }
		return as;
	}
	if(tmp = this._.stun){ // TODO: Refactor?
		gun._.stun = gun._.stun || tmp;
	}
	if(cb && cb instanceof Function){
		gun.get(cb, as);
	}
	return gun;
}
function cache(key, back){
	var cat = back._, next = cat.next, gun = back.chain(), at = gun._;
	if(!next){ next = cat.next = {} }
	next[at.get = key] = at;
	if(back === cat.root.$){
		at.soul = key;
	} else
	if(cat.soul || cat.has){
		at.has = key;
		//if(obj_has(cat.put, key)){
			//at.put = cat.put[key];
		//}
	}
	return at;
}
function soul(gun, cb, opt, as){
	var cat = gun._, acks = 0, tmp;
	if(tmp = cat.soul || cat.link || cat.dub){ return cb(tmp, as, cat) }
	if(cat.jam){ return cat.jam.push([cb, as]) }
	cat.jam = [[cb,as]];
	gun.get(function go(msg, eve){
		if(u === msg.put && (tmp = Object.keys(cat.root.opt.peers).length) && ++acks < tmp){
			return;
		}
		eve.rid(msg);
		var at = ((at = msg.$) && at._) || {}, i = 0, as;
		tmp = cat.jam; delete cat.jam; // tmp = cat.jam.splice(0, 100);
		//if(tmp.length){ process.nextTick(function(){ go(msg, eve) }) }
		while(as = tmp[i++]){ //Gun.obj.map(tmp, function(as, cb){
			var cb = as[0], id; as = as[1];
			cb && cb(id = at.link || at.soul || rel.is(msg.put) || node_soul(msg.put) || at.dub, as, msg, eve);
		} //);
	}, {out: {get: {'.':true}}});
	return gun;
}
function use(msg){
	var eve = this, as = eve.as, cat = as.at, root = cat.root, gun = msg.$, at = (gun||{})._ || {}, data = msg.put || at.put, tmp;
	if((tmp = root.now) && eve !== tmp[as.now]){ return eve.to.next(msg) }
	//if(at.async && msg.root){ return }
	//if(at.async === 1 && cat.async !== true){ return }
	//if(root.stop && root.stop[at.id]){ return } root.stop && (root.stop[at.id] = true);
	//if(!at.async && !cat.async && at.put && msg.put === at.put){ return }
	//else if(!cat.async && msg.put !== at.put && root.stop && root.stop[at.id]){ return } root.stop && (root.stop[at.id] = true);


	//root.stop && (root.stop.id = root.stop.id || Gun.text.random(2));
	//if((tmp = root.stop) && (tmp = tmp[at.id] || (tmp[at.id] = {})) && tmp[cat.id]){ return } tmp && (tmp[cat.id] = true);
	if(eve.seen && at.id && eve.seen[at.id]){ return eve.to.next(msg) }
	//if((tmp = root.stop)){ if(tmp[at.id]){ return } tmp[at.id] = msg.root; } // temporary fix till a better solution?
	if((tmp = data) && tmp[rel._] && (tmp = rel.is(tmp))){
		tmp = ((msg.$$ = at.root.gun.get(tmp))._);
		if(u !== tmp.put){
			msg = obj_to(msg, {put: data = tmp.put});
		}
	}
	if((tmp = root.mum) && at.id){ // TODO: can we delete mum entirely now?
		var id = at.id + (eve.id || (eve.id = Gun.text.random(9)));
		if(tmp[id]){ return }
		if(u !== data && !rel.is(data)){ tmp[id] = true; }
	}
	as.use(msg, eve);
	if(eve.stun){
		eve.stun = null;
		return;
	}
	eve.to.next(msg);
}
function rid(at){
	var cat = this.on;
	if(!at || cat.soul || cat.has){ return this.off() }
	if(!(at = (at = (at = at.$ || at)._ || at).id)){ return }
	var map = cat.map, tmp, seen;
	//if(!map || !(tmp = map[at]) || !(tmp = tmp.at)){ return }
	if(tmp = (seen = this.seen || (this.seen = {}))[at]){ return true }
	seen[at] = true;
	return;
	//tmp.echo[cat.id] = {}; // TODO: Warning: This unsubscribes ALL of this chain's listeners from this link, not just the one callback event.
	//obj.del(map, at); // TODO: Warning: This unsubscribes ALL of this chain's listeners from this link, not just the one callback event.
	return;
}
var obj = Gun.obj, obj_map = obj.map, obj_has = obj.has, obj_to = Gun.obj.to;
var num_is = Gun.num.is;
var rel = Gun.val.link, node_soul = Gun.node.soul, node_ = Gun.node._;
var empty = {}, u;
	