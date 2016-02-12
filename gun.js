// HNKARMA 795 BEFORE
console.log("!!!!!!!!!!!!!!!! WARNING THIS IS GUN 0.4 !!!!!!!!!!!!!!!!!!!!!!");
;(function(){
	function Gun(o){
		var gun = this;
		if(!Gun.is(gun)){ return new Gun(o) }
		if(Gun.is(o)){ return gun }
		return gun.opt(o);
	}
		
	;(function(Util){ // Generic javascript utilities.
		;(function(Type){
			Type.fns = {is: function(fn){ return (fn instanceof Function) }};
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
				o = Gun.text.is(o)? {'=': o} : o || {}; // {'~', '=', '*', '<', '>', '+', '-', '?', '!'} // ignore uppercase, exactly equal, anything after, lexically larger, lexically lesser, added in, subtacted from, questionable fuzzy match, and ends with.
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
			Type.obj = {is: function(o) { return !o || !o.constructor? false : o.constructor === Object? true : !o.constructor.call || o.constructor.toString().match(/\[native\ code\]/)? false : true }}
			Type.obj.put = function(o, f, v){ return (o||{})[f] = v, o } 
			Type.obj.del = function(o, k){
				if(!o){ return }
				o[k] = null;
				delete o[k];
				return o;
			}
			Type.obj.ify = function(o){
				if(Type.obj.is(o)){ return o }
				try{o = JSON.parse(o);
				}catch(e){o={}};
				return o;
			}
			Type.obj.copy = function(o){ // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
				return !o? o : JSON.parse(JSON.stringify(o)); // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
			}
			Type.obj.as = function(o, f, v){ return o[f] = o[f] || (arguments.length >= 3? v : {}) }
			Type.obj.has = function(o, t){ return o && Object.prototype.hasOwnProperty.call(o, t) }
			Type.obj.empty = function(o, n){
				if(!o){ return true }
				return Type.obj.map(o,function(v,i){
					if(n && (i === n || (Type.obj.is(n) && Type.obj.has(n, i)))){ return }
					if(i){ return true }
				})? false : true;
			}
			Type.obj.map = function(l, c, _){
				var u, i = 0, ii = 0, x, r, rr, ll, lle, f = Type.fns.is(c),
				t = function(k,v){
					if(2 === arguments.length){
						rr = rr || {};
						rr[k] = v;
						return;
					} rr = rr || [];
					rr.push(k);
				};
				if(Object.keys && Type.obj.is(l)){
					ll = Object.keys(l); lle = true;
				}
				if(Type.list.is(l) || ll){
					x = (ll || l).length;
					for(;i < x; i++){
						ii = (i + Type.list.index);
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
				return f? rr : Type.list.index? 0 : -1;
			}
			Type.time = {};
			Type.time.is = function(t){ return t? t instanceof Date : (+new Date().getTime()) }
		}(Util));
		;(function(exports){ // On event emitter generic javascript utility.
			function On(){ var on = this;
				if(!On.is(on)){ return new On() }
				return on.s = [], on.on;
			};
			On.is = function(on){ return (on instanceof On) }
			On.chain = On.prototype;
			var on = function(e){
				on.event.e = e;
				on.event.s[e] = on.event.s[e] || [];
				return on;
			};
			On.chain.create = function(){ return On.call(null) }
			On.chain.on = function(e, fn, i){
				var on = this;
				if(!e){ return on }
				return on.e = e, fn? on.event(fn, i) : on;
			}
			On.chain.emit = function(a,b,c,d){
				var on = this, e = on.e, s = on.s[e];
				console.log("EMIT", a, 'to', s);
				exports.list.map(s, function(at, i){
					if(!at.on){ s.splice(i-1, 0); return; }
					at.on(a,b,c,d);
				});
				if(s && !s.length){ delete on.s[e] }
			}
			function At(fn, i){ var at = this;
				if(!At.is(at)){ return new At() }
				at.on = fn;
				at.i = i;
			};
			At.is = function(at){ return (at instanceof At) }
			At.chain = On.prototype;
			At.chain.off = function(){ Gun.obj.del(this,'on') }
			On.chain.event = function(fn, i){
				var on = this, e = on.e, s = on.s[e] = on.s[e] || [], at = At(fn, i);
				return s.push(at), i? s.sort(sort) : i, at;
			}
			var sort = exports.list.sort('i');
			exports.on = On();
		}(Util));
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
				var now = time();
				future = (future <= now)? 0 : (future - now);
				clearTimeout(s.id);
				s.id = setTimeout(s.check, future);
			}
			s.check = function(){
				var now = time(), soonest = Infinity;
				s.waiting.sort(s.sort);
				s.waiting = exports.list.map(s.waiting, function(wait, i, map){
					if(!wait){ return }
					if(wait.when <= now){
						if(exports.fns.is(wait.event)){
							setTimeout(function(){ wait.event() },0);
						}
					} else {
						soonest = (soonest < wait.when)? soonest : wait.when;
						map(wait);
					}
				}) || [];
				s.set(soonest);
			}
			exports.schedule = s;
		}(Util));
	}(Gun));

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
		
		Gun.is = function(gun){ return (gun instanceof Gun)? true : false } // check to see if it is a GUN instance.
		
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
					opt[f] = Gun.obj.map(opt[f], function(v,f,t){t(v,{sort: f})});
				}
				if(Gun.list.is(v)){
					v = Gun.obj.map(v, function(v,f,t){t(v,{sort: f})});
				}
				if(Gun.obj.is(v)){
					Gun.is.opt(opt[f] = opt[f] || {}, v);
				} else 
				if(!Gun.obj.has(opt,f)){
					opt[f] = v;
				}
			});
			return opt;
		}

		Gun.is.lex = function(lex){ var o = {}; // Validates a lex, and if it is returns a friendly lex.
			if(!Gun.obj.is(lex)){ return false }
			Gun.obj.map(lex, function(v,f){
				if(!(Gun._[f] || Gun.__[f]) || !(Gun.text.is(v) || Gun.obj.is(v))){ return o = false }
				o[Gun._[f]? f : Gun.__[f]] = v;
			}); // TODO: What if the lex cursor has a document on the match, that shouldn't be allowed!
			return o;
		}

		Gun.is.lex.ify = function(lex){ var o = {}; // Turns a friendly lex into a spec lex.
			lex = lex || {};
			Gun.list.map(Gun._, function(v, f){
				if(!(Gun.obj.has(lex, v) || Gun.obj.has(lex, f))){ return }
				o[v] = lex[v] || lex[f];
			});
			return o;
		}
		
		Gun.is.rel = function(v){ // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
			if(Gun.obj.is(v)){ // must be an object.
				var id;
				Gun.obj.map(v, function(s, f){ // map over the object...
					if(id){ return id = false } // if ID is already defined AND we're still looping through the object, it is considered invalid.
					if(f == Gun._.soul && Gun.text.is(s)){ // the field should be '#' and have a text value.
						id = s; // we found the soul!
					} else {
						return id = false; // if there exists anything else on the object that isn't the soul, then it is considered invalid.
					}
				});
				if(id){ // a valid id was found.
					return id; // yay! Return it.
				}
			}
			return false; // the value was not a valid soul relation.
		}

		Gun.is.rel.ify = function(s){ var r = {}; return Gun.obj.put(r, Gun._.soul, s), r } // convert a soul into a relation and return it.
		
		Gun.is.node = function(n, cb, o){ var s; // checks to see if an object is a valid node.
			if(!Gun.obj.is(n)){ return false } // must be an object.
			if(s = Gun.is.node.soul(n)){ // must have a soul on it.
				return !Gun.obj.map(n, function(v, f){ // we invert this because the way we check for this is via a negation.
					if(f == Gun._.meta){ return } // skip over the metadata.
					if(!Gun.is.val(v)){ return true } // it is true that this is an invalid node.
					if(cb){ cb.call(o, v, f, n) } // optionally callback each field/value.
				});
			}
			return false; // nope! This was not a valid node.
		}

		Gun.is.node.ify = function(n, o){ // convert a shallow object into a node.
			o = Gun.text.is(o)? {soul: o} : o || {};
			n = Gun.is.node.soul.ify(n, o); // put a soul on it.
			Gun.obj.map(n, function(v, f){ // iterate over each field/value.
				if(Gun._.meta === f){ return } // ignore meta.
				Gun.is.node.state.ify(n, {field: f, value: v, state: o.state = o.state || Gun.time.is()}); // and set the state for this field and value on this node.
			});
			return n; // This will only be a valid node if the object wasn't already deep!
		}
		
		Gun.is.node.soul = function(n, o){ return (n && n._ && n._[o || Gun._.soul]) || false } // convenience function to check to see if there is a soul on a node and return it.

		Gun.is.node.soul.ify = function(n, o){ // put a soul on an object.
			o = Gun.text.is(o)? {soul: o} : o || {};
			n = n || {}; // make sure it exists.
			n._ = n._ || {}; // make sure meta exists.
			n._[Gun._.soul] = o.soul || n._[Gun._.soul] || Gun.text.random(); // put the soul on it.
			return n;
		}

		Gun.is.node.state = function(n, o){ return (o && n && n._ && n._[Gun._.state] && Gun.num.is(n._[Gun._.state][o]))? n._[Gun._.state][o] : -Infinity } // convenience function to get the state on a field on a node and return it.

		Gun.is.node.state.ify = function(n, o){ var s; // put a field's state and value on some nodes.
			o = Gun.text.is(o)? {field: o} : o || {};
			n = n || {}; // make sure it exists.
			Gun.obj.as(n, Gun._.meta);
			if(Gun.is.val(o.value)){ n[o.field] = o.value } // if we have a value, then put it.
			s = Gun.obj.as(n._, Gun._.state);
			if(Gun.num.is(o.state)){ s[o.field] = o.state }
			return n;
		}
		
		Gun.is.graph = function(g, cb, fn, o){ // checks to see if an object is a valid graph.
			if(!Gun.obj.is(g) || Gun.obj.empty(g)){ return false } // must be an object.
			return !Gun.obj.map(g, function(n, s){ // we invert this because the way we check for this is via a negation.
				if(!n || s !== Gun.is.node.soul(n) || !Gun.is.node(n, fn)){ return true } // it is true that this is an invalid graph.
				if(!Gun.fns.is(cb)){ return }			 
				cb.call(o, n, s, function(fn){ // optional callback for each node.
					if(fn){ Gun.is.node(n, fn, o) } // where we then have an optional callback for each field/value.
				});
			}); // makes sure it wasn't an empty object.
		}
		
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

		Gun.HAM.node = function(gun, node, opt){
			if(!node){ return }
			var soul = Gun.is.node.soul(node);
			if(!soul){ return }
			opt = Gun.num.is(opt)? {state: opt} : opt || {};
			var vertex = gun.__.graph[soul] = gun.__.graph[soul] || Gun.is.node.ify({}, soul), machine = opt.state || gun.__.opt.state();
			Gun.obj.map(node._, function(v,f){
				if(Gun.obj.has(Gun.__, f)){ return }
				Gun.obj.put(vertex._, f, v);
			});
			if(!Gun.is.node(node, function(value, field){
				var is = Gun.is.node.state(node, field), cs = Gun.is.node.state(vertex, field), iv = Gun.is.rel(value) || value, cv = Gun.is.rel(vertex[field]) || vertex[field];
				var HAM = Gun.HAM(machine, is, cs, iv, cv);
				if(HAM.err){
					root.console.log(".!HYPOTHETICAL AMNESIA MACHINE ERR!.", HAM.err); // this error should never happen.
					return;
				}
				if(HAM.state || HAM.historical || HAM.current){
					//opt.lower(vertex, {field: field, value: value, state: is});
					return;
				}
				if(HAM.incoming){
					Gun.is.node.state.ify(vertex, {field: field, value: value, state: is});
					return;
				}
				if(HAM.defer){
					/*upper.wait = true;
					upper.call(state, vertex, field, incoming, ctx.incoming.state); // signals that there are still future modifications.
					Gun.schedule(ctx.incoming.state, function(){
						update(incoming, field);
						if(ctx.incoming.state === upper.max){ (upper.last || function(){})() }
					}, gun.__.opt.state);*/
				}
			})){ return }
			return vertex;
		}

		Gun.put = function(gun, graph, cb, opt){
			opt = Gun.is.opt(opt || {}, gun.__.opt);
			cb = cb || opt.any;
			Gun.on('put').emit(gun, graph, function(err, ok){
				if(err){ Gun.log(err) }
				var at = {ok: ok, err: err, opt: opt, graph: graph};
				Gun.on('ack').emit(gun, at);
				cb(at.err, at.ok, at);
			}, opt);
		}

		Gun.on('put').event(function(gun, graph, cb, opt){
			if(!Gun.is.graph(graph, function(node, soul){
				Gun.HAM.node(gun, node);
			})){ return cb({err: "Invalid graph!"})/*, this.pause()*/ }
		});

		Gun.get = function(gun, lex, cb, opt){
			opt = Gun.is.opt(opt || {}, gun.__.opt);
			lex = Gun.is.lex(lex || {});
			cb = cb || opt.any;
			Gun.on('get').emit(gun, lex, function(err, node){
				console.log("GET HOW MANY TIMES?", err, node);
				if(err){ Gun.log(err) }
				var at = {lex: lex, node: node, err: err, opt: opt};
				Gun.on('chain').emit(gun, at);
				cb(at.err, at.node, at);
			}, opt);
			return gun;
		}

		Gun.on('get').event(function(gun, lex, cb, opt){
			var graph = gun.__.graph, node = graph[lex.soul];
			if(node){ return cb(null, node)/*, this.pause()*/ }
		});

		Gun.on('chain').event(function(gun, at){
			if(at.node){
				at.node = Gun.HAM.node(gun, at.node);
				if(!at.node){
					at.err = at.err || {err: "Invalid node!"};
					//this.pause();
				}
			}
		});

		Gun.on('chain').event(function(gun, at){
			var lex = at.lex, soul = lex.soul, field = lex.field;
			var graph = gun.__.graph, node = graph[soul], u;
			if(soul){
				at.node = node || at.node;
				if(soul !== Gun.is.node.soul(at.node)){
					at.node = u;
				}
			}
			if(at.node && field){ // TODO: Multiples?
				var ignore = Gun.obj.put({}, Gun._.meta, 1);
				if(!Gun.obj.empty(at.node, Gun.obj.put(ignore, field, 1))){
					at.node = Gun.is.node.ify(Gun.obj.put({}, field, at.node[field]), {soul: soul, state: Gun.is.node.state(at.node, field)});
				}
			}
		});

	}(Gun));

	Gun.chain = Gun.prototype;

	Gun.chain.opt = function(opt, stun){
		opt = opt || {};
		var gun = this, root = (gun.__ && gun.__.gun)? gun.__.gun : (gun._ = gun.__ = {gun: gun}).gun.chain(); // if root does not exist, then create a root chain.
		root.__.by = root.__.by || function(f){ return gun.__.by[f] = gun.__.by[f] || {} };
		root.__.graph = root.__.graph || {};
		root.__.opt = root.__.opt || {};
		root.__.opt.any = root.opt.any || function(){};
		root.__.opt.uuid = root.__.opt.uuid || Gun.text.random;
		root.__.opt.state = root.__.opt.state || Gun.time.is;
		root.__.opt.wire = root.__.opt.wire || {};
		if(Gun.text.is(opt)){ opt = {peers: opt} }
		if(Gun.list.is(opt)){ opt = {peers: opt} }
		if(Gun.text.is(opt.peers)){ opt.peers = [opt.peers] }
		if(Gun.list.is(opt.peers)){ opt.peers = Gun.obj.map(opt.peers, function(n,f,m){ m(n,{}) }) }
		root.__.opt.peers = opt.peers || gun.__.opt.peers || {};
		Gun.obj.map(opt.wire, function(h, f){
			if(!Gun.fns.is(h)){ return }
			root.__.opt.wire[f] = h;
		});
		Gun.obj.map(['key', 'on', 'path', 'map', 'not', 'init'], function(f){
			if(!opt[f]){ return }
			root.__.opt[f] = opt[f] || root.__.opt[f];
		});
		if(!stun){ Gun.on('opt').emit(root, opt) }
		return gun;
	}

	Gun.chain.chain = function(s){
		var from = this, gun = !from.back? from : Gun(from);
		gun.back = gun.back || from;
		gun.__ = gun.__ || from.__;
		gun._ = gun._ || {};
		return gun;
	}

	Gun.chain.put = function(data, cb, opt){
		var gun = this, get = gun._.get, put = gun._.put || {};
		put.opt = Gun.obj.is(opt)? Gun.is.opt(opt, {any: cb}) : Gun.obj.is(cb)? cb : {};
		if(get){
			Gun.get(gun, get.lex, function(err, node, at){
				Gun.on('put.ify').emit(gun, {lex: at.lex, node: node, err: err, opt: put.opt, data: data});
			}, get.opt);
		} else {
			Gun.on('put.ify').emit(gun, {lex: {soul: gun.__.opt.uuid()}, opt: put.opt, data: data});
		}
		return gun;
	}

	Gun.on('put.ify').event(function(gun, at){
		if(at.err){
			return Gun.obj.map([at.opt.any, at.opt.err], function(cb){
				if(Gun.fns.is(cb)){ cb.call(gun, at.err) }
			});
		}
		var soul = Gun.is.node.soul(at.node) || at.lex.soul, field = at.lex.field, data = at.data, state = gun.__.opt.state();
		if(field){
			data = Gun.obj.put({}, field, data);
		}
		data = Gun.is.node.soul.ify(data, soul);
		Gun.chain.put.ify(data, function(err, env){
			if(err || !env || !env.graph){
				return Gun.obj.map([at.opt.any, at.opt.err], function(cb){
					if(Gun.fns.is(cb)){ cb.call(gun, {err: Gun.log(err || "Serializer failed.")}) }
				});
			}
			Gun.put(gun, env.graph, at.opt.any, at.opt);
		}, {node: function(env, cb){ var eat = env.at;
			if(1 === eat.path.length && at.node){
				eat.soul = Gun.is.rel(at.node[eat.path[0]]);
			}
			cb(eat);
		}, value: function(env){ var eat = env.at;
			if(!eat.field){ return }
			Gun.is.node.state.ify(eat.node, {field: eat.field, state: state});
		}, uuid: gun.__.opt.uuid, state: state});
	});

	Gun.chain.put.ify = (function(){
		function ify(data, cb, opt){
			opt = opt || {};
			opt.uuid = opt.uuid || Gun.text.random;
			opt.state = opt.state || Gun.time.is();
			opt.value = opt.value || function(){};
			opt.node = opt.node || function(env, cb){ cb(env.at) };
			var ctx = {at: {path: [], obj: data}, root: {}, graph: {}, queue: [], seen: [], opt: opt, loop: true};
			function end(fn){
				ctx.end = fn || function(){};
				unique(ctx);
			}
			if(!data){ return ctx.err = 'Serializer does not have correct parameters.', end(cb) }
			ctx.at.node = ctx.root;
			while(ctx.loop && !ctx.err){
				seen(ctx, ctx.at);
				normalize(ctx, opt);
				if(ctx.queue.length){
					ctx.at = ctx.queue.shift();
				} else {
					ctx.loop = false;
				}
			}
			end(cb);
		}
		var normalize = function(ctx, opt, xtc){
			opt.node(ctx, function(at, soul){
				at.soul = at.soul || soul || Gun.is.node.soul(at.obj) || Gun.is.node.soul(at.node) || opt.uuid();
				ctx.graph[at.soul] = Gun.is.node.soul.ify(at.node, at.soul);
				Gun.list.map(at.back, function(rel){
					rel[Gun._.soul] = at.soul;
				});
				unique(ctx);
			});
			Gun.obj.map(ctx.at.obj, function(val, field){
				field = ctx.at.field = String(field);
				ctx.at.value = val;
				if(Gun._.meta == field){
					Gun.obj.as(ctx.at.node, Gun._.meta);
					Gun.obj.map(val, function(v,f){
						Gun.obj.put(ctx.at.node[field], f, Gun.obj.copy(v));
					});
					return;
				}
				//Gun.obj.has(Gun.__, field) ||
				if(field.indexOf('.') != -1 || Gun.obj.has(reserved, field)){
					return ctx.err = "Invalid field name on '" + ctx.at.path.join('.') + "'!";
				}
				if(Gun.is.val(val)){
					ctx.at.node[field] = Gun.obj.copy(val);
					opt.value(ctx);
					return;
				}
				var at = {obj: val, node: {}, back: [], path: [field]}, was;
				at.path = (ctx.at.path||[]).concat(at.path || []);
				if(!Gun.obj.is(val)){
					return ctx.err = "Invalid value at '" + at.path.join('.') + "'!";
				}
				if(was = seen(ctx, at)){
					(was.back = was.back || []).push(ctx.at.node[field] = Gun.is.rel.ify(Gun.is.node.soul(was.node) || null));
				} else {
					ctx.queue.push(at);
					at.back.push(ctx.at.node[field] = Gun.is.rel.ify(null));
				}
				opt.value(ctx);
			});
		}
		function seen(ctx, at){
			return Gun.list.map(ctx.seen, function(has){
				if(at.obj === has.obj){ return has }
			}) || (ctx.seen.push(at) && false);
		}
		function unique(ctx){
			if(ctx.err || (!Gun.list.map(ctx.seen, function(at){
				if(!at.soul){ return true }
			}) && !ctx.loop)){ return ctx.end(ctx.err, ctx), ctx.end = function(){}; }
		}
		var reserved = Gun.list.map([Gun._.meta, Gun._.soul, Gun._.field, Gun._.value, Gun._.state], function(v,i,t){
			t(v,1);
		});
		return ify;
	}());

	Gun.chain.get = function(lex, cb, opt){ // opt takes 4 types of cbs - ok, err, not, and any.
		var gun = this.chain(), get = gun._.get = {};
		(opt = Gun.obj.is(cb)? cb : Gun.obj.is(opt)? opt : {}).any = Gun.fns.is(cb)? cb : null;
		get.opt = opt = Gun.is.opt(get.opt, opt);
		get.lex = Gun.obj.is(lex)? lex : {soul: lex};
		if(!opt.any){ return gun }
		return Gun.get(gun, get.lex, function(err, node, at){
			opt.any.call(gun, err, Gun.obj.copy(node), at);
		}, get.opt);
	}

	Gun.chain.path = function(field, cb, opt){
		var gun = this, get = gun._.get = gun._.get || {lex: {}};
		(opt = Gun.obj.is(cb)? cb : Gun.obj.is(opt)? opt : {}).any = Gun.fns.is(cb)? cb : null;
		get.lex.field = field = Gun.text.ify(field) || '';
		get.opt = Gun.is.opt(get.opt || {}, opt);
		if(!opt.any){ return gun }
		return Gun.get(gun, get.lex, function(err, node, at){
			if(!Gun.obj.has(node, field = get.lex.field)){ return } // TODO: NOT!?
			opt.any.call(gun, err, Gun.obj.copy(node[field]), field, at); // TODO: Wrong gun?
		}, opt);
	}

	Gun.chain.on = function(cb, opt){
		var gun = this, get = gun._.get;
		(opt = Gun.obj.is(cb)? cb : Gun.obj.is(opt)? opt : {}).ok = Gun.fns.is(cb)? cb : null;
		return Gun.get(gun, get.lex, function(err, node, at){
			if(err || !node){ return }
			var lex = at.lex, field = lex.field, soul;
			if(!field || !(soul = Gun.is.rel(node[field]))){ return cb.call(gun, Gun.obj.copy(node), field) } // TODO: Wrong gun?
			cb.call(gun, Gun.obj.copy(node), field);
			//opt.field = field;
			//gun.get(soul).on(cb, opt);
		}, opt);
	}

	var root = this || {}; // safe for window, global, root, and 'use strict'.
	if(root.window){ window.Gun = Gun }
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
	
	if(!this.Gun){ return }
	if(!window.JSON){ throw new Error("Include JSON first: ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js") } // for old IE use
	Gun.tab = Tab;
	
	Tab.on = Gun.on.create();

	Gun.on('get').event(function(gun, lex, cb, opt){
		Tab.store.get((opt.prefix || '') + lex.soul, function(err, data){
			if(!data){ return } // let the peers handle no data.
			cb(err, data); // node
		});
	});

	Gun.on('put').event(function(gun, graph, cb, opt){
		Gun.is.graph(graph, function(node, soul){
			if(!(node = gun.__.graph[soul])){ return }
			Tab.store.put((opt.prefix || '') + soul, node);
		});
	});

	Gun.on('put').event(function(gun, graph, cb, opt){
		var msg = {
			'#': Gun.text.random(9), // msg ID
			'$': graph // msg BODY
		};
		Tab.on(msg['#']).event(cb);
		Tab.peers(opt.peers || gun.__.opt.peers).send(msg);
	});

	Gun.on('get').event(function(gun, lex, cb, opt){
		var msg = {
			'#': Gun.text.random(9), // msg ID
			'$': Gun.is.lex.ify(lex) // msg BODY
		};
		Tab.on(msg['#']).event(cb);
		Tab.peers(opt.peers).send(msg);
		if(Gun.obj.empty(opt.peers)){
			Tab.on(msg['#']).emit(null);
		}
	});

	(function(exports){
		function P(p){
			if(!P.is(this)){ return new P(p) }
			this.peers = p;
		}
		P.is = function(p){ return (p instanceof P) }
		P.chain = P.prototype;
		P.chain.send = function(msg){
			Gun.obj.map(this.peers, function(peer, url){
				Tab.request(url, msg, function(err, reply){ var body = (reply||{}).body||{};
					Tab.on(body['@'] || msg['#']).emit(err || body['!'], body['$']);
				});
			});
		}
		exports.peers = P;
	}(Tab));

	;(function(exports){
		function s(){}
		s.put = function(key, val){ return store.setItem(key, Gun.text.ify(val)) }
		s.get = function(key, cb){ return cb(null, Gun.obj.ify(store.getItem(key) || null)) } 
		s.del = function(key){ return store.removeItem(key) }
		s.noop = function(){};
		var store = this.localStorage || {setItem: s.noop, removeItem: s.noop, getItem: s.noop};
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
				if(!ws.cbs[req.headers['ws-rid']]){
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
				//Gun.log("We have a pushed message!", res);
				if(res.body){ r.createServer.ing(res, function(res){ r(opt.base, null, null, res)}) } // emit extra events.
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
						//Gun.log("-- go go go", res);
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

(function(){
	if(!this.Gun){ return }
	function Test(o){
		var test = this;
		if(!(test instanceof Test)){ return new Test(o) }
		test._ = {};
		test._.stack = [];
		return test;
	}
	Test.chain = Test.prototype;
	Test.chain.run = function(fn){
		var test = this;
		var e = test._.i, i = 0;
		var stack = test._.stack;
		stack.push(fn);
		//var to = setInterval(function(){ if(++i >= e){ return clearTimeout(to) }
		while(++i <= e){
			Gun.list.map(stack, function(fn){ fn(i) })
		}
		//},0);
		return test;
	}
	Test.chain.it = function(i){
		var test = this;
		test._.i = i || 1000;
		return test;
	}
	Test.chain.gen = function(fn){
		var test = this;
		test._.stack.push(fn);
		return test;
	}
	var gun = window.gun = Gun();//Gun('http://localhost:8080/gun');
	window.SPAM = function(read){
		//localStorage.clear();
		Test().it(10).gen(function(i){
			if(read){
				gun.get('users').path(i).on(function(node){
					console.log("node:", node);
				});
				return;
			}
			gun.get('users').path(i).put({
				i: i,
				name: Gun.text.random(),
				birth: Gun.time.is(),
				sex: 0.5 < Math.random()? true : false
			}, function(err, ok){
				console.log("put", err, ok, 'on', i);
			});
		}).run(function(){});
	}
}());
/* EXTRA GUN UTILITY FUNCTIONS I MIGHT WANT TO KEEP
(function(){
	Gun().get('chat').path('messages').since(Gun().get('me').path('last')).map().val(function(msg){

	});
	Gun().get('chat').path('messages').last(100).map().val(function(msg){
	});

var peers = [
    peer1,
    peer2
];

Gun.on('put').event(function(graph, cb, opt){
	Gun.is.graph(graph, function(node, soul){
		localStorage[soul] = node;
	});
});
Gun.on('put').event(function(graph, cb, opt){
	Peers(opt.peers).send({
		id: MsgID,
    value: data,
    from: myPeerID
  }, cb);
});

Gun.on('get').event(function(lex, cb, opt){
	Peers(opt.peers || peers).send({
    '#': MsgID,
    '$': lex,
    '~': myPeerID
  }, cb);
});

Peers.server(function(req, res){
	if(Msg.IDs[req.id]){ return } // throttle
	// auth
	Peers(peers).send(req); // relay
	// auth
	if(req.rid){ return } // ignore
	if(req.put && opt.everything || graph[for soul in req.body]){ // process
		Gun.put(gun, req.body, REPLY);
	}
});

// TODO: MARK / JESSE need to solve infinite circular loop on get flushing and put flushing.

GUN = {'#': 'soul', '.': 'field', '=': 'value', '>': 'state'}
MSG = {'#': 'id', '$': 'body', '@': 'to'}

Gun.wire = function(data){

}
Gun.get.wire = function(lex, cb, opt){ return Gun.text.is(lex)? Gun.get.wire.from(lex, cb, opt) : Gun.get.wire.to(lex, cb, opt) }
Gun.get.wire.to = function(lex, cb, opt){
	var t = '';
	Gun.obj.map(lex, function(v,f){
		if(!v){ return }
		Gun.list.map(Gun.list.is(v)? v : [v], function(v){
			t += f + "'" + Gun.put.wire.ify(v) + "'";
		});
	});
	return t + '?';
}
Gun.get.wire.from = function(t, cb, opt){
	if(!t){ return null }
	var a = Gun.put.wire.from.parse(t), lex = {};
	Gun.list.map([Gun._.soul, Gun._.field, Gun._.value, Gun._.state], function(sym, i){
		if(!(i = a.indexOf(sym) + 1)){ return }
		lex[sym] = Gun.put.wire.type(a[i]);
	});
	return lex;
}
// #soul.field
// "#soul.field=value>state"
// #messages>>1234567890 //{soul: 'messages', state: {'>': 1234567890}}
// #id$"msg"~who@to

Gun.put.wire = function(n, cb, opt){ return Gun.text.is(n)? Gun.put.wire.from(n, cb, opt) : Gun.put.wire.to(n, cb, opt) }
Gun.put.wire.ify = function(s){ var tmp;
	if(Infinity === s || -Infinity === s){ return s }
	if(tmp = Gun.is.rel(s)){ return '#' + JSON.stringify(tmp) }
	return JSON.stringify(s)
}
Gun.put.wire.type = function(s){ var tmp;
	if(Gun._.soul === s.charAt(0)){ return Gun.is.rel.ify(JSON.parse(s.slice(1))) }
	if(String(Infinity) === s){ return Infinity }
	if(String(-Infinity) === s){ return -Infinity }
	return JSON.parse(s) 
}
Gun.put.wire.to = function(n, cb, opt){ var t, b;
	if(!n || !(t = Gun.is.node.soul(n))){ return null }
	cb = cb || function(){};
	t = (b = "#'" + Gun.put.wire.ify(t) + "'");
	var val = function(v,f, nv,nf){
		var w = '', s = Gun.is.node.state(n,f), sw = '';
		if(!s){ return }
		w += ".'" + Gun.put.wire.ify(f) + "'";
		console.log("yeah value?", v, Gun.put.wire.ify(v));
		w += "='" + Gun.put.wire.ify(v) + "'";
		if(s !== Gun.is.node.state(n,nf)){
			w += ">'" + Gun.put.wire.ify(s) + "'";
		} else {
			sw = ">'" + Gun.put.wire.ify(s) + "'";
		}
		t += w;
		w = b + w + sw;
		cb(null, w);
	}
	var next = function(v,f){ // TODO: BUG! Missing adding meta data.
		if(Gun._.meta === f){ return }
		if(next.f){ 
			val(next.v, next.f, v,f);
		}
		next.f = f;
		next.v = v;
	}
	Gun.obj.map(n, next);
	next();
	return t;
}
Gun.put.wire.from = function(t, cb, opt){
	if(!t){ return null }
	var a = Gun.put.wire.from.parse(t);
	Gun.list.map(a, function(v, i){
		if(Gun._.soul === v){
			Gun.is.node.soul.ify(n, Gun.put.wire.type(a[i]));
			return;
		}
		if(Gun._.field === v){
			var val = a.indexOf(Gun._.value,i), state = a.indexOf(Gun._.state,i);	
			Gun.is.node.state.ify([n], Gun.put.wire.type(a[i]), Gun.put.wire.type(a[val+1]), Gun.put.wire.type(a[state+1]));
			return;
		}
	})
	return n;
}
Gun.put.wire.from.parse = function(t){
	var a = [], s = -1, e = 0, end = 1, n = {};
	while((e = t.indexOf("'", s + 1)) >= 0){
		if(s === e || '\\' === t.charAt(e-1)){}else{
			a.push(t.slice(s + 1,e));
			s = e;
		}
	}
	return a;
}
}());
*/
/*
;(function(){ // make as separate module!
	Gun.chain.sql = function(sql){
		var gun = this;//.chain();
		sql = gun._.sql = sql || {};
		gun.select = function(sel){
			sql.select = sel;
			return gun;
		}
		gun.from = function(from){
			sql.from = from;
			gun.get(from).map();
			return gun;
		}
		gun.where = function(where){
			sql.where = where;
			return gun;
		}
		return gun;
	}

	return;
	Gun.on('chain').event(function(gun, at){
		//console.log("sql stuff?", gun._, at.node);
		var query = gun._.sql;
		if(!query){ return }
		var node = at.node;
	});
}());
*/