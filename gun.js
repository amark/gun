//console.log("!!!!!!!!!!!!!!!! WARNING THIS IS GUN 0.5 !!!!!!!!!!!!!!!!!!!!!!");
;(function(){ var u;
	function Gun(o){
		if(!(this instanceof Gun)){ return new Gun(o) }
		this._ = {gun: this, lex: {}, opt: {}, on: Gun.on, ons: {}};
		if(!(o instanceof Gun)){ this.opt(o) }
	}
		
	;(function(Util){ // Generic javascript utilities.
		;(function(Type){
			Type.fns = Type.fn = {is: function(fn){ return (!!fn && fn instanceof Function) }}
			Type.bi = {is: function(b){ return (b instanceof Boolean || typeof b == 'boolean') }}
			Type.num = {is: function(n){ return !Type.list.is(n) && (Infinity === n || n - parseFloat(n) + 1 >= 0) }}
			Type.text = {is: function(t){ return (typeof t == 'string') }}
			Type.text.ify = function(t){
				if(Type.text.is(t)){ return t }
				if(typeof JSON !== "undefined"){ return JSON.stringify(t) }
				return (t && t.toString)? t.toString() : t;
			}
			Type.text.random = function(l, c){
				var s = '';
				l = l || 24; // you are not going to make a 0 length random number, so no need to check type
				c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
				while(l > 0){ s += c.charAt(Math.floor(Math.random() * c.length)); l-- }
				return s;
			}
			Type.text.match = function(t, o){ var r = false;
				t = t || '';
				o = Gun.text.is(o)? {'=': o} : o || {}; // {'~', '=', '*', '<', '>', '+', '-', '?', '!'} // ignore case, exactly equal, anything after, lexically larger, lexically lesser, added in, subtacted from, questionable fuzzy match, and ends with.
				if(Type.obj.has(o,'~')){ t = t.toLowerCase(); o['='] = (o['='] || o['~']).toLowerCase() }
				if(Type.obj.has(o,'=')){ return t === o['='] }
				if(Type.obj.has(o,'*')){ if(t.slice(0, o['*'].length) === o['*']){ r = true; t = t.slice(o['*'].length) } else { return false }}
				if(Type.obj.has(o,'!')){ if(t.slice(-o['!'].length) === o['!']){ r = true } else { return false }}
				if(Type.obj.has(o,'+')){
					if(Type.list.map(Type.list.is(o['+'])? o['+'] : [o['+']], function(m){
						if(t.indexOf(m) >= 0){ r = true } else { return true }
					})){ return false }
				}
				if(Type.obj.has(o,'-')){
					if(Type.list.map(Type.list.is(o['-'])? o['-'] : [o['-']], function(m){
						if(t.indexOf(m) < 0){ r = true } else { return true }
					})){ return false }
				}
				if(Type.obj.has(o,'>')){ if(t > o['>']){ r = true } else { return false }}
				if(Type.obj.has(o,'<')){ if(t < o['<']){ r = true } else { return false }}
				function fuzzy(t,f){ var n = -1, i = 0, c; for(;c = f[i++];){ if(!~(n = t.indexOf(c, n+1))){ return false }} return true } // via http://stackoverflow.com/questions/9206013/javascript-fuzzy-search
				if(Type.obj.has(o,'?')){ if(fuzzy(t, o['?'])){ r = true } else { return false }} // change name!
				return r;
			}
			Type.list = {is: function(l){ return (l instanceof Array) }}
			Type.list.slit = Array.prototype.slice;
			Type.list.sort = function(k){ // creates a new sort function based off some field
				return function(A,B){
					if(!A || !B){ return 0 } A = A[k]; B = B[k];
					if(A < B){ return -1 }else if(A > B){ return 1 }
					else { return 0 }
				}
			}
			Type.list.map = function(l, c, _){ return Type.obj.map(l, c, _) }
			Type.list.index = 1; // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
			Type.obj = {is: function(o){ return o? (o instanceof Object && o.constructor === Object) || Object.prototype.toString.call(o).match(/^\[object (\w+)\]$/)[1] === 'Object' : false }}
			Type.obj.put = function(o, f, v){ return (o||{})[f] = v, o } 
			Type.obj.has = function(o, t){ return o && Object.prototype.hasOwnProperty.call(o, t) }
			Type.obj.del = function(o, k){
				if(!o){ return }
				o[k] = null;
				delete o[k];
				return o;
			}
			Type.obj.as = function(o, f, v){ return o[f] = o[f] || (arguments.length >= 3? v : {}) }
			Type.obj.ify = function(o){
				if(Type.obj.is(o)){ return o }
				try{o = JSON.parse(o);
				}catch(e){o={}};
				return o;
			}
			;(function(){ var u;
				function map(v,f){
					if(obj_has(this,f) && u !== this[f]){ return }
					this[f] = v;
				}
				Type.obj.to = function(from, to){
					to = to || {};
					obj_map(from, map, to);
					return to;
				}
			}());
			Type.obj.copy = function(o){ // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
				return !o? o : JSON.parse(JSON.stringify(o)); // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
			}
			;(function(){
				function empty(v,i){ n = this.n;
					if(n && (i === n || (Type.obj.is(n) && Type.obj.has(n, i)))){ return }
					if(i){ return true }
				}
				Type.obj.empty = function(o, n){
					if(!o){ return true }
					return Type.obj.map(o,empty,{n:n})? false : true;
				}
			}());
			;(function(){
				function t(k,v){
					if(2 === arguments.length){
						t.r = t.r || {};
						t.r[k] = v;
						return;
					} t.r = t.r || [];
					t.r.push(k);
				};
				Type.obj.map = function(l, c, _){
					var u, i = 0, x, r, ll, lle, f = Type.fns.is(c);
					t.r = null;
					if(Object.keys && Type.obj.is(l)){
						ll = Object.keys(l); lle = true;
					}
					if(Type.list.is(l) || ll){
						x = (ll || l).length;
						for(;i < x; i++){
							var ii = (i + Type.list.index);
							if(f){
								r = lle? c.call(_ || this, l[ll[i]], ll[i], t) : c.call(_ || this, l[i], ii, t);
								if(r !== u){ return r }
							} else {
								//if(Type.test.is(c,l[i])){ return ii } // should implement deep equality testing!
								if(c === l[lle? ll[i] : i]){ return ll? ll[i] : ii } // use this for now
							}
						}
					} else {
						for(i in l){
							if(f){
								if(Type.obj.has(l,i)){
									r = _? c.call(_, l[i], i, t) : c(l[i], i, t);
									if(r !== u){ return r }
								}
							} else {
								//if(a.test.is(c,l[i])){ return i } // should implement deep equality testing!
								if(c === l[i]){ return i } // use this for now
							}
						}
					}
					return f? t.r : Type.list.index? 0 : -1;
				}
			}());
			Type.time = {};
			Type.time.is = function(t){ return t? t instanceof Date : (+new Date().getTime()) }
		}(Util));
		;(function(exports, add, emit){ // On event emitter generic javascript utility.
			function Act(tag, fn, at, on, ctx){
				this.tag = tag;
				this.fn = fn;
				this.at = at;
				this.on = on;
				this.ctx = ctx;
			}
			Act.chain = Act.prototype;
			Act.chain.stun = function(){
				if(!this.tmp){ return }
				if(!arguments.length){
					return this.tmp.halt = true;
				}
				var act = this, on = act.on, halt = {
					resume: function(arg){
						act.ctx.on(act.tag, (arguments.length?
							1 === arguments.length? arg : Array.prototype.slice.call(arguments)
						: halt.arg), halt.end, halt.as, act);
					}, arg: on.arg,
					end: on.end,
					as: on.as
				};
				act.tmp.halt = 1;
				return halt.resume;
			}
			Act.chain.off = function(){
				this.fn = noop;
			}
			function noop(){};
			function Event(tag, arg, at, as, skip){
				var ctx = this, ons = ctx.ons || (ctx.ons = {}), on = ons[tag] || (ons[tag] = {s: []}), act, mem;
				if(arg instanceof Function){
					on.s.push(act = new Act(tag, arg, at, on, ctx));
					if(add){ add(tag, act, on, ctx) }
					return;
				}
				if(emit){ emit(tag, arg, on, ctx) }
				on.arg = arg;
				on.end = at;
				on.as = as;
				var i = 0, acts = on.s, l = acts.length, arr = (arg instanceof Array), gap, off, act;
				for(; i < l; i++){ act = acts[i];
					if(skip){
						if(skip === act){
							skip = false;
						}
						continue;
					}
					var tmp = act.tmp = {};
					if(!arr){
						act.fn.call(act.at, arg, act);
					} else {
						act.fn.apply(act.at, arg.concat(act));
					}
					if(noop === act.fn){
						off = true;
					}
					if(tmp.halt){
						if(1 === tmp.halt){
							gap = true;
						}
						break;
					}
				}
				if(off){
					var still = [];
					for(i = 0; i < l; i++){ act = acts[i];
						if(noop !== act.fn){
							still.push(act);
						}
					}
					on.s = still;
					// TODO: PERF! MEMORY! If still.length === 0, delete event.
				}
				if(!gap && at && at instanceof Function){
					at.call(as, arg);
				}
				return;
			}
			exports.on = Event;
		}(Util, function(tag, act, on, ctx){ // Gun specific extensions
			var mem = on.mem, at;
			if(mem){
				if(mem instanceof Array){
					act.fn.apply(act.at, mem.concat(act));
				} else {
					act.fn.call(act.at, mem, act);
				}
				return;
			}
			at = act.at? act.at.gun? act.at : ctx : ctx;
			//if(obj_empty(at.lex)){ return }
			if(!at.lex || !at.lex.soul){ return } // TODO: What about lex cursors?
			Gun.get(at);
		}, function(tag, arg, on, at){
			on.mem = arg;
		}));
		;(function(exports){ // Generic javascript scheduler utility.
			function s(state, cb, time){ // maybe use lru-cache?
				s.time = time || Gun.time.is;
				s.waiting.push({when: state, event: cb || function(){}});
				if(s.soonest < state){ return }
				s.set(state);
			}
			s.waiting = [];
			s.soonest = Infinity;
			s.sort = exports.list.sort('when');
			s.set = function(future){
				if(Infinity <= (s.soonest = future)){ return }
				var now = s.time();
				future = (future <= now)? 0 : (future - now);
				clearTimeout(s.id);
				s.id = setTimeout(s.check, future);
			}
			s.each = function(wait, i, map){
				var ctx = this;
				if(!wait){ return }
				if(wait.when <= ctx.now){
					if(exports.fns.is(wait.event)){
						setTimeout(function(){ wait.event() },0);
					}
				} else {
					soonest = (soonest < wait.when)? soonest : wait.when;
					map(wait);
				}
			}
			s.check = function(){
				var now = s.time(), soonest = Infinity;
				s.waiting.sort(s.sort);
				s.waiting = exports.list.map(s.waiting, s.each, {now: now}) || [];
				s.set(soonest);
			}
			exports.schedule = s;
		}(Util));
	}(Gun));
	var fn_is = Gun.fn.is, bi_is = Gun.bi.is, num_is = Gun.num.is, text_is = Gun.text.is, text_ify = Gun.text.ify, text_random = Gun.text.random, text_match = Gun.text.match, list_is = Gun.list.is, list_slit = Gun.list.slit, list_sort = Gun.list.sort, list_map = Gun.list.map, obj_is = Gun.obj.is, obj_put = Gun.obj.put, obj_del = Gun.obj.del, obj_ify = Gun.obj.ify, obj_copy = Gun.obj.copy, obj_empty = Gun.obj.empty, obj_as = Gun.obj.as, obj_has = Gun.obj.has, obj_map = Gun.obj.map;
	;(function(Gun){ // Gun specific utilities.
		
		Gun.version = 0.4;
		Gun.version_minor = 0;
		
		Gun._ = { // some reserved key words, these are not the only ones.
			meta: '_' // all metadata of the node is stored in the meta property on the node.
			,soul: '#' // a soul is a UUID of a node but it always points to the "latest" data known.
			,field: '.' // a field is a property on a node which points to a value.
			,state: '>' // other than the soul, we store HAM metadata.
			,value: '=' // the primitive value.
		}
		Gun.__ = {
			'_':'meta'
			,'#':'soul'
			,'.':'field'
			,'=':'value'
			,'>':'state'
		}
		
		Gun.is = function(gun){ return (gun instanceof Gun) } // check to see if it is a GUN instance.
		
		Gun.is.val = function(v){ // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
			var u;
			if(v === u){ return false }
			if(v === null){ return true } // "deletes", nulling out fields.
			if(v === Infinity){ return false } // we want this to be, but JSON does not support it, sad face.
			if(Gun.bi.is(v) // by "binary" we mean boolean.
			|| Gun.num.is(v)
			|| Gun.text.is(v)){ // by "text" we mean strings.
				return true; // simple values are valid.
			}
			return Gun.is.rel(v) || false; // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
		}

		Gun.is.opt = function(opt,o){
			opt = opt || {};
			Gun.obj.map(o, function(v,f){
				if(Gun.list.is(opt[f])){
					opt[f] = Gun.obj.map(opt[f], function(v,f,t){t(v,{sort: f})}); // TODO: PERF! CACHE!
				}
				if(Gun.list.is(v)){
					v = Gun.obj.map(v, function(v,f,t){t(v,{sort: f})}); // TODO: PERF! CACHE!
				}
				if(Gun.obj.is(v)){
					Gun.is.opt(opt[f] = opt[f] || {}, v); // TODO: This winds up merging peers option, not overwriting!
				} else 
				if(!Gun.obj.has(opt,f)){
					opt[f] = v;
				}
			});
			return opt;
		}

		Gun.is.lex = function(lex){ var o = {}; // Validates a lex, and if it is returns a friendly lex.
			if(!Gun.obj.is(lex)){ return false }
			Gun.obj.map(lex, function(v,f){ // TODO: PERF! CACHE!
				if(!(Gun._[f] || Gun.__[f]) || !(Gun.text.is(v) || Gun.obj.is(v))){ return o = false }
				o[Gun._[f]? f : Gun.__[f]] = v;
			}); // TODO: What if the lex cursor has a document on the match, that shouldn't be allowed!
			return o;
		}

		Gun.is.lex.ify = function(lex){ var o = {}; // Turns a friendly lex into a spec lex.
			lex = lex || {};
			Gun.list.map(Gun._, function(v, f){ // TODO: PERF! CACHE!
				if(!(Gun.obj.has(lex, v) || Gun.obj.has(lex, f))){ return }
				o[v] = lex[v] || lex[f];
			});
			return o;
		}
		
		;(function(){
			function map(s, f){ var o = this; // map over the object...
				if(o.id){ return o.id = false } // if ID is already defined AND we're still looping through the object, it is considered invalid.
				if(f == _soul && text_is(s)){ // the field should be '#' and have a text value.
					o.id = s; // we found the soul!
				} else {
					return o.id = false; // if there exists anything else on the object that isn't the soul, then it is considered invalid.
				}
			}
			Gun.is.rel = function(v){ // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
				if(v && !v[_meta] && obj_is(v)){ // must be an object.
					var o = {};
					obj_map(v, map, o);
					if(o.id){ // a valid id was found.
						return o.id; // yay! Return it.
					}
				}
				return false; // the value was not a valid soul relation.
			}
		}());

		Gun.is.rel.ify = function(s){ var r = {}; return obj_put(r, _soul, s), r } // convert a soul into a relation and return it.
		
		;(function(){
			Gun.is.node = function(n, cb, o){ var s; // checks to see if an object is a valid node.
				if(!obj_is(n)){ return false } // must be an object.
				if(s = is_node_soul(n)){ // must have a soul on it.
					return !obj_map(n, map, {o:o,n:n,cb:cb});
				}
				return false; // nope! This was not a valid node.
			}
			function map(v, f){ // we invert this because the way we check for this is via a negation.
				if(f === _meta){ return } // skip over the metadata.
				if(!is_val(v)){ return true } // it is true that this is an invalid node.
				if(this.cb){ this.cb.call(this.o, v, f, this.n) } // optionally callback each field/value.
			}
		}());

		Gun.is.node.copy = function(g, s){
			var __ = g.__, copy = __.copy || (__.copy = {}), cache = copy[s];
			if(cache){ return cache }
			if(cache = __.graph[s]){ return copy[s] = obj_copy(cache) }
		}

		;(function(){
			function map(v, f){ // iterate over each field/value.
				if(_meta === f){ return } // ignore meta.
				is_node_state_ify(this.n, {field: f, value: v, state: this.o.state = this.o.state || Gun.time.is()}); // and set the state for this field and value on this node.
			}
			Gun.is.node.ify = function(n, o){ // convert a shallow object into a node.
				o = (typeof o === 'string')? {soul: o} : o || {};
				n = is_node_soul_ify(n, o); // put a soul on it.
				obj_map(n, map, {n:n,o:o});
				return n; // This will only be a valid node if the object wasn't already deep!
			}
		}());
		
		Gun.is.node.soul = function(n, o){ return (n && n._ && n._[o || _soul]) || false } // convenience function to check to see if there is a soul on a node and return it.

		Gun.is.node.soul.ify = function(n, o){ // put a soul on an object.
			o = (typeof o === 'string')? {soul: o} : o || {};
			n = n || {}; // make sure it exists.
			n._ = n._ || {}; // make sure meta exists.
			n._[_soul] = o.soul || n._[_soul] || text_random(); // put the soul on it.
			return n;
		}

		Gun.is.node.state = function(n, o){ return (o && n && n._ && n._[Gun._.state] && Gun.num.is(n._[Gun._.state][o]))? n._[Gun._.state][o] : -Infinity } // convenience function to get the state on a field on a node and return it.

		Gun.is.node.state.ify = function(n, o){ var s; // put a field's state and value on some nodes.
			o = (typeof o === 'string')? {field: o} : o || {};
			n = n || {}; // make sure it exists.
			obj_as(n, _meta);
			if(is_val(o.value)){ n[o.field] = o.value } // if we have a value, then put it.
			s = obj_as(n._, _state);
			if(num_is(o.state)){ s[o.field] = o.state }
			return n;
		}
		;(function(){
			Gun.is.graph = function(g, cb, fn, o){ // checks to see if an object is a valid graph.
				if(!obj_is(g) || obj_empty(g)){ return false } // must be an object.
				return !obj_map(g, map, {fn:fn,cb:cb,o:o}); // makes sure it wasn't an empty object.
			}
			function nf(fn){ // optional callback for each node.
				if(fn){ is_node(nf.n, fn, nf.o) } // where we then have an optional callback for each field/value.
			}
			function map(n, s){ // we invert this because the way we check for this is via a negation.
				if(!n || s !== is_node_soul(n) || !is_node(n, this.fn)){ return true } // it is true that this is an invalid graph.
				if(!fn_is(this.cb)){ return }	
				nf.n = n; nf.o = this.o;	 
				this.cb.call(nf.o, n, s, nf);
			}
		}());
		
		Gun.is.graph.ify = function(n){ var s; // wrap a node into a graph.
			if(s = Gun.is.node.soul(n)){ // grab the soul from the node, if it is a node.
				return Gun.obj.put({}, s, n); // then create and return a graph which has a node on the matching soul property.
			}
		}

		Gun.HAM = function(machineState, incomingState, currentState, incomingValue, currentValue){
			if(machineState < incomingState){
				return {defer: true}; // the incoming value is outside the boundary of the machine's state, it must be reprocessed in another state.
			}
			if(incomingState < currentState){
				return {historical: true}; // the incoming value is within the boundary of the machine's state, but not within the range.
				
			}
			if(currentState < incomingState){
				return {converge: true, incoming: true}; // the incoming value is within both the boundary and the range of the machine's state.
				
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

		;(function(){
			function meta(v,f){
				if(obj_has(Gun.__, f)){ return }
				obj_put(this._, f, v);
			}
			function map(value, field){
				var node = this.node, vertex = this.vertex, machine = this.machine; //opt = this.opt;
				var is = is_node_state(node, field), cs = is_node_state(vertex, field), iv = is_rel(value) || value, cv = is_rel(vertex[field]) || vertex[field];
				var HAM = Gun.HAM(machine, is, cs, iv, cv);
				if(HAM.err){
					root.console.log(".!HYPOTHETICAL AMNESIA MACHINE ERR!.", HAM.err); // this error should never happen.
					return;
				}
				if(HAM.state || HAM.historical || HAM.current){ // TODO: BUG! Not implemented.
					//opt.lower(vertex, {field: field, value: value, state: is});
					return;
				}
				if(HAM.incoming){
					is_node_state_ify(vertex, {field: field, value: value, state: is});
					return;
				}
				if(HAM.defer){ // TODO: BUG! Not implemented.
					/*upper.wait = true;
					opt.upper.call(state, vertex, field, incoming, ctx.incoming.state); // signals that there are still future modifications.
					Gun.schedule(ctx.incoming.state, function(){
						update(incoming, field);
						if(ctx.incoming.state === upper.max){ (upper.last || function(){})() }
					}, gun.__.opt.state);*/
				}
			}
			Gun.HAM.node = function(gun, node, opt){
				if(!node){ return }
				opt = num_is(opt)? {state: opt} : opt || {};
				if(gun instanceof Gun){
					var soul = is_node_soul(node);
					if(!soul){ return }
					var vertex = gun.__.graph[soul];
					if(vertex === node){ return vertex }
					vertex = gun.__.graph[soul] = vertex || is_node_ify({}, soul);
					var machine = opt.state || gun.__.opt.state();
				} else {
					var soul = is_node_soul(gun);
					if(!soul){ return }
					var vertex = gun;
					if(vertex === node){ return vertex }
					var machine = opt.state;
				}
				obj_map(node._, meta, vertex);
				if(!is_node(node, map, {node:node,vertex:vertex,machine:machine,opt:opt})){ return }
				return vertex;
			}
		}());

		;(function(){
			Gun.HAM.graph = function(gun, graph){ var g = {};
				if(!Gun.is.graph(graph, map, {g:g,gun:gun})){ return }
				return g;
			}
			function map(node, soul){
				this.g[soul] = Gun.HAM.node(this.gun, node);
			}
		}());

		;(function(){
			Gun.put = function(gun, graph, cb, opt){
				var at;
				if(gun instanceof Gun){
					at = {
						gun: gun,
						graph: graph,
						cb: cb,
						opt: Gun.is.opt(opt || {}, gun.__.opt)
					}
				} else {
					at = gun;
					at.opt = at.opt || {};
					at.ack = at.cb;
					at.cb = put;
				}
				Gun.on('put', at);
				if(2 >= Gun.ons.put.s.length){ // TODO: Try not to hardcode the default driver count?
					if(!Gun.log.count('no-wire-put')){ 
						Gun.log("Warning! You have no storage or persistence!");
					}
					at.cb(null);
				}
				return at.gun;
			}
			function put(err, ok){
				if(err){ Gun.log(err) }
				var at = this, cat = Gun.obj.to(at, {err: err, ok: ok});
				Gun.on('ack', cat);
				at.ack(cat.err, cat.ok, cat);
			}
			Gun.on('put', function(at, ev){
				if(is_graph(at.graph)){ return }
				at.cb({err: "Invalid graph!"});
				ev.stun();
			});
		}());

		;(function(){
			Gun.on('put', function(at, ev){
				is_graph(at.graph, map, null, at);
			});
			function map(node, soul){
				Gun.get.got.call(this.gun.__.gun.get(soul)._, null, node);
			}
		}());

		;(function(){
			Gun.get = function(at, lex, cb, opt){
				if(at.lex){
					at.cb = got;
				} else {
					var gun = at;
					at = {
						gun: gun,
						lex: Gun.is.lex(lex || {}),
						opt: Gun.is.opt(opt || {}, gun.__.opt),
						cb: got,
						stream: cb
					}
				}
				Gun.on('get', at); // TODO: What is the cleanest way to reply if there is no responses, without assuming drivers do reply or not?
				return at.gun;
			}
			Gun.get.got = got;
			function got(err, node){
				if(err){ Gun.log(err) }
				Gun.on('stream', Gun.obj.to(this, {err: err, node: node}), stream);
			}
			function stream(at){
				if(!at.stream){ console.log("WARNING! No at.get", at); }
				at.stream(at.err, at.node);
			}
		}());

		Gun.on('get', function(at, ev){ // TODO: BUG! What if field isn't in memory? Then we need to still pass the lex out to the peers.
			var opt = at.opt;
			if(opt.force){ return }
			var lex = at.lex, gun = at.gun, graph = gun.__.graph, node = graph[lex.soul];
			if(opt.memory || node){ return at.cb(null, node), ev.stun() }
		});

		Gun.on('stream', function(at, ev){ var node;
			if(!(node = at.node)){ return }
			at.node = obj_copy(HAM_node(at.gun, node));
			//at.node = obj_copy(Gun.HAM.node(gun, at.node)); // TODO: Cache the copied ones! So you don't have to recopy every time.
			if(!at.node){
				at.err = at.err || {err: "Invalid node!"};
				ev.stun();
			}
		});

		Gun.on('stream', function(at){ var node;
			if(!(node = at.node)){ return }
			var __ = at.gun.__, get = __.get, soul = is_node_soul(node);
			if(get && get[soul] && !get[soul]._.node){
				get[soul]._.node = __.graph[soul];
			}
		});

		Gun.on('stream', function(at){
			var lex = at.lex, soul = lex.soul, field = lex.field;
			var gun = at.gun, graph = gun.__.graph, node = graph[soul], u;
			if(soul){
				if(soul !== is_node_soul(at.node)){
					at.node = obj_copy(node);
				}
				if(is_node_soul(at.node, 'key')){
					return;
				}
			}
			if(at.node && field){ // TODO: Multiples?
				var ignore = obj_put({}, _meta, 1);
				if(!obj_empty(at.node, obj_put(ignore, field, 1))){
					at.node = Gun.is.node.ify(obj_put({}, field, at.node[field]), {soul: soul, state: Gun.is.node.state(at.node, field)})
				}
			}
		});

		Gun.ify = (function(){
			function noop(){};
			function nodeop(env, cb){ cb(env, env.at) }
			function ify(data, cb, opt, scope){
				cb = cb || noop;
				opt = opt || {};
				opt.uuid = opt.uuid || text_random;
				opt.state = opt.state || Gun.time.is();
				opt.value = opt.value || noop;
				opt.node = opt.node || nodeop;
				var ctx = {at: {path: [], obj: data}, root: {}, graph: {}, queue: [], seen: [], opt: opt, loop: true, end: cb, scope: scope};
				if(!data){ return ctx.err = 'Serializer does not have correct parameters.', cb(ctx.err, ctx, scope) }
				ctx.at.node = ctx.root;
				loop(ctx, opt);
				unique(ctx);
			}
			function recurse(ctx, opt){

			}
			function loop(ctx, opt){
				while(ctx.loop && !ctx.err){
					seen(ctx, ctx.at);
					normalize(ctx, opt);
					if(ctx.queue.length){
						ctx.at = ctx.queue.shift();
					} else {
						ctx.loop = false;
					}
				}
			}
			function normnode(ctx, at, soul){
				var opt = ctx.opt;
				at.soul = at.soul || soul || Gun.is.node.soul(at.obj) || Gun.is.node.soul(at.node) || opt.uuid();
				if(!opt.pure){ ctx.graph[at.soul] = Gun.is.node.soul.ify(at.node, at.soul) }
				var arr = at.back||[], i = arr.length, rel;
				while(i--){ rel = arr[i];
					rel[_soul] = at.soul;
				}
				unique(ctx);
			}
			function meta(v,f){ var ctx = this;
				obj_put(ctx.at.node[ctx.at.field], f, obj_copy(v));
			}
			function map(val, field){
				var ctx = this, opt = ctx.opt;
				field = ctx.at.field = String(field);
				ctx.at.value = val;
				if(_meta == field){
					obj_as(ctx.at.node, _meta);
					obj_map(val, meta, ctx);
					return;
				}
				//Gun.obj.has(Gun.__, field) ||
				if(field.indexOf('.') != -1 || obj_has(reserved, field)){
					return ctx.err = "Invalid field name on '" + ctx.at.path.join('.') + "'!";
				}
				if(Gun.is.val(val)){
					ctx.at.node[field] = obj_copy(val);
					opt.value(ctx);
					return;
				}
				var at = {obj: val, node: {}, back: [], path: [field]}, was;
				at.path = (ctx.at.path||[]).concat(at.path || []);
				if(!obj_is(val)){
					return ctx.err = "Invalid value at '" + at.path.join('.') + "'!";
				}
				if(was = seen(ctx, at)){
					(was.back = was.back || []).push(ctx.at.node[field] = Gun.is.rel.ify(Gun.is.node.soul(was.node) || null));
				} else {
					ctx.queue.push(at);
					at.back.push(ctx.at.node[field] = Gun.is.rel.ify(null));
				}
				opt.value(ctx);
			}
			function normalize(ctx, opt){
				opt.node(ctx, normnode);
				obj_map(ctx.at.obj, map, ctx);
			}
			function seen(ctx, at){
				var arr = ctx.seen, i = arr.length, has;
				while(i--){ has = arr[i];
					if(at.obj === has.obj){ return has }
				}
				ctx.seen.push(at);
			}
			function unique(ctx){
				if(ctx.err){ return ctx.end(ctx.err, ctx, ctx.scope), ctx.end = noop }
				if(ctx.loop){ return true }
				var arr = ctx.seen, i = arr.length, at;
				while(i--){ at = arr[i];
					if(!at.soul){ return true }
				}
				ctx.end(ctx.err, ctx, ctx.scope);
				ctx.end = noop;
			}
			var reserved = list_map([Gun._.meta, Gun._.soul, Gun._.field, Gun._.value, Gun._.state], function(v,i,t){
				t(v,1);
			});
			return ify;
		}());
	}(Gun));
	var _soul = Gun._.soul, _field = Gun._.field, _meta = Gun._.meta, _state = Gun._.state;
	var is_val = Gun.is.val, is_rel = Gun.is.rel, is_rel_ify = is_rel.ify, is_node = Gun.is.node, is_node_soul = is_node.soul, is_node_soul_ify = is_node_soul.ify, is_node_ify = is_node.ify, is_node_copy = is_node.copy, is_node_state = is_node.state, is_node_state_ify = is_node_state.ify, HAM_node = Gun.HAM.node, is_graph = Gun.is.graph;

	Gun.chain = Gun.prototype;

	;(function(chain){

		Gun.chain.opt = function(opt, stun){
			opt = opt || {};
			var gun = this, at = gun.__;
			if(!at){
				at = gun.__ = gun._;
				at.graph = {};
			}
			at.opt.uuid = opt.uuid || Gun.text.random;
			at.opt.state = opt.state || Gun.time.is;
			if(text_is(opt)){ opt = {peers: opt} }
			if(list_is(opt)){ opt = {peers: opt} }
			if(text_is(opt.peers)){ opt.peers = [opt.peers] }
			if(list_is(opt.peers)){ opt.peers = obj_map(opt.peers, function(n,f,m){m(n,{})}) }
			at.opt.peers = opt.peers || at.opt.peers || {};
			Gun.obj.map(['key', 'path', 'map', 'not', 'init'], function(f){
				if(!opt[f]){ return }
				at.opt[f] = opt[f] || at.opt[f];
			});
			if(!stun){ Gun.on('opt', {gun: gun, opt: opt}) }
			return gun;
		}

		Gun.chain.chain = function(cb){
			var back = this, gun = new this.constructor(back);
			gun.back = back;
			gun.__ = back.__;
			return gun;
		}

		;(function(){
			Gun.chain.put = function(data, cb, opt){
				var back = this, gun, at, put, opts = back.__.opt;
				opt = opt || {};
				if(back.back){
					gun = back;
				} else {
					// TODO: API CHANGE!!! NO implicit set here!
					gun = back.get(is_node_soul(data) || (opt.uuid || opts.uuid)());
				}
				at = Gun.obj.to(gun._, {put: put = {opt: opt}});
				put.any = cb;
				put.data = data;
				put.state = (opt.state || opts.state)();
				at.on('chain', link, at); // TODO: ONE?
				return gun;
			};
			function link(cat, ev){ ev.off(); // TODO: BUG!
				var at = this, put = at.put, data, cb;
				if(cat.err){ return }
				if(!cat.node && (put.opt.init || cat.gun.__.opt.init)){ return }
				// TODO: BUG! `at` doesn't have correct backwards data!
				if(!(data = wrap(at, put.data))){ // TODO: PERF! Wrap could create a graph version, rather than a document verison that THEN has to get flattened.
					if((cb = put.any) && cb instanceof Function){
						cb.call(at.gun, {err: Gun.log("No node exists to put " + (typeof at.put.data) + ' "' + at.put.data + '" in!')});
					}
					return;
				}
				/*if(ev){
					console.log("!!!!!!!!!!!", ev);
					put.resume = ev.stun(put.resume);
				}*/
				Gun.ify(data, end, {
					node: function(env, cb){ var eat = env.at;
						if(1 === eat.path.length && cat.node){
							eat.soul = is_rel(cat.node[eat.path[0]]);
						}
						cb(env, eat);
					}, value: function(env){ var eat = env.at;
						if(!eat.field){ return }
						is_node_state_ify(eat.node, {field: eat.field, state: put.state});
					}, uuid: at.gun.__.opt.uuid, state: put.state
				}, at);
			}
			function wrap(cat, data){
				if(!cat){ return data }
				if(cat.lex.field){
					data = obj_put({}, cat.lex.field, data);
				} else 
				if(!obj_is(data)){ return }
				data = is_node_soul_ify(data, cat.lex.soul);
				if(cat.lex.soul){ return data }
				if(cat !== cat.back){
					return wrap(cat.back, data);
				}
				return data;
			}	
			function end(err, env, at){ var cb;
				if(err){
					if((cb = at.put.any) && cb instanceof Function){
						cb.call(at.gun, {err: Gun.log(err)});
					}
					return; // TODO: BUG! Chain emit??
				}
				Gun.on('normalize', Gun.obj.to(at, {err: err, env: env, graph: env.graph}), wire);
			}
			function wire(at){
				//at.cache = env.root;
				Gun.put(Gun.obj.to(at, {cb: ack}));
			}
			function ack(err, ok){ var at = this, cb;
				if((cb = at.put.any) && cb instanceof Function){
					cb.call(at.gun, err, ok);
				}
				if(at.put.resume){ at.put.resume() }
				if(at.gun.back.back){ return }
				//at.on('chain', at);
			}
		}());
		;(function(){
			Gun.chain.get = function(lex, cb, opt){
				if(!opt || !opt.path){ var back = this.__.gun; } // TODO: CHANGING API! Remove this line!
				var gun, back = back || this;
				var get = back._.get || (back._.get = {}), tmp;
				if(typeof lex === 'string'){
					if(!(gun = get[lex])){
						gun = cache(get, lex, back);
						if((tmp = gun._.lex).field){
							if(!back._.ons.chain || !back._.ons.chain.s.length){ // TODO: CLEAN UP! // TODO: ONE?
								back._.on('chain', link, gun._);
							}
							back._.on('field:' + tmp.field, field, gun._); // TODO: ONE?
						}
					}
				} else
				if(!lex && 0 != lex){ // TODO: BUG!?
					(gun = back.chain())._.err = {err: Gun.log('Invalid get request!', lex)};
					if(cb){ cb.call(gun, gun._.err) }
					return gun;
				} else
				if(num_is(lex)){
					return back.get(''+lex, cb, opt);
				} else
				if(tmp = lex.soul){
					if(lex.field){
						gun = back.chain();
						gun._.stream = cb;
						gun._.lex = lex;
						Gun.get(gun._);
						return gun;
					}
					if(!(gun = get[tmp])){
						gun = cache(get, tmp, back);
					}
				} else
				if(tmp = lex[_soul]){
					if(lex[_field]){
						return back.get({soul: tmp, field: lex[_field]}, cb, opt);
					}
					if(!(gun = get[tmp])){
						gun = cache(get, tmp, back);
					}
				}
				if(cb && cb instanceof Function){
					gun._.on('any', pop(cb), gun); // TODO: Perf! Batch! // TODO: API CHANGE? Having to use pop is annoying. Should we support NodeJS style callbacks anymore?
				}
				return gun;
			}
			function cache(get, key, back){
				var gun = get[key] = back.chain(), at = gun._;
				at.stream = stream;
				if(!back.back){
					at.lex.soul = key;
				} else {
					var lex = at.lex, flex = back._.lex;
					lex.field = key;
					if(!flex.field && flex.soul){
						lex.soul = flex.soul;
					}
				}
				return gun;
			}
			function stream(err, node){
				Gun.on('chain', this, link, this);
			}
			function link(cat, ev){ var at = this, u; // TODO: What if this was a Gun.on('chain')?
				var err = cat.err, node = cat.node, cex = cat.lex, lex = at.lex, field = lex.field, rel, val;
				if(lex !== cex && lex.field && cex.field){
					if(obj_has(node, cex.field) && (rel = is_rel(val = node[cex.field]))){
						return Gun.get(Gun.obj.to(at, {lex: {soul: rel, field: lex.field}}));
					}
				}
				at.on('any', [err, (field && node)? node[field] : node, field, cat]); // TODO: Revisit!
				if(err){ at.on('err', err) }
				if(node){ at.on('ok', [(field && node)? node[field] : node, field, cat]) } // TODO: Revisit!
				is_node(node, map, {cat: cat, at: at});
				at.on('chain', cat);
			}
			function map(val, field){
				this.cat.on('field:' + field, this.cat);
			}
			function field(cat, ev){ var at = this;
				at.on('chain', Gun.obj.to(at, {err: cat.err, node: cat.node}));
			}
		}());
		;(function(){
			Gun.chain.key = function(key, cb, opt){
				if(!key){
					if(cb){
						cb.call(this, {err: Gun.log('No key!')});
					}
					return this;
				}
				var gun = this, at = Gun.obj.to(gun._, {key: key, any: cb || function(){}, opt: opt });
				gun.on('chain', index, at); // TODO: ONE?
				return gun;
			}	
			function index(cat, ev){ ev.off(); // TODO: BUG!
				var at = this, cex = cat.lex, lex = at.lex;
				//if(cex.soul === lex.soul){ return }
				if(cex.soul === at.key){ return }
				at.obj = (1 === is_node_soul(cat.node, 'key'))? obj_copy(cat.node) : obj_put({}, lex.soul, is_rel_ify(lex.soul));
				obj_as((at.put = is_node_ify(at.obj, at.key, true))._, 'key', 1);
				at.gun.__.gun.put(at.put, at.any, {key: true, init: false});
			}
			Gun.on('chain', function(cat, e){
				if(!is_node_soul(cat.node, 'key')){ return }
				var resume = e.stun(1), node = cat.node, pseudo = cat.gun._.pseudo || (cat.gun._.pseudo = cat.gun._.node = is_node_ify({}, is_node_soul(node)));
				pseudo._.key = 'pseudo';
				cat.seen = cat.seen || {}; // TODO: There is a better way.
				is_node(node, function(n, f){ // TODO: PERF! BAD! Filter out items we've already seen.
					if(cat.seen[f]){ return } cat.seen[f] = true; // TODO: There is a better way.
					cat.gun.get(Gun.obj.to(cat.lex, {soul: f}), on);
					function on(err, node){
						if(!node){ return }
						HAM_node(pseudo, node);
						cat.node = pseudo;
						resume();
					}
				});
			});
			Gun.on('normalize', function(cat){
				var at = cat, env = at.env;
				if(at.put.opt.key){ return }
				is_graph(env.graph, function(node, soul){
					var key = {node: at.gun.__.graph[soul]}, tmp;
					if(!is_node_soul(key.node, 'key')){ return }
					//if(!gun.__.by(soul).end){ gun.__.by(soul).end = 1 }
					is_node(key.node, function each(rel, s){
						var n = at.gun.__.graph[s]; // TODO: BUG! Should we actually load the item or only use what is in memory?
						if(n && is_node_soul(n, 'key')){
							is_node(n, each);
							return;
						}
						rel = env.graph[s] = env.graph[s] || is_node_soul_ify({}, s);
						is_node(node, function(v,f){
							is_node_state_ify(rel, {field: f, value: v, state: is_node_state(node, f) });
						});
						Gun.obj.del(env.graph, soul);
					});
				});
			});
		}());
		Gun.chain.path = function(field, cb, opt){
			var back = this, gun = back, tmp;
			if(typeof field === 'string'){
				tmp = field.split((opt && opt.split) || '.');
				if(1 === tmp.length){
					return back.get(field, cb, opt || {path: true});
				}
				field = tmp;
			}
			if(field instanceof Array){
				if(field.length > 1){
					(gun = back.path(field.slice(1), cb, opt)).back = back;
				} else {
					gun = back.get(field[0], cb, opt || {path: true});
				}
				return gun;
			}
			if(!field && 0 != field){
				field = '';
			}
			return this.get(''+field, cb, opt || {path: true});
		}
		;(function(){
			Gun.chain.on = function(cb, opt, t){
				var gun = this, at = gun._;
				if(typeof cb === 'string'){ return at.on(cb, opt, t) }
				if(cb && cb instanceof Function){
					at.on('ok', pop(cb), gun);
				}
				return gun;
			}
		}());
		;(function(){
			Gun.chain.val = function(cb, opt, t){
				var gun = this, at = gun._;
				if(at.val || null === at.val){
					cb.call(gun, at.val, at.lex.field);
					return gun;
				}
				if(at.vals){
					return gun;
				}
				if(cb){
					at.on('ok', pop(cb, {off: true, at: at}), gun); // TODO: ONE?
				}
				return gun;
			}
		}());

		function pop(cb, opt){ // TODO: CLEAN UP! This is an ugly piece of junk.
			return function(a, b, c, d, e){
				var t = this, arg = [a,b,c,d,e], f;
				if(c && Gun.is(c.gun)){
					f = true; arg = [null, a,b,c,d]; // IE6 says it can unshift, but it can't. :(
				}
				if((rel = is_rel(arg[1]))
				|| (arg[1] && arg[2] && (rel = is_rel(arg[1][arg[2]])))){
					return Gun.get(arg[3].gun, {soul: rel}, function(err, data){
						arg[0] = err; arg[1] = data;
						if(opt && opt.at){ opt.at.val = arg[1] }
						if(arg[3] && arg[3].gun){ arg[3].val = arg[1] }
						if(t && t.gun){ t.val = arg[1] }
						if(arg[4] && 'ok' == arg[4].tag){ 
							if(f && obj_empty(arg[1], _meta)){ return }
							if(opt && opt.off){ arg[4].off(); } // TODO: BUG! for plurals
						}
						cb.apply(t, f? arg.slice(1) : arg);
					});
				}
				if(opt && opt.at){ opt.at.val = arg[1] }
				if(arg[3] && arg[3].gun){ arg[3].val = arg[1] }
				if(t && t.gun){ t.val = arg[1] }
				if(arg[4] && 'ok' == arg[4].tag){ 
					if(f && obj_empty(arg[1], _meta)){ return }
					if(opt && opt.off){ arg[4].off(); } // TODO: BUG! For plurals.
				}
				cb.apply(t, f? arg.slice(1) : arg);
			}
		}

	}(Gun.chain));
	var root = this || {}; // safe for window, global, root, and 'use strict'.
	if(typeof window !== "undefined"){ (root = window).Gun = Gun }
	if(typeof module !== "undefined" && module.exports){ module.exports = Gun }
	root.console = root.console || {log: function(s){ return s }}; // safe for old browsers
	var console = {
		log: function(s){return root.console.log.apply(root.console, arguments), s},
		Log: Gun.log = function(s){ return (!Gun.log.squelch && root.console.log.apply(root.console, arguments)), s }
	};
	console.debug = function(i, s){ return (Gun.log.debug && i === Gun.log.debug && Gun.log.debug++) && root.console.log.apply(root.console, arguments), s };
	Gun.log.count = function(s){ return Gun.log.count[s] = Gun.log.count[s] || 0, Gun.log.count[s]++ }
}());


;(function(Tab){
	
	if(typeof window === 'undefined'){ return }
	if(!window.JSON){ throw new Error("Include JSON first: ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js") } // for old IE use
	Gun.tab = Tab;
	
	Tab.on = Gun.on;//Gun.on.create();

	;(function(){
		function get(err, data, at){
			if(!data && !Gun.obj.empty(at.opt.peers)){ return } // let the peers handle no data.
			at.cb(err, data); // node
		}
		Gun.on('get', function(at){
			var opt = at.opt, lex = at.lex;
			Tab.store.get((opt.prefix || '') + lex.soul, get, at);
		});
	}());

	Gun.on('put', function(at){
		var opt = at.opt, graph = at.graph, gun = at.gun;
		if(false === opt.localstorage || false === opt.localStorage){ return } // TODO: BAD! Don't provide a "storage:false" option because the option won't apply to over the network. A custom module will need to handle this.
		Gun.is.graph(graph, function(node, soul){
			if(!(node = gun.__.graph[soul])){ return }
			Tab.store.put((opt.prefix || '') + soul, node, function(err){ if(err){at.cb({err:err})} });
		});
	});

	Gun.on('put', function(at){
		var gun = at.gun, graph = at.graph, opt = at.opt;
		opt.peers = opt.peers || gun.__.opt.peers; // TODO: CLEAN UP!
		if(Gun.obj.empty(opt.peers)){
			if(!Gun.log.count('no-wire-put')){ Gun.log("Warning! You have no peers to replicate to!") }
			at.cb(null);
			return;
		}
		if(false === opt.websocket){ return }
		var msg = {
			'#': Gun.text.random(9), // msg ID
			'$': graph // msg BODY
		};
		Tab.on(msg['#'], function(err, ok){ // TODO: ONE? PERF! Clear out listeners, maybe with setTimeout?
			at.cb(err, ok);
		});
		Tab.peers(opt.peers).send(msg, {headers: {'gun-sid': Tab.server.sid}});
	});

	Gun.on('get', function(at){
		var gun = at.gun, opt = at.opt, lex = at.lex;
		opt.peers = opt.peers || gun.__.opt.peers; // TODO: CLEAN UP!
		if(Gun.obj.empty(opt.peers)){
			if(!Gun.log.count('no-wire-get')){ Gun.log("Warning! You have no peers to get from!") }
			return;
		}
		var msg = {
			'#': Gun.text.random(9), // msg ID
			'$': Gun.is.lex.ify(lex) // msg BODY
		};
		Tab.on(msg['#'], function(err, data){ // TODO: ONE? PERF! Clear out listeners, maybe with setTimeout?
			at.cb(err, data);
		});
		Tab.peers(opt.peers).send(msg, {headers: {'gun-sid': Tab.server.sid}});
	});

	Gun.on('opt', function(at){ // TODO: BUG! Does not respect separate instances!!!
		if(Tab.server){ return }
		var gun = at.gun, server = Tab.server = {};
		server.sid = Gun.text.random();
		Tab.request.createServer(function(req, res){
			if(!req || !res || !req.body || !req.headers){ return }
			var msg = req.body;
			// AUTH for non-replies.
			if(server.msg(msg['#'])){ return }
			//server.on('network', Gun.obj.copy(req)); // Unless we have WebRTC, not needed.
			if(msg['@']){ // no need to process.
				if(Tab.ons[msg['@'] || msg['#']]){
					Tab.on(msg['@'] || msg['#'], [msg['!'], msg['$']]);
				}
				return 
			}
			if(Gun.is.lex(msg['$'])){ return server.get(req, res) }
			else { return server.put(req, res) }
		});
		server.get = function(req, cb){
			var body = req.body, lex = body['$'], opt;
			if(!(node = gun.__.graph[lex[Gun._.soul]])){ return } // Don't reply to data we don't have it in memory. TODO: Add localStorage?
			cb({body: {
				'#': server.msg(),
				'@': body['#'],
				'$': node
			}});
		}
		server.put = function(req, cb){
			var body = req.body, graph = body['$'];
			if(!(graph = Gun.obj.map(graph, function(node, soul, map){ // filter out what we don't have in memory.
				if(!gun.__.graph[soul]){ return }
				map(soul, node);
			}))){ return }
			Gun.put(gun, graph, function(err, ok){
				return cb({body: {
					'#': server.msg(),
					'@': body['#'],
					'$': ok,
					'!': err
				}});
			}, {websocket: false});
		}
		server.msg = function(id){
			if(!id){
				return server.msg.debounce[id = Gun.text.random(9)] = Gun.time.is(), id;
			}
			clearTimeout(server.msg.clear);
			server.msg.clear = setTimeout(function(){
				var now = Gun.time.is();
				Gun.obj.map(server.msg.debounce, function(t,id){
					if((now - t) < (1000 * 60 * 5)){ return }
					Gun.obj.del(server.msg.debounce, id);
				});
			},500);
			if(server.msg.debounce[id]){ 
				return server.msg.debounce[id] = Gun.time.is(), id;
			}
			server.msg.debounce[id] = Gun.time.is();
			return;
		};	
		server.msg.debounce = server.msg.debounce || {};
	});

	(function(exports){
		function P(p){
			if(!P.is(this)){ return new P(p) }
			this.peers = p;
		}
		P.is = function(p){ return (p instanceof P) }
		P.chain = P.prototype;
		function map(peer, url){
			var msg = this.msg;
			var opt = this.opt || {};
			opt.out = true;
			Tab.request(url, msg, null, opt);
			return;
			Tab.request(url, msg, function(err, reply){ var body = (reply||{}).body||{};
				Tab.on(body['@'] || msg['#'], [err || body['!'], body['$']]);
			}, this.opt);
		}
		P.chain.send = function(msg, opt){
			Gun.obj.map(this.peers, map, {msg: msg, opt: opt});
		}
		exports.peers = P;
	}(Tab));

	;(function(exports){ var u;
		function s(){}
		s.put = function(key, val, cb){ try{ store.setItem(key, Gun.text.ify(val));if(cb)cb(null) }catch(e){if(cb)cb(e)} }
		s.get = function(key, cb, t){ //setTimeout(function(){
			try{ cb(null, Gun.obj.ify(store.getItem(key) || null), t);
			}catch(e){ cb(e,u,t)}
		}//,1) } 
		s.del = function(key){ return store.removeItem(key) }
		var store = window.localStorage || {setItem: function(){}, removeItem: function(){}, getItem: function(){}};
		exports.store = s;
	}(Tab));

	(function(exports){
		function r(base, body, cb, opt){
			opt = opt || (base.length? {base: base} : base);
			opt.base = opt.base || base;
			opt.body = opt.body || body;
			cb = cb || function(){};
			if(!opt.base){ return }
			r.transport(opt, cb);
		}
		r.createServer = function(fn){ r.createServer.s.push(fn) }
		r.createServer.ing = function(req, cb){
			var i = r.createServer.s.length;
			while(i--){ (r.createServer.s[i] || function(){})(req, cb) }
		}
		r.createServer.s = [];
		r.back = 2; r.backoff = 2;
		r.transport = function(opt, cb){
			//Gun.log("TRANSPORT:", opt);
			if(r.ws(opt, cb)){ return }
			r.jsonp(opt, cb);
		}
		r.ws = function(opt, cb, req){
			var ws, WS = window.WebSocket || window.mozWebSocket || window.webkitWebSocket;
			if(!WS){ return }
			if(ws = r.ws.peers[opt.base]){
				req = req || {};
				if(opt.headers){ req.headers = opt.headers }
				if(opt.body){ req.body = opt.body }
				if(opt.url){ req.url = opt.url }
				req.headers = req.headers || {};
				if(!opt.out && !ws.cbs[req.headers['ws-rid']]){
					ws.cbs[req.headers['ws-rid'] = 'WS' + (+ new Date()) + '.' + Math.floor((Math.random()*65535)+1)] = function(err,res){
						if(!res || res.body || res.end){ delete ws.cbs[req.headers['ws-rid']] }
						cb(err,res);
					}
				}
				if(!ws.readyState){ return setTimeout(function(){ r.ws(opt, cb, req) },100), true }
				ws.sending = true;
				ws.send(JSON.stringify(req));
				return true;
			}
			if(ws === false){ return }
			(ws = r.ws.peers[opt.base] = new WS(opt.base.replace('http','ws'))).cbs = {};
			ws.onopen = function(o){ r.back = 2; r.ws(opt, cb) };
			ws.onclose = window.onbeforeunload = function(c){
				if(!c){ return }
				if(ws && ws.close instanceof Function){ ws.close() }
				if(!ws.sending){
					ws = r.ws.peers[opt.base] = false;
					return r.transport(opt, cb);
				}
				r.each(ws.cbs, function(cb){
					cb({err: "WebSocket disconnected!", code: !ws.sending? -1 : (ws||{}).err || c.code});
				});
				ws = r.ws.peers[opt.base] = null; // this will make the next request try to reconnect
				setTimeout(function(){ // TODO: Have the driver handle this!
					r.ws(opt, function(){}); // opt here is a race condition, is it not? Does this matter?
				}, r.back *= r.backoff);
			};
			ws.onmessage = function(m){ var res;
				if(!m || !m.data){ return }
				try{res = JSON.parse(m.data);
				}catch(e){ return }
				if(!res){ return }
				res.headers = res.headers || {};
				if(res.headers['ws-rid']){ return (ws.cbs[res.headers['ws-rid']]||function(){})(null, res) }
				if(res.body){ r.createServer.ing(res, function(res){ res.out = true; r(opt.base, null, null, res)}) } // emit extra events.
			};
			ws.onerror = function(e){ (ws||{}).err = e };
			return true;
		}
		r.ws.peers = {};
		r.ws.cbs = {};
		r.jsonp = function(opt, cb){
			r.jsonp.ify(opt, function(url){
				if(!url){ return }
				r.jsonp.send(url, function(err, reply){
					cb(err, reply);
					r.jsonp.poll(opt, reply);
				}, opt.jsonp);
			});
		}
		r.jsonp.send = function(url, cb, id){
			var js = document.createElement('script');
			js.src = url;
			js.onerror = function(c){
				(window[js.id]||function(){})(null, {err: "JSONP failed!"});
			}
			window[js.id = id] = function(res, err){
				cb(err, res);
				cb.id = js.id;
				js.parentNode.removeChild(js);
				window[cb.id] = null; // TODO: BUG: This needs to handle chunking!
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
						if(res && res.body){ r.createServer.ing(res, function(){ r(opt.base, null, null, res) }) } // emit extra events.
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
		exports.request = r;
	}(Tab));
}({}));