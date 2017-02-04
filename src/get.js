
var Gun = require('./root');
Gun.chain.get = function(key, cb, as){
	//if(!as || !as.path){ var back = this._.root; } // TODO: CHANGING API! Remove this line!
	if(typeof key === 'string'){
		var gun, back = back || this, cat = back._;
		var next = cat.next || empty, tmp;
		if(!(gun = next[key])){
			gun = cache(key, back);
		}
	} else
	if(key instanceof Function){
		var gun = this, at = gun._;
		as = cb || {};
		as.use = key;
		as.out = as.out || {};
		as.out.get = as.out.get || {};
		(at.root._).now = true;
		at.on('in', use, as);
		at.on('out', as.out);
		(at.root._).now = false;
		return gun;
	} else
	if(num_is(key)){
		return this.get(''+key, cb, as);
	} else {
		(as = back.chain())._.err = {err: Gun.log('Invalid get request!', key)}; // CLEAN UP
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
	var ev = this, as = ev.as, gun = at.gun, cat = gun._, data = cat.put || at.put, tmp;
	if((tmp = data) && tmp[rel._] && (tmp = rel.is(tmp))){ // an uglier but faster way for checking if it is not a relation, but slower if it is.
		if(null !== as.out.get['.']){
			cat = (gun = cat.root.get(tmp))._;
			if(!obj_has(cat, 'put')){
				ev.to.next(at);
				gun.get(function(at,ev){ev.off()});
				return;
			}
		}
	}
	if(cat.put && (tmp = at.put) && tmp[rel._] && rel.is(tmp)){ // an uglier but faster way for checking if it is not a relation, but slower if it is.
		at = obj_to(at, {put: cat.put});
		//return ev.to.next(at); // For a field that has a relation we want to proxy, if we have already received an update via the proxy then we can deduplicate the update from the field.
	}
	/*
	/*
	//console.debug.i && console.log("????", cat.put, u === cat.put, at.put);
	if(u === cat.put && u !== at.put){ // TODO: Use state instead?
		return ev.to.next(at); // For a field that has a value, but nothing on its context, then that means we have received the update out of order and we will receive it from the context, so we can deduplicate this one.
	}*/
	as.use(at, at.event || ev);
	ev.to.next(at);
}
var obj = Gun.obj, obj_has = obj.has, obj_to = Gun.obj.to;
var rel = Gun.val.rel, node_ = Gun.node._;
var empty = {}, u;
	