//var Gun = Gun || module.exports || require('../gun');
var Gun = Gun || require('../gun');

Gun.chain.chain = function(from){
	var gun = Gun(null);
	from = from || this;
	gun.back = from;
	gun.__ = from.__;
	gun._ = {on: Gun.on.create() };
	return gun;
}

Gun.chain.get = function(key, cb, opt){ // get opens up a reference to a node and loads it.
	var gun = this.chain(), ctx = {};
	if(!key){ return cb.call(gun, {err: Gun.log("No key or relation to get!") }), gun }
	ctx.key = Gun.text.is(key) && key; // if key is text, then key, else false.
	ctx.soul = Gun.is.soul(key); // if key is a soul, then the soul, else false.
	cb = cb || function(){};
	opt = opt || {};
	if(ctx.soul){
		Gun.fns.async(function(){ open(ctx.soul) });
		if(ctx.node = gun.__.graph[ctx.soul]){ // in memory
			cb.call(gun, null, Gun.obj.copy(ctx.node));
		} else { load(key) } // not in memory
	} else 
	if(ctx.key){
		
		(function foo(){ // TODO: UGLY!!!!
			if(ctx.node = gun.__.keys[ctx.key]){ // in memory, or from put.key
				if(true === ctx.node){
					Gun.fns.async(foo);
				} else {
					cb.call(gun, null, Gun.obj.copy(ctx.node));
					Gun.fns.async(function(){ open(Gun.is.soul.on(ctx.node)) });
				}
			} else { load(key) } // not in memory
		})();
		
	} else { cb.call(gun, {err: Gun.log("No key or relation to get!")}) }
	
	function open(soul){
		if(!soul || ctx.open){ return }
		ctx.open = true;
		gun._.on('soul').emit(soul);
	}
	function load(key){
		if(Gun.fns.is(ctx.hook = gun.__.opt.hooks.get)){
			ctx.hook(key, function(err, data){ // multiple times potentially
				//console.log("chain.get from load", err, data);
				if(err){ return cb.call(gun, err, data) }
				if(!data){ return cb.call(gun, null) } // TODO: will have have `not` be based on open?
				if(ctx.soul = Gun.is.soul.on(data)){
					open(ctx.soul);
				} else { return cb.call(gun, {err: Gun.log('No soul on data!') }, data) }
				if(err = Gun.union(gun, data).err){ return cb.call(gun, err) }
				cb.call(gun, null, data);
			}, opt);
		} else {
			root.console.log("Warning! You have no persistence layer to get from!");
			cb.call(gun, null, null); // Technically no error, but no way we can get data.
		}
	}
	return gun;
}

Gun.chain.put = function(val, cb, opt){ // handle case where val is a gun context!
	var gun = this.chain(), drift = Gun.time.is(), flag;
	cb = cb || function(){};
	opt = opt || {};
	
	if(!gun.back.back){
		gun = gun.chain();
		Gun.fns.async(function(){
			flag = true;
			gun.back._.on('soul').emit(Gun.is.soul.on(val) || Gun.roulette.call(gun));
		});
	}
	//gun.back._.on('soul').event(function(soul, field, from, at){
	Gun.when(gun.back, function(soul, field, from, at){
		console.log("chain.put", field, val, "on", soul, 'or', from, at);
		var ctx = {}, obj = val;
		if(Gun.is.value(obj)){
			if(from && at){
				soul = from;
				field = at;
			} // no else!
			if(!field){
				return cb.call(gun, {err: Gun.log("No field exists for " + (typeof obj) + "!")});
			} else
			if(gun.__.graph[soul]){
				ctx.tmp = {};
				ctx.tmp[ctx.field = field] = obj;
				obj = ctx.tmp;
			} else {
				return cb.call(gun, {err: Gun.log("No node exists to put " + (typeof obj) + " in!")});
			}
		}
		if(Gun.obj.is(obj)){
			if(field && !ctx.field){
				ctx.tmp = {};
				ctx.tmp[ctx.field = field] = obj;
				obj = ctx.tmp;
			}
			Gun.ify(obj, function(env, cb){
				var at;
				if(!env || !(at = env.at) || !env.at.node){ return }
				if(!at.node._){
					at.node._ = {};
				}
				if(!Gun.is.soul.on(at.node)){
					if(obj === at.obj){
						env.graph[at.node._[Gun._.soul] = soul] = at.node;
						cb(at, soul);
					} else {
						console.log('we are not at root, where are we at?', at);
						flag? path() : gun.back.path(at.path.join('.'), path);
						function path(err, data){
							var soul = Gun.is.soul.on(data) || Gun.roulette.call(gun);
							console.log("put pathing not root", soul, err, data);
							env.graph[at.node._[Gun._.soul] = soul] = at.node;
							cb(at, soul);
						};
					}
				}
				if(!at.node._[Gun._.HAM]){
					at.node._[Gun._.HAM] = {};
				}
				if(!at.field){ return }
				at.node._[Gun._.HAM][at.field] = drift;
			})(function(err, ify){
				console.log("chain.put PUT", ify.graph);
				if(err || ify.err){ return cb.call(gun, err || ify.err) }
				if(err = Gun.union(gun, ify.graph).err){ return cb.call(gun, err) }
				if(from = Gun.is.soul(ify.root[field])){ soul = from; field = null }
				gun._.on('soul').emit(soul, field);
				if(Gun.fns.is(ctx.hook = gun.__.opt.hooks.put)){
					ctx.hook(ify.graph, function(err, data){ // now iterate through those nodes to a persistence layer and get a callback once all are saved
						if(err){ return cb.call(gun, err) }
						return cb.call(gun, null, data);
					}, opt);
				} else {
					root.console.log("Warning! You have no persistence layer to save to!");
					cb.call(gun, null); // This is in memory success, hardly "success" at all.
				}
			});
		}
	});
	return gun;
}

