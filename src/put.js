
var Gun = require('./root');
Gun.chain.put = function(data, cb, as){
	// #soul.has=value>state
	// ~who#where.where=what>when@was
	// TODO: BUG! Put probably cannot handle plural chains!
	var gun = this, at = (gun._), root = at.root.$, tmp;
	as = as || {};
	as.data = data;
	as.via = as.$ = as.via || as.$ || gun;
	if(typeof cb === 'string'){
		as.soul = cb;
	} else {
		as.ack = as.ack || cb;
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
		as.soul = as.soul || (as.not = Gun.node.soul(as.data) || (as.via.back('opt.uuid') || Gun.text.random)());
		if(!as.soul){ // polyfill async uuid for SEA
			as.via.back('opt.uuid')(function(err, soul){ // TODO: improve perf without anonymous callback
				if(err){ return Gun.log(err) } // TODO: Handle error!
				(as.ref||as.$).put(as.data, as.soul = soul, as);
			});
			return gun;
		}
		as.$ = root.get(as.soul);
		as.ref = as.$;
		ify(as);
		return gun;
	}
	if(Gun.is(data)){
		data.get(function(soul, o, msg){
			if(!soul && Gun.val.is(msg.put)){
				return Gun.log("The reference you are saving is a", typeof msg.put, '"'+ msg.put +'", not a node (object)!');
			}
			gun.put(Gun.val.rel.ify(soul), cb, as);
		}, true);
		return gun;
	}
	as.ref = as.ref || (root._ === (tmp = at.back))? gun : tmp.$;
	if(as.ref._.soul && Gun.val.is(as.data) && at.get){
		as.data = obj_put({}, at.get, as.data);
		as.ref.put(as.data, as.soul, as);
		return gun;
	}
	as.ref.get(any, true, {as: as});
	if(!as.out){
		// TODO: Perf idea! Make a global lock, that blocks everything while it is on, but if it is on the lock it does the expensive lookup to see if it is a dependent write or not and if not then it proceeds full speed. Meh? For write heavy async apps that would be terrible.
		as.res = as.res || stun; // Gun.on.stun(as.ref); // TODO: BUG! Deal with locking?
		as.$._.stun = as.ref._.stun;
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
	as.res = as.res || function(cb){ if(cb){ cb() } };
	as.res(function(){
		var cat = (as.$.back(-1)._), ask = cat.ask(function(ack){
			cat.root.on('ack', ack);
			if(ack.err){ Gun.log(ack) }
			if(!ack.lack){ this.off() } // One response is good enough for us currently. Later we may want to adjust this.
			if(!as.ack){ return }
			as.ack(ack, this);
		}, as.opt);
		// NOW is a hack to get synchronous replies to correctly call.
		// and STOP is a hack to get async behavior to correctly call.
		// neither of these are ideal, need to be fixed without hacks,
		// but for now, this works for current tests. :/
		var tmp = cat.root.now; obj.del(cat.root, 'now');
		var mum = cat.root.mum; cat.root.mum = {};
		(as.ref._).on('out', {
			$: as.ref, put: as.out = as.env.graph, opt: as.opt, '#': ask
		});
		cat.root.mum = mum? obj.to(mum, cat.root.mum) : mum;
		cat.root.now = tmp;
	}, as);
	if(as.res){ as.res() }
} function no(v,k){ if(v){ return true } }

function map(v,k,n, at){ var as = this;
	var is = Gun.is(v);
	if(k || !at.path.length){ return }
	(as.res||iife)(function(){
		var path = at.path, ref = as.ref, opt = as.opt;
		var i = 0, l = path.length;
		for(i; i < l; i++){
			ref = ref.get(path[i]);
		}
		if(is){ ref = v }
		var id = (ref._).dub;
		if(id || (id = Gun.node.soul(at.obj))){
			ref.back(-1).get(id);
			at.soul(id);
			return;
		}
		(as.stun = as.stun || {})[path] = true;
		ref.get(soul, true, {as: {at: at, as: as, p:path}});
	}, {as: as, at: at});
	//if(is){ return {} }
}

function soul(id, as, msg, eve){
	var as = as.as, cat = as.at; as = as.as;
	var at = ((msg || {}).$ || {})._ || {};
	id = at.dub = at.dub || id || Gun.node.soul(cat.obj) || Gun.node.soul(msg.put || at.put) || Gun.val.rel.is(msg.put || at.put) || (as.via.back('opt.uuid') || Gun.text.random)(); // TODO: BUG!? Do we really want the soul of the object given to us? Could that be dangerous?
	if(eve){ eve.stun = true }
	if(!id){ // polyfill async uuid for SEA
		at.via.back('opt.uuid')(function(err, id){ // TODO: improve perf without anonymous callback
			if(err){ return Gun.log(err) } // TODO: Handle error.
			solve(at, at.dub = at.dub || id, cat, as);
		});
		return;
	}
	solve(at, at.dub = id, cat, as);
}

function solve(at, id, cat, as){
	at.$.back(-1).get(id);
	cat.soul(id);
	as.stun[cat.path] = false;
	as.batch();
}

function any(soul, as, msg, eve){
	as = as.as;
	if(!msg.$ || !msg.$._){ return } // TODO: Handle
	if(msg.err){ // TODO: Handle
		console.log("Please report this as an issue! Put.any.err");
		return;
	}
	var at = (msg.$._), data = at.put, opt = as.opt||{}, root, tmp;
	if((tmp = as.ref) && tmp._.now){ return }
	if(eve){ eve.stun = true }
	if(as.ref !== as.$){
		tmp = (as.$._).get || at.get;
		if(!tmp){ // TODO: Handle
			console.log("Please report this as an issue! Put.no.get"); // TODO: BUG!??
			return;
		}
		as.data = obj_put({}, tmp, as.data);
		tmp = null;
	}
	if(u === data){
		if(!at.get){ return } // TODO: Handle
		if(!soul){
			tmp = at.$.back(function(at){
				if(at.link || at.soul){ return at.link || at.soul }
				as.data = obj_put({}, at.get, as.data);
			});
		}
		tmp = tmp || at.soul || at.link || at.dub;// || at.get;
		at = tmp? (at.root.$.get(tmp)._) : at;
		as.soul = tmp;
		data = as.data;
	}
	if(!as.not && !(as.soul = as.soul || soul)){
		if(as.path && obj_is(as.data)){
			as.soul = (opt.uuid || as.via.back('opt.uuid') || Gun.text.random)();
		} else {
			//as.data = obj_put({}, as.$._.get, as.data);
			if(node_ == at.get){
				as.soul = (at.put||empty)['#'] || at.dub;
			}
			as.soul = as.soul || at.soul || at.soul || (opt.uuid || as.via.back('opt.uuid') || Gun.text.random)();
		}
		if(!as.soul){ // polyfill async uuid for SEA
			as.via.back('opt.uuid')(function(err, soul){ // TODO: improve perf without anonymous callback
				if(err){ return Gun.log(err) } // Handle error.
				as.ref.put(as.data, as.soul = soul, as);
			});
			return;
		}
	}
	as.ref.put(as.data, as.soul, as);
}
var obj = Gun.obj, obj_is = obj.is, obj_put = obj.put, obj_map = obj.map;
var u, empty = {}, noop = function(){}, iife = function(fn,as){fn.call(as||empty)};
var node_ = Gun.node._;
	