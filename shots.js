module.exports = require('theory')
('shot',function(a){
	require('child_process').exec('redis.sh', function(e, r){
		console.log(e,r);
	});
	/*
	var redis = a.redis
	, client = redis.createClient();
	client.on('error', function(e){
		if(!(/ECONNREFUSED/).test(e)){ return }
		if(redis.none){ return }
		redis.path = '/usr/local/bin/redis-server';
		if(!(require('fs').existsSync||require('path').existsSync)(redis.path)){
			redis.none = true;
			return;
		}
		if(process.env.gun_redis_lock){ return }
		process.env.gun_redis_lock = process.pid;
		console.log('gun', process.pid, 'starting redis');
		require('child_process').spawn(redis.path).on('exit',function(c,s){
			if(process.env.gun_redis_lock == process.pid){
				process.env.gun_redis_lock = ''; // 0 and false don't work, cause they are cast to strings!
			}
		});
	});
	*/
	return function(opt){
		opt = opt || {};
		opt.src = opt.src || '';
		opt.path = opt.path || '.'
		opt.batch = opt.batch || 0;
		opt.throttle = opt.throttle || 0;
		opt.redis = opt.redis || {};
		var u, shot = {},
		store = function(src, data){ 
			if(data === u){ return store[src] }
			return store[src] = data;
		}
		theory.on(a.gun.event).event(function(m, db){
			console.log('shot', m, db);
			shot.add(m, db, shot.batch);
			if(a.time.now() - shot.last < opt.throttle
			&& shot.batch.length < opt.batch){ return }
			$.post(opt.src, shot.batch, function(e,r){
				console.log('reply', e,r);
				shot.del(m, db);
			});
			shot.batch = [];
		});
		shot.batch = [];
		shot.last = a.time.now();
		shot.list = function(m){
			var g = store(a.gun.event) || {};
			a.obj(g).each(function(l,db){
				a.list(l).each(function(v,i,t){
					theory.on(a.gun.event).emit(v, db);
				});
			});
		}
		shot.add = function(m, db, b){
			if(a.list.is(b)) b.push(m);
			var g = store(a.gun.event) || {};
			g[db] = g[db] || [];
			if(a.list(g[db]).each(function(v){
				if(v && v.w === m.w){
					return true;
				}
			})){ return g[db]; } // already added
			g[db].push(m);
			store(a.gun.event, g);
			return g[db];
		}
		shot.del = function(m, db){
			var g = store(a.gun.event) || {};
			g[db] = g[db] || [];
			g[db] = a.list(g[db]).each(function(v,i,t){
				if(v && v.w === m.w){ // && a.test.is(m,v)){ 
					return; 
				}
				t(v);
			});
			store(a.gun.event, g);
		}
		shot.sort = function(A,B){
			if(!A || !B){ return 0 }
			A = A.w; B = B.w;
			if(A < B){ return -1 }
			else if(A > B){ return  1 }
			else { return 0 }
		}
		shot.start = function(){
			
		};
		shot.start();
		return {gun: a.gun};
	}
},[__dirname+ '/gun', 'redis'])