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
				var i = 0, acts = on.s, l = acts.length, arr = (arg instanceof Array), gap, off, act, stun = function(){ stun.halt = arguments.length? 1 : true; return act.res.apply(act, arguments) } // TODO: BUG! Perf/clean up.
				for(; i < l; i++){ act = acts[i];
					if(skip){
						if(skip === act){
							skip = false;
						}
						continue;
					}
					var tun = act.stun; // TODO: BUG! Perf/clean up.
					act.stun = stun; // TODO: BUG! Perf/clean up.
					var tmp = act.tmp = {};
					if(!arr){
						act.fn.call(act.as, arg, proxy||act);
					} else {
						act.fn.apply(act.as, arg.concat(proxy||act));
					}
					act.stun = tun; // TODO: BUG! Perf/clean up.
					if(noop === act.fn){
						off = true;
					}
					//if(tmp = tmp.halt){
					if(tmp = stun.halt){
						if(1 === tmp){
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
		Act.chain.res = Act.chain.stun = function(){
			if(!this.tmp){ this.tmp = {halt: true} }
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
		// TODO: Needs to be redone.
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
				if(!ask.ons[id]){ return }
				ask.on(id, reply);
				return true;
			}
			on.ack._ = opt.rid;

			on.on('event', function event(act){
				var last = act.on.last, tmp;
				if('in' === act.tag && Gun.chain.chain.input !== act.fn){ // TODO: BUG! Gun is not available in this module.
					if((tmp = act.ctx) && tmp.stun){
						if(tmp.stun(act)){
							return;
						}
					}
				}
				if(!last){ return }
				if(act.on.map){
					var map = act.on.map, v;
					for(var f in map){ v = map[f];
						if(v.put){
							emit(v, act, event);
						}
					}
					/*
					Gun.obj.map(act.on.map, function(v,f){ // TODO: BUG! Gun is not available in this module.
						//emit(v[0], act, event, v[1]); // below enables more control
						//console.log("boooooooo", f,v);
						emit(v, act, event);
						//emit(v[1], act, event, v[2]);
					});
					*/
				} else {
					emit(last, act, event);
				}
				if(last !== act.on.last){
					//console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>", last, act.on.last);
					event(act);
				}
			});
			function emit(last, act, event, ev){
				if(last instanceof Array){
					act.fn.apply(act.as, last.concat(ev||act));
				} else {
					act.fn.call(act.as, last, ev||act);
				}
			}

			/*on.on('emit', function(ev){
				if(ev.on.map){
					var id = ev.arg.via.gun._.id + ev.arg.get;
					//
					//ev.id = ev.id || Gun.text.random(6);
					//ev.on.map[ev.id] = ev.arg;
					//ev.proxy = ev.arg[1];
					//ev.arg = ev.arg[0];
					// below gives more control.
					ev.on.map[id] = ev.arg;
					//ev.proxy = ev.arg[2];
				}
				ev.on.last = ev.arg;
			});*/

			on.on('emit', function(ev){
				var gun = ev.arg.gun;
				if('in' === ev.tag && gun && !gun._.soul){ // TODO: BUG! Soul should be available. Currently not using it though, but should enable it (check for side effects if made available).
					(ev.on.map = ev.on.map || {})[gun._.id || (gun._.id = Math.random())] = ev.arg;
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
		if(typeof JSON === 'undefined'){
			throw new Error(
				'JSON is not included in this browser. Please load it first: ' +
				'ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js'
			);
		}
		var Lexical = JSON.stringify, undefined;
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
			return last = t + ((N += 1) / D);
		}
		var time = Type.time.is, last = -Infinity, N = 0, D = 1000; // WARNING! In the future, on machines that are D times faster than 2016AD machines, you will want to increase D by another several orders of magnitude so the processing speed never out paces the decimal resolution (increasing an integer effects the state accuracy).
		State._ = '>';
		State.ify = function(n, f, s){ // put a field's state on a node.
			if(!n || !n[N_]){ return } // reject if it is not node-like.
			var tmp = obj_as(n[N_], State._); // grab the states data.
			if(u !== f && num_is(s)){ tmp[f] = s } // add the valid state.
			return n;
		}
		State.is = function(n, f, o){ // convenience function to get the state on a field on a node and return it.
			var tmp = (f && n && n[N_] && n[N_][State._]) || o;
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
		var Type = require('./type');
		function Dedup(){
			this.cache = {};
		}
		Dedup.prototype.track = function(id){
			this.cache[id] = Type.time.is();
			if (!this.to) {
				this.gc(); // Engage GC.
			}
			return id;
		};
		Dedup.prototype.check = function(id){
			// Have we seen this ID recently?
			return Type.obj.has(this.cache, id)? this.dedup(id) : false; // Important, bump the ID's liveliness if it has already been seen before - this is critical to stopping broadcast storms.
		}
		Dedup.prototype.gc = function(){
			var de = this, now = Type.time.is(), oldest = now, maxAge = 5 * 60 * 1000;
			// TODO: Gun.scheduler already does this? Reuse that.
			Gun.obj.map(de.cache, function(time, id){
				oldest = Math.min(now, time);
				if ((now - time) < maxAge){ return }
				Type.obj.del(de.cache, id);
			});
			var done = Type.obj.empty(de.cache);
			if(done){
				de.to = null; // Disengage GC.
				return;
			}
			var elapsed = now - oldest; // Just how old?
			var nextGC = maxAge - elapsed; // How long before it's too old?
			de.to = setTimeout(function(){ de.gc() }, nextGC); // Schedule the next GC event.
		}
		module.exports = Dedup;
	})(require, './dedup');

	;require(function(module){

		function Gun(o){
			if(o instanceof Gun){ return (this._ = {gun: this}).gun }
			if(!(this instanceof Gun)){ return new Gun(o) }
			return Gun.create(this._ = {gun: this, opt: o});
		}

		Gun.is = function(gun){ return (gun instanceof Gun) }

		Gun.version = 0.4;

		Gun.chain = Gun.prototype;
		Gun.chain.toJSON = function(){};

		var Type = require('./type');
		Type.obj.to(Type, Gun);
		Gun.HAM = require('./HAM');
		Gun.val = require('./val');
		Gun.node = require('./node');
		Gun.state = require('./state');
		Gun.graph = require('./graph');
		Gun.dedup = require('./dedup');
		Gun.on = require('./onify')();
		
		Gun._ = { // some reserved key words, these are not the only ones.
			node: Gun.node._ // all metadata of a node is stored in the meta property on the node.
			,soul: Gun.val.rel._ // a soul is a UUID of a node but it always points to the "latest" data known.
			,state: Gun.state._ // other than the soul, we store HAM metadata.
			,field: '.' // a field is a property on a node which points to a value.
			,value: '=' // the primitive value.
		}

		;(function(){
			Gun.create = function(at){
				var gun = at.gun.opt(at.opt);
				at.root = at.root || gun;
				at.graph = at.graph || {};
				at.dedup = at.dedup || new Gun.dedup;
				if(!at.once){
					gun.on('in', input, at);
					gun.on('out', output, at);
				}
				at.once = true;
				return gun;
			};

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
					at = obj_to(at, {gun: gun});
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
			function input(at, ev){ var cat = this;
				if(!at.gun){ at.gun = cat.gun }
				if(!at['#'] && at['@']){
					at['#'] = Gun.text.random(); // TODO: Use what is used other places instead.
					if(Gun.on.ack(at['@'], at)){ return }
					cat.dedup.track(at['#']);
					cat.on('out', at);
					return;
				}
				if(at['#'] && cat.dedup.check(at['#'])){ return }
				cat.dedup.track(at['#']);
				if(Gun.on.ack(at['@'], at)){ return }
				if(at.put){
					console.debug(2, 'OUT -> IN', at);
					Gun.HAM.synth.call(cat.gun, at, ev);
					Gun.on('put', at);
				}
				if(at.get){ Gun.on('get', at) }
				Gun.on('out', at);
			}
		}());

		//var text = Type.text, text_is = text.is, text_random = text.random;
		//var list = Type.list, list_is = list.is;
		var obj = Type.obj, obj_is = obj.is, obj_has = obj.has, obj_to = obj.to, obj_map = obj.map;
		var _soul = Gun._.soul, _field = Gun._.field;
		//var u;

		console.debug = function(i, s){ return (console.debug.i && i === console.debug.i && console.debug.i++) && (console.log.apply(console, arguments) || s) };

		Gun.log = function(){ return (!Gun.log.off && console.log.apply(console, arguments)), [].slice.call(arguments).join(' ') }
		Gun.log.once = function(w,s,o){ return (o = Gun.log.once)[w] = o[w] || 0, o[w]++ || Gun.log(s) }

		if(typeof window !== "undefined"){ window.Gun = Gun }
		if(typeof common !== "undefined"){ common.exports = Gun }
		module.exports = Gun;
	})(require, './root');

	;require(function(module){
		var Gun = require('./root');
		Gun.chain.opt = function(opt){
			opt = opt || {};
			var gun = this, at = gun._, tmp = opt.peers || opt;
			if(!obj_is(opt)){ opt = {} }
			if(!obj_is(at.opt)){ at.opt = opt }
			if(text_is(tmp)){ tmp = [tmp] }
			if(list_is(tmp)){
				tmp = obj_map(tmp, function(url, i, map){
					map(url, {});
				});
			}
			at.opt.peers = obj_to(tmp, at.opt.peers || {});
			obj_to(opt, at.opt); // copies options on to `at.opt` only if not already taken.
			Gun.on('opt', at);
			return gun;
		}
		var text_is = Gun.text.is;
		var list_is = Gun.list.is;
		var obj = Gun.obj, obj_is = obj.is, obj_to = obj.to, obj_map = obj.map;
	})(require, './opt');

	;require(function(module){
		var Gun = require('./root');
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
					tmp = (tmp||empty)[n[i]];
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
		var empty = {}, u;
	})(require, './back');

	;require(function(module){
		var Gun = require('./root');
		Gun.chain.chain = function(){
			var at = this._, chain = new this.constructor(this), cat = chain._;
			cat.root = at.root;
			cat.back = this;
			Gun.on('chain', cat);
			chain.on('in', input, cat); // For 'in' if I add my own listeners to each then I MUST do it before in gets called. If I listen globally for all incoming data instead though, regardless of individual listeners, I can transform the data there and then as well.
			chain.on('out', output, cat); // However for output, there isn't really the global option. I must listen by adding my own listener individually BEFORE this one is ever called.
			return chain;
		}
		function output(at){
			var cat = this, gun = cat.gun, root = gun.Back(-1), put, get, now, tmp;
			if(!at.gun){
				at.gun = gun;
			}
			if(get = at.get){
				if(!get[_soul]){
					if(obj_has(get, _field)){
						get = get[_field];
						// TODO: MARK COME BACK HERE!!!!!!!! CHAIN ABILITY!!!!!! IF THIS IS NOT A GUN SINGLETON, MAP OVER ALL CURRENT (AND FUTURE?) SINGLETONS AND BACK ON THEM DIRECTLY!!!!!!!!!!!
						var next = get? gun.get(get, null, {path: true})._ : cat;
						if(0 >= next.ask){ return }
						cat.on('in', function(tac, ev){
							now = true;
							//next.ask = -1;
							var val = tac.put, rel;
							if(u === val){
								at.gun.on('in', {
									get: get,
									gun: at.gun,
									via: tac
								});
								return;
							}
							if(Gun.node.soul(val)){ return } // TODO: BUG! Should ask for the property!
							// TODO: BUG!!!! ^^^^ We might have loaded 1 property on this node and thus have the node but not other properties yet.
							if(rel = Gun.val.rel.is(val)){
								//console.debug(2, 'out already', rel, get, tac, at);
								//value.call(cat, tac, ev);
								at.gun.on('out', {
									get: {'#': rel, '.': get},
									'#': Gun.on.ask(Gun.HAM.synth, at.gun),
									gun: at.gun
								});
								if(tmp = tac.gun._.put){ tac.put = tmp } // TODO: CLEAN THIS UP! DO NOT DEPEND UPON IT!
								return;
							}
							input.call(cat, tac, ev);
						}).off(); // TODO: BUG! This `.off()` is correct, but note that not doing it inside of the callback means that potentially inside of the callback will do/cause other work which might trigger the event listener synchronously before it can ever unsubscribe. The problem currently with having an unsubscribe inside is because there might be a `.map` that needs multiple things to be triggered. Although now that I have mentioned it the `ev.off()` inside for a map should only effect their own event, not the thing as a whole. Hmmm.
						if(now){ return }
						if(cat.get){
							if(cat.soul){
								next.ask = -1;
								at.gun.on('out', {
									get: {'#': cat.soul, '.': get},
									'#': Gun.on.ask(Gun.HAM.synth, at.gun),
									gun: at.gun
								});
								return;
							}
							cat.back.on('out', {
								get: obj_put({}, _field, cat.get),
								gun: gun
							});
							return;
						}
						console.debug(103, 'out', cat.get);
						at = obj_to(at, {get: {}});
					} else {
						if(cat.ask){ return }
						cat.ask = 1;
						if(cat.get){
							if(cat.soul){
								cat.ask = -1;
								console.debug(104, 'out', cat.get, cat.ask);
								gun.on('out', {
									get: {'#': cat.soul},
									'#': Gun.on.ask(Gun.HAM.synth, gun),
								});
								return;
							}
							console.debug(102, 'any out', cat.get, cat.ask);
							cat.back.on('out', {
								get: obj_put({}, _field, cat.get),
								gun: gun
							});
							return;
						}
					}
				}
			}
			cat.back.on('out', at);
		}
		function input(at, ev){
			at = at._ || at;
			var cat = this, gun = at.gun, coat = gun._, change = at.put, tmp;
			console.debug(119, 'in', cat.get, change, cat.next, cat.maps);
			console.debug(117, 'in', cat.get, change, cat.next, cat.maps);
			console.debug(116, 'in', cat.get, change, cat.next, cat.maps);
			console.debug(115, 'in', cat.get, change, cat.next, cat.maps);
			console.debug(109, 'in', cat.get, change, cat.next);
			console.debug(107, 'in', cat.get, change, cat.next, cat.maps);
			console.debug(6, 'in', cat.get, change, cat.next, cat.maps);
			console.debug(5, 'in', cat.get, change, cat.next, cat.maps);
			console.debug(3, 'in', cat.get, change, cat.next, cat.maps);
			if(cat.maps){
				obj_map(cat.maps, function(cat){
					cat.on('in', at);
				})
			}
			if(value.call(cat, at, ev)){
				return;
			}
			obj_map(change, map, {at: at, cat: cat}); // Important because `values` sometimes `ask`s for things which changes what the `changes` are.
		}
		Gun.chain.chain.input = input;
		function value(at, ev){
			var cat = this, gun = at.gun, put = at.put, coat = gun._, rel, tmp;
			if(cat.soul){
				return;
			}
			if(u === put){
				//not(cat, at);
				return true;
			}
			if(!(rel = Gun.val.rel.is(put))){
				/*if(cat.proxy && cat.proxy.at !== at){ // TODO: CLEAN UP? Cleaner approach?
					if(cat.proxy.rel){
						cat.put = coat.put;
					}
					cat.on('in', cat.proxy.at = obj_to(at, {get: cat.get, gun: coat.gun, via: at})); // TODO: BUG!!! Re-using at as via will create the wrong at via path!
					return true;
				}*/
				if(cat.proxy){
					cat.put = coat.put;
				}
				console.debug(7, '!', cat);
				if(Gun.val.is(put)){
					//not(coat, at);
					not(cat, at);
					return true;
				}
				return;
			};
			// TODO: MARK! COME BACK HERE! What if we INVERT the model? Rather than map subbing to all refs that come it way, the refs know of the map?
			if(coat !== cat){
				console.debug(110, 'values', coat !== cat, coat.ask, cat.ask);
				(coat.maps || (coat.maps = {}))[cat.id || (cat.id = Math.random())] = cat;
				/*
				if(!(cat.proxy || (cat.proxy = {}))[coat.id = coat.id || Gun.text.random(6)]){
					cat.proxy[coat.id] = {ref: coat.gun, sub: gun._.on('in', input, cat)};
				} else {
					solve(coat, cat);
					ask(cat, rel);
				}
				*/
				//return true;
			}
			console.debug(7, 'values', cat.rel, coat.proxy);
			if(coat.proxy){
				if(rel === coat.proxy.rel){
					ev.stun();
					ask(cat, rel);
					tmp = coat.proxy.ref._;
					at.put = coat.put = tmp.put;
					return true;
				}
				//Gun.obj.del(cat.on('in').map, coat.proxy.ref._.id);
				tmp = coat.proxy;
				not(coat, at);
				//not(cat, at);
			}
			tmp = coat.proxy = {rel: rel, ref: coat.root.get(rel), was: tmp};
			tmp.sub = tmp.ref._.on('in', input, coat);
			tmp = coat.put;
			console.debug(111, 'values', rel, coat.proxy);
			ask(cat, rel);
			if(tmp !== coat.put){ ev.stun() }
			/*if(cat.maps){
				obj_map(cat.maps, function(cat){
					cat.on('in', at);
				})
			}*/
			return true;
		}
		function solve(coat, cat){
			if(!coat.proxy){ return }
			var was = coat.proxy.was;
			if(!was){ return }
			was = was.ref._;
			obj_map(cat.next, function(sub, key){
				var a = was.next[key];
				if(!a){ return }
				var id = a._.id, proxy = sub._.proxy;
				if(!(sub = sub._.proxy)){ return }
				if(!sub[id]){ return }
				if(sub[id].sub){ sub[id].sub.off() }
				Gun.obj.del(sub, id);
			})
		}
		function map(data, key){ // Map over only the changes on every update.
			if(node_ === key){ return }
			var cat = this.cat, next = cat.next || {}, via = this.at, gun, chain, at, tmp;
			if(!(gun = next[key])){ return }
			at = gun._;
			if(cat.soul){
				at.put = data;
				at.field = key;
				chain = gun;
			} else {
				chain = via.gun.get(key, null, {path: true}); // TODO: path won't be needed with 0.5
			}
			console.debug(118, '-->>', key, data, gun, chain);
			console.debug(4, '-->>', key, data);
			gun.on('in', {
				put: data,
				get: key,
				gun: chain,
				via: via
			})
		}
		function not(cat, at){
			var ask = cat.ask, tmp = cat.proxy;
			cat.proxy = null;
			if(null === tmp){ return }
			if(tmp){
				if(tmp.sub){
					tmp.sub.off();
				}
				tmp.off = true;
			}
			if(cat.ask){ cat.ask = 1 }
			obj_map(cat.next, function(gun, key){
				var at = gun._;
				if(obj_has(at,'put')){ 
					at.put = u;
				}
				console.debug(8, 'woot!', at);
				gun.on('in', {
					get: key,
					put: u,
					gun: gun,
					via: at
				})
			});
		}
		function ask(cat, soul){
			var tmp;
			if(cat.ask){
				if(0 >= cat.ask){ return }
				tmp = cat.root.get(soul);
				tmp.on('out', {
					get: {'#': soul},
					gun: tmp,
					'#': Gun.on.ask(Gun.HAM.synth, tmp)
				});
				return;
			}
			if(0 === cat.ask){ return }
			obj_map(cat.next, function(gun, key){
				console.debug(112, 'ask', soul, key);
				gun.on('out', {
					get: {'#': soul, '.': key},
					gun: gun,
					'#': Gun.on.ask(Gun.HAM.synth, gun)
				});
			});
		}
		function proxy(at, ev){ var link = this; link.ran = true;
			if(link.off){ return ev.off() }
			var gun = at.gun, cat = gun._, as = link.as;
			as.put = cat.put;
			input.call(as, obj_to(at, {gun: as.gun, get: as.get}), ev);
		}
		var empty = {}, u;
		var obj = Gun.obj, obj_has = obj.has, obj_put = obj.put, obj_to = obj.to, obj_map = obj.map;
		var _soul = Gun._.soul, _field = Gun._.field, node_ = Gun.node._, _sid = Gun.on.ask._, _rid = Gun.on.ack._;
	})(require, './chain');

	;require(function(module){
		var Gun = require('./root');
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
			if(cat.root === back){ at.soul = key }
			else if(cat.soul || cat.field){ at.field = key }
			return gun;
		}		
		Gun.chain.any = function(cb, opt){
			if(!cb){ return this }
			var opt = opt || {}, gun = opt.gun = this;
			if(opt.change){ opt.change = 1 }
			opt.any = cb;
			console.debug(101, 'any!');
			return gun.on('in', any, opt).on('out', {get: opt});
		}
		function any(at, ev){ var opt = this;
			if(!at.gun){ console.log("Error: %%%%%%% No gun context! %%%%%%%") }
			var gun = at.gun, cat = gun._, data = at.put, tmp;
			if((tmp = data) && tmp[Gun.val.rel._] && (tmp = Gun.val.rel.is(tmp))){
				if(null !== opt['.']){
					gun = cat.root.get(tmp);
					cat = gun._;
					if(!cat.ask){
						gun.val(function(){});
					}
					return;
				}
				at = obj_to(at, {put: data = cat.put = cat.put || Gun.state.ify(Gun.node.ify({}, tmp))});
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
		var empty = {};
	})(require, './get');

	;require(function(module){
		var Gun = require('./root');
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
				console.debug(1, 'PUT!', as.env.graph);
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
		var obj = Gun.obj, obj_is = obj.is, obj_put = obj.put, obj_map = obj.map;
		var u, empty = {}, noop = function(){}, iife = function(fn,as){fn.call(as||empty)};
	})(require, './put');

	;require(function(module){

		var Gun = require('./root');
		module.exports = Gun;

		;(function(){
			function meta(v,f){
				if(obj_has(Gun.__, f)){ return }
				obj_put(this._, f, v);
			}
			function map(value, field){
				if(Gun._.node === field){ return }
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
			Gun.HAM.delta = function(vertex, node, opt){
				opt = num_is(opt)? {machine: opt} : {machine: (+new Date)};
				if(!vertex){ return Gun.obj.copy(node) }
				opt.soul = Gun.node.soul(opt.vertex = vertex);
				if(!opt.soul){ return }
				opt.delta = Gun.node.soul.ify({}, opt.soul);
				obj_map(opt.node = node, diff, opt);
				return opt.delta;
			}
			function diff(value, field){ var opt = this;
				if(Gun._.node === field){ return }
				if(!val_is(value)){ return }
				var node = opt.node, vertex = opt.vertex, is = state_is(node, field, true), cs = state_is(vertex, field, true), delta = opt.delta;
				var HAM = Gun.HAM(opt.machine, is, cs, value, vertex[field]);


				// TODO: BUG!!!! WHAT ABOUT DEFERRED!???
				


				if(HAM.incoming){
					delta[field] = value;
					state_ify(delta, field, is);
				}
			}
			Gun.HAM.synth = function(at, ev){ var gun = this;
				var cat = gun._, root = cat.root._, put = {}, tmp;
				if(!at.put){ return } // TODO: BUG! Handle this case! `not` founds, errors, etc.
				obj_map(at.put, function(node, soul){ var graph = this.graph;
					put[soul] = Gun.HAM.delta(graph[soul], node, {graph: graph}); // TODO: PERF! SEE IF WE CAN OPTIMIZE THIS BY MERGING UNION INTO DELTA!
					graph[soul] = Gun.HAM.union(graph[soul] || node, node) || graph[soul];
				}, root);
				obj_map(put, function(node, soul){
					var root = this, next = root.next || (root.next = {}), gun = next[soul] || (next[soul] = root.gun.get(soul));
					gun._.put = root.graph[soul];
					console.debug(114, 'ack', soul, node);
					console.debug(106, 'ack', soul, node);
					gun.on('in', {
						put: node,
						get: soul,
						gun: gun,
						via: at
					});
				}, root);
			}
		}());

		var Type = Gun;
		var num = Type.num, num_is = num.is;
		var obj = Type.obj, obj_has = obj.has, obj_put = obj.put, obj_map = obj.map;
		var node = Gun.node, node_soul = node.soul, node_is = node.is, node_ify = node.ify;
		var state = Gun.state, state_is = state.is, state_ify = state.ify;
		var val = Gun.val, val_is = val.is, rel_is = val.rel.is;
		var u;
	})(require, './index');

	;require(function(module){
		var Gun = require('./root');
		require('./index'); // TODO: CLEAN UP! MERGE INTO ROOT!
		require('./opt');
		require('./chain');
		require('./back');
		require('./put');
		require('./get');
		module.exports = Gun;
	})(require, './core');

	;require(function(module){
		var Gun = require('./core');
		var obj = Gun.obj, obj_is = obj.is, obj_put = obj.put, obj_map = obj.map, obj_empty = obj.empty;
		var num = Gun.num, num_is = num.is;
		var _soul = Gun.val.rel._, _field = '.';


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

	})(require, './key');

	;require(function(module){
		var Gun = require('./core');
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
	})(require, './path');

	;require(function(module){
		var Gun = require('./core');
		Gun.chain.on = function(tag, arg, eas, as){
			var gun = this, at = gun._, tmp, act, off;
			if(!at.on){ at.on = Gun.on }
			if(typeof tag === 'string'){
				if(!arg){ return at.on(tag) }
				act = at.on(tag, arg, eas || at, as);
				if(eas && eas.gun){
					(eas.subs || (eas.subs = [])).push(act);
				}
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
			opt.last = {};
			gun.any(ok, {as: opt, change: opt.change}); // TODO: PERF! Event listener leak!!!????
			return gun;
		}

		function ok(at, ev){ var opt = this;
			if(u === at.put){ return }
			var data = at.put, gun = at.gun, cat = gun._, tmp = opt.last, id = cat.id+at.get;
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
	})(require, './on');

	;require(function(module){
		var Gun = require('./core');
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
	})(require, './not');

	;require(function(module){
		var Gun = require('./core');
		Gun.chain.map = function(cb, opt, t){
			var gun = this, cat = gun._, chain = cat.map, ons = [], act, off;
			//cb = cb || function(){ return this } // TODO: API BREAKING CHANGE! 0.5 Will behave more like other people's usage of `map` where the passed callback is a transform function. By default though, if no callback is specified then it will use a transform function that returns the same thing it received.
			if(!chain){
				chain = cat.map = gun.chain();
				var list = (cat = chain._).list = cat.list || {};
				(ons[ons.length] = chain.on('in')).map = {};
				/*
					Attempted merge with alancnet's `off` support, we'll see if it works.
				*/
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
		Gun.chain.map = function(cb, opt, t){
			var gun = this, cat = gun._, chain = cat.map, ons = [], act, off;
			//cb = cb || function(){ return this } // TODO: API BREAKING CHANGE! 0.5 Will behave more like other people's usage of `map` where the passed callback is a transform function. By default though, if no callback is specified then it will use a transform function that returns the same thing it received.
			if(chain){ return chain }
			chain = cat.map = gun.chain();
			chain._.set = {};
			gun.on('in', map, chain._);
			if(cb){
				console.log("map!");
				chain.on(cb);
			}
			console.debug(100, 'to map');
			return chain;
		}
		function map(at,ev){
			var cat = this, gun = at.gun || this.back, tac = gun._;
			obj_map(at.put, each, {gun:gun, cat: cat, id: tac.id||at.get, at: at});
		}
		function each(v,f){
			if(n_ === f){ return }
			var gun = this.gun, cat = this.cat;
			//console.log("-- EACH -->", f, v);
			var id = this.id;if(cat.set[id+f]){ return } cat.set[id+f] = 1;
			console.debug(108, "-- EACH -->", f, v);
			cat.on('in', {gun: gun.get(f, null, {path: true}), get: f, put: v, via: this.at});
		}
		var obj_map = Gun.obj.map, noop = function(){}, event = {stun: noop, off: noop}, n_ = Gun.node._;
	})(require, './map');

	;require(function(module){
		var Gun = require('./core');
		Gun.chain.init = function(){ // TODO: DEPRECATE?
			(this._.opt = this._.opt || {}).init = true;
			return this.Back(-1).put(Gun.node.ify({}, this._.get), null, this._.get);
		}
	})(require, './init');

	;require(function(module){
		var Gun = require('./core');
		Gun.chain.set = function(item, cb, opt){
			var gun = this, soul;
			cb = cb || function(){};
			if (soul = Gun.node.soul(item)) return gun.set(gun.get(soul), cb, opt);
			if (Gun.obj.is(item) && !Gun.is(item)) return gun.set(gun._.root.put(item), cb, opt);
			return item.val(function(node){
				var put = {}, soul = Gun.node.soul(node);
				if(!soul){ return cb.call(gun, {err: Gun.log('Only a node can be linked! Not "' + node + '"!')}) }
				gun.put(Gun.obj.put(put, soul, Gun.val.rel.ify(soul)), cb, opt);
			},{wait:0});
		}
	})(require, './set');

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
			console.debug(113, 'lS get', data);
			console.debug(105, 'lS get', data);
			//console.log('@@@@@@@@@@@@local get', data, at);
			gun.Back(-1).on('in', {'@': at['#'], put: Gun.graph.node(data)});
			//},100);
		}
		Gun.on('put', put);
		Gun.on('get', get);
	})(require, './adapters/localStorage');

	;require(function(module){
		var Gun = require('./core');

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
					max: backoff.max || 2000,
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
