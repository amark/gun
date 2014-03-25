module.exports = (function(){
	var r = {}
	, fs = require('fs')
	, child = require('child_process')
	, check = (fs.existsSync||require('path').existsSync)
	, install = 'redis-install'
	, server = 'redis-server';
	r.redis = require('redis');
	r.client = r.redis.createClient();
	r.refis = require('fakeredis');
	r.clienf = r.refis.createClient();
	process.env[server] = process.env[server] || '/usr/local/bin/redis-server';
	r.client.on('error', function(e){
		console.log("redis error", e);
		if(!(/ECONNREFUSED/).test(e)){ return }
		r.start();
	});
	r.client.set('_gun_redis_init_', r.key = Math.random().toString().slice(2));
	r.start = function(){
		if(process.env[install]){
			if(!check(process.env[server])){
				return r.deploy(r.check);
			}
		}
		if(!check(process.env[server])){
			return; // never recover
		}
		if(process.env.gun_redis_lock){ return }
		process.env.gun_redis_lock = process.pid;
		console.log('gun', process.pid, 'starting redis');
		require('child_process').spawn(process.env[server]).on('exit',function(){
			if(process.env.gun_redis_lock == process.pid){
				process.env.gun_redis_lock = ''; // 0 and false don't work, cause they are cast to strings!
			}
		});
		r.client.get('_gun_redis_init_', function(e,r){
			console.log(">>>> BOOM <<<<", e, r);
		});
	}
	r.deploy = function(done){
		var path = process.env[install];
		if(!path){ return }
		if(check(process.env[server])){
			done(process.env[server]);
		} else {
			child.exec('cd ' + path
			+ ' && ' + 'curl -O http://download.redis.io/redis-stable.tar.gz'
			+ ' && ' + 'tar xvzf redis-stable.tar.gz'
			+ ' && ' + 'cd redis-stable'
			+ ' && ' + 'make'
			, function(e, r){
				done(process.env[server] = path + '/redis-stable/src/redis-server');
			});
		}
	}
	return r;
})();