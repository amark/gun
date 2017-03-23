
var Gun = require('./root');
Gun.chain.get = function(key, cb, as){
	if(typeof key === 'string'){
		var gun, back = this, cat = back._;
		var next = cat.next || empty, tmp;
		if(!(gun = next[key])){
			gun = cache(key, back);
		}
	} else
	if(key instanceof Function){
		var gun = this, at = gun._;
		as = cb || {};
		as.use = key;
		as.out = as.out || {cap: 1};
		as.out.get = as.out.get || {};
		'_' != at.get && ((at.root._).now = true); // ugly hack for now.
		at.on('in', use, as);
		at.on('out', as.out);
		(at.root._).now = false;
		return gun;
	} else
	if(num_is(key)){
		return this.get(''+key, cb, as);
	} else {
		(as = this.chain())._.err = {err: Gun.log('Invalid get request!', key)}; // CLEAN UP
		if(cb){ cb.call(as, as._.err) }
		return as;
	}
	if(tmp = cat.stun){ // TODO: Refactor?
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
	next[at.get = key] = gun;
	if(cat.root === back){ at.soul = key }
	else if(cat.soul || cat.field){ at.field = key }
	return gun;
}
function use(at){
	var ev = this, as = ev.as, gun = at.gun, cat = gun._, data = at.put, tmp;
	if(u === data){
		data = cat.put;
	}
	if((tmp = data) && tmp[rel._] && (tmp = rel.is(tmp))){
		tmp = (cat.root.get(tmp)._);
		if(u !== tmp.put){
			at = obj_to(at, {put: tmp.put});
		}
	}
	as.use(at, at.event || ev);
	ev.to.next(at);
}
var obj = Gun.obj, obj_has = obj.has, obj_to = Gun.obj.to;
var num_is = Gun.num.is;
var rel = Gun.val.rel, node_ = Gun.node._;
var empty = {}, u;
	