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
		Gun.is = function(gun){ return (gun instanceof Gun)? true : false }
		Gun.version = 0.8;
		Gun.union = function(graph, prime){
			var context = Gun.shot();
			context.nodes = {};
			context('done');context('change');
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
					each.call({incoming: true, converge: true}, current, field, deltaValue);
					return;
				}
				var serverState = Gun.time.is();
				// add more checks?
				var state = HAM(serverState, context.states.delta[field], context.states.current[field], deltaValue, current[field]);
				//console.log("HAM:", field, deltaValue, context.states.delta[field], context.states.current[field], 'the', state, (context.states.delta[field] - serverState));
				if(state.err){
					Gun.log(".!HYPOTHETICAL AMNESIA MACHINE ERR!.", state.err);
					return;
				}
				if(state.state || state.quarantineState || state.current){
					context('lower').fire(context, state, current, field, deltaValue);
					return;
				}
				if(state.incoming){
					each.call(state, current, field, deltaValue);
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
			//console.log(a, b, c, d, e, f);
			//console.log.apply(console, arguments);
		}
	}(Gun));
	;(function(Chain){
		Chain.opt = function(opt, stun){ // idempotently update or set options
			var gun = this;
			gun._ = gun._ || {};
			gun.__ = gun.__ || {};
			gun.shot = Gun.shot();
			gun.shot('then');
			gun.shot('err');
			if(!opt){ return gun }
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
			Gun.obj.map(opt.hooks, function(h, f){
				if(!Gun.fns.is(h)){ return }
				gun.__.opt.hooks[f] = h;
			});
			if(!stun){ Gun.on('opt').emit(gun, opt) }
			return gun;
		}
		Chain.chain = function(from){
			var gun = Gun();
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
			cb = cb || function(){};
			gun.shot.then(function(){ cb.apply(gun, arguments) });
			cb.soul = (key||{})[Gun._.soul];
			if(cb.soul){
				cb.node = gun.__.graph[cb.soul];
			} else {
				gun._.key = key;
				cb.node = gun.__.keys[key];
			}
			if(cb.node){ // set this to the current node, too!
				Gun.log("from gun"); // remember to do all the same stack stuff here also!
				var freeze = Gun.obj.copy(gun._.node = cb.node);
				gun.shot('then').fire(freeze); // freeze now even though internals use this? OK for now.
				return gun; // TODO: BUG: This needs to react the same as below!
			}
			cb.fn = function(){}
			// missing: hear shots!
			if(Gun.fns.is(gun.__.opt.hooks.load)){
				gun.__.opt.hooks.load(key, function(err, data){
					gun._.loaded = (gun._.loaded || 0) + 1; // TODO: loading should be idempotent even if we got an err or no data
					if(err){ return (gun._.dud||cb.fn)(err) }
					if(!data){ return (gun._.blank||cb.fn)() }
					var context = gun.union(data); // safely transform the data
					if(context.err){ return (gun._.dud||cb.fn)(context.err) }
					gun._.node = gun.__.graph[data._[Gun._.soul]]; // don't wait for the union to be done because we want the immediate state not the intended state.
					if(!cb.soul){ gun.__.keys[key] = gun._.node }
					var freeze = Gun.obj.copy(gun._.node);
					gun.shot('then').fire(freeze); // freeze now even though internals use this? OK for now.
				}, opt);
			} else {
				Gun.log("Warning! You have no persistence layer to load from!");
			}
			return gun;
		}
		Chain.key = function(key, cb){
			var gun = this;
			gun.shot.then(function(){
				Gun.log("make key", key);
				cb = cb || function(){};
				cb.node = gun.__.keys[key] = gun._.node;
				if(!cb.node){ return gun }
				if(Gun.fns.is(gun.__.opt.hooks.key)){
					gun.__.opt.hooks.key(key, cb.node._[Gun._.soul], function(err, data){
						Gun.log("key made", key);
						if(err){ return cb(err) }
						return cb(null);
					});
				} else {
					Gun.log("Warning! You have no key hook!");
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
		*/
		Chain.path = function(path){ // The focal point follows the path
			var gun = this.chain();
			path = (path || '').split('.');
			gun.back.shot.then(function trace(node){ // should handle blank and err! Err already handled?
				//console.log("shot path", path, node);
				gun.field = null;
				gun._.node = node;
				if(!path.length){ // if the path resolves to another node, we finish here
					return gun.shot('then').fire(node); // already frozen from loaded.
				}
				var field = path.shift()
				, val = node[field];
				gun.field = field;
				if(Gun.ify.is.soul(val)){ // we might end on a link, so we must resolve
					return gun.load(val).shot.then(trace);
				} else
				if(path.length){ // we cannot go any further, despite the fact there is more path, which means the thing we wanted does not exist
					gun.shot('then').fire();
				} else { // we are done, and this should be the value we wanted.
					gun.shot('then').fire(val); // primitive values are passed as copies in JS.
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
				cb.call(gun, val); // frozen from done.
				gun.__.on(gun._.node._[Gun._.soul]).event(function(delta){
					if(!delta){ return }
					if(!gun.field){
						cb.call(gun, Gun.obj.copy(gun._.node));
						return;
					}
					if(Gun.obj.has(delta, gun.field)){
						cb.call(gun, delta[gun.field]);
					}
				})
			});
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
			gun.shot.then(function(){
				if(gun.field){ // a field cannot be 0!
					set = {}; // in case we are doing a set on a field, not on a node
					set[gun.field] = val; // we create a blank node with the field/value to be set
					val = set;
				} // TODO: should be able to handle val being a relation or a gun context or a gun promise.
				val._ = Gun.ify.soul.call(gun, {}, gun._.node); // and then set their souls to be the same that way they will merge correctly for us during the union!
				cb = Gun.fns.is(cb)? cb : function(){};
				set = Gun.ify.call(gun, val);
				cb.root = set.root;
				if(set.err){ return cb(set.err), gun }
				set = Gun.ify.state(set.nodes, Gun.time.is()); // set time state on nodes?
				if(set.err){ return cb(set.err), gun }
				Gun.union(gun.__.graph, set.nodes); // while this maybe should return a list of the nodes that were changed, we want to send the actual delta
				gun._.node = gun.__.graph[cb.root._[Gun._.soul]] || cb.root;
				// TODO? ^ Maybe BUG! if val is a new node on a field, _.node should now be that! Or will that happen automatically?
				if(Gun.fns.is(gun.__.opt.hooks.set)){
					gun.__.opt.hooks.set(set.nodes, function(err, data){ // now iterate through those nodes to S3 and get a callback once all are saved
						//Gun.log("gun set hook callback called");
						if(err){ return cb(err) }
						return cb(null);
					});
				} else {
					Gun.log("Warning! You have no persistence layer to save to!");
				}
			});
			if(!gun.back){ gun.shot('then').fire() }
			return gun;
		}
		Chain.union = function(prime, cb){
			var tmp, gun = this, context = Gun.shot();
			context.nodes = {};
			cb = cb || function(){}
			if(!prime){
				context.err = {err: "No data to merge!"};
			} else
			if(prime._ && prime._[Gun._.soul]){
				tmp = {};
				tmp[prime._[Gun._.soul]] = prime;
				prime = tmp;
			}
			if(!gun || context.err){
				cb(context.err = context.err || {err: "No gun instance!", corrupt: true}, context);
				return context;
			}
			Gun.obj.map(prime, function(node){ // map over the prime graph, to get each node that has been modified
				var set = Gun.ify.call(gun, node);
				if(set.err){ return context.err = set.err } // check to see if the node is valid
				Gun.obj.map(set.nodes, function(node, soul){ // if so, map over it, and any other nodes that were deserialized from it
					context.nodes[soul] = node; // into a valid context we'll actually do a union on.
				});
			});
			if(context.err){ return cb(context.err, context), context } // if any errors happened in the previous steps, then fail.
			Gun.union(gun.__.graph, context.nodes).done(function(err, env){ // now merge prime into the graph
				context.err = err || env.err;
				cb(context.err, context || {});
			}).change(function(delta){
				if(!delta || !delta._ || !delta._[Gun._.soul]){ return }
				gun.__.on(delta._[Gun._.soul]).emit(Gun.obj.copy(delta)); // this is in reaction to HAM
			});
			return context;
		}
		Chain.match = function(){ // same as path, except using objects
			return this;
		}
		Chain.blank = function(blank){
			this._.blank = Gun.fns.is(blank)? blank : function(){};
			return this;
		}
		Chain.dud = function(dud){
			this._.dud = Gun.fns.is(dud)? dud : function(){};
			return this;
		}
	}(Gun.chain = Gun.prototype));
	;(function(Util){
		Util.fns = {};
		Util.fns.is = function(fn){ return (fn instanceof Function)? true : false }
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
			return chain.$ = function(where){
				(chain._ = chain._ || {})[where] = chain._[where] || [];
				chain.$[where] = chain.$[where] || function(fn){
					(chain._[where]||[]).push(fn);
					return chain.$;
				}
				chain.where = where;
				return chain;
			}
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
				if((sub.simple = Gun.ify.is(data)) && !(sub._ && Gun.text.is(sub.simple))){
					return data;
				} else
				if(Gun.obj.is(data)){
					var value = {}, symbol = {}, seen
					, err = {err: "Metadata does not support external or circular references at " + sub.path, meta: true};
					context.root = context.root || value;
					if(seen = ify.seen(context._seen, data)){
						//Gun.log("seen in _", sub._, sub.path, data);
						context.err = err;
						return;
					} else
					if(seen = ify.seen(context.seen, data)){
						//Gun.log("seen in data", sub._, sub.path, data);
						if(sub._){
							context.err = err;
							return;
						}
						symbol = Gun.ify.soul.call(gun, symbol, seen);
						return symbol;
					} else {
						//Gun.log("seen nowhere", sub._, sub.path, data);
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
						//Gun.log('>>>>', sub.path + field, 'is', val);
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
			if(Gun.ify.soul.is(from)){
				to[Gun._.soul] = from._[Gun._.soul];
				return to;
			}
			to[Gun._.soul] = Gun.roulette.call(gun);
			return to;
		}		
		Gun.ify.soul.is = function(o){
			if(o && o._ && o._[Gun._.soul]){
				return true;
			}
		}
		Gun.ify.is = function(v){ // null, binary, number (!Infinity), text, or a rel.
			if(v === null){ return true } // deletes
			if(v === Infinity){ return false } // we want this to be, but JSON does not support it, sad face.
			if(Gun.bi.is(v) 
			|| Gun.num.is(v) 
			|| Gun.text.is(v)){
				return true; // simple values
			}
			var yes;
			if(yes = Gun.ify.is.soul(v)){
				return yes;
			}
			return false;
		}
		Gun.ify.is.soul = function(v){
			if(Gun.obj.is(v)){
				var yes;
				Gun.obj.map(v, function(soul, field){
					if(yes){ return yes = false }
					if(field === Gun._.soul && Gun.text.is(soul)){
						yes = soul;
					}
				});
				if(yes){
					return yes;
				}
			}
			return false;
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
	if(!window.JSON){ Gun.log("Include JSON first: ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js") } // for old IE use
	Gun.on('opt').event(function(gun, opt){
		tab.server = tab.server || function(req, res, next){
			
		}
		window.tab = tab; // window.XMLHttpRequest = null; // for debugging purposes
		(function(){
			tab.store = {};
			var store = window.localStorage || {setItem: function(){}, removeItem: function(){}, getItem: function(){}};
			tab.store.set = function(key, val){console.log('setting', key); return store.setItem(key, Gun.text.ify(val)) }
			tab.store.get = function(key){ return Gun.obj.ify(store.getItem(key)) }
			tab.store.del = function(key){ return store.removeItem(key) }
		}());
		tab.load = tab.load || function(key, cb, opt){
			if(!key){ return }
			cb = cb || function(){};
			opt = opt || {};
			if(key[Gun._.soul]){
				key = '_' + tab.query(key);
			}
			Gun.obj.map(gun.__.opt.peers, function(peer, url){
				tab.ajax(url + '/' + key, null, function(err, reply){
					console.log('via', url, key, reply);
					if(!reply){ return } // handle reconnect?
					if(reply.body && reply.body.err){
						cb(reply.body.err);
					} else {
						cb(null, reply.body);
					}
					
					(function(){
						tab.subscribe.sub = (reply.headers || {})['gun-sub'] || tab.subscribe.sub;
						//console.log("We are sub", tab.subscribe.sub);
						var data = reply.body;
						if(!data || !data._){ return }
						tab.subscribe(data._[Gun._.soul]);
					}());
				}, {headers: {'Gun-Sub': tab.subscribe.sub || ''}, header: {'Gun-Sub': 1}});
			});
		}
		tab.url = function(nodes){
			return;
			console.log("urlify delta", nodes);
			var s = ''
			,	uri = encodeURIComponent;
			Gun.obj.map(nodes, function(delta, soul){
				var ham;
				if(!delta || !delta._ || !(ham = delta._[Gun._.HAM])){ return }
				s += uri('#') + '=' + uri(soul) + '&';
				Gun.obj.map(delta, function(val, field){
					if(field === Gun._.meta){ return }
					s += uri(field) + '=' + uri(Gun.text.ify(val)) + uri('>') + uri(ham[field]) + '&';
				})
			});
			console.log(s);
			return s;
		}
		tab.set = tab.set || function(nodes, cb){
			cb = cb || function(){};
			// TODO: batch and throttle later.
			//tab.store.set(cb.id = 'send/' + Gun.text.random(), nodes);
			//tab.url(nodes);
			Gun.obj.map(gun.__.opt.peers, function(peer, url){
				tab.ajax(url, nodes, function respond(err, reply, id){
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
				}, {headers: {'Gun-Sub': tab.subscribe.sub || ''}});
			});
			Gun.obj.map(nodes, function(node, soul){
				gun.__.on(soul).emit(node, true); // should we emit difference between local and not?
			});
		}
		tab.set.defer = {};
		tab.subscribe = function(soul){ // TODO: BUG!!! ERROR! Handle disconnection (onerror)!!!!
			tab.subscribe.to = tab.subscribe.to || {};
			if(soul){
				tab.subscribe.to[soul] = 1;
			}
			var opt = {
				header: {'Gun-Sub': 1},
				headers: {
					'Gun-Sub': tab.subscribe.sub || ''
				}
			},	query = tab.subscribe.sub? '' :	tab.query(tab.subscribe.to);
			console.log("subscribing poll", tab.subscribe.sub);
			Gun.obj.map(gun.__.opt.peers, function(peer, url){
				tab.ajax(url + query, null, function(err, reply){
					if(err || !reply || !reply.body || reply.body.err){ // not interested in any null/0/''/undefined values
						//console.log(err, reply);
						return;
					}
					console.log("poll", 1 || reply);
					tab.subscribe.poll();
					if(reply.headers){
						tab.subscribe.sub = reply.headers['gun-sub'] || tab.subscribe.sub;
					}
					if(!reply.body){ return } // do anything?
					gun.union(reply.body); // safely transform data
				}, opt);
			});
		}
		tab.subscribe.poll = function(){
			clearTimeout(tab.subscribe.poll.id);
			tab.subscribe.poll.id = setTimeout(tab.subscribe, 1); //1000 * 10); // should enable some server-side control of this.
		}
		tab.query = function(params){
			var s = '?'
			,	uri = encodeURIComponent;
			Gun.obj.map(params, function(val, field){
				s += uri(field) + '=' + uri(val || '') + '&';
			});
			return s;
		}
		tab.ajax = (function(){
			function ajax(url, data, cb, opt){
				var u;
				opt = opt || {};
				opt.header = opt.header || {};
				opt.header["Content-Type"] = 1;
				opt.headers = opt.headers || {};
				if(data === u || data === null){
					data = u;
				} else {
					try{data = JSON.stringify(data);
						opt.headers["Content-Type"] = "application/json";
					}catch(e){}
				}
				opt.method = opt.method || (data? 'POST' : 'GET');
				var xhr = ajax.xhr() || ajax.jsonp() // TODO: BUG: JSONP push is working, but not post
				, clean = function(){
					if(!xhr){ return }
					xhr.onreadystatechange = xhr.onerror = null;
					try{xhr.abort();
					}catch(e){}
					xhr = null;
				}
				xhr.onerror = function(){
					if(cb){
						cb({err: err || 'Unknown error.', status: xhr.status });
					}
					clean(xhr.status === 200 ? 'network' : 'permanent');
				};
				xhr.onreadystatechange = function(){
					if(!xhr){ return }
					var reply, status;
					try{reply = xhr.responseText;
						status = xhr.status;
					}catch(e){}
					if(status === 1223){ status = 204 }
					if(xhr.readyState === 3){
						if(reply && 0 < reply.length){
							opt.ondata(status, reply);
						}
					} else
					if(xhr.readyState === 4){						
						opt.ondata(status, reply, true);
						clean(status === 200? 'network' : 'permanent');
					}
				};
				opt.ondata = opt.ondata || function(status, chunk, end){
					if(status !== 200){ return }
					try{ajax.each(opt.header, function(val, i){
							(xhr.responseHeader = xhr.responseHeader||{})[i.toLowerCase()] = xhr.getResponseHeader(i);
						});
					}catch(e){}
					var data, buf, pos = 1;
					while(pos || end){ // in order to end
						if(u !== data){ // we need at least one loop
							opt.onload({
								headers: xhr.responseHeader || {}
								,body: data
							});
							end = false; // now both pos and end will be false
						}
						if(ajax.string(chunk)){
							buf = chunk.slice(xhr.index = xhr.index || 0);
							pos = buf.indexOf('\n') + 1;
							data = pos? buf.slice(0, pos - 1) : buf;
							xhr.index += pos;
						} else {
							data = chunk;
							pos = 0;
						}
					}
				}
				opt.onload = opt.onload || function(reply){
					if(!reply){ return }
					if( reply.headers && ("application/json" === reply.headers["content-type"])){
						var body;
						try{body = JSON.parse(reply.body);
						}catch(e){body = reply.body}
						reply.body = body;
					}
					if(cb){
						cb(null, reply);
					}
				}
				if(opt.cookies || opt.credentials || opt.withCredentials){
					xhr.withCredentials = true;
				}
				opt.headers["X-Requested-With"] = xhr.transport || "XMLHttpRequest";
				try{xhr.open(opt.method, url, true);
				}catch(e){ return xhr.onerror("Open failed.") }
				if(opt.headers){
					try{ajax.each(opt.headers, function(val, i){
							xhr.setRequestHeader(i, val);
						});
					}catch(e){ return xhr.onerror("Invalid headers.") }
				}
				try{xhr.send(data);
				}catch(e){ return xhr.onerror("Failed to send request.") }
			}
			ajax.xhr = function(xhr){
				return (window.XMLHttpRequest && "withCredentials" in (xhr = new XMLHttpRequest()))? xhr : null;
			}
			ajax.jsonp = function(xhr){
				xhr = {};
				xhr.transport = "jsonp";
				xhr.open = function(method, url){
					xhr.url = url;
				}
				xhr.send = function(){
					xhr.url += ((xhr.url.indexOf('?') + 1)? '&' : '?') + 'jsonp=' + xhr.js.id;
					ajax.each(xhr.headers, function(val, i){
						xhr.url += '&' + encodeURIComponent(i) + "=" + encodeURIComponent(val);
					});
					xhr.js.src = xhr.url = xhr.url.replace(/%20/g, "+");
					document.getElementsByTagName('head')[0].appendChild(xhr.js);
				}
				xhr.setRequestHeader = function(i, val){
					(xhr.headers = xhr.headers||{})[i] = val;
				}
				xhr.getResponseHeader = function(i){ return (xhr.responseHeaders||{})[i] }
				xhr.js = document.createElement('script');
				window[xhr.js.id = 'P'+Math.floor((Math.random()*65535)+1)] = function(reply){
					xhr.status = 200;
					if(reply.chunks && reply.chunks.length){
						xhr.readyState = 3
						while(0 < reply.chunks.length){
							xhr.responseText = reply.chunks.shift();
							xhr.onreadystatechange();
						}
					}
					xhr.responseHeaders = reply.headers || {};
					xhr.readyState = 4;
					xhr.responseText = reply.body;
					xhr.onreadystatechange();
					xhr.id = xhr.js.id;
					xhr.js.parentNode.removeChild(xhr.js);
					window[xhr.id] = null;
					try{delete window[xhr.id];
					}catch(e){}
					
				}
				xhr.abort = function(){} // clean up?
				xhr.js.async = true;
				return xhr;
			}
			ajax.string = function(s){ return (typeof s == 'string') }
			ajax.each = function(obj, cb){
				if(!obj || !cb){ return }
				for(var i in obj){
					if(obj.hasOwnProperty(i)){
						cb(obj[i], i);
					}
				}
			}
			return ajax;
		}());
		gun.__.opt.hooks.load = gun.__.opt.hooks.load || tab.load;
		gun.__.opt.hooks.set = gun.__.opt.hooks.set || tab.set;
	});
}({}));