Gun.chain.key = function(key, cb, opt){
	var gun = this, ctx = {};
	if(!key){ return cb.call(gun, {err: Gun.log('No key!')}), gun }
	cb = cb || function(){};
	opt = opt || {};
	gun.__.keys[key] = true;
	//gun._.on('soul').event(function(soul){
	Gun.when(gun, function(soul){
		Gun.fns.async(function wait(node){ // TODO: UGLY!!! JANKY!!!
			node = gun.__.graph[soul];
			if(true === node){ return Gun.fns.async(wait) }
			gun.__.keys[key] = node;
		});
		if(Gun.fns.is(ctx.hook = gun.__.opt.hooks.key)){
			ctx.hook(key, soul, function(err, data){
				return cb.call(gun, err, data);
			}, opt);
		} else {
			root.console.log("Warning! You have no key hook!");
			cb.call(gun, null); // This is in memory success, hardly "success" at all.
		}
	});
	return gun;
}

Gun.chain.path = function(path, cb){
	var gun = this.chain(), ctx = {};
	cb = cb || function(){};
	path = (Gun.text.ify(path) || '').split('.');
	//gun.back._.on('soul').event(function trace(soul){ // TODO: Check for field as well and merge?
	Gun.when(gun.back, function trace(soul){ // TODO: Check for field as well and merge?
		var node = gun.__.graph[soul], field = node && Gun.text.ify(path.shift()), val;
		console.log("path...", soul, field, node);
		if(!node){ // handle later 
			return Gun.fns.async(function(){ // TODO: UGLY!!! JANKY!!!
				trace(soul);
			});
		} else
		if(path.length){
			if(Gun.is.soul(val = node[field])){
				gun.get(val, function(err, data){
					if(err){ return cb.call(gun, err, data) }
					if(!data){ return cb.call(gun, null) }
					trace(Gun.is.soul.on(data));
				});
			} else {
				cb.call(gun, null);
			}
		} else
		if(!Gun.obj.has(node, field)){ // TODO: THIS MAY NOT BE CORRECT BEHAVIOR!!!!
			cb.call(gun, null, null, field);
			gun._.on('soul').emit(soul, field); // if .put is after, makes sense. If anything else, makes sense to wait.
		} else
		if(Gun.is.soul(val = node[field])){
			gun.get(val, cb);
			gun._.on('soul').emit(Gun.is.soul(val), null, soul, field);
		} else {
			cb.call(gun, null, val, field);
			gun._.on('soul').emit(soul, field);
		}
	});
	
	return gun;
}

Gun.chain.on = function(cb){ // TODO: BUG! Major problem with events is that they won't re-trigger either if listened later.
	var gun = this, ctx = {};
	cb = cb || function(){};
	
	Gun.when(gun, function(soul, field){
		gun.__.on(soul).event(function(delta){
			cb.call(gun, delta);
		});
	});
	
	return gun;
}

