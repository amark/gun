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
			opt = opt || {};
			if(key[Gun._.soul]){
				key = s3.prefix + s3.prenode + key[Gun._.soul];
			} else {
				key = s3.prefix + s3.prekey + key;
			}
			s3.GET(key, function(err, data, text, meta){
				Gun.log('via s3', key, err);
				if(meta && meta[Gun._.soul]){
					return s3.get(meta, cb); // SUPER SUPER IMPORTANT TODO!!!! Make this get via GUN in case soul is already cached!
					// HUGE HUGE HUGE performance gains could come from the above line being updated! (not that this module is performant).
				}
				if(err && err.statusCode == 404){
					err = null; // we want a difference between 'unfound' (data is null) and 'error' (auth is wrong).
				}
				cb(err, data);
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
			var meta = {};
			meta[Gun._.soul] = soul = Gun.text.is(soul)? soul : (soul||{})[Gun._.soul];
			if(!soul){
				return cb({err: "No soul!"});
			}
			s3.PUT(s3.prefix + s3.prekey + key, '', function(err, reply){ // key is 2 bytes??? Should be smaller. Wait HUH? What did I mean by this?
				Gun.log("s3 put reply", soul, err, reply);
				if(err || !reply){
					s3.key(key, soul, cb); // naive implementation of retry TODO: BUG: need backoff and anti-infinite-loop!
					return;
				}
				cb();
			}, {Metadata: meta});
		}

		opt.hooks = opt.hooks || {};
		gun.opt({hooks: {
			get: opt.hooks.get || s3.get
			,put: opt.hooks.put || s3.put
			,key: opt.hooks.key || s3.key
		}}, true);
	});
}());
