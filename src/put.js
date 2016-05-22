var Gun = require('./gun');

Gun.chain.put = function(val, cb, opt){
	opt = opt || {};
	cb = cb || function(){}; cb.hash = {};
	var gun = this, chain = gun.chain(), tmp = {val: val}, drift = Gun.time.now();
	function put(at){
		var val = tmp.val;
		var ctx = {obj: val}; // prep the value for serialization
		ctx.soul = at.field? at.soul : (at.at && at.at.soul) || at.soul; // figure out where we are
		ctx.field = at.field? at.field : (at.at && at.at.field) || at.field; // did we come from some where?
		if(Gun.is(val)){
			if(!ctx.field){ return cb.call(chain, {err: ctx.err = Gun.log('No field to link node to!')}), chain._.at('err').emit(ctx.err) }
			return val.val(function(node){
				var soul = Gun.is.node.soul(node);
				if(!soul){ return cb.call(chain, {err: ctx.err = Gun.log('Only a node can be linked! Not "' + node + '"!')}), chain._.at('err').emit(ctx.err) }
				tmp.val = Gun.is.rel.ify(soul);
				put(at);
			});
		}
		if(cb.hash[at.hash = at.hash || Gun.on.at.hash(at)]){ return } // if we have already seen this hash...
		cb.hash[at.hash] = true; // else mark that we're processing the data (failure to write could still occur).
		ctx.by = chain.__.by(ctx.soul);
		ctx.not = at.not || (at.at && at.at.not);
		Gun.obj.del(at, 'not'); Gun.obj.del(at.at || at, 'not'); // the data is no longer not known! // TODO: BUG! It could have been asynchronous by the time we now delete these properties. Don't other parts of the code assume their deletion is synchronous?
		if(ctx.field){ Gun.obj.as(ctx.obj = {}, ctx.field, val) } // if there is a field, then data is actually getting put on the parent.
		else if(!Gun.obj.is(val)){ return cb.call(chain, ctx.err = {err: Gun.log("No node exists to put " + (typeof val) + ' "' + val + '" in!')}), chain._.at('err').emit(ctx.err) } // if the data is a primitive and there is no context for it yet, then we have an error.
		// TODO: BUG? gun.get(key).path(field).put() isn't doing it as pseudo.
		function soul(env, cb, map){ var eat;
			if(!env || !(eat = env.at) || !env.at.node){ return }
			if(!eat.node._){ eat.node._ = {} }
			if(!eat.node._[Gun._.state]){ eat.node._[Gun._.state] = {} }
			if(!Gun.is.node.soul(eat.node)){
				if(ctx.obj === eat.obj){
					Gun.obj.as(env.graph, eat.soul = Gun.obj.as(eat.node._, Gun._.soul, Gun.is.node.soul(eat.obj) || ctx.soul), eat.node);
					cb(eat, eat.soul);
				} else {
					var path = function(err, node){
						if(path.opt && path.opt.on && path.opt.on.off){ path.opt.on.off() }
						if(path.opt.done){ return }
						path.opt.done = true;
						if(err){ env.err = err }
						eat.soul = Gun.is.node.soul(node) || Gun.is.node.soul(eat.obj) || Gun.is.node.soul(eat.node) || Gun.text.random();
						Gun.obj.as(env.graph, Gun.obj.as(eat.node._, Gun._.soul, eat.soul), eat.node);
						cb(eat, eat.soul);
					}; path.opt = {put: true};
					(ctx.not)? path() : ((at.field || at.at)? gun.back : gun).path(eat.path || [], path, path.opt);
				}
			}
			if(!eat.field){ return }
			eat.node._[Gun._.state][eat.field] = drift;
		}
		function end(err, ify){
			ctx.ify = ify;
			Gun.on('put').emit(chain, at, ctx, opt, cb, val);
			if(err || ify.err){ return cb.call(chain, err || ify.err), chain._.at('err').emit(err || ify.err) } // check for serialization error, emit if so.
			if(err = Gun.union(chain, ify.graph, {end: false, soul: function(soul){
				if(chain.__.by(soul).end){ return }
				Gun.union(chain, Gun.is.node.soul.ify({}, soul)); // fire off an end node if there hasn't already been one, to comply with the wire spec.
			}}).err){ return cb.call(chain, err), chain._.at('err').emit(err) } // now actually union the serialized data, emit error if any occur.
			if(Gun.fns.is(end.wire = chain.__.opt.wire.put)){
				var wcb = function(err, ok, info){ 
					if(err){ return Gun.log(err.err || err), cb.call(chain, err), chain._.at('err').emit(err) }
					return cb.call(chain, err, ok);
				}
				end.wire(ify.graph, wcb, opt);
			} else {
				if(!Gun.log.count('no-wire-put')){ Gun.log("Warning! You have no persistence layer to save to!") }
				cb.call(chain, null); // This is in memory success, hardly "success" at all.
			}
			if(ctx.field){
				return gun.back.path(ctx.field, null, {chain: opt.chain || chain});
			}
			if(ctx.not){
				return gun.__.gun.get(ctx.soul, null, {chain: opt.chain || chain});
			}
			chain.get(ctx.soul, null, {chain: opt.chain || chain, at: gun._.at })
		}
		Gun.ify(ctx.obj, soul, {pure: true})(end); // serialize the data!
	}
	if(gun === gun.back){ // if we are the root chain...
		put({soul: Gun.is.node.soul(val) || Gun.text.random(), not: true}); // then cause the new chain to save data!
	} else { // else if we are on an existing chain then...
		gun._.at('soul').map(put); // put data on every soul that flows through this chain.
		var back = function(gun){
			if(back.get || gun.back === gun || gun._.not){ return } // TODO: CLEAN UP! Would be ideal to accomplish this in a more ideal way.
			if(gun._.get){ back.get = true }
			gun._.at('null').event(function(at){
				if(opt.init || gun.__.opt.init){ return Gun.log("Warning! You have no context to `.put`", val, "!") }
				gun.init();
			}, -999);
			return back(gun.back);
		};
		if(!opt.init && !gun.__.opt.init){ back(gun) }
	}
	chain.back = gun.back;
	return chain;
}