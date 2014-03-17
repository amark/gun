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
	function gun(url){
		var u
		, db = {_id: url || gun.id() }
		, g = function(n,p,v,w){
			var args = arguments.length
			, bd = this._db || db, t;
			w = w || a.time.now();
			if(this._id){
				v = p;
				p = n;
				n = this;
				args += 1;
			}
			if(n){
				if(n._id && a.obj(bd).has(n._id)){
					if(p === u){
						console.log('gun delete', n._id);
						delete bd[n._id];
						theory.on(gun.event).emit({n:n._id,d:1,w:w}, bd._id);
						return;
					}
					if(args >= 3){
						var o = {ref:n};
						o.p = a.text(p).clip('.',0,-1);
						t = o.p? g.at.call(o,n,o.p) : n;
						o.p = a.text(p).clip('.',-1);
						p = o.path? o.path+'.'+o.p : o.p;
						n = o.ref;
						o.q = n._id+'.'+p;
						if(gun.ham && gun.ham.call(g,n,p,v,w,g.at(n,p))){
							return;
						}
						if(t){
							if(v === u){
								if(a.list.is(t)){
									t = o.val || t;
									var j = t.indexOf(o.p);
									if(0 <= j){
										t.splice(j,1);
									} else {
										j = a.list(t).find({_ref: o.p});
										if(j){
											t.splice(--j,1);
										}
									}
								} else {
									delete t[o.p];
								}
								theory.on(gun.event).emit({d:o.q,w:w});
							} else {
								v = g.at(v);
								if(v._id){
									v = {_ref: v._id};
								} else {
									v = g.ify.be(v);
								}
								var j;
								if(a.list.is(v)){
									t = o.val || t;
									j = a.list.is(t[o.p])? t[o.p].concat(v) : v;
									j = a.list(j).each(function(r,i,t){t(r,1)})||{};
									t[o.p] = j = a.obj(j).each(function(w,r,t){t(r)})||[];
								} else {
									t[o.p] = v;
								}
								theory.on(gun.event).emit({p:o.q,v:v,w:w}, bd._id);
								v = j || v;
							}
						}
						return v;
					} else 
					if(args >= 2){
						v = g.at(n,p);
						return v;
					}
					return;
				}
				if(a.obj.is(n)){
					n._id = n._id || gun.id();
				} else
				if(a.text.is(n)){
					n = {_id: n};
				}
				if(n._id){
					if(a.obj(bd).has(n._id)){
						n = bd[n._id];
					} else {
						bd[n._id] = n;
						theory.on(gun.event).emit({n:n,w:w}, bd._id);
					}
					return function(p,v,w){
						var args = a.list.slit.call(arguments);
						return !args.length? n : g.apply(n,args);
					}
				}
			} else {
				return bd;
			}
		}
		g.at = function(n,p,o){
			if(n === u) return db;
			if(p === u) return a.fns.is(n)? n() : n;
			var c = this.ref || this.db? this : {}
			, pp = a.list.is(p)? p : p.split('.')
			, i = 0, l = pp.length, t
			, v = a.fns.is(n)? n() : n;
			c.db = c.db||db; c.ref = n; c.path = p;
			while(i < l && v !== u){
				t = pp[i++];
				if(a.obj.is(v) && a.obj(v).has(t)){
					v = v[t];
					if(v && v._ref){
						v = a.obj(c.db).has(v._ref)? c.db[v._ref] : u;
						c.ref = n; c.path = pp.slice(i).join('.');
					}
				} else
				if(a.list.is(v)){
					return a.list(v).each(function(w,j){
						if(!w) return;
						if(!p) return;
						w = a.obj(c.db).has(w._ref||w)? c.db[w._ref||w] : u;
						if(!w) return;
						if(t === w._id){
							i += 1;
							p = false;
						}
						return g.at.call(c,g.at(w),pp.slice(i-1));
					});
				} else {
					v = u;
				}
			}
			if(a.list.is(v)){
				c.val = v;
				v = a.list(v).each(function(w,j,t){
					if(w){
						if(a.obj(c.db).has(w._ref||w)) t(c.db[w._ref||w]);
					}
				}) || [];
			}
			return i < l? u : v;
		}
		g.ify = function(o, h, k){
			if(!a.obj.is(o)) return;
			var hold = h || {}, know = k || [], t;
			var n = {_id: o._id || gun.id()};
			function assign(o,i,f){
				if(a.list.is(f)){
					f.push(o);
				} else {
					f[i] = o;
				}
			}
			function absorb(o,i,f,p,hold,know){
				var n = g.ify(o, hold, know);
				if(!n._id){
					n = n.n;
					if(n === p){
						hold[f._id = f._id || gun.id()] = f;
					}
				}
				return {_ref: n._id};
			}
			function be(o,i,f,p){
				if(a.obj.is(o)){
					if(o._id) return;
					if(t=a.list(know).each(function(v,j){
						if(v.o===o){
							v.at = j;
							return v;
						}
					})){
						var r = absorb(o,i,f,p,hold,know);
						assign(r,i,f);
						assign(r,t.i,t.f); 
						return;
					}
					f[i] = {};
					know.push({f:f,i:i,o:o,n:f[i]});
					a.obj(o).each(function(v,j){
						be(v,j,f[i],f);
					});
					if(f[i]._id){
						f[i] = {_ref: f[i]._id};
					}
					return;
				}
				if(a.list.is(o)){
					f[i] = [];
					a.list(o).each(function(v,j){
						if(a.obj.is(v)){
							t = absorb(v,--j,f[i],p,hold,know);
							assign(t, --j, f[i]);
						} else {
							be(v,--j,f[i]);
						}
					});
					return;
				}
				if(g.ify.is(o)){
					assign(o,i,f);
				}
			};
			if(t=a.list(know).each(function(v,j){
				if(v.o===o){
					return v;
				}
			})){
				return t;
			};
			know.push({f:know,i:n._id,o:o,n:n});
			hold[n._id] = n;
			a.obj(o).each(function(v,i){
				be(v,i,n);
			});
			return h && k? n : hold;
		}
		g.ify.be = function(v,bd){
			var r;
			bd = bd || db;
			if(a.obj.is(v)){
				r = {};
				a.obj(v).each(function(w,i){
					w = g.ify.be(w);
					if(w === u){ return }
					r[i] = w;
				});
			} else
			if(a.list.is(v)){ // references only
				r = a.list(v).each(function(w,i,t){
					w = g.at(w);
					if(w._id){
						t(w._id);
					} else
					if(w._ref){
						t(w._ref);
					} else 
					if(a.obj(bd).has(w)){
						t(w);
					}
				}) || [];
			} else
			if(g.ify.is(v)){
				r = v;
			}
			return r;
		}
		g.ify.is = function(v){ // inull, binary, number (!Infinity), or text.
			if(v === Infinity) return false;
			if(v === null 
			|| a.bi.is(v) 
			|| a.num.is(v) 
			|| a.text.is(v)){
				return true;
			}
			return false;
		}
		g.ify.path = function(p){
			return !(/[\.\_\$]/ig).test(p);
		}
		g.on = function(p){
		
		}
		return g;
	}; gun.event = 'gun';
	gun.id = function(){
		return a.text.r(9);
	}
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
	gun.ham = function(n,p,v,w,cv){
		// console.log('ham',cv,v);
		var g = a.fns.is(this)? this : {}, now, u;
		p = p.replace('.',':');
		n._age = n._age || {};
		if(w < (n._age[p]||0)){
			return true;
		} else
		if(w === (n._age[p]||0)){
			if(cv === v || a.test.is(cv,v) || a.text.ify(cv) < a.text.ify(v)){
				return true;
			}
		} else
		if((now = a.time.now() + 1) < w){ // tolerate a threshold of 1ms.
			/* Amnesia Quarantine */
			a.time.wait(function(){
				g(n,p,v,w);
			}, Math.ceil(w - now)); // crude implementation for now.
			return true;
		}
		if(v === u){
			delete n._age[p];
		} else {
			n._age[p] = w;
		}
	}
	return gun;
});