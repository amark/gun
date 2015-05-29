;(function(){
	function Gun(opt){
		var gun = this;
		if(!Gun.is(gun)){ // if this is not a GUN instance,
			return new Gun(opt); // then make it so.
		}
		gun.opt(opt);
	}
	Gun._ = { // some reserved key words, these are not the only ones.
		soul: '#'
		,meta: '_'
		,HAM: '>'
	}
	;(function(Gun){ // GUN specific utilities
		Gun.version = 0.1; // TODO: When Mark (or somebody) does a push/publish, dynamically update package.json
		Gun.is = function(gun){ return (gun instanceof Gun)? true : false }
		Gun.is.value = function(v){ // null, binary, number (!Infinity), text, or a rel (soul).
			if(v === null){ return true } // deletes
			if(v === Infinity){ return false } // we want this to be, but JSON does not support it, sad face.
			if(Gun.bi.is(v)
			|| Gun.num.is(v)
			|| Gun.text.is(v)){
				return true; // simple values
			}
			var id;
			if(id = Gun.is.soul(v)){
				return id;
			}
			return false;
		}
		Gun.is.value.as = function(v){
			return Gun.is.value(v)? v : null;
		}
		Gun.is.soul = function(v){
			if(Gun.obj.is(v)){
				var id;
				Gun.obj.map(v, function(soul, field){
					if(id){ return id = false } // if ID is already defined AND we're still looping through the object, it is invalid.
					if(field == Gun._.soul && Gun.text.is(soul)){
						id = soul; // we found the soul!
					} else {
						return id = false; // if there exists anything else on the object, that isn't the soul, then it is invalid.
					}
				});
				if(id){
					return id;
				}
			}
			return false;
		}
		Gun.is.soul.on = function(n){ return (n && n._ && n._[Gun._.soul]) || false }
		Gun.is.node = function(node, cb){
			if(!Gun.obj.is(node)){ return false }
			if(Gun.is.soul.on(node)){
				return !Gun.obj.map(node, function(value, field){ // need to invert this, because the way we check for this is via a negation.
					if(field == Gun._.meta){ return } // skip this.
					if(!Gun.is.value(value)){ return true } // it is true that this is an invalid node.
					if(cb){ cb(value, field) }
				});
			}
			return false;
		}
		Gun.is.graph = function(graph, cb, fn){
			var exist = false;
			if(!Gun.obj.is(graph)){ return false }
			return !Gun.obj.map(graph, function(node, soul){ // need to invert this, because the way we check for this is via a negation.
				if(!node || soul !== Gun.is.soul.on(node) || !Gun.is.node(node, fn)){ return true } // it is true that this is an invalid graph.
				if(cb){ cb(node, soul) }
				exist = true;
			}) && exist;
		}
		// Gun.ify // the serializer is too long for right here, it has been relocated towards the bottom.
		Gun.union = function(graph, prime){ // graph is current, prime is incoming.
			var context = Gun.shot();
			context.nodes = {};
			context('done');
			context('change');
			Gun.obj.map(prime, function(node, soul){
				var vertex = graph[soul], env;
				if(!vertex){ // disjoint
					context.nodes[node._[Gun._.soul]] = graph[node._[Gun._.soul]] = node;
					context('change').fire(node);
					return;
				}
				env = Gun.HAM(vertex, node, function(current, field, deltaValue){ // vertex is current, node is incoming.
					if(!current){ return }
					var change = {};
					current[field] = change[field] = deltaValue; // current and vertex are the same
					current._[Gun._.HAM][field] = node._[Gun._.HAM][field];
					change._ = current._;
					context.nodes[change._[Gun._.soul]] = change;
					context('change').fire(change);
				}).upper(function(c){
					context.err = c.err;
					context.up -= 1;
					if(!context.up){
						context('done').fire(context.err, context);
					}
				});
				context.up += env.up;
			});
			if(!context.up){
				context('done').fire(context.err, context);
			}
			return context;
		}
		Gun.HAM = function(current, delta, each){ // HAM only handles primitives values, all other data structures need to be built ontop and reduce to HAM.
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
			var context = Gun.shot();
			context.HAM = {};
			context.states = {};
			context.states.delta = delta._[Gun._.HAM];
			context.states.current = current._[Gun._.HAM] = current._[Gun._.HAM] || {};
			context('lower');context('upper');context.up = context.up || 0;
			Gun.obj.map(delta, function update(deltaValue, field){
				if(field === Gun._.meta){ return }
				if(!Gun.obj.has(current, field)){ // does not need to be applied through HAM
					each.call({incoming: true, converge: true}, current, field, deltaValue); // done synchronously
					return;
				}
				var machineState = Gun.time.is();
				var incomingValue = Gun.is.soul(deltaValue) || deltaValue;
				var currentValue = Gun.is.soul(current[field]) || current[field];
				// add more checks?
				var state = HAM(machineState, context.states.delta[field], context.states.current[field], incomingValue, currentValue);
				//console.log("the server state is",machineState,"with delta:current",context.states.delta[field],context.states.current[field]);
				//console.log("having incoming value of",deltaValue,'and',current[field]);
				if(state.err){
					root.console.log(".!HYPOTHETICAL AMNESIA MACHINE ERR!.", state.err); // this error should never happen.
					return;
				}
				if(state.state || state.quarantineState || state.current){
					context('lower').fire(context, state, current, field, deltaValue);
					return;
				}
				if(state.incoming){
					each.call(state, current, field, deltaValue); // done synchronously
					return;
				}
				if(state.amnesiaQuarantine){
					context.up += 1;
					Gun.schedule(context.states.delta[field], function(){
						update(deltaValue, field);
						context.up -= 1;
						context('upper').fire(context, state, current, field, deltaValue);
					});
				}
			});
			if(!context.up){
				context('upper').fire(context, {});
			}
			return context;
		}
		Gun.roulette = function(l, c){
			var gun = Gun.is(this)? this : {};
			if(gun._ && gun.__.opt && gun.__.opt.uuid){
				if(Gun.fns.is(gun.__.opt.uuid)){
					return gun.__.opt.uuid(l, c);
				}
				l = l || gun.__.opt.uuid.length;
			}
			return Gun.text.random(l, c);
		}
	}(Gun));
	;(function(Chain){
		Chain.opt = function(opt, stun){ // idempotently update or put options
			var gun = this;
			gun._ = gun._ || {};
			gun.__ = gun.__ || {};
			gun.shot = Gun.shot('then', 'err');
			gun.shot.next = Gun.next();
			if(opt === null){ return gun }
			opt = opt || {};
			gun.__.opt = gun.__.opt || {};
			gun.__.keys = gun.__.keys || {};
			gun.__.graph = gun.__.graph || {};
			gun.__.on = gun.__.on || Gun.on.create();
			if(Gun.text.is(opt)){ opt = {peers: opt} }
			if(Gun.list.is(opt)){ opt = {peers: opt} }
			if(Gun.text.is(opt.peers)){ opt.peers = [opt.peers] }
			if(Gun.list.is(opt.peers)){ opt.peers = Gun.obj.map(opt.peers, function(n,f,m){ m(n,{}) }) }
			gun.__.opt.peers = opt.peers || gun.__.opt.peers || {};
			gun.__.opt.uuid = opt.uuid || gun.__.opt.uuid || {};
			gun.__.opt.cb = gun.__.opt.cb || function(){};
			gun.__.opt.hooks = gun.__.opt.hooks || {};
			gun.__.hook = Gun.shot('then','end');
			Gun.obj.map(opt.hooks, function(h, f){
				if(!Gun.fns.is(h)){ return }
				gun.__.opt.hooks[f] = h;
			});
			if(!stun){ Gun.on('opt').emit(gun, opt) }
			return gun;
		}
		Chain.chain = function(from){
			var gun = Gun(null);
			from = from || this;
			gun.back = from;
			gun.__ = from.__;
			gun._ = {};
			//Gun.obj.map(from._, function(val, field){ gun._[field] = val });
			return gun;
		}
		Chain.get = function(key, cb, opt){
			var gun = this.chain();
			gun.shot.next(function(next){
				opt = opt || {};
				cb = cb || function(){}; cb.c = 0;
				cb.soul = Gun.is.soul(key); // is this a key or a soul?
				if(cb.soul){ // if a soul...
					cb.node = gun.__.graph[cb.soul]; // then attempt to grab it directly from cache in the graph
				} else { // if not...
					cb.node = gun.__.keys[key]; // attempt to grab it directly from our key cache
					(gun._.keys = gun._.keys || {})[key] = cb.node? 1 : 0; // put a key marker on it
				}
				if(!opt.force && cb.node){ // if it was in cache, then...
					console.log("get via gun");
					gun._.node = cb.node; // assign it to this context
					return cb.call(gun, null, Gun.obj.copy(gun._.node)), cb.c++, next(); // frozen copy
				}
				// missing: hear shots! I now hook this up in other places, but we could get async/latency issues?
				// We need to subscribe early? Or the transport layer handle this for us?
				if(Gun.fns.is(gun.__.opt.hooks.get)){
					gun.__.opt.hooks.get(key, function(err, data){
						if(cb.c++){ return Gun.log("Warning: Get callback being called", cb.c, "times.") }
						if(err){ return cb.call(gun, err) }
						if(!data){ return cb.call(gun, null, data), next() }
						var context = gun.union(data); // safely transform the data into the current context
						if(context.err){ return cb.call(gun, context.err) } // but validate it in case of errors
						gun._.node = gun.__.graph[Gun.is.soul.on(data)]; // immediately use the state in cache.
						if(!cb.soul){ // and if we had got with a key rather than a soul
							gun._.keys[key] = 1; // then put a marker that this key matches
							gun.__.keys[key] = gun._.node; // and cache a pointer to the node
						}
						return cb.call(gun, null, Gun.obj.copy(gun._.node)), next(); // frozen copy
					}, opt);
				} else {
					root.console.log("Warning! You have no persistence layer to get from!");
					return cb.call(gun), cb.c++, next();
				}
			});
			return gun;
		}
		Chain.key = function(key, cb){
			var gun = this;
			if(!gun.back){ // TODO: BUG? Does this maybe introduce bugs other than the test that it fixes?
				gun = gun.chain(); // create a new context
			}
			gun.shot.next(function(next){
				cb = cb || function(){};
				if(Gun.obj.is(key)){ // if key is an object then we get the soul directly from it
					Gun.obj.map(key, function(soul, field){ return cb.key = field, cb.soul = soul });
				} else { // or else
					cb.key = key; // the key is the key
				}
				if(gun._.node){ // if it is in cache
					cb.soul = Gun.is.soul.on(gun._.node);
					(gun._.keys = gun._.keys || {})[cb.key] = 1; // clear the marker in this context
					(gun.__.keys = gun.__.keys || {})[cb.key] = gun._.node; // and create the pointer
				} else { // if it is not in cache
					(gun._.keys = gun._.keys || {})[cb.key] = 0; // then put a marker on this context
				}
				if(Gun.fns.is(gun.__.opt.hooks.key)){
					gun.__.opt.hooks.key(cb.key, cb.soul, function(err, data){ // call the hook
						return cb.call(gun, err, data); // and notify how it went.
					});
				} else {
					root.console.log("Warning! You have no key hook!");
					cb.call(gun);
				}
				next(); // continue regardless
			});
			return gun;
		}
		Chain.all = function(key, cb){
			var gun = this.chain();
			cb = cb || function(){};
			gun.shot.next(function(next){
				Gun.obj.map(gun.__.keys, function(node, key){ // TODO: BUG!! Need to handle souls too!
					if(node = Gun.is.soul.on(node)){
						(cb.vode = cb.vode || {})[key] = {};
						cb.vode[key][Gun._.soul] = node;
					} 
				});
				if(cb.vode){
					gun._.node = cb.vode; // assign it to this virtual node.
					cb.call(gun, null, Gun.obj.copy(gun._.node)), next(); // frozen copy
				} else
				if(Gun.fns.is(gun.__.opt.hooks.all)){
					gun.__.opt.hooks.all(function(err, data){ // call the hook
						// this is multiple
					});
				} else {
					root.console.log("Warning! You have no all hook!");
					return cb.call(gun), next();
				}
			});
			return gun;
		}
		/*
			how many different ways can we return something? ONLY THE FIRST ONE IS SUPPORTED, the others might become plugins.
			Find via a singular path
				.path('blah').val(blah);
			Find via multiple paths with the callback getting called many times
				.path('foo', 'bar').val(fooOrBar);
			Find via multiple paths with the callback getting called once with matching arguments
				.path('foo', 'bar').val(foo, bar)
			Find via multiple paths with the result aggregated into an object of pre-given fields
				.path('foo', 'bar').val({foo: foo, bar: bar}) || .path({a: 'foo', b: 'bar'}).val({a: foo, b: bar})
			Find via multiple paths where the fields and values must match
				.path({foo: val, bar: val}).val({})
			Path ultimately should call .val each time, individually, for what it finds.
			Things that wait and merge many things together should be an abstraction ontop of path.
		*/
		Chain.path = function(path, cb){ // Follow the path into the field.
			var gun = this.chain(); // create a new context, changing the focal point.
			cb = cb || function(){};
			path = (Gun.text.ify(path) || '').split('.');
			gun.shot.next(cb.done = function(next){ // let the previous promise resolve.
				if(next){ cb.next = next }
				if(!cb.next || !cb.back){ return }
				cb = cb || function(){}; // fail safe our function.
				(function trace(){ // create a recursive function, and immediately call it.
					gun._.field = Gun.text.ify(path.shift()); // where are we at? Figure it out.
					if(gun._.node && path.length && Gun.is.soul(cb.soul = gun._.node[gun._.field])) { // if we need to recurse more
						return gun.get(cb.soul, function(err){ // and the recursion happens to be on a relation, then get it.
							if(err){ return cb.call(gun, err) }
							trace(gun._ = this._); // follow the context down the chain.
						});
					}
					cb.call(gun, null, Gun.obj.copy(gun._.node), gun._.field); // frozen copy
					cb.next(); // and be done, fire our gun with the context.
				}(gun._.node = gun.back._.node)); // immediately call trace, putting the new context with the previous node.
			});
			gun.back.shot.next(function(next){
				if(gun.back && gun.back._ && gun.back._.field){ 
					path = [gun.back._.field].concat(path);
				}
				cb.back = true;
				cb.done();
				next();
			});
			return gun;
		}
		Chain.val = function(cb){
			var gun = this; // keep using the existing context.
			gun.shot.next(function(next){ // let the previous promise resolve.
				cb = cb || function(){}; // fail safe our function.
				if(!gun._.node){ return next() } // if no node, then abandon and let `.not` handle it.
				var field = Gun.text.ify(gun._.field), val = gun._.node[field]; // else attempt to get the value at the field, if we have a field.
				if(field && Gun.is.soul(val)){ // if we have a field, then check to see if it is a relation
					return gun.get(val, function(err, value){ // and get it.
						if(err){ return } // handle error?
						if(!this._.node){ return next() }
						return cb.call(this, value, field), next(); // already frozen copy
					});
				}
				return cb.call(gun, field? Gun.is.value.as(val) : Gun.obj.copy(gun._.node), field), next(); // frozen copy
			});
			return gun;
		}
		// .on(fn) gives you back the object, .on(fn, true) gives you delta pair.
		Chain.on = function(cb){ // val and then subscribe to subsequent changes.
			var gun = this; // keep using the existing context.
			gun.val(function(val, field){
				cb = cb || function(){}; // fail safe our function.
				cb.call(gun, val, field);
				gun.__.on(Gun.is.soul.on(gun._.node)).event(function(delta){ // then subscribe to subsequent changes.
					field = Gun.text.ify(gun._.field);
					if(!delta || !gun._.node){ return }
					if(!field){ // if we were listening to changes on the node as a whole
						return cb.call(gun, Gun.obj.copy(gun._.node)); // frozen copy
					}
					if(Gun.obj.has(delta, field)){ // else changes on an individual property
						delta = delta[field]; // grab it and
						cb.call(gun, Gun.obj.is(delta)? Gun.obj.copy(delta) : Gun.is.value.as(delta), field); // frozen copy
						// TODO! BUG: If delta is an object, that would suggest it is a relation which needs to be `get`.
					}
				});
			});
			return gun;
		}
		/*
			ACID compliant? Unfortunately the vocabulary is vague, as such the following is an explicit definition:
			A - Atomic, if you put a full node, or nodes of nodes, if any value is in error then nothing will be put.
				If you want puts to be independent of each other, you need to put each piece of the data individually.
			C - Consistency, if you use any reserved symbols or similar, the operation will be rejected as it could lead to an invalid read and thus an invalid state.
			I - Isolation, the conflict resolution algorithm guarantees idempotent transactions, across every peer, regardless of any partition,
				including a peer acting by itself or one having been disconnected from the network.
			D - Durability, if the acknowledgement receipt is received, then the state at which the final persistence hook was called on is guaranteed to have been written.
				The live state at point of confirmation may or may not be different than when it was called.
				If this causes any application-level concern, it can compare against the live data by immediately reading it, or accessing the logs if enabled.
		*/
		Chain.put = function(val, cb, opt){ // TODO: need to turn deserializer into a trampolining function so stackoverflow doesn't happen.
			var gun = this;
			opt = opt || {};
			cb = cb || function(){};
			if(!gun.back){
				gun = gun.chain(); // create a new context
			}
			gun.shot.next(function(next){ // How many edge cases are there to a put?
				if(!gun._.node){
					if(Gun.is.value(val) || !Gun.obj.is(val)){ // 1. Context: null, put: value. Error, no node exists.
							return cb.call(gun, {err: Gun.log("No node exists to put " + (typeof val) + " in.")});
					}
					if(Gun.obj.is(val)){ // 2. Context: null, put: node. Put.
						return put(next);
					}
				} else {
					if(!gun._.field){
						if(Gun.is.value(val) || !Gun.obj.is(val)){ // 3. Context: node, put: value. Error, no field exists.
							return cb.call(gun, {err: Gun.log("No field exists to put " + (typeof val) + " on.")});
						}
						if(Gun.obj.is(val)){ // 4. Context: node, put: node. Merge.
							return put(next);
						}
					} else {
						if(Gun.is.value(val) || !Gun.obj.is(val)){ // 5. Context: node and field, put: value. Merge and replace.
							var partial = {}; // in case we are doing a put on a field, not on a node.
							partial[gun._.field] = val; // we create an empty object with the field/value to be put.
							val = partial;
							return put(next);
						}
						if(Gun.obj.is(val)){
							if(Gun.is.soul(gun._.node[gun._.field])){ // 6. Context: node and field of relation, put: node. Merge.
								return gun.get(gun._.node[gun._.field], function(err){
									if(err){ return cb.call(gun, {err: Gun.log(err)}) } // use gun not this to preserve intent?
									put(next, this);
								});
							} else { // 7. Context: node and field, put: node. Merge and replace.
								var partial = {}; // in case we are doing a put on a field, not on a node.
								partial[gun._.field] = val; // we create an empty object with the field/value to be put.
								val = partial;
								return put(next);
							}
						}
					}
				}
			});
			function put(next, as){
				as = as || gun;
				cb.states = Gun.time.is();
				Gun.ify(val, function(raw, context, sub, soul){
					if(val === raw){ return soul(Gun.is.soul.on(as._.node)) }
					if(as._.node && sub && sub.path){
						return as.path(sub.path, function(err, node, field){
							if(err){ cb.err = err + " (while doing a put)" } // let .done handle calling this, it may be slower but is more consistent.
							if(node = this._.node){
								if(field = this._.field){
									if(field = Gun.is.soul(node[field])){
										return soul(field);
									}
								} else 
								if(Gun.is.soul.on(node) !== Gun.is.soul.on(as._.node)){
									if(field = Gun.is.soul.on(node)){
										return soul(field);
									}
								}
							}
							soul(); // else call it anyways
						});
					} soul(); // else call it anyways
				}).done(function(err, put){
					// TODO: should be able to handle val being a relation or a gun context or a gun promise.
					// TODO: BUG: IF we are putting an object, doing a partial merge, and they are reusing a frozen copy, we need to do a DIFF to update the HAM! Or else we'll get "old" HAM.
					cb.root = put.root;
					put.err = put.err || cb.err;
					if(put.err || !cb.root){ return cb.call(gun, put.err || {err: Gun.log("No root object!")}) }
					put = Gun.ify.state(put.nodes, cb.states); // put time state on nodes?
					if(put.err){ return cb.call(gun, put.err) }
					gun.union(put.nodes); // while this maybe should return a list of the nodes that were changed, we want to send the actual delta
					as._.node = as.__.graph[cb.root._[Gun._.soul]] || cb.root;
					if(!as._.field){
						Gun.obj.map(as._.keys, function(yes, key){
							if(yes){ return }
							as.key(key); // TODO: Feature? what about these callbacks?
						});
					}
					if(Gun.fns.is(gun.__.opt.hooks.put)){
						gun.__.opt.hooks.put(put.nodes, function(err, data){ // now iterate through those nodes to a persistence layer and get a callback once all are saved
							if(err){ return cb.call(gun, err) }
							return cb.call(gun, data);
						});
					} else {
						root.console.log("Warning! You have no persistence layer to save to!");
						return cb.call(gun);
					}
					next();
				});
			};
			return gun;
		}
		Chain.map = function(cb, opt){
			var gun = this;
			opt = (Gun.obj.is(opt)? opt : (opt? {node: true} : {})); // TODO: BUG: inverse the default here.
			gun.val(function(val){
				cb = cb || function(){};
				Gun.obj.map(val, function(val, field){  // by default it maps over everything.
					if(Gun._.meta == field){ return }
					if(Gun.is.soul(val)){
						gun.get(val).val(function(val){ // should map have support for `.not`?
							cb.call(this, val, field);
						});
					} else {
						if(opt.node){ return } // {node: true} maps over only sub nodes.
						cb.call(gun, val, field);
					}
				});
			});
			var ahead = gun.chain(); return ahead;
			return gun;
		}
		// Union is different than put. Put casts non-gun style of data into a gun compatible data.
		// Union takes already gun compatible data and validates it for a merge.
		// Meaning it is more low level, such that even put uses union internally.
		Chain.union = function(prime, cb){
			var tmp = {}, gun = this, context = Gun.shot();
			cb = cb || function(){};
			context.nodes = {};
			if(!prime){
				context.err = {err: Gun.log("No data to merge!")};
			} else
			if(Gun.is.soul.on(prime)){
				tmp[prime._[Gun._.soul]] = prime;
				prime = tmp;
			}
			if(!gun || context.err){
				cb(context.err = context.err || {err: Gun.log("No gun instance!"), corrupt: true}, context);
				return context;
			}
			if(!Gun.is.graph(prime, function(node, soul){
				context.nodes[soul] = node;
			})){
				cb(context.err = context.err || {err: Gun.log("Invalid graph!"), corrupt: true}, context);
				return context;
			}
			if(context.err){ return cb(context.err, context), context } // if any errors happened in the previous steps, then fail.
			Gun.union(gun.__.graph, context.nodes).done(function(err, env){ // now merge prime into the graph
				context.err = err || env.err;
				cb(context.err, context || {});
			}).change(function(delta){
				if(!Gun.is.soul.on(delta)){ return }
				gun.__.on(delta._[Gun._.soul]).emit(Gun.obj.copy(delta)); // this is in reaction to HAM. frozen copy here?
			});
			return context;
		}
		Chain.not = function(not){
			var gun = this;
			not = not || function(){};
			gun.shot.next(function(next){
				if(gun._.node){ // if it does indeed exist
					return next(); // yet fire off the chain
				}
				not.call(gun); // call not
				next(); // fire off the chain
			});
			return gun;
		}
		Chain.err = function(dud){ // WARNING: dud was depreciated.
			this._.err = Gun.fns.is(dud)? dud : function(){};
			return this;
		}
	}(Gun.chain = Gun.prototype));
	;(function(Util){
		Util.fns = {};
		Util.fns.is = function(fn){ return (fn instanceof Function)? true : false }
		Util.fns.sum = function(done){ // combine with Util.obj.map for some easy parallel async operations!
			var context = {task: {}, data: {}};
			context.end = function(e,v){ return done(e,v), done = function(){} };
			context.add = function(fn, id){
				context.task[id = id || (Gun.text.is(fn)? fn : Gun.text.random())] = false;
				var each = function(err, val){
					context.task[id] = true;
					if(err){ (context.err = context.err || {})[id] = err }
					context.data[id] = val;
					if(!Gun.obj.map(context.task, function(val){ if(!val){ return true } })){ // it is true if we are NOT done yet, then invert.
						done(context.err, context.data);
					}
				}, c = context;
				return Gun.fns.is(fn)? function(){ return fn.apply({task: c.task, data: c.data, end: c.end, done: each}, arguments) } : each;
			}
			return context;
		}
		Util.bi = {};
		Util.bi.is = function(b){ return (b instanceof Boolean || typeof b == 'boolean')? true : false }
		Util.num = {};
		Util.num.is = function(n){
			return ((n===0)? true : (!isNaN(n) && !Util.bi.is(n) && !Util.list.is(n) && !Util.text.is(n))? true : false );
		}
		Util.text = {};
		Util.text.is = function(t){ return typeof t == 'string'? true : false }
		Util.text.ify = function(t){
			if(Util.text.is(t)){ return t }
			if(JSON){ return JSON.stringify(t) }
			return (t && t.toString)? t.toString() : t;
		}
		Util.text.random = function(l, c){
			var s = '';
			l = l || 24; // you are not going to make a 0 length random number, so no need to check type
			c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghiklmnopqrstuvwxyz';
			while(l > 0){ s += c.charAt(Math.floor(Math.random() * c.length)); l-- }
			return s;
		}
		Util.list = {};
		Util.list.is = function(l){ return (l instanceof Array)? true : false }
		Util.list.slit = Array.prototype.slice;
		Util.list.sort = function(k){ // creates a new sort function based off some field
			return function(A,B){
				if(!A || !B){ return 0 } A = A[k]; B = B[k];
				if(A < B){ return -1 }else if(A > B){ return 1 }
				else { return 0 }
			}
		}
		Util.list.map = function(l, c, _){ return Util.obj.map(l, c, _) }
		Util.list.index = 1; // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
		Util.obj = {};
		Util.obj.is = function(o){ return (o instanceof Object && !Util.list.is(o) && !Util.fns.is(o))? true : false }
		Util.obj.del = function(o, k){
			if(!o){ return }
			o[k] = null;
			delete o[k];
			return true;
		}
		Util.obj.ify = function(o){
			if(Util.obj.is(o)){ return o }
			try{o = JSON.parse(o);
			}catch(e){o={}};
			return o;
		}
		Util.obj.copy = function(o){ // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
			return !o? o : JSON.parse(JSON.stringify(o)); // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
		}
		Util.obj.has = function(o, t){ return o && Object.prototype.hasOwnProperty.call(o, t) }
		Util.obj.map = function(l, c, _){
			var u, i = 0, ii = 0, x, r, rr, f = Util.fns.is(c),
			t = function(k,v){
				if(v !== u){
					rr = rr || {};
					rr[k] = v;
					return;
				} rr = rr || [];
				rr.push(k);
			};
			if(Util.list.is(l)){
				x = l.length;
				for(;i < x; i++){
					ii = (i + Util.list.index);
					if(f){
						r = _? c.call(_, l[i], ii, t) : c(l[i], ii, t);
						if(r !== u){ return r }
					} else {
						//if(Util.test.is(c,l[i])){ return ii } // should implement deep equality testing!
						if(c === l[i]){ return ii } // use this for now
					}
				}
			} else {
				for(i in l){
					if(f){
						if(Util.obj.has(l,i)){
							r = _? c.call(_, l[i], i, t) : c(l[i], i, t);
							if(r !== u){ return r }
						}
					} else {
						//if(a.test.is(c,l[i])){ return i } // should implement deep equality testing!
						if(c === l[i]){ return i }
					}
				}
			}
			return f? rr : Util.list.index? 0 : -1;
		}
		Util.time = {};
		Util.time.is = function(t){ return t? t instanceof Date : (+new Date().getTime()) }
	}(Gun));
	;Gun.next = function(){
		var fn = function(cb){
			if(!fn.stack || !fn.stack.length){
				setImmediate(function next(n){
					return (n = (fn.stack||[]).shift() || function(){}), n.back = fn.stack, fn.stack = [], n(function(){
						return (fn.stack = (fn.stack||[]).concat(n.back)), next();
					});
				});
			} if(cb){
				(fn.stack = fn.stack || []).push(cb);
			} return fn;
		}, setImmediate = setImmediate || function(cb){return setTimeout(cb,0)}
		return fn;
	}
	;Gun.shot=(function(){
		// I hate the idea of using setTimeouts in my code to do callbacks (promises and sorts)
		// as there is no way to guarantee any type of state integrity or the completion of callback.
		// However, I have fallen. HAM is suppose to assure side effect free safety of unknown states.
		var setImmediate = setImmediate || function(cb){setTimeout(cb,0)}
		function Flow(){
			var chain = new Flow.chain();
			chain.$ = function(where){
				(chain._ = chain._ || {})[where] = chain._[where] || [];
				chain.$[where] = chain.$[where] || function(fn){
					if(chain.args){
						fn.apply(chain, chain.args);
					} else {
						(chain._[where]||[]).push(fn);
					}
					return chain.$;
				}
				chain.where = where;
				return chain;
			}
			Gun.list.map(Array.prototype.slice.call(arguments), function(where){ chain.$(where) });
			return chain.$;
		}
		Flow.is = function(flow){ return (Flow instanceof flow)? true : false }
		;Flow.chain=(function(){
			function Chain(){
				if(!(this instanceof Chain)){
					return new Chain();
				}
			}
			Chain.chain = Chain.prototype;
			Chain.chain.pipe = function(a,s,d,f){
				var me = this
				,	where = me.where
				, 	args = Array.prototype.slice.call(arguments);
				setImmediate(function(){
					if(!me || !me._ || !me._[where]){ return }
					me.args = args;
					while(0 < me._[where].length){
						(me._[where].shift()||function(){}).apply(me, args);
					}
					// do a done? That would be nice. :)
				});
				return me;
			}
			return Chain;
		}());
		return Flow;
	}());Gun.shot.chain.chain.fire=Gun.shot.chain.chain.pipe;
	;Gun.on=(function(){
		// events are fundamentally different, being synchronously 1 to N fan out,
		// than req/res/callback/promise flow, which are asynchronously 1 to 1 into a sink.
		function On(where){
			if(where){
				return (On.event = On.event || On.create())(where);
			}
			return On.create();
		}
		On.is = function(on){ return (On instanceof on)? true : false }
		On.create = function(){
			var chain = new On.chain();
			return chain.$ = function(where){
				chain.where = where;
				return chain;
			}
		}
		On.sort = Gun.list.sort('i');
		;On.chain=(function(){
			function Chain(){
				if(!(this instanceof Chain)){
					return new Chain();
				}
			}
			Chain.chain = Chain.prototype;
			Chain.chain.emit = function(what){
				var me = this
				,	where = me.where
				,	args = arguments
				, on = (me._ = me._ || {})[where] = me._[where] || [];
				if(!(me._[where] = Gun.list.map(on, function(hear, i, map){
					if(!hear || !hear.as){ return }
					map(hear);
					hear.as.apply(hear, args);
				}))){ Gun.obj.del(on, where) }
			}
			Chain.chain.event = function(as, i){
				if(!as){ return }
				var me = this
				,	where = me.where
				,	args = arguments
				, 	on = (me._ = me._ || {})[where] = me._[where] || []
				,	e = {as: as, i: i || 0, off: function(){ return !(e.as = false) }};
				return on.push(e), on.sort(On.sort), e;
			}
			Chain.chain.once = function(as, i){
				var me = this
				,	once = function(){
					this.off();
					as.apply(this, arguments)
				}
				return me.event(once, i)
			}
			return Chain;
		}());
		return On;
	}());
	;(function(schedule){ // maybe use lru-cache
		schedule.waiting = [];
		schedule.soonest = Infinity;
		schedule.sort = Gun.list.sort('when');
		schedule.set = function(future){
			var now = Gun.time.is();
			future = (future <= now)? 0 : (future - now);
			clearTimeout(schedule.id);
			schedule.id = setTimeout(schedule.check, future);
		}
		schedule.check = function(){
			var now = Gun.time.is(), soonest = Infinity;
			schedule.waiting.sort(schedule.sort);
			schedule.waiting = Gun.list.map(schedule.waiting, function(wait, i, map){
				if(!wait){ return }
				if(wait.when <= now){
					if(Gun.fns.is(wait.event)){
						wait.event();
					}
				} else {
					soonest = (soonest < wait.when)? soonest : wait.when;
					map(wait);
				}
			}) || [];
			schedule.set(soonest);
		}
		Gun.schedule = function(state, cb){
			schedule.waiting.push({when: state, event: cb});
			if(schedule.soonest < state){ return }
			schedule.set(state);
		}
	}({}));
	;(function(Serializer){
		Gun.ify = function(data, cb){ // TODO: BUG: Modify lists to include HAM state
			var gun = Gun.is(this)? this : {}
			, nothing, context = Gun.shot();
			context.nodes = {};
			context.seen = [];
			context.seen = [];
			context('done');
			cb = cb || function(){};
			function ify(data, context, sub){
				sub = sub || {};
				sub.path = sub.path || '';
				context = context || {};
				context.nodes = context.nodes || {};
				if((sub.simple = Gun.is.value(data)) && !(sub._ && Gun.text.is(sub.simple))){
					return data;
				} else
				if(Gun.obj.is(data)){
					var value = {}, meta = {}, seen
					, err = {err: "Metadata does not support external or circular references at " + sub.path, meta: true};
					context.root = context.root || value;
					if(seen = ify.seen(context._seen, data)){
						//console.log("seen in _", sub._, sub.path, data);
						Gun.log(context.err = err);
						return;
					} else
					if(seen = ify.seen(context.seen, data)){
						//console.log("seen in data", sub._, sub.path, data);
						if(sub._){
							Gun.log(context.err = err);
							return;
						}
						meta = Gun.ify.soul.call(gun, meta, seen);
						return meta;
					} else {
						//console.log("seen nowhere", sub._, sub.path, data);
						if(sub._){
							context.seen.push({data: data, node: value});
						} else {
							value._ = {};
							cb(data, context, sub, context.many.add(function(soul){
									//console.log("What soul did we find?", soul || "random");
									meta[Gun._.soul] = value._[Gun._.soul] = soul = Gun.is.soul.on(data) || soul || Gun.roulette();
									context.nodes[soul] = value;
									this.done();
							}));
							context.seen.push({data: data, node: value});
						}
					}
					Gun.obj.map(data, function(val, field){
						var subs = {path: sub.path? sub.path + '.' + field : field,
							_: sub._ || (field == Gun._.meta)? true : false };
						val = ify(val, context, subs);
						//console.log('>>>>', sub.path + field, 'is', val);
						if(context.err){ return true }
						if(nothing === val){ return }
						// TODO: check field validity
						value[field] = val;
					});
					if(sub._){ return value }
					if(!value._){ return }
					return meta;
				} else
				if(Gun.list.is(data)){
					var unique = {}, edges
					, err = {err: "Arrays cause data corruption at " + sub.path, array: true}
					edges = Gun.list.map(data, function(val, i, map){
						val = ify(val, context, sub);
						if(context.err){ return true }
						if(!Gun.obj.is(val)){
							Gun.log(context.err = err);
							return true;
						}
						return Gun.obj.map(val, function(soul, field){
							if(field !== Gun._.soul){
								Gun.log(context.err = err);
								return true;
							}
							if(unique[soul]){ return }
							unique[soul] = 1;
							map(val);
						});
					});
					if(context.err){ return }
					return edges;
				} else {
					context.err = {err: Gun.log("Data type not supported at " + sub.path), invalid: true};
				}
			}
			ify.seen = function(seen, data){
				// unfortunately, using seen[data] = true will cause false-positives for data's children
				return Gun.list.map(seen, function(check){
					if(check.data === data){ return check.node }
				});
			}
			context.many = Gun.fns.sum(function(err){ context('done').fire(context.err, context) });
			context.many.add(function(){
				ify(data, context);
				this.done();
			})();
			return context;
		}
		Gun.ify.state = function(nodes, now){
			var context = {};
			context.nodes = nodes;
			context.now = now = (now === 0)? now : now || Gun.time.is();
			Gun.obj.map(context.nodes, function(node, soul){
				if(!node || !soul || !node._ || !node._[Gun._.soul] || node._[Gun._.soul] !== soul){
					return context.err = {err: Gun.log("There is a corruption of nodes and or their souls"), corrupt: true};
				}
				var states = node._[Gun._.HAM] = node._[Gun._.HAM] || {};
				Gun.obj.map(node, function(val, field){
					if(field == Gun._.meta){ return }
					val = states[field];
					states[field] = (val === 0)? val : val || now;
				});
			});
			return context;
		}
		Gun.ify.soul = function(to, from){
			var gun = this;
			to = to || {};
			if(Gun.is.soul.on(from)){
				to[Gun._.soul] = from._[Gun._.soul];
				return to;
			}
			to[Gun._.soul] = Gun.roulette.call(gun);
			return to;
		}
	}());
	if(typeof window !== "undefined"){
		window.Gun = Gun;
	} else {
		module.exports = Gun;
	}
	var root = this || {}; // safe for window, global, root, and 'use strict'.
	root.console = root.console || {log: function(s){ return s }}; // safe for old browsers
	var console = {log: Gun.log = function(s){return (Gun.log.verbose && root.console.log.apply(root.console, arguments)), s}};
}({}));

