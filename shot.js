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
		shot.meta = function(m, g){
			if(!m || !g){ return }
			if(m._ && m._['#']){ m.when = m._['#'] }
			if(!m.where){ m.where = g }
			if(!m.how){ m.how = {gun:1} }
			return m;
		}
		theory.on(a.gun.event).event(shot.fire = function(m, g){
			var w;
			if(m){ shot.add(m, g, shot.batch) }
			if(m && opt.src && opt.src.send){
				if(!(m = shot.meta(m, g))){ return }
				return opt.src.send(m);
			} // below is fallback
			if(shot.lock){ return }
			if((w = a.time.now()) - shot.last < opt.throttle
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
		shot.list = function(m){
			var g = store(a.gun.event) || {};
			a.obj(g).each(function(l,g){
				a.list(l).each(function(v,i,t){
					theory.on(a.gun.event).emit(v, g);
				});
			});
		}
		shot.add = function(m, g, b){
			if(!m){ return }
			if(a.list.is(b)) b.push(m);
			var gs = store(a.gun.event) || {}
			, when = a(m,'what._.#') || m.when || m.what
			gs[g] = gs[g] || [];
			if(a.list(gs[g]).each(function(v){
				if(v && v._ && v._['#'] === when){
					return true;
				}
			})){ return gs[g]; } // already
			gs[g].push(m);
			store(a.gun.event, gs);
			return gs[g];
		}
		shot.del = function(m, g){
			if(!m){ return }
			var gs = store(a.gun.event) || {}
			, when = a(m,'what._.#') || m.when;
			gs[g] = gs[g] || [];
			gs[g] = a.list(gs[g]).each(function(v,i,t){
				if(v && v._ && v._['#'] === when){
					return; 
				}
				t(v);
			});
			store(a.gun.event, gs);
		}
		shot.sort = function(A,B){
			if(!A || !B){ return 0 }
			A = ((A||{})._||{})['#']; B = ((B||{})._||{})['#'];
			if(A < B){ return -1 }
			else if(A > B){ return  1 }
			else { return 0 }
		}
		shot.list();
		shot.shell = function(where,cb){
			if(!where){ return }
			var m = {_:{'%':where}};
			if(opt.src && opt.src.ask){
				if(!m.how){ m.how = {gun:3} }
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
				console.log('clear queue', m);
				shot.del(m, m.what);
			}
		}
		return {gun: a.gun
			,spray: shot.spray
			,shell: shot.shell
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