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
					if(cb){ cb(value, field, node._) }
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
		Gun.union = function(gun, prime, cb){
			var ctx = {count: 0, cb: function(){ cb = cb? cb() && null : null }};
			ctx.graph = gun.__.graph;
			if(!ctx.graph){ ctx.err = {err: Gun.log("No graph!") } }
			if(!prime){ ctx.err = {err: Gun.log("No data to merge!") } }
			if(ctx.soul = Gun.is.soul.on(prime)){
				ctx.tmp = {};
				ctx.tmp[ctx.soul] = prime;
				prime = ctx.tmp;
			}
			Gun.is.graph(prime, null, function(val, field, meta){
				if(!meta || !(meta = meta[Gun._.HAM]) || !Gun.num.is(meta[field])){ 
					return ctx.err = {err: Gun.log("No state on " + field + "!") } 
				}
			});
			if(ctx.err){ return ctx }
			(function union(graph, prime){
				Gun.obj.map(prime, function(node, soul){
					soul = Gun.is.soul.on(node);
					if(!soul){ return }
					var vertex = graph[soul];
					if(!vertex){ // disjoint // TODO: Maybe not correct? BUG, probably.
						gun.__.on(soul).emit(graph[soul] = node);
						return;
					}
					ctx.count += 1;
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
						gun.__.on(Gun.is.soul.on(change)).emit(change);					
					}, function(){})(function(){
						if(!(ctx.count -= 1)){ ctx.cb() }
					});
				});
			})(ctx.graph, prime);
			if(!ctx.count){ ctx.cb() }
			return ctx;
		}
		Gun.HAM = function(vertex, delta, lower, now, upper){
			upper.max = -Infinity;
			Gun.obj.map(delta, function update(incoming, field){
				if(field === Gun._.meta){ return }
				var ctx = {incoming: {}, current: {}}, state;
				ctx.drift = Gun.time.is();
				ctx.incoming.value = Gun.is.soul(incoming) || incoming;
				ctx.current.value = Gun.is.soul(vertex[field]) || vertex[field];
				ctx.incoming.state = Gun.num.is(ctx.tmp = ((delta._||{})[Gun._.HAM]||{})[field])? ctx.tmp : -Infinity;
				ctx.current.state = Gun.num.is(ctx.tmp = ((vertex._||{})[Gun._.HAM]||{})[field])? ctx.tmp : -Infinity;
				upper.max = ctx.incoming.state > upper.max? ctx.incoming.state : upper.max;
				state = HAM(ctx.drift, ctx.incoming.state, ctx.current.state, ctx.incoming.value, ctx.current.value);
				//root.console.log("HAM:", ctx);
				if(state.err){
					root.console.log(".!HYPOTHETICAL AMNESIA MACHINE ERR!.", state.err); // this error should never happen.
					return;
				}
				if(state.state || state.quarantineState || state.current){
					lower.call(state, vertex, field, incoming);
					return;
				}
				if(state.incoming){
					now.call(state, vertex, field, incoming);
					return;
				}
				if(state.amnesiaQuarantine){
					upper.wait = true;
					upper.call(state, vertex, field, incoming); // signals that there are still future modifications.
					Gun.schedule(ctx.incoming.state, function(){
						update(incoming, field);
						if(ctx.incoming.state === upper.max){ upper.last() }
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
			return function(fn){
				upper.last = fn || function(){};
				if(!upper.wait){ upper.last() }
			}
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
			Gun.obj.map(opt.hooks, function(h, f){
				if(!Gun.fns.is(h)){ return }
				gun.__.opt.hooks[f] = h;
			});
			if(!stun){ Gun.on('opt').emit(gun, opt) }
			return gun;
		}
		Gun.chain.chain = function(from){
			var gun = Gun(null);
			from = from || this;
			gun.back = from;
			gun.__ = from.__;
			gun._ = {on: Gun.on.create()};
			gun._.status = function(e){
				var proxy = function(chain, cb){
					return Gun.obj.map(gun._.graph, function(on, soul){
						setImmediate(function(){ cb.call(on, on.status) });
						return on; // TODO: BUG! What about plural graphs?
					}) || gun._.on(e)[chain](function(status){
						if(status){ (gun._.graph = gun._.graph || {})[status.soul] = this }
						cb.call(this, this.status = status);
					});
				}
				proxy.event = function(cb){ return proxy('event', cb) };
				proxy.once = function(cb){ return proxy('once', cb) };
				proxy.emit = function(){
					var args = arguments;
					setImmediate(function(me){ (me = gun._.on(e)).emit.apply(me, args) }) 
				};
				return proxy;
			}
			return gun;
		}
		Chain.get = function(key, cb, opt){ // get opens up a reference to a node and loads it.
			var gun = this.chain(), ctx = {};
			if(!key){ return cb.call(gun, {err: Gun.log("No key or relation to get!") }), gun }
			ctx.key = Gun.text.is(key) && key; // if key is text, then key, else false.
			ctx.soul = Gun.is.soul(key); // if key is a soul, then the soul, else false.
			cb = cb || function(){};
			opt = opt || {};
			if(ctx.soul){
				gun._.status('soul').emit({soul: ctx.soul});
				if(ctx.node = gun.__.graph[ctx.soul]){ // in memory
					cb.call(gun, null, Gun.obj.copy(ctx.node));
					gun._.status('node').emit({soul: ctx.soul});
				} else { load(key) } // not in memory
			} else 
			if(ctx.key){
				
				(function foo(){ // TODO: JANKY! UGLY!!!! Can resolve as soon as the object exists.
					if(ctx.node = gun.__.keys[ctx.key]){ // in memory, or from put.key
						if(true === ctx.node){
							setTimeout(foo,0);
						} else {
							cb.call(gun, null, Gun.obj.copy(ctx.node));
							var soul = Gun.is.soul.on(ctx.node);
							gun._.status('soul').emit({soul: soul});
							gun._.status('node').emit({soul: soul});
						}
					} else { load(key) } // not in memory
				})();
				
			} else { cb.call(gun, {err: Gun.log("No key or relation to get!")}) }
			
			function load(key){
				if(Gun.fns.is(ctx.hook = gun.__.opt.hooks.get)){
					ctx.hook(key, function(err, data){ // multiple times potentially
						//console.log("chain.get from load", err, data);
						if(err){ return cb.call(gun, err, data) }
						if(!data){ return cb.call(gun, null, null), gun._.status('null').emit() }
						if(ctx.soul = Gun.is.soul.on(data)){
							gun._.status('soul').emit({soul: ctx.soul});
						} else { return cb.call(gun, {err: Gun.log('No soul on data!') }, data) }
						if(err = Gun.union(gun, data).err){ return cb.call(gun, err) }
						cb.call(gun, null, data);
						gun._.status('node').emit({soul: ctx.soul});
					}, opt);
				} else {
					root.console.log("Warning! You have no persistence layer to get from!");
					cb.call(gun, null, null); // Technically no error, but no way we can get data.
					gun._.status('null').emit();
				}
			}
			return gun;
		}
		Chain.key = function(key, cb, opt){
			var gun = this, ctx = {};
			if(!key){ return cb.call(gun, {err: Gun.log('No key!')}), gun }
			cb = cb || function(){};
			opt = opt || {};
			gun.__.keys[key] = true;
			gun._.status('soul').event(function($){ // TODO: once per soul in graph. (?)
				gun._.status('node').once(function($){
					gun.__.keys[key] = gun.__.graph[$.soul];
				});
				if(Gun.fns.is(ctx.hook = gun.__.opt.hooks.key)){
					ctx.hook(key, $.soul, function(err, data){
						return cb.call(gun, err, data);
					}, opt);
				} else {
					root.console.log("Warning! You have no key hook!");
					cb.call(gun, null); // This is in memory success, hardly "success" at all.
				}
			});
			return gun;
		}
		Chain.all = function(key, cb){
			var gun = this.chain();
			return gun; // TODO: BUG! We need to create all!
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
		Chain.path = function(path, cb){
			var gun = this.chain(), ctx = {};
			cb = cb || function(){};
			path = (Gun.text.ify(path) || '').split('.');
			// TODO: Hmmm once also? figure it out later.
			gun.back._.status('node').event(function trace($){ // TODO: Check for field as well and merge?
				var node = gun.__.graph[$.soul], field = Gun.text.ify(path.shift()), val;
				if(path.length){
					if(Gun.is.soul(val = node[field])){
						//root.console.log('path RECURSION', field);
						gun.get(val, function(err, data){
							if(err){ return cb.call(gun, err, data) }
							if(!data){ return cb.call(gun, null) }
							trace({soul: Gun.is.soul.on(data)});
						});
					} else {
						cb.call(gun, null);
					}
				} else
				if(!Gun.obj.has(node, field)){ // TODO: THIS MAY NOT BE CORRECT BEHAVIOR!!!!
					cb.call(gun, null, null, field);
					gun._.on('soul').emit({soul: $.soul, field: field}); // if .put is after, makes sense. If anything else, makes sense to wait.
					gun._.on('node').emit({soul: $.soul, field: field});
				} else
				if(Gun.is.soul(val = node[field])){
					gun.get(val, function(err, data){
						cb.call(gun, err, data);
						if(err || !data){ return }
						gun._.status('node').emit({soul: Gun.is.soul(val)});
					});
					gun._.on('soul').emit({soul: Gun.is.soul(val), field: null, from: $.soul, at: field});
				} else {
					cb.call(gun, null, val, field);
					gun._.on('soul').emit({soul: $.soul, field: field});
					gun._.on('node').emit({soul: $.soul, field: field});
				}
			});
			
			return gun;
		}
		Chain.val = function(cb){
			var gun = this, ctx = {};
			cb = cb || root.console.log.bind(root.console);
			
			gun._.status('node').event(function($){ // TODO: once per soul on graph. (?)
				var node = gun.__.graph[$.soul];
				cb.call(gun, $.field? node[$.field] : Gun.obj.copy(node)); // TODO: at terminating
			});
			
			return gun;
		}
		// .on(fn) gives you back the object, .on(fn, true) gives you delta pair.
		Chain.on = function(cb){
			var gun = this, ctx = {};
			cb = cb || function(){};
			
			// TODO: below is also probably going to be on node.
			gun.val(cb)._.status('soul').event(function($){ // TODO: once per soul on graph. (?)
				// TODO: Don't use val :(, but trigger callback now as well.
				gun.__.on($.soul).event(function(delta){
					var node = gun.__.graph[$.soul];
					cb.call(gun, Gun.obj.copy(node), $.field);
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
		Chain.put = function(val, cb, opt){ // handle case where val is a gun context!
			var gun = this.chain(), drift = Gun.time.is();
			cb = cb || function(){};
			opt = opt || {};
			
			if(!gun.back.back){
				gun = gun.chain();
				gun.back._.status('soul').emit({soul: Gun.is.soul.on(val) || Gun.roulette.call(gun), empty: true});
			}
			gun.back._.status('soul').event(function($){ // TODO: maybe once per soul?
				var ctx = {}, obj = val, $ = Gun.obj.copy($);
				console.log("chain.put", val, $);
				if(Gun.is.value(obj)){
					if($.from && $.at){
						$.soul = $.from;
						$.field = $.at;
					} // no else!
					if(!$.field){
						return cb.call(gun, {err: Gun.log("No field exists for " + (typeof obj) + "!")});
					} else
					if(gun.__.graph[$.soul]){
						ctx.tmp = {};
						ctx.tmp[ctx.field = $.field] = obj;
						obj = ctx.tmp;
					} else {
						return cb.call(gun, {err: Gun.log("No node exists to put " + (typeof obj) + " in!")});
					}
				}
				if(Gun.obj.is(obj)){
					if($.field && !ctx.field){
						ctx.tmp = {};
						ctx.tmp[ctx.field = $.field] = obj;
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
								env.graph[at.node._[Gun._.soul] = $.soul] = at.node;
								cb(at, $.soul);
							} else {
								$.empty? path() : gun.back.path(at.path.join('.'), path); // TODO: clean this up.
								function path(err, data){
									var soul = Gun.is.soul.on(data) || Gun.roulette.call(gun);
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
						console.log("chain.put PUT <----", ify.graph);
						if(err || ify.err){ return cb.call(gun, err || ify.err) }
						if(err = Gun.union(gun, ify.graph).err){ return cb.call(gun, err) }
						if($.from = Gun.is.soul(ify.root[$.field])){ $.soul = $.from; $.field = null }
						gun._.on('soul').emit({soul: $.soul, field: $.field, candy: true});
						gun._.on('node').emit({soul: $.soul, field: $.field, barf: false});
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
		Chain.not = function(cb){
			var gun = this, ctx = {};
			cb = cb || function(){};
			
			gun._.status('null').once(function(){
				var chain = gun.chain(), next = cb.call(chain);
				next._.status('soul').event(function($){ gun._.on('soul').emit($) });
				next._.status('node').event(function($){ gun._.on('node').emit($) });
				chain._.on('soul').emit({soul: Gun.roulette.call(chain), empty: true});
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
						if(c === l[i]){ return i } // use this for now
					}
				}
			}
			return f? rr : Util.list.index? 0 : -1;
		}
		Util.time = {};
		Util.time.is = function(t){ return t? t instanceof Date : (+new Date().getTime()) }
	}(Gun));
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
	;Gun.ify=(function(Serializer){
		function ify(data, cb, opt){
			opt = opt || {};
			cb = cb || function(env, cb){ cb(env.at, Gun.roulette()) };
			var end = function(fn){
				ctx.end = fn || function(){};
				if(ctx.err){ return ctx.end(ctx.err, ctx), ctx.end = function(){} }
			}, ctx = {};
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
			Gun.obj.map(ctx.at.obj, function(val, field){
				ctx.at.val = val;
				ctx.at.field = field;
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
					ctx.at.node[field] = Gun.obj.copy(val);
				}
				cb(ctx, function(at, soul){
					at.soul = at.soul || soul;
					setImmediate(function(){ unique(ctx) },0);
					if(!at.back || !at.back.length){ return }
					Gun.list.map(at.back, function(rel){
						rel[Gun._.soul] = at.soul;
					});
				});
			});
		}
		function unique(ctx){
			if(ctx.err || !Gun.list.map(ctx.seen, function(at){
				if(!at.soul){ return true }
			})){ return ctx.end(ctx.err, ctx), ctx.end = function(){} }
		}
		function seen(ctx, at){
			return Gun.list.map(ctx.seen, function(has){
				if(at.obj === has.obj){ return has }
			}) || (ctx.seen.push(at) && false);
		}
		return ify;
	}({}));
	if(typeof window !== "undefined"){
		window.Gun = Gun;
	} else {
		module.exports = Gun;
	}
	var setImmediate = setImmediate || function(cb){return setTimeout(cb,0)};
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
							return Gun.union(gun, reply.body);
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
					console.log("PUT success?", err, reply);
					if(err || !reply || (err = reply.body && reply.body.err)){
						return cb({err: Gun.log(err || "Error: Put failed on " + url) });
					} else {
						cb(null, reply.body);
					}
				}, {headers: tab.headers});
				cb.peers = true;
			}); tab.peers(cb);
			Gun.obj.map(nodes, function(node, soul){ // TODO: BUG? is this really necessary?
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
			if(!req.body){ return }
			if(Gun.is.node(req.body) || Gun.is.graph(req.body)){
				Gun.log("client server received request", req);
				Gun.union(gun, req.body); // TODO: BUG? Interesting, this won't update localStorage because .put isn't called?
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
			ws.onclose = window.onbeforeunload = function(c){
				if(!c){ return }
				if(ws && ws.close instanceof Function){ ws.close() }
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