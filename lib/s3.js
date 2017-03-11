;(function(){
	
	if(!process.env.AWS_S3_BUCKET){ return }
	
	var Gun = require('../gun');
	var S3 = require('./aws');

	Gun.on('opt', function(at){
		var opt = at.opt.s3 || (at.opt.s3 = {});
		var s3 = opt.store || S3(opt);
		opt.store = s3;
		this.to.next(at);
		if(!s3 || !s3.config){ return }
		if(at.once){ return }
		var root = at.gun.back(-1);
		opt.prefix = opt.prefix || '';
		opt.batch = opt.batch || 10;
		opt.throttle = opt.throttle || process.env.AWS_S3_THROTTLE || 15;
		opt.disconnect = opt.disconnect || 5;
		Gun.on('get', function(at){
			if(!at.get){ return }
			var id = at['#'], soul = at.get['#'], field = at.get['.'];
			var key = opt.prefix+soul;
			//console.log("g3t", soul);
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
				//console.log("got", soul, node);
				root.on('in', {'@': id, put: Gun.graph.node(node)});
			});
		});
		Gun.on('put', function(at){
			var id = at['#'], check = {}, next = s3.next, err, u;
			Gun.graph.is(at.put, function(node, soul){
				check[soul] = 1;
				/*if(!graph[soul]){
					// need to read before writing
					return;
				}*/
				async[soul] = node;
				batch[soul] = (batch[soul] || 0) + 1;
				s3.on(next + ':' + soul, function(arg){
					var reply = arg[1];
					err = arg[0]; 
					check[soul] = 0;
					this.off();
					Gun.obj.del(async, soul);
					if(Gun.obj.map(check, function(v){
						if(v){ return true }
					})){ return }
					root.on('in', {'@': id, err: err, ok: err? u : reply});
				});
			});
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
				//console.log("s3ving...", soul);
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
		var graph = {}, batch = {}, ids = {}, async = {};
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