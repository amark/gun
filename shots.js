;(function(){
	var Gun = require(__dirname+'/gun')
	, S3 = require(__dirname+'/gate/s3') // redis has been removed, can be replaced with a disk system
	, url = require('url')
	, meta = {};
	Gun.on('init').event(function(gun, opt){
		gun.server = gun.server || function(req, res, next){ // this whole function needs refactoring and modularization
			next = next || function(){};
			if(!req || !res){ return next() }
			if(!req.url){ return next() }
			if(!req.method){ return next() }
			var tmp = {};
			tmp.url = url.parse(req.url, true);
			if(!gun.server.regex.test(tmp.url.pathname)){ return next() }
			tmp.key = tmp.url.pathname.replace(gun.server.regex,'') || '';
			if(tmp.key.toLowerCase() === '.js'){
				res.writeHead(200, {'Content-Type': 'text/javascript'});
				res.end(gun.server.js = gun.server.js || require('fs').readFileSync(__dirname + '/gun.js')); // gun server is caching the gun library for the client
				return;
			}
			console.log("\ngun server has requests!", req.method, req.url, req.headers, req.body);
			tmp.key = tmp.key.replace(/^\//i,'') || ''; // strip the base
			tmp.method = (req.method||'').toLowerCase();
			if('get' === tmp.method){ // get is used as subscribe
				console.log("URL?", tmp.url);
				if(tmp.url && tmp.url.query){
					/*
						long polling! Idea: On data-flush or res.end, issue a timeout token,
						that keeps the 'connection' alive even while disconnected.
						Subsequent requests use the timeout token and thus continue off as before, seamlessly.
						If after the timeout no follow up has been made, we assume the client has dropped / disconnected.
					*/
					Gun.obj.map(tmp.url.query, function(){
						tmp.query = true;
						// subscribe this req/res to the ids, then make POSTS publish to them and reply!
						// MARK! COME BACK HERE
					});
					if(tmp.query){
						return; // we'll wait until we get updates before we reply.  Long polling (should probably be implemented as a hook itself! so websockets can replace it)
					}
				}
				if(!tmp.key){
					return meta.JSON(res, {gun: true});
				}
				// raw test for now, no auth:
				gun.load(tmp.key, function(err, data){
					meta.CORS(req, res);
					return meta.JSON(res, data || err);
				})
			} else
			if('post' === tmp.method || 'patch' === tmp.method){ // post is used as patch, sad that patch has such poor support
				if(!req.body){
					console.log("Warn: No body on POST?");
				}
				// raw test for now, no auth:
				// should probably load all the nodes first?
				var context = Gun.chain.set.now.union.call(gun, req.body); // data safely transformed
				if(context.err){
					return meta.JSON(res, context.err); // need to standardize errors more
				}
				// console.log("-------- union ---------");Gun.obj.map(gun.__.nodes, function(node){ console.log(node); });console.log("------------------------");
				/*
					WARNING! TODO: BUG! Do not send OK confirmation if amnesiaQuaratine is activated! Not until after it has actually been processed!!!
				*/
				if(Gun.fns.is(gun.__.opt.hook.set)){
					gun.__.opt.hook.set(context.nodes, function(err, data){ // now iterate through those nodes to S3 and get a callback once all are saved
						if(err){ 
							return meta.JSON(res, {err: err}); // server should handle the error for the client first! Not force client to re-attempt.
						}
						meta.JSON(res, {ok: 1}); // need to standardize OKs, OK:1 not good.
					});
				} else {
					context.err = "Warning! You have no persistence layer to save to!";
					Gun.log(context.err);
				}
			}
		}
		gun.server.regex = /^\/gun/i;
		var s3 = gun.__.opt.s3 = gun.__.opt.s3 || S3(opt && opt.s3);
		s3.prefix = s3.prefix || opt.s3.prefix || '';
		s3.prekey = s3.prekey || opt.s3.prekey || '';
		s3.prenode = s3.prenode || opt.s3.prenode || '_/nodes/';
		gun.__.opt.batch = opt.batch || gun.__.opt.batch || 10;
		gun.__.opt.throttle = opt.throttle || gun.__.opt.throttle || 2;
		if(!gun.__.opt.keepMaxSockets){ require('https').globalAgent.maxSockets = require('http').globalAgent.maxSockets = Infinity } // WARNING: Document this!
		
		s3.load = s3.load || function(key, cb, opt){
			cb = cb || function(){};
			opt = opt || {};
			if(opt.id){ 
				key = s3.prefix + s3.prenode + key;
			} else { 
				key = s3.prefix + s3.prekey + key;
			}
			s3.get(key, function(err, data, text, meta){
				console.log('via s3', key, err);
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
				//console.log("set listener for", next + ':' + id, batch[id], cb.count);
				s3.event.on(next + ':' + id).event(function(){
					cb.count -= 1;
					//console.log("transaction", cb.count);
					if(!cb.count){
						s3.event.on(ack).emit();
						this.off(); // MEMORY LEAKS EVERYWHERE!!!!!!!!!!!!!!!! FIX THIS!!!!!!!!!
					}
				});
			});
			if(gun.__.opt.batch < s3.batching){
				return s3.set.now();
			}
			if(!gun.__.opt.throttle){
				return s3.set.now();
			}
			s3.wait = s3.wait || setTimeout(s3.set.now, gun.__.opt.throttle * 1000); // in seconds
		}
		s3.set.now = s3.set.now || function(){
			clearTimeout(s3.wait);
			s3.batching = 0;
			s3.wait = null;
			var now = s3.next
			, batch = s3.batch[s3.next];
			s3.next = Gun.time.is();	
			Gun.obj.map(batch, function put(exists, id){
				var node = gun.__.nodes[id]; // the batch does not actually have the nodes, but what happens when we do cold data? Could this be gone?
				s3.put(s3.prefix + s3.prenode + id, node, function(err, reply){
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
			s3.put(s3.prefix + s3.prekey + key, '', function(err, reply){ // key is 2 bytes??? Should be smaller
				console.log("s3 put reply", id, err, reply);
				if(err || !reply){
					s3.key(key, node, cb); // naive implementation of retry TODO: BUG: need backoff and anti-infinite-loop!
					return;
				}
				cb();
			}, {Metadata: {'#': id}});
		}
		
		opt.hook = opt.hook || {};
		gun.init({hook: {
			load: opt.hook.load || s3.load
			,set: opt.hook.set || s3.set
			,key: opt.hook.key || s3.key
		}}, true);
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