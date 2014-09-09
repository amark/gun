module.exports = require('theory')
('shot',function(a){
	var s3 = require(__dirname+'/gate/s3')
	, store = require(__dirname+'/gate/redis');
	function shot(opt){
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
		store.where = function(m){ return a.text.is(m)? m : a.text.is(m.where)? m.where : m.where.at }
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
		store.persisted = {};
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
				store.stay.put(where,g,function(e,r){
					a.list(store.batched[where]).each(function(cb){
						if(a.fns.is(cb)){ cb(e,r) }
						console.log('*** saved ***');
					});
					console.log(store.batched[where]);
					delete store.batched[where];
				});
			});
		}
		store.stay.put = function(where,obj,cb){
			s3(opt.s3.bucket(where)).put(opt.s3.key(where),obj,function(e,r){
				if(!e){ store.persisted[where] = 's3' }
				if(a.fns.is(cb)){ cb(e,r) }
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
			where = store.where(where);
			if(!a.text.is(where)){ return }
			if(a.fns.is(a.gun.magazine[where])){
				console.log('via memory', where);
				cb(a.gun.magazine[where], null); // TODO: Need to clear queue these at some point, too!
				return;
			}
			if(opt.src && opt.src.send){ 
				//console.log("Getting and subscribe");
				opt.src.send({where:{on: where}, how: {gun: 2}});
			}
			store.get(where, function(e,r){
				if(e || !r){
					return s3(opt.s3.bucket(where)).get(opt.s3.key(where),function(e,r,t){
						console.log('via s3', where); if(e){ console.log(e) }
						if(e || !r){ return cb(null, e) }
						store.persisted[where] = 's3';
						store.set(where, (t || a.text.ify(r)));
						r = shot.load.action(where,r); //a.gun(where,r);
						cb(r, e);
					},o);
				}
				console.log('via redis', where);
				r = a.obj.ify(r);
				r = shot.load.action(where,r); //a.gun(where,r);
				cb(r,e);
			});
		}
		shot.load.action = function(w,o){
			if(!w || !o){ return }
			return a.gun(w,o);
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
			console.log("gun spray ---->", m, (opt.src && opt.src.way? opt.src.way : null));
			if(!m || !m.how){ return }
			var where = store.where(m);
			if(m.how.gun === -2){
				console.log("gun data from others", m);
				if(m && m.what && m.what.session){ console.log(m.what.session) }
				return;
			}
			if(m.how.gun === 2){
				if(!a.fns.is(a.gun.magazine[where])){
					return;
				}
				if(opt.src && opt.src.send){
					console.log("gun subscribe sync", m);
					opt.src.send({what: a.gun.magazine[where](), where: where, how: {gun: -(m.how.gun||2)}});
				}
				return;
			}
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
			var n = a.obj.copy(m);
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
			if(n.where && !n.where.mid && opt.src.send){
				n.who = {};
				opt.src.send(n);
			}
		}
		if(opt.src && opt.src.on){
			opt.src.on(shot.spray.action);
		}
		shot.pump = function(fn){
			shot.pump.action = fn || shot.pump.action;
			return shot;
		}
		shot.pump.action = function(g,m,d){if(d){d()}}
		shot.server = function(req,res){
			console.log('shot server', req);
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
		a.gun.shots(function(m){
			var w;
			if(!store.persisted[w = store.where(m)]){
				if(opt.src && opt.src.send){ 
					//console.log("made and subscribed", m);
					opt.src.send({where:{on: w}, how: {gun: 2}}) 
				}
				store.stay.put(w, m.what, function(e,r){
					//console.log("---> gun shots", m, "new graph saved!");
				});
				return;
			}
			if(opt.src && opt.src.send){
				opt.src.send(m);
			}
		});
		shot.gun = a.gun;
		return shot;
	}
	shot.gun = a.gun;
	return shot;
},[__dirname+'/gun0'])