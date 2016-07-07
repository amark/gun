//console.log("!!!!!!!!!!!!!!!! WARNING THIS IS GUN 0.5 !!!!!!!!!!!!!!!!!!!!!!");
;(function(){ var u;
	function Gun(o){
		if(!(this instanceof Gun)){ return new Gun(o) }
		this._ = {gun: this, val: {}, lex: {}, opt: {}, on: Gun.on, ons: {}};
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
				//typeof console !== 'undefined' && console.debug(102, 'on', tag, arg, 'ons', ctx, ons);
				if(!arg){
					if(1 === arguments.length){ // Performance drops significantly even though `arguments.length` should be okay to use.
						return on.s;
					}
				}
				if(arg instanceof Function){
					act = new Act(tag, arg, at, on, ctx);
					if(add){
						add(tag, act, on, ctx); // TODO: CLEAN UP! The bottom two features should be implemented inside of add as the extension. This, if it returns, should return immediately. But if it doesn't do anything, continue with default behavior.
						if(noop === act.fn){ // TODO: This should be faster, but perf is showing it slower? Note: Have to move it above the push line and uncomment the bottom line in add.
							return act;
						}
						if(-1 < act.i){ return act }
					}
					on.s.push(act);
					return act;
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
					if(0 === still.length){ // TODO: BUG! If we clean up the events themselves when no longer needed by deleting this code, it causes some tests to fail.
						delete ons[tag];
					}
				}
				if(!gap && at && at instanceof Function){
					at.call(as, arg);
				}
				return;
			}
			exports.on = Event;
		}(Util, function add(tag, act, on, ctx){ // Gun specific extensions
			var mem = on.mem, tmp;
			if(mem){
				if(mem instanceof Array){
					act.fn.apply(act.at, mem.concat(act));
				} else {
					act.fn.call(act.at, mem, act);
				}
				return;
			}
			if(!ctx.gun){ return }
			if(tmp = ctx.gun.chain.sort){
				on.s.splice(act.i = tmp - 1, 0, act);
				ctx.gun.chain.sort = 0;
			}
			if(!ctx.lazy){ return }
			var at = act.at? act.at.gun? act.at : ctx : ctx;
			if(!at.gun){ return }
			ctx.lazy(at, tag);
			if(on.mem){ add(tag, act, on, ctx) } // for synchronous async actions.
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
					ctx.soonest = (ctx.soonest < wait.when)? ctx.soonest : wait.when;
					map(wait);
				}
			}
			s.check = function(){
				var ctx = {now: s.time(), soonest: Infinity};
				s.waiting.sort(s.sort);
				s.waiting = exports.list.map(s.waiting, s.each, ctx) || [];
				s.set(ctx.soonest);
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

		;(function(){
			var time = Gun.time.is, last = -Infinity, n = 0, d = 1000;
			Gun.is.state = function(){
				var t = time();
				if(last < t){
					n = 0;
					return last = t;
				}
				return last = t + ((n += 1) / d);
			}
		}());

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

		;(function(){ // NEW API?
			;(function(){
				var Val = Gun.val = {};
				Val.is = function(v){ // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
					var u;
					if(v === u){ return false }
					if(v === null){ return true } // "deletes", nulling out fields.
					if(v === Infinity){ return false } // we want this to be, but JSON does not support it, sad face.
					if(Gun.bi.is(v) // by "binary" we mean boolean.
					|| Gun.num.is(v)
					|| Gun.text.is(v)){ // by "text" we mean strings.
						return true; // simple values are valid.
					}
					return Val.is.rel(v) || false; // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
				}
				;(function(){
					Val.is.rel = function(v){ // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
						if(v && !v[_meta] && obj_is(v)){ // must be an object.
							var o = {};
							obj_map(v, map, o);
							if(o.id){ // a valid id was found.
								return o.id; // yay! Return it.
							}
						}
						return false; // the value was not a valid soul relation.
					}
					function map(s, f){ var o = this; // map over the object...
						if(o.id){ return o.id = false } // if ID is already defined AND we're still looping through the object, it is considered invalid.
						if(f == _soul && text_is(s)){ // the field should be '#' and have a text value.
							o.id = s; // we found the soul!
						} else {
							return o.id = false; // if there exists anything else on the object that isn't the soul, then it is considered invalid.
						}
					}
				}());
			}());
			;(function(){
				var Node = Gun.node = {};
				Node.soul = function(n, o){ return (n && n._ && n._[o || _soul]) || false } // convenience function to check to see if there is a soul on a node and return it.
				Node.soul.ify = function(n, o){ // put a soul on an object.
					o = (typeof o === 'string')? {soul: o} : o || {};
					n = n || {}; // make sure it exists.
					n._ = n._ || {}; // make sure meta exists.
					n._[_soul] = o.soul || n._[_soul] || text_random(); // put the soul on it.
					return n;
				}
				;(function(){
					Node.ify = function(obj, o, t){ // returns a node from a shallow object.
						if(!o){ o = {} }
						else if(typeof o === 'string'){ o = {soul: o} }
						else if(o instanceof Function){ o = {field: o} }
						var n = o.node || (o.node = {});
						n = Node.soul.ify(n, o); // put a soul on it.
						obj_map(obj, map, {n:n,o:o});
						return n; // This will only be a valid node if the object wasn't already deep!
					}
					function map(v, f){ var cb; // iterate over each field/value.
						if(_meta === f){ return } // ignore meta.
						if(!Gun.val.is(v)){ return } // ignore invalid values.
						this.n[f] = v;
					}
				}());
			}());
			;(function(){
				var console = window.console;
				var Graph = Gun.graph = {};
				Graph.ify = function(obj, o, t){
					if(!o){ o = {} }
					else if(o instanceof Function){ o.field = o }
					var env = {root: {}, graph: {}, seen: [], opt: o, t: t}, at = {path: [], obj: obj};
					at.node = env.root;
					node(env, at);
					return env.graph;
				}
				function node(env, at){ var tmp;
					at = at || env.at;
					if(tmp = seen(env, at)){ return tmp }
					Gun.node.ify(at.obj, map, {env: env, at: at});
					return at;
				}
				function map(v,f){ 
					var env = this.env, at = this.at;
					if(Gun.val.is(v)){
						at.node[f] = v; 
					}
					if(it(v)){
						at.node[f] = {'#': node(env, {obj: v, path: at.path.concat(f)}).node._['#']};
					} else {
						at.node[f] = v;
					}
				}
				function seen(env, at){
					var arr = env.seen, i = arr.length, has;
					while(i--){ has = arr[i];
						if(at.obj === has.obj){ return has }
					}
					arr.push(at);
				}

				// test
				var g = Gun.graph.ify({
					you: {
						are: {
							very: 'right'
						}
					},
					my: 'lad'
				});
				console.log("GRAPH!", g);
			}());
			
		}());

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
				cat.ack(cat.err, cat.ok);
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
				//Gun.get.got.call(this, null, node);
				var at = this.gun.__.gun.get(soul)._;
				at.val.w = -1; // TODO: Clean up! Ugly!
				Gun.get.got.call(at, null, node);
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
			function got(err, node){ var at = this;
				if(!at.stream){ var soul;
					if(!node && !at.lex.soul){ return }
					at = at.gun.__.gun.get(is_node_soul(node) || at.lex.soul)._;
				}
				Gun.on('stream', Gun.obj.to(at, {err: err, change: node}), stream);
			}
			function stream(at){
				if(!at.stream){ console.log("WARNING! No at.stream", at); }
				at.stream(at.err, at.change);
			}
		}());

		Gun.on('get', function(at, ev){
			var opt = at.opt;
			if(opt.force){ return }
			var lex = at.lex, gun = at.gun, graph = gun.__.graph, node = graph[lex.soul], field;
			if(opt.memory || node){
				if((field = lex.field) && !obj_has(node, field)){
					return;
				}
				at.cb(null, node);
				ev.stun() 
				return 
			}
		});

		Gun.on('stream', function(at, ev){ var node;
			if(!(node = at.change)){ return }
			at.node = obj_copy(HAM_node(at.gun, node)); // TODO: CLEAN UP? Now that I think about it, does this even belong in the streaming section?
			//at.node = obj_copy(Gun.HAM.node(gun, at.node)); // TODO: Cache the copied ones! So you don't have to recopy every time.
			if(!at.node){
				at.err = at.err || {err: "Invalid node!"};
				ev.stun();
			}
		});

		Gun.on('stream', function(at){
			var lex = at.lex, soul = lex.soul, field = lex.field;
			var gun = at.gun, graph = gun.__.graph, node = graph[soul], u;
			if(soul){
				if(soul !== is_node_soul(at.change)){
					at.change = obj_copy(node);
				}
				if(obj_has(at.change, '##')){ // TODO: CLEAN UP! Doesn't belong here. But necessary/needed.
					return;
				}
			}
			if(at.change && field){ // TODO: Multiples?
				var ignore = obj_put({}, _meta, 1);
				if(!obj_empty(at.change, obj_put(ignore, field, 1))){
					at.change = Gun.is.node.ify(obj_put({}, field, at.change[field]), {soul: soul, state: Gun.is.node.state(at.change, field)})
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
					return ctx.err = "Invalid field name on '" + (ctx.at.path.join('.') || field) + "'!";
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
			var gun = this, at = gun.__, u;
			if(!at){
				at = gun.__ = gun._;
				at.graph = {};
			}
			at.opt.uuid = opt.uuid || Gun.text.random;
			at.opt.state = opt.state || Gun.is.state;
			at.opt.peers = at.opt.peers || {};
			if(text_is(opt)){ opt = {peers: opt} }
			if(list_is(opt)){ opt = {peers: opt} }
			if(text_is(opt.peers)){ opt.peers = [opt.peers] }
			if(list_is(opt.peers)){ opt.peers = obj_map(opt.peers, function(n,f,m){m(n,{})}) }
			Gun.obj.map(opt.peers, function(v, f){
				at.opt.peers[f] = v;
			});
			Gun.obj.map(['key', 'path', 'map', 'not', 'init'], function(f){
				if(!opt[f]){ return }
				at.opt[f] = opt[f] || at.opt[f];
			});
			if(!stun){ Gun.on('opt', {gun: gun, opt: opt}) }
			return gun;
		}

		Gun.chain.chain = function(cb){
			var back = this, gun = new this.constructor(back);
			gun._.back = back._; // TODO: API CHANGE!
			gun.back = back;
			gun.__ = back.__;
			return gun;
		}

		Gun.chain.Back = function(n, opt){
			if(-1 === n){
				return this.__.gun;
			}
			var gun = this, at = gun._;
			opt = opt || {};
			if(typeof n === 'string'){
				n = n.split(opt.split || '.');
			}
			if(n instanceof Array){
				var i = 0, l = n.length, o = {}, tmp = at, u;
				for(i; i < l; i++){
					tmp = (tmp||o)[n[i]];
				}
				if(at.back && u === tmp){
					return at.back.gun.Back(n, opt);
				} else {
					return tmp;
				}
			}
		}

		;(function(){
			Gun.chain.put = function(data, cb, opt){
				var back = this, gun;
				opt = opt || {};
				opt.any = cb;
				opt.data = data;
				opt.state = (opt.state || back.Back('opt.state') || Gun.state)();
				gun = (back._.back && back) || back.Back(-1).get(Gun.node.soul(data) || (opt.uuid || back.Back('opt.uuid') || Gun.text.random)());
				Gun.graph.ify(data, node, value);
				/*
				var back = this, opts = back.__.opt, gun, at, u;
				opt = opt || {};
				opt.any = cb;
				opt.data = data;
				opt.state = (opt.state || opts.state)();
				gun = (back._.back && back) || back.__.gun.get(is_node_soul(data) || (opt.uuid || opts.uuid)());
				*/
				at = Gun.obj.to(gun._, {opt: opt});
				//gun._.on = on;
				if(false && at.lex.soul){
					link.call(at, at, nev);
				} else {
					(at.lex.soul? gun : back)._.on('chain', link, at);
					//Gun.on.call((at.lex.soul? gun : back)._, 'chain', link, at);
				}
				if(0 < at.val.w){ at.val.ue = u }
				return gun;
			};
			function on(a,b,c,d){return;
				var at = this;
				if(true === a){
					at.on = Gun.on;
					if(!at.foo){ return }
					var i = 0, f = at.foo, l = f.length; 
					for(; i < l; i++){
						at.on.apply(at, f[i]);
					}
					return;
				}
				if(!at.foo){ at.foo = [] }
				at.foo.push([a,b,c,d]);
			}
			var noop = function(){}, nev = {off: noop, stun: noop};
			function link(cat, ev){ ev.off(); // TODO: BUG!
				var at = this, put = at.opt, tmp = {on: Gun.on}, data, cb, u;
				if(cat.err){ return }
				if(!cat.node && (put.init || cat.gun.__.opt.init)){ return }
				// TODO: BUG! `at` doesn't have correct backwards data!
				if(!(data = wrap(at, put.data, put, cat.lex.soul))){ // TODO: PERF! Wrap could create a graph version, rather than a document version that THEN has to get flattened.
					if((cb = put.any) && cb instanceof Function){
						cb.call(at.gun, {err: Gun.log("No node exists to put " + (typeof put.data) + ' "' + put.data + '" in!')});
					}
					return;
				}
				ev.stun();
				at.val.w = 1;
				console.debug(1, 'putting', data);
				Gun.ify(data, end, {
					node: function(env, cb){ var eat = env.at;
						if(!cat.node){
							return cb(env, eat);
						}
						console.debug(6, 'eat', eat.path);
						console.debug(5, 'eat', eat.path);
						console.debug(4, 'eat', eat.path);
						console.debug(3, 'eat', eat.path);
						function each(f, p){
							if(!p){ return }
							tmp.on(p, function(data){
								var soul = is_node_soul(data);
								if(!data || !soul){
									cb(env, eat);
									tmp.on(f, is_node_ify({}, eat.soul));
									return; 
								}
								get(soul, f);
							});
						}
						function get(soul, f){
							// TODO: BUG!!!! What about cases where it is an index/pseudo key? What about this function responding multiple times?
							Gun.get(cat.gun, {soul: soul, field: f}, function(err, data){
								eat.soul = is_rel((data||{})[f]);
								console.log("What?", soul, f, eat.soul);
								cb(env, eat);
								tmp.on(f, is_node_ify({}, eat.soul));
							});
						}
						var soul = is_node_soul(cat.val.ue) || is_node_soul(cat.node) || cat.lex.soul;
						if(eat.path.length){
							var path = eat.path, i = 0, l = path.length, f;
							for(i; i < l; i++){
								each(path[i], f);
								f = path[i];
							}
							get(soul, path[0]);
							return;
						}
						eat.soul = soul;
						console.debug(2, 'eat', eat, cat, soul);
						cb(env, eat);
					}, value: function(env){ var eat = env.at;
						if(!eat.field){ return }
						is_node_state_ify(eat.node, {field: eat.field, state: put.state});
					}, uuid: at.gun.__.opt.uuid, state: put.state
				}, at);
			}
			function wrap(at, data, opt, soul){ var tmp;
				if(!at){ return data }
				if(tmp = at.lex.field){
					soul = at.lex.soul;
					data = obj_put({}, tmp, data);
					opt.gun = at.gun._.back;
				} else 
				if(!obj_is(data)){ return }
				data = is_node_soul_ify(data, tmp = soul || at.lex.soul);
				if(tmp){ return data }
				if(tmp = at.gun._.back){ // TODO: API change!!
					return wrap((opt.gun = tmp)._, data, opt);
				}
				return data;
			}	
			function end(err, env, at){ var cb;
				if(err){
					if((cb = at.opt.any) && cb instanceof Function){
						cb.call(at.gun, {err: Gun.log(err)});
					}
					return; // TODO: BUG! Chain emit??
				}
				Gun.on('normalize', Gun.obj.to(at, {err: err, graph: env.graph, env: env}), wire);
			}
			function wire(at){
				//at.gun._.on = Gun.on;
				at.val.w = -1;
				Gun.put(Gun.obj.to(at, {cb: ack}));
				//at.gun._.on(true);
			}
			function ack(err, ok){ var at = this, cb;
				if((cb = at.opt.any) && cb instanceof Function){
					cb.call(at.gun, err, ok);
				}
			}
		}());

		;(function(){ // TODO: THIS BELONGS FURTHER BELOW! But without some ability to control sort order on events this needs to be before. Some sort of insertion ordering is needed.
			Gun.chain.key = function(key, cb, opt){
				if(!key){
					if(cb){
						cb.call(this, {err: Gun.log('No key!')});
					}
					return this;
				}
				var gun = this, at = Gun.obj.to(gun._, {key: key, ref: gun.__.gun.get(key), any: cb || function(){}, opt: opt });
				gun.on('chain', index, at); // TODO: ONE?
				return gun;
			}	
			function index(cat, ev){ ev.off(); // TODO: BUG!
				var at = this, cex = cat.lex, lex = at.lex;
				//if(cex.soul === lex.soul){ return }
				at.soul = is_node_soul(cat.node);
				if(!at.soul || cex.soul === at.key){ return }
				at.obj = obj_put({}, '##', 1);
				at.obj = obj_put(at.obj, '#'+at.soul+'#', is_rel_ify(at.soul));
				at.put = is_node_ify(at.obj, at.key);
				at.ref.chain.sort = 1;
				at.ref.put(at.put, at.any, {key: at.key, init: false});
			}
			function keyed(f){
				if(!f || !('#' === f[0] && '#' === f[f.length-1])){ return }
				var s = f.slice(1,-1);
				if(!s){ return }
				return s;
			}
			keyed.on = '##';
			Gun.on('chain', function(cat, e){
				if(!cat.node || !cat.node[keyed.on]){ return } // TODO: BUG! Note! If you are going to use 'change' the ordering in which the data is streamed to you is important. If you wait until you have '#' to say it is a keynode, but you received '#soul' fields earlier, you'll miss them.
				var resume = e.stun(resume), node = cat.change, field = cat.lex.field, pseudo, change;
				if(!(pseudo = cat.pseudo)){
					node = cat.node;
					pseudo = cat.pseudo = cat.gun._.pseudo = cat.gun._.node = is_node_ify({}, is_node_soul(cat.node));
				}
				pseudo._.key = 'pseudo';
				cat.seen = cat.seen || {}; // TODO: There is a better way.
				is_node(node, function(n, ff){ var f;
					if(f = keyed(ff)){
						if(cat.seen[f]){ return }
						cat.seen[f] = true; // TODO: CLEAN UP! There is a better way. // TODO: BUG! What if somebody unkeys something?
						cat.gun.chain.sort = 1;
						if(field){
							cat.gun.__.gun.get(f).path(field, on);
						} else {
							cat.gun.__.gun.get(f, on);
						}
						return;
					}
					if(keyed.on === ff){ return }
					is_node_state_ify(change = change || {}, {field: ff, value: n, state: is_node_state(node, ff)});
				});
				function on(err, node, field, at){
					if(!node){ return }
					cat.node = pseudo = HAM_node(pseudo, node);
					cat.change = at.change;
					resume();
				}
				if(!change){ return }
				is_node(cat.gun.__.graph[is_node_soul(cat.node)], function(rel,s){
					if(!(s = keyed(s))){ return }
					Gun.get.got.call(cat.gun.__.gun.get(s)._, null, is_node_soul_ify(obj_copy(change), s));
				});
			});
			Gun.on('normalize', function(cat){ // TODO: CLEAN UP!!!!
				var at = cat, env = at.env;
				if(at.opt.key){ return }
				is_graph(env.graph, function(node, soul){ // TODO: CLEAN ALL OF THIS UP!
					var key = {node: at.gun.__.graph[soul]}, tmp;
					if(!obj_has(key.node, keyed.on)){ return } // TODO: BUG! Should iterate over it anyways to check for non #soul# properties to port.
					is_node(key.node, function each(rel, s){
						if(!(s = keyed(s))){ return }
						var n = at.gun.__.graph[s]; // TODO: BUG! Should we actually load the item or only use what is in memory?
						if(obj_has(n, keyed.on)){
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

		;(function(){
			Gun.chain.get = function(lex, cb, opt){
				if(!opt || !opt.path){ var back = this.__.gun; } // TODO: CHANGING API! Remove this line!
				var gun, back = back || this;
				var get = back._.get || (back._.get = {}), tmp;
				if(typeof lex === 'string'){
					if(!(gun = get[lex])){
						gun = cache(get, lex, back);
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
						gun._.lex = lex;
						Gun.get(gun._);
						return gun;
					}
					if(!(gun = get[tmp])){
						gun = cache(get, tmp, back);
					}
				} else
				if(tmp = lex[_soul]){
					if(!(gun = get[tmp])){
						gun = cache(get, tmp, back);
					}
					if(tmp = lex[_field]){
						return gun.path(tmp, cb, opt);
					}
				}
				if(cb && cb instanceof Function){
					(opt = opt || {}).any = cb;
					gun._.on('chain', any, opt);
				}
				return gun;
			}
			function cache(get, key, back){
				var gun = get[key] = back.chain(), at = gun._;
				back._.lazy = at.lazy = lazy;
				if(!back._.back){
					at.stream = stream;
					at.lex.soul = key;
					//back._.on('#' + key, soul, at);
				} else {
					var lex = at.lex, cat = back._, flex = cat.lex;
					if(!flex.field && flex.soul){
						lex.soul = flex.soul;
					}
					lex.field = key;
					if(obj_empty(get, key)){ // only do this once
						back._.on('chain', path, back._);
					}
					back._.on('.' + key, field, at);
				}
				return gun;
			}
			function lazy(at){ var cat = this; // TODO: CLEAN UP! While kinda ugly, I think the logic is working quite nicely now. So maybe not clean.
				if(at.val.loading){ return }
				at.val.loading = 1; // TODO: CLEAN UP!!!!
				var lex = at.lex;
				if(lex.field){
					lex.soul = lex.soul || cat.val.rel;
					cat.on('chain', function(ct, e){
						//console.log("egack!");
						// TODO: BUG!! This isn't good for chunking? It assumes the entire node will be replied.
						if(lex.soul && 1 === at.val.loading){ return }
						e.off();
						//if(ct.err || !ct.node){ return cat.on('.' + lex.field, ct) }
						if(obj_has(ct.change, lex.field)){ return }
						else { return cat.on('.' + lex.field, ct) }
						//lex.soul = is_node_soul(ct.node);
						//lazy.call(cat, at);
					}, at);
				}
				at.val.loading = 2; // TODO: CLEAN UP!!!!
				if(!lex.soul){ return }
				if(at.val !== cat.val && cat.val.loading){ return }
				if(!obj_has(cat.val, 'loading')){ 
					cat.val.loading = true; // TODO: CLEAN UP!!!
				}
				Gun.get(at);
			};
			function stream(err, node){ var tmp;
				//Gun.on('chain', this);
				if(!this.node && this.change){
					if(tmp = this.lex.soul){
						this.gun._.node = this.gun._.node || obj_copy(this.gun.__.graph[tmp]); // TODO: Clean up! Does this belong here? Better than where we previously had it in the 'stream' functions though.
					}
					return;
				}
				Gun.on('chain', this, chain, this);
			}
			/*Gun.on('chain', function(cat){
				cat.on('#' + is_node_soul(cat.node) || cat.lex.soul, cat);
			});*/
			function chain(cat, ev){ var at = Gun.obj.to(this), tmp, u;
				at.val.loading = false; // TODO: Clean up! Ugly.
				at.change = cat.change;
				var err = cat.err, node = cat.node, lex = at.lex, field = at.val.rel? u : lex.field;
				tmp = at.val.ue = (field && node)? node[field] : node;
				if(is_rel(tmp) || (!field && obj_empty(tmp, _meta))){ at.val.ue = u }
				at.on('chain', at);
			}
			function path(cat, ev){
				// TODO: Should we expose parent event listener downwards? So test like 'get key path put' can stun the parent while they put?
				//var field = at.val.rel? u : at.lex.field; // TODO: Is this necessary any more?
				//if(!field){ // TODO: See above. 
					is_node(cat.change, map, {at: this, cat: cat}); 
				//}
			}
			function map(val, field){
				this.at.on('.' + field, this.cat);
			}
			function field(cat, ev){ var at = Gun.obj.to(this);
				//at.val.loading = false;
				var node = is_val(cat.val.ue)? cat.node : cat.val.ue, val = at.val, lex, field, rel, value;
				at.change = cat.change;
				at.node = node;
				if(cat.err || !node){ return chain.call(at, at, ev) } // TODO: CLEAN UP! Maybe make nots/erorrs cascade regardless of chains/anys/oks?
				at.val.w = cat.val.w; // TODO: Clean up! Ugly.
				(lex = at.lex).soul = is_node_soul(node);
				if((value = node[field = lex.field]) === val.ue && obj_has(val, 'ue')){ return }
				if(val.rel && val.rel === is_rel(value)){ return }
				if(val.ev){ 
					val.ev.off();
					val.ev = null;
				}
				if(at.val.rel = rel = is_rel(value)){
					// TODO: BUG! How we are changing it now (to test that any gets called) will make it such that lazy won't happen for sub-paths.
					var as = at.gun.__.gun.get(rel);// c = at.on('chain').length + at.on('ok').length + at.on('any').length;
					//if(0 === c){ as._.val.loading = true } // TODO: CLEAN UP!!!
					//at.gun.chain.sort = 1;
					at.val.ev = as._.on('chain', prop, {as: at});
					//if(0 === c){ as._.val.loading = false } // TODO: CLEAN UP!!!
					//at.on('.', at);
					return;
				}
				chain.call(at, at, ev);
			}
			function prop(cat, ev){
				chain.call(this.as, cat, ev);
			}
			function any(cat, ev){ var opt = this;
				opt.any.call(cat.gun, cat.err, cat.val.ue, cat.lex.field, cat, ev);
			}
		}());
		Gun.chain.path = function(field, cb, opt){
			var back = this, gun = back, tmp;
			opt = opt || {}; opt.path = true;
			if(typeof field === 'string'){
				tmp = field.split(opt.split || '.');
				if(1 === tmp.length){
					return back.get(field, cb, opt);
				}
				field = tmp;
			}
			if(field instanceof Array){
				if(field.length > 1){
					gun = back;
					var i = 0, l = field.length;
					for(i; i < l; i++){
						gun = gun.get(field[i], (i+1 === l)? cb : null, opt);
					}
					gun.back = back;
					//(gun = back.path(field.slice(1), cb, opt)).back = back; // TODO: BUG! Doesn't work :(.
				} else {
					gun = back.get(field[0], cb, opt);
				}
				return gun;
			}
			if(!field && 0 != field){
				field = '';
			}
			return this.get(''+field, cb, opt);
		}
		;(function(){
			Gun.chain.on = function(cb, opt, t){
				var gun = this, at = gun._;
				if(typeof cb === 'string'){ return at.on(cb, opt, t) }
				if(cb && cb instanceof Function){
					(opt = opt || {}).ok = cb;
					at.on('chain', ok, opt);
				}
				return gun;
			}
			function ok(cat, ev){ var opt = this;
				var value = cat.val.ue;
				if(!value && null !== value){ return }
				opt.ok.call(cat.gun, value, cat.lex.field);
			}

			Gun.chain.val = function(cb, opt, t){
				var gun = this, at = gun._, value = at.val.ue;
				if(value || null === value){
					cb.call(gun, value, at.lex.field);
					return gun;
				}
				if(cb){
					(opt = opt || {}).ok = cb;
					at.on('chain', val, opt);
				}
				return gun;
			}

			function val(cat, ev, to){ var opt = this;
				var value = cat.val.ue;
				if(!value && null !== value){
					if(!opt.empty){ return } // TODO: DEPRECATE THIS!
					if(!obj_empty(cat.change, _meta)){ return }
					value = cat.change;
				}
				clearTimeout(opt.to);
				if(!to && !cat.val.w){ // TODO: Clean up `val.w`! Ugly!
					opt.to = setTimeout(function(){val.call(opt, cat, ev, opt.to || 1)}, opt.wait || 99);
					return;
				}
				ev.off();	
				opt.ok.call(cat.gun, value, cat.lex.field);
			}
		}());

		;(function(){
			Gun.chain.not = function(cb, opt, t){
				var gun = this, at = Gun.obj.to(gun._, {not: {not: cb}});
				at.on('chain', ought, at);
				return gun;
			}
			function ought(cat, ev){ ev.off(); var at = this; // TODO: BUG! Is this correct?
				if(cat.err || cat.node){ return }
				if(!at.not || !at.not.not){ return }
				ev.stun(); // TODO: BUG? I think this is correct.
				at.not.not.call(at.gun, at.lex.field || at.lex.soul, function(){ console.log("Please report this bug on https://gitter.im/amark/gun and in the issues."); need.to.implement; });
			}
		}());
	}(Gun.chain));
	var root = this || {}; // safe for window, global, root, and 'use strict'.
	if(typeof module !== "undefined" && module.exports){ module.exports = Gun }
	if(typeof window !== "undefined"){ (root = window).Gun = Gun }
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
		s.get = function(key, cb, t){ //console.log('ASYNC localStorage');setTimeout(function(){
			try{ cb(null, Gun.obj.ify(store.getItem(key) || null), t);
			}catch(e){ cb(e,u,t)}
		}//,1) }
		s.get = function(key, cb, t){ console.log("ASYNC localStorage")
			var data = Gun.obj.ify(store.getItem(key));
			setTimeout(function(){ cb(null, data, t) },Infinity);
		}
		s.del = function(key){ return store.removeItem(key) }
		var store = window.localStorage || {setItem: function(){}, removeItem: function(){}, getItem: function(){}};
		exports.store = s;
	}(Tab));

	(function(exports){
		function r(base, body, cb, opt){
			var o = base.length? {base: base} : {};
			o.base = opt.base || base;
			o.body = opt.body || body;
			o.headers = opt.headers;
			o.url = opt.url;
			o.out = opt.out;
			cb = cb || function(){};
			if(!o.base){ return }
			r.transport(o, cb);
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