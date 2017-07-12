;(function(){
	
	var Gun = require('../gun');
	var S3 = require('./aws');

	// TODO: BUG! Mark, upgrade S3 in v0.8.X! And try to integrate with Radix Storage Engine!!!

	Gun.on('opt', function(ctx){
		this.to.next(ctx);
		var opt = ctx.opt;
		if(ctx.once){ return }
		if(!process.env.AWS_S3_BUCKET){ return }
		console.log("S3 STORAGE ENGINE IS BROKEN IN 0.8! DO NOT USE UNTIL FIXED!");
		var s3 = opt.store || S3(opt.s3 = opt.s3 || {});
		opt.s3.store = s3;
		if(!s3 || !s3.config){ return Gun.log("No S3 config!") }
		opt.file = opt.file || opt.prefix || '';
		opt.batch = opt.batch || 10;
		opt.throttle = opt.throttle || process.env.AWS_S3_THROTTLE || 15;
		opt.disconnect = opt.disconnect || 5;
		ctx.on('get', function(at){
			this.to.next(at);
			var id = at['#'], soul = at.get['#'], field = at.get['.'];
			var key = opt.prefix+soul;
			s3.GET(key, function(err, data, text, meta){
				meta = meta || {};
				if(err && err.statusCode == 404){
					err = null; // we want a difference between 'unfound' (data is null) and 'error' (auth is wrong).
				}
				if(!data){
					data = root._.graph[soul] || async[soul];
				}
				if(data && !Gun.node.soul(data)){
					err = {err: Gun.log('No soul on S3 node data!')};
				}
				if(err){
					root.on('in', {'@': id, err: err});
					return
				}
				var node = data;
				graph[soul] = true;
				if(data && field){
					node = Gun.state.ify({}, field, Gun.state.is(node, field), node[field], soul);
				}
				console.log("got", soul, node);
				root.on('in', {'@': id, put: Gun.graph.node(node)});
			});
		});
		ctx.on('put', function(at){
			this.to.next(at);
			var id = at['#'], check = {}, next = s3.next, err, u;
			Gun.graph.is(at.put, null, function(val, key, node, soul){
				batch[soul] = Gun.state.to(node, key, disk[soul]);
			});
			if(!at['@']){ acks[at['#']] = true; } // only ack non-acks.
			s3.batching += 1;
			if(opt.batch < s3.batching){
				return now();
			}
			if(!opt.throttle){
				return now();
			}
			s3.wait = s3.wait || setTimeout(now, opt.throttle * 1000); // in seconds
		});
		function now(){
			clearTimeout(s3.wait);
			var keep = batch;
			batch = {};
			s3.batching = 0;
			var now = s3.next;
			s3.next = Gun.time.is();
			s3.wait = null;
			Gun.obj.map(keep, function put(exists, soul, count){
				console.log("s3ving...", soul);
				var node = root._.graph[soul] || async[soul]; // the batch does not actually have the nodes, but what happens when we do cold data? Could this be gone?
				s3.PUT(opt.prefix+soul, node, function(err, reply){
					if(count < 5 && (err || !reply)){
						put(exists, soul, (count || 0) + 1); // naive implementation of retry TODO: BUG: need backoff and anti-infinite-loop!
						return;
					}
					//console.log("S3VED", soul);
					s3.on(now + ':' + soul, [err, reply]);
				});
			});
		}
		var graph = {}, batch = {}, acks = {}, ids = {}, async = {};
		var count = 0;
		s3.next = s3.next || Gun.time.is();
		s3.on = s3.on || Gun.on;
	});

	;(function(){return;
		global.Gun = require('../gun');

		process.env.AWS_S3_BUCKET = 'test-s3';
		process.env.AWS_ACCESS_KEY_ID = 'asdf';
		process.env.AWS_SECRET_ACCESS_KEY = 'fdsa';
		process.env.fakes3 = 'http://localhost:4567';
		process.env.AWS_S3_THROTTLE = 0;
		require('../test/abc');
	}());
}());
