;(function(){
	var Gun = require(__dirname+'/gun')
	, S3 = require(__dirname+'/gate/s3') // redis has been removed, can be replaced with a disk system
	, formidable = require('formidable')
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
			msg.url.key = msg.url.key.replace(/^\//i,'') || ''; // strip the base slash
			msg.method = (req.method||'').toLowerCase();
			msg.headers = req.headers;
			var body
			,	form = new formidable.IncomingForm()
			,	post = function(err, body){
				msg.body = body;
				gun.__.opt.hooks.transport(msg, function(reply){
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
						res.write(Gun.text.ify(reply.chunk) || '');
					}
					if(reply.body){
						res.end(Gun.text.ify(reply.body) || '');
					}
				});
			}
			form.on('field',function(k,v){
				(body = body || {})[k] = v;
			}).on('file',function(k,v){
				return; // files not supported in gun yet
			}).on('error',function(e){
				if(form.done){ return }
				post(e);
			}).on('end', function(){
				if(form.done){ return }
				post(null, body);
			});
			form.parse(req);
		}
		gun.server.regex = /^\/gun/i;
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
		
		gun.server.transport = (function(){
			function tran(req, cb){
				//console.log("\n\n\n", req);
				req.sub = req.headers['gun-sub']; // grab the sub
				req.tab = tran.sub.s[req.sub] || {}; // check to see if there already is a tab associated with it, or create one
				req.tab.sub = req.sub = req.sub || Gun.text.random(); // Generate a session id if we don't already have one
				req.tran = tran.xhr(req, cb) || tran.jsonp(req, cb); // polyfill transport layer
				// raw test for now, no auth:
				if(!req.tran){ return cb({headers: {"Content-Type": tran.json}, body: {err: "No transport layer!"}}) }
				if('post' === req.method || 'patch' === req.method){ return tran.post(req, req.tran) } // TODO: Handle JSONP emulated POST via GET
				if('get' !== req.method){ return req.tran({body: {err: "Invalid method"}}) }
				if(!req.url.key){ return tran.sub(req, req.tran) } // get acts as sub, too.
				return tran.load(req, req.tran); // else load the state for the tab!
			}
			tran.load = function(req, cb){
				var reply = {};
				reply.headers = {'Content-Type': tran.json};
				reply.headers['Gun-Sub'] = req.tab.sub = req.sub;
				gun.load(req.url.key, function(node){
					console.log("Loading for", req.tab);
					tran.sub.scribe(req.tab, node._[Gun.sym.id]);
					cb({
						headers: reply.headers
						,body: node
					});
				}).blank(function(){
					cb({
						headers: reply.headers
						,body: null
					});
				}).dud(function(err){
					cb({
						headers: reply.headers
						,body: {err: err || "Unknown error."}
					});
				});
			}
			tran.post = function(req, cb){ // post is used as patch, sad that patch has such poor support
				if(!req.body){ return cb({body: {err: "No body"}}) }
				// raw test for now, no auth:
				// should probably load all the nodes first? YES.
				var context = Gun.chain.set.now.union.call(gun, req.body); // data safely transformed
				//console.log("body?", req.body, context.err);
				if(context.err){ return cb({body: {err: context.err}}) }
				// WARNING! TODO: BUG! Do not send OK confirmation if amnesiaQuaratine is activated! Not until after it has actually been processed!!!
				if(Gun.fns.is(gun.__.opt.hooks.set)){
					gun.__.opt.hooks.set(context.nodes, function(err, data){ // now iterate through those nodes to S3 and get a callback once all are saved
						var body = {};
						if(err){ 
							body.err = err ;
						}
						if(!req.sub){
							if(!err){
								body = defer.map({}, context.nodes, 1);
							}
							return cb({body: body});
						}
						var now = tran.post.s[req.sub]; // begin our stupid Chrome fix, we should abstract this out into defer (where it belogns) to keep things clean.
						if(!now){ return } // utoh we've lost our reply to the tab!
						now.body = now.body || {}; // make sure we have a body for our multi-response in a single response.
						if(req.wait){ // did this request get deferred?
							(now.body.refed = now.body.refed || {})[req.wait] = err? {err: err} : defer.map({}, context.nodes, 1); // then reply to it "here".
						} else {
							now.body.reply = err? {err: err} : defer.map({}, context.nodes, 1); // else this is the original POST that had to be upgraded.
						}
						if(0 < (now.count = ((now.count || 0) - 1))){ // Don't reply till all deferred POSTs have successfully heard back from S3. (Sarcasm: Like counting guarantees that)
							return; // TODO: BUG!!! Memory leak, we have no guarantee we'll ever get a reply! So time it out, maybe some multiple of the S3 throttle.
						}
						if(Gun.fns.is(now)){
							now({body: now.body}); // FINALLY reply for ALL the POSTs for that session that accumulated.
						} else {
							// console.log("Error! We deleted our response!");
						}
						Gun.obj.del(tran.post.s, req.sub); // clean up our memory.
						// need to rewrite that if Stream is enabled that both Stream + State save are guaranteed before replying.
					});
					// stuff past this point is just stupid implementation optimizations.
					function defer(nodes, req){ // because Chrome can only handle 4 requests at a time, sad face.
						if(!req.sub){
							return;
						}
						var next = tran.post.s[req.sub];
						if(!next){ // was there a previous POST? If not, we become the previous POST.
							//cb({chunk: ''}); // because on some services (heroku) you need to reply starting a stream to keep the connection open.
							return tran.post.s[req.sub] = cb;
						}
						next.count = (next.count || 1) + 1; // start counting how many we accumulate
						next.body = next.body || {}; // this becomes the polyfill for all the posts
						next.body.refed = next.body.refed || {}; // where we refeed the responses for the deferred POSTs.
						req.wait = Gun.text.random(); // generate an random id for this deferred POST.
						next.body.refed[req.wait] = false; // establish that we are incomplete.
						cb({body: {defer: req.wait}}); // end this POST immediately so Chrome only ever uses a couple connections.
						cb = null; // null it out so we don't accidentally reply to it once we hear back from S3.
					}
					defer.map = function(now, nodes, val){ // shortcut for maping which nodes were saved successfully
						if(!now){ return }
						Gun.obj.map(nodes, function(node, id, map){
							now[id] = val;
						});
						return now;
					}
					defer(context.nodes, req); // actually do the weird stuff to make Chrome not be slow
				} else {
					context.err = "Warning! You have no persistence layer to save to!";
					Gun.log(context.err);
					cb({body: {err: "Server has no persistence layer!"}});
				}
				Gun.obj.map(context.nodes, function(node, id){ // live push the stream out in realtime to every tab subscribed
					var msg = {};
					msg.headers = req.headers; // polyfill the delta as its own message.
					msg.body = node;
					//console.log("emit delta", id);
					tran.push.on(id).emit(msg); 
				});
			}
			tran.post.s = {};
			tran.sub = function(req, cb){
				//console.log("<-- ", req.sub, req.tran ," -->");
				req.tab = tran.sub.s[req.sub];
				if(!req.tab){
					cb({
						headers: {'Gun-Sub': ''}
						,body: {err: "Please re-initialize sub."}
					});
					return;
				}
				//console.log("\n\n\n THE CURRENT STATUS IS");console.log(req.tab);
				if(req.tab.queue && req.tab.queue.length){
					console.log("_____ NOW PUSHING YOUR DATA ______", req.sub);
					cb({ headers: {'Gun-Sub': req.sub} });
					while(1 < req.tab.queue.length){
						cb({ chunk: req.tab.queue.shift() });
					}
					cb({ body: req.tab.queue.shift() });					
				} else {
					cb({chunk: ''}); // same thing as the defer code, initialize a stream to support some services (heroku).
					req.tab.reply = cb;
					console.log("_____ STANDING BY, WAITING FOR DATA ______", req.sub);
				}
			}
			tran.sub.s = {};
			tran.sub.scribe = function(tab, id){ // TODO: BUG!!! Memory leaks, remember to destroy sessions via timeout.
				tran.sub.s[tab.sub] = tab;
				tab.subs = tab.subs || {};
				tab.subs[id] = tab.subs[id] || tran.push.on(id).event(function(req){
					if(!req){ return }
					if(!tab){ return this.off() } // resolve any dangling callbacks
					req.sub = req.sub || req.headers['gun-sub'];
					if(req.sub === tab.sub){ return } // do not send back to the tab that sent it
					console.log('FROM:', req.sub, "TO:", tab);
					if(tab.reply){
						tab.reply({
							headers: {'Gun-Sub': tab.sub}
							,body: req.body
						});
						tab.reply = null;
						return;
					}
					(tab.queue = tab.queue || []).push(req.body);
				});
			}
			tran.xhr = function(req, cb){ // Streaming Long Polling
				return req.tran || (req.headers['x-requested-with'] === 'XMLHttpRequest'? transport : null);
				function transport(res){
					if(!res){ return }
					var reply = {headers: {}};
					if(res.headers){
						Gun.obj.map(res.headers, function(val, field){
							reply.headers[field] = val;
						});
					}
					reply.headers["Content-Type"] = tran.json;
					if(res.chunk){
						cb({
							headers: reply.headers
							,chunk:  Gun.text.ify(res.chunk) + '\n'
						})
					}
					if(res.body){
						cb({
							headers: reply.headers
							,body: Gun.text.ify(res.body)
						})
					}
				}
			}
			tran.jsonp = function(req, cb){
				var reply = {headers: {}};
				if(req.tran || req.headers['x-requested-with']){ return }
				if((req.url.query||{}).jsonp){
					cb.jsonp = req.url.query.jsonp;
					Gun.obj.del(req.url.query, 'jsonp');
					req.headers['x-requested-with'] = 'jsonp'; // polyfill
					req.sub = req.headers['gun-sub'] = req.headers['gun-sub'] || req.url.query['Gun-Sub'] || req.url.query['gun-sub'];
					Gun.obj.del(req.url.query, 'Gun-Sub');
					Gun.obj.del(req.url.query, 'gun-sub');
					return transport;
				}
				function transport(res){
					if(!res){ return }
					if(res.headers){
						Gun.obj.map(res.headers, function(val, field){
							reply.headers[field] = val;
						});
					}
					if(res.chunk && (!reply.body || Gun.list.is(reply.chunks))){
						(reply.chunks = reply.chunks || []).push(res.chunk);
					}
					if(res.body){
						reply.body = res.body; // self-reference yourself so on the client we can get the headers and body.
						reply.body = ';'+ cb.jsonp + '(' + Gun.text.ify(reply) + ');'; // javascriptify it! can't believe the client trusts us.
						cb(reply);
					}
				}
			}
			tran.json = 'application/json';
			tran.push = Gun.on.split();
			return tran;
		}());
		
		opt.hooks = opt.hooks || {};
		gun.opt({hooks: {
			load: opt.hooks.load || s3.load
			,set: opt.hooks.set || s3.set
			,key: opt.hooks.key || s3.key
			,transport: opt.hooks.transport || gun.server.transport
		}}, true);
	});
	meta.json = 'application/json';
	meta.JSON = function(res, data, multi){
		if(res && !res._headerSent){
			res.setHeader('Content-Type', meta.json);
		}
		if(!data && multi){
			res.write(Gun.text.ify(multi||'') + '\n');
			return;
		}
		return res.end(Gun.text.ify(data||''));
	};
	meta.CORS = function(req, res){
		if(!res || res.CORSHeader || res._headerSent){ return }
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Methods", ["POST", "GET", "PUT", "DELETE", "OPTIONS"]);
		res.setHeader("Access-Control-Allow-Credentials", false);
		res.setHeader("Access-Control-Max-Age", 1000 * 60 * 60 * 24);
		res.setHeader("Access-Control-Allow-Headers", ["X-Requested-With", "X-HTTP-Method-Override", "Content-Type", "Accept", "Gun-Sub"]);
		res.setHeader("Access-Control-Expose-Headers", ["Content-Type", "Gun-Sub"]);
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