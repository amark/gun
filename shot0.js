module.exports = require('theory')
('shot',function(a){
	return function(opt){
		opt = opt || {};
		opt.path = opt.path || '.'
		opt.batch = opt.batch || 0;
		opt.throttle = opt.throttle || 0;
		opt.src = opt.src || (this && this.com) || '';
		opt.cache = a.num.is(opt.cache)? opt.cache : opt.cache || 1;
		if(root.node){ return require(opt.path+'/shots0')(opt); }
		var u, shot = {},
		store = window.amplify && window.amplify.store? amplify.store
		: function(src, data){ 
			if(data === u){ return store[src] }
			return store[src] = data;
		}
		store.batch = [];
		store.last = a.time.now();
		store.list = function(){
			var g = store(a.gun.event) || {}
			, z = function(l,g,i){
				if(i !== 0 && !i){ return }
				if(!l || !l[i]){ return }
				shot.fire(l[i], 1);
				console.log("re-sent", l[i]);
				a.time.wait(function(){ z(l,g,i+1) },1);
			}
			a.obj(g).each(function(l,g){
				z(l,g,0);
			});
		}
		store.sort = function(A,B){
			if(!A || !B){ return 0 }
			A = ((A||{})._||{})[a.gun._.ham]; B = ((B||{})._||{})[a.gun._.ham];
			if(A < B){ return -1 }
			else if(A > B){ return  1 }
			else { return 0 }
		}
		store.add = function(m, g, b){
			if(!m){ return }
			g = '_' + (a(g,'at') || g || a(m,'where.at') || m.where);
			var gs = store(a.gun.event) || {}
			, when = shot.when(m);
			gs[g] = gs[g] || [];
			if(a.list(gs[g]).each(function(v){
				var w = shot.when(v);
				if(w === when){
					return true;
				}
			})){ return 2; } // already
			if(opt.batch && a.list.is(b)){ b.push(m) }
			gs[g].push(m);
			store(a.gun.event, gs);
			return gs[g];
		}
		store.del = function(m, g){
			if(!m){ return }
			var gs = store(a.gun.event) || {}
			, when = shot.when(m);
			g = '_'+(m.where.at || m.where || g);
			console.log("clear queue", g, m);
			gs[g] = gs[g] || [];
			gs[g] = a.list(gs[g]).each(function(v,i,t){
				var w = shot.when(v);
				if(w === when){
					return; 
				}
				t(v);
			});
			store(a.gun.event, gs);
		}
		store.set = function(key, val){
			var s = store(a.gun.event) || {};
			s[key] = val;
			store(a.gun.event, s);
		}
		store.get = function(key, cb){
			var s = store(a.gun.event) || {};
			s = s[key];
			if(cb){
				return cb(null,	s);
			}
			return s;
		};
		a.gun.shots(shot.fire = function(m, r){
			if(!m || !m.where){ return }
			if(!r){
				if(store.add(m, m.where, store.batch) === 2){
					return;
				}
			}
			if(opt.src && opt.src.send){
				m = opt.src.meta(m);
				if(!m.what || !m.where || !m.when){ return }
				console.log("to server!", m);
				return opt.src.send(m);
			} 
			return; // below should be a fallback. TODO: Unfinished!
		});
		shot.when = function(m){ return a(m,'what._.'+a.gun._.ham) || a(m,'_.'+a.gun._.ham) || m.when }
		shot.load = function(where,cb,o){
			if(!where){ return }
			o = o || {};
			var m = {what: where, how: {gun:3}}
			, g = a.gun.magazine[where] || store.get(where);
			g = a.fns.is(g)? g : a.obj.is(g)? a.gun(where, g) : null;
			if(g){
				//cb(g);
			}
			//console.log("!!! ASK !!!");
			if(opt.src && opt.src.ask){
				opt.src.ask(m,function(m){
					if(g){
						//console.log("!!! double load !!!");
						//return; // prevent load from calling twice! Add sync comparison.
					}
					if(!m || !m.what){ cb(null) }
					if(o.cache !== 0){
						if(o.cache || opt.cache){ // make options more configurable.
							store.set(where, m.what);
						}
					}
					m = a.gun(where, m.what);
					cb(m);
				});
			}
		}
		shot.spray = function(filter){
			if(filter && filter.how){
				shot.spray.action(filter);
				return shot;
			}
			if(a.fns.is(filter)){
				shot.spray.action = filter;
				return shot;
			}
			return shot.spray.action;
		}
		shot.spray.action = function(m){
			if(!m || !m.how || !m.how.gun){ return }
			if(m.how.gun === -1){
				store.del(m);
			}
		}
		store.list();
		return shot;
	}
},['./gun0'])