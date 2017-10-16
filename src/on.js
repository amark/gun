
var Gun = require('./index');
Gun.chain.on = function(tag, arg, eas, as){
	var gun = this, at = gun._, tmp, act, off;
	if(typeof tag === 'string'){
		if(!arg){ return at.on(tag) }
		act = at.on(tag, arg, eas || at, as);
		if(eas && eas.gun){
			(eas.subs || (eas.subs = [])).push(act);
		}
		off = function() {
			if (act && act.off) act.off();
			off.off();
		};
		off.off = gun.off.bind(gun) || noop;
		gun.off = off;
		return gun;
	}
	var opt = arg;
	opt = (true === opt)? {change: true} : opt || {};
	opt.ok = tag;
	opt.last = {};
	gun.get(ok, opt); // TODO: PERF! Event listener leak!!!????
	return gun;
}

function ok(at, ev){ var opt = this;
	var gun = at.gun, cat = gun._, data = cat.put || at.put, tmp = opt.last, id = cat.id+at.get, tmp;
	if(u === data){
		return;
	}
	if(data && data[rel._] && (tmp = rel.is(data))){
		tmp = (cat.root.get(tmp)._);
		if(u === tmp.put){
			return;
		}
		data = tmp.put;
	}
	if(opt.change){ // TODO: BUG? Move above the undef checks?
		data = at.put;
	}
	// DEDUPLICATE // TODO: NEEDS WORK! BAD PROTOTYPE
	if(tmp.put === data && tmp.get === id && !Gun.node.soul(data)){ return }
	tmp.put = data;
	tmp.get = id;
	// DEDUPLICATE // TODO: NEEDS WORK! BAD PROTOTYPE
	cat.last = data;
	if(opt.as){
		opt.ok.call(opt.as, at, ev);
	} else {
		opt.ok.call(gun, data, at.get, at, ev);
	}
}

Gun.chain.val = function(cb, opt){
	var gun = this, at = gun._, data = at.put;
	if(0 < at.ack && u !== data){
		(cb || noop).call(gun, data, at.get);
		return gun;
	}
	if(cb){
		(opt = opt || {}).ok = cb;
		opt.cat = at;
		gun.get(val, {as: opt});
		opt.async = true; //opt.async = at.stun? 1 : true;
	} else {
		Gun.log.once("valonce", "Chainable val is experimental, its behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
		var chain = gun.chain();
		chain._.val = gun.val(function(){
			chain._.on('in', gun._);
		});
		return chain;
	}
	return gun;
}

function val(at, ev, to){
	var opt = this.as, cat = opt.cat, gun = at.gun, coat = gun._, data = coat.put || at.put, tmp;
	if(u === data){
		//return;
	}
	if(data && data[rel._] && (tmp = rel.is(data))){
		tmp = (cat.root.get(tmp)._);
		if(u === tmp.put){
			return;
		}
		data = tmp.put;
	}
	if(ev.wait){ clearTimeout(ev.wait) }
	//if(!to && (!(0 < coat.ack) || ((true === opt.async) && 0 !== opt.wait))){
	if(!opt.async){
		ev.wait = setTimeout(function(){
			val.call({as:opt}, at, ev, ev.wait || 1)
		}, opt.wait || 99);
		return;
	}
	if(cat.field || cat.soul){
		if(ev.off()){ return } // if it is already off, don't call again!
	} else {
		if((opt.seen = opt.seen || {})[coat.id]){ return }
		opt.seen[coat.id] = true;
	}
	opt.ok.call(at.gun || opt.gun, data, at.get);
}

Gun.chain.off = function(){
	var gun = this, at = gun._, tmp;
	var back = at.back || {}, cat = back._;
	if(!cat){ return }
	if(tmp = cat.next){
		if(tmp[at.get]){
			obj_del(tmp, at.get);
		} else {
			obj_map(tmp, function(path, key){
				if(gun !== path){ return }
				obj_del(tmp, key);
			});
		}
	}
	if((tmp = gun.back(-1)) === back){
		obj_del(tmp.graph, at.get);
	}
	if(at.ons && (tmp = at.ons['@$'])){
		obj_map(tmp.s, function(ev){
			ev.off();
		});
	}
	return gun;
}
Gun.chain.off = function(){
	var gun = this, at = gun._, tmp;
	var back = at.back || {}, cat = back._;
	if(!cat){ return }
	if(tmp = cat.next){
		if(tmp[at.get]){
			obj_del(tmp, at.get);
		} else {

		}
	}
	if(tmp = at.soul){
		obj_del(cat.root._.graph, tmp);
	}
	return gun;
}
var obj = Gun.obj, obj_has = obj.has, obj_del = obj.del, obj_to = obj.to;
var rel = Gun.val.rel;
var empty = {}, noop = function(){}, u;
	