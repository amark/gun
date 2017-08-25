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
		Type.obj.as = function(o, f, v, u){ return o[f] = o[f] || (u === v? {} : v) }
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
					ll = keys(l); lle = true;
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
		module.exports = function onto(tag, arg, as){
			if(!tag){ return {to: onto} }
			var tag = (this.tag || (this.tag = {}))[tag] ||
			(this.tag[tag] = {tag: tag, to: onto._ = {
				next: function(){}
			}});
			if(arg instanceof Function){
				var be = {
					off: onto.off || 
					(onto.off = function(){
						if(this.next === onto._.next){ return !0 }
						if(this === this.the.last){
							this.the.last = this.back;
						}
						this.to.back = this.back;
						this.next = onto._.next;
						this.back.to = this.to;
						if(this.the.last === this.the){
							delete this.on.tag[this.the.tag];
						}
					}),
					to: onto._,
					next: arg,
					the: tag,
					on: this,
					as: as,
				};
				(be.back = tag.last || tag).to = be;
				return tag.last = be;
			}
			(tag = tag.to).next(arg);
			return tag;
		};
	})(require, './onto');

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
				incomingValue = Lexical(incomingValue) || "";
				currentValue = Lexical(currentValue) || "";
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
				if(incomingValue < currentValue){ // Lexical only works on simple value types!
					return {converge: true, current: true};
				}
				if(currentValue < incomingValue){ // Lexical only works on simple value types!
					return {converge: true, incoming: true};
				}
			}
			return {err: "Invalid CRDT Data: "+ incomingValue +" to "+ currentValue +" at "+ incomingState +" to "+ currentState +"!"};
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
			if(v === u){ return false }
			if(v === null){ return true } // "deletes", nulling out fields.
			if(v === Infinity){ return false } // we want this to be, but JSON does not support it, sad face.
			if(text_is(v) // by "text" we mean strings.
			|| bi_is(v) // by "binary" we mean boolean.
			|| num_is(v)){ // by "number" we mean integers or decimals. 
				return true; // simple values are valid.
			}
			return Val.rel.is(v) || false; // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
		}
		Val.rel = {_: '#'};
		;(function(){
			Val.rel.is = function(v){ // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
				if(v && v[rel_] && !v._ && obj_is(v)){ // must be an object.
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
				if(f == rel_ && text_is(s)){ // the field should be '#' and have a text value.
					o.id = s; // we found the soul!
				} else {
					return o.id = false; // if there exists anything else on the object that isn't the soul, then it is considered invalid.
				}
			}
		}());
		Val.rel.ify = function(t){ return obj_put({}, rel_, t) } // convert a soul into a relation and return it.
		var rel_ = Val.rel._, u;
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
		Node.soul = function(n, o){ return (n && n._ && n._[o || soul_]) } // convenience function to check to see if there is a soul on a node and return it.
		Node.soul.ify = function(n, o){ // put a soul on an object.
			o = (typeof o === 'string')? {soul: o} : o || {};
			n = n || {}; // make sure it exists.
			n._ = n._ || {}; // make sure meta exists.
			n._[soul_] = o.soul || n._[soul_] || text_random(); // put the soul on it.
			return n;
		}
		Node.soul._ = Val.rel._;
		;(function(){
			Node.is = function(n, cb, as){ var s; // checks to see if an object is a valid node.
				if(!obj_is(n)){ return false } // must be an object.
				if(s = Node.soul(n)){ // must have a soul on it.
					return !obj_map(n, map, {as:as,cb:cb,s:s,n:n});
				}
				return false; // nope! This was not a valid node.
			}
			function map(v, f){ // we invert this because the way we check for this is via a negation.
				if(f === Node._){ return } // skip over the metadata.
				if(!Val.is(v)){ return true } // it is true that this is an invalid node.
				if(this.cb){ this.cb.call(this.as, v, f, this.n, this.s) } // optionally callback each field/value.
			}
		}());
		;(function(){
			Node.ify = function(obj, o, as){ // returns a node from a shallow object.
				if(!o){ o = {} }
				else if(typeof o === 'string'){ o = {soul: o} }
				else if(o instanceof Function){ o = {map: o} }
				if(o.map){ o.node = o.map.call(as, obj, u, o.node || {}) }
				if(o.node = Node.soul.ify(o.node || {}, o)){
					obj_map(obj, map, {o:o,as:as});
				}
				return o.node; // This will only be a valid node if the object wasn't already deep!
			}
			function map(v, f){ var o = this.o, tmp, u; // iterate over each field/value.
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
		var soul_ = Node.soul._;
		var u;
		module.exports = Node;
	})(require, './node');

	;require(function(module){
		var Type = require('./type');
		var Node = require('./node');
		function State(){
			var t;
			if(perf){
				t = start + perf.now();
			} else {
				t = time();
			}
			if(last < t){
				return N = 0, last = t + State.drift;
			}
			return last = t + ((N += 1) / D) + State.drift;
		}
		var time = Type.time.is, last = -Infinity, N = 0, D = 1000; // WARNING! In the future, on machines that are D times faster than 2016AD machines, you will want to increase D by another several orders of magnitude so the processing speed never out paces the decimal resolution (increasing an integer effects the state accuracy).
		var perf = (typeof performance !== 'undefined')? (performance.timing && performance) : false, start = (perf && perf.timing && perf.timing.navigationStart) || (perf = false);
		State._ = '>';
		State.drift = 0;
		State.is = function(n, f, o){ // convenience function to get the state on a field on a node and return it.
			var tmp = (f && n && n[N_] && n[N_][State._]) || o;
			if(!tmp){ return }
			return num_is(tmp = tmp[f])? tmp : -Infinity;
		}
		State.ify = function(n, f, s, v, soul){ // put a field's state on a node.
			if(!n || !n[N_]){ // reject if it is not node-like.
				if(!soul){ // unless they passed a soul
					return; 
				}
				n = Node.soul.ify(n, soul); // then make it so!
			} 
			var tmp = obj_as(n[N_], State._); // grab the states data.
			if(u !== f && f !== N_){
				if(num_is(s)){
					tmp[f] = s; // add the valid state.
				}
				if(u !== v){ // Note: Not its job to check for valid values!
					n[f] = v;
				}
			}
			return n;
		}
		State.to = function(from, f, to){
			var val = from[f];
			if(obj_is(val)){
				val = obj_copy(val);
			}
			return State.ify(to, f, State.is(from, f), val, Node.soul(from));
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
		var obj = Type.obj, obj_as = obj.as, obj_has = obj.has, obj_is = obj.is, obj_map = obj.map, obj_copy = obj.copy;
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
				return !obj_map(g, map, {cb:cb,fn:fn,as:as}); // makes sure it wasn't an empty object.
			}
			function map(n, s){ // we invert this because the way'? we check for this is via a negation.
				if(!n || s !== Node.soul(n) || !Node.is(n, this.fn, this.as)){ return true } // it is true that this is an invalid graph.
				if(!this.cb){ return }
				nf.n = n; nf.as = this.as; // sequential race conditions aren't races.
				this.cb.call(nf.as, n, s, nf);
			}
			function nf(fn){ // optional callback for each node.
				if(fn){ Node.is(nf.n, fn, nf.as) } // where we then have an optional callback for each field/value.
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
					//at.rel = at.rel || Val.rel.ify(Node.soul(at.node));
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
					at.rel = at.rel || Val.rel.ify(Node.soul(at.node));
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
		function Dup(opt){
			var dup = {s:{}};
			opt = opt || {max: 1000, age: 1000 * 9};//1000 * 60 * 2};
			dup.check = function(id){
				return dup.s[id]? dup.track(id) : false;
			}
			dup.track = function(id){
				dup.s[id] = time_is();
				if(!dup.to){
					dup.to = setTimeout(function(){
						Type.obj.map(dup.s, function(time, id){
							if(opt.age > (time_is() - time)){ return }
							Type.obj.del(dup.s, id);
						});
						dup.to = null;
					}, opt.age);
				}
				return id;
			}
			return dup;
		}
		var time_is = Type.time.is;
		module.exports = Dup;
	})(require, './dup');

	;require(function(module){

		function Gun(o){
			if(o instanceof Gun){ return (this._ = {gun: this}).gun }
			if(!(this instanceof Gun)){ return new Gun(o) }
			return Gun.create(this._ = {gun: this, opt: o});
		}

		Gun.is = function(gun){ return (gun instanceof Gun) }

		Gun.version = 0.8;

		Gun.chain = Gun.prototype;
		Gun.chain.toJSON = function(){};

		var Type = require('./type');
		Type.obj.to(Type, Gun);
		Gun.HAM = require('./HAM');
		Gun.val = require('./val');
		Gun.node = require('./node');
		Gun.state = require('./state');
		Gun.graph = require('./graph');
		Gun.dup = require('./dup');
		Gun.on = require('./onto');
		
		Gun._ = { // some reserved key words, these are not the only ones.
			node: Gun.node._ // all metadata of a node is stored in the meta property on the node.
			,soul: Gun.val.rel._ // a soul is a UUID of a node but it always points to the "latest" data known.
			,state: Gun.state._ // other than the soul, we store HAM metadata.
			,field: '.' // a field is a property on a node which points to a value.
			,value: '=' // the primitive value.
		}

		;(function(){
			Gun.create = function(at){
				at.on = at.on || Gun.on;
				at.root = at.root || at.gun;
				at.graph = at.graph || {};
				at.dup = at.dup || Gun.dup();
				at.ask = Gun.on.ask;
				at.ack = Gun.on.ack;
				var gun = at.gun.opt(at.opt);
				if(!at.once){
					at.on('in', root, at);
					at.on('out', root, at);
				}
				at.once = 1;
				return gun;
			}
			function root(at){
				//console.log("add to.next(at)"); // TODO: BUG!!!
				var ev = this, cat = ev.as, coat, tmp;
				if(!at.gun){ at.gun = cat.gun }
				if(!(tmp = at['#'])){ tmp = at['#'] = text_rand(9) }
				if(cat.dup.check(tmp)){ return }
				cat.dup.track(tmp);
				coat = obj_to(at, {gun: cat.gun});
				if(!cat.ack(at['@'], at)){
					if(at.get){
						Gun.on.get(coat);
						//cat.on('get', get(coat));
					}
					if(at.put){
						Gun.on.put(coat);
						//cat.on('put', put(coat));
					}
				}
				cat.on('out', coat);
			}
		}());

		;(function(){
			Gun.on.put = function(at){
				var cat = at.gun._, ctx = {gun: at.gun, graph: at.gun._.graph, put: {}, map: {}, machine: Gun.state()};
				if(!Gun.graph.is(at.put, null, verify, ctx)){ ctx.err = "Error: Invalid graph!" }
				if(ctx.err){ return cat.on('in', {'@': at['#'], err: Gun.log(ctx.err) }) }
				obj_map(ctx.put, merge, ctx);
				obj_map(ctx.map, map, ctx);
				if(u !== ctx.defer){
					setTimeout(function(){
						Gun.on.put(at);
					}, ctx.defer - cat.machine);
				}
				if(!ctx.diff){ return }
				cat.on('put', obj_to(at, {put: ctx.diff}));
			};
			function verify(val, key, node, soul){ var ctx = this;
				var state = Gun.state.is(node, key), tmp;
				if(!state){ return ctx.err = "Error: No state on '"+key+"' in node '"+soul+"'!" }
				var vertex = ctx.graph[soul] || empty, was = Gun.state.is(vertex, key, true), known = vertex[key];
				var HAM = Gun.HAM(ctx.machine, state, was, val, known);
				if(!HAM.incoming){
					if(HAM.defer){ // pick the lowest
						ctx.defer = (state < (ctx.defer || Infinity))? state : ctx.defer;
					}
					return;
				}
				ctx.put[soul] = Gun.state.to(node, key, ctx.put[soul]);
				(ctx.diff || (ctx.diff = {}))[soul] = Gun.state.to(node, key, ctx.diff[soul]);
			}
			function merge(node, soul){
				var cat = this.gun._, ref = (cat.next || empty)[soul];
				if(!ref){ return }
				var at = this.map[soul] = {
					put: this.node = node,
					get: this.soul = soul,
					gun: this.ref = ref
				};
				obj_map(node, each, this);
				cat.on('node', at);
			}
			function each(val, key){
				var graph = this.graph, soul = this.soul, cat = (this.ref._), tmp;
				graph[soul] = Gun.state.to(this.node, key, graph[soul]);
				(cat.put || (cat.put = {}))[key] = val;
			}
			function map(at, soul){
				if(!at.gun){ return }
				(at.gun._).on('in', at);
			}

			Gun.on.get = function(at){
				var cat = at.gun._, soul = at.get[_soul], node = cat.graph[soul], field = at.get[_field], tmp;
				var next = cat.next || (cat.next = {}), as = ((next[soul] || empty)._);
				if(!node || !as){ return cat.on('get', at) }
				if(field){
					if(!obj_has(node, field)){ return cat.on('get', at) }
					node = Gun.state.to(node, field);
				} else {
					node = Gun.obj.copy(node);
				}
				node = Gun.graph.node(node);
				tmp = as.ack;
				cat.on('in', {
					'@': at['#'],
					how: 'mem',
					put: node,
					gun: as.gun
				});
				if(0 < tmp){
					return;
				}
				cat.on('get', at);
			}
		}());
		
		;(function(){
			Gun.on.ask = function(cb, as){
				if(!this.on){ return }
				var id = text_rand(9);
				if(cb){ 
					var to = this.on(id, cb, as);
					to.err = setTimeout(function(){
						to.next({err: "Error: No ACK received yet."});
						to.off();
					}, 1000 * 9); // TODO: Make configurable!!!
				}
				return id;
			}
			Gun.on.ack = function(at, reply){
				if(!at || !reply || !this.on){ return }
				var id = at['#'] || at, tmp = (this.tag||empty)[id];
				if(!tmp){ return }
				this.on(id, reply);
				clearTimeout(tmp.err);
				return true;
			}
		}());

		;(function(){
			Gun.chain.opt = function(opt){
				opt = opt || {};
				var gun = this, at = gun._, tmp = opt.peers || opt;
				if(!obj_is(opt)){ opt = {} }
				if(!obj_is(at.opt)){ at.opt = opt }
				if(text_is(tmp)){ tmp = [tmp] }
				if(list_is(tmp)){
					tmp = obj_map(tmp, function(url, i, map){
						map(url, {url: url});
					});
					if(!obj_is(at.opt.peers)){ at.opt.peers = {}}
					at.opt.peers = obj_to(tmp, at.opt.peers);
				}
				at.opt.uuid = at.opt.uuid || function(){ 
					return state().toString(36).replace('.','') + text_rand(12);
				}
				at.opt.peers = at.opt.peers || {};
				obj_to(opt, at.opt); // copies options on to `at.opt` only if not already taken.
				Gun.on('opt', at);
				return gun;
			}
		}());

		var list_is = Gun.list.is;
		var text = Gun.text, text_is = text.is, text_rand = text.random;
		var obj = Gun.obj, obj_is = obj.is, obj_has = obj.has, obj_to = obj.to, obj_map = obj.map, obj_copy = obj.copy;
		var state = Gun.state, _soul = Gun._.soul, _field = Gun._.field, rel_is = Gun.val.rel.is;
		var empty = {}, u;

		console.debug = function(i, s){ return (console.debug.i && i === console.debug.i && console.debug.i++) && (console.log.apply(console, arguments) || s) };

		Gun.log = function(){ return (!Gun.log.off && console.log.apply(console, arguments)), [].slice.call(arguments).join(' ') }
		Gun.log.once = function(w,s,o){ return (o = Gun.log.once)[w] = o[w] || 0, o[w]++ || Gun.log(s) }

		;"Please do not remove these messages unless you are paying for a monthly sponsorship, thanks!";
		Gun.log.once("welcome", "Hello wonderful person! :) Thanks for using GUN, feel free to ask for help on https://gitter.im/amark/gun and ask StackOverflow questions tagged with 'gun'!");
		;"Please do not remove these messages unless you are paying for a monthly sponsorship, thanks!";
		
		if(typeof window !== "undefined"){ window.Gun = Gun }
		if(typeof common !== "undefined"){ common.exports = Gun }
		module.exports = Gun;

		Gun.log.once("0.8", "0.8 WARNING! Breaking changes, test that your app works before upgrading! The adapter interface has been upgraded (non-default storage and transport layers probably won't work). Also, `.path()` and `.not()` are outside core and now in 'lib/'.");
	})(require, './root');

	;require(function(module){
		var Gun = require('./root');
		Gun.chain.back = function(n, opt){ var tmp;
			if(-1 === n || Infinity === n){
				return this._.root;
			} else
			if(1 === n){
				return this._.back || this;
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
				if((tmp = at.back)){
					return tmp.back(n, opt);
				}
				return;
			}
			if(n instanceof Function){
				var yes, tmp = {back: gun};
				while((tmp = tmp.back)
				&& (tmp = tmp._)
				&& !(yes = n(tmp, opt))){}
				return yes;
			}
		}
		var empty = {}, u;
	})(require, './back');

	;require(function(module){
		// WARNING: GUN is very simple, but the JavaScript chaining API around GUN
		// is complicated and was extremely hard to build. If you port GUN to another
		// language, consider implementing an easier API to build.
		var Gun = require('./root');
		Gun.chain.chain = function(){
			var at = this._, chain = new this.constructor(this), cat = chain._, root;
			cat.root = root = at.root;
			cat.id = ++root._.once;
			cat.back = this;
			cat.on = Gun.on;
			cat.on('in', input, cat); // For 'in' if I add my own listeners to each then I MUST do it before in gets called. If I listen globally for all incoming data instead though, regardless of individual listeners, I can transform the data there and then as well.
			cat.on('out', output, cat); // However for output, there isn't really the global option. I must listen by adding my own listener individually BEFORE this one is ever called.
			return chain;
		}
		function output(at){
			var cat = this.as, gun = cat.gun, root = gun.back(-1), put, get, now, tmp;
			if(!at.gun){
				at.gun = gun;
			}
			this.to.next(at);
			if(get = at.get){
				if(tmp = get[_soul]){
					tmp = (root.get(tmp)._);
					if(obj_has(get, _field)){
						if(obj_has(put = tmp.put, get = get[_field])){
							tmp.on('in', {get: tmp.get, put: Gun.state.to(put, get), gun: tmp.gun}); // TODO: Ugly, clean up? Simplify all these if conditions (without ruining the whole chaining API)?
						}
					} else
					if(obj_has(tmp, 'put')){
					//if(u !== tmp.put){
						tmp.on('in', tmp);
					}
				} else {
					if(obj_has(get, _field)){
						get = get[_field];
						var next = get? (gun.get(get)._) : cat;
						// TODO: BUG! Handle plural chains by iterating over them.
						//if(obj_has(next, 'put')){ // potentially incorrect? Maybe?
						if(u !== next.put){ // potentially incorrect? Maybe?
							//next.tag['in'].last.next(next);
							next.on('in', next);
							return;
						}
						if(obj_has(cat, 'put')){
						//if(u !== cat.put){
							var val = cat.put, rel;
							if(rel = Gun.node.soul(val)){
								val = Gun.val.rel.ify(rel);
							}
							if(rel = Gun.val.rel.is(val)){
								if(!at.gun._){ return }
								(at.gun._).on('out', {
									get: tmp = {'#': rel, '.': get, gun: at.gun},
									'#': root._.ask(ack, tmp),
									gun: at.gun
								});
								return;
							}
							if(u === val || Gun.val.is(val)){
								if(!at.gun._){ return }
								(at.gun._).on('in', {
									get: get,
									gun: at.gun
								});
								return;
							}
						} else
						if(cat.map){
							obj_map(cat.map, function(proxy){
								proxy.at.on('in', proxy.at);
							});
						};
						if(cat.soul){
							if(!at.gun._){ return }
							(at.gun._).on('out', {
								get: tmp = {'#': cat.soul, '.': get, gun: at.gun},
								'#': root._.ask(ack, tmp),
								gun: at.gun
							});
							return;
						}
						if(cat.get){
							if(!cat.back._){ return }
							(cat.back._).on('out', {
								get: obj_put({}, _field, cat.get),
								gun: gun
							});
							return;
						}
						at = obj_to(at, {get: {}});
					} else {
						if(obj_has(cat, 'put')){
						//if(u !== cat.put){
							cat.on('in', cat);
						} else
						if(cat.map){
							obj_map(cat.map, function(proxy){
								proxy.at.on('in', proxy.at);
							});
						}
						if(cat.ack >= 0){
							if(!obj_has(cat, 'put')){ // u !== cat.put instead?
							//if(u !== cat.put){
								return;
							}
						}
						cat.ack = -1;
						if(cat.soul){
							cat.on('out', {
								get: tmp = {'#': cat.soul, gun: cat.gun},
								'#': root._.ask(ack, tmp),
								gun: cat.gun
							});
							return;
						}
						if(cat.get){
							if(!cat.back._){ return }
							(cat.back._).on('out', {
								get: obj_put({}, _field, cat.get),
								gun: cat.gun
							});
							return;
						}
					}
				}
			}
			(cat.back._).on('out', at);
		}
		function input(at){
			at = at._ || at;
			var ev = this, cat = this.as, gun = at.gun, coat = gun._, change = at.put, back = cat.back._ || empty, rel, tmp;
			if(0 > cat.ack && !at.ack && !Gun.val.rel.is(change)){ // for better behavior?
				cat.ack = 1;
			}
			if(cat.get && at.get !== cat.get){
				at = obj_to(at, {get: cat.get});
			}
			if(cat.field && coat !== cat){
				at = obj_to(at, {gun: cat.gun});
				if(coat.ack){
					cat.ack = cat.ack || coat.ack;
				}
			}
			if(u === change){
				ev.to.next(at);
				if(cat.soul){ return }
				echo(cat, at, ev);
				if(cat.field){
					not(cat, at);
				}
				obj_del(coat.echo, cat.id);
				obj_del(cat.map, coat.id);
				return;
			}
			if(cat.soul){
				if(cat.root._.now){ at = obj_to(at, {put: change = coat.put}) } // TODO: Ugly hack for uncached synchronous maps.
				ev.to.next(at);
				echo(cat, at, ev);
				obj_map(change, map, {at: at, cat: cat});
				return;
			}
			if(!(rel = Gun.val.rel.is(change))){
				if(Gun.val.is(change)){
					if(cat.field || cat.soul){
						not(cat, at);
					} else
					if(coat.field || coat.soul){
						(coat.echo || (coat.echo = {}))[cat.id] = cat;
						(cat.map || (cat.map = {}))[coat.id] = cat.map[coat.id] || {at: coat};
						//if(u === coat.put){ return } // Not necessary but improves performance. If we have it but coat does not, that means we got things out of order and coat will get it. Once coat gets it, it will tell us again.
					}
					ev.to.next(at);
					echo(cat, at, ev);
					return;
				}
				if(cat.field && coat !== cat && obj_has(coat, 'put')){
					cat.put = coat.put;
				};
				if((rel = Gun.node.soul(change)) && coat.field){
					coat.put = (cat.root.get(rel)._).put;
				}
				ev.to.next(at);
				echo(cat, at, ev);
				relate(cat, at, coat, rel);
				obj_map(change, map, {at: at, cat: cat});
				return;
			}
			relate(cat, at, coat, rel);
			ev.to.next(at);
			echo(cat, at, ev);
		}
		Gun.chain.chain.input = input;
		function relate(cat, at, coat, rel){
			if(!rel || node_ === cat.get){ return }
			var tmp = (cat.root.get(rel)._);
			if(cat.field){
				coat = tmp;
			} else 
			if(coat.field){
				relate(coat, at, coat, rel);
			}
			if(coat === cat){ return }
			(coat.echo || (coat.echo = {}))[cat.id] = cat;
			if(cat.field && !(cat.map||empty)[coat.id]){
				not(cat, at);
			}
			tmp = (cat.map || (cat.map = {}))[coat.id] = cat.map[coat.id] || {at: coat};
			if(rel === tmp.rel){ return }
			ask(cat, tmp.rel = rel);
		}
		function echo(cat, at, ev){
			if(!cat.echo){ return } // || node_ === at.get ????
			if(cat.field){ at = obj_to(at, {event: ev}) }
			obj_map(cat.echo, reverb, at);
		}
		function reverb(cat){
			cat.on('in', this);
		}
		function map(data, key){ // Map over only the changes on every update.
			var cat = this.cat, next = cat.next || empty, via = this.at, gun, chain, at, tmp;
			if(node_ === key && !next[key]){ return }
			if(!(gun = next[key])){
				return;
			}
			at = (gun._);
			//if(data && data[_soul] && (tmp = Gun.val.rel.is(data)) && (tmp = (cat.root.get(tmp)._)) && obj_has(tmp, 'put')){
			//	data = tmp.put;
			//}
			if(at.field){
				if(!(data && data[_soul] && Gun.val.rel.is(data) === Gun.node.soul(at.put))){
					at.put = data;
				}
				chain = gun;
			} else {
				chain = via.gun.get(key);
			}
			at.on('in', {
				put: data,
				get: key,
				gun: chain,
				via: via
			});
		}
		function not(cat, at){
			if(!(cat.field || cat.soul)){ return }
			var tmp = cat.map;
			cat.map = null;
			if(null === tmp){ return }
			if(u === tmp && cat.put !== u){ return } // TODO: Bug? Threw second condition in for a particular test, not sure if a counter example is tested though.
			obj_map(tmp, function(proxy){
				if(!(proxy = proxy.at)){ return }
				obj_del(proxy.echo, cat.id);
			});
			obj_map(cat.next, function(gun, key){
				var coat = (gun._);
				coat.put = u;
				if(coat.ack){
					coat.ack = -1;
				}
				coat.on('in', {
					get: key,
					gun: gun,
					put: u
				});
			});
		}
		function ask(cat, soul){
			var tmp = (cat.root.get(soul)._);
			if(cat.ack){
				tmp.ack = tmp.ack || -1;
				tmp.on('out', {
					get: tmp = {'#': soul, gun: tmp.gun},
					'#': cat.root._.ask(ack, tmp)
				});
				return;
			}
			obj_map(cat.next, function(gun, key){
				(gun._).on('out', {
					get: gun = {'#': soul, '.': key, gun: gun},
					'#': cat.root._.ask(ack, gun)
				});
			});
		}
		function ack(at, ev){
			var as = this.as, cat = as.gun._;
			if(!at.put || (as['.'] && !obj_has(at.put[as['#']], cat.get))){
				if(cat.put !== u){ return }
				cat.on('in', {
					get: cat.get,
					put: cat.put = u,
					gun: cat.gun,
				})
				return;
			}
			at.gun = cat.root;
			//Gun.on('put', at);
			Gun.on.put(at);
		}
		var empty = {}, u;
		var obj = Gun.obj, obj_has = obj.has, obj_put = obj.put, obj_del = obj.del, obj_to = obj.to, obj_map = obj.map;
		var _soul = Gun._.soul, _field = Gun._.field, node_ = Gun.node._;
	})(require, './chain');

	;require(function(module){
		var Gun = require('./root');
		Gun.chain.get = function(key, cb, as){
			if(typeof key === 'string'){
				var gun, back = this, cat = back._;
				var next = cat.next || empty, tmp;
				if(!(gun = next[key])){
					gun = cache(key, back);
				}
			} else
			if(key instanceof Function){
				var gun = this, at = gun._;
				as = cb || {};
				as.use = key;
				as.out = as.out || {cap: 1};
				as.out.get = as.out.get || {};
				'_' != at.get && ((at.root._).now = true); // ugly hack for now.
				at.on('in', use, as);
				at.on('out', as.out);
				(at.root._).now = false;
				return gun;
			} else
			if(num_is(key)){
				return this.get(''+key, cb, as);
			} else {
				(as = this.chain())._.err = {err: Gun.log('Invalid get request!', key)}; // CLEAN UP
				if(cb){ cb.call(as, as._.err) }
				return as;
			}
			if(tmp = cat.stun){ // TODO: Refactor?
				gun._.stun = gun._.stun || tmp;
			}
			if(cb && cb instanceof Function){
				gun.get(cb, as);
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
		function use(at){
			var ev = this, as = ev.as, gun = at.gun, cat = gun._, data = at.put, tmp;
			if(u === data){
				data = cat.put;
			}
			if((tmp = data) && tmp[rel._] && (tmp = rel.is(tmp))){
				tmp = (cat.root.get(tmp)._);
				if(u !== tmp.put){
					at = obj_to(at, {put: tmp.put});
				}
			}
			as.use(at, at.event || ev);
			ev.to.next(at);
		}
		var obj = Gun.obj, obj_has = obj.has, obj_to = Gun.obj.to;
		var num_is = Gun.num.is;
		var rel = Gun.val.rel, node_ = Gun.node._;
		var empty = {}, u;
	})(require, './get');

	;require(function(module){
		var Gun = require('./root');
		Gun.chain.put = function(data, cb, as){
			// #soul.field=value>state
			// ~who#where.where=what>when@was
			// TODO: BUG! Put probably cannot handle plural chains!
			var gun = this, at = (gun._), root = at.root, tmp;
			as = as || {};
			as.data = data;
			as.gun = as.gun || gun;
			if(typeof cb === 'string'){
				as.soul = cb;
			} else {
				as.ack = cb;
			}
			if(at.soul){
				as.soul = at.soul;
			}
			if(as.soul || root === gun){
				if(!obj_is(as.data)){
					(as.ack||noop).call(as, as.out = {err: Gun.log("Data saved to the root level of the graph must be a node (an object), not a", (typeof as.data), 'of "' + as.data + '"!')});
					if(as.res){ as.res() }
					return gun;
				}
				as.gun = gun = root.get(as.soul = as.soul || (as.not = Gun.node.soul(as.data) || ((root._).opt.uuid || Gun.text.random)()));
				as.ref = as.gun;
				ify(as);
				return gun;
			}
			if(Gun.is(data)){
				data.get(function(at,ev){ev.off();
					var s = Gun.node.soul(at.put);
					if(!s){Gun.log("The reference you are saving is a", typeof at.put, '"'+ as.put +'", not a node (object)!');return}
					gun.put(Gun.val.rel.ify(s), cb, as);
				});
				return gun;
			}
			as.ref = as.ref || (root === (tmp = at.back))? gun : tmp;
			if(as.ref._.soul && Gun.val.is(as.data) && at.get){
				as.data = obj_put({}, at.get, as.data);
				as.ref.put(as.data, as.soul, as);
				return gun;
			}
			as.ref.get('_').get(any, {as: as});
			if(!as.out){
				// TODO: Perf idea! Make a global lock, that blocks everything while it is on, but if it is on the lock it does the expensive lookup to see if it is a dependent write or not and if not then it proceeds full speed. Meh? For write heavy async apps that would be terrible.
				as.res = as.res || stun; // Gun.on.stun(as.ref); // TODO: BUG! Deal with locking?
				as.gun._.stun = as.ref._.stun;
			}
			return gun;
		};

		function ify(as){
			as.batch = batch;
			var opt = as.opt||{}, env = as.env = Gun.state.map(map, opt.state);
			env.soul = as.soul;
			as.graph = Gun.graph.ify(as.data, env, as);
			if(env.err){
				(as.ack||noop).call(as, as.out = {err: Gun.log(env.err)});
				if(as.res){ as.res() }
				return;
			}
			as.batch();
		}

		function stun(cb){
			if(cb){ cb() }
			return;
			var as = this;
			if(!as.ref){ return }
			if(cb){
				as.after = as.ref._.tag;
				as.now = as.ref._.tag = {};
				cb();
				return;
			}
			if(as.after){
				as.ref._.tag = as.after;
			}
		}

		function batch(){ var as = this;
			if(!as.graph || obj_map(as.stun, no)){ return }
			(as.res||iife)(function(){
				var cat = (as.gun.back(-1)._), ask = cat.ask(function(ack){
					this.off(); // One response is good enough for us currently. Later we may want to adjust this.
					if(!as.ack){ return }
					as.ack(ack, this);
				}, as.opt);
				(as.ref._).on('out', {
					gun: as.ref, put: as.out = as.env.graph, opt: as.opt, '#': ask
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
					ref = ref.get(path[i]);
				}
				if(as.not || Gun.node.soul(at.obj)){
					var id = Gun.node.soul(at.obj) || ((as.opt||{}).uuid || as.gun.back('opt.uuid') || Gun.text.random)();
					ref.back(-1).get(id);
					at.soul(id);
					return;
				}
				(as.stun = as.stun || {})[path] = true;
				ref.get('_').get(soul, {as: {at: at, as: as}});
			}, {as: as, at: at});
		}

		function soul(at, ev){ var as = this.as, cat = as.at; as = as.as;
			//ev.stun(); // TODO: BUG!?
			if(!at.gun || !at.gun._.back){ return } // TODO: Handle
			ev.off();
			at = (at.gun._.back._);
			var id = Gun.node.soul(cat.obj) || Gun.node.soul(at.put) || Gun.val.rel.is(at.put) || ((as.opt||{}).uuid || as.gun.back('opt.uuid') || Gun.text.random)(); // TODO: BUG!? Do we really want the soul of the object given to us? Could that be dangerous?
			at.gun.back(-1).get(id);
			cat.soul(id);
			as.stun[cat.path] = false;
			as.batch();
		}

		function any(at, ev){
			var as = this.as;
			if(!at.gun || !at.gun._){ return } // TODO: Handle
			if(at.err){ // TODO: Handle
				console.log("Please report this as an issue! Put.any.err");
				return;
			}
			var cat = (at.gun._.back._), data = cat.put, opt = as.opt||{}, root, tmp;
			ev.off();
			if(as.ref !== as.gun){
				tmp = (as.gun._).get || cat.get;
				if(!tmp){ // TODO: Handle
					console.log("Please report this as an issue! Put.no.get"); // TODO: BUG!??
					return;
				}
				as.data = obj_put({}, tmp, as.data);
				tmp = null;
			}
			if(u === data){
				if(!cat.get){ return } // TODO: Handle
				if(!cat.soul){
					tmp = cat.gun.back(function(at){
						if(at.soul){ return at.soul }
						as.data = obj_put({}, at.get, as.data);
					});
				}
				tmp = tmp || cat.get;
				cat = (cat.root.get(tmp)._);
				as.not = as.soul = tmp;
				data = as.data;
			}
			if(!as.not && !(as.soul = Gun.node.soul(data))){
				if(as.path && obj_is(as.data)){ // Apparently necessary
					as.soul = (opt.uuid || cat.root._.opt.uuid || Gun.text.random)();
				} else {
					//as.data = obj_put({}, as.gun._.get, as.data);
					as.soul = at.soul || cat.soul || (opt.uuid || cat.root._.opt.uuid || Gun.text.random)();
				}
			}
			as.ref.put(as.data, as.soul, as);
		}
		var obj = Gun.obj, obj_is = obj.is, obj_put = obj.put, obj_map = obj.map;
		var u, empty = {}, noop = function(){}, iife = function(fn,as){fn.call(as||empty)};
	})(require, './put');

	;require(function(module){
		var Gun = require('./root');
		require('./opt');
		require('./chain');
		require('./back');
		require('./put');
		require('./get');
		module.exports = Gun;
	})(require, './index');

	;require(function(module){
		var Gun = require('./index');
		Gun.chain.on = function(tag, arg, eas, as){
			var gun = this, at = gun._, tmp, act, off;
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
			gun.get(ok, opt); // TODO: PERF! Event listener leak!!!????
			return gun;
		}

		function ok(at, ev){ var opt = this;
			var gun = at.gun, cat = gun._, data = cat.put || at.put, tmp = opt.last, id = cat.id+at.get, tmp;
			if(u === data){
				return;
			}
			if(data && data[rel._] && (tmp = rel.is(data))){
				tmp = (cat.root.get(tmp)._);
				if(u === tmp.put){
					return;
				}
				data = tmp.put;
			}
			if(opt.change){ // TODO: BUG? Move above the undef checks?
				data = at.put;
			}
			// DEDUPLICATE // TODO: NEEDS WORK! BAD PROTOTYPE
			if(tmp.put === data && tmp.get === id && !Gun.node.soul(data)){ return }
			tmp.put = data;
			tmp.get = id;
			// DEDUPLICATE // TODO: NEEDS WORK! BAD PROTOTYPE
			cat.last = data;
			if(opt.as){
				opt.ok.call(opt.as, at, ev);
			} else {
				opt.ok.call(gun, data, at.get, at, ev);
			}
		}

		Gun.chain.val = function(cb, opt){
			var gun = this, at = gun._, data = at.put;
			if(0 < at.ack && u !== data){
				(cb || noop).call(gun, data, at.get);
				return gun;
			}
			if(cb){
				(opt = opt || {}).ok = cb;
				opt.cat = at;
				gun.get(val, {as: opt});
				opt.async = true; //opt.async = at.stun? 1 : true;
			} else {
				Gun.log.once("valonce", "Chainable val is experimental, its behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
				var chain = gun.chain();
				chain._.val = gun.val(function(){
					chain._.on('in', gun._);
				});
				return chain;
			}
			return gun;
		}

		function val(at, ev, to){
			var opt = this.as, cat = opt.cat, gun = at.gun, coat = gun._, data = coat.put || at.put, tmp;
			if(u === data){
				//return;
			}
			if(data && data[rel._] && (tmp = rel.is(data))){
				tmp = (cat.root.get(tmp)._);
				if(u === tmp.put){
					return;
				}
				data = tmp.put;
			}
			if(ev.wait){ clearTimeout(ev.wait) }
			//if(!to && (!(0 < coat.ack) || ((true === opt.async) && 0 !== opt.wait))){
			if(!opt.async){
				ev.wait = setTimeout(function(){
					val.call({as:opt}, at, ev, ev.wait || 1)
				}, opt.wait || 99);
				return;
			}
			if(cat.field || cat.soul){
				if(ev.off()){ return } // if it is already off, don't call again!
			} else {
				if((opt.seen = opt.seen || {})[coat.id]){ return }
				opt.seen[coat.id] = true;
			}
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
			if((tmp = gun.back(-1)) === back){
				obj_del(tmp.graph, at.get);
			}
			if(at.ons && (tmp = at.ons['@$'])){
				obj_map(tmp.s, function(ev){
					ev.off();
				});
			}
			return gun;
		}
		Gun.chain.off = function(){
			var gun = this, at = gun._, tmp;
			var back = at.back || {}, cat = back._;
			if(!cat){ return }
			if(tmp = cat.next){
				if(tmp[at.get]){
					obj_del(tmp, at.get);
				} else {

				}
			}
			if(tmp = at.soul){
				obj_del(cat.root._.graph, tmp);
			}
			return gun;
		}
		var obj = Gun.obj, obj_has = obj.has, obj_del = obj.del, obj_to = obj.to;
		var rel = Gun.val.rel;
		var empty = {}, noop = function(){}, u;
	})(require, './on');

	;require(function(module){
		var Gun = require('./index');
		Gun.chain.map = function(cb, opt, t){
			var gun = this, cat = gun._, chain;
			if(!cb){
				if(chain = cat.fields){ return chain }
				chain = cat.fields = gun.chain();
				chain._.val = gun.back('val');
				gun.on('in', map, chain._);
				return chain;
			}
			Gun.log.once("mapfn", "Map functions are experimental, their behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
			chain = gun.chain();
			gun.map().on(function(data, key, at, ev){
				var next = (cb||noop).call(this, data, key, at, ev);
				if(u === next){ return }
				if(Gun.is(next)){
					chain._.on('in', next._);
					return;
				}
				chain._.on('in', {get: key, put: next, gun: chain});
			});
			return chain;
		}
		function map(at){
			if(!at.put || Gun.val.is(at.put)){ return }
			if(this.as.val){ this.off() } // TODO: Ugly hack!
			obj_map(at.put, each, {cat: this.as, gun: at.gun});
			this.to.next(at);
		}
		function each(v,f){
			if(n_ === f){ return }
			var cat = this.cat, gun = this.gun.get(f), at = (gun._);
			(at.echo || (at.echo = {}))[cat.id] = cat;
		}
		var obj_map = Gun.obj.map, noop = function(){}, event = {stun: noop, off: noop}, n_ = Gun.node._, u;
	})(require, './map');

	;require(function(module){
		var Gun = require('./index');
		Gun.chain.set = function(item, cb, opt){
			var gun = this, soul;
			cb = cb || function(){};
			if(soul = Gun.node.soul(item)){ return gun.set(gun.back(-1).get(soul), cb, opt) }
			if(!Gun.is(item)){
				if(Gun.obj.is(item)){ return gun.set(gun._.root.put(item), cb, opt) }
				return gun.get(gun._.root._.opt.uuid()).put(item);
			}
			item.get('_').get(function(at, ev){
				if(!at.gun || !at.gun._.back){ return }
				ev.off();
				at = (at.gun._.back._);
				var put = {}, node = at.put, soul = Gun.node.soul(node);
				if(!soul){ return cb.call(gun, {err: Gun.log('Only a node can be linked! Not "' + node + '"!')}) }
				gun.put(Gun.obj.put(put, soul, Gun.val.rel.ify(soul)), cb, opt);
			},{wait:0});
			return item;
		}
	})(require, './set');

	;require(function(module){
		if(typeof Gun === 'undefined'){ return } // TODO: localStorage is Browser only. But it would be nice if it could somehow plugin into NodeJS compatible localStorage APIs?

		var root, noop = function(){}, u;
		if(typeof window !== 'undefined'){ root = window }
		var store = root.localStorage || {setItem: noop, removeItem: noop, getItem: noop};

		/*
			NOTE: Both `lib/file.js` and `lib/memdisk.js` are based on this design!
			If you update anything here, consider updating the other adapters as well.
		*/

		Gun.on('opt', function(ctx){
			this.to.next(ctx);
			var opt = ctx.opt;
			if(ctx.once){ return }
			if(false === opt.localStorage){ return }
			opt.file = opt.file || opt.prefix || 'gun/'; // support old option name.
			var graph = ctx.graph, acks = {}, count = 0, to;
			var disk = Gun.obj.ify(store.getItem(opt.file)) || {};
			
			ctx.on('put', function(at){
				this.to.next(at);
				Gun.graph.is(at.put, null, map);
				if(!at['@']){ acks[at['#']] = true; } // only ack non-acks.
				count += 1;
				if(count >= (opt.batch || 1000)){
					return flush();
				}
				if(to){ return }
				to = setTimeout(flush, opt.wait || 1);
			});

			ctx.on('get', function(at){
				this.to.next(at);
				var gun = at.gun, lex = at.get, soul, data, opt, u;
				//setTimeout(function(){
				if(!lex || !(soul = lex[Gun._.soul])){ return }
				//if(0 >= at.cap){ return }
				var field = lex['.'];
				data = disk[soul] || u;
				if(data && field){
					data = Gun.state.to(data, field);
				}
				if(!data && !Gun.obj.empty(gun.back('opt.peers'))){ // if data not found, don't ack if there are peers.
					return; // Hmm, what if we have peers but we are disconnected?
				}
				gun.on('in', {'@': at['#'], put: Gun.graph.node(data), how: 'lS'});
				//},11);
			});

			var map = function(val, key, node, soul){
				disk[soul] = Gun.state.to(node, key, disk[soul]);
			}

			var flush = function(){
				var err;
				count = 0;
				clearTimeout(to);
				to = false;
				var ack = acks;
				acks = {};
				try{store.setItem(opt.file, JSON.stringify(disk));
				}catch(e){ Gun.log(err = e || "localStorage failure") }
				if(!err && !Gun.obj.empty(opt.peers)){ return } // only ack if there are no peers.
				Gun.obj.map(ack, function(yes, id){
					ctx.on('in', {
						'@': id,
						err: err,
						ok: 0 // localStorage isn't reliable, so make its `ok` code be a low number.
					});
				});
			}
		});
	})(require, './adapters/localStorage');

	;require(function(module){
		var Gun = require('./index');
		var WebSocket;
		if(typeof window !== 'undefined'){
			WebSocket = window.WebSocket || window.webkitWebSocket || window.mozWebSocket;
		} else {
			return;
		}
		Gun.on('opt', function(ctx){
			this.to.next(ctx);
			var opt = ctx.opt;
			if(ctx.once){ return }
			if(false === opt.WebSocket){ return }
			var ws = opt.ws || (opt.ws = {}); ws.who = 0;
			Gun.obj.map(opt.peers, function(){ ++ws.who });
			if(ctx.once){ return }
			var batch;

			ctx.on('out', function(at){
				this.to.next(at);
				if(at.ws && 1 == ws.who){ return } // performance hack for reducing echoes.
				batch = JSON.stringify(at);
				if(ws.drain){
					ws.drain.push(batch);
					return;
				}
				ws.drain = [];
				setTimeout(function(){
					if(!ws.drain){ return }
					var tmp = ws.drain;
					ws.drain = null;
					if(!tmp.length){ return }
					batch = JSON.stringify(tmp);
					Gun.obj.map(opt.peers, send, ctx);
				}, opt.wait || 1);
				Gun.obj.map(opt.peers, send, ctx);
			});
			function send(peer){
				var ctx = this, msg = batch;
				var wire = peer.wire || open(peer, ctx);
				if(!wire){ return }
				if(wire.readyState === wire.OPEN){
					wire.send(msg);
					return;
				}
				(peer.queue = peer.queue || []).push(msg);
			}
			function receive(msg, peer, ctx){
				if(!ctx || !msg){ return }
				try{msg = JSON.parse(msg.data || msg);
				}catch(e){}
				if(msg instanceof Array){
					var i = 0, m;
					while(m = msg[i++]){
						receive(m, peer, ctx);
					}
					return;
				}
				if(1 == ws.who){ msg.ws = noop } // If there is only 1 client, just use noop since it doesn't matter.
				ctx.on('in', msg);
			}
			function open(peer, as){
				if(!peer || !peer.url){ return }
				var url = peer.url.replace('http', 'ws');
				var wire = peer.wire = new WebSocket(url);
				wire.onclose = function(){
					reconnect(peer, as);
				};
				wire.onerror = function(error){
					reconnect(peer, as); // placement?
					if(!error){ return }
					if(error.code === 'ECONNREFUSED'){
						//reconnect(peer, as);
					}
				};
				wire.onopen = function(){
					var queue = peer.queue;
					peer.queue = [];
					Gun.obj.map(queue, function(msg){
						batch = msg;
						send.call(as, peer);
					});
				}
				wire.onmessage = function(msg){
					receive(msg, peer, as); // diff: peer not wire!
				};
				return wire;
			}
			function reconnect(peer, as){
				clearTimeout(peer.defer);
				peer.defer = setTimeout(function(){
					open(peer, as);
				}, 2 * 1000);
			}
		});
		var noop = function(){};
	})(require, './adapters/websocket');

}());