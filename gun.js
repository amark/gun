//console.log("!!!!!!!!!!!!!!!! WARNING THIS IS GUN 0.5 !!!!!!!!!!!!!!!!!!!!!!");
;(function(){

	/* UNBUILD */
	var root;
	if(typeof window !== "undefined"){ root = window }
	if(typeof global !== "undefined"){ root = global }
	root = root || {};
	var console = root.console || {log: function(){}};
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
					var still = [];
					for(i = 0; i < l; i++){ act = acts[i];
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
					/*
						TODO: BUG!
						TODO: BUG!
						TODO: BUG!
						TODO: BUG!
						TODO: BUG!
						Why does our map not get updates?
						Portions do if we do not use .key to save the initial data.
						Which makes me think it relates to pseudo, however it doesn't fully work if I get rid of that.
						Why why why? Probably something to do with map events and memoizing?
					*/
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

			on.stun = function(chain, fn, as){
				var res = function(n){
					if(1 === n){
						at.stun.skip = 1;
						return;
					}
					if(at.stun === stun){
						delete at.stun;
					}
					off = true;
					var i = 0, q = res.queue, l = q.length, c, v;
					for(i; i < l; i++){ v = q[i];
						c = v[0];
						v = v[1];
						c.on('in', v.get, v);
					}
				}, at = chain._, off, stun = at.stun = function(arg){
					if(off){
						delete this.stun;
						return false;
					}
					if(at.stun.skip){
						return at.stun.skip = false;
					}
					res.queue.push([this, arg]);
					return true;
				}
				res.queue = [];
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
				if(!ask.ons[id]){ return }
				ask.on(id, reply);
				return true;
			}
			on.ack._ = opt.rid;
			/*
			on.on('event', function event(act){
				var last = act.on.last, tmp;
				if(last){
					if(last instanceof Array){
						act.fn.apply(act.as, last.concat(act));
					} else {
						act.fn.call(act.as, last, act);
					}
					if(last !== act.on.last){
						event(act);
					}
					return;
				}
			});*/

			on.on('event', function event(act){
				var last = act.on.last, tmp;
				if(last){
					if(act.on.map){
						var map = act.on.map, v;
						for(var f in map){ v = map[f];
							if(v[1]){
								emit(v[1], act, event, v[2]);
							}
						}
						/*
						Gun.obj.map(act.on.map, function(v,f){ // TODO: BUG! Gun is not available in this module.
							//emit(v[0], act, event, v[1]); // below enables more control
							emit(v[1], act, event, v[2]);
						});
						*/
					} else {
						emit(last, act, event);
					}
					if(last !== act.on.last){
						event(act);
					}
					return;
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
				if(ev.on.map){
					/*
					ev.id = ev.id || Gun.text.random(6);
					ev.on.map[ev.id] = ev.arg;
					ev.proxy = ev.arg[1];
					ev.arg = ev.arg[0];
					*/ // below gives more control.
					ev.on.map[ev.arg[0]] = ev.arg;
					ev.proxy = ev.arg[2];
					ev.arg = ev.arg[1];
				}
				ev.on.last = ev.arg;
			});
			return on;
		}
		/*
		function backward(scope, ev){ var tmp;
			if(!scope || !scope.on){ return }
			//if(scope.on('back').length){
			if((tmp = scope.ons) && (tmp = tmp[ev]) && tmp.s.length){
				return scope;
			}
			return backward((scope.back||backward)._, ev);
		}
		*/
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
			if((machineState+1) < incomingState){ // It is important that we always +1 on the machine state, just to prevent any in-memory collisions on fast processors.
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
						at.node._ = obj_copy(v._);
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
			if(o instanceof Gun){ return this }
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

		/*
		var opt = {chain: 'in', back: 'out', extend: 'root', id: Gun._.soul};
		Gun.chain = require('./chain')(Gun, opt);
		Gun.chain.chain.opt = opt;
		*/
		(Gun.chain = Gun.prototype).chain = function(){
			var chain = new this.constructor(), _;
			_ = chain._ || (chain._ = {gun: chain});
			_.root = this._.root;
			_.back = this;
			return chain;
		}
		Gun.chain.toJSON = function(){};

		;(function(){

			Gun.chain.opt = function(opt){
				opt = opt || {};
				var peers = obj_is(opt) ? opt.peers : opt;
				if (text_is(peers)) {
					peers = [peers];
				}
				if (list_is(peers)) {
					peers = obj_map(peers, function (url, field, m) {
						m(url, {});
					});
				}
				if (!obj_is(opt)) {
					opt = {};
				}
				opt.peers = peers;
				var gun = this, at = gun._;
				at.root = at.root || gun;
				at.graph = at.graph || {};
				at.dedup = new Dedup();
				at.opt = at.opt || {};

				at.opt.peers = Gun.obj.to(at.opt.peers || {}, peers);
				Gun.obj.to(opt, at.opt);

				Gun.on('opt', at);
				if(!at.once){
					gun.on('in', input, at);
					gun.on('out', output, at);
				}
				at.once = true;
				return gun;
			}
			function output(at){
				var cat = this, gun = cat.gun, tmp;
				// TODO: BUG! Outgoing `get` to read from in memory!!!
				if(at.get && get(at, cat)){ return }
				//if(at.put){
					cat.on('in', obj_to(at, {gun: cat.gun})); // TODO: PERF! input now goes to output so it would be nice to reduce the circularity here for perf purposes.
				//}
				if(at['#']){
					cat.dedup.track(at['#']);
				}
				if(!at.gun){
					at = Gun.obj.to(at, {gun: gun});
				}
				//if(at.put){ Gun.on('put', at) }
				//if(at.get){ get(at, cat) }
				// Reads and writes both trigger output. // that should be intended.
				//if (at.put !== undefined || at.get !== undefined) {
					Gun.on('out', at);
				//}
				// Gun.on('out', at);
				//if(!cat.back){ return }
				//cat.back.on('out', at);
			}
			function get(at, cat){
				var soul = at.get[_soul], node = cat.graph[soul], field = at.get[_field];
				if(node && (!field || obj_has(node, field))){
					// TODO: BUG!!! Shouldn't this ack?????
					if(field){
						node = Gun.obj.put({_: node._}, field, node[field]);
					}
					cat.on('in', {
						'@': at['#'],
						put: Gun.graph.node(node) // TODO: BUG! Clone node!
					});
					return true;
				}
				//Gun.on('get', at);
			}
			function input(at){ var cat = this;
				if(!at.gun){ at.gun = cat.gun }
				if(!at['#'] && at['@']){
					at['#'] = Gun.text.random(); // TODO: Use what is used other places instead.
					Gun.on.ack(at['@'], at);
					cat.dedup.track(at['#']);
					cat.on('out', at);
					return;
				}
				if(at['#'] && cat.dedup.check(at['#'])){ return }
				cat.dedup.track(at['#']);
				Gun.on.ack(at['@'], at);
				if(at.put){
					if(cat.graph){
						Gun.obj.map(at.put, ham, {at: at, cat: this}); // all unions must happen first, sadly.
					}
					Gun.obj.map(at.put, map, {at: at, cat: this});
					//if(0 === at['@']){ return } // TODO: UNCLEAN! Temporary hack for now.
					Gun.on('put', at);
				}
				if(at.get){ Gun.on('get', at) }
				Gun.on('out', at);
			}
			function ham(data, key){
				var cat = this.cat, graph = cat.graph;
				graph[key] = Gun.HAM.union(graph[key] || data, data) || graph[key];
			}
			function map(data, key){
				var cat = this.cat, graph = cat.graph, path = cat.path || (cat.path = {}), gun, at;
				gun = path[key] || (path[key] = cat.gun.get(key));
				(at = gun._).change = data;
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
			function Dedup(){
				this.cache = {};
			}
			Dedup.prototype.track = function (id) {
				this.cache[id] = Gun.time.is();
				// Engage GC.
				if (!this.to) {
					this.gc();
				}
				return id;
			};
			Dedup.prototype.check = function(id){
				// Have we seen this ID recently?
				return Gun.obj.has(this.cache, id);
			}
			Dedup.prototype.gc = function(){
				var de = this;
				var now = Gun.time.is();
				var oldest = now;
				var maxAge = 5 * 60 * 1000;
				// TODO: Gun.scheduler already does this? Reuse that.
				Gun.obj.map(de.cache, function (time, id) {
					oldest = Math.min(now, time);

					if ((now - time) < maxAge) {
						return;
					}

					delete de.cache[id];
				});

				var done = Gun.obj.empty(de.cache);

				// Disengage GC.
				if (done) {
					de.to = null;
					return;
				}

				// Just how old?
				var elapsed = now - oldest;

				// How long before it's too old?
				var nextGC = maxAge - elapsed;

				// Schedule the next GC event.
				de.to = setTimeout(function(){ de.gc() }, nextGC);
			}
		}());
		var text = Type.text, text_is = text.is, text_random = text.random;
		var list = Type.list, list_is = list.is;
		var obj = Type.obj, obj_is = obj.is, obj_has = obj.has, obj_to = obj.to, obj_map = obj.map;
		var _soul = Gun._.soul, _field = Gun._.field;
		var u;

		console.debug = function(i, s){ return (console.debug.i && i === console.debug.i && console.debug.i++) && console.log.apply(console, arguments), s };

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
					as.gun._.stun = as.ref._.stun; // TODO: BUG! These stuns need to be attached all the way down, not just one level.
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
				as.ref.on('out', {
					gun: as.ref, put: as.out = as.env.graph, opt: as.opt,
					'#': Gun.on.ask(function(ack, ev){
						ev.off(); // One response is good enough for us currently. Later we may want to provide an option to adjust this.
						if(!as.opt.any){ return }
						as.opt.any.call(as.opt.as || as.gun, ack.err, ack.ok, ev);
					}, as.opt)
				});
				if(as.res){ as.res() }
			} function no(v,f){ if(v){ return true } }

			function map(v,f,n, at){ var as = this;
				if(f || !at.path.length){ return }
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
				if(as.res){
					as.res(1);
				}
				ref.any(soul, {as: {at: at, as: as}, '.': null});
			}

			function soul(at, ev){ var as = this.as, cat = this.at;
				ev.stun(); // TODO: BUG!?
				ev.off();
				cat.soul(Gun.node.soul(cat.obj) || Gun.node.soul(at.put) || Gun.val.rel.is(at.put) || (as.opt.uuid || as.gun.Back('opt.uuid') || Gun.text.random)()); // TODO: BUG!? Do we really want the soul of the object given to us? Could that be dangerous?
				as.stun[cat.path] = false;
				as.batch();
			}

			function any(at, ev){
				function implicit(at){ // TODO: CLEAN UP!!!!!
					if(!at || !at.get){ return } // TODO: CLEAN UP!!!!!
					as.data = obj_put({}, tmp = at.get, as.data); // TODO: CLEAN UP!!!!!
					at = at.via; // TODO: CLEAN UP!!!!!
					if(!at){ return } // TODO: CLEAN UP!!!!!
					tmp = at.get; // TODO: CLEAN UP!!!!!
					if(!at.via || !at.via.get){ return } // TODO: CLEAN UP!!!!!
					implicit(at);  // TODO: CLEAN UP!!!!!
				} // TODO: CLEAN UP!!!!!
				var as = this;
				if(at.err){
					console.log("Please report this as an issue! Put.any.err");
					return
				}
				var cat = as.ref._, data = at.put, opt = as.opt, root, tmp;
				if(u === data){
					if(opt.init || as.gun.Back('opt.init')){
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
			var u, noop = function(){};
		}());

		;(function(){
			Gun.chain.get = function(lex, cb, opt){
				if(!opt || !opt.path){ var back = this.Back(-1); } // TODO: CHANGING API! Remove this line!
				var gun, back = back || this, cat = back._;
				var path = cat.path || empty, tmp;
				if(typeof lex === 'string'){
					if(!(gun = path[lex])){
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
				if(tmp = cat.stun){
					gun._.stun = gun._.stun || tmp;
				}
				if(cb && cb instanceof Function){
					((opt = opt || {}).gun = opt.gun || gun).any(cb, opt);
				}
				return gun;
			}
			function cache(key, back){
				var cat = back._, path = cat.path, gun = back.chain(), at = gun._;
				if(!path){ path = cat.path = {} }
				path[at.get = key] = gun;
				at.stun = at.stun || cat.stun; // TODO: BUG! Clean up! This is kinda ugly. These need to be attached all the way down regardless of whether a gun chain has been cached or not for the first time.
				Gun.on('path', at);
				//gun.on('in', input, at); // For 'in' if I add my own listeners to each then I MUST do it before in gets called. If I listen globally for all incoming data instead though, regardless of individual listeners, I can transform the data there and then as well.
				gun.on('out', output, at); // However for output, there isn't really the global option. I must listen by adding my own listener individually BEFORE this one is ever called.
				return gun;
			}
			function output(at){
				var cat = this, gun = cat.gun, root = gun.Back(-1), put, get, tmp;
				if(!at.gun){
					at.gun = gun;
				}
				if(at.get && !at.get[_soul]){
					if(typeof at.get === 'string'){ // request for soul!
						if(cat.ask){
							if(cat.ask[at.get]){
								return;
							}
							cat.ask[at.get] = at['#'] || 1;
							cat.on('in', function(tac, ev){ ev.off();
								var tmp = tac.put;
								if(tmp && u !== tmp[at.get] && (tmp = (cat.path||empty)[at.get])){
									tmp = tmp._;
									tmp.change = tac.put[at.get];
									tmp.put = tac.put[at.get];
									// TODO: Could we pass it to input/map function since they already do this?
									tmp.on('in', {
										get: at.get,
										put: tac.put[at.get],
										gun: tmp.gun,
										via: tac
									})
									return;
								}
								if(!(tmp = Gun.node.soul(tmp = tac.put) || Gun.val.rel.is(tmp))){
									tmp = (cat.path||empty)[at.get];
									if(!tmp){ return }
									tmp.on('in', {get: at.get, gun:tmp, via: tac});
									return;
								}
								cat.ask[at.get] = 0;
								tmp = {'#': tmp, '.': at.get};
								tmp = {gun: at.gun, get: tmp};
								tmp['#'] = Gun.on.ask(ack, tmp);
								at.gun.on('out', tmp);
							}).off();
							return;
						}
						cat.ask = obj_put({}, at.get, at['#'] || 1);
						gun.on('in', input, cat);
						if(root === cat.back){
							cat.ask[at.get] = 0;
							tmp = {'#': cat.get, '.': at.get};
							tmp = {gun: at.gun, get: tmp};
							tmp['#'] = Gun.on.ask(ack, tmp);
							at.gun.on('out', tmp);
							return;
						}
						cat.back.on('out', {
							gun: cat.gun,
							get: cat.get
						});
						return;
					} else
					if(at.get instanceof Function){
						if(!cat.ask){
							var opt = at.opt || {};
							tmp = obj_has(opt, '.'); // TODO: CLEAN UP!
							cat.ask = tmp? {} : {_:1}; // TODO: CLEAN UP!
							gun.on('in', input, cat);
							if(root === cat.back){
								if(cat.ask && cat.ask._){ cat.ask._ = 0 } // TODO: CLEAN UP!
								if(tmp && opt['.']){ cat.ask[opt['.']] = 0 } // TODO: CLEAN UP!
								tmp = tmp? {'#': cat.get, '.': opt['.']} : {'#': cat.get}; // TODO: CLEAN UP!
								tmp = {gun: at.gun, get: tmp};
								tmp['#'] = Gun.on.ask(ack, tmp);
								cat.back.on('out', tmp);
							} else {
								cat.back.on('out', {
									gun: cat.gun,
									get: cat.get
								});
							}
						}
						if(cat.stun && cat.stun(at)){ return }
						gun.on('in', at.get, at);
						return;
					}
				}
				cat.back.on('out', at);
			}
			function input(at, ev){ var cat = this, tmp;
				cat.id = cat.id || Gun.text.random(5); // TOD: BUG! This allows for 1B item entropy in memory. In the future, people might want to expand this to be larger.
				if(at.err){
					console.log("Please report this as an issue! In.err"); // TODO: BUG!
					return;
				}
				if(value.call(cat, at, ev)){
					return;
				}
				if(tmp = cat.link){
					if(tmp = tmp.res){
						// TODO: BUG! Ordering of the change set? What if the proxied object has a change but the parent has a happened too. Pretend that the parent changed the field such that it no longer point to the proxy. But in the changeset it might get iterated over last, thus it the update will get triggered here now for the proxy, even though this update is suppose to unsubscribe itself. Or what if this ordering is inconsistent? Or is this just basically impossible from the API's put perspective?
						tmp(cat); // TODO: BUG! What about via? Do we need to clone this?
					}
				}
				obj_map(cat.change, map, {at: at, cat: cat});
			}
			Gun.chain.get.input = input;
			function value(at, ev){
				//var cat = this, is = (u === at.put) || Gun.val.is(at.put), rel = Gun.val.rel.is(at.put), tmp, u;
				var cat = this, put = cat.change, rel, tmp, u;
				if(u === put){
					not(cat, at);
					return true;
				}
				if(!cat.link && Gun.node.soul(put) && (rel = Gun.node.soul(at.put))){
					ask(cat, rel);
					return false;
				}
				if(!(rel = Gun.val.rel.is(put))){
					if(!Gun.val.is(put)){
						return false;
					}
					not(cat, at);
					return true;
				}
				//cat.change = at.put;
				if(cat.link){
					if(rel === cat.link.rel){
						ev.stun();
						tmp = cat.link.ref._;
						cat.change = tmp.change;
						cat.put = at.put = tmp.put; // TODO: BUG! Mutating at event? Needed for certain tests, but is this bad?
						return false;
					}
					not(cat, at);
				}
				tmp = ev.stun(tmp);
				//cat.put = u; // For performance sake, do this now to prevent `.val` from firing.
				tmp = cat.link = {rel: rel, ref: cat.gun.Back(-1).get(rel), res: tmp, as: cat};
				// TODO: BUG???? Below allows subscriptions to happen without the soul itself being subscribed. Will this cause problems? I think it should be okay. Not sure what test is necessary.
				tmp.sub = tmp.ref._.on('in', proxy, tmp); // TODO: BUG! If somebody does `.off` how do we clean up these things from memory?
				if(tmp.ran){ return }
				ask(cat, rel);
				if(!tmp.ran){
					tmp.res(); // This is necessary for things that listen for a soul or relation only.
				}
				return true;
			}
			function map(data, key){ // Map over only the changes on every update.
				if(Gun._.meta === key){ return }
				var cat = this.cat, path = cat.path || {}, gun, at, tmp;
				if(!(gun = path[key])){ return }
				if(cat.put && obj_has(cat.put, key)){ data = cat.put[key] } // But use the actual data.
				(at = gun._).change = cat.change[key];
				at.put = data;
				if(tmp = Gun.val.rel.is(at.put)){ // PERFORMANCE HACK!
					if(tmp = gun.Back(-1).get(tmp)._.put){ // PERFORMANCE HACK!
						at.put = data = tmp; // PERFORMANCE HACK!
					}
				}
				gun.on('in', {
					put: data,
					get: key,
					gun: gun,
					via: this.at
				});
			}
			function not(cat, at){
				var tmp, u;
				tmp = cat.link;
				if(u !== cat.put){ cat.link = null; } // TODO: BUG! This may mean `not` will be fired multiple times until data is found. Is this okay?
				if(null === tmp){ return }
				if(tmp){
					if(tmp.sub){
						tmp.sub.off();
					}
					tmp.sub = false;
				}
				obj_map(cat.ask, function(v,key){
					cat.ask[key] = 1;
					if(!(v = (cat.path||empty)[key])){ return }
					(tmp = v._).put = tmp.change = u;
					v.on('in', {get: key, put: u, gun: v, via: at});
				});
			}
			function ask(cat, soul){
				if(!cat.ask){ return }
				var tmp = cat.ask, lex;
				if(obj_has(tmp, '_')){
					if(!tmp._){ return }
					tmp._ = 0;
					lex = {gun: cat.gun, get: {'#': soul}};
					lex['#'] = Gun.on.ask(ack, lex);
					cat.gun.on('out', lex);
					return;
				}
				// TODO: PERF! Make it so we do not have to iterate through this every time?
				obj_map(tmp, function(v,key){
					if(!v || (cat.put && cat.put[key])){ return } // TODO: This seems like an optimization? But does it have side effects? Probably not without the tmp[key] = 0;
					if(!(v = (cat.path||empty)[key])){ return }
					tmp[key] = 0;
					lex = {gun: v, get: {'#': soul, '.': key}};
					lex['#'] = Gun.on.ask(ack, lex);
					v.on('out', lex);
				});
			}
			function proxy(at, ev){ var link = this;
				link.ran = true;
				if(false === link.sub){ return ev.off() } // will this auto clean itself up?
				link.as.change = link.ref._.change;
				link.as.put = at.put;
				input.call(link.as, at, ev); // TODO: BUG! What about via? Do we need to clone this?
			}
			Gun.chain.any = function(any, opt){
				if(!any){ return this }
				var chain = this, cat = chain._, opt = opt || {}, last = {};//function(){};
				if(opt.change){ opt.change = 1 }
				chain.on('out', {get: function(at, ev){
						//console.log("any!", at);
						if(!at.gun){ console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%EXPLODE%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%', at) }
						var gun = at.gun || chain, cat = gun._;
						var data = cat.put || at.put, tmp;
						if((tmp = at.put) && tmp[Gun.val.rel._] && (tmp = Gun.val.rel.is(tmp))){
							if(null !== opt['.']){
								return;
							}
							at = obj_to(at, {put: data = cat.change = cat.put = Gun.state.ify(Gun.node.ify({}, tmp))});
						}
						// TODO: BUG! Need to use at.put > cat.put for merged cache?
						if(tmp = opt.change){ // TODO: BUG! Opt is outer scope, gun/cat/data might be iterative and thus only inner scope? Aka, we can't use it for all of them.
							if(1 === tmp){
								opt.change = true;
							} else {
								data = cat.change;
								at = obj_to(at, {put: data});
							}
						}
						var id = cat.id+at.get;
						/*
						if(last[id] == data && obj_has(last, id)){ return }
						last[id] = data; // TODO: PERF! Memory optimizaiton? Can we avoid this.
						*/

						if(last.put === data && last.get === id){ return }
						last.get = id;
						last.put = data;

						cat.last = data;
						if(opt.as){
							any.call(opt.as, at, ev);
						} else {
							any.call(gun, at.err, data, at.get, cat, ev);
						}
					}, opt: opt
				});
				return chain;
			}
			function ack(at, ev){ var lex = this.get, chain = this.gun;
				var s = lex['#'], f = lex['.'], root = at.gun.Back(-1), gun = root.get(s), tmp;
				if(tmp = at.put){
					if(!f || obj_has(tmp[s], f)){
						ev.off();
						//at['@'] = 0;
						//at['#'] = 0;
						return root.on('in', at);
					}
					/*
					if(!tmp[s] && !obj_empty(tmp)){ // TODO: BUG! Seems like it just causes unnecessary data/event to be triggered. Nothing genuinely useful.
						ev.off(); // TODO: BUG!? It isn't matching data by lex means, but it IS a reply?
						at['@'] = 0;
						return root.on('in', at);
					}
					*/
					if(f && gun._.put){
						gun = gun.get(f, null, {path:true});
						if(!chain){
							console.log("Please report this as an issue! ack.chain");
							return;
						}
						chain.on('in', {
							err: at.err,
							get: f,
							gun: chain,
							via: {get:s,via:at}
						});
						return;
					}
				}
				if(gun._.put && !(null === f)){
					gun = gun.get(f, null, {path:true});
					gun.on('in', {
						err: at.err,
						get: f,
						gun: gun,
						via: {get:s,via:at}
					});
					return;
				}
				gun.on('in', {
					err: at.err,
					put: at.put? at.put[s] || at.put : at.put,
					get: s,
					gun: gun,
					via: at
				});
			}

			function ackk(at, ev){ var gun = this.gun;
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
						via: at,
						put: at.put[cat.get]
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
			var _soul = Gun._.soul, _field = Gun._.field, _sid = Gun.on.ask._, _rid = Gun.on.ack._;
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
				opt.data = obj_put({}, keyed._, Gun.node.ify(obj_put({}, opt.soul, Gun.val.rel.ify(opt.soul)), '#'+opt.key+'#'))
				if(opt.res){
					opt.res(1);
				}
				opt.ref.put(opt.data, opt.any, {soul: opt.key, key: opt.key});
				if(opt.res){
					opt.res();
				}
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
				if(!Gun.obj.is(at.get)){ return }
				if(cat.pseudo){

				}
				if((tmp = at.opt) && (null === tmp['.'])){
					tmp['.'] = '##';
					return;
				}
				if((tmp = at.get) && Gun.obj.has(tmp, '.')){
					tmp = at['#'];
					at['#'] = Gun.on.ask(proxy);
				}
				var tried = {};
				function proxy(ack, ev){
					ev.off();
					var put = ack.put, lex = at.get;
					if(!cat.pseudo){ return Gun.on.ack(tmp, ack) }
					if(ack.put){
						if(!lex['.']){
							return Gun.on.ack(tmp, ack);
						}
						if(obj_has(ack.put[lex['#']], lex['.'])){
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
				if(cat.pseudo){
					ev.stun();
					if(cat.pseudo === at.put){ return }
					cat.change = cat.changed || cat.pseudo;
					cat.on('in', Gun.obj.to(at, {put: cat.put = cat.pseudo}));
					return;
				}
				if(!at.put){ return }
				var rel = Gun.val.rel.is(at.put[keyed._]);
				if(!rel){ return }
				var soul = Gun.node.soul(at.put), resume = ev.stun(resume), root = cat.gun.Back(-1), seen = cat.seen = {};
				cat.pseudo = cat.put = Gun.state.ify(Gun.node.ify({}, soul));
				root.get(rel).on(each, true);
				function each(change){
					Gun.node.is(change, map);
				}
				function map(rel, soul){
					if(soul !== Gun.val.rel.is(rel)){ return }
					if(seen[soul]){ return }
					seen[soul] = root.get(soul).on(on, true);
				}
				function on(put){
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
					gun = back.get(field, cb, opt);
					gun._.opt = opt;
					return gun;
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
				gun._.opt = opt;
				return gun;
			}
			if(!field && 0 != field){
				return back;
			}
			gun = back.get(''+field, cb, opt);
			gun._.opt = opt;
			return gun;
		}

		;(function(){
			Gun.chain.on = function(tag, arg, eas, as){
				var gun = this, at = gun._, tmp, act, off;
				if(!at.on){ at.on = Gun.on }
				if(typeof tag === 'string'){
					if(!arg){ return at.on(tag) }
					act = at.on(tag, arg, eas || at, as);
					off = function() {
						if (act && act.off) act.off();
						off.off();
					};
					off.off = gun.off.bind(gun) || noop;
					gun.off = off;
					return gun;
				}
				var opt = arg;
				opt = (true === opt)? {change: true} : opt || {};
				opt.ok = tag;
				gun.any(ok, {as: opt, change: opt.change}); // TODO: PERF! Event listener leak!!!????
				return gun;
			}

			function ok(cat, ev){ var opt = this;
				var data = cat.put, tmp;
				// TODO: BUG! Need to use at.put > cat.put for merged cache?
				if(u === data){ return }
				if(opt.as){
					//console.log("BANANA CREAM PIE", opt);
					opt.ok.call(opt.as, cat, ev);
				} else {
					//console.log("HICADOO DAAH", cat, opt);
					opt.ok.call(cat.gun, data, cat.get, cat, ev);
				}
			}

					//if(obj_empty(value, Gun._.meta) && !(opt && opt.empty)){ // TODO: PERF! Deprecate!???

					//} else {
						//console.log("value", value);
						//if(!(value||empty)['#']/* || !val_rel_is(value)*/){ // TODO: Performance hit!???? // TODO: BUG! WE should avoid this. So that way it is usable with gun plugin chains.
							//cb.call(gun, value, at.get); // TODO: BUG! What about stun?
							//return gun;
						//}
					//}

			// TODO: BUG! What about stun?
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
					opt.async = true;
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
				opt.ok.call(at.gun || opt.gun, data, at.get); // TODO: BUG! opt.gun?
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
				var gun = this, cat = gun._, chain = cat.map, ons = [], act, off;
				if(!chain){
					chain = cat.map = gun.chain();
					var list = (cat = chain._).list = cat.list || {};
					(ons[ons.length] = chain.on('in')).map = {};
					ons[ons.length] = chain.on('out', function(at){
				 		if(at.get instanceof Function){
							ons[ons.length] = chain.on('in', at.get, at);
							return;
						} else {
							ons[ons.length] = chain.on('in', gun.get.input, at.gun._);
						}
					});
					if(opt !== false){
						ons[ons.length] = gun.on(map, {change: true, as: cat});
					}
				}
				if(cb){
					ons[ons.length] = chain.on(cb);
				}
				off = function() {
					while (ons.length) {
						act = ons.pop();
						if (act && act.off) act.off();
					}
					return off.off();
				};
				off.off = chain.off.bind(chain) || noop;
				chain.off = off;
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
				cat.list[id+f] = gun.path(f).on(function(v,f,a,ev){
					//cat.on('in',[{gun:this,get:f,put:v},ev]);
					cat.on('in',[id+f,{gun:this,get:f,put:v},ev]);
				});
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
				var gun = this, soul;
				cb = cb || function(){};
				if (soul = Gun.node.soul(item)) return gun.set(gun.get(soul), cb, opt);
				if (Gun.obj.is(item) && !Gun.is(item)) return gun.set(gun._.root.put(item), cb, opt);
				return item.val(function(node){
					var put = {}, soul = Gun.node.soul(node);
					if(!soul){ return cb.call(gun, {err: Gun.log('Only a node can be linked! Not "' + node + '"!')}) }
					gun.put(Gun.obj.put(put, soul, Gun.val.rel.ify(soul)), cb, opt);
				}, {wait:0});
			}
		}());
	})(require, './api');

	;require(function(module){
		if(typeof Gun === 'undefined'){ return } // TODO: localStorage is Browser only. But it would be nice if it could somehow plugin into NodeJS compatible localStorage APIs?

		var root, noop = function(){};
		if(typeof window !== 'undefined'){ root = window }
		var store = root.localStorage || {setItem: noop, removeItem: noop, getItem: noop};

		function put(at){ var err, id, opt, root = at.gun._.root;
			(opt = {}).prefix = (at.opt || opt).prefix || at.gun.Back('opt.prefix') || 'gun/';
			Gun.graph.is(at.put, function(node, soul){
				//try{store.setItem(opt.prefix + soul, Gun.text.ify(node));
				try{store.setItem(opt.prefix + soul, Gun.text.ify(root._.graph[soul]||node));
				}catch(e){ err = e || "localStorage failure" }
			});
			//console.log('@@@@@@@@@@local put!');
			if(Gun.obj.empty(at.gun.Back('opt.peers'))){
				Gun.on.ack(at, {err: err, ok: 0}); // only ack if there are no peers.
			}
		}
		function get(at){
			var gun = at.gun, lex = at.get, soul, data, opt, u;
			//setTimeout(function(){
			(opt = at.opt || {}).prefix = opt.prefix || at.gun.Back('opt.prefix') || 'gun/';
			if(!lex || !(soul = lex[Gun._.soul])){ return }
			data = Gun.obj.ify(store.getItem(opt.prefix + soul) || null);
			if(!data){ // localStorage isn't trustworthy to say "not found".
				if(Gun.obj.empty(gun.Back('opt.peers'))){
					gun.Back(-1).on('in', {'@': at['#']});
				}
				return;
			}
			if(Gun.obj.has(lex, '.')){var tmp = data[lex['.']];data = {_: data._};if(u !== tmp){data[lex['.']] = tmp}}
			//console.log('@@@@@@@@@@@@local get', data, at);
			gun.Back(-1).on('in', {'@': at['#'], put: Gun.graph.node(data)});
			//},100);
		}
		Gun.on('put', put);
		Gun.on('get', get);
	})(require, './adapters/localStorage');

	;require(function(module){
		var Gun = require('./gun');

		// Check for stone-age browsers.
		if (typeof JSON === 'undefined') {
			throw new Error(
				'Gun depends on JSON. Please load it first:\n' +
				'ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js'
			);
		}

		function Client (url, options) {
			if (!(this instanceof Client)) {
				return new Client(url, options);
			}

			this.url = Client.formatURL(url);
			this.socket = null;
			this.queue = [];
			this.sid = Gun.text.random(10);

			this.on = Gun.on;

			this.options = options || {};
			this.resetBackoff();
		}

		Client.prototype = {
			constructor: Client,

			drainQueue: function () {
				var queue = this.queue;
				var client = this;

				// Reset the queue.
				this.queue = [];

				// Send each message.
				queue.forEach(function (msg) {
					client.send(msg);
				});

				return queue.length;
			},

			connect: function () {
				var client = this;
				var socket = new Client.WebSocket(this.url);
				this.socket = socket;

				// Forward messages into the emitter.
				socket.addEventListener('message', function (msg) {
					client.on('message', msg);
				});

				// Reconnect on close events.
				socket.addEventListener('close', function () {
					client.scheduleReconnect();
				});

				// Send the messages in the queue.
				this.ready(function () {
					client.drainQueue();
				});

				return socket;
			},

			resetBackoff: function () {
				var backoff = this.options;

				this.backoff = {
					time: backoff.time || 100,
					max: backoff.max || 30000,
					factor: backoff.factor || 2
				};

				return this.backoff;
			},

			nextBackoff: function () {
				var backoff = this.backoff;
				var next = backoff.time * backoff.factor;
				var max = backoff.max;

				if (next > max) {
					next = max;
				}

				return (backoff.time = next);
			},

			// Try to efficiently reconnect.
			scheduleReconnect: function () {
				var client = this;
				var time = this.backoff.time;
				this.nextBackoff();

				setTimeout(function () {
					client.connect();

					client.ready(function () {
						client.resetBackoff();
					});
				}, time);
			},

			isClosed: function () {
				var socket = this.socket;

				if (!socket) {
					return true;
				}

				var state = socket.readyState;

				if (state === socket.CLOSING || state === socket.CLOSED) {
					return true;
				}

				return false;
			},

			ready: function (callback) {
				var socket = this.socket;
				var state = socket.readyState;

				if (state === socket.OPEN) {
					callback();
					return;
				}

				if (state === socket.CONNECTING) {
					socket.addEventListener('open', callback);
				}
			},

			send: function (msg) {
				if (this.isClosed()) {
					this.queue.push(msg);

					// Will send once connected.
					this.connect();
					return false;
				}

				var socket = this.socket;

				// Make sure the socket is open.
				this.ready(function () {
					socket.send(msg);
				});

				return true;
			}
		};

		if (typeof window !== 'undefined') {
			Client.WebSocket = window.WebSocket ||
				window.webkitWebSocket ||
				window.mozWebSocket ||
				null;
		}

		Client.isSupported = Client.WebSocket !== null;
		
		if(!Client.isSupported){ return } // TODO: For now, don't do anything in browsers/servers that don't work. Later, use JSONP fallback and merge with server code?

		// Ensure the protocol is correct.
		Client.formatURL = function (url) {
			return url.replace('http', 'ws');
		};

		// Send a message to a group of peers.
		Client.broadcast = function (urls, msg) {
			var pool = Client.pool;
			msg.headers = msg.headers || {};

			Gun.obj.map(urls, function (options, addr) {

				var url = Client.formatURL(addr);

				var peer = pool[url];

				var envelope = {
					headers: Gun.obj.to(msg.headers, {
						'gun-sid': peer.sid
					}),
					body: msg.body
				};

				var serialized = Gun.text.ify(envelope);

				peer.send(serialized);
			});

		};

		// A map of URLs to client instances.
		Client.pool = {};

		// Close all WebSockets when the window closes.
		if (typeof window !== 'undefined') {
			window.addEventListener('unload', function () {
				Gun.obj.map(Client.pool, function (client) {
					if (client.isClosed()) {
						return;
					}

					client.socket.close();
				});
			});
		}

		// Define client instances as gun needs them.
		// Sockets will not be opened until absolutely necessary.
		Gun.on('opt', function (ctx) {

			var gun = ctx.gun;
			var peers = gun.Back('opt.peers') || {};

			Gun.obj.map(peers, function (options, addr) {
				var url = Client.formatURL(addr);

				// Ignore clients we've seen before.
				if (Client.pool.hasOwnProperty(url)) {
					return;
				}

				var client = new Client(url, options.backoff);

				// Add it to the pool.
				Client.pool[url] = client;

				// Listen to incoming messages.
				client.on('message', function (msg) {
					var data;

					try {
						data = Gun.obj.ify(msg.data);
					} catch (err) {
						// Invalid message, discard it.
						return;
					}

					if (!data || !data.body) {
						return;
					}

					gun.on('in', data.body);
				});
			});
		});

		function request (peers, ctx) {
			if (Client.isSupported) {
				Client.broadcast(peers, { body: ctx });
			}
		}

		// Broadcast the messages.
		Gun.on('out', function (ctx) {
			var gun = ctx.gun;

			var peers = gun.Back('opt.peers') || {};

			// Validate.
			if (Gun.obj.empty(peers)) {
				return;
			}

			request(peers, ctx);
		});

		request.jsonp = function (opt, cb) {
			request.jsonp.ify(opt, function (url) {
				if (!url) {
					return;
				}
				request.jsonp.send(url, function (err, reply) {
					cb(err, reply);
					request.jsonp.poll(opt, reply);
				}, opt.jsonp);
			});
		};
		request.jsonp.send = function (url, cb, id) {
			var js = document.createElement('script');
			js.src = url;
			js.onerror = function () {
				(window[js.id] || function () {})(null, {
					err: 'JSONP failed!'
				});
			};
			window[js.id = id] = function (res, err) {
				cb(err, res);
				cb.id = js.id;
				js.parentNode.removeChild(js);
				delete window[cb.id];
			};
			js.async = true;
			document.getElementsByTagName('head')[0].appendChild(js);
			return js;
		};
		request.jsonp.poll = function (opt, res) {
			if (!opt || !opt.base || !res || !res.headers || !res.headers.poll) {
				return;
			}
			var polls = request.jsonp.poll.s = request.jsonp.poll.s || {};
			polls[opt.base] = polls[opt.base] || setTimeout(function () {
				var msg = {
					base: opt.base,
					headers: { pull: 1 }
				};

				request.each(opt.headers, function (header, name) {
					msg.headers[name] = header;
				});

				request.jsonp(msg, function (err, reply) {
					delete polls[opt.base];

					var body = reply.body || [];
					while (body.length && body.shift) {
						var res = reply.body.shift();
						if (res && res.body) {
							request.createServer.ing(res, function () {
								request(opt.base, null, null, res);
							});
						}
					}
				});
			}, res.headers.poll);
		};
		request.jsonp.ify = function (opt, cb) {
			var uri = encodeURIComponent, query = '?';
			if (opt.url && opt.url.pathname) {
				query = opt.url.pathname + query;
			}
			query = opt.base + query;
			request.each((opt.url || {}).query, function (value, key) {
				query += (uri(key) + '=' + uri(value) + '&');
			});
			if (opt.headers) {
				query += uri('`') + '=' + uri(
					JSON.stringify(opt.headers)
				) + '&';
			}
			if (request.jsonp.max < query.length) {
				return cb();
			}
			var random = Math.floor(Math.random() * (0xffff + 1));
			query += (uri('jsonp') + '=' + uri(opt.jsonp = 'P' + random));
			if (opt.body) {
				query += '&';
				var w = opt.body, wls = function (w, l, s) {
					return uri('%') + '=' + uri(w+'-'+(l||w)+'/'+(s||w)) + '&' + uri('$') + '=';
				}
				if (typeof w != 'string') {
					w = JSON.stringify(w);
					query += uri('^') + '=' + uri('json') + '&';
				}
				w = uri(w);
				var i = 0, l = w.length
				, s = request.jsonp.max - (query.length + wls(l.toString()).length);
				if (s < 0){
					return cb();
				}
				while (w) {
					cb(query + wls(i, (i += s), l) + w.slice(0, i));
					w = w.slice(i);
				}
			} else {
				cb(query);
			}
		};
		request.jsonp.max = 2000;
		request.each = function (obj, cb, as) {
			if (!obj || !cb) {
				return;
			}
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					cb.call(as, obj[key], key);
				}
			}
		};
		module.exports = Client;
	})(require, './polyfill/request');

}());