Gun.chain.val = function(cb){ // TODO: BUG! Major problem with events is that they won't re-trigger either if listened later.
	var gun = this, ctx = {};
	cb = cb || function(){};
	
	Gun.when(gun, function(soul, field){
		Gun.fns.async(function wait(node){ // TODO: UGLY!!! JANKY!!!
			node = gun.__.graph[soul];
			if(!node || true === node){ return Gun.fns.async(wait) }
			cb.call(gun, field? node[field] : Gun.obj.copy(node));
		});
	});
	
	return gun;
}

Gun.when = function(gun, cb){ // how much memory will this consume?
	var setImmediate = setImmediate || function(cb){return setTimeout(cb,0)};
	Gun.obj.map(gun._.graph, function(on, soul){
		setImmediate(function(){ cb.apply(on, on.args) });
	});
	gun._.on('soul').event(function(soul){
		cb.apply((gun._.graph = gun._.graph || {})[this.soul = soul] = this, this.args = arguments);
	});
}

Gun.union = function(gun, prime){
	var ctx = {};
	ctx.graph = gun.__.graph;
	if(!ctx.graph){ ctx.err = {err: Gun.log("No graph!") } }
	if(!prime){ ctx.err = {err: Gun.log("No data to merge!") } }
	if(ctx.soul = Gun.is.soul.on(prime)){
		ctx.tmp = {};
		ctx.tmp[ctx.soul] = prime;
		prime = ctx.tmp;
	}
	if(ctx.err){ return ctx }
	(function union(graph, prime){
		Gun.obj.map(prime, function(node, soul){
			soul = Gun.is.soul.on(node);
			if(!soul){ return }
			var vertex = graph[soul];
			if(!vertex){ // disjoint
				gun.__.on(soul).emit(graph[soul] = node); // TODO: BUG! We should copy the node in, not pass by reference?
				return;
			}
			Gun.HAM(vertex, node, function(){}, function(vertex, field, value){
				if(!vertex){ return }
				var change = {};
				change._ = change._ || {};
				change._[Gun._.soul] = Gun.is.soul.on(vertex);
				change._[Gun._.HAM] = change._[Gun._.HAM] || {};
				vertex[field] = change[field] = value;
				vertex._[Gun._.HAM][field] = change._[Gun._.HAM][field] = node._[Gun._.HAM][field];
				//context.nodes[change._[Gun._.soul]] = change;
				//context('change').fire(change);
			}, function(){
				
			});
		});
	})(ctx.graph, prime);
	return ctx;
}

Gun.HAM = function(vertex, delta, lower, each, upper){
	var ctx = {};
	Gun.obj.map(delta, function update(incoming, field){
		if(field === Gun._.meta){ return }
		if(!Gun.obj.has(vertex, field)){ // does not need to be applied through HAM
			each.call({incoming: true, converge: true}, vertex, field, incoming);
		}
		var drift = Gun.time.is();
		var value = Gun.is.soul(incoming) || incoming;
		var current = Gun.is.soul(vertex[field]) || vertex[field];
		// TODO! BUG: Check for state existence so we don't crash if it isn't there. Maybe do this in union?
		var state = HAM(drift, delta._[Gun._.HAM][field], vertex._[Gun._.HAM][field], value, current);
		//console.log("the server state is",drift,"with delta:current",delta._[Gun._.HAM][field],vertex._[Gun._.HAM][field]);
		//console.log("having incoming value of",value,'and',current);
		if(state.err){
			root.console.log(".!HYPOTHETICAL AMNESIA MACHINE ERR!.", state.err); // this error should never happen.
			return;
		}
		if(state.state || state.quarantineState || state.current){
			lower.call(state, vertex, field, incoming);
			return;
		}
		if(state.incoming){
			each.call(state, vertex, field, incoming);
			return;
		}
		if(state.amnesiaQuarantine){
			ctx.up += 1;
			Gun.schedule(delta._[Gun._.HAM][field], function(){ // TODO: BUG!!! Don't hardcode this!
				update(incoming, field);
				ctx.up -= 1;
				upper.call(state, vertex, field, incoming);
			});
		}
	});
	function HAM(machineState, incomingState, currentState, incomingValue, currentValue){ // TODO: Lester's comments on roll backs could be vulnerable to divergence, investigate!
		if(machineState < incomingState){
			// the incoming value is outside the boundary of the machine's state, it must be reprocessed in another state.
			return {amnesiaQuarantine: true};
		}
		if(incomingState < currentState){
			// the incoming value is within the boundary of the machine's state, but not within the range.
			return {quarantineState: true};
		}
		if(currentState < incomingState){
			// the incoming value is within both the boundary and the range of the machine's state.
			return {converge: true, incoming: true};
		}
		if(incomingState === currentState){
			if(incomingValue === currentValue){ // Note: while these are practically the same, the deltas could be technically different
				return {state: true};
			}
			/*
				The following is a naive implementation, but will always work.
				Never change it unless you have specific needs that absolutely require it.
				If changed, your data will diverge unless you guarantee every peer's algorithm has also been changed to be the same.
				As a result, it is highly discouraged to modify despite the fact that it is naive,
				because convergence (data integrity) is generally more important.
				Any difference in this algorithm must be given a new and different name.
			*/
			if(String(incomingValue) < String(currentValue)){ // String only works on primitive values!
				return {converge: true, current: true};
			}
			if(String(currentValue) < String(incomingValue)){ // String only works on primitive values!
				return {converge: true, incoming: true};
			}
		}
		return {err: "you have not properly handled recursion through your data or filtered it as JSON"};
	}
}

