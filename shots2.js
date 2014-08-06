;(function(){
	var Gun = require(__dirname+'/gun2')
	, S3 = require(__dirname+'/gate/s3'); // redis has been removed, to be replaced with a disk system
	Gun.server = function(req, res){
		console.log("gun server has requests!");
	}
	Gun.on('init').event(function(gun, opt){
		var s3 = gun._.opt.s3 = gun._.opt.s3 || S3(opt && opt.s3);
		s3.path = s3.path || opt.s3.path || '';
		s3.indices = s3.indices || opt.s3.indices || '';
		s3.nodes = s3.nodes || opt.s3.nodes || '_/nodes/';
		gun._.opt.batch = opt.batch || gun._.opt.batch || 10;
		gun._.opt.throttle = opt.throttle || gun._.opt.throttle || 2;
		if(!gun._.opt.keepDefaultMaxSockets){ require('http').globalAgent.maxSockets = 999 } // we shouldn't do this globally! But because the default is 5, sad face.
		
		s3.load = s3.load || function(index, cb, opt){
			cb = cb || function(){};
			opt = opt || {};
			if(opt.id){ 
				index = s3.path + s3.nodes + index;
			} else { 
				index = s3.path + s3.indices + index;
			}
			s3.get(index, function(err, data, text, meta){
				console.log('via s3', index);
				if(meta && (index = meta[Gun.sym.id])){
					return s3.load(index, cb, {id: true});
				}
				if(err && err.statusCode == 404){
					err = null; // we want a difference between 'unfound' (data is null) and 'error' (keys are wrong)
				}
				cb(err, data);
			});
		}
		s3.set = s3.set || function(nodes, cb){
			s3.batching += 1;
			cb = cb || function(){};
			cb.count = 0;
			var next = s3.next
			, ack = Gun.text.random(8)
			, batch = s3.batch[next] = s3.batch[next] || {};
			s3.event.on(ack).once(cb);
			Gun.obj.map(nodes, function(node, id){
				cb.count += 1;
				batch[id] = (batch[id] || 0) + 1;
				console.log("set listener for", next + ':' + id, batch[id], cb.count);
				s3.event.on(next + ':' + id).event(function(){
					cb.count -= 1;
					console.log("transaction", cb.count);
					if(!cb.count){
						s3.event.on(ack).emit();
						this.off(); // MEMORY LEAKS EVERYWHERE!!!!!!!!!!!!!!!! FIX THIS!!!!!!!!!
					}
				});
			});
			if(gun._.opt.batch < s3.batching){
				return s3.set.now();
			}
			if(!gun._.opt.throttle){
				return s3.set.now();
			}
			s3.wait = s3.wait || setTimeout(s3.set.now, gun._.opt.throttle * 1000); // in seconds
		}
		s3.set.now = s3.set.now || function(){
			clearTimeout(s3.wait);
			s3.batching = 0;
			s3.wait = null;
			var now = s3.next
			, batch = s3.batch[s3.next];
			s3.next = Gun.time.is();	
			Gun.obj.map(batch, function put(exists, id){
				var node = gun._.nodes[id]; // the batch does not actually have the nodes, but what happens when we do cold data? Could this be gone?
				s3.put(s3.path + s3.nodes + id, node, function(err, reply){
					console.log("s3 put reply", id, err, reply);
					if(err || !reply){
						put(exists, id); // naive implementation of retry
						return;
					}
					s3.event.on(now + ':' + id).emit(200);
				});
			});
		}
		s3.next = s3.next || Gun.time.is();
		s3.event = s3.event || Gun.on.split();
		s3.batching = s3.batching || 0;
		s3.batched = s3.batched || {};
		s3.batch = s3.batch || {};
		s3.persisted = s3.persisted || {};
		s3.wait = s3.wait || null;
		
		s3.index = s3.index || function(index, node, cb){
			var id = node._[Gun.sym.id];
			if(!id){
				return cb({err: "No ID!"});
			}
			s3.put(s3.path + s3.indices + index, '', function(err, reply){ // index is 2 bytes??? Should be smaller
				console.log("s3 put reply", id, err, reply);
				if(err || !reply){
					put(exists, id); // naive implementation of retry
					return;
				}
				cb();
			}, {Metadata: {'#': id}});
		}
		
		gun.init({hook: {load: s3.load, set: s3.set, index: s3.index}}, true);
	});
	module.exports = Gun;
}());
/**
Knox S3 Config is:
knox.createClient({
    key: ''
  , secret: ''
  , bucket: ''
  , endpoint: 'us-standard'
  , port: 0
  , secure: true
  , token: ''
  , style: ''
  , agent: ''
});

aws-sdk for s3 is:
{ "accessKeyId": "akid", "secretAccessKey": "secret", "region": "us-west-2" }
AWS.config.loadFromPath('./config.json');
 {
	accessKeyId: process.env.AWS_ACCESS_KEY_ID = ''
	,secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY = ''
	,Bucket: process.env.s3Bucket = ''
	,region: process.env.AWS_REGION = "us-east-1"
	,sslEnabled: ''
}
**/