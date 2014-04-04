module.exports = require('theory')
('shot',function(a){
	return function(opt){
		opt = opt || {};
		opt.path = opt.path || '.'
		opt.batch = opt.batch || 0;
		opt.throttle = opt.throttle || 0;
		opt.src = opt.src || (this && this.com) || '';
		if(root.node){ return require(opt.path+'/shots')(opt); }
		var u, shot = {},
		store = window.amplify && window.amplify.store? amplify.store
		: function(src, data){ 
			if(data === u){ return store[src] }
			return store[src] = data;
		}
		store.reply = {};
		shot.meta = function(m, w, g){
			if(!m){ return }
			if(m.when && m.where){ return m }
			if(!w || !g){ return }
			m.when = w;
			m.where = g;
			m.how = {gun:1};
			return m;
		}
		theory.on(a.gun.event).event(shot.fire = function(w, m, g){
			if(m){
				m = shot.meta(m, w, g);
			}
			if(!m){ return }
			if(w && g){
				if(shot.add(m, g, shot.batch) === 2){
					return;
				}
			}
			if(opt.src && opt.src.send){
				if(!shot.meta(m)){ return }
				console.log("to server!", m);
				return opt.src.send(m);
			} // below is fallback. TODO: Unfinished!
			if(shot.lock){ return }
			var now = a.time.now();
			if(now - shot.last < opt.throttle // this entire if satement is probably wrong. Redo entirely.
			&& shot.batch.length < opt.batch){ return }
			console.log('sending!', shot.batch);
			$.post(opt.src, {b:a.text.ify(shot.batch)}, function(e,r){
				console.log('reply', e,r);
				shot.del(m, g);
			});
			shot.last = w;
			shot.batch = [];
		});
		shot.batch = [];
		shot.last = a.time.now();
		shot.list = function(){
			var g = store(a.gun.event) || {}
			, z = function(l,g,i){
				if(i !== 0 && !i){ return }
				if(!l || !l[i]){ return }
				shot.fire(null, l[i]);
				console.log("re-sent", l[i]);
				a.time.wait(function(){ z(l,g,i+1) },1);
			}
			a.obj(g).each(function(l,g){
				z(l,g,0);
			});
		}
		shot.add = function(m, g, b){
			if(!m){ return }
			var gs = store(a.gun.event) || {}
			, when = m.when || a(m,'_.'+a.gun._.ham) || a(m,'what._.'+a.gun._.ham);
			gs[g] = gs[g] || [];
			if(a.list(gs[g]).each(function(v){
				var w = v.when || a(v,'_.'+a.gun._.ham) || a(v,'what._.'+a.gun._.ham);
				if(w === when){
					return true;
				}
			})){ return 2; } // already
			if(opt.batch && a.list.is(b)){ b.push(m) }
			gs[g].push(m);
			store(a.gun.event, gs);
			return gs[g];
		}
		shot.del = function(m, g){
			if(!m){ return }
			var gs = store(a.gun.event) || {}
			, when = m.when || a(m,'_.'+a.gun._.ham) || a(m,'what._.'+a.gun._.ham);
			g = m.where.at || m.where;
			console.log("clear queue", g, m);
			gs[g] = gs[g] || [];
			gs[g] = a.list(gs[g]).each(function(v,i,t){
				var w = v.when || a(v,'_.'+a.gun._.ham) || a(v,'what._.'+a.gun._.ham);
				if(w === when){
					return; 
				}
				t(v);
			});
			store(a.gun.event, gs);
		}
		shot.sort = function(A,B){
			if(!A || !B){ return 0 }
			A = ((A||{})._||{})[a.gun._.ham]; B = ((B||{})._||{})[a.gun._.ham];
			if(A < B){ return -1 }
			else if(A > B){ return  1 }
			else { return 0 }
		}
		shot.load = function(where,cb,o){
			if(!where){ return }
			o = o || {};
			var m = {what: where, how: {gun:3}};
			if(opt.src && opt.src.ask){
				opt.src.ask(m,function(m){
					if(!m || !m.what){ cb(null) }
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
				shot.del(m);
			}
		}
		shot.list();
		return {gun: a.gun
			,spray: shot.spray
			,load: shot.load
			,fire: shot.fire
			,wait: function(){
				shot.lock = 1;
			}
			,go: function(){
				shot.last = shot.lock = 0;
				shot.fire();
			}
		};
	}
},['./gun'])