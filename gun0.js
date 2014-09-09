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
			, g, n, b, w = w || a.time.now();
			if(gun.is(this)){
				n = this;
				g = n._.clip || function(){ return {} };
				if(a.text.is(p)){
					if(args >= 2){ // set
						var u, ref = {}
						, val = gun.at(n,p,ref);
						if(!ref.cartridge || !ref.cartridge._ || !ref.cartridge._[gun._.id]){
							return;
						} ref.id = ref.cartridge._[gun._.id] +'.'+ ref.path;
						v = gun.ify.be(v);
						b = gun.bullet(ref.path,v,w);
						console.log("after:", v, b);
						if(a.gun.ham){ 
							v = a.gun.ham(ref.cartridge,b,v,w); // TODO: BUG! Need to update when also!
							if(v === u){
								console.log("HAM REJECTION", p, v, val);
								return;
							}
						}
						console.log("HAM set", p, v);
						if(ref.at){
							if(v === null){
								if(a.list.is(ref.at)){
									t = o.val || t;
									var j = ref.at.indexOf(ref.prop);
									if(0 <= j){
										ref.at.splice(j,1);
									} else {
										j = a.list(ref.at).find(gun.id(ref.prop));
										if(j){
											ref.at.splice(--j,1);
										}
									}
								} else {
									delete ref.at[ref.prop];
								}
								var del = {}; del[ref.id] = null;
								gun.fire(del, g[gun._.id], w);
								v = ref.at;
							} else {
								if(a.fns.is(v) && v[gun._.id]){ // then it is a clip!
									v = {};
								}
								v = gun.at(v);
								if(gun.is(v)){
									v = gun.id(v._[gun._.id]); // update this to handle clip#cart
								} else {
									v = gun.ify.be(v);
								}
								if(a.obj.is(v)){
									ref.at[ref.prop] = v;
									//ref.tmp = ref.at[ref.prop] = gun.ify.obj(v, val);
								} else
								if(a.list.is(v)){
									ref.tmp = ref.at[ref.prop] = gun.ify.list(v, val);
								} else {
									ref.at[ref.prop] = v;
								}
								var diff = {}; diff[ref.id] = v;
								gun.fire(diff, g[gun._.id], w);
								v = ref.tmp || v;
							}
							return v;
						}
						return;
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
			if(a.obj.is(n)){ // create a clip from this object
				var c;
				g = gun.ify(n);
				if((c = gun.magazine[p]) && a.fns.is(c)){
					console.log("clip already exists in magazine,", p);
					a.obj(g).each(function(n,id){
						if(!gun.is(n)){ return }
						c(id,n);
					});
					return gun.magazine[p];
				}
				var clip = gun.magazine[p] = function(p,v,w){
					var args, id, path, n, w = w || a.time.now();
					if(a.text.is(p)){
						id = a.text(p).clip('.',0,1);
						path = a.text(p).clip('.',1);
						if(a.obj(g).has(id) && gun.is(g[id])){
							n = g[id];
							p = path;
						}
					}
					args = a.list.slit.call(arguments);
					if(!args.length){
						return g;
					}
					if(path){
						if(n){
							n._.clip = n._.clip || clip;
							return gun.apply(n, args);
						}
						return;
					}
					var fn = function(p,v,w){
						if(!n){ return }
						var args = a.list.slit.call(arguments);
						return !args.length? n : gun.apply(n,args);
					}
					if(n){
						if(args.length === 1){
							n._.clip = n._.clip || clip;
							return fn;
						}
						if(gun.is(v) && gun.ham){
							var h = v._[gun._.ham] || {};
							a.obj(v).each(function(v,p){
								if(p === '_'){ return }
								console.log('-------------->', p, h[p], h, 1); // Wait! This isn't correct because it should be '>' not '.'!
								fn(p, v, h[p] || (a.num.is(h)? h : 1)); // Wait! This isn't correct because it should be '>' not '.'!
							});
							return fn;
						}
						if(v === null){
							delete g[n._[gun._.id]];
							var del = {}; del[n._[gun._.id]] = n = null;
							gun.fire(del, g[gun._.id], w); // TODO: BUG! HAM UPDATES!
							return null;
						}
						return;
					}
					if(a.text.is(p) && a.obj.is(v)){
						v = v;
						v._ = gun.id(p);
					} else
					if(a.obj.is(p)){
						v = p;
					}
					if(a.obj.is(v)){
						n = gun.ify(v,u,{}); // a clip cannot be created from this, only a single cartridge
						n._ = n._ || gun.id({});
						n._.clip = clip; // JSONifying excludes functions.
						var add = {}; add[n._[gun._.id]] = g[n._[gun._.id]] = n;
						gun.fire(add, clip[gun._.id], w); // TODO: BUG! HAM UPDATES!
						return fn;
					}
				}
				clip[gun._.id] = p;
				return clip;
			}
		} var u;
		gun._ = {
			id: '#' // do not change this!
		}
		gun.is = function(o){
			return (o && o._ && o._[gun._.id])? true : false;
		}
		gun.id = function(t){
			if(t){
				var _ = {};_[gun._.id] = a.text.is(t)? t : gun.id();
				return _;
			}
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
			, g = a.fns.is(n._.clip)? n._.clip() : this
			, i = 0, l = pp.length, v = n
			, x, y, z;
			ref.cartridge = n;
			ref.prop = pp[l-1];
			ref.path = pp.slice(i).join('.');
			while(i < l && v !== u){
				x = pp[i++];
				if(a.obj.is(v) && a.obj(v).has(x)){
					ref.at = v;
					v = v[x];
					if(v && v[gun._.id]){
						v = a.obj(g).has(v[gun._.id])? g[v[gun._.id]] : u;
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
						w = a.obj(g).has(w[gun._.id]||w)? g[w[gun._.id]||w] : u;
						if(!w) return;
						if(w._ && x === w._[gun._.id]){
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
						if(a.obj(g).has(w[gun._.id]||w)) t(g[w[gun._.id]||w]);
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
				if(gun.ify.is(o)){
					f[i] = o;
					return
				}
				if(a.obj.is(o)){
					var seen;
					if(seen = ify.seen(o)){
						ify.be(seen);
						return;
					}
					if(gun.is(o)){
						f[i] = gun.id(o._[gun._.id]);
						g[o._[gun._.id]] = n;
					} else {
						f[i] = n;
					}
					opt.seen.push({cartridge: n, prop: i, from: f, src: o});
					a.obj(o).each(function(v,j){
						ify(v,j,n,{},f);
					});
					if(gun.is(n)){
						g[n._[gun._.id]] = n;
						f[i] = gun.id(n._[gun._.id]);
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
								if(gun.is(seen.cartridge)){ t(seen.cartridge._[gun._.id]) }
							} else {
								gun.ify(v, opt, n);
								if(gun.is(n)){
									t(n._[gun._.id]);
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
			}
			ify.be = function(seen){
				var n = seen.cartridge;
				n._ = n._||{};
				n._[gun._.id] = n._[gun._.id]||gun.id();
				g[n._[gun._.id]] = n;
				if(seen.from){
					seen.from[seen.prop] = gun.id(n._[gun._.id]);
				}
			}
			ify.seen = function(o){
				return a.list(opt.seen).each(function(v){
					if(v && v.src === o){ return v }
				}) || false;
			}
			var is = true, cartridge = n || {};
			a.obj(o).each(function(v,i){
				if(!gun.is(v)){ is = false }
				ify(v, i, cartridge, {});
			});
			if(!is){
				ify.be({cartridge: cartridge});
				g[cartridge._[gun._.id]] = cartridge;
			}
			if(n){
				return n;
			}
			return g;
		}
		gun.ify.be = function(v,g){ // update this to handle externals!
			var r;
			g = g || {};
			if(gun.ify.is(v)){
				r = v;
			} else
			if(a.obj.is(v)){
				r = {};
				a.obj(v).each(function(w,i){
					w = gun.ify.be(w);
					if(w === u){ return }
					r[i] = w;
				});
			} else
			if(a.list.is(v)){ // references only
				r = a.list(v).each(function(w,i,t){
					if(!w){ return }
					w = gun.at(w);
					if(gun.is(w)){
						t(w._[gun._.id]);
					} else
					if(w[gun._.id]){
						t(w[gun._.id]);
					} else 
					if(a.obj(g).has(w)){
						t(w);
					}
				}) || [];
			}
			return r;
		}
		gun.ify.is = function(v){ // null, binary, number (!Infinity), text, or a ref.
			if(v === null){ return true } // deletes
			if(v === Infinity){ return false }
			if(a.bi.is(v) 
			|| a.num.is(v) 
			|| a.text.is(v)){
				return true; // simple values
			}
			if(a.obj.is(v) && a.text.is(v[gun._.id])){ // ref
				return true;
			}
			return false;
		}
		gun.ify.obj = function(v, val){
			if(a.obj.is(val) && a.obj.is(v)){
				a.obj(v).each(function(d, i){
						if(a.gun.ham && a.gun.ham.call(g,n,p,v,w,val)){
						
						}
				});
			}
			return v;
		}
		gun.ify.list = function(v, val){
			var r;
			r = a.list.is(val)? val.concat(v) : v;
			r = a.list(r).each(function(r,i,t){t(r,1)})||{};
			r = a.obj(r).each(function(w,r,t){t(r)})||[]; // idempotency of this over latency? TODO! INVESTIGATE!!
			return r;
		}
		gun.duel = function(old,now){
			a.obj(now).each(function(g,id){
				if(!gun.is(g)){ return }
				var c;
				if(a.obj(old).has(id) && gun.is(c = old[id])){
					a.obj(g).each(function(v,i){
						
					});
				} else {
					old[id] = g;
				}
			});
		}
		gun.bullet = function(p,v,w){
			var b = {};
			b[p] = v;
			if(gun.ham && gun._.ham){
				b._ = {};
				b._[gun._.ham] = w || a.time.now();
			}
			return b;
		}
		gun.fire = function(bullet,c,w,op){
			bullet = bullet.what? bullet : {what: bullet};
			bullet.where = c || bullet.where;
			bullet.when = w || bullet.when;
			if(!a.obj.is(bullet.what)){ return gun.fire.jam("No ammo.", bullet) }
			if(!a.num.is(bullet.when)){ return gun.fire.jam("No time.", bullet) }
			if(!a.text.is(bullet.where)){ return gun.fire.jam("No location.", bullet) }
			bullet.how = bullet.how || {};
			bullet.how.gun = op || 1;
			theory.on(gun.event).emit(bullet);
		}
		gun.fire.jam = function(s,b){ if(b){ return console.log("Gun jam:",s,b) } console.log("Gun jam:",s) }
		gun.shots = function(hear,s){ return theory.on(gun.event+(s?'.'+s:'')).event(hear) }
		gun.event = 'gun';
		gun.magazine = {};
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
	a.gun._.ham = '>';
	a.gun.ham = function(n,p,v,w){
		if(!n){ return }
		console.log("HAM:", n, p, v, w);
		if(!a.text.is(p)){
			if(a.obj.is(p) && p._){
				a.obj(p).each(function(sv,i){
					if(i === '_'){ return }
					v = sv = a.gun.ham(n,i,sv, a.gun.ham.when(p._, i) || w); // works for now, but may not on other non-bullet objects
					if(sv === u){
						delete p[i];
					} else {
						p[i] = sv;
					}
				});
				return v;
			}
			return;
		}
		var val = a.gun.at(n,p)
		, when, age, now, u, q;
		q = p.replace('.',a.gun._.ham);
		n._ = n._ || {};
		n._[a.gun._.ham] = n._[a.gun._.ham] || {};
		age = function(q){
			if(!q){ return 0 }
			var when = n._[a.gun._.ham][q];
			if(when || when === 0){
				return when;
			}
			return age(a.text(q).clip(a.gun._.ham,0,-1));
		}
		when = age(q);
		v = (function(){
			if(a.gun.ify.is(v)){ // simple values are directly resolved
				return v;
			} else
			if(a.obj.is(v)){
				if(a.obj.is(val)){ // resolve sub-values
					var change = false;
					a.obj(v).each(function(sv,i){
						sv = a.gun.ham(n, (p+'.'+i), sv, w, val[i]); // TODO: BUG! Still need to deal with sub-value bullets resolving to container's age.
						if(sv === u){ return }
						change = true;
						val[i] = sv;
					});
					if(change){
						return v = val;
					} else {
						return;; // nothing new
					}
				}
				a.obj(v).each(function(sv,i){
					sv = a.gun.ham(n, (p+'.'+i), sv, w, (val||{})[i]);
					if(sv === u){ delete v[i] }
				});
				return v;
			} else 
			if(a.list.is(v)){
				if(!a.list.is(val)){ // TODO: deal with this later.
					return v;
				}
				return v;
			} else { // unknown matches are directly resolved
				return;
			}
		})();
		if(v === u){ return }
		if(w < when){
			console.log("new < old");
			return;
		} else
		if(w === when){ // this needs to be updated also!
			if(val === v || a.test.is(val,v) || a.text.ify(val) < a.text.ify(v)){
				console.log("new === old");
				return;
			}
		} else
		if((now = a.time.now() + 1) < w){ // tolerate a threshold of 1ms.
			console.log("amnesia", Math.ceil(w - now));
			/* Amnesia Quarantine */
			a.time.wait(function(){
				console.log("run again");
				a.gun.call(n,p,v,w);
			}, Math.ceil(w - now)); // crude implementation for now.
			return;
		}
		v = (function(){
			if(a.obj.is(v)){
				w = when; // objects are resolved relative to their previous values.
			}
			return v;
		})();
		n._[a.gun._.ham][q] = w; // if properties get deleted it may be nice to eventually delete the HAM, but that could cause problems so we don't for now.
		// ps. It may be possible to delete simple values if they are not proceeded by an object?
		return v;
	}
	a.gun.ham.when = function(w, i){
		var h;
		if(w && w._){
			w = w._;
		}
		if(w && (h = w[a.gun._.ham])){
			if(a.obj(h).has(i)){
				return h[i];
			}
			if(a.num.is(h)){
				return h;
			}
		}
	}
	return a.gun;
});