Gun.ify = (function(){
	function ify(data, cb, opt){
		console.log("=================================================================");
		//Gun.log.verbose = true;
		opt = opt || {};
		cb = cb || function(env, cb){ cb(env.at, Gun.roulette()) };
		var ctx = {}, end = function(fn){
			Gun.fns.async(function wait(){ // TODO: clean this up, possibly?
				if(ctx.err || !Gun.list.map(ctx.seen, function(at){
					if(!at.soul){ return true }
				})){
					fn(ctx.err, ctx)
				} else {
					Gun.fns.async(wait); // TODO: BUG! JANKY!!! Make this cleaner.
				}
			}); 
		}
		if(!data){ return ctx.err = Gun.log('Serializer does not have correct parameters.'), end }
		ctx.at = {};
		ctx.root = {};
		ctx.graph = {};
		ctx.queue = [];
		ctx.seen = [];
		ctx.loop = true;
		
		ctx.at.path = [];
		ctx.at.obj = data;
		ctx.at.node = ctx.root;
		while(ctx.loop && !ctx.err){
			seen(ctx, ctx.at);
			map(ctx, cb);
			if(ctx.queue.length){
				ctx.at = ctx.queue.shift();
			} else {
				ctx.loop = false;
			}
		}
		return end;
	}
	function map(ctx, cb){
		console.log("scanning", Object.keys(ctx.at.obj));
		Gun.obj.map(ctx.at.obj, function(val, field){
			ctx.at.val = val;
			ctx.at.field = field;
			//(ctx.at.path = ctx.at.path || [field]); // TODO: BUG! Do later.
			if(field === Gun._.meta){
				ctx.at.node[field] = Gun.obj.copy(val); // TODO: BUG! Is this correct?
				return;
			}
			if(false && notValidField(field)){ // TODO: BUG! Do later for ACID "consistency" guarantee.
				return ctx.err = {err: Gun.log('Invalid field name on ' + ctx.at.path.join('.'))};
			}
			if(!Gun.is.value(val)){
				var at = {obj: val, node: {}, back: [], path: [field]}, tmp = {}, was;
				at.path = (ctx.at.path||[]).concat(at.path || []);
				if(!Gun.obj.is(val)){
					return ctx.err = {err: Gun.log('Invalid value at ' + at.path.join('.') + '!' )};
				}
				if(was = seen(ctx, at)){
					tmp[Gun._.soul] = Gun.is.soul.on(was.node) || null;
					(was.back = was.back || []).push(ctx.at.node[field] = tmp);
				} else {
					ctx.queue.push(at);
					tmp[Gun._.soul] = null;
					at.back.push(ctx.at.node[field] = tmp);
				}
			} else {
				ctx.at.node[field] = val; // TODO: BUG? the soul could be passed as ref, is that okay?
			}
			cb(ctx, function(at, soul){
				at.soul = at.soul || soul;
				if(!at.back || !at.back.length){ return }
				Gun.list.map(at.back, function(rel){ // TODO: BUG? sync issues?
					rel[Gun._.soul] = at.soul;
				});
			});
		});
	}
	function seen(ctx, at){
		var log = []; ctx.seen.forEach(function(val){ log.push(Object.keys(val.obj)) });
		//console.log('have we seen it yet?\n', at.obj, '\n = \n', log, '\n---------');
		return Gun.list.map(ctx.seen, function(has){
			if(at.obj === has.obj){ return has }
		}) || (ctx.seen.push(at) && false);
	}
	return ify;
}({}));