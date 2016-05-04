var Gun = require('./gun');

Gun.chain.key = (function(){
	Gun.on('put').event(function(gun, at, ctx, opt, cb){
		if(opt.key){ return }
		Gun.is.graph(ctx.ify.graph, function(node, soul){
			var key = {node: gun.__.graph[soul]};
			if(!Gun.is.node.soul(key.node, 'key')){ return }
			if(!gun.__.by(soul).end){ gun.__.by(soul).end = 1 }
			Gun.is.node(key.node, function(rel, s){
				rel = ctx.ify.graph[s] = ctx.ify.graph[s] || Gun.is.node.soul.ify({}, s);
				Gun.is.node(node, function(v,f){ Gun.is.node.state.ify([rel, node], f, v) });
				Gun.obj.del(ctx.ify.graph, soul);
			})
		});
	});
	Gun.on('get').event(function(gun, at, ctx, opt, cb){
		if(ctx.halt){ return } // TODO: CLEAN UP with event emitter option?
		if(opt.key && opt.key.soul){
			at.soul = opt.key.soul;
			gun.__.by(opt.key.soul).node = Gun.union.ify(gun, opt.key.soul); // TODO: Check performance?
			gun.__.by(opt.key.soul).node._['key'] = 'pseudo';
			at.change = Gun.is.node.soul.ify(Gun.obj.copy(at.change || gun.__.by(at.soul).node), at.soul, true); // TODO: Check performance?
			return;
		}
		if(!(Gun.is.node.soul(gun.__.graph[at.soul], 'key') === 1)){ return }
		var node = at.change || gun.__.graph[at.soul];
		function map(rel, soul){ gun.__.gun.get(rel, cb, {key: ctx, chain: opt.chain || gun, force: opt.force}) }
		ctx.halt = true;
		Gun.is.node(node, map);
	},-999);
	return function(key, cb, opt){
		var gun = this;
		opt = Gun.text.is(opt)? {soul: opt} : opt || {};
		cb = cb || function(){}; cb.hash = {};
		if(!Gun.text.is(key) || !key){ return cb.call(gun, {err: Gun.log('No key!')}), gun }
		function index(at){
			var ctx = {node: gun.__.graph[at.soul]};
			if(at.soul === key || at.key === key){ return }
			if(cb.hash[at.hash = at.hash || Gun.on.at.hash(at)]){ return } cb.hash[at.hash] = true;
			ctx.obj = (1 === Gun.is.node.soul(ctx.node, 'key'))? Gun.obj.copy(ctx.node) : Gun.obj.put({}, at.soul, Gun.is.rel.ify(at.soul));
			Gun.obj.as((ctx.put = Gun.is.node.ify(ctx.obj, key, true))._, 'key', 1);
			gun.__.gun.put(ctx.put, function(err, ok){cb.call(this, err, ok)}, {chain: opt.chain, key: true, init: true});
		}
		if(opt.soul){
			index({soul: opt.soul});
			return gun;
		}
		if(gun === gun.back){
			cb.call(gun, {err: Gun.log('You have no context to `.key`', key, '!')});
		} else {
			gun._.at('soul').map(index);
		}
		return gun;
	}
}());