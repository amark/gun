;(function(){
	var Gun = require(__dirname+'/gun')
	, S3 = require(__dirname+'/gate/s3') // redis has been removed, can be replaced with a disk system
	, url = require('url')
	, meta = {};
	Gun.on('opt').event(function(gun, opt){
		gun.server = gun.server || function(req, res, next){ // this whole function needs refactoring and modularization
			next = next || function(){};
			if(!req || !res){ return next() }
			if(!req.url){ return next() }
			if(!req.method){ return next() }
			var msg = {};
			msg.url = url.parse(req.url, true);
			if(!gun.server.regex.test(msg.url.pathname)){ return next() }
			msg.url.key = msg.url.pathname.replace(gun.server.regex,'') || '';
			if(msg.url.key.toLowerCase() === '.js'){
				res.writeHead(200, {'Content-Type': 'text/javascript'});
				res.end(gun.server.js = gun.server.js || require('fs').readFileSync(__dirname + '/gun.js')); // gun server is caching the gun library for the client
				return;
			}
			msg.url.key = msg.url.key.replace(/^\//i,'') || ''; // strip the base
			msg.method = (req.method||'').toLowerCase();
			msg.headers = req.headers;
			msg.body = req.body; // TODO: include body-parser here?
			if('get' === msg.method){ // get is used as subscribe
				gun.__.opt.hooks.sub(msg, function(reply){
					if(!res){ return }
					if(!reply){ return res.end() }
					if(reply.headers){
						if(!res._headerSent){
							Gun.obj.map(reply.headers, function(val, field){
								res.setHeader(field, val);
							});
						}
					}
					meta.CORS(req, res); // add option to disable this
					if(reply.chunk){
						res.write(Gun.text.ify(reply.chunk));
					}
					if(reply.body){
						res.end(Gun.text.ify(reply.body));
					}
				});
				return;
			} else
			if('post' === msg.method || 'patch' === msg.method){ // post is used as patch, sad that patch has such poor support
				if(!msg.body){
					console.log("Warn: No body on POST?");
				}
				// raw test for now, no auth:
				// should probably load all the nodes first?
				var context = Gun.chain.set.now.union.call(gun, msg.body); // data safely transformed
				if(context.err){
					return meta.JSON(res, context.err); // need to use the now standardized errors
				}
				/*
					WARNING! TODO: BUG! Do not send OK confirmation if amnesiaQuaratine is activated! Not until after it has actually been processed!!!
				*/
				if(Gun.fns.is(gun.__.opt.hooks.set)){
					gun.__.opt.hooks.set(context.nodes, function(err, data){ // now iterate through those nodes to S3 and get a callback once all are saved
						if(err){ 
							return meta.JSON(res, {err: err}); // server should handle the error for the client first! Not force client to re-attempt.
						}
						meta.JSON(res, {ok: 1}); // need to standardize OKs, OK:1 not good.
					});
				} else {
					context.err = "Warning! You have no persistence layer to save to!";
					Gun.log(context.err);
				}
				
				var diff = msg.body
				msg.body = null;
				Gun.obj.map(context.nodes, function(node, id){
					var req = Gun.obj.copy(msg);
					msg.body = node;
					gun.server.push.on(id).emit(msg); 
				});
				msg.body = diff;
			}
		}
		gun.server.regex = /^\/gun/i;
		gun.server.clients = {};
		gun.server.push = Gun.on.split();
		opt.s3 = opt.s3 || {};
		var s3 = gun.__.opt.s3 = gun.__.opt.s3 || S3(opt && opt.s3);
		s3.prefix = s3.prefix || opt.s3.prefix || '';
		s3.prekey = s3.prekey || opt.s3.prekey || '';
		s3.prenode = s3.prenode || opt.s3.prenode || '_/nodes/';
		gun.__.opt.batch = opt.batch || gun.__.opt.batch || 10;
		gun.__.opt.throttle = opt.throttle || gun.__.opt.throttle || 15;
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
		
		gun.server.sub = (function(){
			function sub(req, cb){
				//console.log("\n\n\n", req);
				req.sub = req.headers['gun-sub'];
				req.transport = req.headers['gun-transport'];
				if(req.transport === 'XHR-SLP'){ return sub.SLP(req, cb) }
				if(!req.url.key){ return sub.keyless(req, cb) }
				// raw test for now, no auth:
				req.tab = sub.s[req.sub] || {};
				cb.header = {'Content-Type': sub.json};
				cb.header['Gun-Sub'] = req.tab.sub =
					req.sub = req.tab.sub || req.sub || Gun.text.random();
				gun.load(req.url.key, function(node){
					sub.scribe(req.tab, node._[Gun.sym.id]);
					cb({
						headers: cb.header
						,body: Gun.text.ify(node)
					});
				}).blank(function(){
					cb({
						headers: cb.header
						,body: Gun.text.ify(null)
					});
				}).dud(function(err){
					cb({
						headers: cb.header
						,body: Gun.text.ify({err: err || "Unknown error."})
					});
				});
			}
			sub.s = {};
			sub.scribe = function(tab, id){
				sub.s[tab.sub] = tab;
				tab.subs = tab.subs || {};
				tab.subs[id] = tab.subs[id] || gun.server.push.on(id).event(function(req){
					if(!req){ return }
					if(!tab){ return this.off() } // resolve any dangling callbacks
					req.sub = req.sub || req.headers['gun-sub'];
					if(req.sub === tab.sub){ return } // do not send back to the tab that sent it
					if(Gun.fns.is(tab.reply)){
						tab.reply({
							headers: {'Content-Type': sub.json, 'Gun-Sub': tab.sub}
							,body: Gun.text.ify(req.body)
						})
						tab.reply = null;
						return;
					}
					(tab.queue = tab.queue || []).push(req.body);
				});
			}
			sub.SLP = function(req, cb){ // Streaming Long Polling
				//console.log("<-- ", req.sub, req.transport ," -->");
				req.tab = sub.s[req.sub];
				if(!req.tab){
					cb({
						headers: {'Content-Type': sub.json, 'Gun-Sub': ''}
						,body: Gun.text.ify({err: "Please re-initialize sub."})
					});
					return;
				}
				req.tab.sub = req.tab.sub || req.sub;
				if(req.tab.queue && req.tab.queue.length){
					cb({ headers: {'Content-Type': sub.json, 'Gun-Sub': req.sub} });
					while(1 < req.tab.queue.length){
						cb({ chunk: Gun.text.ify(req.tab.queue.shift() + '\n') });
					}
					cb({ body: Gun.text.ify(req.tab.queue.shift()) });					
				} else {
					req.tab.reply = cb;
				}
			}
			sub.keyless = function(req, cb){
				cb({
					headers: {'Content-Type': sub.json}
					,body: {gun: true}
				});
			}
			sub.json = 'application/json';
			return sub;
		}());
		
		opt.hooks = opt.hooks || {};
		gun.opt({hooks: {
			load: opt.hooks.load || s3.load
			,set: opt.hooks.set || s3.set
			,key: opt.hooks.key || s3.key
			,sub: opt.hooks.sub || gun.server.sub
		}}, true);
	});
	meta.json = 'application/json';
	meta.JSON = function(res, data, multi){
		if(res && !res._headerSent){
			res.setHeader('Content-Type', meta.json);
		}
		if(!data && multi){
			res.write(Gun.text.ify(multi||'')+'\n');
			return;
		}
		return res.end(Gun.text.ify(data||''));
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