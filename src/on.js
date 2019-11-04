
var Gun = require('./index');
Gun.chain.on = function(tag, arg, eas, as){
	var gun = this, at = gun._, tmp, act, off;
	if(typeof tag === 'string'){
		if(!arg){ return at.on(tag) }
		act = at.on(tag, arg, eas || at, as);
		if(eas && eas.$){
			(eas.subs || (eas.subs = [])).push(act);
		}
		return gun;
	}
	var opt = arg;
	opt = (true === opt)? {change: true} : opt || {};
	opt.at = at;
	opt.ok = tag;
	//opt.last = {};
	gun.get(ok, opt); // TODO: PERF! Event listener leak!!!?
	return gun;
}

function ok(msg, ev){ var opt = this;
	var gun = msg.$, at = (gun||{})._ || {}, data = at.put || msg.put, cat = opt.at, tmp;
	if(u === data){
		return;
	}
	if(tmp = msg.$$){
		tmp = (msg.$$._);
		if(u === tmp.put){
			return;
		}
		data = tmp.put;
	}
	if(opt.change){ // TODO: BUG? Move above the undef checks?
		data = msg.put;
	}
	// DEDUPLICATE // TODO: NEEDS WORK! BAD PROTOTYPE
	//if(tmp.put === data && tmp.get === id && !Gun.node.soul(data)){ return }
	//tmp.put = data;
	//tmp.get = id;
	// DEDUPLICATE // TODO: NEEDS WORK! BAD PROTOTYPE
	//at.last = data;
	if(opt.as){
		opt.ok.call(opt.as, msg, ev);
	} else {
		opt.ok.call(gun, data, msg.get, msg, ev);
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
		opt.at = at;
		opt.out = {'#': Gun.text.random(9)};
		gun.get(val, {as: opt});
		opt.async = true; //opt.async = at.stun? 1 : true;
	} else {
		Gun.log.once("valonce", "Chainable val is experimental, its behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
		var chain = gun.chain();
		chain._.nix = gun.once(function(){
			chain._.on('in', gun._);
		});
		return chain;
	}
	return gun;
}

function val(msg, eve, to){
	if(!msg.$){ eve.off(); return }
	var opt = this.as, cat = opt.at, gun = msg.$, at = gun._, data = at.put || msg.put, link, tmp;
	if(tmp = msg.$$){
		link = tmp = (msg.$$._);
		if(u !== link.put){
			data = link.put;
		}
	}
	if((tmp = eve.wait) && (tmp = tmp[at.id])){ clearTimeout(tmp) }
	eve.ack = (eve.ack||0)+1;
	if(!to && u === data && eve.ack <= (opt.acks || Object.keys(at.root.opt.peers).length)){ return }
	if((!to && (u === data || at.soul || at.link || (link && !(0 < link.ack))))
	|| (u === data && (tmp = Object.keys(at.root.opt.peers).length) && (!to && (link||at).ack < tmp))){
		tmp = (eve.wait = {})[at.id] = setTimeout(function(){
			val.call({as:opt}, msg, eve, tmp || 1);
		}, opt.wait || 99);
		return;
	}
	if(link && u === link.put && (tmp = rel.is(data))){ data = Gun.node.ify({}, tmp) }
	eve.rid? eve.rid(msg) : eve.off();
	opt.ok.call(gun || opt.$, data, msg.get);
}

Gun.chain.off = function(){
	// make off more aggressive. Warning, it might backfire!
	var gun = this, at = gun._, tmp;
	var cat = at.back;
	if(!cat){ return }
	at.ack = 0; // so can resubscribe.
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
			if(at.link){
				cat.root.$.get(at.link).off();
			}
		});
	}
	if(tmp = at.next){
		obj_map(tmp, function(neat){
			neat.$.off();
		});
	}
	at.on('off', {});
	return gun;
}
var obj = Gun.obj, obj_map = obj.map, obj_has = obj.has, obj_del = obj.del, obj_to = obj.to;
var rel = Gun.val.link;
var empty = {}, noop = function(){}, u;
	