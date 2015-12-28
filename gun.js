;(function(){
	function Gun(o){
		var gun = this;
		if(!Gun.is(gun)){ return new Gun(o) }
		if(Gun.is(o)){ return gun }
		return gun.opt(o);
	}

	Gun.chain = Gun.prototype;

	Gun.chain.opt = function(opt, stun){
		opt = opt || {};
		var gun = this, root = (gun.__ && gun.__.gun)? gun.__.gun : (gun._ = gun.__ = {gun: gun}).gun.chain(); // if root does not exist, then create a root chain.
		root.__.by = root.__.by || function(f){ return gun.__.by[f] = gun.__.by[f] || {} };
		root.__.graph = root.__.graph || {};
		root.__.opt = root.__.opt || {};
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
		gun._.on = gun._.on || Gun.on.create();
		gun._.at = gun._.at || Gun.on.at(gun._.on);
		return gun;
	}

	Gun.chain.put = function(val, cb, opt){
		opt = opt || {};
		cb = cb || function(){};
		var gun = this, chain = gun._.put || gun.chain(), drift = Gun.time.now(); // everything on the chain after a put needs to wait for the put to be done. Thus we create a new chain that we return. However, we might perform multiple puts in a row - in which case, we want to reuse the same new chain for each multiple time.
		function put(at){
			var ctx = {obj: val}; // prep the value for serialization
			ctx.soul = (at.at && at.at.soul) || at.soul; // figure out where we are
			ctx.field = (at.at && at.at.field) || at.field; // did we come from some where?
			ctx.by = chain.__.by(ctx.soul);
			if(!at.soul || (at.not && at.not === at.field) || cb[at.hash = at.hash || Gun.on.at.hash(at)]){ return } cb[at.hash] = true; // only put the data once on each soul we encounter.
			if(!opt.key && Gun.is.node.soul(ctx.by.node, Gun._.key)){ return } // ignore key nodes unless we're trying to update one explicitly.
			if(ctx.field){ Gun.obj.as(ctx.obj = {}, ctx.field, val) } // if there is a field, then data is actually getting put on the parent.
			else if(!Gun.obj.is(val)){ return cb.call(chain, ctx.err = {err: Gun.log("No node exists to put " + (typeof val) + ' "' + val + '" in!')}), chain._.at('err').emit(ctx.err) } // if the data is a primitive and there is no context for it yet, then we have an error.
			function soul(env, cb, map){ var eat;
				if(!env || !(eat = env.at) || !env.at.node){ return }
				if(!eat.node._){ eat.node._ = {} }
				if(!eat.node._[Gun._.HAM]){ eat.node._[Gun._.HAM] = {} }
				if(Gun.is.node.soul(eat.node)){
					if(!opt.key && Gun.is.node.soul(eat.node, Gun._.key)){ // TODO: Clean this up!
						var tmp = {node: eat.node};
						tmp.union = chain.__.by(tmp.key = Gun.is.node.soul(eat.node)).node;
						Gun.is.node(tmp.union, function(rel, s){
							env.at.node = env.graph[s] = env.graph[s] || Gun.is.node.soul.ify({}, s);
							map(env, function(){});
							Gun.is.node.soul.ify(env.at.node, s, true);
							Gun.obj.del(env.at.node._, Gun._.key);
						});
						eat.node = tmp.node;
						Gun.obj.del(env.graph, tmp.key);
						return;
					}
				} else {
					if(ctx.obj === eat.obj){
						Gun.obj.as(env.graph, eat.soul = Gun.obj.as(eat.node._, Gun._.soul, ctx.soul), eat.node);
						cb(eat, eat.soul);
					} else {
						function path(err, node){
							if(err){ env.err = err }
							eat.soul = Gun.is.node.soul(node) || Gun.is.node.soul(eat.obj) || Gun.is.node.soul(eat.node) || Gun.text.random();
							Gun.obj.as(env.graph, Gun.obj.as(eat.node._, Gun._.soul, eat.soul), eat.node);
							cb(eat, eat.soul);
						}
						(at.not)? path() : gun.path(eat.path || [], path, {once: true, rel: true, stun: true}); // TODO: BUG! at.not only applies to one thing, not potentially all things? Maybe?
					}
				}
				if(!eat.field){ return }
				eat.node._[Gun._.HAM][eat.field] = drift;
			}
			function end(err, ify){
				if(err || ify.err){ return cb.call(chain, err || ify.err), chain._.at('err').emit(err || ify.err) } // check for serialization error, emit if so.
				if(err = Gun.union(chain, ify.graph, {end: false}).err){ return cb.call(chain, err), chain._.at('err').emit(err) } // now actually union the serialized data, emit error if any occur.
				Gun.is.graph(ify.graph, function(node, soul){ // TODO: This is correct, however is there a cleaner implementation?
					if(chain.__.by(soul).end){ return }
					Gun.union(chain, Gun.is.node.soul.ify({}, soul)); // fire off an end node if there hasn't already been one, to comply with the wire spec.
				});
				if(Gun.fns.is(end.wire = chain.__.opt.wire.put)){
					function wcb(err, ok, info){ 
						if(err){ return Gun.log(err.err || err), cb.call(chain, err), chain._.at('err').emit(err) }
						return cb.call(chain, err, ok);
					}
					end.wire(ify.graph, wcb, opt);
				} else {
					if(!Gun.log.count('no-wire-put')){ Gun.log("Warning! You have no persistence layer to save to!") }
					cb.call(chain, null); // This is in memory success, hardly "success" at all.
				}
				Gun.obj.del(at.at || at, 'not'); // the data is no longer unknown!
				if(ctx.field && (ctx.rel = Gun.is.rel(ify.root[ctx.field]))){ // if we are already on a field and the data we just saved on it is another node...
					return chain.get(ctx.rel, null, {chain: chain, atat: (at.at || at), raw: true}); // then use get to control the event emitter for that soul.
				}
				chain.get(ctx.soul, null, {chain: chain, key: opt.key || at.key, field: ctx.field, raw: true}); // elsewise use get to control the event emitter for the root soul.
			}
			Gun.ify(ctx.obj, soul, {pure: true})(end); // serialize the data!
		}
		function not(at){
			if(gun.__.opt.init){ return Gun.log("Warning! You have no context to put on!") } // TODO: Allow local opt as well, not just instance opt!
			if(at.soul){ return at.not = true, put(at) }
			gun.init();
		}
		gun._.at('soul').map(put); // put data on every soul that flows through this chain.
		gun._.at('null').map(not); // listen if the chain cannot find data.
		if(gun === gun.back){ // if we are the root chain...
			put({soul: Gun.is.node.soul(val) || Gun.text.random(), not: true}); // then cause the new chain by saving data!
		} else {
			chain._.put = gun._.put || chain; // else allow this chain to be reusable for other puts.
		}
		return chain;
	}

	Gun.chain.get = function(key, cb, opt){ // get opens up a reference to a node and loads it.
		opt = opt || {};
		opt.rel = opt.rel || Gun.is.rel(key);
		if(!(key = Gun.is.rel(key) || key) || !Gun.text.is(key)){ return key = this.chain(), cb.call(key, {err: Gun.log('No key or relation to get!')}), key }
		cb = cb || function(){}; // only gets called for wire stuff, not chain events.
		var ctx = {by: this.__.by(key)};
		ctx.by.chain = ctx.by.chain || this.chain();
		ctx.chain = opt.chain || ctx.by.chain; // TODO: BUG! opt.chain is asking for us to fire on this chain, not necessarily make it the this of callbacks.
		function chains(cb){ if(opt.chain){ cb(opt.chain) } cb(ctx.by.chain); }
		function memory(at){
			var cached = ctx.chain.__.by(at.soul).node;
			if(!cached){ return false }
			if(Gun.is.node.soul(cached, Gun._.key)){ // TODO: End node from wire might not have key indicator?
				opt.key = opt.key || Gun.is.node.soul(cached);
				Gun.is.node(at.change || cached, union);
			}
			if(opt.key){ (at = Gun.obj.copy(at)).key = opt.key }
			if(!at.change){ at.change = cached }
			if(at.key){ cached = Gun.union.ify(ctx.chain, at.key) }
			if(opt.raw){ cb.call(map.raw, at) }
			else { cb.call(ctx.chain, null, Gun.obj.copy(at.field? cached[at.field] : cached), at.field) }
			chains(function(chain){ chain._.at('soul').emit(at) });
			return true;
		}
		function union(rel, soul){
			ctx.chain.get(rel, cb, {chain: ctx.chain, key: opt.key, field: opt.field, raw: opt.raw});
		}
		function get(err, data, info){
			//console.log("chain.get wire", err, data, info);
			if(err){
				Gun.log(err.err || err);
				cb.call(ctx.chain, err);
				return chains(function(chain){ chain._.at('err').emit(err) });
			}
			if(!data){
				cb.call(ctx.chain, null, null);
				return chains(function(chain){ chain._.at('null').emit({not: key}) });
			}
			if(Gun.obj.empty(data)){ return }
			if(err = Gun.union(ctx.chain, data).err){
				cb.call(ctx.chain, err);
				return chains(function(chain){ chain._.at('err').emit(err) });
			}
		}
		function map(at){
			map.ran = true;
			map.raw = map.raw || this;
			if(opt.atat){ at.at = opt.atat }
			if(opt.field){ (at = Gun.obj.copy(at)).field = opt.field }
			else if(at.field){ return }
			if(memory(at)){ return }
			if(Gun.fns.is(map.wire)){
				return map.wire(key, get, opt);
			}
			if(!Gun.log.count('no-wire-get')){ Gun.log("Warning! You have no persistence layer to get from!") }
			cb.call(ctx.chain, null); // This is in memory success, hardly "success" at all.
			chains(function(chain){ chain._.at('null').emit({not: key}) });
		}
		if(Gun.fns.is(map.wire = ctx.chain.__.opt.wire.get) && opt.force){ map.wire(key, get, opt) }
		map.raw = (map.at = ctx.chain.__.at(key)).map(map);
		if(opt.raw){ opt.raw = map.raw }
		if(!map.ran){ map.at.emit({soul: key}) } // TODO: BUG! Add a change set!
		return ctx.chain;
	}

	Gun.chain.key = function(key, cb, opt){
		var gun = this;
		opt = Gun.text.is(opt)? {soul: opt} : opt || {};
		cb = cb || function(){};
		if(!Gun.text.is(key) || !key){ return cb.call(gun, {err: Gun.log('No key!')}), gun }
		function index(at){
			var ctx = {node: gun.__.by(at.soul).node};
			if(at.soul === key || at.key === key){ return }
			if(cb[at.hash = at.hash || Gun.on.at.hash(at)]){ return } cb[at.hash] = true;
			if(Gun.is.node.soul(ctx.node, Gun._.key)){ return }
			ctx.obj = Gun.obj.put({}, at.soul, Gun.is.rel.ify(at.soul));
			Gun.obj.as((ctx.node = Gun.is.node.ify(ctx.obj, key))._, Gun._.key, 1);
			gun.__.gun.put(ctx.node, function(err, ok){cb.call(this, err, ok)}, {key: key}); // TODO: Is this cheating to get the tests to pass by creating a new cb every time such that cb[hash] is always unique?
		}
		if(gun === gun.back){
			if(!opt.soul){
				cb.call(gun, {err: Gun.log('You have no context to `.key`!')});
			} else { index({soul: opt.soul}) } // force inject key!
		} else {
			gun._.at('soul').map(index);
		}
		return gun;
	}

	Gun.chain.on = function(cb, opt){ // on subscribes to any changes on the souls.
		var gun = this, u;
		opt = Gun.obj.is(opt)? opt : {change: opt};
		cb = cb || function(){};
		function map(at){
			map.raw = map.raw || this;
			var ctx = {by: gun.__.by(at.soul)}, node = ctx.by.node, change = at.change || node;
			if(opt.once){ this.off() }
			if(Gun.is.node.soul(node, Gun._.key)){ (at = Gun.obj.copy(at)).key = at.key || Gun.is.node.soul(node) } // TODO: This is necessary, but it would be ideal if it was handled elsewhere. Currently .get is suppose to, but there is an edge case where it can't because a key relation is put on a field. This causes the context to become a key node.
			if(opt.raw){ return cb.call(map.raw, at) }
			if(at.key){ node = Gun.union.ify(ctx.by.chain || gun, at.key) }
			if(!cb[at.hash]){ change = node } cb[at.hash] = true;
			if(opt.change){ node = Gun.is.node.soul.ify(Gun.obj.copy(change || node), at.key || at.soul, true) }
			if(!opt.empty && Gun.obj.empty(node, Gun._.meta)){ return }
			if(!node){ return }
			cb.call(ctx.by.chain || gun, Gun.obj.copy(at.field? node[at.field] : node), at.field || (at.at && at.at.field));
		};
		map.raw = gun._.at('soul').map(map);
		if(opt.raw){ opt.raw = map.raw }
		if(gun === gun.back){ Gun.log('You have no context to `.on`!') }
		return gun;
	}

	Gun.chain.path = function(path, cb, opt){
		if(!Gun.list.is(path)){ if(!Gun.text.is(path)){ if(!Gun.num.is(path)){ // if not a list, text, or number
			return cb.call(this, {err: Gun.log("Invalid path '" + path + "'!")}), this; // then complain
		} else { return this.path(path + '', cb, opt)  } } else { return this.path(path.split('.'), cb, opt) } } // else coerce upward to a list.
		var gun = this, chain = gun.chain();
		cb = cb || function(){};
		opt = opt || {};
		function trace(at, pctx){ var ctx;
			(ctx = {by: gun.__.by(at.soul), on: this, field: (at.at && at.at.field) || at.field, path: ((pctx && pctx.path) || path).slice()}).sat = at.soul;
			var node = cb[at.hash]? at.change || ctx.by.node : ctx.by.node, field = Gun.text.ify(ctx.path.shift());
			function chains(cb){ if(opt.chain){ cb(opt.chain) } cb(chain) }
			if(Gun.is.node.soul(ctx.by.node, Gun._.key)){ return }
			if(at.key){ node = Gun.is.node.soul.ify(Gun.obj.copy(node), at.key || at.soul, true) }
			cb[at.hash] = cb[at.hash] || {off:function(){}}; // WELL whatever. TODO: UGLY! But hey, it works.
			if(field && field === (at.at && at.at.field)){
				if(ctx.path.length){ return cb.call(ctx.by.chain || chain, null, null) }
				if(opt.once && this.off){ this.off() }
				cb.call(ctx.by.chain || chain, null, Gun.obj.copy(node), field);
				if(!opt.stun){ chains(function(chain){ chain._.at('soul').emit(at) }) }
			} else
			if(Gun.obj.has(node, field)){
				var on = Gun.obj.as(cb, ctx.sat + field, {off: function(){}});
				if((ctx.soul = Gun.is.rel(ctx.rel = node[field])) === on.soul){ return } // TODO: maybe emit?
				on.off();
				if(ctx.soul){
					function rel(pat){ var pctx;
						if(!pat){ return }
						if(pat.err){ return cb.call(ctx.gun || chain, pat.err), chains(function(chain){ chain._.at('err').emit(pat) }) }
						pctx = {by: gun.__.by(pat.soul), at: {soul: pat.soul, key: pat.key, at: {soul: ctx.sat, field: field}, via: 'path rel'}};
						if(opt.once){
							if(this.off){ this.off() }
							if(ctx.on && ctx.on.off){ ctx.on.off() }
						}
						if(ctx.path.length){ return trace.call(this, pctx.at, ctx) }
						cb.call(pctx.by.chain || ctx.gun, null, Gun.obj.copy(pctx.by.node), field); // TODO: BUG! Should this be the pseudo node if it exists?
						if(!opt.stun){ chains(function(chain){ chain._.at('soul').emit(pctx.at) }) }
					}
					ctx.gun = gun.get(ctx.rel, rel, on = {raw: true});
					return (on = cb[ctx.sat + field] = on.raw).soul = ctx.soul;
				} else {
					if(ctx.path.length){ return }
					if(opt.once){ if(ctx.on && ctx.on.off){ ctx.on.off() } }
					cb.call(ctx.by.chain || chain, null, Gun.obj.copy(node[field]), field);
					if(!opt.stun){ chains(function(chain){ chain._.at('soul').emit({soul: ctx.sat, field: field, key: at.key, via: 'path val', banana: field}) }) } // pass at through?
				}
			} else 
			if(!Gun.obj.has(ctx.by.node || node, field) && ctx.by.end){
				if(opt.once && this.off){ this.off() }
				cb.call(ctx.by.chain || chain, null, null);
				if(!opt.stun){ chains(function(chain){ chain._.at('null').emit({soul: ctx.sat, field: field, not: field, key: at.key, via: 'path null'}) }) }
			}
		};
		gun.on(trace, {raw: true, once: opt.once});
		if(!gun.__.opt.init){ gun._.at('null').map(function(at){ gun.init() }) } // TODO: Allow for local opt as well, not just instance opt!
		if(gun === gun.back){ cb.call(gun, {err: Gun.log('You have no context to `.path`!')}) }
		return chain;
	}

	Gun.chain.map = function(cb, opt){
		var gun = this, chain = gun.chain();
		cb = cb || function(){};
		opt = Gun.bi.is(opt)? {change: opt} : opt || {};
		opt.change = Gun.bi.is(opt.change)? opt.change : true;
		function path(err, val, field){
			cb.call(this, val, field);
		}
		function each(val, field){
			this.path(field, path, {chain: chain});
			// TODO:
			// 1. Ability to turn off an event.
			// 2. Ability to pass chain context to fire on. // DONE
			// 3. Pseudoness handled for us. // DONE
			// 4. Reuse.
		}
		function map(change){
			Gun.is.node(change, each, this);
		}
		gun.on(map, opt.change); // {change: true}
		if(gun === gun.back){ Gun.log('You have no context to `.map`!') }
		return chain;
	}
	
	Gun.chain.not = function(cb, opt){
		var gun = this, chain = gun.chain();
		cb = cb || function(){};
		opt = opt || {};
		function not(at){
			if(at.field){
				if(Gun.obj.has(gun.__.by(at.soul).node, at.field)){ return Gun.obj.del(at, 'not'), chain._.at('soul').emit(at) }
			} else
			if(Gun.text.is(at.not) && gun.__.by(at.not).node){ return }
			else if(at.soul && gun.__.by(at.soul).node){ return Gun.obj.del(at, 'not'), chain._.at('soul').emit(at) }
			var kick = function(next){
				if(++kick.c){ return Gun.log("Warning! Multiple `not` resumes!"); }
				next._.at('soul').map(function(on){
					chain._.at('soul').emit(on); 
				});
			};
			kick.c = -1
			kick.chain = gun.chain();
			kick.next = cb.call(kick.chain, opt.raw? at : (at.field || at.soul || at.not), kick);
			kick.soul = at.soul || Gun.text.random();
			if(Gun.is(kick.next)){ kick(kick.next) }
			if(!gun.__.by(kick.soul).node){
				//Gun.union(gun, Gun.is.node.soul.ify({}, kick.soul));
			}
			kick.chain._.at('soul').emit({soul: kick.soul, field: at.field, not: at.field || kick.soul, via: 'not'});
		}
		gun._.at('null').map(not);
		gun._.at('soul').map(not);
		if(gun === gun.back){ Gun.log('You have no context to `.not`!') }
		return chain;
	}

	Gun.chain.init = function(val, cb, opt){
		return this === this.back? this.put({}) : this.not(function(at){
			return at.field? this.get(at.soul).put(Gun.obj.put({}, at.field, {})).path(at.field) : Gun.text.is(at.not)? this.put({}).key(at.not, cb) : this.put({}, cb);
		}, {raw: true})
	}
	
	;(function(Util){
		Util.fns = {is: function(fn){ return (fn instanceof Function)? true : false }};
		Util.bi = {is: function(b){ return (b instanceof Boolean || typeof b == 'boolean')? true : false }}
		Util.num = {is: function(n){ return !Util.list.is(n) && (Infinity === n || n - parseFloat(n) + 1 >= 0) }}
		Util.text = {is: function(t){ return typeof t == 'string'? true : false }}
		Util.text.ify = function(t){
			if(Util.text.is(t)){ return t }
			if(JSON){ return JSON.stringify(t) }
			return (t && t.toString)? t.toString() : t;
		}
		Util.text.random = function(l, c){
			var s = '';
			l = l || 24; // you are not going to make a 0 length random number, so no need to check type
			c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghiklmnopqrstuvwxyz';
			while(l > 0){ s += c.charAt(Math.floor(Math.random() * c.length)); l-- }
			return s;
		}
		Util.list = {is: function(l){ return (l instanceof Array)? true : false }}
		Util.list.slit = Array.prototype.slice;
		Util.list.sort = function(k){ // creates a new sort function based off some field
			return function(A,B){
				if(!A || !B){ return 0 } A = A[k]; B = B[k];
				if(A < B){ return -1 }else if(A > B){ return 1 }
				else { return 0 }
			}
		}
		Util.list.map = function(l, c, _){ return Util.obj.map(l, c, _) }
		Util.list.index = 1; // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
		Util.obj = {is: function isObj (o) { return !o || !o.constructor? false : o.constructor === Object? true : !o.constructor.call || o.constructor.toString().match(/\[native\ code\]/)? false : true }}
		Util.obj.put = function(o, f, v){ return Util.obj.as(o, f, v), o } 
		Util.obj.del = function(o, k){
			if(!o){ return }
			o[k] = null;
			delete o[k];
			return true;
		}
		Util.obj.ify = function(o){
			if(Util.obj.is(o)){ return o }
			try{o = JSON.parse(o);
			}catch(e){o={}};
			return o;
		}
		Util.obj.copy = function(o){ // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
			return !o? o : JSON.parse(JSON.stringify(o)); // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
		}
		Util.obj.as = function(b, f, d){ return b[f] = b[f] || (arguments.length >= 3? d : {}) }
		Util.obj.has = function(o, t){ return o && Object.prototype.hasOwnProperty.call(o, t) }
		Util.obj.empty = function(o, n){
			if(!o){ return true }
			return Util.obj.map(o,function(v,i){
				if(n && (i === n || (Util.obj.is(n) && Util.obj.has(n, i)))){ return }
				if(i){ return true }
			})? false : true;
		}
		Util.obj.map = function(l, c, _){
			var u, i = 0, ii = 0, x, r, rr, ll, lle, f = Util.fns.is(c),
			t = function(k,v){
				if(v !== u){
					rr = rr || {};
					rr[k] = v;
					return;
				} rr = rr || [];
				rr.push(k);
			};
			if(Object.keys && Util.obj.is(l)){
				ll = Object.keys(l); lle = true;
			}
			if(Util.list.is(l) || ll){
				x = (ll || l).length;
				for(;i < x; i++){
					ii = (i + Util.list.index);
					if(f){
						r = lle? c.call(_ || this, l[ll[i]], ll[i], t) : c.call(_ || this, l[i], ii, t);
						if(r !== u){ return r }
					} else {
						//if(Util.test.is(c,l[i])){ return ii } // should implement deep equality testing!
						if(c === l[lle? ll[i] : i]){ return ll? ll[i] : ii } // use this for now
					}
				}
			} else {
				for(i in l){
					if(f){
						if(Util.obj.has(l,i)){
							r = _? c.call(_, l[i], i, t) : c(l[i], i, t);
							if(r !== u){ return r }
						}
					} else {
						//if(a.test.is(c,l[i])){ return i } // should implement deep equality testing!
						if(c === l[i]){ return i } // use this for now
					}
				}
			}
			return f? rr : Util.list.index? 0 : -1;
		}
		Util.time = {};
		Util.time.is = function(t){ return t? t instanceof Date : (+new Date().getTime()) }
		Util.time.now = function(t){
			return ((t=t||Util.time.is()) > (Util.time.now.last || -Infinity)? (Util.time.now.last = t) : Util.time.now(t + 1)) + (Util.time.now.drift || 0); // TODO: BUG? Should this go on the inside?
		};
	}(Gun));

	;(function(Gun){
		
		Gun._ = { // some reserved key words, these are not the only ones.
			soul: '#' // a soul is a UUID of a node but it always points to the "latest" data known.
			,meta: '_' // all metadata of the node is stored in the meta property on the node.
			,HAM: '>' // other than the soul, we store HAM metadata.
			,key: '~' // indicates whether a soul is human generated or not.
		}

		Gun.version = 0.3;
		
		Gun.is = function(gun){ return (gun instanceof Gun)? true : false } // check to see if it is a GUN instance.
		
		Gun.is.val = function(v){ // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
			if(v === null){ return true } // "deletes", nulling out fields.
			if(v === Infinity){ return false } // we want this to be, but JSON does not support it, sad face.
			if(Gun.bi.is(v) // by "binary" we mean boolean.
			|| Gun.num.is(v)
			|| Gun.text.is(v)){ // by "text" we mean strings.
				return true; // simple values are valid.
			}
			return Gun.is.rel(v) || false; // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
		}
		
		Gun.is.val.as = function(v){ // check if it is a valid value and return the value if so,
			return Gun.is.val(v)? v : null; // else return null.
		}
		
		Gun.is.rel = function(v){ // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
			if(Gun.obj.is(v)){ // must be an object.
				var id;
				Gun.obj.map(v, function(soul, field){ // map over the object...
					if(id){ return id = false } // if ID is already defined AND we're still looping through the object, it is considered invalid.
					if(field == Gun._.soul && Gun.text.is(soul)){ // the field should be '#' and have a text value.
						id = soul; // we found the soul!
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

		Gun.is.rel.ify = function(s, rel){ return Gun.obj.as(rel = {}, Gun._.soul, s), rel } 
		
		Gun.is.node = function(node, cb, t){ // checks to see if an object is a valid node.
			var soul;
			if(!Gun.obj.is(node)){ return false } // must be an object.
			if(soul = Gun.is.node.soul(node)){ // must have a soul on it.
				return !Gun.obj.map(node, function(val, field){ // we invert this because the way we check for this is via a negation.
					if(field == Gun._.meta){ return } // skip over the metadata.
					if(!Gun.is.val(val)){ return true } // it is true that this is an invalid node.
					if(cb){ cb.call(t, val, field, node) } // optionally callback each field/value.
				});
			}
			return false; // nope! This was not a valid node.
		}

		Gun.is.node.ify = function(vertex, soul, state){
			vertex = Gun.is.node.soul.ify(vertex, soul);
			Gun.obj.map(vertex, function(val, field){
				if(Gun._.meta === field){ return }
				Gun.union.HAM.ify([vertex], field, val, state = state || Gun.time.now());
			});
			return vertex;
		}
		
		Gun.is.node.soul = function(n, s){ return (n && n._ && n._[s || Gun._.soul]) || false } // convenience function to check to see if there is a soul on a node and return it.

		Gun.is.node.soul.ify = function(n, s, t){
			n = n || {};
			n._ = n._ || {};
			n._[Gun._.soul] = t? s : n._[Gun._.soul] || s || Gun.text.random();
			return n;
		}
		
		Gun.is.graph = function(graph, cb, fn, t){ // checks to see if an object is a valid graph.
			var exist = false;
			if(!Gun.obj.is(graph)){ return false } // must be an object.
			return !Gun.obj.map(graph, function(node, soul){ // we invert this because the way we check for this is via a negation.
				if(!node || soul !== Gun.is.node.soul(node) || !Gun.is.node(node, fn)){ return true } // it is true that this is an invalid graph.				 
				(cb || function(){}).call(t, node, soul, function(fn){ // optional callback for each node.
					if(fn){ Gun.is.node(node, fn, t) } // where we then have an optional callback for each field/value.
				});
				exist = true;
			}) && exist; // makes sure it wasn't an empty object.
		}
		
		Gun.is.graph.ify = function(node){
			var soul;
			if(soul = Gun.is.node.soul(node)){
				var graph = {}; graph[soul] = node;
				return graph;
			}
		}

		Gun.is.node.HAM = function(n, f){ return (f && n && n._ && n._[Gun._.HAM] && n._[Gun._.HAM][f]) || false }

		Gun.HAM = function(machineState, incomingState, currentState, incomingValue, currentValue){ // TODO: Lester's comments on roll backs could be vulnerable to divergence, investigate!
			if(machineState < incomingState){
				// the incoming value is outside the boundary of the machine's state, it must be reprocessed in another state.
				return {defer: true};
			}
			if(incomingState < currentState){
				// the incoming value is within the boundary of the machine's state, but not within the range.
				return {historical: true};
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
		
		Gun.union = function(gun, prime, cb, opt){ // merge two graphs into the first.
			var opt = opt || Gun.obj.is(cb)? cb : {};
			var ctx = {graph: gun.__.graph, count: 0};
			ctx.cb = function(){
				cb = Gun.fns.is(cb)? cb() && null : null; 
			}
			if(!ctx.graph){ ctx.err = {err: Gun.log("No graph!") } }
			if(!prime){ ctx.err = {err: Gun.log("No data to merge!") } }
			if(ctx.soul = Gun.is.node.soul(prime)){ prime = Gun.is.graph.ify(prime) }
			if(!Gun.is.graph(prime, null, function(val, field, node){ var meta;
				if(!(meta = (node||{})[Gun._.meta]) || !(meta = meta[Gun._.HAM]) || !Gun.num.is(meta[field])){ 
					return ctx.err = {err: Gun.log("No state on '" + field + "'!") } 
				}
			}) || ctx.err){ return ctx.err = ctx.err || {err: Gun.log("Invalid graph!")}, ctx }
			function emit(at){
				if(gun.__.by){ gun.__.by(at.soul).node = ctx.graph[at.soul]  }
				Gun.on('union').emit(gun, at);
				gun.__.on('union').emit(at);
				gun.__.on(at.soul).emit(at);
			}
			(function union(graph, prime){
				ctx.count += 1;
				ctx.err = Gun.obj.map(prime, function(node, soul){
					soul = Gun.is.node.soul(node);
					if(!soul){ return {err: Gun.log("Soul missing or mismatching!")} }
					ctx.count += 1;
					var vertex = graph[soul];
					if(!vertex){ graph[soul] = vertex = Gun.is.node.ify({}, soul) }
					Gun.union.HAM(vertex, node, function(vertex, field, val){
						gun.__.on('historical').emit({soul: soul, field: field, change: node});
					}, function(vertex, field, val){
						if(!vertex){ return }
						var change = Gun.is.node.soul.ify({}, soul);
						if(field){
							Gun.union.HAM.ify([vertex, change, node], field, val);
						}
						emit({soul: soul, field: field, change: change});
					}, function(vertex, field, val){})(function(){
						emit({soul: soul, change: node});
						if(!(ctx.count -= 1)){ ctx.cb() }
					});
				});
				ctx.count -= 1;
			})(ctx.graph, prime);
			if(!ctx.count){ ctx.cb() }
			return ctx;
		}
		
		Gun.union.ify = function(gun, prime, cb, opt){
			if(gun){ gun = (gun.__ && gun.__.graph)? gun.__.graph : gun }
			if(Gun.text.is(prime)){ 
				if(gun && gun[prime]){
					prime = gun[prime];
				} else {
					return Gun.is.node.ify({_: Gun.obj.put({}, Gun._.key, 1) }, prime);
				}
			}
			var vertex = Gun.is.node.soul.ify({_: Gun.obj.put({}, Gun._.key, 1)}, Gun.is.node.soul(prime)), prime = Gun.is.graph.ify(prime) || prime;
			if(Gun.is.graph(prime, null, function(val, field){ var node;
				function merge(a, f, v){ Gun.union.HAM.ify(a, f, v) }
				if(Gun.is.rel(val)){ node = gun? gun[field] || prime[field] : prime[field] }
				Gun.union.HAM(vertex, node, function(){}, function(vert, f, v){
					merge([vertex, node], f, v);
				}, function(){})(function(err){
					if(err){ merge([vertex], field, val) }
				})
			})){ return vertex }
		}
		
		Gun.union.HAM = function(vertex, delta, lower, now, upper){
			upper.max = -Infinity;
			now.end = true;
			delta = delta || {};
			vertex = vertex || {};
			Gun.obj.map(delta._, function(v,f){
				if(Gun._.HAM === f || Gun._.soul === f){ return }
				vertex._[f] = v;
			});
			if(!Gun.is.node(delta, function update(incoming, field){
				now.end = false;
				var ctx = {incoming: {}, current: {}}, state;
				ctx.drift = Gun.time.now(); // DANGEROUS!
				ctx.incoming.value = Gun.is.rel(incoming) || incoming;
				ctx.current.value = Gun.is.rel(vertex[field]) || vertex[field];
				ctx.incoming.state = Gun.num.is(ctx.tmp = ((delta._||{})[Gun._.HAM]||{})[field])? ctx.tmp : -Infinity;
				ctx.current.state = Gun.num.is(ctx.tmp = ((vertex._||{})[Gun._.HAM]||{})[field])? ctx.tmp : -Infinity;
				upper.max = ctx.incoming.state > upper.max? ctx.incoming.state : upper.max;
				state = Gun.HAM(ctx.drift, ctx.incoming.state, ctx.current.state, ctx.incoming.value, ctx.current.value);
				if(state.err){
					root.console.log(".!HYPOTHETICAL AMNESIA MACHINE ERR!.", state.err); // this error should never happen.
					return;
				}
				if(state.state || state.historical || state.current){
					lower.call(state, vertex, field, incoming);
					return;
				}
				if(state.incoming){
					now.call(state, vertex, field, incoming);
					return;
				}
				if(state.defer){
					upper.wait = true;
					upper.call(state, vertex, field, incoming); // signals that there are still future modifications.
					Gun.schedule(ctx.incoming.state, function(){
						update(incoming, field);
						if(ctx.incoming.state === upper.max){ (upper.last || function(){})() }
					});
				}
			})){ return function(fn){ if(fn){ fn({err: 'Not a node!'}) } } }
			if(now.end){ now.call({}, vertex) } // TODO: Should HAM handle empty updates? YES.
			return function(fn){
				upper.last = fn || function(){};
				if(!upper.wait){ upper.last() }
			}
		}
		
		Gun.union.HAM.ify = function(l, f, v, s){
			var u, l = l.reverse(), d = l[0];
			Gun.list.map(l, function(n, i){
				n = n || {};
				if(u !== v && Gun.is.val(v)){ n[f] = v }
				n._ = n._ || {};
				n = n._[Gun._.HAM] = n._[Gun._.HAM] || {};
				if(i = d._[Gun._.HAM][f]){ n[f] = i }
				if(Gun.num.is(s)){ n[f] = s }
			});
		}
		
	}(Gun));

	;(function(exports){
		function On(){};
		On.create = function(){
			var on = function(e){
				on.event.e = e;
				on.event.s[e] = on.event.s[e] || [];
				return on;
			};
			on.emit = function(a){
				var e = on.event.e, s = on.event.s[e], args = arguments, l = args.length;
				exports.list.map(s, function(hear, i){
					if(!hear.fn){ s.splice(i-1, 0); return; }
					if(1 === l){ hear.fn(a); return; }
					hear.fn.apply(hear, args);
				});
				if(!s.length){ delete on.event.s[e] }
			}
			on.event = function(fn, i){
				var s = on.event.s[on.event.e]; if(!s){ return }
				var e = {fn: fn, i: i || 0, off: function(){ return !(e.fn = false) }};
				return s.push(e), i? s.sort(sort) : i, e;
			}
			on.event.s = {};
			return on;
		}
		var sort = exports.list.sort('i');
		exports.on = On.create();
		exports.on.create = On.create;
	}(Gun));
	;(function(Gun){
		Gun.on.at = function(on){
			var proxy = function(e){
				return proxy.e = e, proxy;
			}
			proxy.emit = function(at, mem, tmp){
				if(at.soul){
					at.hash = Gun.on.at.hash(at); // TODO: MEMORY PERFORMANCE REVIEW! THIS USES MORE SPACE THAN SOUL.
					//Gun.obj.as(proxy.mem, proxy.e)[at.soul] = at; 
					Gun.obj.as(proxy.mem, proxy.e)[at.hash] = at; 
				} else
				if(at.not){
					Gun.obj.as(proxy.mem, proxy.e)[at.not] = at;
				} else
				if(at.err){

				} 
				on(proxy.e).emit(mem || at);
			}
			proxy.event = function(cb, i){
				i = on(proxy.e).event(cb, i);
				return Gun.obj.map(proxy.mem[proxy.e], function(at){
					cb.call(i, at);
				}), i;
			}
			proxy.map = function(cb, i){
				return proxy.event(cb, i);
			};
			proxy.mem = {};
			return proxy;
		}
		Gun.on.at.hash = function(at){ return (at.at && at.at.soul)? at.at.soul + (at.at.field || '') : at.soul + (at.field || '') }
	}(Gun));
	
	Gun.chain.val = (function(){
		
		Gun.on('union').event(function(gun, at, end){
			if(!Gun.obj.empty(at.change, Gun._.meta)){ return }
			(end = gun.__.by(at.soul)).end = (end.end || 0) + 1;
			gun.__.on('end:' + at.soul).emit(at);
		});
		
		return function(cb, opt){
			var gun = this, args = Gun.list.slit.call(arguments);
			cb = Gun.fns.is(cb)? cb : function(val, field){ root.console.log.apply(root.console, args.concat([field && (field += ':'), val])) }
			opt = opt || {};
			function val(at){
				var ctx = {by: gun.__.by(at.soul), at: at.at || at}, node = ctx.by.node, field = ctx.at.field, hash = Gun.on.at.hash({soul: ctx.at.key || ctx.at.soul, field: field});
				if(at.key){ node = Gun.union.ify(ctx.by.chain || gun, at.key) }
				if(cb[hash]){ return }
				if(at.field && Gun.obj.has(node, at.field)){
					return cb[hash] = true, cb.call(ctx.by.chain || gun, Gun.obj.copy(node[at.field]), field);
				}
				if(!ctx.by.end){ return }
				return cb[hash] = true, cb.call(ctx.by.chain || gun, Gun.obj.copy(node), field);
			}
			gun.on(val, {raw: true});
			if(gun === gun.back){ Gun.log('You have no context to `.val`!') }
			return gun;
		}
	}());
	
	;(function(exports){ // maybe use lru-cache
		var schedule = function(state, cb){
			schedule.waiting.push({when: state, event: cb || function(){}});
			if(schedule.soonest < state){ return }
			schedule.set(state);
		}
		schedule.waiting = [];
		schedule.soonest = Infinity;
		schedule.sort = exports.list.sort('when');
		schedule.set = function(future){
			if(Infinity <= (schedule.soonest = future)){ return }
			var now = exports.time.now(); // WAS time.is() TODO: Hmmm, this would make it hard for every gun instance to have their own version of time.
			future = (future <= now)? 0 : (future - now);
			clearTimeout(schedule.id);
			schedule.id = setTimeout(schedule.check, future);
		}
		schedule.check = function(){
			var now = exports.time.now(), soonest = Infinity; // WAS time.is() TODO: Same as above about time. Hmmm.
			schedule.waiting.sort(schedule.sort);
			schedule.waiting = exports.list.map(schedule.waiting, function(wait, i, map){
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
			schedule.set(soonest);
		}
		exports.schedule = schedule;
	}(Gun));

	;(function(Gun){ // Serializer
		function ify(data, cb, opt){
			opt = opt || {};
			cb = cb || function(env, cb){ cb(env.at, Gun.is.node.soul(env.at.obj) || Gun.is.node.soul(env.at.node) || Gun.text.random()) };
			var end = function(fn){
				ctx.end = fn || function(){};
				unique(ctx);
			}, ctx = {at: {path: [], obj: data}, root: {}, graph: {}, queue: [], seen: [], opt: opt, loop: true};
			if(!data){ return ctx.err = {err: Gun.log('Serializer does not have correct parameters.')}, end }
			if(ctx.opt.start){ Gun.is.node.soul.ify(ctx.root, ctx.opt.start) }
			ctx.at.node = ctx.root;
			while(ctx.loop && !ctx.err){
				seen(ctx, ctx.at);
				map(ctx, cb);
				if(ctx.queue.length){
					ctx.at = ctx.queue.shift();
				} else {
					ctx.loop = false;
				}
			}
			return end;
		}
		function map(ctx, cb){
			var u, rel = function(at, soul){
				at.soul = at.soul || soul || Gun.is.node.soul(at.obj) || Gun.is.node.soul(at.node);
				if(!ctx.opt.pure){
					ctx.graph[at.soul] = Gun.is.node.soul.ify(at.node, at.soul);
					if(ctx.at.field){
						Gun.union.HAM.ify([at.node], at.field, u, ctx.opt.state);
					}
				}
				Gun.list.map(at.back, function(rel){
					rel[Gun._.soul] = at.soul;
				});
				unique(ctx);
			}, it;
			Gun.obj.map(ctx.at.obj, function(val, field){
				ctx.at.val = val;
				ctx.at.field = field;
				it = cb(ctx, rel, map) || true;
				if(field === Gun._.meta){
					ctx.at.node[field] = Gun.obj.copy(val); // TODO: BUG! Is this correct?
					return;
				}
				if(String(field).indexOf('.') != -1 || (false && notValidField(field))){ // TODO: BUG! Do later for ACID "consistency" guarantee.
					return ctx.err = {err: Gun.log("Invalid field name on '" + ctx.at.path.join('.') + "'!")};
				}
				if(!Gun.is.val(val)){
					var at = {obj: val, node: {}, back: [], path: [field]}, tmp = {}, was;
					at.path = (ctx.at.path||[]).concat(at.path || []);
					if(!Gun.obj.is(val)){
						return ctx.err = {err: Gun.log("Invalid value at '" + at.path.join('.') + "'!" )};
					}
					if(was = seen(ctx, at)){
						tmp[Gun._.soul] = Gun.is.node.soul(was.node) || null;
						(was.back = was.back || []).push(ctx.at.node[field] = tmp);
					} else {
						ctx.queue.push(at);
						tmp[Gun._.soul] = null;
						at.back.push(ctx.at.node[field] = tmp);
					}
				} else {
					ctx.at.node[field] = Gun.obj.copy(val);
				}
			});
			if(!it){ cb(ctx, rel) }
		}
		function unique(ctx){
			if(ctx.err || (!Gun.list.map(ctx.seen, function(at){
				if(!at.soul){ return true }
			}) && !ctx.loop)){ return ctx.end(ctx.err, ctx), ctx.end = function(){}; }
		}
		function seen(ctx, at){
			return Gun.list.map(ctx.seen, function(has){
				if(at.obj === has.obj){ return has }
			}) || (ctx.seen.push(at) && false);
		}
		ify.wire = function(n, cb, opt){ return Gun.text.is(n)? ify.wire.from(n, cb, opt) : ify.wire.to(n, cb, opt) }
		ify.wire.to = function(n, cb, opt){ var t, b;
			if(!n || !(t = Gun.is.node.soul(n))){ return null }
			cb = cb || function(){};
			t = (b = "#'" + JSON.stringify(t) + "'");
			Gun.obj.map(n, function(v,f){
				if(Gun._.meta === f){ return }
				var w = '', s = Gun.is.node.HAM(n,f);
				if(!s){ return }
				w += ".'" + JSON.stringify(f) + "'";
				w += "='" + JSON.stringify(v) + "'";
				w += ">'" + JSON.stringify(s) + "'";
				t += w;
				w = b + w;
				cb(null, w);
			});
			return t;
		}
		ify.wire.from = function(n, cb, opt){
			if(!n){ return null }
			var a = [], s = -1, e = 0, end = 1;
			while((e = n.indexOf("'", s + 1)) >= 0){
				if(s === e || '\\' === n.charAt(e-1)){}else{
					a.push(n.slice(s + 1,e));
					s = e;
				}
			}
			return a;
		}
		Gun.ify = ify;
	}(Gun));

	var root = this || {}; // safe for window, global, root, and 'use strict'.
	if(root.window){
		window.Gun = Gun;
	}
	if(typeof module !== "undefined" && module.exports){
		module.exports = Gun;
	}
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

	;(function(exports){
		function s(){}
		s.put = function(key, val){ return store.setItem(key, Gun.text.ify(val)) }
		s.get = function(key, cb){ return cb(null, Gun.obj.ify(store.getItem(key) || null)) }
		s.del = function(key){ return store.removeItem(key) }
		var store = this.localStorage || {setItem: function(){}, removeItem: function(){}, getItem: function(){}};
		exports.store = s;
	}(Tab));

	Gun.on('opt').event(function(gun, opt){
		opt = opt || {};
		var tab = gun.tab = gun.tab || {};
		tab.store = tab.store || Tab.store;
		tab.request = tab.request || request;
		tab.headers = opt.headers || {};
		tab.headers['gun-sid'] = tab.headers['gun-sid'] || Gun.text.random(); // stream id
		tab.prefix = tab.prefix || opt.prefix || 'gun/';
		tab.get = tab.get || function(key, cb, opt){
			if(!key){ return }
			cb = cb || function(){};
			cb.GET = true;
			(opt = opt || {}).url = opt.url || {};
			opt.headers = Gun.obj.copy(tab.headers);
			opt.url.pathname = '/' + key;
			//Gun.log("tab get --->", key);
			(function local(key, cb){
				tab.store.get(tab.prefix + key, function(err, data){
					if(!data){ return } // let the peers handle no data.
					if(err){ return cb(err) }
					cb(err, data); // node
					cb(err, Gun.is.node.soul.ify({}, Gun.is.node.soul(data))); // end
					cb(err, {}); // terminate
				});
			}(key, cb));
			if(!(cb.local = opt.local)){
				Gun.obj.map(opt.peers || gun.__.opt.peers, function(peer, url){ var p = {};
					tab.request(url, null, tab.error(cb, "Error: Get failed through " + url, function(reply){
						if(!p.graph && !Gun.obj.empty(cb.graph)){ // if we have local data
							tab.put(p.graph = cb.graph, function(e,r){ // then sync it if we haven't already
								Gun.log("Stateless handshake sync:", e, r);
							}, {peers: tab.peers(url)}); // to the peer. // TODO: This forces local to flush again, not necessary.
						}
						setTimeout(function(){ tab.put(reply.body, function(){}, {local: true}) },1); // and flush the in memory nodes of this graph to localStorage after we've had a chance to union on it.
					}), opt);
					cb.peers = true;
				});
			} tab.peers(cb);
		}
		tab.put = tab.put || function(graph, cb, opt){
			cb = cb || function(){};
			opt = opt || {};
			Gun.is.graph(graph, function(node, soul){
				if(!gun.__.graph[soul]){ return }
				tab.store.put(tab.prefix + soul, gun.__.graph[soul]);
			});
			if(!(cb.local = opt.local)){
				Gun.obj.map(opt.peers || gun.__.opt.peers, function(peer, url){
					tab.request(url, graph, tab.error(cb, "Error: Put failed on " + url), {headers: tab.headers});
					cb.peers = true;
				});
			} tab.peers(cb);
		}
		tab.error = function(cb, error, fn){
			return function(err, reply){
				reply.body = reply.body || reply.chunk || reply.end || reply.write;
				if(err || !reply || (err = reply.body && reply.body.err)){
					return cb({err: Gun.log(err || error) });
				}
				if(fn){ fn(reply) }
				cb(null, reply.body);
			}
		}
		tab.peers = function(cb, o){
			if(Gun.text.is(cb)){ return (o = {})[cb] = {}, o }
			if(cb && !cb.peers){ setTimeout(function(){
				if(!cb.local){ console.log("Warning! You have no peers to connect to!") }
				if(!(cb.graph || cb.node)){ cb() }
			},1)}
		}
		tab.server = tab.server || function(req, res){
			if(!req || !res || !req.url || !req.method){ return }
			req.url = req.url.href? req.url : document.createElement('a');
			req.url.href = req.url.href || req.url;
			req.url.key = (req.url.pathname||'').replace(tab.server.regex,'').replace(/^\//i,'') || '';
			req.method = req.body? 'put' : 'get';
			if('get' == req.method){ return tab.server.get(req, res) }
			if('put' == req.method || 'post' == req.method){ return tab.server.put(req, res) }
		}
		tab.server.json = 'application/json';
		tab.server.regex = gun.__.opt.route = gun.__.opt.route || opt.route || /^\/gun/i;
		tab.server.get = function(){}
		tab.server.put = function(req, cb){
			var reply = {headers: {'Content-Type': tab.server.json}};
			if(!req.body){ return cb({headers: reply.headers, body: {err: "No body"}}) }
			// TODO: Re-emit message to other peers if we have any non-overlaping ones.
			if(req.err = Gun.union(gun, req.body, function(err, ctx){
				if(err){ return cb({headers: reply.headers, body: {err: err || "Union failed."}}) }
				var ctx = ctx || {}; ctx.graph = {};
				Gun.is.graph(req.body, function(node, soul){ ctx.graph[soul] = gun.__.graph[soul] });
				gun.__.opt.wire.put(ctx.graph, function(err, ok){
					if(err){ return cb({headers: reply.headers, body: {err: err || "Failed."}}) }
					cb({headers: reply.headers, body: {ok: ok || "Persisted."}});
				}, {local: true});
			}).err){ cb({headers: reply.headers, body: {err: req.err || "Union failed."}}) }
		}
		Gun.obj.map(gun.__.opt.peers, function(){ // only create server if peers and do it once by returning immediately.
			return (tab.server.able = tab.server.able || tab.request.createServer(tab.server) || true);
		});
		gun.__.opt.wire.get = gun.__.opt.wire.get || tab.get;
		gun.__.opt.wire.put = gun.__.opt.wire.put || tab.put;
		gun.__.opt.wire.key = gun.__.opt.wire.key || tab.key;
	});

	var request = (function(){
		function r(base, body, cb, opt){
			opt = opt || (base.length? {base: base} : base);
			opt.base = opt.base || base;
			opt.body = opt.body || body;
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
		r.ws = function(opt, cb){
			var ws, WS = window.WebSocket || window.mozWebSocket || window.webkitWebSocket;
			if(!WS){ return }
			if(ws = r.ws.peers[opt.base]){
				if(!ws.readyState){ return setTimeout(function(){ r.ws(opt, cb) },10), true }
				var req = {};
				if(opt.headers){ req.headers = opt.headers }
				if(opt.body){ req.body = opt.body }
				if(opt.url){ req.url = opt.url }
				req.headers = req.headers || {};
				r.ws.cbs[req.headers['ws-rid'] = 'WS' + (+ new Date()) + '.' + Math.floor((Math.random()*65535)+1)] = function(err,res){
					if(res.body || res.end){ delete r.ws.cbs[req.headers['ws-rid']] }
					cb(err,res);
				}
				ws.send(JSON.stringify(req));
				return true;
			}
			if(ws === false){ return }
			ws = r.ws.peers[opt.base] = new WS(opt.base.replace('http','ws'));
			ws.onopen = function(o){ r.back = 2; r.ws(opt, cb) };
			ws.onclose = window.onbeforeunload = function(c){
				if(!c){ return }
				if(ws && ws.close instanceof Function){ ws.close() }
				if(1006 === c.code){ // websockets cannot be used
					ws = r.ws.peers[opt.base] = false;
					r.transport(opt, cb);
					return;
				}
				ws = r.ws.peers[opt.base] = null; // this will make the next request try to reconnect
				setTimeout(function(){
					r.ws(opt, function(){}); // opt here is a race condition, is it not? Does this matter?
				}, r.back *= r.backoff);
			};
			ws.onmessage = function(m){
				if(!m || !m.data){ return }
				var res;
				try{res = JSON.parse(m.data);
				}catch(e){ return }
				if(!res){ return }
				res.headers = res.headers || {};
				if(res.headers['ws-rid']){ return (r.ws.cbs[res.headers['ws-rid']]||function(){})(null, res) }
				//Gun.log("We have a pushed message!", res);
				if(res.body){ r.createServer.ing(res, function(){}) } // emit extra events.
			};
			ws.onerror = function(e){ Gun.log(e); };
			return true;
		}
		r.ws.peers = {};
		r.ws.cbs = {};
		r.jsonp = function(opt, cb){
			//Gun.log("jsonp send", opt);
			r.jsonp.ify(opt, function(url){
				//Gun.log(url);
				if(!url){ return }
				r.jsonp.send(url, function(reply){
					//Gun.log("jsonp reply", reply);
					cb(null, reply);
					r.jsonp.poll(opt, reply);
				}, opt.jsonp);
			});
		}
		r.jsonp.send = function(url, cb, id){
			var js = document.createElement('script');
			js.src = url;
			window[js.id = id] = function(res){
				cb(res);
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
						if(res && res.body){ r.createServer.ing(res, function(){}) } // emit extra events.
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
		return r;
	}());
}({}));
