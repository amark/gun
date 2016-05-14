var Gun = require('./gun');

Gun.chain.get = (function(){
	Gun.on('operating').event(function(gun, at){
		if(!gun.__.by(at.soul).node){ gun.__.by(at.soul).node = gun.__.graph[at.soul]  }
		if(at.field){ return } // TODO: It would be ideal to reuse HAM's field emit.
		gun.__.on(at.soul).emit(at);
	});
	Gun.on('get').event(function(gun, at, ctx, opt, cb){
		if(ctx.halt){ return } // TODO: CLEAN UP with event emitter option?
		at.change = at.change || gun.__.by(at.soul).node;
		if(opt.raw){ return cb.call(opt.on, at) }
		if(!ctx.cb.no){ cb.call(ctx.by.chain, null, Gun.obj.copy(ctx.node || gun.__.by(at.soul).node)) }
		gun._.at('soul').emit(at).chain(opt.chain);
	},0);
	Gun.on('get').event(function(gun, at, ctx){
		if(ctx.halt){ ctx.halt = false; return } // TODO: CLEAN UP with event emitter option?
	}, Infinity);
	return function(lex, cb, opt){ // get opens up a reference to a node and loads it.
		var gun = this, ctx = {
			opt: opt || {},
			cb: cb || function(){},
			lex: (Gun.text.is(lex) || Gun.num.is(lex))? Gun.is.rel.ify(lex) : lex,
		};
		ctx.force = ctx.opt.force;
		if(cb !== ctx.cb){ ctx.cb.no = true }
		if(!Gun.obj.is(ctx.lex)){ return ctx.cb.call(gun = gun.chain(), {err: Gun.log('Invalid get request!', lex)}), gun }
		if(!(ctx.soul = ctx.lex[Gun._.soul])){ return ctx.cb.call(gun = this.chain(), {err: Gun.log('No soul to get!')}), gun } // TODO: With `.all` it'll be okay to not have an exact match!
		ctx.by = gun.__.by(ctx.soul);
		ctx.by.chain = ctx.by.chain || gun.chain();
		function load(lex){
			var soul = lex[Gun._.soul];
			var cached = gun.__.by(soul).node || gun.__.graph[soul];
			if(ctx.force){ ctx.force = false }
			else if(cached){ return false }
			wire(lex, stream, ctx.opt);
			return true;
		}
		function stream(err, data, info){
			//console.log("wire.get <--", err, data);
			Gun.on('wire.get').emit(ctx.by.chain, ctx, err, data, info);
			if(err){
				Gun.log(err.err || err);
				ctx.cb.call(ctx.by.chain, err);
				return ctx.by.chain._.at('err').emit({soul: ctx.soul, err: err.err || err}).chain(ctx.opt.chain);
			}
			if(!data){
				ctx.cb.call(ctx.by.chain, null);
				return ctx.by.chain._.at('null').emit({soul: ctx.soul, not: true}).chain(ctx.opt.chain);
			}
			if(Gun.obj.empty(data)){ return }
			if(err = Gun.union(ctx.by.chain, data).err){
				ctx.cb.call(ctx.by.chain, err);
				return ctx.by.chain._.at('err').emit({soul: Gun.is.node.soul(data) || ctx.soul, err: err.err || err}).chain(ctx.opt.chain);
			}
		}
		function wire(lex, cb, opt){
			Gun.on('get.wire').emit(ctx.by.chain, ctx, lex, cb, opt);
			if(Gun.fns.is(gun.__.opt.wire.get)){ return gun.__.opt.wire.get(lex, cb, opt) }
			if(!Gun.log.count('no-wire-get')){ Gun.log("Warning! You have no persistence layer to get from!") }
			cb(null); // This is in memory success, hardly "success" at all.
		}
		function on(at){
			if(on.ran = true){ ctx.opt.on = this }
			if(load(ctx.lex)){ return }
			Gun.on('get').emit(ctx.by.chain, at, ctx, ctx.opt, ctx.cb, ctx.lex);
		}
		ctx.opt.on = (ctx.opt.at || gun.__.at)(ctx.soul).event(on);
		ctx.by.chain._.get = ctx.lex;
		if(!ctx.opt.ran && !on.ran){ on.call(ctx.opt.on, {soul: ctx.soul}) }
		return ctx.by.chain;
	}
}());