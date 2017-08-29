
var Gun = require('./root');
Gun.chain.put = function(data, cb, as){
	// #soul.field=value>state
	// ~who#where.where=what>when@was
	// TODO: BUG! Put probably cannot handle plural chains!
	var gun = this, at = (gun._), root = at.root, tmp;
	as = as || {};
	as.data = data;
	as.gun = as.gun || gun;
	if(typeof cb === 'string'){
		as.soul = cb;
	} else {
		as.ack = cb;
	}
	if(at.soul){
		as.soul = at.soul;
	}
	if(as.soul || root === gun){
		if(!obj_is(as.data)){
			(as.ack||noop).call(as, as.out = {err: Gun.log("Data saved to the root level of the graph must be a node (an object), not a", (typeof as.data), 'of "' + as.data + '"!')});
			if(as.res){ as.res() }
			return gun;
		}
		as.gun = gun = root.get(as.soul = as.soul || (as.not = Gun.node.soul(as.data) || ((root._).opt.uuid || Gun.text.random)()));
		as.ref = as.gun;
		ify(as);
		return gun;
	}
	if(Gun.is(data)){
		data.get(function(at,ev){ev.off();
			var s = Gun.node.soul(at.put);
			if(!s){Gun.log("The reference you are saving is a", typeof at.put, '"'+ as.put +'", not a node (object)!');return}
			gun.put(Gun.val.rel.ify(s), cb, as);
		});
		return gun;
	}
	as.ref = as.ref || (root === (tmp = at.back))? gun : tmp;
	if(as.ref._.soul && Gun.val.is(as.data) && at.get){
		as.data = obj_put({}, at.get, as.data);
		as.ref.put(as.data, as.soul, as);
		return gun;
	}
	as.ref.get('_').get(any, {as: as});
	if(!as.out){
		// TODO: Perf idea! Make a global lock, that blocks everything while it is on, but if it is on the lock it does the expensive lookup to see if it is a dependent write or not and if not then it proceeds full speed. Meh? For write heavy async apps that would be terrible.
		as.res = as.res || stun; // Gun.on.stun(as.ref); // TODO: BUG! Deal with locking?
		as.gun._.stun = as.ref._.stun;
	}
	return gun;
};

function ify(as){
	as.batch = batch;
	var opt = as.opt||{}, env = as.env = Gun.state.map(map, opt.state);
	env.soul = as.soul;
	as.graph = Gun.graph.ify(as.data, env, as);
	if(env.err){
		(as.ack||noop).call(as, as.out = {err: Gun.log(env.err)});
		if(as.res){ as.res() }
		return;
	}
	as.batch();
}

function stun(cb){
	if(cb){ cb() }
	return;
	var as = this;
	if(!as.ref){ return }
	if(cb){
		as.after = as.ref._.tag;
		as.now = as.ref._.tag = {};
		cb();
		return;
	}
	if(as.after){
		as.ref._.tag = as.after;
	}
}

function batch(){ var as = this;
	if(!as.graph || obj_map(as.stun, no)){ return }
	(as.res||iife)(function(){
		var cat = (as.gun.back(-1)._), ask = cat.ask(function(ack){
			this.off(); // One response is good enough for us currently. Later we may want to adjust this.
			if(!as.ack){ return }
			as.ack(ack, this);
		}, as.opt);
		(as.ref._).on('out', {
			gun: as.ref, put: as.out = as.env.graph, opt: as.opt, '#': ask
		});
	}, as);
	if(as.res){ as.res() }
} function no(v,f){ if(v){ return true } }

function map(v,f,n, at){ var as = this;
	if(f || !at.path.length){ return }
	(as.res||iife)(function(){
		var path = at.path, ref = as.ref, opt = as.opt;
		var i = 0, l = path.length;
		for(i; i < l; i++){
			ref = ref.get(path[i]);
		}
		if(as.not || Gun.node.soul(at.obj)){
			var id = Gun.node.soul(at.obj) || ((as.opt||{}).uuid || as.gun.back('opt.uuid') || Gun.text.random)();
			ref.back(-1).get(id);
			at.soul(id);
			return;
		}
		(as.stun = as.stun || {})[path] = true;
		ref.get('_').get(soul, {as: {at: at, as: as}});
	}, {as: as, at: at});
}

function soul(at, ev){ var as = this.as, cat = as.at; as = as.as;
	//ev.stun(); // TODO: BUG!?
	if(!at.gun || !at.gun._.back){ return } // TODO: Handle
	ev.off();
	at = (at.gun._.back._);
	var id = Gun.node.soul(cat.obj) || Gun.node.soul(at.put) || Gun.val.rel.is(at.put) || ((as.opt||{}).uuid || as.gun.back('opt.uuid') || Gun.text.random)(); // TODO: BUG!? Do we really want the soul of the object given to us? Could that be dangerous?
	at.gun.back(-1).get(id);
	cat.soul(id);
	as.stun[cat.path] = false;
	as.batch();
}

function any(at, ev){
	var as = this.as;
	if(!at.gun || !at.gun._){ return } // TODO: Handle
	if(at.err){ // TODO: Handle
		console.log("Please report this as an issue! Put.any.err");
		return;
	}
	var cat = (at.gun._.back._), data = cat.put, opt = as.opt||{}, root, tmp;
	ev.off();
	if(as.ref !== as.gun){
		tmp = (as.gun._).get || cat.get;
		if(!tmp){ // TODO: Handle
			console.log("Please report this as an issue! Put.no.get"); // TODO: BUG!??
			return;
		}
		as.data = obj_put({}, tmp, as.data);
		tmp = null;
	}
	if(u === data){
		if(!cat.get){ return } // TODO: Handle
		if(!cat.soul){
			tmp = cat.gun.back(function(at){
				if(at.soul){ return at.soul }
				as.data = obj_put({}, at.get, as.data);
			});
		}
		tmp = tmp || cat.get;
		cat = (cat.root.get(tmp)._);
		as.not = as.soul = tmp;
		data = as.data;
	}
	if(!as.not && !(as.soul = Gun.node.soul(data))){
		if(as.path && obj_is(as.data)){ // Apparently necessary
			as.soul = (opt.uuid || cat.root._.opt.uuid || Gun.text.random)();
		} else {
			//as.data = obj_put({}, as.gun._.get, as.data);
			as.soul = at.soul || cat.soul || (opt.uuid || cat.root._.opt.uuid || Gun.text.random)();
		}
	}
	as.ref.put(as.data, as.soul, as);
}
var obj = Gun.obj, obj_is = obj.is, obj_put = obj.put, obj_map = obj.map;
var u, empty = {}, noop = function(){}, iife = function(fn,as){fn.call(as||empty)};
	