;(function(tab){
	if(!this.Gun){ return }
	if(!window.JSON){ throw new Error("Include JSON first: ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js") } // for old IE use
	Gun.on('opt').event(function(gun, opt){
		window.tab = tab; // for debugging purposes
		opt = opt || {};
		tab.headers = opt.headers || {};
		tab.headers['gun-sid'] = tab.headers['gun-sid'] || Gun.text.random();
		tab.prefix = tab.prefix || opt.prefix || 'gun/';
		tab.prekey = tab.prekey || opt.prekey || '';
		tab.prenode = tab.prenode || opt.prenode || '_/nodes/';
		tab.get = tab.get || function(key, cb, o){
			if(!key){ return }
			cb = cb || function(){};
			o = o || {};
			o.url = o.url || {};
			o.headers = Gun.obj.copy(tab.headers);
			if(key[Gun._.soul]){
				o.url.query = key;
			} else {
				o.url.pathname = '/' + key;
			}
			Gun.log("gun get", key);
			(function local(key, cb){
				var node, lkey = key[Gun._.soul]? tab.prefix + tab.prenode + key[Gun._.soul]
					: tab.prefix + tab.prekey + key
				if((node = store.get(lkey)) && node[Gun._.soul]){ return local(node, cb) }
				if(cb.node = node){ Gun.log('via cache', key); setTimeout(function(){cb(null, node)},0) }
			}(key, cb));
			Gun.obj.map(gun.__.opt.peers, function(peer, url){
				request(url, null, function(err, reply){
					Gun.log('via', url, key, reply.body);
					if(err || !reply || (err = reply.body && reply.body.err)){
						cb({err: Gun.log(err || "Error: Get failed through " + url) });
					} else {
						if(!key[Gun._.soul] && (cb.soul = Gun.is.soul.on(reply.body))){
							var meta = {};
							meta[Gun._.soul] = cb.soul;
							store.put(tab.prefix + tab.prekey + key, meta);
						}
						if(cb.node){
							if(!cb.graph && (cb.soul = Gun.is.soul.on(cb.node))){ // if we have a cache locally
								cb.graph = {}; // we want to make sure we did not go offline while sending updates
								cb.graph[cb.soul] = cb.node; // so turn the node into a graph, and sync the latest state.
								tab.put(cb.graph, function(e,r){ Gun.log("Stateless handshake sync:", e, r) });
								if(!key[Gun._.soul]){ tab.key(key, cb.soul, function(e,r){}) }//TODO! BUG: this is really bad implicit behavior!
							}
							return gun.union(reply.body);
						}
						cb(null, reply.body);
					}
				}, o);
				cb.peers = true;
			}); tab.peers(cb);
		}
		tab.key = function(key, soul, cb){
			var meta = {};
			meta[Gun._.soul] = soul = Gun.text.is(soul)? soul : (soul||{})[Gun._.soul];
			if(!soul){ return cb({err: Gun.log("No soul!")}) }
			store.put(tab.prefix + tab.prekey + key, meta);
			Gun.obj.map(gun.__.opt.peers, function(peer, url){
				request(url, meta, function(err, reply){
					if(err || !reply || (err = reply.body && reply.body.err)){
						// tab.key(key, soul, cb); // naive implementation of retry TODO: BUG: need backoff and anti-infinite-loop!
						cb({err: Gun.log(err || "Error: Key failed to be made on " + url) });
					} else {
						cb(null, reply.body);
					}
				}, {url: {pathname: '/' + key }, headers: tab.headers});
				cb.peers = true;
			}); tab.peers(cb);
		}
		tab.put = tab.put || function(nodes, cb){
			cb = cb || function(){};
			// TODO: batch and throttle later.
			// tab.store.put(cb.id = 'send/' + Gun.text.random(), nodes); // TODO: store SENDS until SENT.
			Gun.obj.map(nodes, function(node, soul){
				if(!gun || !gun.__ || !gun.__.graph || !gun.__.graph[soul]){ return }
				store.put(tab.prefix + tab.prenode + soul, gun.__.graph[soul]);
			});
			Gun.obj.map(gun.__.opt.peers, function(peer, url){
				request(url, nodes, function(err, reply){
					if(err || !reply || (err = reply.body && reply.body.err)){
						return cb({err: Gun.log(err || "Error: Put failed on " + url) });
					} else {
						cb(null, reply.body);
					}
				}, {headers: tab.headers});
				cb.peers = true;
			}); tab.peers(cb);
			Gun.obj.map(nodes, function(node, soul){
				gun.__.on(soul).emit(node);
			});
		}
		tab.peers = function(cb){
			if(cb && !cb.peers){ // there are no peers! this is a local only instance
				setTimeout(function(){console.log("Warning! You have no peers to connect to!");cb()},1);
			}
		}
		tab.put.defer = {};
		request.createServer(function(req, res){
			// Gun.log("client server received request", req);
			if(!req.body){ return }
			if(Gun.is.node(req.body) || Gun.is.graph(req.body)){
				gun.union(req.body); // TODO: BUG? Interesting, this won't update localStorage because .put isn't called?
			}
		});
		gun.__.opt.hooks.get = gun.__.opt.hooks.get || tab.get;
		gun.__.opt.hooks.put = gun.__.opt.hooks.put || tab.put;
		gun.__.opt.hooks.key = gun.__.opt.hooks.key || tab.key;
	});
	var store = (function(){
		function s(){}
		var store = window.localStorage || {setItem: function(){}, removeItem: function(){}, getItem: function(){}};
		s.put = function(key, val){ return store.setItem(key, Gun.text.ify(val)) }
		s.get = function(key){ return Gun.obj.ify(store.getItem(key)) }
		s.del = function(key){ return store.removeItem(key) }
		return s;
	}());
	var request = (function(){
		function r(base, body, cb, opt){
			opt = opt || (base.length? {base: base} : base);
			opt.base = opt.base || base;
			opt.body = opt.body || body;
			if(!opt.base){ return }
			r.transport(opt, cb);
		}
		r.createServer = function(fn){ (r.createServer = fn).on = true }
		r.transport = function(opt, cb){
			//Gun.log("TRANSPORT:", opt);
			if(r.ws(opt, cb)){ return }
			r.jsonp(opt, cb);
		}
		r.ws = function(opt, cb){
			var ws = window.WebSocket || window.mozWebSocket || window.webkitWebSocket;
			if(!ws){ return }
			if(ws = r.ws.peers[opt.base]){
				if(!ws.readyState){ return setTimeout(function(){ r.ws(opt, cb) },10), true }
				var req = {};
				if(opt.headers){ req.headers = opt.headers }
				if(opt.body){ req.body = opt.body }
				if(opt.url){ req.url = opt.url }
				req.headers = req.headers || {};
				r.ws.cbs[req.headers['ws-rid'] = 'WS' + (+ new Date()) + '.' + Math.floor((Math.random()*65535)+1)] = function(err,res){
					delete r.ws.cbs[req.headers['ws-rid']];
					cb(err,res);
				}
				ws.send(JSON.stringify(req));
				return true;
			}
			if(ws === false){ return }
			ws = r.ws.peers[opt.base] = new WebSocket(opt.base.replace('http','ws'));
			ws.onopen = function(o){ r.ws(opt, cb) };
			ws.onclose = function(c){
				if(!c){ return }
				if(1006 === c.code){ // websockets cannot be used
					ws = r.ws.peers[opt.base] = false;
					r.transport(opt, cb);
					return;
				}
				ws = r.ws.peers[opt.base] = null; // this will make the next request try to reconnect
			};
			ws.onmessage = function(m){
				if(!m || !m.data){ return }
				var res;
				try{res = JSON.parse(m.data);
				}catch(e){ return }
				if(!res){ return }
				res.headers = res.headers || {};
				if(res.headers['ws-rid']){ return (r.ws.cbs[res.headers['ws-rid']]||function(){})(null, res) }
				Gun.log("We have a pushed message!", res);
				if(res.body){ r.createServer(res, function(){}) } // emit extra events.
			};
			ws.onerror = function(e){ Gun.log(e); };
			return true;
		}
		r.ws.peers = {};
		r.ws.cbs = {};
		r.jsonp = function(opt, cb){
			//Gun.log("jsonp send", opt);
			r.jsonp.ify(opt, function(url){
				//Gun.log(url);
				if(!url){ return }
				r.jsonp.send(url, function(reply){
					//Gun.log("jsonp reply", reply);
					cb(null, reply);
					r.jsonp.poll(opt, reply);
				}, opt.jsonp);
			});
		}
		r.jsonp.send = function(url, cb, id){
			var js = document.createElement('script');
			js.src = url;
			window[js.id = id] = function(res){
				cb(res);
				cb.id = js.id;
				js.parentNode.removeChild(js);
				window[cb.id] = null; // TODO! BUG: This needs to handle chunking!
				try{delete window[cb.id];
				}catch(e){}
			}
			js.async = true;
			document.getElementsByTagName('head')[0].appendChild(js);
			return js;
		}
		r.jsonp.poll = function(opt, res){
			if(!opt || !opt.base || !res || !res.headers || !res.headers.poll){ return }
			(r.jsonp.poll.s = r.jsonp.poll.s || {})[opt.base] = r.jsonp.poll.s[opt.base] || setTimeout(function(){ // TODO: Need to optimize for Chrome's 6 req limit?
				//Gun.log("polling again");
				var o = {base: opt.base, headers: {pull: 1}};
				r.each(opt.headers, function(v,i){ o.headers[i] = v })
				r.jsonp(o, function(err, reply){
					delete r.jsonp.poll.s[opt.base];
					while(reply.body && reply.body.length && reply.body.shift){ // we're assuming an array rather than chunk encoding. :(
						var res = reply.body.shift();
						//Gun.log("-- go go go", res);
						if(res && res.body){ r.createServer(res, function(){}) } // emit extra events.
					}
				});
			}, res.headers.poll);
		}
		r.jsonp.ify = function(opt, cb){
			var uri = encodeURIComponent, q = '?';
			if(opt.url && opt.url.pathname){ q = opt.url.pathname + q; }
			q = opt.base + q;
			r.each((opt.url||{}).query, function(v, i){ q += uri(i) + '=' + uri(v) + '&' });
			if(opt.headers){ q += uri('`') + '=' + uri(JSON.stringify(opt.headers)) + '&' }
			if(r.jsonp.max < q.length){ return cb() }
			q += uri('jsonp') + '=' + uri(opt.jsonp = 'P'+Math.floor((Math.random()*65535)+1));
			if(opt.body){
				q += '&';
				var w = opt.body, wls = function(w,l,s){
					return uri('%') + '=' + uri(w+'-'+(l||w)+'/'+(s||w))  + '&' + uri('$') + '=';
				}
				if(typeof w != 'string'){
					w = JSON.stringify(w);
					q += uri('^') + '=' + uri('json') + '&';
				}
				w = uri(w);
				var i = 0, l = w.length
				, s = r.jsonp.max - (q.length + wls(l.toString()).length);
				if(s < 0){ return cb() }
				while(w){
					cb(q + wls(i, (i = i + s), l) + w.slice(0, i));
					w = w.slice(i);
				}
			} else {
				cb(q);
			}
		}
		r.jsonp.max = 2000;
		r.each = function(obj, cb){
			if(!obj || !cb){ return }
			for(var i in obj){
				if(obj.hasOwnProperty(i)){
					cb(obj[i], i);
				}
			}
		}
		return r;
	}());
}({}));
