//console.log("!!!!!!!!!!!!!!!! WARNING THIS IS GUN 0.5 !!!!!!!!!!!!!!!!!!!!!!");
;(function(){

	/* UNBUILD */
	var root;
	if(typeof window !== "undefined"){ root = window }
	if(typeof global !== "undefined"){ root = global }
	root = root || {};
	var console = root.console = root.console || {log: function(){}};
	function require(arg){
		return arg.slice? require[resolve(arg)] : function(mod, path){
			arg(mod = {exports: {}});
			require[resolve(path)] = mod.exports;
		}
		function resolve(path){
			return path.split('/').slice(-1).toString().replace('.js','');
		}
	}
	if(typeof module !== "undefined"){ var common = module }
	/* UNBUILD */

	;require(function(module){
		// Generic javascript utilities.
		var Type = {};
		//Type.fns = Type.fn = {is: function(fn){ return (!!fn && fn instanceof Function) }}
		Type.fns = Type.fn = {is: function(fn){ return (!!fn && 'function' == typeof fn) }}
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
			function empty(v,i){ var n = this.n;
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
			var keys = Object.keys;
			Type.obj.map = function(l, c, _){
				var u, i = 0, x, r, ll, lle, f = fn_is(c);
				t.r = null;
				if(keys && obj_is(l)){
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
	})(require, './type');
		
	;require(function(module){
		// On event emitter generic javascript utility.
		function Scope(){
			function On(tag, arg, as, eas, skip){
				var ctx = this, ons = ctx.ons || (ctx.ons = {}), on = ons[tag] || (ons[tag] = {s: []}), act, mem, O = On.ons;
				if(!arg){
					if(1 === arguments.length){ // Performance drops significantly even though `arguments.length` should be okay to use.
						return on;
					}
				}
				if(arg instanceof Function){
					(act = (as instanceof Act)? as : new Act(tag, arg, as, on, ctx)).tmp = {};
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
				var proxy;
				if(O && O.emit && ctx !== On){
					var ev = {tag: tag, arg: arg, on: on, ctx: ctx}, u;
					On.on('emit', ev);
					if(u === ev.arg){ return }
					arg = ev.arg;
					proxy = ev.proxy;
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
						act.fn.call(act.as, arg, proxy||act);
					} else {
						act.fn.apply(act.as, arg.concat(proxy||act));
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
					var still = [], i = 0, acts = on.s, l = acts.length; // in case the list has mutated since.
					for(; i < l; i++){ act = acts[i];
						if(noop !== act.fn){
							still.push(act);
						}
					}
					on.s = still;
					if(0 === still.length){
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
			if(!this.tmp){ this.tmp = {} }
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
		Act.chain.emit = function(arg){
			var act = this, arr = (arg instanceof Array);
			if(!arr){
				act.fn.call(act.as, arg, act);
			} else {
				act.fn.apply(act.as, arg.concat(act));
			}
		}
		function noop(){};
		module.exports = Scope();
	})(require, './on');

	;require(function(module){
		var On = require('./on');
		
		function Chain(create, opt){
			opt = opt || {};
			opt.id = opt.id || '#';
			opt.rid = opt.rid || '@';
			opt.uuid = opt.uuid || function(){
				return (+new Date()) + Math.random();
			};
			var on = On.scope();

			on.stun = function(chain){
				var stun = function(ev){
					if(stun.off && stun === this.stun){
						this.stun = null;
						return false;
					}
					if(on.stun.skip){
						return false;
					}
					if(ev){
						ev.cb = ev.fn;
						ev.off();
						res.queue.push(ev);
					}
					return true;
				}, res = stun.res = function(tmp, as){
					if(stun.off){ return }
					if(tmp instanceof Function){
						on.stun.skip = true;
						tmp.call(as);
						on.stun.skip = false;
						return;
					}
					stun.off = true;
					var i = 0, q = res.queue, l = q.length, act;
					res.queue = [];
					if(stun === at.stun){
						at.stun = null;
					}
					for(i; i < l; i++){ act = q[i];
						act.fn = act.cb;
						act.cb = null;
						on.stun.skip = true;
						act.ctx.on(act.tag, act.fn, act);
						on.stun.skip = false;
					}
				}, at = chain._;
				res.back = at.stun || (at.back||{_:{}})._.stun;
				if(res.back){
					res.back.next = stun;
				}
				res.queue = [];
				at.stun = stun; 
				return res;
			}

			var ask = on.ask = function(cb, as){
				if(!ask.on){ ask.on = On.scope() }
				var id = opt.uuid();
				if(cb){ ask.on(id, cb, as) }
				return id;
			}
			ask._ = opt.id;
			on.ack = function(at, reply){
				if(!at || !reply || !ask.on){ return }
				var id = at[opt.id] || at;
				ask.on(id, reply);
				return true;
			}
			on.ack._ = opt.rid;

			on.on('event', function event(act){
				var last = act.on.last, tmp;
				if('in' === act.tag && Gun.chain.get.input !== act.fn){ // TODO: BUG! Gun is not available in this module.
					if((tmp = act.ctx) && tmp.stun){
						if(tmp.stun(act)){
							return;
						}
					}
				}
				if(last){
					if(act.on.map){
						Gun.obj.map(act.on.map, function(v,f){ // TODO: BUG! Gun is not available in this module.
							//emit(v[0], act, event, v[1]); // below enables more control
							emit(v[1], act, event, v[2]);
						});
					} else {
						emit(last, act, event);
					}
					if(last !== act.on.last){
						event(act);
					}
				}
			});
			function emit(last, act, event, ev){
				if(last instanceof Array){
					act.fn.apply(act.as, last.concat(ev||act));
				} else {
					act.fn.call(act.as, last, ev||act);
				}
			}

			on.on('emit', function(ev){
				if(ev.on.map && ev.arg instanceof Array){
					/*
					ev.id = ev.id || Gun.text.random(6);
					ev.on.map[ev.id] = ev.arg;
					ev.proxy = ev.arg[1];
					ev.arg = ev.arg[0];
					*/ // below gives more control.
					ev.on.map[ev.arg[0]] = ev.arg;
					//ev.proxy = ev.arg[2];
					ev.arg = ev.arg[1];
				}
				ev.on.last = ev.arg;
			});
			return on;
		}
		module.exports = Chain;
	})(require, './onify');

	;require(function(module){
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
	})(require, './schedule');

	;require(function(module){
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
			// TODO: BUG! HAM should understand a relation (pointer) as a type as well.
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
	})(require, './HAM');

	;require(function(module){
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
	})(require, './val');

	;require(function(module){
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
				if(o.map){ o.node = o.map.call(as, obj, u, o.node || {}) }
				if(o.node = Node.soul.ify(o.node || {}, o)){
					obj_map(obj, map, {opt:o,as:as});
				}
				return o.node; // This will only be a valid node if the object wasn't already deep!
			}
			function map(v, f){ var o = this.opt, tmp, u; // iterate over each field/value.
				if(o.map){
					tmp = o.map.call(this.as, v, ''+f, o.node);
					if(u === tmp){
						obj_del(o.node, f);
					} else
					if(o.node){ o.node[f] = tmp }
					return;
				}
				if(Val.is(v)){ 
					o.node[f] = v;
				}
			}
		}());
		var obj = Type.obj, obj_is = obj.is, obj_del = obj.del, obj_map = obj.map;
		var text = Type.text, text_random = text.random;
		var _soul = Val.rel._;
		var u;
		module.exports = Node;
	})(require, './node');

	;require(function(module){
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
			if(!n || !n[N_]){ return } // reject if it is not node-like.
			var tmp = obj_as(n[N_], State._); // grab the states data.
			if(u !== f && num_is(s)){ tmp[f] = s } // add the valid state.
			return n;
		}
		State.is = function(n, f){ // convenience function to get the state on a field on a node and return it.
			var tmp = f && n && n[N_] && n[N_][State._];
			if(!tmp){ return }
			return num_is(tmp[f])? tmp[f] : -Infinity;
		}
		;(function(){
			State.map = function(cb, s, as){ var u; // for use with Node.ify
				var o = obj_is(o = cb || s)? o : null;
				cb = fn_is(cb = cb || s)? cb : null;
				if(o && !cb){
					s = num_is(s)? s : State();
					o[N_] = o[N_] || {};
					obj_map(o, map, {o:o,s:s});
					return o;
				}
				as = as || obj_is(s)? s : u;
				s = num_is(s)? s : State();
				return function(v, f, o, opt){
					if(!cb){
						map.call({o: o, s: s}, v,f);
						return v;
					}
					cb.call(as || this || {}, v, f, o, opt);
					if(obj_has(o,f) && u === o[f]){ return }
					map.call({o: o, s: s}, v,f);
				}
			}
			function map(v,f){
				if(N_ === f){ return }
				State.ify(this.o, f, this.s) ;
			}
		}());
		var obj = Type.obj, obj_as = obj.as, obj_has = obj.has, obj_is = obj.is, obj_map = obj.map;
		var num = Type.num, num_is = num.is;
		var fn = Type.fn, fn_is = fn.is;
		var N_ = Node._, u;
		module.exports = State;
	})(require, './state');

	;require(function(module){
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
					at.rel = Val.rel.ify(env.soul);
				}
				env.graph = env.graph || {};
				env.seen = env.seen || [];
				env.as = env.as || as;
				node(env, at);
				env.root = at.node;
				return env.graph;
			}
			function node(env, at){ var tmp;
				if(tmp = seen(env, at)){ return tmp }
				at.env = env;
				at.soul = soul;
				if(Node.ify(at.obj, map, at)){
					at.rel = at.rel || Val.rel.ify(Node.soul(at.node));
					env.graph[Val.rel.is(at.rel)] = at.node;
				}
				return at;
			}
			function map(v,f,n){
				var at = this, env = at.env, is, tmp;
				if(Node._ === f && obj_has(v,Val.rel._)){
					return n._; // TODO: Bug?
				}
				if(!(is = valid(v,f,n, at,env))){ return }
				if(!f){
					at.node = at.node || n || {};
					if(obj_has(v, Node._)){
						at.node._ = Gun.obj.copy(v._);
					}
					at.node = Node.soul.ify(at.node, Val.rel.is(at.rel));
				}
				if(tmp = env.map){
					tmp.call(env.as || {}, v,f,n, at);
					if(obj_has(n,f)){
						v = n[f];
						if(u === v){
							obj_del(n, f);
							return;
						}
						if(!(is = valid(v,f,n, at,env))){ return }
					}
				}
				if(!f){ return at.node }
				if(true === is){
					return v;
				}
				tmp = node(env, {obj: v, path: at.path.concat(f)});
				if(!tmp.node){ return }
				return tmp.rel; //{'#': Node.soul(tmp.node)};
			}
			function soul(id){ var at = this;
				var prev = Val.rel.is(at.rel), graph = at.env.graph;
				at.rel = at.rel || Val.rel.ify(id);
				at.rel[Val.rel._] = id;
				if(at.node && at.node[Node._]){
					at.node[Node._][Val.rel._] = id;
				}
				if(obj_has(graph, prev)){
					graph[id] = graph[prev];
					obj_del(graph, prev);
				}
			}
			function valid(v,f,n, at,env){ var tmp;
				if(Val.is(v)){ return true }
				if(obj_is(v)){ return 1 }
				if(tmp = env.invalid){
					v = tmp.call(env.as || {}, v,f,n);
					return valid(v,f,n, at,env);
				}
				env.err = "Invalid value at '" + at.path.concat(f).join('.') + "'!";
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
		var u;
		module.exports = Graph;
	})(require, './graph');


	;require(function(module){

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

		Gun.on = require('./onify')();

		Gun.chain = Gun.prototype;
		Gun.chain.toJSON = function(){};
		
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
				if(at.put){
					cat.on('in', obj_to(at, {'#': 0, gun: cat.gun}));
				}
				if(!at.gun){
					at = Gun.obj.to(at, {gun: gun});
				}
				if(at.put){ Gun.on('put', at) }
				if(at.get){ get(at, cat) }
				Gun.on('out', at);
				if(!cat.back){ return }
				cat.back.on('out', at);
			}
			function get(at, cat){
				var soul = at.get[_soul], node = cat.graph[soul], field = at.get[_field];
				console.debug(10, 'GET', soul, node, field);
				console.debug(2, 'GET', soul, node, field);
				if(node && (!field || obj_has(node, field))){
					if(field){
						node = Gun.obj.put({_: node._}, field, node[field]);
					}
					cat.on('in', {
						'@': at['#'],
						put: Gun.graph.node(node), // TODO: BUG! Clone node!
					});
					return;
				}
				Gun.on('get', at);
			}
			function input(at){ var cat = this;
				if(at.err || u === at.put){
					at.gun = at.gun || cat.gun;
					Gun.on.ack(at['@'], at);
					return;
				}
				if(cat.graph){
					Gun.obj.map(at.put, ham, {at: at, cat: cat}); // all unions must happen first, sadly.
				}
				console.debug(12, 'IN', at);
				console.debug(4, 'IN', at);
				Gun.obj.map(at.put, map, {at: at, cat: cat});
			}
			function ham(data, key){
				var cat = this.cat, graph = cat.graph;
				graph[key] = Gun.HAM.union(graph[key] || data, data) || graph[key];
			}
			function map(data, key){
				var cat = this.cat, graph = cat.graph, next = cat.next || (cat.next = {}), gun, at;
				gun = next[key] || (next[key] = cat.gun.get(key));
				(at = gun._).soul = key;
				at.change = data;
				if(graph){
					data = graph[key]; // TODO! BUG/PERF! COPY!?
				}
				at.put = data;
				gun.on('in', {
					put: data,
					get: key,
					gun: gun,
					via: this.at
				});
			}
		}());
		var text = Type.text, text_is = text.is, text_random = text.random;
		var list = Type.list, list_is = list.is;
		var obj = Type.obj, obj_is = obj.is, obj_has = obj.has, obj_to = obj.to, obj_map = obj.map;
		var _soul = Gun._.soul, _field = Gun._.field;
		var u;

		console.debug = function(i, s){ return (console.debug.i && i === console.debug.i && console.debug.i++) && (console.log.apply(console, arguments) || s) };

		Gun.log = function(){ return (!Gun.log.off && console.log.apply(console, arguments)), [].slice.call(arguments).join(' ') }
		Gun.log.once = function(w,s,o){ return (o = Gun.log.once)[w] = o[w] || 0, o[w]++ || Gun.log(s) }

		if(typeof window !== "undefined"){ window.Gun = Gun }
		if(typeof common !== "undefined"){ common.exports = Gun }
		module.exports = Gun;
	})(require, './gun');

	;require(function(module){

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
				







				// TODO: BUG! Need to compare relation to not relation, and choose the relation if there is a state conflict.








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
				opt.union = Gun.obj.copy(vertex); // TODO: PERF! This will slow things down!
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

	})(require, './index');

	;require(function(module){
		var Gun = require('./index');
		var obj = Gun.obj, obj_is = obj.is, obj_put = obj.put, obj_map = obj.map, obj_empty = obj.empty;
		var num = Gun.num, num_is = num.is;
		var _soul = Gun.val.rel._, _field = '.';
		
		;(function(){ var obj = {}, u;
			Gun.chain.Back = function(n, opt){ var tmp;
				if(-1 === n || Infinity === n){
					return this._.root;
				} else
				if(1 === n){
					return this._.back;
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
				if(n instanceof Function){
					var yes, tmp = {_:{back: gun}};
					while((tmp = tmp._) && (tmp = tmp.back) && !(yes = n(tmp, opt))){}
					return yes;
				}
			}
		}())

		;(function(){

			Gun.chain.put = function(data, cb, opt, as){
				// TODO: BUG! Put probably cannot handle plural chains!
				var gun = this, root = gun.Back(-1), tmp;
				opt = (opt && typeof opt === 'string')? {soul: opt} : opt || {};
				as = as || {opt: opt, soul: opt.soul};
				as.gun = gun;
				as.data = data;
				opt.any = opt.any || cb;
				if(root === gun || as.soul){
					if(!obj_is(as.data)){
						(opt.any||noop).call(opt.as || gun, as.out = {err: Gun.log("No field to put", (typeof as.data), '"' + as.data + '" on!')});
						if(as.res){ as.res() }
						return gun;
					}
					if(!as.soul){
						if(opt.init || as.gun.Back('opt.init')){
							return gun;
						}
					}
					as.gun = gun = root.get(as.soul = as.soul || (as.not = Gun.node.soul(as.data) || (opt.uuid || root.Back('opt.uuid') || Gun.text.random)()));
					as.ref = as.ref || as.gun;
					ify(as);
					return gun;
				}
				if(Gun.is(data)){
					data.any(function(e,d,k,at,ev){
						ev.off();
						var s = Gun.node.soul(d);
						if(!s){Gun.log("Can only save a node, not a property.");return}
						gun.put(Gun.val.rel.ify(s), cb, opt);
					});
					return gun;
				}
				as.ref = as.ref || (root === (tmp = gun.Back(1)))? gun : tmp;
				as.ref.any(any, {as: as, '.': null});
				if(!as.out){
					as.res = as.res || Gun.on.stun(as.ref);
					as.gun._.stun = as.ref._.stun;
				}
				return gun;
			};

			function ify(as){
				as.batch = batch;
				var opt = as.opt, env = as.env = Gun.state.map(map, opt.state);
				env.soul = as.soul;
				as.graph = Gun.graph.ify(as.data, env, as);
				if(env.err){
					(opt.any||noop).call(opt.as || as.gun, as.out = {err: Gun.log(env.err)});
					if(as.res){ as.res() }
					return;
				}
				as.batch();
			}

			function batch(){ var as = this;
				if(!as.graph || obj_map(as.stun, no)){ return }
				(as.res||iife)(function(){
					as.ref.on('out', {
						gun: as.ref, put: as.out = as.env.graph, opt: as.opt,
						'#': Gun.on.ask(function(ack, ev){ ev.off(); // One response is good enough for us currently. Later we may want to adjust this.
							if(!as.opt.any){ return }
							as.opt.any.call(as.opt.as || as.gun, ack.err, ack.ok);
						}, as.opt)
					});
				}, as);
				if(as.res){ as.res() }
			} function no(v,f){ if(v){ return true } }

			function map(v,f,n, at){ var as = this;
				if(f || !at.path.length){ return }
				(as.res||iife)(function(){
					var path = at.path, ref = as.ref, opt = as.opt;
					var i = 0, l = path.length;
					for(i; i < l; i++){
						ref = ref.get(path[i], null, {path: true}); // TODO: API change! We won't need 'path: true' anymore.
					}
					if(as.not || Gun.node.soul(at.obj)){
						at.soul(Gun.node.soul(at.obj) || (as.opt.uuid || as.gun.Back('opt.uuid') || Gun.text.random)());
						return;
					}
					(as.stun = as.stun || {})[path] = true;
					ref.any(soul, {as: {at: at, as: as}, '.': null});
				}, {as: as, at: at});
			}

			function soul(at, ev){ var as = this.as, cat = this.at;
				ev.stun(); // TODO: BUG!?
				ev.off();
				cat.soul(Gun.node.soul(cat.obj) || Gun.node.soul(at.put) || Gun.val.rel.is(at.put) || (as.opt.uuid || as.gun.Back('opt.uuid') || Gun.text.random)()); // TODO: BUG!? Do we really want the soul of the object given to us? Could that be dangerous?
				as.stun[cat.path] = false;
				as.batch();
			}

			function any(at, ev){ var as = this;
				if(at.err){ 
					console.log("Please report this as an issue! Put.any.err");
					return 
				}
				var cat = as.ref._, data = at.put, opt = as.opt, root, tmp;
				if(u === data){
					if(opt.init || as.gun.Back('opt.init')){
						return;
					}
					if(!at.get){
						if(!cat.get){
							return;
						}
						any.call(as, {
							put: as.data,
							get: as.not = as.soul = cat.get
						}, ev);
						return;
					}
					/*
						TODO: THIS WHOLE SECTION NEEDS TO BE CLEANED UP!
						Implicit behavior should be much cleaner. Right now it is hacky.
					*/
					// TODO: BUG!!!!!!! Apparently Gun.node.ify doesn't produce a valid HAM node?
					if(as.ref !== as.gun){ // TODO: CLEAN UP!!!!!
						tmp = as.gun._.get; // TODO: CLEAN UP!!!!!
						if(!tmp){ return } // TODO: CLEAN UP!!!!!
						as.data = obj_put({}, tmp, as.data);
						tmp = u;
					}
					function implicit(at){ // TODO: CLEAN UP!!!!!
						if(!at || !at.get){ return } // TODO: CLEAN UP!!!!!
						as.data = obj_put({}, tmp = at.get, as.data); // TODO: CLEAN UP!!!!!
						at = at.via; // TODO: CLEAN UP!!!!!
						if(!at){ return } // TODO: CLEAN UP!!!!!
						tmp = at.get; // TODO: CLEAN UP!!!!!
						if(!at.via || !at.via.get){ return } // TODO: CLEAN UP!!!!!
						implicit(at);  // TODO: CLEAN UP!!!!!
					} // TODO: CLEAN UP!!!!!
					if(as.gun.Back(-1) !== cat.back){
						implicit(at);
					}
					tmp = tmp || at.get;
					any.call(as, {
						put: as.data,
						get: as.not = as.soul = tmp
					}, ev);
					return;
				}
				ev.off(ev.stun());
				if(!as.not && !(as.soul = Gun.node.soul(data))){
					if(as.path && obj_is(as.data)){ // Apparently necessary
						as.soul = (opt.uuid || as.gun.Back('opt.uuid') || Gun.text.random)();
					} else {
						/*
							TODO: CLEAN UP! Is any of this necessary?
						*/
						if(!at.get){
							console.log("Please report this as an issue! Put.any.no.soul");
							return;
						}
						(as.next = as.next || Gun.on.next(as.ref))(function(next){
							// TODO: BUG! Maybe don't go back up 1 because .put already does that if ref isn't already specified?
							(root = as.ref.Back(1)).put(data = obj_put({}, at.get, as.data), opt.any, opt, {
								opt: opt,
								ref: root
							});
							//Gun.obj.to(opt, {
							//	ref: null,
							//	gun: null,
							//	next: null,
							//	data: data
							//}));
							//next(); // TODO: BUG! Needed? Not needed?
						});
						return;
					}
				}
				if(as.ref !== as.gun && !as.not){
					tmp = as.gun._.get;
					if(!tmp){
						console.log("Please report this as an issue! Put.no.get"); // TODO: BUG!??
						return;
					}
					as.data = obj_put({}, tmp, as.data);
				}
				as.ref.put(as.data, opt.any, opt, as);
			}
			var obj = Gun.obj, obj_has = obj.has, obj_put = obj.put;
			var u, empty = {}, noop = function(){}, iife = function(fn,as){fn.call(as||empty)};
		}());

		;(function(){

			Gun.chain.chain = function(){
				var chain = new this.constructor(), _;
				_ = chain._ || (chain._ = {});
				_.root = this._.root;
				_.back = this;
				Gun.on('chain', _);
				chain.on('in', input, _); // For 'in' if I add my own listeners to each then I MUST do it before in gets called. If I listen globally for all incoming data instead though, regardless of individual listeners, I can transform the data there and then as well.
				chain.on('out', output, _); // However for output, there isn't really the global option. I must listen by adding my own listener individually BEFORE this one is ever called.
				return chain;
			}

			Gun.chain.get = function(lex, cb, opt){
				if(!opt || !opt.path){ var back = this.Back(-1); } // TODO: CHANGING API! Remove this line!
				var gun, back = back || this, cat = back._;
				var next = cat.next || empty, tmp;
				if(typeof lex === 'string'){
					if(!(gun = next[lex])){
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
					if(!(gun = next[tmp])){
						gun = cache(tmp, back);
					}
					if(tmp = lex.field){
						(opt = opt || {}).path = true;
						return gun.get(tmp, cb, opt);
					}
				} else
				if(tmp = lex[_soul]){
					if(!(gun = next[tmp])){
						gun = cache(tmp, back);
					}
					if(tmp = lex[_field]){
						(opt = opt || {}).path = true;
						return gun.get(tmp, cb, opt);
					}
				}
				if(tmp = cat.stun){ // TODO: Refactor?
					gun._.stun = gun._.stun || tmp;
				}
				if(cb && cb instanceof Function){
					gun.any(cb, opt);
				}
				return gun;
			}
			function cache(key, back){
				var cat = back._, next = cat.next, gun = back.chain(), at = gun._;
				if(!next){ next = cat.next = {} }
				next[at.get = key] = gun;
				return gun;
			}
			function output(at){
				var cat = this, gun = cat.gun, root = gun.Back(-1), put, get, tmp;
				if(!at.gun){
					at.gun = gun;
				}
				if(get = at.get){
					if(!get[_soul]){
						if(obj_has(get, _field)){
							get = get[_field];
							if((cat.ask = cat.ask || {})[get || node_]){ return }
							cat.ask._ = cat.ask._ || {};
							if(get){ cat.ask[get] = cat.ask._['.'] = 1 }
							tmp = false;
							cat.on('in', function(tac, ev){
								tmp = true;
								if(u !== tac.put){
									input.call(cat, tac, ev);
									return;
								}
								// TODO: BUG! We want to query for it! So should still `input`. There should be no special case here.
								// Nots require some special treatment.
								at.gun.on('in', {
									get: get,
									gun: at.gun, 
									via: tac
								});
								return;
								var put = tac.put, rel = tac.put;
								if(!(rel = (Gun.node.soul(put) || Gun.val.rel.is(put)))){
									if(!get){ return }
									// Nots require some special treatment.
									at.gun.on('in', {
										get: get,
										gun: at.gun, 
										via: tac
									});
									return;
								}
								ask(cat, rel);
								tmp = true;
							}).off(); // TODO: BUG! This `.off()` is correct, but note that not doing it inside of the callback means that potentially inside of the callback will do/cause other work which might trigger the event listener synchronously before it can ever unsubscribe. The problem currently with having an unsubscribe inside is because there might be a `.map` that needs multiple things to be triggered. Although now that I have mentioned it the `ev.off()` inside for a map should only effect their own event, not the thing as a whole. Hmmm.
							if(tmp){ return }
							if(!cat.get){ return }
							if(root === cat.back){
								if(get){ cat.ask[get] = -1 }
								at.gun.on('out', {
									get: {'#': cat.get, '.': get},
									'#': Gun.on.ask(ack, at.gun),
									gun: at.gun
								});
								return;
							}
							cat.back.on('out', {
								get: obj_put({}, _field, cat.get),
								gun: gun
							});
							return;
						} else {
							if(cat.ask){ return }
							cat.ask = {_:{'*':1}};
							if(!cat.get){ return }
							if(root === cat.back){
								cat.ask._['*'] = -1;
								gun.on('out', {
									get: {'#': cat.get},
									'#': Gun.on.ask(ack, gun),
									gun: gun
								});
								return;
							}
							cat.back.on('out', {
								get: obj_put({}, _field, cat.get),
								gun: gun
							});
							return;
						}
					}
				}
				cat.back.on('out', at);
			}
			function input(at, ev){
				at = at._ || at;
				var cat = this, gun = at.gun, coat = gun._, change = coat.change, tmp;
				//coat.id = coat.id || Gun.text.random(5); // TODO: BUG! This allows for 1B item entropy in memory. In the future, people might want to expand this to be larger.
				if(!coat.soul && !coat.field && coat.back._.soul){ // TODO: PERF! Any faster/simpler/easier way we could do this?
					coat.field = coat.get;
				}
				if(at.via && (tmp = at.via['@'])){
					Gun.on.ack(tmp, at);
					if(at.err){ return }
				};
				console.debug(16, 'in', cat.get, change, Gun.obj.copy(cat.ask), cat.next, cat.on('in').s.slice());
				console.debug(13, 'in', cat.get, change, Gun.obj.copy(cat.ask), cat.next, cat.on('in').s.slice());
				console.debug(6, 'in', cat.get, change, Gun.obj.copy(cat.ask), cat.next);
				console.debug(5, 'in', cat.get, change, Gun.obj.copy(cat.ask), cat.next);
				if(value.call(cat, at, ev)){
					return;
				}
				obj_map(change, map, {at: at, cat: cat}); // Important because `values` sometimes `ask`s for things which changes what the `changes` are.
			}
			Gun.chain.get.input = input;
			function value(at, ev){
				var cat = this, gun = at.gun, put = at.put, coat = gun._, rel, tmp;
				if(u === at.put){
					not(cat, at);
					return true;
				}
				if(!(rel = Gun.val.rel.is(put))){
					if(cat.proxy){
						if(cat.proxy.it === at){
						console.debug(15, 'value', cat.get, put, cat.proxy, cat.proxy.it === at);
							ask(cat, Gun.node.soul(put), coat);
							console.debug(18, 'value', cat.get, put, cat.proxy, cat.on('in').s.slice());
							return true;
						} // TODO: PERF! Anyway to simplify this?
						if(cat.proxy.rel){
							cat.change = coat.change;
							cat.put = coat.put;
						}
						// TODO: BUG! This mutated `at` won't effect the original at that was sent via the poly-proxy approach. Meaning what is still cached in the poly-set is not this better/recent/fuller one.
						console.debug(17, 'value', cat.get, put, cat.proxy, cat.on('in').s.slice());
						console.debug(14, 'value', cat.get, put, cat.proxy, cat.proxy.it === at);
						cat.on('in', obj_to(at, cat.proxy.it = {get: cat.get || at.get}));
						console.debug(19, 'value', cat.get, put, cat.proxy);
					}
					if(Gun.val.is(put)){
						//ask(); // ask?
						not(cat, at);
						return true;
					}
					// iterables?
					if(!cat.proxy){
						ask(cat, rel || Gun.node.soul(put));
					}
					return;
				};
				if(coat.proxy && rel === coat.proxy.rel){
					coat.id = coat.id || Gun.text.random(6);
					ask(cat, rel, coat);
					if(cat === coat){
						cat.put = at.put = coat.proxy.ref._.put;
						// change?
					} else
					if(!cat.proxy || !cat.proxy[coat.id]){
						(cat.proxy = cat.proxy || {})[coat.id] = coat;
						cat.proxy.res = ev.stun(rel); // TODO: BUG! Race? Or this all goes to the same thing so it doesn't matter?
						cat.TAP = 1;
						coat.TAP = 2;
						gun.on('in', input, cat); // TODO: BUG! PERF! MEMORY LEAK!
					}
					return cat.put === coat.put? false : true;
				}
				if(cat !== coat){
					coat.id = coat.id || Gun.text.random(6); // TODO: BUG! REPEATS ABOVE
					if(!cat.proxy || !cat.proxy[coat.id]){ // TODO: BUG! REPEATS ABOVE
						(cat.proxy = cat.proxy || {})[coat.id] = coat;
						cat.proxy.res = ev.stun(rel);
				console.debug(7, 'values', cat.get, put, cat.proxy, coat.proxy, cat === coat);
						gun.on('in', input, cat);
					}
				}
				//not(cat, at);
				//coat.put = u; // this okay?
				tmp = coat.proxy = {rel: rel, ref: coat.root.get(rel)};
				tmp.ev = ev; tmp.res = ev.stun(rel); tmp.as = coat;
				tmp.ref.on('in', input, coat);
				console.debug(8, 'values', cat.get, put, cat.proxy, coat.proxy, cat === coat);
				// TODO: BUG, MAKE SURE NOT TO DO ASK IF ^ IS CACHED SINCE IT WILL ON ITS OWN END.
				ask(cat, rel, coat);
				return true;
			}
			function value2(at, ev){
				var cat = this, gun = at.gun, put = at.put, coat = gun._, rel, tmp;
				if(gun !== cat.gun){
					if(cat.link){
						cat.change = coat.change;
						cat.put = at.put;
						cat.link.res(at = obj_to(at, {get: cat.get}));
						if(cat !== cat.link.as){
						//if(!cat.link.as.back._.get){
							cat.link.as.on('in', at);
						}
						return;
					}
				}
				if(!(rel = Gun.val.rel.is(put))){
					if(Gun.val.is(put)){
						return true;
					}
					return;
				}
				if(coat.link && rel === coat.link.rel){
					if(gun !== cat.gun && Gun.val.rel.is(put) && obj_has(coat, 'put')){
						// TODO: BUG! at.gun does seem to be correct, BUT should it be changed AGAIN to the gun relation?
						at.put = coat.put;
						at.gun = coat.link.ref;
						// TODO: BUG!!!!! The `input` iterates off of `change` though. Right now it seemed to work, but in what cases is `change` not known for things like `.map` becuase it is purely dynamic?
						return;
					}
					return true;
				}
				tmp = coat.link = {rel: rel, ref: coat.root.get(rel)};//, res: ev.stun(rel), as: cat};
				tmp.res = ev.stun(rel); tmp.as = cat;
				tmp.sub = tmp.ref.on('in', input, coat);
				ask();
				return true;
			}
			function value1(at, ev){
				var gun = at.gun, coat = gun._, cat = this, put = at.put, tmp;
				if(u === put){
					not(cat, at);
					return true;
				}
				if(tmp = Gun.node.soul(put)){
					if(cat.root === cat.back){
						ask(cat, tmp);
						return;
					}
					if(coat.link && tmp === coat.link.rel){
						if(at.via && coat.back === at.via.gun){ // PERFORMANCE HACK! Prevent duplicate events.
							ev.stun(); // PERFORMANCE HACK! Prevent duplicate events.
							return true; // PERFORMANCE HACK! Prevent duplicate events.
						}
						ask(cat, tmp);
						if(cat !== coat){
							return;
						}
						coat.link.res(at);
						return;
					}
					put = Gun.val.rel.ify(tmp);
				}
				if(!(tmp = Gun.val.rel.is(put))){
					if(Gun.val.is(put)){
						not(cat, at);
						return true;
					}
					for(var i in put){tmp = true;break} // TODO: Meh? Is it iterable?
					if(tmp){
						return;
					}
					not(cat, at);
					return true;
				}
				coat.put = u;
				if(coat.link){
					if(coat.link.rel === tmp){
						tmp = coat.link.ref._;
						coat.change = tmp.change;
						at.put = tmp.put;
						coat.put = at.put;
						ev.stun();
						return true;
					}
					not(cat, at);
				}
				// gun.get('users').map().path('spouse').path('work').val(cb);
				tmp = coat.link = {rel: tmp, ref: coat.root.get(tmp), res: ev.stun(tmp), as: cat}; // TODO: BUG!? Which ones
				tmp.sub = tmp.ref._.on('in', proxy, tmp); // TODO: BUG! If somebody does `.off` how do we clean up these things from memory?
				if(tmp.off || tmp.ran){ // In case things are synchronous.
					return true;
				}
				ask(cat, tmp.rel);
				if(tmp.off || tmp.ran){ // And again, because ask might load data as well.
					return true;
				}
				tmp.res();
				return true;
			}
			function map(data, key){ // Map over only the changes on every update.
				if(node_ === key){ return }
				var cat = this.cat, next = cat.next || {}, via = this.at, gun, at, tmp;
				if(!(gun = next[key])){ return }
				at = gun._;
				if(tmp = Gun.val.rel.is(data)){
					if(at.link && tmp === at.link.rel){
						return;
					}
				}
				if(via.gun === cat.gun){
					at.change = data;
					at.put = data;
					gun.on('in', {
						put: data,
						get: key,
						gun: gun,
						via: via
					});
				} else {
					gun.on('in', {
						put: data,
						get: key,
						gun: via.gun.get(key, null, {path: true}), // TODO: path won't needed with 0.5
						via: via
					});
				}
			}
			function maps(data, key){ // Map over only the changes on every update.
				if(node_ === key){ return }
				var cat = this.cat, next = cat.next || {}, gun, at, tmp;
				if(!(gun = next[key])){ return }
				if(coat.put && obj_has(coat.put, key)){ data = coat.put[key] } // But use the actual data.
				//if((at = gun._).get){
					at = gun._;
					at.change = data;
					at.put = data;
					if(tmp = Gun.val.rel.is(at.put)){ // PERFORMANCE HACK!
						if((tmp = cat.root.get(tmp)._).put){ // PERFORMANCE HACK!
							at.change = tmp.change; // PERFORMANCE HACK!
							at.put = data = tmp.put; // PERFORMANCE HACK!
						}
					}
				//}
				gun.on('in', {//'@': this.at['@'],
					put: data,
					get: key,
					gun: gun,
					via: this.at
				});
			}
			function not(cat, at){
				//if(u !== at.put){ return }
				var ask = cat.ask, tmp = cat.proxy;
				cat.proxy = null;
				if(null === tmp){ return }
				if(tmp){
					if(tmp.sub){
						tmp.sub.off();
					}
					tmp.off = true;
				}
				obj_map(ask, function(state, key){
					if(key === node_){
						if(state['*']){
							state['*'] = 1;
						}
						if(state['.']){
							state['.'] = 1;
						}
					}
					if(!(state = (cat.next||empty)[key])){ return }
					ask[key] = 1;
					(tmp = state._).put = tmp.change = u;
					state.on('in', {
						get: key,
						put: u,
						gun: state, 
						via: at
					});
				});
			}
			function ask(cat, soul, at){
				if(at && !at.ask){ at.ask = {} } // TODO: BUG! Second time through? Or first time through and *?
				var ask = cat.ask, coat = at || cat, proxy = coat.ask || ask, lex, tmp;
				if(!ask || !soul || !ask._){ return }
				proxy._ = proxy._ || {};
				if(tmp = proxy._['*'] || ask._['*']){ // TODO! BUG! Should be proxy, right?
					if(0 <= tmp){
						proxy._['*'] = -1;
						tmp = cat.root.get(soul);
						console.debug(9, 'ask', Gun.obj.copy(ask), Gun.obj.copy(proxy));
						tmp.on('out', {
							get: {'#': soul},
							gun: tmp,
							'#': Gun.on.ask(ack, tmp)
						});
						return;
					}
				}
				if(0 >= proxy._['.'] && 0 >= ask._['.']){ return }
				proxy._['.'] = ask._['.'] = -1;
				obj_map(ask, function(state, key){
					state = proxy[key] || (proxy[key] = state);
					if(1 > state){ return }
					if(!(state = (cat.next||empty)[key])){ return }
					proxy[key] = -1;
					state.on('out', {
						get: {'#': soul, '.': key},
						gun: state,
						'#': Gun.on.ask(ack, state)
					});
				});
			}
			function proxy(at, ev){ var link = this; link.ran = true;
				if(link.off){ return ev.off() }
				var gun = at.gun, cat = gun._, as = link.as;
				as.change = cat.change;
				as.put = at.put;
				input.call(as, obj_to(at, {gun: as.gun, get: as.get}), ev);
			}
			Gun.chain.any = function(cb, opt){
				if(!cb){ return this }
				var opt = opt || {}, gun = opt.gun = this;
				if(opt.change){ opt.change = 1 }
				opt.any = cb;
				console.debug(1, 'any', gun._.get);
				return gun.on('in', any, opt).on('out', {get: opt});
			}
			function any(at, ev){ var opt = this;
				if(!at.gun){ console.log("Error: %%%%%%% No gun context! %%%%%%%") }
				var gun = at.gun, cat = gun._, data = at.put, tmp;
				if((tmp = data) && tmp[Gun.val.rel._] && (tmp = Gun.val.rel.is(tmp))){
					//console.log("ooooooooh jolllllly", data);
					if(null !== opt['.']){
						if(Gun.val.rel.is(cat.put)){
							cat.root.get(tmp).any(function(err,d,k,a,e){e.off()});
							return;
						}
					}
					at = obj_to(at, {put: data = cat.change = cat.put = cat.put || Gun.state.ify(Gun.node.ify({}, tmp))});
				}
				if(opt.change){
					tmp = (opt.changed = opt.changed||{})[cat.id];
					if(tmp){
						data = cat.change;
						at = obj_to(at, {put: data});
					}
					opt.changed[cat.id] = true; // TODO: BUG! MEMORY PERF! Any more efficient way than storing whether every single id has been seen before?
				}
				if(opt.as){
					opt.any.call(opt.as, at, ev);
				} else {
					opt.any.call(gun, at.err, data, at.get, at, ev);
				}
			}
			function ack(at, ev){ var gun = this;
				var cat = gun._;
				if(u !== cat.change){ return ev.off() }
				// TODO: PERF! Memory. If somebody `gun.off()` we should clean up these requests.
				// TODO: PERF! Memory. If peers only reply with `not` (or we never get replies) these event listeners will be left hanging - even if we get push updates that the data does exist.
				if(cat.root === cat.back){
					//at.gun = cat.gun;
					if(at.gun === cat.gun){ return }
					at = {
						get: cat.get,
						gun: cat.gun,
						via: at
					}
					
				} else {
					if(obj_has(at.put, cat.get)){ return ev.off() }
					at = {
						get: cat.get,
						gun: gun,
						via: at.via? at : {
							get: cat.back._.get,
							gun: cat.back,
							via: at
						}
					}
				}
				//at.get = at.get || cat.get;
				cat.on('in', at);
			}
			var obj = Gun.obj, obj_has = obj.has, obj_to = obj.to;
			var empty = {}, u;
			var _soul = Gun._.soul, _field = Gun._.field, node_ = Gun.node._, _sid = Gun.on.ask._, _rid = Gun.on.ack._;
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
				if(typeof opt === 'string'){
					console.log("Please report this as an issue! key.opt.string");
					return gun;
				}
				if(gun === gun._.root){if(cb){cb({err: Gun.log("Can't do that on root instance.")})};return gun}
				opt = opt || {};
				opt.key = index;
				opt.any = cb || function(){};
				opt.ref = gun.Back(-1).get(opt.key);
				opt.gun = opt.gun || gun;
				gun.on(key, {as: opt});
				if(!opt.data){
					opt.res = Gun.on.stun(opt.ref);
				}
				return gun;
			}
			function key(at, ev){ var opt = this;
				ev.off();
				opt.soul = Gun.node.soul(at.put);
				if(!opt.soul || opt.key === opt.soul){ return opt.data = {} }
				opt.data = obj_put({}, keyed._, Gun.node.ify(obj_put({}, opt.soul, Gun.val.rel.ify(opt.soul)), '#'+opt.key+'#'));
				(opt.res||iffe)(function(){
					opt.ref.put(opt.data, opt.any, {soul: opt.key, key: opt.key});				
				},opt);
				if(opt.res){
					opt.res();
				}
			}
			function iffe(fn,as){fn.call(as||{})}
			function keyed(f){
				if(!f || !('#' === f[0] && '#' === f[f.length-1])){ return }
				var s = f.slice(1,-1);
				if(!s){ return }
				return s;
			}
			keyed._ = '##';
			Gun.on('next', function(at){
				var gun = at.gun;
				if(gun.Back(-1) !== at.back){ return }
				gun.on('in', pseudo, gun._);
				gun.on('out', normalize, gun._);
			});
			function normalize(at){ var cat = this;
				if(!at.put){
					if(at.get){
						search.call(at.gun? at.gun._ : cat, at);
					}
					return;
				}
				if(at.opt && at.opt.key){ return }
				var put = at.put, graph = cat.gun.Back(-1)._.graph;
				Gun.graph.is(put, function(node, soul){
					if(!Gun.node.is(graph['#'+soul+'#'], function each(rel,id){
						if(id !== Gun.val.rel.is(rel)){ return }
						if(rel = graph['#'+id+'#']){
							Gun.node.is(rel, each);
							return;
						}
						Gun.node.soul.ify(rel = put[id] = Gun.obj.copy(node), id);
					})){ return }
					Gun.obj.del(put, soul);
				});
			}
			function search(at){ var cat = this;
				var tmp;
				if(!Gun.obj.is(tmp = at.get)){ return }
				if(!Gun.obj.has(tmp, '#')){ return }
				if((tmp = at.get) && (null === tmp['.'])){
					tmp['.'] = '##';
					return;
				}
				if((tmp = at.get) && Gun.obj.has(tmp, '.')){
					if(tmp['#']){
						cat = cat.gun.get(tmp['#'])._;
					}
					tmp = at['#'];
					at['#'] = Gun.on.ask(proxy);
				}
				var tried = {};
				function proxy(ack, ev){
					var put = ack.put, lex = at.get;
					if(!cat.pseudo || ack.via){ // TODO: BUG! MEMORY PERF! What about unsubscribing?
						//ev.off();
						//ack.via = ack.via || {};
						return Gun.on.ack(tmp, ack);
					}
					if(ack.put){
						if(!lex['.']){
							ev.off();
							return Gun.on.ack(tmp, ack);
						}
						if(obj_has(ack.put[lex['#']], lex['.'])){
							ev.off();
							return Gun.on.ack(tmp, ack);
						}
					}
					Gun.obj.map(cat.seen, function(ref,id){ // TODO: BUG! In-memory versus future?
						if(tried[id]){
							return Gun.on.ack(tmp, ack);
						}
						tried[id] = true;
						ref.on('out', {
							gun: ref,
							get: id = {'#': id, '.': at.get['.']},
							'#': Gun.on.ask(proxy)
						});
					});
				}
			}
			function pseudo(at, ev){ var cat = this;
				// TODO: BUG! Pseudo can't handle plurals!?
				if(cat.pseudo){
					//ev.stun();return;
					if(cat.pseudo === at.put){ return }
					ev.stun();
					cat.change = cat.changed || cat.pseudo;
					cat.on('in', Gun.obj.to(at, {put: cat.put = cat.pseudo}));
					return;
				}
				if(!at.put){ return }
				var rel = Gun.val.rel.is(at.put[keyed._]);
				if(!rel){ return }
				var soul = Gun.node.soul(at.put), resume = ev.stun(resume), root = cat.gun.Back(-1), seen = cat.seen = {};
				cat.pseudo = cat.put = Gun.state.ify(Gun.node.ify({}, soul));
				root.get(rel).on(each, {change: true});
				function each(change){
					Gun.node.is(change, map);
				}
				function map(rel, soul){
					if(soul !== Gun.val.rel.is(rel)){ return }
					if(seen[soul]){ return }
					seen[soul] = root.get(soul).on(on, true);
				}
				function on(put){
					if(!put){ return }
					cat.pseudo = Gun.HAM.union(cat.pseudo, put) || cat.pseudo;
					cat.change = cat.changed = put;
					cat.put = cat.pseudo;
					resume({
						gun: cat.gun,
						put: cat.pseudo,
						get: soul
						//via: this.at
					});
				}
			}
			var obj = Gun.obj, obj_has = obj.has;
		}());

		Gun.chain.path = function(field, cb, opt){
			var back = this, gun = back, tmp;
			opt = opt || {}; opt.path = true;
			if(gun === gun._.root){if(cb){cb({err: Gun.log("Can't do that on root instance.")})}return gun}
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
			Gun.chain.on = function(tag, arg, eas, as){
				var gun = this, at = gun._, tmp;
				if(!at.on){ at.on = Gun.on }
				if(typeof tag === 'string'){
					if(!arg){ return at.on(tag) }
					at.on(tag, arg, eas || at, as);
					return gun;
				}
				var opt = arg;
				opt = (true === opt)? {change: true} : opt || {}; 
				opt.ok = tag;
				opt.last = {};
				gun.any(ok, {as: opt, change: opt.change}); // TODO: PERF! Event listener leak!!!????
				return gun;
			}

			function ok(at, ev){ var opt = this;
				if(u === at.put){ return }
				var data = at.put, gun = at.gun, cat = gun._, tmp = opt.last, id = cat.id+at.get;
				opt.ok.toString().match('FOO') && console.log('WHAT!!?????????', cat.get, data);
				// DEDUPLICATE
				if(tmp.put === data && tmp.get === id){ return }
				tmp.put = data;
				tmp.get = id;
				// DEDUPLICATE
				cat.last = data;
				if(opt.as){
					opt.ok.call(opt.as, at, ev);
				} else {
					opt.ok.call(gun, data, at.get, at, ev);
				}
			}

			Gun.chain.val = function(cb, opt){
				var gun = this, at = gun._, value = at.put;
				if(!at.stun && u !== value){
					cb.call(gun, value, at.get);
					return gun;
				}
				if(cb){
					(opt = opt || {}).ok = cb;
					opt.cat = at;
					gun.any(val, {as: opt});
					opt.async = at.stun? 1 : true;
				}
				return gun;
			}

			function val(at, ev, to){ var opt = this;
				var cat = opt.cat, data = at.put;
				if(u === data){
					return;
				}
				if(ev.to){ clearTimeout(ev.to) }
				if(!to && (true === opt.async) && 0 !== opt.wait){
					ev.to = setTimeout(function(){
						val.call(opt, at, ev, ev.to || 1)
					}, opt.wait || 99);
					return;
				}
				ev.off();
				opt.ok.call(at.gun || opt.gun, data, at.get);
			}

			Gun.chain.off = function(){
				var gun = this, at = gun._, tmp;
				var back = at.back || {}, cat = back._;
				if(!cat){ return }
				if(tmp = cat.next){
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
			var val_rel_is = Gun.val.rel.is;
			var empty = {}, u;
		}());

		;(function(){
			Gun.chain.not = function(cb, opt, t){
				var gun = this, at = Gun.obj.to(gun._, {not: {not: cb}});
				gun.any(ought, {as: at});
				return gun;
			}
			function ought(cat, ev){ ev.off(); var at = this; // TODO: BUG! Is this correct?
				if(cat.err || cat.put){ return }
				if(!at.not || !at.not.not){ return }
				//ev.stun(); // TODO: BUG? I think this is correct. NOW INCORRECT because as things mutate we might want to retrigger!
				at.not.not.call(at.gun, at.get, function(){ console.log("Please report this bug on https://gitter.im/amark/gun and in the issues."); need.to.implement; });
			}
		}());

		;(function(){
			Gun.chain.map = function(cb, opt, t){
				var gun = this, cat = gun._, chain = cat.map;
				//cb = cb || function(){ return this } // TODO: API BREAKING CHANGE! 0.5 Will behave more like other people's usage of `map` where the passed callback is a transform function. By default though, if no callback is specified then it will use a transform function that returns the same thing it received.
				if(!chain){
					chain = cat.map = gun.chain();
					var list = (cat = chain._).list = cat.list || {};
					chain.on('in').map = {};
					if(opt !== false){
						gun.on(map, {change: true, as: cat});
					}
				}
				if(cb){
					chain.on(cb);
				}
				return chain;
			}
			function map(at,ev){
				var cat = this, gun = at.gun || this.back, tac = gun._;
				obj_map(at.put, each, {gun:gun, cat: cat, id: tac.id||at.get});
			}
			function each(v,f){
				if(n_ === f){ return }
				var gun = this.gun, cat = this.cat, id = this.id;
				if(cat.list[id+f]){ return }
				// TODO: BUG! Ghosting!
				return cat.on('in', [id+f, {gun: (cat.list[id+f] = gun.path(f)), get: f, put: v}]);
			}
			var obj_map = Gun.obj.map, noop = function(){}, event = {stun: noop, off: noop}, n_ = Gun.node._;
		}());

		;(function(){
			Gun.chain.init = function(){ // TODO: DEPRECATE?
				(this._.opt = this._.opt || {}).init = true;
				return this.Back(-1).put(Gun.node.ify({}, this._.get), null, this._.get);
			}
		}());

		;(function(){
			Gun.chain.set = function(item, cb, opt){
				var gun = this;
				cb = cb || function(){};
				return item.val(function(node){
					var put = {}, soul = Gun.node.soul(node);
					if(!soul){ return cb.call(gun, {err: Gun.log('Only a node can be linked! Not "' + node + '"!')}) }
					gun.put(Gun.obj.put(put, soul, Gun.val.rel.ify(soul)), cb, opt);
				});
			}
		}());
	})(require, './api');

	;require(function(module){
		if(typeof JSON === 'undefined'){ throw new Error("Include JSON first: ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js") } // for old IE use
		if(typeof Gun === 'undefined'){ return } // TODO: localStorage is Browser only. But it would be nice if it could somehow plugin into NodeJS compatible localStorage APIs?
		
		var root, noop = function(){};
		if(typeof window !== 'undefined'){ root = window }
		var store = root.localStorage || {setItem: noop, removeItem: noop, getItem: noop};

		function put(at){ var err, id, opt, root = at.gun._.root;
			(opt = at.opt || {}).prefix = opt.prefix || 'gun/';
			Gun.graph.is(at.put, function(node, soul){
				//try{store.setItem(opt.prefix + soul, Gun.text.ify(node));
				try{store.setItem(opt.prefix + soul, Gun.text.ify(root._.graph[soul]||node));
				}catch(e){ err = e || "localStorage failure" }
			});
			//console.log('@@@@@@@@@@local put!');
			Gun.on.ack(at, {err: err, ok: 0}); // TODO: Reliability! Are we sure we want to have localStorage ack?
		}
		function get(at){
			var gun = at.gun, lex = at.get, soul, data, opt, u;
			//setTimeout(function(){
			(opt = at.opt || {}).prefix = opt.prefix || 'gun/';
			if(!lex || !(soul = lex[Gun._.soul])){ return }
			data = Gun.obj.ify(store.getItem(opt.prefix + soul) || null);
			if(!data){ return } // localStorage isn't trustworthy to say "not found".
			if(Gun.obj.has(lex, '.')){var tmp = data[lex['.']];data = {_: data._};if(u !== tmp){data[lex['.']] = tmp}}
			//console.log('@@@@@@@@@@@@local get', data, at);
			console.debug(11, 'get local', data);
			console.debug(3, 'get local', data);
			gun.Back(-1).on('in', {'@': at['#'], put: Gun.graph.node(data)});
			//},100);
		}
		Gun.on('put', put);
		Gun.on('get', get);
	})(require, './adapters/localStorage');
	
	;require(function(module){
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
				if(!ws || !c){ return }
				if(ws.close instanceof Function){ ws.close() }
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
		r.each = function(obj, cb, as){
			if(!obj || !cb){ return }
			for(var i in obj){
				if(obj.hasOwnProperty(i)){
					cb.call(as, obj[i], i);
				}
			}
		}
		module.exports = r;
	})(require, './polyfill/request');

	;require(function(module){
		P.request = require('./request');
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
			P.request(url, msg, null, opt);
		}
		P.chain.send = function(msg, opt){
			P.request.each(this.peers, map, {msg: msg, opt: opt});
		}
		module.exports = P;
	})(require, './polyfill/peer');

	;require(function(module){
		if(typeof JSON === 'undefined'){ throw new Error("Include JSON first: ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js") } // for old IE use
		if(typeof Gun === 'undefined'){ return } // TODO: window.Websocket is Browser only. But it would be nice if it could somehow merge it with lib/WSP?
		
		var root, noop = function(){};
		if(typeof window !== 'undefined'){ root = window }

		var Tab = {};
		Tab.on = Gun.on;//Gun.on.create();
		Tab.peers = require('../polyfill/peer');
		Gun.on('get', function(at){
			var gun = at.gun, opt = gun.Back('opt') || {}, peers = opt.peers;
			if(!peers || Gun.obj.empty(peers)){
				//setTimeout(function(){
				Gun.log.once('peers', "Warning! You have no peers to connect to!");
				at.gun.Back(-1).on('in', {'@': at['#']});
				//},100);
				return;
			}
			var msg = {
				'#': at['#'] || Gun.text.random(9), // msg ID
				'$': at.get // msg BODY
			};
			Tab.on(msg['#'], function(err, data){ // TODO: ONE? PERF! Clear out listeners, maybe with setTimeout?
				if(data){
					at.gun.Back(-1).on('out', {'@': at['#'], err: err, put: data});
				} else {
					at.gun.Back(-1).on('in', {'@': at['#'], err: err, put: data});
				}
			});
			Tab.peers(peers).send(msg, {headers: {'gun-sid': Tab.server.sid}});
		});
		Gun.on('put', function(at){
			if(at['@']){ return }
			var opt = at.gun.Back('opt') || {}, peers = opt.peers;
			if(!peers || Gun.obj.empty(peers)){
				Gun.log.once('peers', "Warning! You have no peers to save to!");
				at.gun.Back(-1).on('in', {'@': at['#']});
				return;
			}
			if(false === opt.websocket || (at.opt && false === at.opt.websocket)){ return }
			var msg = {
				'#': at['#'] || Gun.text.random(9), // msg ID
				'$': at.put // msg BODY
			};
			Tab.on(msg['#'], function(err, ok){ // TODO: ONE? PERF! Clear out listeners, maybe with setTimeout?
				at.gun.Back(-1).on('in', {'@': at['#'], err: err, ok: ok});
			});
			Tab.peers(peers).send(msg, {headers: {'gun-sid': Tab.server.sid}});
		});
		// browser/client side Server!
		Gun.on('opt', function(at){ // TODO: BUG! Does not respect separate instances!!!
			if(Tab.server){ return }
			var gun = at.gun, server = Tab.server = {}, tmp;
			server.sid = Gun.text.random();
			Tab.peers.request.createServer(function(req, res){
				if(!req || !res || !req.body || !req.headers){ return }
				var msg = req.body;
				// AUTH for non-replies.
				if(server.msg(msg['#'])){ return }
				//server.on('network', Gun.obj.copy(req)); // Unless we have WebRTC, not needed.
				if(msg['@']){ // no need to process.
					if(Tab.ons[tmp = msg['@'] || msg['#']]){
						Tab.on(tmp, [msg['!'], msg['$']]);
					}
					return 
				}
				if(msg['$'] && msg['$']['#']){ return server.get(req, res) }
				else { return server.put(req, res) }
			});
			server.get = function(req, cb){
				var body = req.body, lex = body['$'], opt;
				var graph = gun._.root._.graph, node;
				if(!(node = graph[lex['#']])){ return } // Don't reply to data we don't have it in memory. TODO: Add localStorage?
				cb({body: {
					'#': server.msg(),
					'@': body['#'],
					'$': node
				}});
			}
			server.put = function(req, cb){
				var body = req.body, graph = body['$'];
				var __ = gun._.root._;
				if(!(graph = Gun.obj.map(graph, function(node, soul, map){ // filter out what we don't have in memory.
					if(!__.path[soul]){ return }
					map(soul, node);
				}))){ return }
				gun.on('out', {gun: gun, opt: {websocket: false}, put: graph, '#': Gun.on.ask(function(ack, ev){
					if(!ack){ return }
					ev.off();
					return cb({body: {
						'#': server.msg(),
						'@': body['#'],
						'$': ack,
						'!': ack.err
					}});
				})});
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

	})(require, './adapters/wsp');

}());