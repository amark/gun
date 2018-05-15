
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
	gun.get(ok, opt); // TODO: PERF! Event listener leak!!!?
	return gun;
}

function ok(at, ev){ var opt = this;
	var gun = at.gun, cat = gun._, data = cat.put || at.put, tmp = opt.last, id = cat.id+at.get, tmp;
	if(u === data){
		return;
	}
	if(data && data[rel._] && (tmp = rel.is(data))){
		tmp = (cat.root.gun.get(tmp)._);
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
	Gun.log.once("onceval", "Future Breaking API Change: .val -> .once, apologies unexpected.");
	return this.once(cb, opt);
}
Gun.chain.once = function(cb, opt){
	var gun = this, at = gun._, data = at.put;
	if(0 < at.ack && u !== data){
		(cb || noop).call(gun, data, at.get);
		return gun;
	}
	if(cb){
		(opt = opt || {}).ok = cb;
		opt.cat = at;
		opt.out = {'#': Gun.text.random(9)};
		gun.get(val, {as: opt});
		opt.async = true; //opt.async = at.stun? 1 : true;
	} else {
		Gun.log.once("valonce", "Chainable val is experimental, its behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
		var chain = gun.chain();
		chain._.val = gun.once(function(){
			chain._.on('in', gun._);
		});
		return chain;
	}
	return gun;
}

function val(msg, ev, to){
	var opt = this.as, cat = opt.cat, gun = msg.gun, coat = gun._, data = coat.put || msg.put, tmp;
	if(u === data){
		//return;
	}
	//if(coat.soul && !(0 < coat.ack)){ return }
	if(tmp = Gun.node.soul(data) || rel.is(data)){
	//if(data && data[rel._] && (tmp = rel.is(data))){
		tmp = (cat.root.gun.get(tmp)._);
		if(u === tmp.put){//} || !(0 < tmp.ack)){
			return;
		}
		data = tmp.put;
	}
	if(ev.wait){ clearTimeout(ev.wait) }
	//if(!to && (!(0 < coat.ack) || ((true === opt.async) && 0 !== opt.wait))){
	if(!to){
		ev.wait = setTimeout(function(){
			val.call({as:opt}, msg, ev, ev.wait || 1);
		}, opt.wait || 99);
		return;
	}
	if(cat.has || cat.soul){
		if(ev.off()){ return } // if it is already off, don't call again!
	} else {
		if((opt.seen = opt.seen || {})[coat.id]){ return }
		opt.seen[coat.id] = true;
	}
	opt.ok.call(msg.gun || opt.gun, data, msg.get);
}

Gun.chain.off = function(){
	// make off more aggressive. Warning, it might backfire!
	var gun = this, at = gun._, tmp;
	var cat = at.back;
	if(!cat){ return }
	if(tmp = cat.next){
		if(tmp[at.get]){
			obj_del(tmp, at.get);
		} else {

		}
	}
	if(tmp = cat.ask){
		obj_del(tmp, at.get);
	}
	if(tmp = cat.put){
		obj_del(tmp, at.get);
	}
	if(tmp = at.soul){
		obj_del(cat.root.graph, tmp);
	}
	if(tmp = at.map){
		obj_map(tmp, function(at){
			if(at.rel){
				cat.root.gun.get(at.rel).off();
			}
		});
	}
	if(tmp = at.next){
		obj_map(tmp, function(neat){
			neat.gun.off();
		});
	}
	at.on('off', {});
	return gun;
}
var obj = Gun.obj, obj_map = obj.map, obj_has = obj.has, obj_del = obj.del, obj_to = obj.to;
var rel = Gun.val.rel;
var empty = {}, noop = function(){}, u;
	