/**** The Abstact Structure

A JSON graph structure that is lightweight and flexible to describe anything.
The current goal, however, is limited to encompassing HTML and CSS for starters.
Immediately after that is describing code as a state.

A node is something which has relationships and or value.
Relationships and values aren't any different, other than that
a relationship is a reference and a value is embedded.

*****/
module.exports = require('theory')
('gun',function(a){
	a.gun = (function(){
		function gun(p,v,w){
			var args = arguments.length
			, cb = a.fns.is(v)? v : null
			, g, n, w = w || a.time.now();
			if(gun.is(this)){
				n = this;
				g = n._.graph || function(){ return {} };
				if(a.text.is(p)){					
					if(p === '' && (v === u || v === null)){
						var del = {_:{'#':a.time.now()}};
						delete g[n._.$];
						del[n._.$] = n = null;
						theory.on(gun.event).emit(del, g.$);
						return null;
					}
					if(args >= 2){ // set
						var ref = {}
						, val = gun.at(n,p,ref);
						if(!ref.node || !ref.node._ || !ref.node._.$){
							return;
						} ref.id = ref.node._.$ +'.'+ ref.path;
						if(a.gun.ham && a.gun.ham.call(g,n,p,v,w,val)){
							console.log("HAM REJECTION", p, v, val);
							return;
						}
						if(ref.at){
							if(v === u || v === null){				
								if(a.list.is(ref.at)){
									t = o.val || t;
									var j = ref.at.indexOf(ref.prop);
									if(0 <= j){
										ref.at.splice(j,1);
									} else {
										j = a.list(ref.at).find({$:ref.prop});
										if(j){
											ref.at.splice(--j,1);
										}
									}
								} else {
									delete ref.at[ref.prop];
								}
								var del = {_:{'#':w}}; del[ref.id] = null;
								theory.on(gun.event).emit(del, g.$);
								v = ref.at;
							} else {
								v = gun.at(v);
								if(gun.is(v)){
									v = {$:v._.$};
								} else {
									v = gun.ify.be(v);
								} var j;
								if(a.list.is(v)){
									j = a.list.is(ref.at[ref.prop])? ref.at[ref.prop].concat(v) : v;
									j = a.list(j).each(function(r,i,t){t(r,1)})||{};
									ref.at[ref.prop] = j = a.obj(j).each(function(w,r,t){t(r)})||[];
								} else {
									ref.at[ref.prop] = v;
								}
								var diff = {_:{'#':w}}; diff[ref.id] = v;
								theory.on(gun.event).emit(diff, g.$);
								v = j || v;
							}
						}
						return v;
					}
					if(args >= 1){ // get		
						v = gun.at(n,p);
						return v;
					}
				}
				return;
			}
			n = a.obj.is(v)? v : a.obj.is(p)? p : null;
			p = a.text.is(p)? p : gun.id();
			if(a.obj.is(n)){ // create a new graph from this object
				g = gun.ify(n);
				var graph = gun.clip[p] = function(n){
					if(gun.is(this)){
						var args = a.list.slit.call(arguments);
						n = this;
						n._.graph = n._.graph || graph;
						return gun.apply(n, args);
					}
					var fn = function(p,v,w){
						if(!n){ return }
						var args = a.list.slit.call(arguments);
						return !args.length? n : gun.apply(n,args);
					}
					if(a.text.is(n)){
						if(a.obj(g).has(n) && (n = g[n]) && gun.is(n)){
							n._.graph = graph;
							return fn;
						}
						n = {_:{$:n}};
					}
					if(a.obj.is(n)){
						n = gun.ify(n,u,{}); // can only add one node with this method!
						n._ = n._ || {$: gun.id()};
						n._.graph = graph // JSONifying excludes functions.
						var add = {_:{'#':a.time.now()}}; 
						add[n._.$] = g[n._.$] = n;
						theory.on(gun.event).emit(add, graph.$);
						return fn;
					}
					return g;
				}
				graph.$ = p;
				return graph;
			}
		} var u;
		gun.is = function(o){
			return (o && o._ && o._.$)? true : false;
		}
		gun.id = function(){
			return a.text.r(9);
		}
		gun.at = function(n,p,ref){
			if(a.fns.is(n)){
				n = n();
			}
			if(!p){
				return n;
			}
			ref = ref || {};
			var pp = a.list.is(p)? p : (p||'').split('.')
			, g = a.fns.is(n._.graph)? n._.graph() : this
			, i = 0, l = pp.length, v = n
			, x, y, z;
			ref.node = n;
			ref.prop = pp[l-1];
			ref.path = pp.slice(i).join('.');
			while(i < l && v !== u){
				x = pp[i++];
				if(a.obj.is(v) && a.obj(v).has(x)){
					ref.at = v;
					v = v[x];
					if(v && v.$){
						v = a.obj(g).has(v.$)? g[v.$] : u;
						if(v){
							return gun.at.call(g,v,pp.slice(i),ref);
						}
					}
				} else
				if(a.list.is(v)){
					ref.at = v;
					return a.list(v).each(function(w,j){
						if(!w) return;
						if(!p) return;
						w = a.obj(g).has(w.$||w)? g[w.$||w] : u;
						if(!w) return;
						if(w._ && x === w._.$){
							i += 1;
							p = false;
						}
						return gun.at.call(g,w,pp.slice(i-1),ref);
					});
				} else {
					ref.at = v;
					v = u;
				}
			}
			if(a.list.is(v)){
				ref.at = v;
				v = a.list(v).each(function(w,j,t){
					if(w){
						if(a.obj(g).has(w.$||w)) t(g[w.$||w]);
					}
				}) || [];
			}
			return i < l? u : v;
		}
		gun.ify = function(o, opt, n){
			var g = {};
			opt = opt || {};
			opt.seen = opt.seen || [];
			if(!a.obj.is(o)){ return g }
			function ify(o,i,f,n,p){
				if(a.obj.is(o)){
					var seen;
					if(seen = ify.seen(o)){
						ify.be(seen);
						return;
					}
					if(gun.is(o)){
						f[i] = {$: o._.$};
						g[o._.$] = n;
					} else {
						f[i] = n;
					}
					opt.seen.push({node: n, prop: i, from: f, src: o});
					a.obj(o).each(function(v,j){
						ify(v,j,n,{},f);
					});
					if(gun.is(n)){
						g[n._.$] = n;
						f[i] = {$: n._.$};
					}
					return;
				}
				if(a.list.is(o)){
					f[i] = a.list(o).each(function(v,j,t){
						var seen;
						if(a.fns.is(v)){
							v = gun.at(v);
						}
						if(a.obj.is(v)){
							if(seen = ify.seen(v)){
								ify.be(seen);
								if(gun.is(seen.node)){ t(seen.node._.$) }
							} else {
								gun.ify(v, opt, n);
								if(gun.is(n)){
									t(n._.$);
								}
							}
						} else
						if(a.text.is(v)){
							if(a.obj(g).has(v)){
								t(v);
							} else {
								t(v); // same as above :/ because it could be that this ID just hasn't been indexed yet.
							}
						}
					}) || [];
					return;
				}
				if(gun.ify.is(o)){
					f[i] = o;
				}
			}
			ify.be = function(seen){
				var n = seen.node;
				n._ = n._||{};
				n._.$ = n._.$||gun.id();
				g[n._.$] = n;
				if(seen.from){
					seen.from[seen.prop] = {$: n._.$};
				}
			}
			ify.seen = function(o){
				return a.list(opt.seen).each(function(v){
					if(v && v.src === o){ return v }
				}) || false;
			}
			var is = true, node = n || {};
			a.obj(o).each(function(v,i){
				if(!gun.is(v)){ is = false }
				ify(v, i, node, {});
			});
			if(!is){
				ify.be({node: node});
				g[node._.$] = node;
			}
			if(n){
				return n;
			}
			return g;
		}
		gun.ify.be = function(v,g){
			var r;
			if(a.obj.is(v)){
				r = {};
				a.obj(v).each(function(w,i){
					w = gun.ify.be(w);
					if(w === u || w === null){ return }
					r[i] = w;
				});
			} else
			if(a.list.is(v)){ // references only
				r = a.list(v).each(function(w,i,t){
					if(!w){ return }
					w = gun.at(w);
					if(gun.is(w)){
						t(w._.$);
					} else
					if(w.$){
						t(w.$);
					} else 
					if(a.obj(g).has(w)){
						t(w);
					}
				}) || [];
			} else
			if(gun.ify.is(v)){
				r = v;
			}
			return r;
		}
		gun.ify.is = function(v){ // binary, number (!Infinity), or text.
			if(v === Infinity) return false;
			if(a.bi.is(v) 
			|| a.num.is(v) 
			|| a.text.is(v)){
				return true;
			}
			return false;
		}
		gun.event = 'gun';
		gun.clip = {};
		theory.on(gun.event+'.shot').event(function(m,g){
			if(!m || !m._ || !g || !a.fns.is(g)){ return }
			var graph = g()
			, when = m._['#'];
			if(!when){ return }
			a.obj(m).each(function(v,i){
				if(i==='_'){ return }
				var op = {};
				op.w = when[i] || when;
				op.id = a.text(i).clip('.',0,1);
				op.p = a.text(i).clip('.',1);
				op.n = graph[op.id];
				if(!gun.is(op.n)){
					if(op.p || !a.obj.is(v)){ return }
					g(op.id, v);
					return;
				}
				g.call(op.n, op.p, v, op.w);
			});
		});
		return gun;
	})();
	/* 	Hypothetical Amnesia Machine 
	
		A thought experiment in efficient cause, linear time, and knowledge.
		Suppose everything you will ever know in your life was already be stored
		in your brain. Now suppose we have some machine, which delicately traverses
		your mind and gives you amnesia about all these facts. You now no longer can
		recall any of this knowledge because that information is disconnected from
		all other pieces of knowledge - making it impossible for your mind to then
		associate and thus remember things. But the curious fact is that all this
		knowledge is still stored within your mind, it is just inaccessible.
		
		Now suppose, this amnesia machine is designed to unlock various bits of
		that knowledge, making it connected again to other related tidbits and thus
		making it accessible to you. This unlocking process is activated at some pre-
		determined value, such as a timestamp. Can it really be said that this is
		indistinguishable from the supposed flow of past, present, and future?
		
		Such that future information is not just unknown, but fundamentally does
		not exist, and then by actions taken in the present is caused to be. As a
		result of your senses, you then experience this effect, and thus 'learning'
		that knowledge. Could we truly build a proof that reality is one way or the
		other? But if we did, wouldn't that scurrying little machine just race across
		our minds and assure it induces amnesia into our remembrance of its existence?
		Nay, we cannot. We can only hypothesize about the existence of this crafty
		device. For the blindness that it does shed upon us captivates our perception
		of how the world really is, us forever duped into thinking time is linear.
		
		And here, in write and code, is this machine used and exploited. Holding
		in its power the ability to quarantine and keep secret, until upon some
		value, some condition, some scheme or rendition, does it raise its mighty
		clutch of deception and expose the truth, shining in its radiance and glory,
		all at the ease of making a single connection. Whereupon we do assure that
		all conscious actors are agreed upon in a unified spot, synchronized in the
		capacity to realize such beautiful information.
	*/
	a.gun.ham = function(n,p,v,w,val){
		if(!n){ return true }
		var now, u;
		p = p.replace('.',':');
		n._ = n._ || {};
		n._['#'] = n._['#'] || {};
		if(w < (n._['#'][p]||0)){
			return true;
		} else
		if(w === (n._['#'][p]||0)){
			if(val === v || a.test.is(val,v) || a.text.ify(val) < a.text.ify(v)){
				return true;
			}
		} else
		if((now = a.time.now() + 1) < w){ // tolerate a threshold of 1ms.
			/* Amnesia Quarantine */
			a.time.wait(function(){
				a.gun.call(n,p,v,w);
			}, Math.ceil(w - now)); // crude implementation for now.
			return true;
		}
		if(v === u || v === null){
			delete n._['#'][p];
		} else {
			n._['#'][p] = w;
		}
	}
	return a.gun;
});