;(function(){
	var Gun = require('../gun');
	var S3 = require('./aws');

	Gun.on('opt').event(function(gun, opt){
		if(!opt.s3){ return } // don't use S3 if it isn't specified.
		opt.s3 = opt.s3 || {};
		var s3 = gun.__.opt.s3 = gun.__.opt.s3 || S3(opt && opt.s3);
		s3.prefix = s3.prefix || opt.s3.prefix || '';
		s3.prekey = s3.prekey || opt.s3.prekey || '';
		s3.prenode = s3.prenode || opt.s3.prenode || '_/nodes/';
		gun.__.opt.batch = opt.batch || gun.__.opt.batch || 10;
		gun.__.opt.throttle = opt.throttle || gun.__.opt.throttle || 15;
		gun.__.opt.disconnect = opt.disconnect || gun.__.opt.disconnect || 5;
		s3.get = s3.get || function(key, cb, opt){
			if(!key){ return }
			cb = cb || function(){};
			(opt = opt || {}).ctx = opt.ctx || {};
			opt.ctx.load = opt.ctx.load || {};
			if(key[Gun._.soul]){
				key = s3.prefix + s3.prenode + Gun.is.soul(key);
			} else {
				key = s3.prefix + s3.prekey + key;
			}
			s3.GET(key, function(err, data, text, meta){
				Gun.log('via s3', key, err);
				if(err && err.statusCode == 404){
					err = null; // we want a difference between 'unfound' (data is null) and 'error' (auth is wrong).
				}
				// TODO: optimize KEY command to not write data if there is only one soul (which is common).
				if(meta && (meta.key || meta[Gun._.soul])){
					if(err){ return cb(err) }
					if(meta.key && Gun.obj.is(data) && !Gun.is.node(data)){
						return Gun.obj.map(data, function(rel, soul){
							if(!(soul = Gun.is.soul(rel))){ return }
							opt.ctx.load[soul] = false;
							s3.get(rel, cb, {next: 's3', ctx: opt.ctx}); // TODO: way faster if you use cache.
						});
					}
					if(meta[Gun._.soul]){
						return s3.get(meta, cb); // TODO: way faster if you use cache.
					}
					return cb({err: Gun.log('Cannot determine S3 key data!')});
				}
				if(data){
					meta.soul = Gun.is.soul.on(data);
					if(!meta.soul){
						err = {err: Gun.log('No soul on node S3 data!')};
					}
				} else {
					return cb(err, null);
				}
				if(err){ return cb(err) }
				opt.ctx.load[meta.soul] = true;
				var graph = {};
				graph[meta.soul] = data;
				cb(null, graph);
				(graph = {})[meta.soul] = Gun.union.pseudo(meta.soul);
				cb(null, graph);
				if(Gun.obj.map(opt.ctx.load, function(loaded, soul){
					if(!loaded){ return true }
				})){ return } // return IF we have nodes still loading.
				cb(null, {});
			});
		}
		s3.put = s3.put || function(nodes, cb){
			s3.batching += 1;
			cb = cb || function(){};
			cb.count = 0;
			var next = s3.next
			, ack = Gun.text.random(8)
			, batch = s3.batch[next] = s3.batch[next] || {};
			s3.on(ack).once(cb);
			Gun.obj.map(nodes, function(node, soul){
				cb.count += 1;
				batch[soul] = (batch[soul] || 0) + 1;
				//Gun.log("put listener for", next + ':' + soul, batch[soul], cb.count);
				s3.on(next + ':' + soul).event(function(){
					cb.count -= 1;
					//Gun.log("transaction", cb.count);
					if(!cb.count){
						s3.on(ack).emit();
						this.off(); // MEMORY LEAKS EVERYWHERE!!!!!!!!!!!!!!!! FIX THIS!!!!!!!!!
					}
				});
			});
			if(gun.__.opt.batch < s3.batching){
				return s3.put.now();
			}
			if(!gun.__.opt.throttle){
				return s3.put.now();
			}
			s3.wait = s3.wait || setTimeout(s3.put.now, gun.__.opt.throttle * 1000); // in seconds
		}
		s3.put.now = s3.put.now || function(){
			clearTimeout(s3.wait);
			s3.batching = 0;
			s3.wait = null;
			var now = s3.next
			, batch = s3.batch[s3.next];
			s3.next = Gun.time.is();
			Gun.obj.map(batch, function put(exists, soul){
				var node = gun.__.graph[soul]; // the batch does not actually have the nodes, but what happens when we do cold data? Could this be gone?
				s3.PUT(s3.prefix + s3.prenode + soul, node, function(err, reply){
					Gun.log("s3 put reply", soul, err, reply);
					if(err || !reply){
						put(exists, soul); // naive implementation of retry TODO: BUG: need backoff and anti-infinite-loop!
						return;
					}
					s3.on(now + ':' + soul).emit(200);
				});
			});
		}
		s3.next = s3.next || Gun.time.is();
		s3.on = s3.on || Gun.on.create();
		s3.batching = s3.batching || 0;
		s3.batched = s3.batched || {};
		s3.batch = s3.batch || {};
		s3.persisted = s3.persisted || {};
		s3.wait = s3.wait || null;

		s3.key = s3.key || function(key, soul, cb){
			if(!key){
				return cb({err: "No key!"});
			}
			if(!soul){
				return cb({err: "No soul!"});
			}
			var path = s3.prefix + s3.prekey + key, meta = {key: '0.2'}, rel = {};
			meta[Gun._.soul] = rel[Gun._.soul] = soul = Gun.is.soul(soul) || soul;
			s3.GET(path, function(err, data, text, _){
				var souls = data || {};
				souls[soul] = rel;
				s3.PUT(path, souls, function(err, reply){
					Gun.log("s3 key reply", soul, err, reply);
					if(err || !reply){
						return s3.key(key, soul, cb); // naive implementation of retry TODO: BUG: need backoff and anti-infinite-loop!
					}
					cb();
				}, {Metadata: meta});
			});
		}

		opt.hooks = opt.hooks || {};
		gun.opt({hooks: {
			get: opt.hooks.get || s3.get
			,put: opt.hooks.put || s3.put
			,key: opt.hooks.key || s3.key
		}}, true);
	});
}());
