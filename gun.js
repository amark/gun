//console.log("!!!!!!!!!!!!!!!! WARNING THIS IS GUN 0.5 !!!!!!!!!!!!!!!!!!!!!!");
;(function(){

	/* UNBUILD */
	function require(path){
		return module[resolve(path)];
	}
	function module(cb){
		return function(mod, path){
			cb(mod = {exports: {}});
			module[resolve(path)] = mod.exports;
		}
	}
	function resolve(path){
		return path.split('/').slice(-1).toString().replace('.js','');
	}

	var root;
	if(typeof window !== "undefined"){ root = window }
	if(typeof global !== "undefined"){ root = global }
	root = root || {};
	var console = root.console = root.console || {log: function(){}};
	/* UNBUILD */

	;module(function(module){
		// Generic javascript utilities.
		var Type = {};
		Type.fns = Type.fn = {is: function(fn){ return (!!fn && fn instanceof Function) }}
		Type.bi = {is: function(b){ return (b instanceof Boolean || typeof b == 'boolean') }}
		Type.num = {is: function(n){ return !list_is(n) && ((n - parseFloat(n) + 1) >= 0 || Infinity === n || -Infinity === n) }}
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
			o = Type.text.is(o)? {'=': o} : o || {}; // {'~', '=', '*', '<', '>', '+', '-', '?', '!'} // ignore case, exactly equal, anything after, lexically larger, lexically lesser, added in, subtacted from, questionable fuzzy match, and ends with.
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
		Type.list.map = function(l, c, _){ return obj_map(l, c, _) }
		Type.list.index = 1; // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
		Type.obj = {is: function(o){ return o? (o instanceof Object && o.constructor === Object) || Object.prototype.toString.call(o).match(/^\[object (\w+)\]$/)[1] === 'Object' : false }}
		Type.obj.put = function(o, f, v){ return (o||{})[f] = v, o } 
		Type.obj.has = function(o, f){ return o && Object.prototype.hasOwnProperty.call(o, f) }
		Type.obj.del = function(o, k){
			if(!o){ return }
			o[k] = null;
			delete o[k];
			return o;
		}
		Type.obj.as = function(o, f, v){ return o[f] = o[f] || (arguments.length >= 3? v : {}) }
		Type.obj.ify = function(o){
			if(obj_is(o)){ return o }
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
				if(n && (i === n || (obj_is(n) && obj_has(n, i)))){ return }
				if(i){ return true }
			}
			Type.obj.empty = function(o, n){
				if(!o){ return true }
				return obj_map(o,empty,{n:n})? false : true;
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
				var u, i = 0, x, r, ll, lle, f = fn_is(c);
				t.r = null;
				if(Object.keys && obj_is(l)){
					ll = Object.keys(l); lle = true;
				}
				if(list_is(l) || ll){
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
							if(obj_has(l,i)){
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

		var fn_is = Type.fn.is;
		var list_is = Type.list.is;
		var obj = Type.obj, obj_is = obj.is, obj_has = obj.has, obj_map = obj.map;
		module.exports = Type;
	})(module, './src/type');
		
	;module(function(module){
		// On event emitter generic javascript utility.
		function Scope(){
			function On(tag, arg, as, eas, skip){
				var ctx = this, ons = ctx.ons || (ctx.ons = {}), on = ons[tag] || (ons[tag] = {s: []}), act, mem, O = On.ons;
				if(!arg){
					if(1 === arguments.length){ // Performance drops significantly even though `arguments.length` should be okay to use.
						return on.s;
					}
				}
				if(arg instanceof Function){
					act = new Act(tag, arg, as, on, ctx);
					if(O && O.event && ctx !== On){
						On.on('event', act);
						if(noop === act.fn){
							return act;
						}
						if(-1 < act.i){ return act }
					}
					on.s.push(act);
					return act;
				}
				if(O && O.emit && ctx !== On){
					var ev = {tag: tag, arg: arg, on: on, ctx: ctx}, u;
					On.on('emit', ev);
					if(u === ev.arg){ return }
				}
				on.arg = arg;
				on.end = as;
				on.as = eas;
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
						act.fn.call(act.as, arg, act);
					} else {
						act.fn.apply(act.as, arg.concat(act));
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
				if(!gap && as && as instanceof Function){
					as.call(eas, arg);
				}
				return;
			}
			On.on = On;
			On.scope = Scope;
			return On;
		}
		function Act(tag, fn, as, on, ctx){
			this.tag = tag;
			this.fn = fn;
			this.as = as;
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
		module.exports = Scope();
	})(module, './src/on');

	;module(function(module){
		var On = require('./on');
		
		function Chain(create, opt){
			opt = opt || {};
			opt.chain = opt.chain || 'chain';
			opt.back = opt.back || 'back';
			opt.uuid = opt.uuid || function(){
				return (+new Date()) + Math.random();
			};
			opt.id = opt.id || '#';

			var proto = create.prototype;
			var on = create.on = On.scope();
			
			proto.chain = function(){
				var chain = new this.constructor(), _, tmp;
				_ = chain._ || (chain._ = {});
				_.back = this;
				if(tmp = opt.extend){
					_[tmp] = this._[tmp];
				}
				return chain;
			}
			proto.back = function(){
				return this._.back || this;
			}
			proto.on = function(tag, arg, eas, as){
				var tmp = this._ || (this._ = {});
				if(!tmp.on){ tmp.on = on }
				if(typeof tag !== 'string'){
					return !opt.on? this : opt.on.call(this, tag, arg, eas, as);
				}
				tmp.on(tag, arg, eas, as);
				return this;
			}

			on.next = function(chain){
				function next(a,b,c,d){
					if(a instanceof Function){
						delete chain.on;
						a.call(b, next);
						return chain;
					}
					if(arguments.length){
						queue.push([a,b,c,d]);
						return chain;
					}
					delete chain.on;
					var i = 0, l = queue.length; 
					for(; i < l; i++){
						on.apply(chain, queue[i]);
					}
					on = null;
					queue = [];
					return chain;
				}
				var queue = [], on = next.on = chain.on;
				chain.on = next;
				return next;
			}

			var ask = on.ask = function(cb, as){
				if(!ask.on){ ask.on = On.scope() }
				var id = opt.uuid();
				ask.on(id, cb, as);
				return id;
			}
			on.ack = function(at, reply){
				if(!at || !reply || !ask.on){ return }
				var id = at[opt.id] || at;
				ask.on(id, reply);
				return true;
			}

			on.on('event', function event(act){
				var last = act.on.last, tmp;
				if(last){
					if(last instanceof Array){
						act.fn.apply(act.as, last.concat(act));
					} else {
						act.fn.call(act.as, last, act);
					}
					return;
				}
				/*
				if(opt.chain !== act.tag){ return }
				if(!(tmp = act.ctx) || !(tmp = tmp.back) || !(last = tmp._)){ return }
				if(last.on){ tmp = last }
				tmp.on(opt.back, act.ctx);
				if(act.on.last){ event(act) } // for synchronous async actions.	
				*/	
			});

			on.on('emit', function(ev){
				ev.on.last = ev.arg;
				var ctx = ev.ctx, tmp, u;
				if(opt.back !== ev.tag){ return }
				if(!(ctx = ev.ctx)){ return }
				tmp = backward(ctx, opt.back);
				if(!tmp || ctx === tmp){ return }
				tmp.on(opt.back, ev.arg);
				ev.arg = u;
			});
			return proto;
		}

		function backward(scope, ev){ var tmp;
			if(!scope || !scope.on){ return }
			//if(scope.on('back').length){
			if((tmp = scope.ons) && (tmp = tmp[ev]) && tmp.s.length){
				return scope;
			}
			return backward((scope.back||backward)._, ev);
		}
		module.exports = Chain;
	})(module, './src/chain');

	;module(function(module){
		// Generic javascript scheduler utility.
		var Type = require('./type');
		function s(state, cb, time){ // maybe use lru-cache?
			s.time = time || Gun.time.is;
			s.waiting.push({when: state, event: cb || function(){}});
			if(s.soonest < state){ return }
			s.set(state);
		}
		s.waiting = [];
		s.soonest = Infinity;
		s.sort = Type.list.sort('when');
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
				if(wait.event instanceof Function){
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
			s.waiting = Type.list.map(s.waiting, s.each, ctx) || [];
			s.set(ctx.soonest);
		}
		module.exports = s;
	})(module, './src/schedule');

	;module(function(module){
		/* Based on the Hypothetical Amnesia Machine thought experiment */
		function HAM(machineState, incomingState, currentState, incomingValue, currentValue){
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
				if(Lexical(incomingValue) < Lexical(currentValue)){ // Lexical only works on simple value types!
					return {converge: true, current: true};
				}
				if(Lexical(currentValue) < Lexical(incomingValue)){ // Lexical only works on simple value types!
					return {converge: true, incoming: true};
				}
			}
			return {err: "you have not properly handled recursion through your data or filtered it as JSON"};
		}
		function Lexical(value){
			if(typeof value === 'string'){ // Text
				return 'aaaaa'+value;
			}
			if((value - parseFloat(value) + 1) >= 0){ // Numbers (JSON-able)
				return 'aaaa'+value;
			}
			if(true === value){ // Boolean
				return 'aaa';
			}
			if(false === value){ // Boolean
				return 'aa';
			}
			if(null === value){ // Null
				return 'a';
			}
			if(undefined === value){ // Undefined
				return '';
			}
			return ''; // Not supported
		}
		var undefined;
		module.exports = HAM;
	})(module, './src/HAM');

	;module(function(module){
		var Type = require('./type');
		var Val = {};
		Val.is = function(v){ // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
			var u;
			if(v === u){ return false }
			if(v === null){ return true } // "deletes", nulling out fields.
			if(v === Infinity){ return false } // we want this to be, but JSON does not support it, sad face.
			if(bi_is(v) // by "binary" we mean boolean.
			|| num_is(v)
			|| text_is(v)){ // by "text" we mean strings.
				return true; // simple values are valid.
			}
			return Val.rel.is(v) || false; // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
		}
		Val.rel = {_: '#'};
		;(function(){
			Val.rel.is = function(v){ // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
				if(v && !v._ && obj_is(v)){ // must be an object.
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
				if(f == _rel && text_is(s)){ // the field should be '#' and have a text value.
					o.id = s; // we found the soul!
				} else {
					return o.id = false; // if there exists anything else on the object that isn't the soul, then it is considered invalid.
				}
			}
		}());
		Val.rel.ify = function(t){ return obj_put({}, _rel, t) } // convert a soul into a relation and return it.
		var _rel = Val.rel._;
		var bi_is = Type.bi.is;
		var num_is = Type.num.is;
		var text_is = Type.text.is;
		var obj = Type.obj, obj_is = obj.is, obj_put = obj.put, obj_map = obj.map;
		module.exports = Val;
	})(module, './src/val');

	;module(function(module){
		var Type = require('./type');
		var Val = require('./val');
		var Node = {_: '_'};
		Node.soul = function(n, o){ return (n && n._ && n._[o || _soul]) } // convenience function to check to see if there is a soul on a node and return it.
		Node.soul.ify = function(n, o){ // put a soul on an object.
			o = (typeof o === 'string')? {soul: o} : o || {};
			n = n || {}; // make sure it exists.
			n._ = n._ || {}; // make sure meta exists.
			n._[_soul] = o.soul || n._[_soul] || text_random(); // put the soul on it.
			return n;
		}
		;(function(){
			Node.is = function(n, cb, o){ var s; // checks to see if an object is a valid node.
				if(!obj_is(n)){ return false } // must be an object.
				if(s = Node.soul(n)){ // must have a soul on it.
					return !obj_map(n, map, {o:o,n:n,cb:cb});
				}
				return false; // nope! This was not a valid node.
			}
			function map(v, f){ // we invert this because the way we check for this is via a negation.
				if(f === Node._){ return } // skip over the metadata.
				if(!Val.is(v)){ return true } // it is true that this is an invalid node.
				if(this.cb){ this.cb.call(this.o, v, f, this.n) } // optionally callback each field/value.
			}
		}());
		;(function(){
			Node.ify = function(obj, o, as){ // returns a node from a shallow object.
				if(!o){ o = {} }
				else if(typeof o === 'string'){ o = {soul: o} }
				else if(o instanceof Function){ o = {map: o} }
				if(o.node = o.map? o.map.call(as, obj) : Node.soul.ify(o.node || {}, o)){
					obj_map(obj, map, {opt:o,as:as});
				}
				return o.node; // This will only be a valid node if the object wasn't already deep!
			}
			function map(v, f){ var o = this.opt, tmp, u; // iterate over each field/value.
				if(o.map){
					tmp = o.map.call(this.as, v, ''+f, o.node);
					if(u !== tmp && o.node){ o.node[f] = tmp }
					return;
				}
				if(Val.is(v)){ 
					o.node[f] = v;
				}
			}
		}());
		var obj = Type.obj, obj_is = obj.is, obj_map = obj.map;
		var text = Type.text, text_random = text.random;
		var _soul = Val.rel._;
		module.exports = Node;
	})(module, './src/node');

	;module(function(module){
		var Type = require('./type');
		var Node = require('./node');
		function State(){
			var t = time();
			if(last < t){
				n = 0;
				return last = t;
			}
			return last = t + ((n += 1) / d);
		}
		State._ = '>';
		var time = Type.time.is, last = -Infinity, n = 0, d = 1000;
		State.ify = function(n, f, s){ // put a field's state on a node.
			if(!n || !n._){ return } // reject if it is not node-like.
			var tmp = obj_as(n._, State._); // grab the states data.
			if(num_is(s)){ tmp[f] = s } // add the valid state.
			return n;
		}
		State.is = function(n, f){ // convenience function to get the state on a field on a node and return it.
			var tmp = f && n && n._ && n._[State._];
			if(!tmp){ return }
			return num_is(tmp[f])? tmp[f] : -Infinity;
		}
		;(function(){
			State.map = function(cb, s, as){ var u; // for use with Node.ify
				var o = obj_is(o = cb || s)? o : null;
				cb = fn_is(cb = cb || s)? cb : null;
				if(o && !cb){
					s = num_is(s)? s : State();
					obj_map(o, map, {o:cb,s:s});
					return o;
				}
				as = as || obj_is(s)? s : u;
				s = num_is(s)? s : State();
				return function(v, f, o){
					State.ify(o, f, s);
					if(cb){
						cb.call(as, v, f, o);
					}
				}
			}
			function map(v,f){ State.ify(this.o, f, this.s) }
		}());
		var obj = Type.obj, obj_as = obj.as, obj_is = obj.is, obj_map = obj.map;
		var num = Type.num, num_is = num.is;
		var fn = Type.fn, fn_is = fn.is;
		module.exports = State;
	})(module, './src/state');

	;module(function(module){
		var Type = require('./type');
		var Val = require('./val');
		var Node = require('./node');
		var Graph = {};
		;(function(){
			Graph.is = function(g, cb, fn, as){ // checks to see if an object is a valid graph.
				if(!g || !obj_is(g) || obj_empty(g)){ return false } // must be an object.
				return !obj_map(g, map, {fn:fn,cb:cb,as:as}); // makes sure it wasn't an empty object.
			}
			function nf(fn){ // optional callback for each node.
				if(fn){ Node.is(nf.n, fn, nf.as) } // where we then have an optional callback for each field/value.
			}
			function map(n, s){ // we invert this because the way we check for this is via a negation.
				if(!n || s !== Node.soul(n) || !Node.is(n, this.fn)){ return true } // it is true that this is an invalid graph.
				if(!fn_is(this.cb)){ return }	
				nf.n = n; nf.as = this.as;	 
				this.cb.call(nf.as, n, s, nf);
			}
		}());
		;(function(){
			Graph.ify = function(obj, env, as){
				var at = {path: [], obj: obj};
				if(!env){
					env = {};
				} else 
				if(typeof env === 'string'){
					env = {soul: env};
				} else
				if(env instanceof Function){
					env.map = env;
				}
				if(env.soul){
					at.soul = env.soul;
				}
				env.graph = env.graph || {};
				env.seen = env.seen || [];
				env.as = env.as;
				node(env, at);
				env.root = at.node;
				return env.graph;
			}
			function node(env, at){ var tmp;
				if(tmp = seen(env, at)){ return tmp }
				/*if(tmp = Node.soul(at.obj)){ // TODO: You should probably delete this. Don't use it anymore. Maybe run one last test where a non-graphed document contains a graph and see if it has problems.
					env.graph[at.soul = tmp] = at.node = at.obj;
					return at;
				}*/
				if(Node.ify(at.obj, map, {env: env, at: at})){
					env.graph[at.soul = Node.soul(at.node)] = at.node;
				}
				return at;
			}
			function map(v,f,n){ 
				var env = this.env, at = this.at, is = Val.is(v), tmp;
				if(Node._ === f && obj_has(v,Val.rel._)){
					return; // TODO: Bug?
				}
				if(env.map){
					env.map(v,f,n);
				}
				if(!is && !obj_is(v)){
					if(tmp = env.invalid){
						v = tmp(v,f,n);
						if(!obj_is(v)){
							return v;
						}
					} else {
						env.err = "Invalid value at '" + at.path.concat(f).join('.') + "'!";
						return;
					}
				}
				if(!f){
					at.node = at.node || {};
					if(obj_has(v, Node._)){
						at.node._ = Gun.obj.copy(v._);
					}
					at.node = Node.soul.ify(at.node, at.soul);
					return at.node;
				}
				if(is){
					return v;
				}
				tmp = node(env, {obj: v, path: at.path.concat(f)});
				if(!tmp.node){ return }
				return {'#': Node.soul(tmp.node)};
			}
			function seen(env, at){
				var arr = env.seen, i = arr.length, has;
				while(i--){ has = arr[i];
					if(at.obj === has.obj){ return has }
				}
				arr.push(at);
			}
		}());
		Graph.node = function(node){
			var soul = Node.soul(node);
			if(!soul){ return }
			return obj_put({}, soul, node);
		}
		;(function(){
			Graph.to = function(graph, root, opt){
				if(!graph){ return }
				var obj = {};
				opt = opt || {seen: {}};
				obj_map(graph[root], map, {obj:obj, graph: graph, opt: opt});
				return obj;
			}
			function map(v,f){ var tmp, obj;
				if(Node._ === f){
					if(obj_empty(v, Val.rel._)){
						return;
					}
					this.obj[f] = obj_copy(v);
					return;
				}
				if(!(tmp = Val.rel.is(v))){
					this.obj[f] = v;
					return;
				}
				if(obj = this.opt.seen[tmp]){
					this.obj[f] = obj;
					return;
				}
				this.obj[f] = this.opt.seen[tmp] = Graph.to(this.graph, tmp, this.opt);
			}
		}());
		var fn_is = Type.fn.is;
		var obj = Type.obj, obj_is = obj.is, obj_del = obj.del, obj_has = obj.has, obj_empty = obj.empty, obj_put = obj.put, obj_map = obj.map, obj_copy = obj.copy;
		module.exports = Graph;
		/*setTimeout(function(){ // test
			var g = Graph.ify({
				you: {
					are: {
						very: 'right'
					}
				},
				my: 'lad'
			});
			console.log("GRAPH!", g);
		},1);*/
	})(module, './src/graph');


	;module(function(module){

		function Gun(o){
			if(!(this instanceof Gun)){ return Gun.create(o) }
			this._ = {gun: this};
		}

		Gun.create = function(o){
			return new Gun().opt(o);
		};

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

		Gun.version = 0.4;

		Gun.is = function(gun){ return (gun instanceof Gun) } // check to see if it is a GUN instance.

		var Type = require('./type');
		Type.obj.map(Type, function(v,f){
			Gun[f] = v;
		});
		Gun.HAM = require('./HAM');
		Gun.val = require('./val');
		Gun.node = require('./node');
		Gun.state = require('./state');
		Gun.graph = require('./graph');
		
		var opt = {chain: 'in', back: 'out', extend: 'root', id: Gun._.soul};
		Gun.chain = require('./chain')(Gun, opt);
		Gun.chain.chain.opt = opt;

		;(function(){

			Gun.chain.opt = function(opt){
				opt = opt || {};
				var gun = this, at = gun._, tmp, u;
				if(!at.root){ root(at) }
				tmp = at.opt = at.opt || {};
				if(text_is(opt)){ opt = {peers: opt} }
				else if(list_is(opt)){ opt = {peers: opt} }
				if(text_is(opt.peers)){ opt.peers = [opt.peers] }
				if(list_is(opt.peers)){ opt.peers = obj_map(opt.peers, function(n,f,m){m(n,{})}) }
				obj_map(opt, function map(v,f){
					if(obj_is(v)){
						tmp = tmp[f] || (tmp[f] = {}); // TODO: Bug? Be careful of falsey values getting overwritten?
						obj_map(v, map);
						return;
					}
					tmp[f] = v;
				});
				return gun;
			}
			function root(at){
				var gun = at.gun;
				at.root = gun;
				at.graph = {};
				gun.on('in', input, at);
				gun.on('out', output, at);
			}
			function output(at){
				var cat = this, gun = cat.gun, tmp;
				console.debug(7, 'out!', at, cat);
				if(at.put){
					cat.on('in', at);
				}
				if(!at.gun){
					at = Gun.obj.to(at, {gun: gun}); // TODO: BUG! Maybe we shouldn't do this yet since it will effect the redirected input stream?
				}
				if(at.put){ Gun.on('put', at) }
				if(at.get){ get(at, cat) }
				Gun.on('out', at);
				if(!cat.back){ return }
				cat.back.on('out', at);
			}
			function get(at, cat){
				var soul = at.get[_soul], node = cat.graph[soul], field = at.get[_field];
				if(node && (!field || obj_has(node, field))){
					cat.on('in', {
						put: Gun.graph.node(node), // TODO: BUG! Clone node!
						get: soul
					});
					return;
				}
				Gun.on('get', at);
			}
			function input(at){ var cat = this;
				if(!Gun.obj.is(at.put)){ return }
				if(cat.graph){
					Gun.obj.map(at.put, ham, {at: at, cat: this}); // all unions must happen first, sadly.
				}
				Gun.obj.map(at.put, map, {at: at, cat: this});
			}
			function ham(data, key){
				var cat = this.cat, graph = cat.graph;
				graph[key] = Gun.HAM.union(graph[key] || data, data) || graph[key];
			}
			function map(data, key){
				var cat = this.cat, graph = cat.graph, path = cat.path || {}, gun, at;
				if(!(gun = path[key])){ return }
				(at = gun._).change = data;
				if(graph){
					data = graph[key]; // TODO! BUG/PERF! COPY!?
				}
				at.put = data; // TODO: Should be merged! Even for non-root level items.
				gun.on('in',{
					put: data,
					get: key,
					gun: gun,
					via: this.at
				});
			}
		}());
		var text = Type.text, text_is = text.is, text_random = text.random;
		var list = Type.list, list_is = list.is;
		var obj = Type.obj, obj_is = obj.is, obj_has = obj.has, obj_map = obj.map;
		var _soul = Gun._.soul, _field = Gun._.field;

		console.debug = function(i, s){ return (console.debug.i && i === console.debug.i && console.debug.i++) && console.log.apply(console, arguments), s };

		Gun.log = function(){ return (!Gun.log.off && console.log.apply(console, arguments)), [].slice.call(arguments).join(' ') }
		Gun.log.once = function(w,s,o){ return (o = Gun.log.once)[w] = o[w] || 0, o[w]++ || Gun.log(s) }

		if(typeof window !== "undefined"){ window.Gun = Gun }
		module.exports = Gun;

		return;

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

	})(module, './src/gun');

	;module(function(module){

		var Gun = require('./gun');
		module.exports = Gun;

		;(function(){
			function meta(v,f){
				if(obj_has(Gun.__, f)){ return }
				obj_put(this._, f, v);
			}
			function map(value, field){
				if(Gun._.meta === field){ return }
				var node = this.node, vertex = this.vertex, union = this.union, machine = this.machine;
				var is = state_is(node, field), cs = state_is(vertex, field);
				if(u === is || u === cs){ return true } // it is true that this is an invalid HAM comparison.
				var iv = rel_is(value) || value, cv = rel_is(vertex[field]) || vertex[field];
				if(!val_is(iv) && u !== iv){ return true } // Undefined is okay since a value might not exist on both nodes. // it is true that this is an invalid HAM comparison.
				if(!val_is(cv) && u !== cv){ return true }  // Undefined is okay since a value might not exist on both nodes. // it is true that this is an invalid HAM comparison.
				var HAM = Gun.HAM(machine, is, cs, iv, cv);
				if(HAM.err){
					console.log(".!HYPOTHETICAL AMNESIA MACHINE ERR!.", HAM.err); // this error should never happen.
					return;
				}
				if(HAM.state || HAM.historical || HAM.current){ // TODO: BUG! Not implemented.
					//opt.lower(vertex, {field: field, value: value, state: is});
					return;
				}
				if(HAM.incoming){
					union[field] = value;
					state_ify(union, field, is);
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
			Gun.HAM.union = function(vertex, node, opt){
				if(!node || !vertex || !node._ || !vertex._){ return }
				opt = num_is(opt)? {machine: opt} : {machine: (+new Date)};
				opt.union = Gun.obj.copy(vertex);
				opt.vertex = vertex;
				opt.node = node;
				obj_map(node._, meta, opt.union);
				if(obj_map(node, map, opt)){ // if this returns true then something was invalid.
					return;
				}
				return opt.union;
			}
			var Type = Gun;
			var num = Type.num, num_is = num.is;
			var obj = Type.obj, obj_has = obj.has, obj_put = obj.put, obj_map = obj.map;
			var node = Gun.node, node_soul = node.soul, node_is = node.is, node_ify = node.ify;
			var state = Gun.state, state_is = state.is, state_ify = state.ify;
			var val = Gun.val, val_is = val.is, rel_is = val.rel.is;
			var u;
		}());

	})(module, './src/index');

	;module(function(module){
		var Gun = require('./index');
		var obj = Gun.obj, obj_is = obj.is, obj_put = obj.put, obj_map = obj.map, obj_empty = obj.empty;
		var num = Gun.num, num_is = num.is;
		var _soul = Gun.val.rel._, _field = '.';
		
		;(function(){ var obj = {}, u;
			Gun.chain.Back = function(n, opt){ var tmp;
				if(-1 === n || Infinity === n){
					return this._.root;
				}
				var gun = this, at = gun._;
				if(typeof n === 'string'){
					n = n.split('.');
				}
				if(n instanceof Array){
					var i = 0, l = n.length, tmp = at;
					for(i; i < l; i++){
						tmp = (tmp||obj)[n[i]];
					}
					if(u !== tmp){
						return opt? gun : tmp;
					} else
					if(tmp = at.back){
						return tmp.Back(n, opt);
					}
					return;
				}
			}
		}())

		;(function(){
			Gun.chain.puut = function(data, cb, opt){
				var gun = this, at = gun._, root = gun.Back(-1);
				if(at.err){ return gun }
				opt = opt || {};
				opt.gun = gun;
				opt.any = opt.any || cb;
				opt.data = opt.data || data;
				opt.state = opt.state || (gun.Back('opt.state') || Gun.state)();
				if(root !== at.back){
					opt.soul = opt.soul || Gun.node.soul(data);
					if(root === gun){
						opt.soul = opt.soul || (opt.uuid || gun.Back('opt.uuid') || Gun.text.random)();
					}
					if(opt.soul){
						gun = root.get(opt.soul).put(data, cb, opt);
					} else {
						gun.on(save, {as: opt});
						opt.next = Gun.on.next(gun);
					}
					return gun;
				} else
				if(!opt.soul){
					if(!(opt.init || gun.Back('opt.init'))){

					}
				}
				opt.soul = opt.soul || at.get || Gun.node.soul(data);
				console.debug(11, 'put', root === at.back, opt.soul);
				if(!opt.soul){
					EXPLODE;
				}
				if(!obj_is(data)){
					(cb||noop).call(gun, {err: Gun.log("No node exists to put ", (typeof data), '"' + data + '" in!')});
					return gun;
				}
				env = opt.env = Gun.state.map(map, opt.state);
				env.soul = opt.soul;
				Gun.graph.ify(data, env, opt);
				if(env.err){
					cb({err: Gun.log(env.err)});
					return gun;
				}
				if(opt.batch){
					opt.batch(env.graph);
					return gun;
				}
				return gun.on('out', {
					gun: gun, put: env.graph, opt: opt,
					'#': Gun.on.ask(function(ack, ev){ ev.off(); // One response is good enough for us currently. Later we may want to adjust this.
						if(!opt.any){ return }
						opt.any(ack.err, ack.ok);
					}, opt)
				});
			}
			Gun.chain.put = function(data, cb, opt){
				var gun = this, at = gun._, env, root, tmp;
				if(at.err){ return gun }
				if(!obj_is(data)){
					return path(gun, data, cb, opt);
				}
				opt = opt || {};
				opt.gun = gun;
				opt.any = opt.any || cb;
				opt.data = opt.data || data;
				opt.soul = opt.soul || Gun.node.soul(data);
				opt.state = opt.state || (gun.Back('opt.state') || Gun.state)();
				root = gun.Back(-1);
				if(!opt.soul){
					if(root === gun){
						opt.soul = (opt.uuid || gun.Back('opt.uuid') || Gun.text.random)();
					} else 
					if(at.get && root === at.back){
						if(!(opt.init || gun.Back('opt.init'))){
							opt.soul = at.get;
						}
					}
				}
				if(opt.soul){
					gun = root.get(opt.soul);
				} else {
					gun.on(save, {as: opt});
					opt.next = Gun.on.next(gun);
					return gun;
				}
				env = opt.env = Gun.state.map(map, opt.state); // TODO: Enforce states correctly! Something seemed to be lazy earlier.
				env.soul = opt.soul;
				Gun.graph.ify(data, env, opt);
				if(env.err){
					cb({err: Gun.log(env.err)});
					return gun;
				}
				return gun.on('out', {
					gun: gun, put: env.graph, opt: opt,
					'#': Gun.on.ask(function(ack, ev){ ev.off(); // One response is good enough for us currently. Later we may want to adjust this.
						if(!opt.any){ return }
						opt.any(ack.err, ack.ok);
					}, opt)
				});
			};
			function path(gun, data, cb, opt){
				var at = gun._, tmp;
				if(opt && opt.soul && at.get){
					return gun.Back(-1).get(opt.soul).put(obj_put({}, at.get, data), cb, opt).get(at.get, null, {path: true});
				}
				if(!at.get || !(tmp = at.back) || !tmp._.get){ // TODO: BUG! Won't this fail on a `gun.get('foo').map().put('yes')` or with a `path('boo')` between map and put?
					(cb||noop).call(gun, {err: Gun.log("No node exists to put ", (typeof data), '"' + data + '" in!')});
					return gun;
				}
				if(at.get){
					return at.back.put(obj_put({}, at.get, data), cb, opt).get(at.get, null, {path: true});
				}
			}
			function save(at, ev){ var cat = this;
			}
			function map(v,f,n){ var opt = this;
				if(!n){

				}
			}
			function link2(at, ev){ var opt = this;
				console.log('link2', at);
			}
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
				Gun.ify(data, end, {
					node: function(env, cb){ var eat = env.at;
						if(!cat.node){
							return cb(env, eat);
						}
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
								//console.log("What?", soul, f, eat.soul);
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

		;(function(){
			Gun.chain.get = function(lex, cb, opt){
				if(!opt || !opt.path){ var back = this.Back(-1); } // TODO: CHANGING API! Remove this line!
				var gun, back = back || this;
				var path = back._.path || empty, tmp;
				console.debug(1, 'get', lex);
				if(typeof lex === 'string'){
					if(!(gun = path[lex])){
						console.debug(2, 'get', lex);
						gun = cache(lex, back);
					}
				} else
				if(!lex && 0 != lex){
					(gun = back.chain())._.err = {err: Gun.log('Invalid get request!', lex)};
					if(cb){ cb.call(gun, gun._.err) }
					return gun;
				} else
				if(num_is(lex)){
					return back.get(''+lex, cb, opt);
				} else
				if(tmp = lex.soul){
					if(!(gun = path[tmp])){
						gun = cache(tmp, back);
					}
					if(tmp = lex.field){
						(opt = opt || {}).path = true;
						return gun.get(tmp, cb, opt);
					}
				} else
				if(tmp = lex[_soul]){
					if(!(gun = path[tmp])){
						gun = cache(tmp, back);
					}
					if(tmp = lex[_field]){
						(opt = opt || {}).path = true;
						return gun.get(tmp, cb, opt);
					}
				}
				if(cb && cb instanceof Function){
					(opt = opt || {}).any = cb;
					(opt.gun = opt.gun || gun).get.any(opt);
				}
				return gun;
			}
			function cache(key, back){
				var cat = back._, path = cat.path, gun = back.chain(), at = gun._;
				if(!path){ path = cat.path = {} }
				path[at.get = key] = gun;
				Gun.on('path', at);
				gun.on('in', input, at); // For 'in' if I add my own listeners to each then I MUST do it before in gets called. If I listen globally for all incoming data instead though, regardless of individual listeners, I can transform the data there and then as well.
				gun.on('out', output, at); // However for output, there isn't really the global option. I must listen by adding my own listener individually BEFORE this one is ever called.
				console.debug(3, 'cache', key);
				return gun;
			}
			function output(at){ 
				var cat = this, gun = cat.gun, root = gun.Back(-1), put, get, tmp;
				if((get = at.get)){
					at = Gun.obj.to(at, {});
					if(typeof get === 'string'){
						get = at.get = Gun.obj.put({}, (root === cat.back? _soul : _field), get);
					} else {
						if(root === cat.back){
							if(!get[_soul]){
								get[_soul] = cat.get; 
							}
						}
					}
				}
				console.debug(6, 'out', at, cat);
				cat.back.on('out', at);
			}
			function input(at, ev){ var cat = this, tmp;
				cat.put = at.put;
				if(Gun.val.is(cat.change = cat.change || at.put)){
					value.call(cat, at, ev);
					return;
				}
				if((tmp = cat.link) && (tmp = tmp.resume)){ // TODO: BUG!? Does this belong here or ABOVE the val.is check? I'm guessing here.
					tmp(cat); // TODO: BUG! What about via? Do we need to clone this?
				}
				Gun.obj.map(cat.change, map, {at: at, cat: this, put: at.put});
			}
			function map(data, key){ // Map over only the changes on every update.
				if(Gun._.meta === key){ return }
				var cat = this.cat, path = cat.path || {}, gun;
				if(!(gun = path[key])){ return }
				if(this.put){ data = this.put[key] || data } // But use the actual data.
				gun.on('in',{
					put: data,
					get: key,
					gun: gun,
					via: this.at
				});
			}
			function value(at, ev){
				var cat = this, rel = Gun.val.rel.is(cat.change), tmp, u;
				if(!rel || rel === cat.rel){ return }
				if(tmp = cat.link){
					if((tmp = tmp.opt) && (tmp = tmp.event)){
						tmp.off();
					}
					// TODO: BUG! PERF! If there are no other uses of cat.link.gun then we need to cat.link.gun.off() to clean it up from memory. This requires a system that knows how many things point to it though. Maybe `gun.off` should handle this logic using info in the @$ event?
				}
				cat.rel = rel;
				cat.change = u;
				cat.link = {opt: {change: true, as: cat}, resume: ev.stun(true)};
				cat.link.gun = cat.gun.Back(-1).get(rel).on(input, cat.link.opt); // TODO: BUG!? Don't use `gun.on` so that way get/put don't depend upon `.chain.on`?
			}
			Gun.chain.get.any = function(opt){
				if(!opt || !opt.any){ return }
				console.debug(4, 'any', opt);
				opt.gun.on('in', any, opt);
				console.debug(5, 'any ran', opt.ran);
				if(opt.ran){ return } // Useless if data is already known to be successful. We don't need to ask for anything.
				opt.gun.on('out', {
					gun: opt.gun, get: opt.gun._.get,
					'#': Gun.on.ask(ack, opt), 
				}) 
			}
			function any(at, ev){ var opt = this; opt.ran = true;
				console.debug(9, 'nothing', at);
				opt.any.call(at.gun || opt.gun, at.err, at.put, at.get, at, ev);
			}
			function ack(ack, ev){ var opt = this;
				any.call(opt, {err: ack.err, put: ack.put}, ev);
			}
			var empty = {}, u;
			var _soul = Gun._.soul, _field = Gun._.field;
		}());

		;(function(){
			Gun.chain.key = function(index, cb, opt){
				if(!index){
					if(cb){
						cb.call(this, {err: Gun.log('No key!')});
					}
					return this;
				}
				var gun = this;
				opt = opt || {};
				opt.key = index;
				opt.any = cb || function(){};
				opt.ref = gun.Back(-1).get(opt.key);
				opt.gun = opt.gun || gun;
				opt.next = Gun.on.next(opt.ref);
				gun.on(key, {as: opt});
				return gun;
			}
			function key(at, ev){ var opt = this;
				ev.off();
				opt.soul = Gun.node.soul(at.put);
				if(!opt.soul){ return }
				opt.data = obj_put({}, keyed._, 1);
				obj_put(opt.data, '#'+opt.soul+'#', Gun.val.rel.ify(opt.soul));
				opt.next(resume, opt);
			}
			function resume(next){ var opt = this;
				opt.ref.put(opt.data, opt.any, {soul: opt.key, key: opt.key});
				next();
			}
			function keyed(f){
				if(!f || !('#' === f[0] && '#' === f[f.length-1])){ return }
				var s = f.slice(1,-1);
				if(!s){ return }
				return s;
			}
			keyed._ = '##';
			Gun.on('path', function(at){
				var gun = at.gun;
				if(gun.Back(-1) !== at.back){ return }
				gun.on('in', pseudo, gun._);
				gun.on('out', normalize, gun._);
			});
			function normalize(at){ var cat = this;
				if(!at.put){
					if(at.get){
						search.call(cat, at);
					}
					return;
				}
				if(at.opt && at.opt.key){ return }
				var put = at.put;
				Gun.graph.is(put, function(node, soul){ // TODO: CLEAN ALL OF THIS UP!
					var key = {node: cat.gun.Back(-1)._.graph[soul]}, tmp;
					if(!obj_has(key.node, keyed._)){ return } // TODO: BUG! Should iterate over it anyways to check for non #soul# properties to port.
					Gun.node.is(key.node, function each(rel, s){
						if(!(s = keyed(s))){ return }
						var n = cat.gun.Back(-1)._.graph[s]; // TODO: BUG! Should we actually load the item or only use what is in memory?
						if(obj_has(n, keyed._)){
							Gun.node.is(n, each);
							return;
						}
						rel = put[s] = put[s] || Gun.node.soul.ify({}, s);
						Gun.node.is(node, function(v,f){
							rel[f] = v;
							Gun.state.ify(rel, f, Gun.state.is(node, f));
						});
						Gun.obj.del(put, soul);
					});
				});
			}
			function search(at){
				delete at.get[Gun._.field]; // TODO: BUG!? Meh?
			}
			function pseudo(at, e){ var cat = this;
				var change = cat.change;
				if(!change || !at.put){ return }
				if(!at.put[keyed._] && !cat.pseudo){ return }
				var soul = Gun.node.soul(at.put), resume = e.stun(resume), gun = cat.gun, seen = cat.seen || (cat.seen = {}), already = true, data;
				if(!cat.pseudo){
					cat.pseudo = Gun.node.ify({}, soul);
					cat.pseudo._.key = 'pseudo'; // TODO: CLEAN THIS UP!
					cat.pseudo._['>'] = {}; // TODO: CLEAN THIS UP!
					cat.put = cat.pseudo;
				}
				Gun.node.is(change, function(v, f){ var key;
					if(key = keyed(f)){
						if(seen[key]){ return }
						already = false;
						seen[key] = true; // TODO: Removing keys?
						cat.gun.Back(-1).get(key).on(on, true); // TODO: BUG! Perf! These are listeners that will become leaked! If we `gun.off()` on a pseudo we need to remember to also clean up these listeners.
						return;
					}
					if(keyed._ === f){ return }
					data = data || {_:{}};
					data[f] = v;
					Gun.state.ify(data, f, Gun.state.is(change, f));
				});
				function on(put){
					// TODO: PERF? Only use change!
					//put = this._.change || put;
					cat.pseudo = Gun.HAM.union(cat.pseudo, put) || cat.pseudo;
					cat.change = put;
					resume({
						put: cat.pseudo,
						get: soul
						//via: this.at
					});
				}
				if(!data){
					if(already){
						on(cat.pseudo);
					}
					return;
				}
				var graph = {};
				Gun.obj.map(seen, function(t,s){
					graph[s] = Gun.node.soul.ify(Gun.obj.copy(data), s);
				});
				cat.gun.Back(-1).on('in', {put: graph});
			}
			var obj = Gun.obj, obj_has = obj.has;
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
					gun.back = back; // TODO: API change!
				} else {
					gun = back.get(field[0], cb, opt);
				}
				return gun;
			}
			if(!field && 0 != field){
				return back;
			}
			return back.get(''+field, cb, opt);
		}

		;(function(){
			Gun.chain.chain.opt.on = function(cb, opt){
				if(!cb){ return this }
				var tmp;
				opt = (true === opt)? {change: 1} : opt || {};
				opt.gun = opt.gun || this;
				opt.ok = cb;
				opt.event = opt.gun._.on('in', ok, opt);
				if(opt.as && (tmp = opt.as.ons)){
					(tmp['@$'] || (tmp['@$'] = {s: []})).s.push(opt.event);
				}
				if(!opt.run){
					opt.gun._.on('out', obj_to(opt.gun._));
				}
				return this;
			}

			function ok(cat, ev){ var opt = this, data, tmp; opt.run = true;
				// TODO: BUG! Need to use at.put > cat.put for merged cache?
				if(!(data = cat.put) && !obj_has(cat, 'put')){ return } // TODO: what if cat.put is undefined? This shouldn't happen but might from how get's anything is coded.
				if(tmp = opt.change){
					if(1 === tmp){
						opt.change = true;
					} else {
						data = opt.gun._.change;
					}
				}
				if(opt.as){
					opt.ok.call(opt.as, cat, ev);
				} else {
					opt.ok.call(cat.gun || opt.gun, data, cat.get, cat, ev);
				}
			}

			Gun.chain.val = function(cb, opt){
				var gun = this, at = gun._, value = at.put;
				if(value || obj_has(at, 'put')){
					cb.call(gun, value, at.get);
					return gun;
				}
				if(cb){
					(opt = opt || {}).ok = cb;
					at.on(val, {as: opt}); // LOADS DATA // TODO: Have `.val` support an `opt.as` ability of its own?
				}
				return gun;
			}

			function val(cat, ev, to){ var opt = this;
				// TODO: BUG! Need to use at.put > cat.put for merged cache?
				var data = cat.put;
				if(!data && !obj_has(cat, 'put')){
					return;
				}
				clearTimeout(opt.to);
				if(!to){
					opt.to = setTimeout(function(){
						val.call(opt, cat, ev, opt.to || 1)
					}, opt.wait || 99);
					return;
				}
				ev.off();	
				opt.ok.call(cat.gun, data, cat.get); // TODO: BUG! opt.gun?
			}

			Gun.chain.off = function(){
				var gun = this, at = gun._, tmp;
				var back = at.back || {}, cat = back._;
				if(!cat){ return }
				if(tmp = cat.path){
					if(tmp[at.get]){
						obj_del(tmp, at.get);
					} else {
						obj_map(tmp, function(path, key){
							if(gun !== path){ return }
							obj_del(tmp, key);
						});
					}
				}
				if((tmp = gun.Back(-1)) === back){
					obj_del(tmp.graph, at.get);
				}
				if(at.ons && (tmp = at.ons['@$'])){
					obj_map(tmp.s, function(ev){
						ev.off();
					});
				}
				return gun;
			}
			var obj = Gun.obj, obj_has = obj.has, obj_del = obj.del, obj_to = obj.to;
		}());

		;(function(){
			Gun.chain.not = function(cb, opt, t){
				var gun = this, at = Gun.obj.to(gun._, {not: {not: cb}});
				at.on('in', ought, at);
				return gun;
			}
			function ought(cat, ev){ ev.off(); var at = this; // TODO: BUG! Is this correct?
				if(cat.err || cat.node){ return }
				if(!at.not || !at.not.not){ return }
				ev.stun(); // TODO: BUG? I think this is correct.
				at.not.not.call(at.gun, at.get.field || at.get.soul, function(){ console.log("Please report this bug on https://gitter.im/amark/gun and in the issues."); need.to.implement; });
			}
		}());
	})(module, './src/api');

}());


;(function(Tab){

	if(typeof window === 'undefined'){ return }
	if(!window.JSON){ throw new Error("Include JSON first: ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js") } // for old IE use
	Gun.tab = Tab;
	
	Tab.on = Gun.on;//Gun.on.create();

	;(function(){
		var module = function(cb){ return function(){ cb({exports:{}}) } };

		;module(function(module){
			var root, noop = function(){};
			if(typeof window !== 'undefined'){ root = window }
			var store = root.localStorage || {setItem: noop, removeItem: noop, getItem: noop};

			function put(at){ var err, id, opt;
				(opt = at.opt || {}).prefix = opt.prefix || 'gun/';
				Gun.graph.is(at.put, function(node, soul){
					try{store.setItem(opt.prefix + soul, Gun.text.ify(node));
					}catch(e){ err = e }
				});
				if(err){ explode }
				Gun.on.ack(at, {ok: 1}); // TODO: Reliability! Are we sure we want to have localStorage ack?
			}
			function get(at){
				var gun = at.gun, lex = at.get, soul, data, opt;
				(opt = at.opt || {}).prefix = opt.prefix || 'gun/';
				if(!lex || !(soul = lex[Gun._.soul])){ return }
				data = Gun.obj.ify(store.getItem(opt.prefix + soul) || null);
				if(!data){ return } // localStorage isn't trustworthy to say "not found".
				gun.Back(-1).on('in', {put: Gun.graph.node(data)});
			}
			Gun.on('put', put);
			Gun.on('get', get);
		})(module, './src/localStorage');

		;module(function(module){
			Gun.on('get', function(at){
				var peers = at.gun.Back('opt.peers');
				if(!peers || Gun.obj.empty(peers)){
					Gun.log.once('peers', "Warning! You have no peers to connect to!");
					console.debug(8, 'wsp not');
					Gun.on.ack(at, {});
					return;
				}
			});
		})(module, './src/WebSocket');
		return;
		function get(err, data, at){
			if(!data && !Gun.obj.empty(at.opt.peers)){ return } // let the peers handle no data.
			at.cb(err, data); // node
		}
		Gun.on('get', function(at){
			var opt = at.opt, lex = at.lex;
			Tab.store.get((opt.prefix || '') + lex.soul, get, at);
		});
	}());
	return;

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