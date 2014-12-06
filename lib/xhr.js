;(function(){
	var Gun = require('gun/gun')
	, formidable = require('formidable')
	, url = require('url')
	, meta = {};
	Gun.on('opt').event(function(gun, opt){
		gun.server = gun.server || function(req, res, next){ // this whole function needs refactoring and modularization	
			//console.log("\n\n GUN SERVER!");
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
					if(Gun.obj.has(reply,'chunk')){
						res.write(Gun.text.ify(reply.chunk) || '');
					}
					if(Gun.obj.has(reply,'body')){
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
		if(!gun.__.opt.keepMaxSockets){ require('https').globalAgent.maxSockets = require('http').globalAgent.maxSockets = Infinity } // WARNING: Document this!
		
		gun.server.transport = (function(){
			function tran(req, cb){
				//console.log(req);
				req.sub = req.headers['gun-sub']; // grab the sub
				req.tab = tran.sub.s[req.sub] || {}; // check to see if there already is a tab associated with it, or create one
				req.tab.sub = req.sub = req.sub || Gun.text.random(); // Generate a session id if we don't already have one
				req.tran = tran.xhr(req, cb) || tran.jsonp(req, cb); // polyfill transport layer
				clearTimeout(req.tab.timeout);
				// raw test for now, no auth:
				if(!req.tran){ return cb({headers: {"Content-Type": tran.json}, body: {err: "No transport layer!"}}) }
				if('post' === req.method || 'patch' === req.method){ return tran.post(req, req.tran) } // TODO: Handle JSONP emulated POST via GET
				if('get' !== req.method){ return req.tran({body: {err: "Invalid method"}}) }
				if(!req.url.key){ return tran.sub(req, req.tran) } // get acts as sub, too.
				return tran.load(req, req.tran); // else load the state for the tab!
			}
			tran.load = function(req, cb){
				var reply = {}, key;
				reply.headers = {'Content-Type': tran.json};
				reply.headers['Gun-Sub'] = req.tab.sub = req.sub;
				key = (Gun._.meta == req.url.key)? req.url.query : req.url.key;
				console.log("Loading", req.url.key, 'for', req.tab);
				gun.load(key, function(node){
					tran.sub.scribe(req.tab, node._[Gun._.soul]);
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
				if(req.url.key && Gun.obj.has(req.body, Gun._.soul)){ // key hook!
					req.tab = tran.sub.s[req.sub] || {};
					req.tab.sub = req.sub;
					console.log("key.hook", req.tab);
					tran.sub.scribe(req.tab, req.body[Gun._.soul]);
					return gun.load(req.body).get(function(frozen){
						// NEED to allow a security callback so server can tamper with this!
						this.key(req.url.key, function(err, reply){
							reply = reply || {};
							if(err){ reply.err = err }
							reply = {body: reply};
							reply.headers = {'Content-Type': tran.json};
							reply.headers['Gun-Sub'] = req.tab.sub;
							cb(reply);
						});
					}); // do I need to handle the blank case? :/ Not sure.
				}
				// raw test for now, no auth:
				// should probably load all the nodes first? YES.
				var context = gun.union(req.body, function(err, context){ // data safely transformed
					cb = cb || function(){};
					if(err || context.err){ return cb({body: {err: context.err}}) }
					if(Gun.fns.is(gun.__.opt.hooks.set)){
						gun.__.opt.hooks.set(context.nodes, function saved(err, data){ // now iterate through those nodes to S3 and get a callback once all are saved
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
							clearTimeout(now.timeout);
							now.body = now.body || {}; // make sure we have a body for our multi-response in a single response.
							if(req.wait){ // did this request get deferred?
								(now.body.refed = now.body.refed || {})[req.wait] = err? {err: err} : defer.map({}, context.nodes, 1); // then reply to it "here".
							} else {
								now.body.reply = err? {err: err} : defer.map({}, context.nodes, 1); // else this is the original POST that had to be upgraded.
							}
							if(0 < (now.count = ((now.count || 0) - 1))){ 
								// Don't reply till all deferred POSTs have successfully heard back from S3. (Sarcasm: Like counting guarantees that)
								return now.timeout = setTimeout(saved, gun.__.opt.throttle * 2 * 1000); // reply not guaranteed, so time it out, in seconds.
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
							Gun.obj.map(nodes, function(node, soul, map){
								now[soul] = val;
							});
							return now;
						}
						defer(context.nodes, req); // actually do the weird stuff to make Chrome not be slow
					} else {
						context.err = "Warning! You have no persistence layer to save to!";
						Gun.log(context.err);
						cb({body: {err: "Server has no persistence layer!"}});
					}
				});
				if(context.err){ 
					cb({body: {err: context.err}});
					return cb = null;
				}
				Gun.obj.map(context.nodes, function(node, soul){ // live push the stream out in realtime to every tab subscribed
					var msg = {};
					msg.headers = req.headers; // polyfill the delta as its own message.
					msg.body = node;
					console.log("emit delta", soul);
					tran.push(soul).emit(msg); 
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
					tran.clean(req.tab); // We flush their data now, if they don't come back for more within timeout, we remove their session
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
			tran.clean = function(tab, mult){
				if(!tab){ return }
				mult = mult || 1;
				clearTimeout(tab.timeout);
				tab.timeout = setTimeout(function(){
					if(!tab){ return }
					if(tab.reply){ tab.reply({body: {err: "Connection timed out"}}) }
					console.log("!!!! DISCONNECTING CLIENT !!!!!", tab.sub);
					Gun.obj.del(tran.sub.s, tab.sub)
				}, gun.__.opt.disconnect * mult * 1000); // in seconds
			}
			tran.sub.scribe = function(tab, soul){
				tran.sub.s[tab.sub] = tab;
				tab.subs = tab.subs || {};
				console.log("meow subscribes", soul);
				tab.subs[soul] = tab.subs[soul] || tran.push(soul).event(function(req){
					if(!req){ return }
					if(!tab){ return this.off() } // resolve any dangling callbacks
					req.sub = req.sub || req.headers['gun-sub'];
					if(req.sub === tab.sub){ return } // do not send back to the tab that sent it
					console.log('FROM:', req.sub, "TO:", tab.sub);
					tran.clean(tab);
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
				tran.clean(tab, 2);
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
					if(Gun.obj.has(res,'chunk')){
						cb({
							headers: reply.headers
							,chunk:  Gun.text.ify(res.chunk) + '\n'
						})
					}
					if(Gun.obj.has(res,'body')){
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
					if(Gun.obj.has(res,'chunk') && (!reply.body || Gun.list.is(reply.chunks))){
						(reply.chunks = reply.chunks || []).push(res.chunk);
					}
					if(Gun.obj.has(res,'body')){
						reply.body = res.body; // self-reference yourself so on the client we can get the headers and body.
						reply.body = ';'+ cb.jsonp + '(' + Gun.text.ify(reply) + ');'; // javascriptify it! can't believe the client trusts us.
						cb(reply);
					}
				}
			}
			tran.json = 'application/json';
			tran.push = Gun.on.create();
			return tran;
		}());
		
		opt.hooks = opt.hooks || {};
		gun.opt({hooks: {
			transport: opt.hooks.transport || gun.server.transport
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
}());