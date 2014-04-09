module.exports = require('theory')
('shot',function(a){
	var s3 = require(__dirname+'/gate/s3')
	, store = require(__dirname+'/gate/redis');
	return function(opt){
		console.log("***** SHOTS *****");
		opt = opt || {};
		var u, shot = {};
		opt.path = opt.path || '.'
		opt.batch = opt.batch || 10;
		opt.throttle = opt.throttle || 15;
		opt.src = opt.src || (this && this.com) || '';
		opt.redis = opt.redis || {};
		opt.redis.max = a.num.is(opt.redis.max)? opt.redis.max : .8;
		opt.redis.Max = Math.floor(require('os').totalmem() * opt.redis.max);
		opt.redis.append = a.obj(opt.redis).has('append')? opt.redis.append : true;
		opt.redis.expire = opt.redis.expire || 60*15;
		opt.redis.config = function(){
			if(opt.redis.config.done === 0){ return }
			opt.redis.config.done = 3;
			var reply = function(e,r){ 
				if(e){ return }
				opt.redis.config.done -= 1;
			};
			if(opt.redis.max){
				store.client.config('set','maxmemory',opt.redis.Max, reply);
				store.client.config('set','maxmemory-policy','allkeys-lru', reply);
			}
			if(opt.redis.append){
				store.client.config('set','appendonly','yes', reply);
			}
		}
		opt.s3 = opt.s3 || {};
		opt.s3.Bucket = a.text.is(opt.s3.bucket)? opt.s3.bucket : (process.env.s3Bucket || '');
		opt.s3.bucket = a.fns.is(opt.s3.bucket)? opt.s3.bucket : function(key){
			return opt.s3.Bucket || a.text(key).clip('/',0,1);
		}
		opt.s3.key = a.fns.is(opt.s3.key)? opt.s3.key : function(key){
			if(key.slice(0, opt.s3.Bucket.length) === opt.s3.Bucket){
				key = key.slice(opt.s3.Bucket.length)||'';
				if(key.charAt(0) === '/'){
					key = key.slice(1);
				}
			}
			return key;
		}
		store.batch = [];
		store.last = a.time.now();
		store.push = function(key, score, val, cb){
			if(!val){ return }
			store.client.zadd(key, score, val, function(e,r){
				if(e){
					store.clienf.zadd(key, score, val, cb);
					return;
				}
				if(cb){ cb(e,r) }
			});
		}
		store.when = function(m){ return a(m,'what._.'+a.gun._.ham) || a(m,'_.'+a.gun._.ham) || m.when }
		store.add = function(m, g){
			if(!m){ return }
			g = '_' + (g || a(m,'where.at') || m.where);
			store.push(g, store.when(m) || 0, a.text.ify(m));
		}
		store.del = function(m, g){
			
		}
		store.sort = function(A,B){
			if(!A || !B){ return 0 }
			A = A.w; B = B.w;
			if(A < B){ return -1 }
			else if(A > B){ return  1 }
			else { return 0 }
		}
		store.batching = 0;
		store.batched = {};
		store.batch = {};
		store.wait = null;
		store.stay = function(key, val, cb){
			store.batching += 1;
			store.batch[key] = val;
			(store.batched[key] = store.batched[key]||[]).push(cb);
			if(opt.batch < store.batching){
				return store.stay.now();
			}
			if(!opt.throttle){
				return store.stay.now();
			}
			store.wait = store.wait || a.time.wait(store.stay.now, opt.throttle * 1000); // to seconds
		}
		store.stay.now = function(){
			store.batching = 0;
			a.time.stop(store.wait);
			store.wait = null;
			a.obj(store.batch).each(function(g,where){
				if(!g || !where){ return }
				//console.log('*************** save', where, '*******************');
				s3(opt.s3.bucket(where)).put(opt.s3.key(where),g,function(e,r){
					a.list(store.batched[where]).each(function(cb){
						if(a.fns.is(cb)){ cb(e,r) }
						console.log('*** saved ***');
					});
					console.log(store.batched[where]);
					delete store.batched[where];
				});
			});
		}
		store.set = function(key, value, cb, fn){
			opt.redis.config();
			var val = a.text.is(value)? value : a.text.ify(value);
			if(a.fns.is(fn)){ store.stay(key, value, fn) }
			//console.log("potential setex:", key, opt.redis.expire, val);
			if(opt.redis.max){
				store.client.set(key, val, function(e,r){
					if(e){
						store.clienf.setex(key, opt.redis.expire, val, cb);
						return;
					}
					if(cb){ cb(e,r) }
				});
			} else {
				store.client.setex(key, opt.redis.expire, val, function(e,r){
					if(e){
						store.clienf.setex(key, opt.redis.expire, val, cb);
						return;
					}
					if(cb){ cb(e,r) }
				});
			}
		}
		store.get = function(key, cb){
			store.clienf.get(key, function(e,r){
				if(e || !r){ return store.client.get(key, cb) }
				if(cb){ cb(e,r) }
			});
		}
		shot.load = function(where,cb,o){
			//console.log("shot.load >", where);
			if(!where){ return }
			where = a.text.is(where)? where : (where.at || where);
			if(!a.text.is(where)){ return }
			if(a.fns.is(a.gun.magazine[where])){
				console.log('via memory', where);
				cb(a.gun.magazine[where]); // TODO: Need to delete these at some point, too!
				return;
			}
			store.get(where, function(e,r){
				if(e || !r){
					return s3(opt.s3.bucket(where)).get(opt.s3.key(where),function(e,r,t){
						console.log('via s3', where); if(e){ console.log(e) }
						if(e || !r){ return cb(null, e) }
						store.set(where, (t || a.text.ify(r)));
						r = a.gun(where,r);
						cb(r, e);
					},o);
				}
				console.log('via redis', where);
				r = a.obj.ify(r);
				r = a.gun(where,r);
				cb(r);
			});
		}
		shot.spray = function(m){
			if(m && m.how){
				shot.spray.action(m);
				return shot;
			}
			if(a.fns.is(m)){
				shot.spray.transform = m;
				return shot.spray.action;
			}
			return shot.spray.action;
		}
		shot.spray.transform = function(g,m,d){if(d){d()}}
		shot.spray.action = function(m){
			console.log(">>> shot.spray.action", m);
			if(!m || !m.how){ return }
			var where = a.text.is(m.where)? m.where : m.where.at;
			if(m.how.gun === 3){
				shot.load(m.what, function(g,e){
					shot.pump.action(g, m, function(){ // receive custom edited copy here and send it down instead.
						if(!opt.src || !opt.src.reply){ return }
						m.what = a.fns.is(g)? g() : {};
						m.how.gun = -(m.how.gun||3);
						opt.src.reply(m);
					}, e);
				});
				return;
			}
			if(!where){ return }
			store.add(m);
			shot.load(where, function(g,e){
				var done = function(){
					var u, s, w = store.when(m) || 0, r = {}, cb;
					m.how.gun = -(m.how.gun||1);
					g = a.fns.is(g)? g : (a.gun.magazine[where] || function(){});
					a.obj(m.what).each(function(v,p){
						if(g(p,v,w) === u){
							r[p] = 0; // Error code
							return;
						} s = true;
					});
					m.what = r;
					cb = function(){
						if(!opt.src || !opt.src.reply || m.where.mid){ return }
						opt.src.reply(m);
						console.log('reply', m);
					}
					if(!s){ return cb() }
					store.set(where, g(), null, cb);
				};
				done.end = function(){};
				shot.spray.transform(g, m, done, e);
			});
			if(m.where && !m.where.mid && opt.src.send){
				var who = m.who;
				m.who = {};
				opt.src.send(m);
				m.who = who;
				console.log("sending to other servers!");
			}
		}
		shot.pump = function(fn){
			shot.pump.action = fn || shot.pump.action;
			return shot;
		}
		shot.pump.action = function(g,m,d){if(d){d()}}
		shot.server = function(req,res){
			if(!req || !res){ return }
			var b = shot.server.get(req);
			if(!b || !b.b){ return }
			b = a.obj.ify((b||{}).b);
			if(a.obj.is(b)){ b = [b] }
			if(!a.list.is(b)){ return }
			//console.log('gun >>>>>>');
			a.list(b).each(function(v,i){
				//console.log(v);
			});
			//console.log('<<<<<< gun');
			if(req.how && req.when && req.who && a.fns.is(res)){
				req.what.body = {ok:1};
				res(req);
			}
			return true;
		}
		shot.server.get = function(m){
			return !a.obj.empty(a(m,'what.form'))? a(m,'what.form')
				: !a.obj.empty(a(m,'what.url.query'))? a(m,'what.url.query')
				: false ;
		};
		shot.chamber = function(){
			var index = process.env.gun_chamber;
			if(!index){
				index = process.env.gun_chamber = a.text.r(12);
			}
			s3(opt.s3.bucket(index)).get(opt.s3.key(index),function(e,r,t){
				if(!r){
					
				}
			});
		}
		shot.gun = a.gun;
		return shot;
	}
},[__dirname+'/gun'])