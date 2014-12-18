;(function(){
	function Gun(opt){
		var gun = this;
		if(!Gun.is(gun)){
			return new Gun(opt);
		}
		gun.opt(opt);
	}
	Gun._ = {
		soul: '#'
		,meta: '_'
		,HAM: '>'
	}
	;(function(Gun){
		Gun.version = 0.9;
		Gun.is = function(gun){ return (gun instanceof Gun)? true : false }
		Gun.is.value = function(v){ // null, binary, number (!Infinity), text, or a rel.
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
		Gun.union = function(graph, prime){
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
				env = Gun.HAM(vertex, node, function(current, field, deltaValue){
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
				var serverState = Gun.time.is();
				// add more checks?
				var state = HAM(serverState, context.states.delta[field], context.states.current[field], deltaValue, current[field]);
				//console.log("HAM:", field, deltaValue, context.states.delta[field], context.states.current[field], 'the', state, (context.states.delta[field] - serverState));
				if(state.err){
					console.log(".!HYPOTHETICAL AMNESIA MACHINE ERR!.", state.err);
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
		Gun.log = function(a, b, c, d, e, f){
			var gun = this;
			if(!gun || !gun.__ || !gun.__.opt){
				return console.log.apply(console, arguments);
			}
			if(gun.__.opt.quiet){ return }
			return console.log.apply(console, arguments);
		}
	}(Gun));
	;(function(Chain){
		Chain.opt = function(opt, stun){ // idempotently update or set options
			var gun = this;
			gun._ = gun._ || {};
			gun.__ = gun.__ || {};
			gun.shot = Gun.shot('then', 'err');
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
			gun.__.opt.hooks = gun.__.opt.hooks || {};
			gun.__.hook = Gun.shot('next','end');
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
			Gun.obj.map(from._, function(val, field){
				gun._[field] = val;
			});
			return gun;
		}
		Chain.load = function(key, cb, opt){
			var gun = this.chain();
			gun.shot('done');
			gun.shot.done(function(){
				cb = cb || function(){};
				cb.soul = (key||{})[Gun._.soul];
				if(cb.soul){
					cb.node = gun.__.graph[cb.soul];
				} else {
					gun._.key = key;
					cb.node = gun.__.keys[key];
				}
				if(cb.node){ // set this to the current node, too!
					Gun.log.call(gun, "load via gun"); // remember to do all the same stack stuff here also!
					gun._.node = cb.node;
					if(Gun.fns.is(cb)){ cb.call(gun, null, Gun.obj.copy(gun._.node)) } // frozen copy
					gun.shot('then').fire(gun._.node); // freezing for internal use is NOT okay.
					return; // TODO: BUG: This needs to react the same as below! I think this is all done/resolved/clear now.
				}
				cb.fn = function(){}
				// missing: hear shots! I now hook this up in other places, but we could get async/latency issues?
				// We need to subscribe early? Or the transport layer handle this for us?
				if(Gun.fns.is(gun.__.opt.hooks.load)){
					gun.__.opt.hooks.load(key, function(err, data){
						// console.log('loaded', err, data);
						gun._.loaded = (gun._.loaded || 0) + 1; // TODO: loading should be idempotent even if we got an err or no data
						if(err){ return cb(err), (gun._.dud||cb.fn)(err) }
						if(!data){ return cb(null), (gun._.blank||cb.fn)() }
						var context = gun.union(data); // safely transform the data
						if(context.err){ return cb(context.err), (gun._.dud||cb.fn)(context.err) }
						gun._.node = gun.__.graph[data._[Gun._.soul]]; // don't wait for the union to be done because we want the immediate state not the intended state.
						if(!cb.soul){ gun.__.keys[key] = gun._.node } // TODO: BUG: what if the key has changed since we were gone? What do we resolve to? Not sure yet.
						if(Gun.fns.is(cb)){ cb.call(gun, null, Gun.obj.copy(gun._.node)) } // frozen copy
						gun.shot('then').fire(gun._.node); // freezing for internal use is NOT okay.
					}, opt);
				} else {
					Gun.log.call(gun, "Warning! You have no persistence layer to load from!");
				}
			});
			gun.shot('done').fire(); // because we are loading, we always fire!
			return gun;
		}
		Chain.key = function(key, cb){
			var gun = this;
			gun.shot.then(function(){
				//Gun.log.call(gun, "make key", key);
				cb = cb || function(){};
				if(Gun.obj.is(key)){ // if key is an object then we get the soul directly from it because the node might not exist in cache.
					Gun.obj.map(key, function(soul, field){ return key = field, cb.soul = soul });
				} else { // else the node does exist in cache and we will get the soul from it instead, plus link the key.
					cb.node = gun.__.keys[key] = gun._.node;
				}
				if(Gun.fns.is(gun.__.opt.hooks.key)){
					console.log("UGLY UGLY UGLY UGLY", key, cb.soul, cb.node);
					gun.__.opt.hooks.key(key, cb.soul || (cb.node||{_:{}})._[Gun._.soul], function(err, data){
						//Gun.log.call(gun, "key made", key);
						if(err){ return cb(err) }
						return cb(null);
					});
				} else {
					Gun.log.call(gun, "Warning! You have no key hook!");
				}
			});
			if(!gun.back){ gun.shot('then').fire() }
			return gun;
		}		
		/*
			how many different ways can we get something?
			Find via a singular path 
				.path('blah').get(blah);
			Find via multiple paths with the callback getting called many times
				.path('foo', 'bar').get(foorOrBar);
			Find via multiple paths with the callback getting called once with matching arguments
				.path('foo', 'bar').get(foo, bar)
			Find via multiple paths with the result aggregated into an object of pre-given fields 
				.path('foo', 'bar').get({foo: foo, bar: bar}) || .path({a: 'foo', b: 'bar'}).get({a: foo, b: bar})
			Find via multiple paths where the fields and values must match
				.path({foo: val, bar: val}).get({})
			Path ultimately should call .get each time, individually, for what it finds.
			Things that wait and merge many things together should be an abstraction ontop of path.
		*/
		Chain.path = function(path){ // The focal point follows the path
			var gun = this.chain();
			path = (path || '').split('.');
			gun.back.shot.then(function trace(node){ // should handle blank and err! Err already handled?
				//console.log("shot path", path, node);
				gun.field = null;
				gun._.node = node;
				if(!path.length){ // if the path resolves to another node, we finish here.
					return gun.shot('then').fire(node); // this is not frozen yet, but it is still used for internals so keep it unfrozen.
				}
				var field = Gun.text.ify(path.shift())
				, val = node[field];
				gun.field = field;
				if(Gun.is.soul(val)){ // we might end on a link, so we must resolve
					return gun.load(val).shot.then(trace);
				} else
				if(path.length){ // we cannot go any further, despite the fact there is more path, which means the thing we wanted does not exist.
					gun.shot('then').fire();
				} else { // we are done, and this should be the value we wanted.
					gun.shot('then').fire(val); // internals use this thus not frozen yet, but primitive values are passed as copies anyways in js.
				}
			});
			// if(!gun.back){ gun.shot('then').fire() } // replace below with this? maybe???
			if(gun.back && gun.back._ && gun.back._.loaded){
				gun._.node = gun.back._.node;
				gun.back.shot('then').fire(gun.back._.node);
			}
			return gun;
		}
		Chain.get = function(cb){
			var gun = this;
			gun.shot.then(function(val){
				cb.call(gun, Gun.obj.is(val)? Gun.obj.copy(val) : val); // frozen copy
			});
			return gun;
		}
		Chain.on = function(cb){
			var gun = this;
			gun.get(function(node){
				var get = this; // I'm not sure what state we're in, or which (get or gun) we should this-ify.
				cb.call(gun, Gun.obj.copy(node)); // frozen copy
				get.__.on(get._.node._[Gun._.soul]).event(function(delta){
					if(!delta){ return }
					if(!get.field){
						cb.call(get, Gun.obj.copy(get._.node)); // frozen copy
						return;
					}
					if(Gun.obj.has(delta, get.field)){
						delta = delta[get.field];
						cb.call(get, Gun.obj.is(delta)? Gun.obj.copy(delta) : delta); // frozen copy
					}
				})
			})
			return gun;
		}
		/*
			ACID compliant, unfortunately the vocabulary is vague, as such the following is an explicit definition:
			A - Atomic, if you set a full node, or nodes of nodes, if any value is in error then nothing will be set.
				If you want sets to be independent of each other, you need to set each piece of the data individually.
			C - Consistency, if you use any reserved symbols or similar, the operation will be rejected as it could lead to an invalid read and thus an invalid state.
			I - Isolation, the conflict resolution algorithm guarantees idempotent transactions, across every peer, regardless of any partition,
				including a peer acting by itself or one having been disconnected from the network.
			D - Durability, if the acknowledgement receipt is received, then the state at which the final persistence hook was called on is guaranteed to have been written.
				The live state at point of confirmation may or may not be different than when it was called.
				If this causes any application-level concern, it can compare against the live data by immediately reading it, or accessing the logs if enabled.
		*/
		Chain.set = function(val, cb, opt){ // TODO: need to turn deserializer into a trampolining function so stackoverflow doesn't happen.
			opt = opt || {};
			var gun = this, set;
			gun.shot.then(function(){ // set/key should cause a subscription, is this working yet?
				//console.log("chain.set", gun, gun.field, val, gun._.node);
				if(gun.field){ // field is always a string
					set = {}; // in case we are doing a set on a field, not on a node
					set[gun.field] = val; // we create a blank node with the field/value to be set
					val = set;
				} // TODO: should be able to handle val being a relation or a gun context or a gun promise.
				// TODO: BUG: IF we are setting an object, doing a partial merge, and they are reusing a frozen copy, we need to do a DIFF to update the HAM! Or else we'll get "old" HAM.
				val._ = Gun.ify.soul.call(gun, {}, gun._.node || val); // and then set their souls to be the same that way they will merge correctly for us during the union!
				cb = Gun.fns.is(cb)? cb : function(){};
				set = Gun.ify.call(gun, val);
				cb.root = set.root;
				if(set.err){ return cb(set.err), gun }
				set = Gun.ify.state(set.nodes, Gun.time.is()); // set time state on nodes?
				if(set.err){ return cb(set.err), gun }
				gun.union(set.nodes); // while this maybe should return a list of the nodes that were changed, we want to send the actual delta
				gun._.node = gun.__.graph[cb.root._[Gun._.soul]] || cb.root;
				// TODO? ^ Maybe BUG! if val is a new node on a field, _.node should now be that! Or will that happen automatically?
				if(Gun.fns.is(gun.__.opt.hooks.set)){
					gun.__.opt.hooks.set(set.nodes, function(err, data){ // now iterate through those nodes to a persistence layer and get a callback once all are saved
						if(err){ return cb(err) }
						return cb(null);
					});
				} else {
					Gun.log.call(gun, "Warning! You have no persistence layer to save to!");
				}
			});
			if(!gun.back){ gun.shot('then').fire() }
			return gun;
		}
		// Union is different than set. Set casts non-gun style of data into a gun compatible data.
		// Union takes already gun compatible data and validates it for a merge.
		// Meaning it is more low level, such that even set uses union internally.
		Chain.union = function(prime, cb){
			var tmp = {}, gun = this, context = Gun.shot();
			cb = cb || function(){}
			context.nodes = {};
			if(!prime){
				context.err = {err: "No data to merge!"};
			} else
			if(Gun.is.soul.on(prime)){
				tmp[prime._[Gun._.soul]] = prime;
				prime = tmp;
			}
			if(!gun || context.err){
				cb(context.err = context.err || {err: "No gun instance!", corrupt: true}, context);
				return context;
			}
			if(!Gun.is.graph(prime, function(node, soul){
				context.nodes[soul] = node;
			})){
				cb(context.err = context.err || {err: "Invalid graph!", corrupt: true}, context);
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
		Chain.blank = function(blank){
			this._.blank = Gun.fns.is(blank)? blank : function(){};
			return this;
		}
		Chain.err = Chain.dud = function(dud){ // WARNING: dud will be depreciated in favor of err.
			this._.dud = Gun.fns.is(dud)? dud : function(){};
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
		Util.obj.has = function(o, t){ return Object.prototype.hasOwnProperty.call(o, t) }
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
					(chain._[where]||[]).push(fn);
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
		Gun.ify = function(data){ // TODO: BUG: Modify lists to include HAM state
			var gun = Gun.is(this)? this : {}
			, context = {
				nodes: {}
				,seen: []
				,_seen: []
			}, nothing;
			function ify(data, context, sub){
				sub = sub || {};
				sub.path = sub.path || '';
				context = context || {};
				context.nodes = context.nodes || {};
				if((sub.simple = Gun.is.value(data)) && !(sub._ && Gun.text.is(sub.simple))){
					return data;
				} else
				if(Gun.obj.is(data)){
					var value = {}, symbol = {}, seen
					, err = {err: "Metadata does not support external or circular references at " + sub.path, meta: true};
					context.root = context.root || value;
					if(seen = ify.seen(context._seen, data)){
						//Gun.log.call(gun, "seen in _", sub._, sub.path, data);
						context.err = err;
						return;
					} else
					if(seen = ify.seen(context.seen, data)){
						//Gun.log.call(gun, "seen in data", sub._, sub.path, data);
						if(sub._){
							context.err = err;
							return;
						}
						symbol = Gun.ify.soul.call(gun, symbol, seen);
						return symbol;
					} else {
						//Gun.log.call(gun, "seen nowhere", sub._, sub.path, data);
						if(sub._){
							context.seen.push({data: data, node: value});
						} else {
							value._ = Gun.ify.soul.call(gun, {}, data);
							context.seen.push({data: data, node: value});
							context.nodes[value._[Gun._.soul]] = value;
						}
					}
					Gun.obj.map(data, function(val, field){
						var subs = {path: sub.path + field + '.', _: sub._ || (field == Gun._.meta)? true : false };
						val = ify(val, context, subs);
						//Gun.log.call(gun, '>>>>', sub.path + field, 'is', val);
						if(context.err){ return true }
						if(nothing === val){ return }
						// TODO: check field validity
						value[field] = val;
					});
					if(sub._){ return value }
					if(!value._ || !value._[Gun._.soul]){ return }
					symbol[Gun._.soul] = value._[Gun._.soul];
					return symbol;
				} else
				if(Gun.list.is(data)){
					var unique = {}, edges
					, err = {err: "Arrays cause data corruption at " + sub.path, array: true}
					edges = Gun.list.map(data, function(val, i, map){
						val = ify(val, context, sub);
						if(context.err){ return true }
						if(!Gun.obj.is(val)){
							context.err = err;
							return true;
						}
						return Gun.obj.map(val, function(soul, field){
							if(field !== Gun._.soul){
								context.err = err;
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
					context.err = {err: "Data type not supported at " + sub.path, invalid: true};
				}
			}
			ify.seen = function(seen, data){
				// unfortunately, using seen[data] = true will cause false-positives for data's children
				return Gun.list.map(seen, function(check){
					if(check.data === data){ return check.node }
				});
			}
			ify(data, context);
			return context;
		}
		Gun.ify.state = function(nodes, now){
			var context = {};
			context.nodes = nodes;
			context.now = now = (now === 0)? now : now || Gun.time.is();
			Gun.obj.map(context.nodes, function(node, soul){
				if(!node || !soul || !node._ || !node._[Gun._.soul] || node._[Gun._.soul] !== soul){
					return context.err = {err: "There is a corruption of nodes and or their souls", corrupt: true};
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
}({}));

;(function(tab){
	if(!this.Gun){ return }
	if(!window.JSON){ throw new Error("Include JSON first: ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js") } // for old IE use
	Gun.on('opt').event(function(gun, opt){
		window.tab = tab; // for debugging purposes
		opt = opt || {};
		tab.headers = opt.headers || {};
		tab.headers['gun-tid'] = tab.headers['gun-tid'] || Gun.text.random();
		tab.load = tab.load || function(key, cb, opt){
			if(!key){ return }
			cb = cb || function(){};
			opt = opt || {};
			opt.url = opt.url || {};
			opt.headers = tab.headers;
			if(key[Gun._.soul]){
				opt.url.query = key;
			} else {
				opt.url.pathname = '/' + key;
			}
			console.log("gun load", key);
			Gun.obj.map(gun.__.opt.peers, function(peer, url){
				request(url, null, function(err, reply){
					console.log('via', url, key, reply);
					if(err || !reply){ return } // handle reconnect?
					if(reply.body && reply.body.err){
						cb(reply.body.err);
					} else {
						cb(null, reply.body);
					}
				}, opt);
				cb.peers = true;
			});
			if(!cb.peers){ // there are no peers! this is a local only instance
				Gun.log.call(gun, "Warning! You have no peers to connect to!");
				setTimeout(function(){cb({err: "No peers!"})},0);
			}
		}
		tab.key = function(key, soul, cb){
			var meta = {};
			meta[Gun._.soul] = soul = Gun.text.is(soul)? soul : (soul||{})[Gun._.soul];
			if(!soul){
				return cb({err: "No soul!"});
			}
			Gun.obj.map(gun.__.opt.peers, function(peer, url){
				request(url, meta, function(err, reply){
					console.log("gun key done", soul, err, reply);
					if(err || !reply){
						Gun.log.call(gun, err = err || "Error: Key failed to be made on " + url);
						// tab.key(key, soul, cb); // naive implementation of retry TODO: BUG: need backoff and anti-infinite-loop!
						cb(err);
					} else {
						cb();
					}
				}, {url: {pathname: '/' + key }, headers: tab.headers});
			});
		}
		tab.set = tab.set || function(nodes, cb){
			cb = cb || function(){};
			// TODO: batch and throttle later.
			//tab.store.set(cb.id = 'send/' + Gun.text.random(), nodes);
			console.log("gun set start");
			Gun.obj.map(gun.__.opt.peers, function(peer, url){
				request(url, nodes, function respond(err, reply, id){
					console.log("gun set done", err, reply, id);
					
					return;
					var body = reply && reply.body;
					respond.id = respond.id || cb.id;
					Gun.obj.del(tab.set.defer, id); // handle err with a retry? Or make a system auto-do it?
					if(!body){ return }
					if(body.defer){
						//console.log("deferring post", body.defer);
						tab.set.defer[body.defer] = respond;
					}
					if(body.reply){
						respond(null, {headers: reply.headers, body: body.reply });
					}
					if(body.refed){
						console.log("-------post-reply-all--------->", 1 || reply, err);
						Gun.obj.map(body.refed, function(r, id){
							var cb;
							if(cb = tab.set.defer[id]){
								cb(null, {headers: reply.headers, body: r}, id);
							}
						});
						// TODO: should be able to do some type of "checksum" that every request cleared, and if not, figure out what is wrong/wait for finish.
						return;
					}
					if(body.reply || body.defer || body.refed){ return }
					//tab.store.del(respond.id);
				}, {headers: tab.headers});
			});
			Gun.obj.map(nodes, function(node, soul){
				gun.__.on(soul).emit(node, true); // should we emit difference between local and not?
			});
		}
		tab.set.defer = {};
		request.createServer(function(req, res){
			console.log("client server received request", req);
			if(!req.body){ return }
			gun.union(req.body);
		});
		(function(){
			tab.store = {};
			var store = window.localStorage || {setItem: function(){}, removeItem: function(){}, getItem: function(){}};
			tab.store.set = function(key, val){console.log('setting', key); return store.setItem(key, Gun.text.ify(val)) }
			tab.store.get = function(key){ return Gun.obj.ify(store.getItem(key)) }
			tab.store.del = function(key){ return store.removeItem(key) }
		}());
		gun.__.opt.hooks.load = gun.__.opt.hooks.load || tab.load;
		gun.__.opt.hooks.set = gun.__.opt.hooks.set || tab.set;
		gun.__.opt.hooks.key = gun.__.opt.hooks.key || tab.key;
	});
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
				r.ws.cbs[req.wsrid = 'WS' + (+ new Date()) + '.' + Math.floor((Math.random()*65535)+1)] = function(err,res){
					delete r.ws.cbs[req.wsrid];
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
				if(res.wsrid){ (r.ws.cbs[res.wsrid]||function(){})(null, res) }
				console.log("We have a pushed message!", res);
				if(res.body){ r.createServer(res, function(){}) } // emit extra events.
			};
			ws.onerror = function(e){ console.log(e); };
			return true;
		}
		r.ws.peers = {};
		r.ws.cbs = {};
		r.jsonp = function(opt, cb){
			//console.log("jsonp send", opt);
			r.jsonp.ify(opt, function(url){
				//console.log(url);
				if(!url){ return }
				r.jsonp.send(url, function(reply){
					//console.log("jsonp reply", reply);
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
				//console.log("polling again");
				var o = {base: opt.base, headers: {pull: 1}};
				r.each(opt.headers, function(v,i){ o.headers[i] = v })
				r.jsonp(o, function(err, reply){
					delete r.jsonp.poll.s[opt.base];
					//console.log(' ');
					while(reply.body && reply.body.length && reply.body.shift){ // we're assuming an array rather than chunk encoding. :(
						var res = reply.body.shift();
						//console.log("-- go go go", res);
						if(res && res.body){ r.createServer(res, function(){}) } // emit extra events.
					}
				});
			}, res.headers.poll);
		}
		r.jsonp.ify = function(opt, cb){
			var uri = encodeURIComponent, q = '?';
			if(opt.url && opt.url.pathname){ q = opt.url.pathname + q; }
			q = opt.base + q;
			//console.log("what up doc?", opt);
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