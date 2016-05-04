var Gun = require('./gun');

Gun.chain.path = (function(){
	Gun.on('get').event(function(gun, at, ctx, opt, cb, lex){
		if(ctx.halt){ return } // TODO: CLEAN UP with event emitter option?
		if(opt.path){ at.at = opt.path }
		var xtc = {soul: lex[Gun._.soul], field: lex[Gun._.field]};
		xtc.change = at.change || gun.__.by(at.soul).node;
		if(xtc.field){ // TODO: future feature!
			if(!Gun.obj.has(xtc.change, xtc.field)){ return }
			ctx.node = Gun.is.node.soul.ify({}, at.soul); // TODO: CLEAN UP! ctx.node usage.
			Gun.is.node.state.ify([ctx.node, xtc.change], xtc.field, xtc.change[xtc.field]);
			at.change = ctx.node; at.field = xtc.field;
		}
	},-99);
	Gun.on('get').event(function(gun, at, ctx, opt, cb, lex){
		if(ctx.halt){ return } // TODO: CLEAN UP with event emitter option?
		var xtc = {}; xtc.change = at.change || gun.__.by(at.soul).node;
		if(!opt.put){ // TODO: CLEAN UP be nice if path didn't have to worry about this.
			Gun.is.node(xtc.change, function(v,f){
				var fat = Gun.on.at.copy(at); fat.field = f; fat.value = v;
				Gun.obj.del(fat, 'at'); // TODO: CLEAN THIS UP! It would be nice in every other function every where else it didn't matter whether there was a cascading at.at.at.at or not, just and only whether the current context as a field or should rely on a previous field. But maybe that is the gotcha right there?
				fat.change = fat.change || xtc.change;
				if(v = Gun.is.rel(fat.value)){ fat = {soul: v, at: fat} }
				gun._.at('path:' + f).emit(fat).chain(opt.chain);
			});
		}
		if(!ctx.end){
			ctx.end = gun._.at('end').emit(at).chain(opt.chain);
		}
	},99);
	return function(path, cb, opt){
		opt = opt || {};
		cb = cb || (function(){ var cb = function(){}; cb.no = true; return cb }()); cb.hash = {};
		var gun = this, chain = gun.chain(), f, c, u;
		if(!Gun.list.is(path)){ if(!Gun.text.is(path)){ if(!Gun.num.is(path)){ // if not a list, text, or number
			return cb.call(chain, {err: Gun.log("Invalid path '" + path + "'!")}), chain; // then complain
		} else { return this.path(path + '', cb, opt)  } } else { return this.path(path.split('.'), cb, opt) } } // else coerce upward to a list.
		if(gun === gun.back){
			cb.call(chain, opt.put? null : {err: Gun.log('You have no context to `.path`', path, '!')});
			return chain;
		}
		gun._.at('path:' + path[0]).event(function(at){
			if(opt.done){ this.off(); return } // TODO: BUG - THIS IS A FIX FOR A BUG! TEST #"context no double emit", COMMENT THIS LINE OUT AND SEE IT FAIL!
			var ctx = {soul: at.soul, field: at.field, by: gun.__.by(at.soul)}, field = path[0];
			var on = Gun.obj.as(cb.hash, at.hash, {off: function(){}});
			if(at.soul === on.soul){ return }
			else { on.off() }
			if(ctx.rel = (Gun.is.rel(at.value) || Gun.is.rel(at.at && at.at.value))){
				if(opt.put && 1 === path.length){
					return cb.call(ctx.by.chain || chain, null, Gun.is.node.soul.ify({}, ctx.rel));
				}
				var get = function(err, node){
					if(!err && 1 !== path.length){ return }
					cb.call(this, err, node, field);
				};
				ctx.opt = {chain: opt.chain || chain, put: opt.put, path: {soul: (at.at && at.at.soul) || at.soul, field: field }};
				gun.__.gun.get(ctx.rel || at.soul, cb.no? null : get, ctx.opt);
				(opt.on = cb.hash[at.hash] = on = ctx.opt.on).soul = at.soul; // TODO: BUG! CB getting reused as the hash point for multiple paths potentially! Could cause problems!
				return;
			}
			if(1 === path.length){ cb.call(ctx.by.chain || chain, null, at.value, ctx.field) }
			chain._.at('soul').emit(at).chain(opt.chain);
		});
		gun._.at('null').only(function(at){
			if(!at.field){ return }
			if(at.not){ 
				gun.put({}, null, {init: true});
				if(opt.init || gun.__.opt.init){ return }
			}
			(at = Gun.on.at.copy(at)).field = path[0];
			at.not = true;
			chain._.at('null').emit(at).chain(opt.chain);
		});
		gun._.at('end').event(function(at){
			this.off();
			if(at.at && at.at.field === path[0]){ return } // TODO: BUG! THIS FIXES SO MANY PROBLEMS BUT DOES IT CATCH VARYING SOULS EDGE CASE?
			var ctx = {by: gun.__.by(at.soul)};
			if(Gun.obj.has(ctx.by.node, path[0])){ return }
			(at = Gun.on.at.copy(at)).field = path[0];
			at.not = true;
			cb.call(ctx.by.chain || chain, null);
			chain._.at('null').emit(at).chain(opt.chain);
		});
		if(path.length > 1){
			(c = chain.path(path.slice(1), cb, opt)).back = gun;
		}
		return c || chain;
	}
}());