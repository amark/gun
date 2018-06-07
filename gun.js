;(function(){

	/* UNBUILD */
	var root;
	if(typeof window !== "undefined"){ root = window }
	if(typeof global !== "undefined"){ root = global }
	root = root || {};
	var console = root.console || {log: function(){}};
	function USE(arg){
		return arg.slice? USE[R(arg)] : function(mod, path){
			arg(mod = {exports: {}});
			USE[R(path)] = mod.exports;
		}
		function R(p){
			return p.split('/').slice(-1).toString().replace('.js','');
		}
	}
	if(typeof module !== "undefined"){ var common = module }
	/* UNBUILD */

	;USE(function(module){
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
		Type.list.sort = function(k){ // creates a new sort function based off some key
			return function(A,B){
				if(!A || !B){ return 0 } A = A[k]; B = B[k];
				if(A < B){ return -1 }else if(A > B){ return 1 }
				else { return 0 }
			}
		}
		Type.list.map = function(l, c, _){ return obj_map(l, c, _) }
		Type.list.index = 1; // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
		Type.obj = {is: function(o){ return o? (o instanceof Object && o.constructor === Object) || Object.prototype.toString.call(o).match(/^\[object (\w+)\]$/)[1] === 'Object' : false }}
		Type.obj.put = function(o, k, v){ return (o||{})[k] = v, o }
		Type.obj.has = function(o, k){ return o && Object.prototype.hasOwnProperty.call(o, k) }
		Type.obj.del = function(o, k){
			if(!o){ return }
			o[k] = null;
			delete o[k];
			return o;
		}
		Type.obj.as = function(o, k, v, u){ return o[k] = o[k] || (u === v? {} : v) }
		Type.obj.ify = function(o){
			if(obj_is(o)){ return o }
			try{o = JSON.parse(o);
			}catch(e){o={}};
			return o;
		}
		;(function(){ var u;
			function map(v,k){
				if(obj_has(this,k) && u !== this[k]){ return }
				this[k] = v;
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
	})(USE, './type');

	;USE(function(module){
		// On event emitter generic javascript utility.
		module.exports = function onto(tag, arg, as){
			if(!tag){ return {to: onto} }
			var u, tag = (this.tag || (this.tag = {}))[tag] ||
			(this.tag[tag] = {tag: tag, to: onto._ = {
				next: function(arg){ var tmp;
					if((tmp = this.to)){ 
						tmp.next(arg);
				}}
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
			if((tag = tag.to) && u !== arg){ tag.next(arg) }
			return tag;
		};
	})(USE, './onto');

	;USE(function(module){
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
	})(USE, './HAM');

	;USE(function(module){
		var Type = USE('./type');
		var Val = {};
		Val.is = function(v){ // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
			if(v === u){ return false }
			if(v === null){ return true } // "deletes", nulling out keys.
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
			function map(s, k){ var o = this; // map over the object...
				if(o.id){ return o.id = false } // if ID is already defined AND we're still looping through the object, it is considered invalid.
				if(k == rel_ && text_is(s)){ // the key should be '#' and have a text value.
					o.id = s; // we found the soul!
				} else {
					return o.id = false; // if there exists anything else on the object that isn't the soul, then it is considered invalid.
				}
			}
		}());
		Val.rel.ify = function(t){ return obj_put({}, rel_, t) } // convert a soul into a relation and return it.
		Type.obj.has._ = '.';
		var rel_ = Val.rel._, u;
		var bi_is = Type.bi.is;
		var num_is = Type.num.is;
		var text_is = Type.text.is;
		var obj = Type.obj, obj_is = obj.is, obj_put = obj.put, obj_map = obj.map;
		module.exports = Val;
	})(USE, './val');

	;USE(function(module){
		var Type = USE('./type');
		var Val = USE('./val');
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
			function map(v, k){ // we invert this because the way we check for this is via a negation.
				if(k === Node._){ return } // skip over the metadata.
				if(!Val.is(v)){ return true } // it is true that this is an invalid node.
				if(this.cb){ this.cb.call(this.as, v, k, this.n, this.s) } // optionally callback each key/value.
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
			function map(v, k){ var o = this.o, tmp, u; // iterate over each key/value.
				if(o.map){
					tmp = o.map.call(this.as, v, ''+k, o.node);
					if(u === tmp){
						obj_del(o.node, k);
					} else
					if(o.node){ o.node[k] = tmp }
					return;
				}
				if(Val.is(v)){
					o.node[k] = v;
				}
			}
		}());
		var obj = Type.obj, obj_is = obj.is, obj_del = obj.del, obj_map = obj.map;
		var text = Type.text, text_random = text.random;
		var soul_ = Node.soul._;
		var u;
		module.exports = Node;
	})(USE, './node');

	;USE(function(module){
		var Type = USE('./type');
		var Node = USE('./node');
		function State(){
			var t;
			/*if(perf){
				t = start + perf.now(); // Danger: Accuracy decays significantly over time, even if precise.
			} else {*/
				t = time();
			//}
			if(last < t){
				return N = 0, last = t + State.drift;
			}
			return last = t + ((N += 1) / D) + State.drift;
		}
		var time = Type.time.is, last = -Infinity, N = 0, D = 1000; // WARNING! In the future, on machines that are D times faster than 2016AD machines, you will want to increase D by another several orders of magnitude so the processing speed never out paces the decimal resolution (increasing an integer effects the state accuracy).
		var perf = (typeof performance !== 'undefined')? (performance.timing && performance) : false, start = (perf && perf.timing && perf.timing.navigationStart) || (perf = false);
		State._ = '>';
		State.drift = 0;
		State.is = function(n, k, o){ // convenience function to get the state on a key on a node and return it.
			var tmp = (k && n && n[N_] && n[N_][State._]) || o;
			if(!tmp){ return }
			return num_is(tmp = tmp[k])? tmp : -Infinity;
		}
		State.lex = function(){ return State().toString(36).replace('.','') }
		State.ify = function(n, k, s, v, soul){ // put a key's state on a node.
			if(!n || !n[N_]){ // reject if it is not node-like.
				if(!soul){ // unless they passed a soul
					return; 
				}
				n = Node.soul.ify(n, soul); // then make it so!
			} 
			var tmp = obj_as(n[N_], State._); // grab the states data.
			if(u !== k && k !== N_){
				if(num_is(s)){
					tmp[k] = s; // add the valid state.
				}
				if(u !== v){ // Note: Not its job to check for valid values!
					n[k] = v;
				}
			}
			return n;
		}
		State.to = function(from, k, to){
			var val = from[k];
			if(obj_is(val)){
				val = obj_copy(val);
			}
			return State.ify(to, k, State.is(from, k), val, Node.soul(from));
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
				return function(v, k, o, opt){
					if(!cb){
						map.call({o: o, s: s}, v,k);
						return v;
					}
					cb.call(as || this || {}, v, k, o, opt);
					if(obj_has(o,k) && u === o[k]){ return }
					map.call({o: o, s: s}, v,k);
				}
			}
			function map(v,k){
				if(N_ === k){ return }
				State.ify(this.o, k, this.s) ;
			}
		}());
		var obj = Type.obj, obj_as = obj.as, obj_has = obj.has, obj_is = obj.is, obj_map = obj.map, obj_copy = obj.copy;
		var num = Type.num, num_is = num.is;
		var fn = Type.fn, fn_is = fn.is;
		var N_ = Node._, u;
		module.exports = State;
	})(USE, './state');

	;USE(function(module){
		var Type = USE('./type');
		var Val = USE('./val');
		var Node = USE('./node');
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
				if(fn){ Node.is(nf.n, fn, nf.as) } // where we then have an optional callback for each key/value.
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
			function map(v,k,n){
				var at = this, env = at.env, is, tmp;
				if(Node._ === k && obj_has(v,Val.rel._)){
					return n._; // TODO: Bug?
				}
				if(!(is = valid(v,k,n, at,env))){ return }
				if(!k){
					at.node = at.node || n || {};
					if(obj_has(v, Node._)){ // && Node.soul(v) ? for safety ?
						at.node._ = obj_copy(v._);
					}
					at.node = Node.soul.ify(at.node, Val.rel.is(at.rel));
					at.rel = at.rel || Val.rel.ify(Node.soul(at.node));
				}
				if(tmp = env.map){
					tmp.call(env.as || {}, v,k,n, at);
					if(obj_has(n,k)){
						v = n[k];
						if(u === v){
							obj_del(n, k);
							return;
						}
						if(!(is = valid(v,k,n, at,env))){ return }
					}
				}
				if(!k){ return at.node }
				if(true === is){
					return v;
				}
				tmp = node(env, {obj: v, path: at.path.concat(k)});
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
			function valid(v,k,n, at,env){ var tmp;
				if(Val.is(v)){ return true }
				if(obj_is(v)){ return 1 }
				if(tmp = env.invalid){
					v = tmp.call(env.as || {}, v,k,n);
					return valid(v,k,n, at,env);
				}
				env.err = "Invalid value at '" + at.path.concat(k).join('.') + "'!";
				if(Type.list.is(v)){ env.err += " Use `.set(item)` instead of an Array." }
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
			function map(v,k){ var tmp, obj;
				if(Node._ === k){
					if(obj_empty(v, Val.rel._)){
						return;
					}
					this.obj[k] = obj_copy(v);
					return;
				}
				if(!(tmp = Val.rel.is(v))){
					this.obj[k] = v;
					return;
				}
				if(obj = this.opt.seen[tmp]){
					this.obj[k] = obj;
					return;
				}
				this.obj[k] = this.opt.seen[tmp] = Graph.to(this.graph, tmp, this.opt);
			}
		}());
		var fn_is = Type.fn.is;
		var obj = Type.obj, obj_is = obj.is, obj_del = obj.del, obj_has = obj.has, obj_empty = obj.empty, obj_put = obj.put, obj_map = obj.map, obj_copy = obj.copy;
		var u;
		module.exports = Graph;
	})(USE, './graph');

	;USE(function(module){
		// request / response module, for asking and acking messages.
		USE('./onto'); // depends upon onto!
		module.exports = function ask(cb, as){
			if(!this.on){ return }
			if(!(cb instanceof Function)){
				if(!cb || !as){ return }
				var id = cb['#'] || cb, tmp = (this.tag||empty)[id];
				if(!tmp){ return }
				tmp = this.on(id, as);
				clearTimeout(tmp.err);
				return true;
			}
			var id = (as && as['#']) || Math.random().toString(36).slice(2);
			if(!cb){ return id }
			var to = this.on(id, cb, as);
			to.err = to.err || setTimeout(function(){
				to.next({err: "Error: No ACK received yet."});
				to.off();
			}, (this.opt||{}).lack || 9000);
			return id;
		}
	})(USE, './ask');

	;USE(function(module){
		var Type = USE('./type');
		function Dup(opt){
			var dup = {s:{}};
			opt = opt || {max: 1000, age: 1000 * 9};//1000 * 60 * 2};
			dup.check = function(id){ var tmp;
				if(!(tmp = dup.s[id])){ return false }
				if(tmp.pass){ return tmp.pass = false }
				return dup.track(id);
			}
			dup.track = function(id, pass){
				var it = dup.s[id] || (dup.s[id] = {});
				it.was = time_is();
				if(pass){ it.pass = true }
				if(!dup.to){
					dup.to = setTimeout(function(){
						var now = time_is();
						Type.obj.map(dup.s, function(it, id){
							if(opt.age > (now - it.was)){ return }
							Type.obj.del(dup.s, id);
						});
						dup.to = null;
					}, opt.age + 9);
				}
				return it;
			}
			return dup;
		}
		var time_is = Type.time.is;
		module.exports = Dup;
	})(USE, './dup');

	;USE(function(module){

		function Gun(o){
			if(o instanceof Gun){ return (this._ = {gun: this}).gun }
			if(!(this instanceof Gun)){ return new Gun(o) }
			return Gun.create(this._ = {gun: this, opt: o});
		}

		Gun.is = function(gun){ return (gun instanceof Gun) || (gun && gun._ && gun._.gun && true) || false }

		Gun.version = 0.9;

		Gun.chain = Gun.prototype;
		Gun.chain.toJSON = function(){};

		var Type = USE('./type');
		Type.obj.to(Type, Gun);
		Gun.HAM = USE('./HAM');
		Gun.val = USE('./val');
		Gun.node = USE('./node');
		Gun.state = USE('./state');
		Gun.graph = USE('./graph');
		Gun.on = USE('./onto');
		Gun.ask = USE('./ask');
		Gun.dup = USE('./dup');

		;(function(){
			Gun.create = function(at){
				at.root = at.root || at;
				at.graph = at.graph || {};
				at.on = at.on || Gun.on;
				at.ask = at.ask || Gun.ask;
				at.dup = at.dup || Gun.dup();
				var gun = at.gun.opt(at.opt);
				if(!at.once){
					at.on('in', root, at);
					at.on('out', root, obj_to(at, {out: root}));
					Gun.on('create', at);
					at.on('create', at);
				}
				at.once = 1;
				return gun;
			}
			function root(msg){
				//console.log("add to.next(at)"); // TODO: MISSING FEATURE!!!
				var ev = this, at = ev.as, gun = at.gun, dup, tmp;
				//if(!msg.gun){ msg.gun = at.gun }
				if(!(tmp = msg['#'])){ tmp = msg['#'] = text_rand(9) }
				if((dup = at.dup).check(tmp)){
					if(at.out === msg.out){
						msg.out = u;
						ev.to.next(msg);
					}
					return;
				}
				dup.track(tmp);
				//msg = obj_to(msg);//, {gun: at.gun}); // can we delete this now?
				if(!at.ask(msg['@'], msg)){
					if(msg.get){
						Gun.on.get(msg, gun);
						//at.on('get', get(msg));
					}
					if(msg.put){
						Gun.on.put(msg, gun);
						//at.on('put', put(msg));
					}
				}
				ev.to.next(msg);
				if(!at.out){
					msg.out = root;
					at.on('out', msg);
				}
			}
		}());

		;(function(){
			Gun.on.put = function(msg, gun){
				var at = gun._, ctx = {gun: gun, graph: at.graph, put: {}, map: {}, souls: {}, machine: Gun.state(), ack: msg['@']};
				if(!Gun.graph.is(msg.put, null, verify, ctx)){ ctx.err = "Error: Invalid graph!" }
				if(ctx.err){ return at.on('in', {'@': msg['#'], err: Gun.log(ctx.err) }) }
				obj_map(ctx.put, merge, ctx);
				if(!ctx.async){ 
					at.stop = {}; // temporary fix till a better solution?
					obj_map(ctx.map, map, ctx)
				}
				if(u !== ctx.defer){
					setTimeout(function(){
						Gun.on.put(msg, gun);
					}, ctx.defer - ctx.machine);
				}
				if(!ctx.diff){ return }
				at.on('put', obj_to(msg, {put: ctx.diff}));
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
				ctx.souls[soul] = true;
			}
			function merge(node, soul){
				var ctx = this, cat = ctx.gun._, at = (cat.next || empty)[soul];
				if(!at){
					if(!(cat.opt||empty).super){
						ctx.souls[soul] = false;
						return; 
					}
					at = (ctx.gun.get(soul)._);
				}
				var msg = ctx.map[soul] = {
					put: node,
					get: soul,
					gun: at.gun
				}, as = {ctx: ctx, msg: msg};
				ctx.async = !!cat.tag.node;
				if(ctx.ack){ msg['@'] = ctx.ack }
				obj_map(node, each, as);
				if(!ctx.async){ return }
				if(!ctx.and){
					// If it is async, we only need to setup on listener per context (ctx)
					cat.on('node', function(m){
						this.to.next(m); // make sure to call other context's listeners.
						if(m !== ctx.map[m.get]){ return } // filter out events not from this context!
						ctx.souls[m.get] = false; // set our many-async flag
						obj_map(m.put, aeach, m); // merge into view
						if(obj_map(ctx.souls, function(v){ if(v){ return v } })){ return } // if flag still outstanding, keep waiting.
						if(ctx.c){ return } ctx.c = 1; // failsafe for only being called once per context.
						this.off();
						cat.stop = {}; // temporary fix till a better solution?
						obj_map(ctx.map, map, ctx); // all done, trigger chains.
					});
				}
				ctx.and = true;
				cat.on('node', msg); // each node on the current context's graph needs to be emitted though.
			}
			function each(val, key){
				var ctx = this.ctx, graph = ctx.graph, msg = this.msg, soul = msg.get, node = msg.put, at = (msg.gun._), tmp;
				graph[soul] = Gun.state.to(node, key, graph[soul]);
				if(ctx.async){ return }
				at.put = Gun.state.to(node, key, at.put);
			}
			function aeach(val, key){
				var msg = this, node = msg.put, at = (msg.gun._);
				at.put = Gun.state.to(node, key, at.put);
			}
			function map(msg, soul){
				if(!msg.gun){ return }
				//console.log('map ->', soul, msg.put);
				(msg.gun._).on('in', msg);
			}

			Gun.on.get = function(msg, gun){
				var root = gun._, soul = msg.get[_soul], node = root.graph[soul], has = msg.get[_has], tmp;
				var next = root.next || (root.next = {}), at = next[soul];
				if(!node || !at){ return root.on('get', msg) }
				if(has){
					if(!obj_has(node, has)){ return root.on('get', msg) }
					node = Gun.state.to(node, has);
					// If we have a key in-memory, do we really need to fetch?
					// Maybe... in case the in-memory key we have is a local write
					// we still need to trigger a pull/merge from peers.
				} else {
					node = Gun.obj.copy(node);
				}
				node = Gun.graph.node(node);
				//tmp = at.ack;
				root.on('in', {
					'@': msg['#'],
					how: 'mem',
					put: node,
					gun: gun
				});
				//if(0 < tmp){
				//	return;
				//}
				root.on('get', msg);
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
				at.opt.peers = at.opt.peers || {};
				obj_to(opt, at.opt); // copies options on to `at.opt` only if not already taken.
				Gun.on('opt', at);
				at.opt.uuid = at.opt.uuid || function(){ return state_lex() + text_rand(12) }
				return gun;
			}
		}());

		var list_is = Gun.list.is;
		var text = Gun.text, text_is = text.is, text_rand = text.random;
		var obj = Gun.obj, obj_is = obj.is, obj_has = obj.has, obj_to = obj.to, obj_map = obj.map, obj_copy = obj.copy;
		var state_lex = Gun.state.lex, _soul = Gun.val.rel._, _has = '.', node_ = Gun.node._, rel_is = Gun.val.rel.is;
		var empty = {}, u;

		console.debug = function(i, s){ return (console.debug.i && i === console.debug.i && console.debug.i++) && (console.log.apply(console, arguments) || s) };

		Gun.log = function(){ return (!Gun.log.off && console.log.apply(console, arguments)), [].slice.call(arguments).join(' ') }
		Gun.log.once = function(w,s,o){ return (o = Gun.log.once)[w] = o[w] || 0, o[w]++ || Gun.log(s) }

		;"Please do not remove these messages unless you are paying for a monthly sponsorship, thanks!";
		Gun.log.once("welcome", "Hello wonderful person! :) Thanks for using GUN, feel free to ask for help on https://gitter.im/amark/gun and ask StackOverflow questions tagged with 'gun'!");
		;"Please do not remove these messages unless you are paying for a monthly sponsorship, thanks!";
		
		if(typeof window !== "undefined"){ window.Gun = Gun }
		try{ if(typeof common !== "undefined"){ common.exports = Gun } }catch(e){}
		module.exports = Gun;

		/*Gun.on('opt', function(ctx){ // FOR TESTING PURPOSES
			this.to.next(ctx);
			if(ctx.once){ return }
			ctx.on('node', function(msg){
				var to = this.to;
				//console.log(">>>", msg.put);
				//Gun.node.is(msg.put, function(v,k){ msg.put[k] = v + v });
				setTimeout(function(){
					//console.log("<<<<<", msg.put);
					to.next(msg);
				},1);
			});
		});*/
	})(USE, './root');

	;USE(function(module){
		var Gun = USE('./root');
		Gun.chain.back = function(n, opt){ var tmp;
			n = n || 1;
			if(-1 === n || Infinity === n){
				return this._.root.gun;
			} else
			if(1 === n){
				return (this._.back || this._).gun;
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
					return tmp.gun.back(n, opt);
				}
				return;
			}
			if(n instanceof Function){
				var yes, tmp = {back: at};
				while((tmp = tmp.back)
				&& !(yes = n(tmp, opt))){}
				return yes;
			}
			if(Gun.num.is(n)){
				return (at.back || at).gun.back(n - 1);
			}
			return this;
		}
		var empty = {}, u;
	})(USE, './back');

	;USE(function(module){
		// WARNING: GUN is very simple, but the JavaScript chaining API around GUN
		// is complicated and was extremely hard to build. If you port GUN to another
		// language, consider implementing an easier API to build.
		var Gun = USE('./root');
		Gun.chain.chain = function(sub){
			var gun = this, at = gun._, chain = new (sub || gun).constructor(gun), cat = chain._, root;
			cat.root = root = at.root;
			cat.id = ++root.once;
			cat.back = gun._;
			cat.on = Gun.on;
			cat.on('in', input, cat); // For 'in' if I add my own listeners to each then I MUST do it before in gets called. If I listen globally for all incoming data instead though, regardless of individual listeners, I can transform the data there and then as well.
			cat.on('out', output, cat); // However for output, there isn't really the global option. I must listen by adding my own listener individually BEFORE this one is ever called.
			return chain;
		}

		function output(msg){
			var put, get, at = this.as, back = at.back, root = at.root;
			if(!msg.I){ msg.I = at.gun }
			if(!msg.gun){ msg.gun = at.gun }
			this.to.next(msg);
			if(get = msg.get){
				/*if(u !== at.put){
					at.on('in', at);
					return;
				}*/
				if(get['#'] || at.soul){
					get['#'] = get['#'] || at.soul;
					msg['#'] || (msg['#'] = text_rand(9));
					back = (root.gun.get(get['#'])._);
					if(!(get = get['.'])){
						if(obj_has(back, 'put')){
						//if(u !== back.put){
							back.on('in', back);
						}
						if(back.ack){ return }
						msg.gun = back.gun;
						back.ack = -1;
					} else
					if(obj_has(back.put, get)){
						back.on('in', {
							gun: back.gun,
							put: Gun.state.to(back.put, get),
							get: back.get
						});
						return;
					}
					root.ask(ack, msg);
					return root.on('in', msg);
				}
				if(root.now){
					root.now[at.id] = root.now[at.id] || true;
				}
				if(get['.']){
					if(at.get){
						msg = {get: {'.': at.get}, gun: at.gun};
						(back.ask || (back.ask = {}))[at.get] = msg.gun._; // TODO: PERFORMANCE? More elegant way?
						return back.on('out', msg);
					}
					msg = {get: {}, gun: at.gun};
					return back.on('out', msg);
				}
				at.ack = at.ack || -1;
				if(at.get){
					msg.gun = at.gun;
					get['.'] = at.get;
					(back.ask || (back.ask = {}))[at.get] = msg.gun._; // TODO: PERFORMANCE? More elegant way?
					return back.on('out', msg);
				}
			}
			return back.on('out', msg);
		}

		function input(msg){
			var ev = this, cat = this.as, gun = msg.gun, at = gun._, change = msg.put, rel, tmp;
			if(cat.get && msg.get !== cat.get){
				msg = obj_to(msg, {get: cat.get});
			}
			if(cat.has && at !== cat){
				msg = obj_to(msg, {gun: cat.gun});
				if(at.ack){
					cat.ack = at.ack;
					//cat.ack = cat.ack || at.ack;
				}
			}
			if(node_ === cat.get && change && change['#']){
				// TODO: Potential bug? What if (soul.has = pointer) gets changed to (soul.has = primitive), we still need to clear out / wipe /reset (soul.has._) to have _id = nothing, or puts might have false positives (revert back to old soul).
				cat._id = change['#'];
			}
			if(u === change){
				ev.to.next(msg);
				if(cat.soul){ return } // TODO: BUG, I believe the fresh input refactor caught an edge case that a `gun.get('soul').get('key')` that points to a soul that doesn't exist will not trigger val/get etc.
				echo(cat, msg, ev);
				if(cat.has){
					not(cat, msg);
				}
				obj_del(at.echo, cat.id);
				obj_del(cat.map, at.id);
				return;
			}
			if(cat.soul){
				ev.to.next(msg);
				echo(cat, msg, ev);
				obj_map(change, map, {at: msg, cat: cat});
				return;
			}
			if(!(rel = Gun.val.rel.is(change))){
				if(Gun.val.is(change)){
					if(cat.has || cat.soul){
						not(cat, msg);
					} else
					if(at.has || at.soul){
						(at.echo || (at.echo = {}))[cat.id] = cat;
						(cat.map || (cat.map = {}))[at.id] = cat.map[at.id] || {at: at};
						//if(u === at.put){ return } // Not necessary but improves performance. If we have it but at does not, that means we got things out of order and at will get it. Once at gets it, it will tell us again.
					}
					ev.to.next(msg);
					echo(cat, msg, ev);
					return;
				}
				if(cat.has && at !== cat && obj_has(at, 'put')){
					cat.put = at.put;
				};
				if((rel = Gun.node.soul(change)) && at.has){
					at.put = (cat.root.gun.get(rel)._).put;
				}
				ev.to.next(msg);
				echo(cat, msg, ev);
				relate(cat, msg, at, rel);
				obj_map(change, map, {at: msg, cat: cat});
				return;
			}
			relate(cat, msg, at, rel);
			ev.to.next(msg);
			echo(cat, msg, ev);
		}

		function relate(at, msg, from, rel){
			if(!rel || node_ === at.get){ return }
			var tmp = (at.root.gun.get(rel)._);
			if(at.has){
				from = tmp;
			} else 
			if(from.has){
				relate(from, msg, from, rel);
			}
			if(from === at){ return }
			(from.echo || (from.echo = {}))[at.id] = at;
			if(at.has && !(at.map||empty)[from.id]){ // if we haven't seen this before.
				not(at, msg);
			}
			tmp = (at.map || (at.map = {}))[from.id] = at.map[from.id] || {at: from};
			var now = at.root.now;
			//now = now || at.root.stop;
			if(rel === tmp.rel){
				// NOW is a hack to get synchronous replies to correctly call.
				// and STOP is a hack to get async behavior to correctly call.
				// neither of these are ideal, need to be fixed without hacks,
				// but for now, this works for current tests. :/
				if(!now){
					return;
					/*var stop = at.root.stop;
					if(!stop){ return }
					if(stop[at.id] === rel){ return }
					stop[at.id] = rel;*/
				} else {
					if(u === now[at.id]){ return }
					if((now._ || (now._ = {}))[at.id] === rel){ return }
					now._[at.id] = rel;
				}
			}
			ask(at, tmp.rel = rel);
		}
		function echo(at, msg, ev){
			if(!at.echo){ return } // || node_ === at.get ?
			if(at.has){ msg = obj_to(msg, {event: ev}) }
			obj_map(at.echo, reverb, msg);
		}
		function reverb(to){
			to.on('in', this);
		}
		function map(data, key){ // Map over only the changes on every update.
			var cat = this.cat, next = cat.next || empty, via = this.at, chain, at, tmp;
			if(node_ === key && !next[key]){ return }
			if(!(at = next[key])){
				return;
			}
			//if(data && data[_soul] && (tmp = Gun.val.rel.is(data)) && (tmp = (cat.root.gun.get(tmp)._)) && obj_has(tmp, 'put')){
			//	data = tmp.put;
			//}
			if(at.has){
				if(!(data && data[_soul] && Gun.val.rel.is(data) === Gun.node.soul(at.put))){
					at.put = data;
				}
				chain = at.gun;
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
		function not(at, msg){
			if(!(at.has || at.soul)){ return }
			var tmp = at.map, root = at.root;
			at.map = null;
			if(!root.now || !root.now[at.id]){
				if((!msg['@']) && null === tmp){ return }
			}
			if(u === tmp && Gun.val.rel.is(at.put)){ return } // TODO: Bug? Threw second condition in for a particular test, not sure if a counter example is tested though.
			obj_map(tmp, function(proxy){
				if(!(proxy = proxy.at)){ return }
				obj_del(proxy.echo, at.id);
			});
			obj_map(at.next, function(neat, key){
				neat.put = u;
				if(neat.ack){
					neat.ack = -1;
				}
				neat.on('in', {
					get: key,
					gun: neat.gun,
					put: u
				});
			});
		}
		function ask(at, soul){
			var tmp = (at.root.gun.get(soul)._);
			if(at.ack){
				tmp.on('out', {get: {'#': soul}});
				if(!at.ask){ return } // TODO: PERFORMANCE? More elegant way?
			}
			obj_map(at.ask || at.next, function(neat, key){
				//(tmp.gun.get(key)._).on('out', {get: {'#': soul, '.': key}});
				//tmp.on('out', {get: {'#': soul, '.': key}});
				neat.on('out', {get: {'#': soul, '.': key}});
				//at.on('out', {get: {'#': soul, '.': key}});
			});
			Gun.obj.del(at, 'ask'); // TODO: PERFORMANCE? More elegant way?
		}
		function ack(msg, ev){
			var as = this.as, get = as.get || empty, at = as.gun._, tmp = (msg.put||empty)[get['#']];
			if(at.ack){ at.ack = (at.ack + 1) || 1 }
			if(!msg.put /*|| node_ == get['.']*/ || (get['.'] && !obj_has(tmp, at.get))){
				if(at.put !== u){ return }
				//at.ack = 0;
				at.on('in', {
					get: at.get,
					put: at.put = u,
					gun: at.gun,
					'@': msg['@']
				})
				return;
			}
			if(node_ == get['.']){ // is this a security concern?
				at.on('in', {get: at.get, put: tmp[at.get], gun: at.gun, '@': msg['@']});
				return;
			}
			//if(/*!msg.gun &&*/ !get['.'] && get['#']){ at.ack = (at.ack + 1) || 1 }
			//msg = obj_to(msg);
			msg.gun = at.root.gun;
			//Gun.on('put', at);
			Gun.on.put(msg, at.root.gun);
		}
		var empty = {}, u;
		var obj = Gun.obj, obj_has = obj.has, obj_put = obj.put, obj_del = obj.del, obj_to = obj.to, obj_map = obj.map;
		var text_rand = Gun.text.random;
		var _soul = Gun.val.rel._, node_ = Gun.node._;
	})(USE, './chain');

	;USE(function(module){
		var Gun = USE('./root');
		Gun.chain.get = function(key, cb, as){
			var gun, tmp;
			if(typeof key === 'string'){
				var back = this, cat = back._;
				var next = cat.next || empty;
				if(!(gun = next[key])){
					gun = cache(key, back);
				}
				gun = gun.gun;
			} else
			if(key instanceof Function){
				gun = this;
				var at = gun._, root = at.root, tmp = root.now, ev;
				as = cb || {};
				as.use = key;
				as.out = as.out || {};
				as.out.get = as.out.get || {};
				ev = at.on('in', use, as);
				(root.now = {$:1})[as.now = at.id] = ev;
				at.on('out', as.out);
				root.now = tmp;
				return gun;
			} else
			if(num_is(key)){
				return this.get(''+key, cb, as);
			} else
			if(tmp = rel.is(key)){
				return this.get(tmp, cb, as);
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
			next[at.get = key] = at;
			if(back === cat.root.gun){
				at.soul = key;
			} else
			if(cat.soul || cat.has){
				at.has = key;
				//if(obj_has(cat.put, key)){
					//at.put = cat.put[key];
				//}
			}
			return at;
		}
		function use(msg){
			var ev = this, as = ev.as, gun = msg.gun, at = gun._, root = at.root, data = msg.put, tmp;
			if((tmp = root.now) && ev !== tmp[as.now]){
				return ev.to.next(msg);
			}
			if(u === data){
				data = at.put;
			}
			if((tmp = data) && tmp[rel._] && (tmp = rel.is(tmp))){
				tmp = (at.root.gun.get(tmp)._);
				if(u !== tmp.put){
					msg = obj_to(msg, {put: tmp.put});
				}
			}
			as.use(msg, msg.event || ev);
			ev.to.next(msg);
		}
		var obj = Gun.obj, obj_has = obj.has, obj_to = Gun.obj.to;
		var num_is = Gun.num.is;
		var rel = Gun.val.rel, node_ = Gun.node._;
		var empty = {}, u;
	})(USE, './get');

	;USE(function(module){
		var Gun = USE('./root');
		Gun.chain.put = function(data, cb, as){
			// #soul.has=value>state
			// ~who#where.where=what>when@was
			// TODO: BUG! Put probably cannot handle plural chains!
			var gun = this, at = (gun._), root = at.root.gun, tmp;
			as = as || {};
			as.data = data;
			as.via = as.gun = as.via || as.gun || gun;
			if(typeof cb === 'string'){
				as.soul = cb;
			} else {
				as.ack = as.ack || cb;
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
				as.soul = as.soul || (as.not = Gun.node.soul(as.data) || (as.via.back('opt.uuid') || Gun.text.random)());
				if(!as.soul){ // polyfill async uuid for SEA
					as.via.back('opt.uuid')(function(err, soul){ // TODO: improve perf without anonymous callback
						if(err){ return Gun.log(err) } // TODO: Handle error!
						(as.ref||as.gun).put(as.data, as.soul = soul, as);
					});
					return gun;
				}
				as.gun = gun = root.get(as.soul);
				as.ref = as.gun;
				ify(as);
				return gun;
			}
			if(Gun.is(data)){
				data.get('_').get(function(at, ev, tmp){ ev.off();
					if(!(tmp = at.gun) || !(tmp = tmp._.back) || !tmp.soul){
						return Gun.log("The reference you are saving is a", typeof at.put, '"'+ as.put +'", not a node (object)!');
					}
					gun.put(Gun.val.rel.ify(tmp.soul), cb, as);
				});
				return gun;
			}
			as.ref = as.ref || (root._ === (tmp = at.back))? gun : tmp.gun;
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
			as.res = as.res || function(cb){ if(cb){ cb() } };
			as.res(function(){
				var cat = (as.gun.back(-1)._), ask = cat.ask(function(ack){
					cat.root.on('ack', ack);
					this.off(); // One response is good enough for us currently. Later we may want to adjust this.
					if(!as.ack){ return }
					as.ack(ack, this);
				}, as.opt);
				// NOW is a hack to get synchronous replies to correctly call.
				// and STOP is a hack to get async behavior to correctly call.
				// neither of these are ideal, need to be fixed without hacks,
				// but for now, this works for current tests. :/
				var tmp = cat.root.now; obj.del(cat.root, 'now'); cat.root.PUT = true;
				var tmp2 = cat.root.stop;
				(as.ref._).now = true;
				(as.ref._).on('out', {
					gun: as.ref, put: as.out = as.env.graph, opt: as.opt, '#': ask
				});
				obj.del((as.ref._), 'now');
				obj.del((cat.root), 'PUT');
				cat.root.now = tmp;
				cat.root.stop = tmp2;
			}, as);
			if(as.res){ as.res() }
		} function no(v,k){ if(v){ return true } }

		function map(v,k,n, at){ var as = this;
			//if(Gun.is(v)){} // TODO: HANDLE!
			if(k || !at.path.length){ return }
			(as.res||iife)(function(){
				var path = at.path, ref = as.ref, opt = as.opt;
				var i = 0, l = path.length;
				for(i; i < l; i++){
					ref = ref.get(path[i]);
				}
				if(Gun.node.soul(at.obj)){
					var id = Gun.node.soul(at.obj) || (as.via.back('opt.uuid') || Gun.text.random)();
					if(!id){ // polyfill async uuid for SEA
						(as.stun = as.stun || {})[path] = true; // make DRY
						as.via.back('opt.uuid')(function(err, id){ // TODO: improve perf without anonymous callback
							if(err){ return Gun.log(err) } // TODO: Handle error.
							ref.back(-1).get(id);
							at.soul(id);
							as.stun[path] = false;
							as.batch();
						});
						return;
					}
					ref.back(-1).get(id);
					at.soul(id);
					return;
				}
				(as.stun = as.stun || {})[path] = true;
				ref.get('_').get(soul, {as: {at: at, as: as}});
			}, {as: as, at: at});
		}

		function soul(msg, ev){ var as = this.as, cat = as.at; as = as.as;
			//ev.stun(); // TODO: BUG!?
			if(!msg.gun || !msg.gun._.back){ return } // TODO: Handle
			var at = msg.gun._, at_ = at;
			var _id = (msg.put||empty)['#'];
			ev.off();
			at = (msg.gun._.back); // go up 1!
			var id = id || Gun.node.soul(cat.obj) || Gun.node.soul(at.put) || Gun.val.rel.is(at.put) || _id || at_._id || (as.via.back('opt.uuid') || Gun.text.random)(); // TODO: BUG!? Do we really want the soul of the object given to us? Could that be dangerous?
			if(!id){ // polyfill async uuid for SEA
				at.via.back('opt.uuid')(function(err, id){ // TODO: improve perf without anonymous callback
					if(err){ return Gun.log(err) } // TODO: Handle error.
					solve(at, at_._id = at_._id || id, cat, as);
				});
				return;
			}
			solve(at, at_._id = at_._id || id, cat, as);
		}

		function solve(at, id, cat, as){
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
			var cat = (at.gun._.back), data = cat.put, opt = as.opt||{}, root, tmp;
			if((tmp = as.ref) && tmp._.now){ return }
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
				cat = (cat.root.gun.get(tmp)._);
				as.not = as.soul = tmp;
				data = as.data;
			}
			if(!as.not && !(as.soul = Gun.node.soul(data))){
				if(as.path && obj_is(as.data)){ // Apparently necessary
					as.soul = (opt.uuid || as.via.back('opt.uuid') || Gun.text.random)();
				} else {
					//as.data = obj_put({}, as.gun._.get, as.data);
					if(node_ == at.get){
						as.soul = (at.put||empty)['#'] || at._id;
					}
					as.soul = as.soul || at.soul || cat.soul || (opt.uuid || as.via.back('opt.uuid') || Gun.text.random)();
				}
				if(!as.soul){ // polyfill async uuid for SEA
					as.via.back('opt.uuid')(function(err, soul){ // TODO: improve perf without anonymous callback
						if(err){ return Gun.log(err) } // Handle error.
						as.ref.put(as.data, as.soul = soul, as);
					});
					return;
				}
			}
			as.ref.put(as.data, as.soul, as);
		}
		var obj = Gun.obj, obj_is = obj.is, obj_put = obj.put, obj_map = obj.map;
		var u, empty = {}, noop = function(){}, iife = function(fn,as){fn.call(as||empty)};
		var node_ = Gun.node._;
	})(USE, './put');

	;USE(function(module){
		var Gun = USE('./root');
		USE('./chain');
		USE('./back');
		USE('./put');
		USE('./get');
		module.exports = Gun;
	})(USE, './index');

	;USE(function(module){
		var Gun = USE('./index');
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
			gun.get(ok, opt); // TODO: PERF! Event listener leak!!!?
			return gun;
		}

		function ok(at, ev){ var opt = this;
			var gun = at.gun, cat = gun._, data = cat.put || at.put, tmp = opt.last, id = cat.id+at.get, tmp;
			if(u === data){
				return;
			}
			if(data && data[rel._] && (tmp = rel.is(data))){
				tmp = (cat.root.gun.get(tmp)._);
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
			Gun.log.once("onceval", "Future Breaking API Change: .val -> .once, apologies unexpected.");
			return this.once(cb, opt);
		}
		Gun.chain.once = function(cb, opt){
			var gun = this, at = gun._, data = at.put;
			if(0 < at.ack && u !== data){
				(cb || noop).call(gun, data, at.get);
				return gun;
			}
			if(cb){
				(opt = opt || {}).ok = cb;
				opt.cat = at;
				opt.out = {'#': Gun.text.random(9)};
				gun.get(val, {as: opt});
				opt.async = true; //opt.async = at.stun? 1 : true;
			} else {
				Gun.log.once("valonce", "Chainable val is experimental, its behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
				var chain = gun.chain();
				chain._.val = gun.once(function(){
					chain._.on('in', gun._);
				});
				return chain;
			}
			return gun;
		}

		function val(msg, ev, to){
			var opt = this.as, cat = opt.cat, gun = msg.gun, coat = gun._, data = coat.put || msg.put, tmp;
			if(u === data){
				//return;
			}
			//if(coat.soul && !(0 < coat.ack)){ return }
			if(tmp = Gun.node.soul(data) || rel.is(data)){
			//if(data && data[rel._] && (tmp = rel.is(data))){
				tmp = (cat.root.gun.get(tmp)._);
				if(u === tmp.put){//} || !(0 < tmp.ack)){
					return;
				}
				data = tmp.put;
			}
			if(ev.wait){ clearTimeout(ev.wait) }
			//if(!to && (!(0 < coat.ack) || ((true === opt.async) && 0 !== opt.wait))){
			if(!to){
				ev.wait = setTimeout(function(){
					val.call({as:opt}, msg, ev, ev.wait || 1);
				}, opt.wait || 99);
				return;
			}
			if(cat.has || cat.soul){
				if(ev.off()){ return } // if it is already off, don't call again!
			} else {
				if((opt.seen = opt.seen || {})[coat.id]){ return }
				opt.seen[coat.id] = true;
			}
			opt.ok.call(msg.gun || opt.gun, data, msg.get);
		}

		Gun.chain.off = function(){
			// make off more aggressive. Warning, it might backfire!
			var gun = this, at = gun._, tmp;
			var cat = at.back;
			if(!cat){ return }
			if(tmp = cat.next){
				if(tmp[at.get]){
					obj_del(tmp, at.get);
				} else {

				}
			}
			if(tmp = cat.ask){
				obj_del(tmp, at.get);
			}
			if(tmp = cat.put){
				obj_del(tmp, at.get);
			}
			if(tmp = at.soul){
				obj_del(cat.root.graph, tmp);
			}
			if(tmp = at.map){
				obj_map(tmp, function(at){
					if(at.rel){
						cat.root.gun.get(at.rel).off();
					}
				});
			}
			if(tmp = at.next){
				obj_map(tmp, function(neat){
					neat.gun.off();
				});
			}
			at.on('off', {});
			return gun;
		}
		var obj = Gun.obj, obj_map = obj.map, obj_has = obj.has, obj_del = obj.del, obj_to = obj.to;
		var rel = Gun.val.rel;
		var empty = {}, noop = function(){}, u;
	})(USE, './on');

	;USE(function(module){
		var Gun = USE('./index');
		Gun.chain.map = function(cb, opt, t){
			var gun = this, cat = gun._, chain;
			if(!cb){
				if(chain = cat.fields){ return chain }
				chain = cat.fields = gun.chain();
				chain._.val = gun.back('val');
				chain._.MAPOF = cat.soul;
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
		function map(msg){
			if(!msg.put || Gun.val.is(msg.put)){ return }
			if(this.as.val){ this.off() } // TODO: Ugly hack!
			obj_map(msg.put, each, {at: this.as, msg: msg});
			this.to.next(msg);
		}
		function each(v,k){
			if(n_ === k){ return }
			var msg = this.msg, gun = msg.gun, at = this.at, tmp = (gun.get(k)._);
			(tmp.echo || (tmp.echo = {}))[at.id] = at;
		}
		var obj_map = Gun.obj.map, noop = function(){}, event = {stun: noop, off: noop}, n_ = Gun.node._, u;
	})(USE, './map');

	;USE(function(module){
		var Gun = USE('./index');
		Gun.chain.set = function(item, cb, opt){
			var gun = this, soul;
			cb = cb || function(){};
			opt = opt || {}; opt.item = opt.item || item;
			if(soul = Gun.node.soul(item)){ return gun.set(gun.back(-1).get(soul), cb, opt) }
			if(!Gun.is(item)){
				var id = gun.back('opt.uuid')();
				if(id && Gun.obj.is(item)){
					return gun.set(gun._.root.gun.put(item, id), cb, opt);
				}
				return gun.get((Gun.state.lex() + Gun.text.random(7))).put(item, cb, opt);
			}
			item.get('_').get(function(at, ev){
				if(!at.gun || !at.gun._.back){ return }
				ev.off();
				var soul = (at.put||{})['#'];
				at = (at.gun._.back);
				var put = {}, node = at.put;
				soul = at.soul || Gun.node.soul(node) || soul;
				if(!soul){ return cb.call(gun, {err: Gun.log('Only a node can be linked! Not "' + node + '"!')}) }
				gun.put(Gun.obj.put(put, soul, Gun.val.rel.ify(soul)), cb, opt);
			},{wait:0});
			return item;
		}
	})(USE, './set');

	;USE(function(module){
		if(typeof Gun === 'undefined'){ return } // TODO: localStorage is Browser only. But it would be nice if it could somehow plugin into NodeJS compatible localStorage APIs?

		var root, noop = function(){}, u;
		if(typeof window !== 'undefined'){ root = window }
		var store = root.localStorage || {setItem: noop, removeItem: noop, getItem: noop};

		/*
			NOTE: Both `lib/file.js` and `lib/memdisk.js` are based on this design!
			If you update anything here, consider updating the other adapters as well.
		*/

		Gun.on('create', function(root){
			// This code is used to queue offline writes for resync.
			// See the next 'opt' code below for actual saving of data.
			var ev = this.to, opt = root.opt;
			if(root.once){ return ev.next(root) }
			if(false === opt.localStorage){ return ev.next(root) }
			opt.file = opt.file || 'gun/';
			var gap = Gun.obj.ify(store.getItem('gap/'+opt.file)) || {};
			var empty = Gun.obj.empty, id, to, go;
			// add re-sync command.
			if(!empty(gap)){
				root.on('localStorage', function(disk){
					this.off();
					var send = {}
					Gun.obj.map(gap, function(node, soul){
						Gun.obj.map(node, function(val, key){
							send[soul] = Gun.state.to(disk[soul], key, send[soul]);
						});
					});
					setTimeout(function(){
						root.on('out', {put: send, '#': root.ask(ack), I: root.gun});
					},10);
				});
			}

			root.on('out', function(msg){
				if(msg.lS){ return }
				if(msg.I && msg.put && !msg['@'] && !empty(opt.peers)){
					id = msg['#'];
					Gun.graph.is(msg.put, null, map);
					if(!to){ to = setTimeout(flush, opt.wait || 1) }
				}
				this.to.next(msg);
			});
			root.on('ack', ack);

			function ack(ack){ // TODO: This is experimental, not sure if we should keep this type of event hook.
				if(ack.err || !ack.ok){ return }
				var id = ack['@'];
				setTimeout(function(){
					Gun.obj.map(gap, function(node, soul){
						Gun.obj.map(node, function(val, key){
							if(id !== val){ return }
							delete node[key];
						});
						if(empty(node)){
							delete gap[soul];
						}
					});
					flush();
				}, opt.wait || 1);
			};
			ev.next(root);

			var map = function(val, key, node, soul){
				(gap[soul] || (gap[soul] = {}))[key] = id;
			}
			var flush = function(){
				clearTimeout(to);
				to = false;
				try{store.setItem('gap/'+opt.file, JSON.stringify(gap));
				}catch(e){ Gun.log(err = e || "localStorage failure") }
			}
		});

		Gun.on('create', function(root){
			this.to.next(root);
			var opt = root.opt;
			if(root.once){ return }
			if(false === opt.localStorage){ return }
			opt.file = opt.file || opt.prefix || 'gun/'; // support old option name.
			var graph = root.graph, acks = {}, count = 0, to;
			var disk = Gun.obj.ify(store.getItem(opt.file)) || {};
			var lS = function(){}, u;
			root.on('localStorage', disk); // NON-STANDARD EVENT!
			
			root.on('put', function(at){
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

			root.on('get', function(msg){
				this.to.next(msg);
				var lex = msg.get, soul, data, u;
				//setTimeout(function(){
				if(!lex || !(soul = lex['#'])){ return }
				//if(0 >= msg.cap){ return }
				var has = lex['.'];
				data = disk[soul] || u;
				if(data && has){
					data = Gun.state.to(data, has);
				}
				if(!data && !Gun.obj.empty(opt.peers)){ // if data not found, don't ack if there are peers.
					return; // Hmm, what if we have peers but we are disconnected?
				}
				root.on('in', {'@': msg['#'], put: Gun.graph.node(data), how: 'lS', lS: msg.I});
				//},1);
			});

			var map = function(val, key, node, soul){
				disk[soul] = Gun.state.to(node, key, disk[soul]);
			}

			var flush = function(data){
				var err;
				count = 0;
				clearTimeout(to);
				to = false;
				var ack = acks;
				acks = {};
				if(data){ disk = data }
				try{store.setItem(opt.file, JSON.stringify(disk));
				}catch(e){ 
					Gun.log(err = e || "localStorage failure");
					root.on('localStorage:error', {err: err, file: opt.file, flush: disk, retry: flush});
				}
				if(!err && !Gun.obj.empty(opt.peers)){ return } // only ack if there are no peers.
				Gun.obj.map(ack, function(yes, id){
					root.on('in', {
						'@': id,
						err: err,
						ok: 0 // localStorage isn't reliable, so make its `ok` code be a low number.
					});
				});
			}
		});
	})(USE, './adapters/localStorage');

	;USE(function(module){
		var Type = USE('../type');

		function Mesh(ctx){
			var mesh = function(){};

			mesh.out = function(msg){ var tmp;
				//console.log("count:", msg['#'], msg);
				if(this.to){ this.to.next(msg) }
				//if(mesh.last != msg['#']){ return mesh.last = msg['#'], this.to.next(msg) }
				if((tmp = msg['@'])
				&& (tmp = ctx.dup.s[tmp])
				&& (tmp = tmp.it)
				&& tmp.mesh){
					mesh.say(msg, tmp.mesh.via);
					tmp['##'] = msg['##'];
					return;
				}
				// add hook for AXE?
				mesh.say(msg);
			}

			mesh.hear = function(raw, peer){
				if(!raw){ return }
				var dup = ctx.dup, id, hash, msg, tmp = raw[0];
				try{msg = JSON.parse(raw);
				}catch(e){}
				if('{' === tmp){
					if(!msg){ return }
					if(dup.check(id = msg['#'])){ return }
					dup.track(id, true).it = msg; // GUN core also dedups, so `true` is needed.
					if((tmp = msg['@']) && msg.put){
						hash = msg['##'] || (msg['##'] = mesh.hash(msg));
						if((tmp = tmp + hash) != id){
							if(dup.check(tmp)){ return }
							(tmp = dup.s)[hash] = tmp[id];
						}
					}
					(msg.mesh = function(){}).via = peer;
					if((tmp = msg['><'])){
						msg.mesh.to = Type.obj.map(tmp.split(','), function(k,i,m){m(k,true)});
					}
					ctx.on('in', msg);
					
					return;
				} else
				if('[' === tmp){
					if(!msg){ return }
					var i = 0, m;
					while(m = msg[i++]){
						mesh.hear(m, peer);
					}

					return;
				}
			}

			;(function(){
				mesh.say = function(msg, peer){
					/*
						TODO: Plenty of performance optimizations
						that can be made just based off of ordering,
						and reducing function calls for cached writes.
					*/
					if(!peer){
						Type.obj.map(ctx.opt.peers, function(peer){
							mesh.say(msg, peer);
						});
						return;
					}
					var tmp, wire = peer.wire || ((ctx.opt.wire) && ctx.opt.wire(peer)), msh, raw;// || open(peer, ctx); // TODO: Reopen!
					if(!wire){ return }
					msh = msg.mesh || empty;
					if(peer === msh.via){ return }
					if(!(raw = msh.raw)){ raw = mesh.raw(msg) }
					if((tmp = msg['@'])
					&& (tmp = ctx.dup.s[tmp])
					&& (tmp = tmp.it)){
						if(tmp.get && tmp['##'] && tmp['##'] === msg['##']){ // PERF: move this condition outside say?
							return; // TODO: this still needs to be tested in the browser!
						}
					}
					if((tmp = msh.to) && (tmp[peer.url] || tmp[peer.id])){ return } // TODO: still needs to be tested
					//console.log('out', JSON.parse(raw));	
					if(peer.batch){
						peer.batch.push(raw);
						return;
					}
					peer.batch = [];
					setTimeout(function(){
						var tmp = peer.batch;
						if(!tmp){ return }
						peer.batch = null;
						if(!tmp.length){ return }
						send(JSON.stringify(tmp), peer);
					}, ctx.opt.gap || ctx.opt.wait || 1);
					send(raw, peer);
				}

				function send(raw, peer){
					var wire = peer.wire;
					try{
						if(wire.send){
							if(wire.readyState === wire.OPEN){
								//console.log("send:", raw);
								wire.send(raw);
							} else {
								(peer.queue = peer.queue || []).push(raw);
							}
						} else
						if(peer.say){
							peer.say(raw);
						}
					}catch(e){
						(peer.queue = peer.queue || []).push(raw);
					}
				}

			}());
			
			;(function(){

				mesh.raw = function(msg){
					if(!msg){ return '' }
					var dup = ctx.dup, msh = msg.mesh || {}, put, hash, tmp;
					if(tmp = msh.raw){ return tmp }
					if(typeof msg === 'string'){ return msg }
					if(msg['@'] && (tmp = msg.put)){
						if(!(hash = msg['##'])){
							put = $(tmp, sort) || '';
							hash = mesh.hash(msg, put);
							msg['##'] = hash;
						}
						(tmp = dup.s)[hash = msg['@']+hash] = tmp[msg['#']];
						msg['#'] = hash || msg['#'];
						if(put){ (msg = Type.obj.to(msg)).put = _ }
					}
					var i = 0, to = []; Type.obj.map(ctx.opt.peers, function(p){
						to.push(p.url || p.id); if(++i > 9){ return true } // limit server, fast fix, improve later!
					}); msg['><'] = to.join();
					var raw = $(msg);
					if(u !== put){
						raw = raw.replace('"'+ _ +'"', put);
					}
					if(msh){
						msh.raw = raw;
					}
					return raw;
				}

				mesh.hash = function(msg, hash){
					return Mesh.hash(hash || $(msg.put, sort) || '') || msg['#'] || Type.text.random(9);
				}

				function sort(k, v){ var tmp;
					if(!(v instanceof Object)){ return v }
					Type.obj.map(Object.keys(v).sort(), map, {to: tmp = {}, on: v});
					return tmp;
				}

				function map(k){
					this.to[k] = this.on[k];
				}
				var $ = JSON.stringify, _ = ':])([:'

			}());

			mesh.hi = function(peer){
				ctx.on('hi', peer);
				var queue = peer.queue;
				peer.queue = [];
				Type.obj.map(queue, function(msg){
					mesh.say(msg, peer);
				});
			}

			return mesh;
		}

		Mesh.hash = function(s){ // via SO
			if(typeof s !== 'string'){ return {err: 1} }
	    var c = 0;
	    if(!s.length){ return c }
	    for(var i=0,l=s.length,n; i<l; ++i){
	      n = s.charCodeAt(i);
	      c = ((c<<5)-c)+n;
	      c |= 0;
	    }
	    return c; // Math.abs(c);
	  }

	  var empty = {}, u;
	  Object.keys = Object.keys || function(o){ return map(o, function(v,k,t){t(k)}) }

	  try{ module.exports = Mesh }catch(e){}

	})(USE, './adapters/mesh');

	;USE(function(module){
		var Gun = USE('../index');
		Gun.Mesh = USE('./mesh');

		Gun.on('opt', function(root){
			this.to.next(root);
			var opt = root.opt;
			if(root.once){ return }
			if(false === opt.WebSocket){ return }

			var env;
			if(typeof window !== "undefined"){ env = window }
			if(typeof global !== "undefined"){ env = global }
			env = env || {};

			var websocket = opt.WebSocket || env.WebSocket || env.webkitWebSocket || env.mozWebSocket;
			if(!websocket){ return }
			opt.WebSocket = websocket;

			var mesh = opt.mesh = opt.mesh || Gun.Mesh(root);
			root.on('create', function(at){
				this.to.next(at);
				root.on('out', mesh.out);
			});

			opt.wire = opt.wire || open;
			function open(peer){
				if(!peer || !peer.url){ return }
				var url = peer.url.replace('http', 'ws');
				var wire = peer.wire = new opt.WebSocket(url);
				wire.onclose = function(){
					root.on('bye', peer);
					reconnect(peer);
				};
				wire.onerror = function(error){
					reconnect(peer); // placement?
					if(!error){ return }
					if(error.code === 'ECONNREFUSED'){
						//reconnect(peer, as);
					}
				};
				wire.onopen = function(){
					mesh.hi(peer);
				}
				wire.onmessage = function(msg){
					//console.log('in', JSON.parse(msg.data || msg));
					if(!msg){ return }
					env.inLength = (env.inLength || 0) + (msg.data || msg).length; // TEMPORARY, NON-STANDARD, FOR DEBUG
					mesh.hear(msg.data || msg, peer);
				};
				return wire;
			}

			function reconnect(peer){
				clearTimeout(peer.defer);
				peer.defer = setTimeout(function(){
					open(peer);
				}, 2 * 1000);
			}
		});
		var noop = function(){};
	})(USE, './adapters/websocket');

}());