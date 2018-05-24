
var Gun = require('./root');
Gun.chain.get = function(key, cb, as){
	var gun, tmp;
	if(typeof key === 'string'){
		var back = this, cat = back._;
		var next = cat.next || empty;
		if(!(gun = next[key])){
			gun = cache(key, back);
		}
		gun = gun.gun;
	} else
	if(key instanceof Function){
		gun = this;
		var at = gun._, root = at.root, tmp = root.now, ev;
		as = cb || {};
		as.use = key;
		as.out = as.out || {};
		as.out.get = as.out.get || {};
		ev = at.on('in', use, as);
		(root.now = {$:1})[as.now = at.id] = ev;
		at.on('out', as.out);
		root.now = tmp;
		return gun;
	} else
	if(num_is(key)){
		return this.get(''+key, cb, as);
	} else
	if(tmp = rel.is(key)){
		return this.get(tmp, cb, as);
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
	next[at.get = key] = at;
	if(back === cat.root.gun){
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
function use(msg){
	var ev = this, as = ev.as, gun = msg.gun, at = gun._, root = at.root, data = msg.put, tmp;
	if((tmp = root.now) && ev !== tmp[as.now]){
		return ev.to.next(msg);
	}
	if(u === data){
		data = at.put;
	}
	if((tmp = data) && tmp[rel._] && (tmp = rel.is(tmp))){
		tmp = (at.root.gun.get(tmp)._);
		if(u !== tmp.put){
			msg = obj_to(msg, {put: tmp.put});
		}
	}
	as.use(msg, msg.event || ev);
	ev.to.next(msg);
}
var obj = Gun.obj, obj_has = obj.has, obj_to = Gun.obj.to;
var num_is = Gun.num.is;
var rel = Gun.val.rel, node_ = Gun.node._;
var empty = {}, u;
	