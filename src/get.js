
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
		var gun = this, at = gun._, root = at.root._, tmp = root.now, ev;
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
	if(cat.root === back){ 
		at.soul = key;
	} else
	if(cat.soul || cat.field || cat.has){  // TODO: Convert field to has!
		at.field = at.has = key;
		if(obj_has(cat.put, key)){
			//at.put = cat.put[key];
		}
	}
	return gun;
}
function use(msg){
	var ev = this, as = ev.as, gun = msg.gun, at = gun._, root = at.root._, data = msg.put, tmp;
	if((tmp = root.now) && ev !== tmp[as.now]){
		return ev.to.next(msg);
	}
	if(u === data){
		data = at.put;
	}
	if((tmp = data) && tmp[rel._] && (tmp = rel.is(tmp))){
		tmp = (at.root.get(tmp)._);
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
	