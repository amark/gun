module.exports = require('theory')
('shot',function(a){
	var s3 = require(__dirname+'/gate/s3')
	, store = require(__dirname+'/gate/redis');
	return function(opt){
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
		opt.s3.Bucket = a.text.is(opt.s3.bucket)? opt.s3.bucket : '';
		opt.s3.bucket = a.fns.is(opt.s3.bucket)? opt.s3.bucket : function(key){
			return opt.s3.Bucket || a.text(key).clip('/',0,1);
		}
		opt.s3.key = a.fns.is(opt.s3.key)? opt.s3.key : function(key){
			if(opt.s3.Bucket){ return key }
			return a.text(key).clip('/',1);
		}
		theory.on(a.gun.event).event(function(m, db){
			return;
		});
		store.batch = [];
		store.last = a.time.now();
		store.push = function(key, score, val, cb){
			store.client.zadd(key, score, val, function(e,r){
				if(e){
					store.clienf.zadd(key, score, val, cb);
					return;
				}
				if(cb){ cb(e,r) }
			});
		}
		store.add = function(m, db){
			if(!m){ return }
			db = '_' + (db || a(m,'where.at') || m.where);
			store.push(db, a(m,'what._.#') || m.when || 0, a.text.ify(m));
		}
		store.del = function(m, db){
			
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
				console.log('*************** save', where, '*******************');
				s3(opt.s3.bucket(where)).put(opt.s3.key(where),g,function(e,r){
					a.list(store.batched[where]).each(function(cb){
						if(a.fns.is(cb)){ cb(e,r) }
						console.log('*** end ***');
					});
					delete store.batched[where];
				});
			});
		}
		store.set = function(key, value, cb, fn){
			opt.redis.config();
			var val = a.text.is(value)? value : a.text.ify(value);
			if(a.fns.is(fn)){ store.stay(key, value, fn) }
			console.log("potential setex:", key, opt.redis.expire, val);
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
		shot.shell = function(where,cb,o){
			if(!where){ return }
			where = a.text.is(where)? where : (where.at || where);
			if(!a.text.is(where)){ return }
			if(a.fns.is(a.gun.clip[where])){
				console.log('via memory', where);
				cb(a.gun.clip[where]); // TODO: Need to delete these at some point, too!
				return;
			}
			store.get(where, function(e,r){
				if(e || !r){
					return s3(opt.s3.bucket(where)).get(opt.s3.key(where),function(e,r,t){
						console.log('via s3', where);
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
			console.log("spray", m);
			if(!m || !m.how){ return }
			if(m.where && m.where.mid){
				console.log("servers chats:", m); 
			}
			var where = a.text.is(m.where)? m.where : m.where.at;
			if(m.how.gun === 3){
				shot.shell(m.what._['%']||where, function(g,e){
					shot.pump.action(g, m, function(){ // receive custom edited copy here and send it down instead.
						if(opt.src && opt.src.reply){
							m.what = a.fns.is(g)? g() : {};
							m.how.gun = -(m.how.gun||3);
							opt.src.reply(m);
						}
					}, e);
				});
				return;
			}
			if(!where){ return }
			store.add(m);
			shot.shell(where, function(g,e){
				var done = function(){
					theory.on(a.gun.event+'.shot').emit(m.what,g);
					g = a.fns.is(g)? g : function(){ return a.gun.clip[where] || {} }
					console.log("updated:", g());
					store.set(where, g(), null, function(){ // TODO: Only save to S3 if there is a change in data after HAM.
						if(opt.src && opt.src.reply && !m.where.mid){
							m.when = a.num.is(a(m,'what._.#'))? m.what._['#'] : m.when;
							m.how.gun = -(m.how.gun||1);
							m.what = where;
							m.where = null;
							opt.src.reply(m);
						}
					});
				};
				done.end = function(){};
				shot.spray.transform(g, m, done, e);
			});
			if(m.where && !m.where.mid && opt.src.send){
				var who = m.who;
				m.who = {};
				opt.src.send(m);
				m.who = who;
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
		return shot;
	}
},[__dirname+'/gun'])