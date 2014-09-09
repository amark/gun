;(function(){
	var Gun = require(__dirname+'/gun')
	, S3 = require(__dirname+'/gate/s3') // redis has been removed, can be replaced with a disk system
	, url = require('url')
	, meta = {};
	Gun.on('init').event(function(gun, opt){
		gun.server = gun.server || function(req, res){ // where is the data? is it JSON? declare contentType=JSON from client?
			console.log("gun server has requests!", req.headers, req.body, req.url, req.method);
			/*meta.CORS(req, res);
			res.emit('data', {way: 'cool'});
			res.emit('data', {shish: 'kabob'});
			res.emit('data', {I: 'love'});
			res.end();
			return;*/
			if(!req || !res){ return }
			if(!req.url){ return }
			if(!req.method){ return }
			var tmp = {};
			tmp.url = url.parse(req.url, true);
			if(!gun.server.regex.test(tmp.url.pathname)){ return }
			tmp.key = tmp.url.pathname.replace(gun.server.regex,'').replace(/^\//i,''); // strip the base
			if(!tmp.key){
				return meta.JSON(res, {gun: true});
			}
			if('get' === req.method.toLowerCase()){ // get is used as subscribe
				// raw test for now:
				s3.load(tmp.key, function(err, data){
					console.log("gun subscribed!", err, data);
					meta.CORS(req, res);
					return meta.JSON(res, data || err);
				})
			} else
			if('post' === req.method.toLowerCase()){ // post is used as patch, sad that patch has such poor support
				
			}
		}
		gun.server.regex = /^\/gun/i;
		var s3 = gun._.opt.s3 = gun._.opt.s3 || S3(opt && opt.s3);
		s3.path = s3.path || opt.s3.path || '';
		s3.keyed = s3.keyed || opt.s3.keyed || '';
		s3.nodes = s3.nodes || opt.s3.nodes || '_/nodes/';
		gun._.opt.batch = opt.batch || gun._.opt.batch || 10;
		gun._.opt.throttle = opt.throttle || gun._.opt.throttle || 2;
		if(!gun._.opt.keepMaxSockets){ require('https').globalAgent.maxSockets = require('http').globalAgent.maxSockets = Infinity } // WARNING: Document this!
		
		s3.load = s3.load || function(key, cb, opt){
			cb = cb || function(){};
			opt = opt || {};
			if(opt.id){ 
				key = s3.path + s3.nodes + key;
			} else { 
				key = s3.path + s3.keyed + key;
			}
			s3.get(key, function(err, data, text, meta){
				console.log('via s3', key);
				if(meta && (key = meta[Gun.sym.id])){
					return s3.load(key, cb, {id: true});
				}
				if(err && err.statusCode == 404){
					err = null; // we want a difference between 'unfound' (data is null) and 'error' (auth is wrong).
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
						put(exists, id); // naive implementation of retry TODO: BUG: need backoff and anti-infinite-loop!
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
		
		s3.key = s3.key || function(key, node, cb){
			var id = node._[Gun.sym.id];
			if(!id){
				return cb({err: "No ID!"});
			}
			s3.put(s3.path + s3.keyed + key, '', function(err, reply){ // key is 2 bytes??? Should be smaller
				console.log("s3 put reply", id, err, reply);
				if(err || !reply){
					s3.key(key, node, cb); // naive implementation of retry TODO: BUG: need backoff and anti-infinite-loop!
					return;
				}
				cb();
			}, {Metadata: {'#': id}});
		}
		
		gun.init({hook: {load: s3.load, set: s3.set, key: s3.key}}, true);
	});
	meta.json = 'application/json';
	meta.JSON = function(res, data){
		if(!res || res._headerSent){ return }
		res.setHeader('Content-Type', meta.json);
		return res.end(JSON.stringify(data||''));
	};
	meta.CORS = function(req, res){
		if(!res || res.CORSHeader || res._headerSent){ return }
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Methods", ["POST", "GET", "PUT", "DELETE", "OPTIONS"]);
		res.setHeader("Access-Control-Allow-Credentials", true);
		res.setHeader("Access-Control-Max-Age", 1000 * 60 * 60 * 24);
		res.setHeader("Access-Control-Allow-Headers", ["X-Requested-With", "X-HTTP-Method-Override", "Content-Type", "Accept"]);
		res.CORSHeader = true;
		if(req && req.method === 'OPTIONS'){
			res.end();
			return true;
		}
	};
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