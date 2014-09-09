;(function(own){
	function Gun(opt){
		var gun = this;
		if(!Gun.is(gun)){
			return new Gun(opt);
		}
		gun.init(opt);
	}
	Gun.is = function(gun){ return (gun instanceof Gun)? true : false }
	Gun._ = {};
	Gun.chain = Gun.prototype;
	Gun.chain._ = {};
	Gun.chain._.opt = {};
	Gun.chain._.nodes = {};
	Gun.chain._.chain = {};
	Gun.chain._.trace = [];
	Gun.chain._.keys = {};
	Gun.chain.init = function(opt, stun){ // idempotently update or set options
		var gun = this;
		gun._.events = gun._.events || Gun.on.split(); // we may not want it global for each gun instance?
		gun._.events.trace = gun._.events.trace || 0;
		gun._.events.at = gun._.events.at || 0;
		if(Gun.text.is(opt)){ opt = {peers: opt} }
		if(Gun.list.is(opt)){ opt = {peers: opt} }
		if(Gun.text.is(opt.peers)){ opt.peers = [opt.peers] }
		if(Gun.list.is(opt.peers)){ opt.peers = Gun.obj.map(opt.peers, function(n,f,m){ m(n,{}) }) }
		gun._.opt.peers = opt.peers || gun._.opt.peers || {};
		gun._.opt.uuid = opt.uuid || gun._.opt.uuid || {};
		gun._.opt.hook = gun._.opt.hook || {};
		Gun.obj.map(opt.hook, function(h, f){
			if(!Gun.fns.is(h)){ return }
			gun._.opt.hook[f] = h;
		});
		if(!stun){ Gun.on('init').emit(gun, opt) }
		return gun;
	}
	Gun.chain.load = function(key, cb, opt){
		var gun = this;
		cb = cb || function(){};
		if(cb.node = gun._.keys[key]){ // set this to the current node, too!
			Gun.log("from gun"); // remember to do all the same stack stuff here also!
			return cb(Gun.obj.copy(gun._.node = cb.node)), gun; // TODO: BUG: This needs to be frozen/copied, and react the same as below!
		}
		cb.fn = function(){}
		gun._.key = key;
		// missing: hear shots!
		if(Gun.fns.is(gun._.opt.hook.load)){
			gun._.opt.hook.load(key, function(err, data){
				gun._.loaded = (gun._.loaded || 0) + 1; // TODO: loading should be idempotent even if we got an err or no data
				if(err){ return (gun._.chain.dud||cb.fn)(err) }
				if(!data){ return (gun._.chain.blank||cb.fn)() }
				var nodes = {}, node;
				nodes[data._[own.sym.id]] = data;// missing: transform data, merging it! NO, THIS IS DONE WRONG, do a real check.
				Gun.union(gun._.nodes, nodes);
				node = gun._.keys[key] = gun._.nodes[data._[own.sym.id]];
				cb(Gun.obj.copy(gun._.node = node));
				gun._.events.on(gun._.events.at += 1).emit(node);
				gun._.events.at = 0; // ???? reset it back once everything is done?
			}, opt);
		} else {
			Gun.log("Warning! You have no persistence layer to load from!");
		}
		return gun;
	}
	Gun.chain.key = function(key, cb){ // TODO: Need to setImmediate if not loaded yet?
		Gun.log("make key", key);
		cb = cb || function(){};
		this._.keys[key] = this._.node;
		if(Gun.fns.is(this._.opt.hook.key)){
			this._.opt.hook.key(key, this._.node, function(err, data){
				Gun.log("key made", key);
				if(err){ return cb(err) }
				return cb(null);
			});
		} else {
			Gun.log("Warning! You have no key hook!");
		}
		return this;
	}
	Gun.chain.path = function(path){ // The focal point follows the path
		var gun = this;
		path = path.split('.');
		Gun.log("PATH stack trace", gun._.events.trace + 1);
		gun._.events.on(gun._.events.trace += 1).event(function trace(node){
			Gun.log("stack at", gun._.events.at);
			if(!path.length){ // if the path resolves to another node, we finish here
				Gun.log("PATH resolved with node");
				gun._.events.on(gun._.events.at += 1).emit(node);
				return;
			}
			var field = path.shift()
			, val = node[field];
			gun._.field = field;
			if(field = Gun.ify.is.id(val)){ // we might end on a link, so we must resolve
				gun._.events.at -= 1; // take a step back because we need to be the next step again
				gun.load(field, trace, {id: true}).blank(function(){ }).dud(function(){ }); // TODO: Need to map these to the real blank/dud
			} else {
				if(path.length){ // we cannot go any further, despite the fact there is more path, which means the thing we wanted does not exist
					Gun.log("PATH failed to resolve");
					gun._.events.on(gun._.events.at += 1).emit();
				} else { // we are done, and this should be the value we wanted.
					Gun.log("PATH resolved", val);
					gun._.events.on(gun._.events.at += 1).emit(val);
				}
			}
		});
		if(gun._.loaded){
			console.log("Send off!", gun._.events.at + 1);
			gun._.events.on(gun._.events.at += 1).emit(gun._.node);
		}
		return gun;
	}
	Gun.chain.get = function(cb){
		var gun = this;
		Gun.log("GET stack trace", gun._.events.trace + 1);
		gun._.events.on(gun._.events.trace += 1).event(function(node){
			Gun.log("GOT", node);
			cb(Gun.obj.copy(node));
		});
		return this;
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
	Gun.chain.set = function(val, cb){ // TODO: set failed miserably to catch depth references in social tests
		var gun = this, set;
		if(gun._.field){ // a field cannot be 0!
			set = {}; // in case we are doing a set on a field, not on a node
			set[gun._.field] = val; // we create a blank node with the field/value to be set
			set._ = Gun.ify.id.call(gun, {}, gun._.node); // and then set their ids to be the same
			val = set; // that way they will merge correctly for us during the union!
		}
		cb = Gun.fns.is(cb)? cb : function(){};
		set = Gun.ify.call(gun, val);
		cb.root = set.root;
		if(set.err){ return cb(set.err), gun }
		set = gun.set.now(set.nodes, Gun.time.is()); // set time state on nodes?
		if(set.err){ return cb(set.err), gun }
		Gun.union(gun._.nodes, set.nodes); // while this maybe should return a list of the nodes that were changed, we want to send the actual delta
		gun._.node = gun._.nodes[cb.root._[own.sym.id]] || cb.root; // TODO? Maybe BUG! if val is a new node on a field, _.node should now be that! Or will that happen automatically?
		if(Gun.fns.is(gun._.opt.hook.set)){
			gun._.opt.hook.set(set.nodes, function(err, data){ // now iterate through those nodes to S3 and get a callback once all are saved
				Gun.log("gun set hook callback called");
				if(err){ return cb(err) }
				return cb(null);
			});
		} else {
			Gun.log("Warning! You have no persistence layer to save to!");
		}
		return gun;
	}
	Gun.chain.set.now = function(nodes, now){
		var context = {};
		context.nodes = nodes;
		context.now = now = (now === 0)? now : now || Gun.time.is();
		Gun.obj.map(context.nodes, function(node, id){
			if(!node || !id || !node._ || !node._[own.sym.id] || node._[own.sym.id] !== id){
				return context.err = {err: "There is a corruption of nodes and or their ids", corrupt: true};
			}
			var states = node._[own.sym.HAM] = node._[own.sym.HAM] || {};
			Gun.obj.map(node, function(val, field){
				if(field == own.sym.meta){ return }
				val = states[field];
				states[field] = (val === 0)? val : val || now;
			});
		});
		return context;
	}
	Gun.chain.match = function(){ // same as path, except using objects
		return this;
	}
	Gun.chain.blank = function(blank){
		this._.chain.blank = Gun.fns.is(blank)? blank : function(){};
		return this;
	}
	Gun.chain.dud = function(dud){
		this._.chain.dud = Gun.fns.is(dud)? dud : function(){};
		return this;
	}
	Gun.fns = {};
	Gun.fns.is = function(fn){ return (fn instanceof Function)? true : false }
	Gun.bi = {};
	Gun.bi.is = function(b){ return (b instanceof Boolean || typeof b == 'boolean')? true : false }
	Gun.num = {};
	Gun.num.is = function(n){
		return ((n===0)? true : (!isNaN(n) && !Gun.bi.is(n) && !Gun.list.is(n) && !Gun.text.is(n))? true : false );
	}
	Gun.text = {};
	Gun.text.is = function(t){ return typeof t == 'string'? true : false }
	Gun.text.ify = function(t){
		if(JSON){ return JSON.stringify(t) }
		return (t && t.toString)? t.toString() : t;
	}
	Gun.text.random = function(l, c){
		var s = '';
		l = l || 24; // you are not going to make a 0 length random number, so no need to check type
		c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghiklmnopqrstuvwxyz';
		while(l > 0){ s += c.charAt(Math.floor(Math.random() * c.length)); l-- }
		return s;
	}
	Gun.list = {};
	Gun.list.is = function(l){ return (l instanceof Array)? true : false }
	Gun.list.slit = Array.prototype.slice;
	Gun.list.sort = function(k){ // create a new sort function
		return function(A,B){
			if(!A || !B){ return 0 } A = A[k]; B = B[k];
			if(A < B){ return -1 }else if(A > B){ return 1 }
			else { return 0 }
		}
	}
	Gun.list.map = function(l, c, _){ return Gun.obj.map(l, c, _) }
	Gun.list.index = 1; // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
	Gun.obj = {};
	Gun.obj.is = function(o){ return (o instanceof Object && !Gun.list.is(o) && !Gun.fns.is(o))? true : false }
	Gun.obj.ify = function(o){
		if(Gun.obj.is(o)){ return o }
		try{o = JSON.parse(o);
		}catch(e){o={}};
		return o;
	}
	Gun.obj.copy = function(o){ // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
		return !o? o : JSON.parse(JSON.stringify(o)); // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
	}
	Gun.obj.has = function(o, t){ return Object.prototype.hasOwnProperty.call(o, t) }
	Gun.obj.map = function(l, c, _){
		var u, i = 0, ii = 0, x, r, rr, f = Gun.fns.is(c),
		t = function(k,v){
			if(v !== u){
				rr = rr || {};
				rr[k] = v;
				return;
			} rr = rr || [];
			rr.push(k);
		};
		if(Gun.list.is(l)){
			x = l.length;
			for(;i < x; i++){
				ii = (i + Gun.list.index);
				if(f){
					r = _? c.call(_, l[i], ii, t) : c(l[i], ii, t);
					if(r !== u){ return r }
				} else {
					//if(gun.test.is(c,l[i])){ return ii } // should implement deep equality testing!
					if(c === l[i]){ return ii } // use this for now
				}
			}
		} else {
			for(i in l){
				if(f){
					if(Gun.obj.has(l,i)){
						r = _? c.call(_, l[i], i, t) : c(l[i], i, t);
						if(r !== u){ return r }
					}
				} else {
					//if(a.test.is(c,l[i])){ return i } // should implement deep equality testing!
					if(c === l[i]){ return i }
				}
			}
		}
		return f? rr : Gun.list.index? 0 : -1;
	}
	Gun.time = {};
	Gun.time.is = function(t){ return t? t instanceof Date : (+new Date().getTime()) }
	Gun.on = (function(){
		function On(on){
			var e = On.is(this)? this : events;
			return e._ = e._ || {}, e._.on = Gun.text.ify(on), e;
		}
		On.is = function(on){ return (on instanceof On)? true : false }
		On.split = function(){ return new On() }
		On.sort = Gun.list.sort('i');
		On.echo = On.prototype;
		On.echo.on = On;
		On.echo.emit = function(what){
			var on = this._.on;
			if(!on){ return }
			this._.events = this._.events || {};
			var e = this._.events[on] = this._.events[on] || (this._.events[on] = [])
			, args = arguments;
			if(!(this._.events[on] = Gun.list.map(e, function(hear, i, map){
				if(!hear.as){ return }
				map(hear);
				hear.as.apply(hear, args);
			}))){ delete this._.events[on] }
		}
		On.echo.event = function(as, i){
			var on = this._.on, e;
			if(!on || !as){ return }
			this._.events = this._.events || {};
			on = this._.events[on] = this._.events[on] || (this._.events[on] = []);
			e = {as: as, i: i || 0, off: function(){ return !(e.as = false) }};
			return on.push(e), on.sort(On.sort), e;
		}
		On.echo.once = function(as, i){
			var on = this._.on, once = function(){
				this.off();
				as.apply(this, arguments);
			}
			return this.event(once, i);
		}
		var events = On.split();
		return On;
	}());
	Gun.roulette = function(l, c){
		var gun = Gun.is(this)? this : {};
		if(gun._ && gun._.opt && gun._.opt.uuid){
			if(Gun.fns.is(gun._.opt.uuid)){
				return gun._.opt.uuid(l, c);
			}
			l = l || gun._.opt.uuid.length;
		}
		return Gun.text.random(l, c);
	}
	Gun.union = function(graph, prime){
		var context = { nodes: {}};
		Gun.obj.map(prime, function(node, id){
			var vertex = graph[id];
			if(!vertex){ // disjoint
				context.nodes[node._[own.sym.id]] = graph[node._[own.sym.id]] = node;
				return;
			}
			Gun.HAM(vertex, node, function(current, field, deltaValue){ // partial
				vertex[field] = deltaValue; // vertex and current are the same
				vertex._[own.sym.HAM][field] = node._[own.sym.HAM][field];
			});
		});
	}
	Gun.HAM = function(current, delta, some){ // TODO: BUG! HAM on sub-graphs has not yet been put into code, thus divergences could occur - this is alpha!
		function HAM(machineState, incomingState, currentState, incomingValue, currentValue){
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
		var states = current._[own.sym.HAM] = current._[own.sym.HAM] || {} // TODO: need to cover the state of the node itself, not just the fields?
		, deltaStates = delta._[own.sym.HAM];
		Gun.obj.map(delta, function update(deltaValue, field){
			if(field === Gun.sym.meta){ return }
			if(!Gun.obj.has(current, field)){
				some(current, field, deltaValue);
				return;
			}
			var serverState = Gun.time.is();
			// add more checks?
			var state = HAM(serverState, deltaStates[field], states[field], deltaValue, current[field]);
			if(state.err){
				Gun.log(".!HYPOTHETICAL AMNESIA MACHINE ERR!.", state.err);
				return;
			}
			if(state.state || state.quarantineState || state.current){ return }
			if(state.incoming){
				some(current, field, deltaValue);
				return;
			}
			if(state.amnesiaQuarantine){
				Gun.schedule(deltaStates[field], function(){
					update(deltaValue, field);
				});
			}
		});
	}
	;(function(schedule){
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
		Gun.ify = function(data, gun){ // TODO: BUG: Modify lists to include HAM state
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
						symbol = Gun.ify.id.call(gun, symbol, seen);
						return symbol;
					} else {
						//Gun.log("seen nowhere", sub._, sub.path, data);
						if(sub._){
							context.seen.push({data: data, node: value});
						} else {
							value._ = Gun.ify.id.call(gun, {}, data);
							context.seen.push({data: data, node: value});
							context.nodes[value._[own.sym.id]] = value;
						}
					}
					Gun.obj.map(data, function(val, field){
						var subs = {path: sub.path + field + '.', _: sub._ || (field == own.sym.meta)? true : false };
						val = ify(val, context, subs);
						//Gun.log('>>>>', sub.path + field, 'is', val);
						if(context.err){ return true }
						if(nothing === val){ return }
						// TODO: check field validity
						value[field] = val;
					});
					if(sub._){ return value }
					if(!value._ || !value._[own.sym.id]){ return }
					symbol[own.sym.id] = value._[own.sym.id];
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
						return Gun.obj.map(val, function(id, field){
							if(field !== own.sym.id){
								context.err = err;
								return true;
							}					
							if(unique[id]){ return }
							unique[id] = 1;
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
		Gun.ify.id = function(to, from){
			var gun = this;
			to = to || {};
			if(Gun.ify.id.is(from)){
				to[own.sym.id] = from._[own.sym.id];
				return to;
			}
			to[own.sym.id] = Gun.roulette.call(gun);
			return to;
		}		
		Gun.ify.id.is = function(o){
			if(o && o._ && o._[own.sym.id]){
				return true;
			}
		}
		Gun.ify.is = function(v){ // null, binary, number (!Infinity), text, or a ref.
			if(v === null){ return true } // deletes
			if(v === Infinity){ return false }
			if(Gun.bi.is(v) 
			|| Gun.num.is(v) 
			|| Gun.text.is(v)){
				return true; // simple values
			}
			var yes;
			if(yes = Gun.ify.is.id(v)){
				return yes;
			}
			return false;
		}
		Gun.ify.is.id = function(v){
			if(Gun.obj.is(v)){
				var yes;
				Gun.obj.map(v, function(id, field){
					if(yes){ return yes = false }
					if(field === own.sym.id && Gun.text.is(id)){
						yes = id;
					}
				});
				if(yes){
					return yes;
				}
			}
			return false;
		}
	}());
	Gun.log = function(s, l){ 
		console.log.apply(console, arguments);
	}
	own.sym = Gun.sym = {
		id: '#'
		,meta: '_'
		,HAM: '>'
	}
	if(typeof window !== "undefined"){
		window.Gun = Gun;
	} else {
		module.exports = Gun;
	}
}({}));

;(function(Page){
	if(!this.Gun){ return }
	if(!window.JSON){ Gun.log("Include JSON first: ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js") } // for old IE use
	Gun.on('init').event(function(gun, opt){
		Page.load = function(key, cb, opt){
			cb = cb || function(){};
			opt = opt || {};
			Gun.obj.map(gun._.opt.peers, function(peer, url){
				Page.ajax(url + '/' + key, null, function(data){
					Gun.log('via', url, key, data);
					// alert(data + data.hello + data.from + data._);
					cb(null, data);
				});
			});
		}
		Page.ajax = 
		this.ajax = 
		function(url, data, cb, opt){
			/*
				via Sockjs@1.0.0
				Parts of the code are derived from various open source projects.
				For code derived from Socket.IO by Guillermo Rauch see https://github.com/LearnBoost/socket.io/tree/0.6.17#readme.
				Snippets derived from JSON-js by Douglas Crockford are public domain.
				Snippets derived from jQuery-JSONP by Julian Aubourg, generic MIT license.
				All other code is released on MIT license, see LICENSE.
			*/
			var u;
			opt = opt || {};
			if(data === u || data === null){
				data = u;
			} else {
				try{data = JSON.stringify(data);
				}catch(e){}
			}
			opt.method = (data? 'POST' : 'GET');
			// unload?
			opt.close = function(){
				opt.done(true);
			}
			opt.done = opt.done || function(abort){
				if(!opt.xhr){ return }
				// unload?
				try{opt.xhr.onreadystatechange = function(){};
					opt.xhr.ontimeout = opt.xhr.onerror = 
					opt.xhr.onprogress = opt.xhr.onload = null;
				}catch(e){}
				if(abort){
					try{opt.xhr.abort();
					}catch(e){}
				}
				opt.xhr = null;
			}
			opt.data = opt.data || function(d){
				var t;
				try{t = JSON.parse(d) || d;
				}catch(e){
					t = d;
				}
				if(cb){ cb(t) }
			}
			opt.chunk = function(status, text, force){
				if(status !== 200){ return }
				var d, b, p = 1;
				while(p || force){
					if(u !== d){ 
						opt.data(d);
						force = false;
					}
					b = text.slice(opt.i = opt.i || 0);
					p = b.indexOf('\n') + 1;
					d = p? b.slice(0, p - 1) : b;
					opt.i += p;
				}
			}
			opt.finish = function(status, text) {
				opt.chunk(status, text, true);
				opt.close(status === 200 ? 'network' : 'permanent');
			}
			opt.error = function(){
				opt.finish(0, '');
				opt.done();
			}
			opt.xhr = opt.xhr || (function(xhr){
				try{xhr = new(window.XDomainRequest || window.XMLHttpRequest || window.ActiveXObject)('Microsoft.XMLHTTP');
				}catch(e){}
				if(window.ActiveXObject || window.XDomainRequest){
					url += ((url.indexOf('?') === -1) ? '?' : '&') + 't='+(+new Date());
				}
				if(xhr && window.XDomainRequest){
					xhr.ontimeout = xhr.onerror = opt.error;
					xhr.onprogress = function(){
						opt.chunk(200, (xhr || {}).responseText);
					}
					xhr.onload = function(){
						opt.finish(200, (xhr || {}).responseText);
						opt.done();
					}
				}
				return xhr;
			}());
			if(!opt.xhr){
				opt.error();
				return;
			}
			if(opt.cookies || opt.credentials || opt.withCredentials){
				opt.xhr.withCredentials = true;
			}
			try{opt.xhr.open(opt.method, url, true);
			} catch(e) {
				opt.error();
				return;
			}
			opt.xhr.onreadystatechange = function(){
				if(!opt.xhr){ return }
				var reply, status;
				try{reply = opt.xhr.responseText;
					status = opt.xhr.status;
				}catch(e){}
				if(status === 1223){ status = 204 }
				if(opt.xhr.readyState === 3){
					if(reply && 0 < reply.length){
						opt.chunk(status, reply);
					}
				} else
				if(opt.xhr.readyState === 4){
					opt.finish(status, reply);
					opt.done(false);
				}
			}
			try{opt.xhr.send(data);
			}catch(e){
				opt.error();
			}
			return opt;
		}
		gun._.opt.hook.load = gun._.opt.hook.load || Page.load;
	});
}({}));