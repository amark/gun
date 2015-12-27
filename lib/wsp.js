;(function(wsp){
	var Gun = require('../gun')
	, formidable = require('formidable')
	, ws = require('ws').Server
	, http = require('./http')
	, url = require('url');
	Gun.on('opt').event(function(gun, opt){
		gun.__.opt.ws = opt.ws = gun.__.opt.ws || opt.ws || {};
		function start(server, port){
			gun.__.opt.ws.server = gun.__.opt.ws.server || opt.ws.server || server;
			if(server.use){ server.use(gun.__.opt.ws.server) }
			require('./ws')(gun.wsp.ws = gun.wsp.ws || new ws(gun.__.opt.ws), function(req, res){
				var ws = this;
				req.headers['gun-sid'] = ws.sid = ws.sid? ws.sid : req.headers['gun-sid'];
				ws.sub = ws.sub || gun.wsp.on('network').event(function(msg){
					if(!ws || !ws.send || !ws._socket || !ws._socket.writable){ return this.off() }
					if(!msg || (msg.headers && msg.headers['gun-sid'] === ws.sid)){ return }
					if(msg && msg.headers){ delete msg.headers['ws-rid'] }
					// TODO: BUG? ^ What if other peers want to ack? Do they use the ws-rid or a gun declared id?
					try{ws.send(Gun.text.ify(msg));
					}catch(e){} // juuuust in case. 
				});
				gun.wsp.wire(req, res);
			});
			gun.__.opt.ws.port = gun.__.opt.ws.port || opt.ws.port || port || 80;
		}
		var wsp = gun.wsp = gun.wsp || function(server){
			if(!server){ return gun }
			if(Gun.fns.is(server.address)){
				if(server.address()){
					start(server, server.address().port);
					return gun;
				}
			}
			var listen = server.listen;
			server.listen = function(port){
				var serve = listen.apply(server, arguments);
				start(serve, port);
				return serve;
			}
			return gun;
		}
		gun.wsp.on = gun.wsp.on || Gun.on.create();
		gun.wsp.regex = gun.wsp.regex || opt.route || opt.path || /^\/gun/i;
		gun.wsp.poll = gun.wsp.poll || opt.poll || 1;
		gun.wsp.pull = gun.wsp.pull || opt.pull || gun.wsp.poll * 1000;
		gun.wsp.server = gun.wsp.server || function(req, res, next){ // http
			next = next || function(){};
			if(!req || !res){ return next(), false }
			if(!req.url){ return next(), false }
			if(!req.method){ return next(), false }
			var msg = {};
			msg.url = url.parse(req.url, true);
			if(!gun.wsp.regex.test(msg.url.pathname)){ return next(), false } // TODO: BUG! If the option isn't a regex then this will fail!
			if(msg.url.pathname.replace(gun.wsp.regex,'').slice(0,3).toLowerCase() === '.js'){
				res.writeHead(200, {'Content-Type': 'text/javascript'});
				res.end(gun.wsp.js = gun.wsp.js || require('fs').readFileSync(__dirname + '/../gun.js')); // gun server is caching the gun library for the client
				return true;
			}
			return http(req, res, function(req, res){
				if(!req){ return next() }
				var stream, cb = res = require('./jsonp')(req, res);
				if(req.headers && (stream = req.headers['gun-sid'])){
					stream = (gun.wsp.peers = gun.wsp.peers || {})[stream] = gun.wsp.peers[stream] || {sid: stream};
					stream.sub = stream.sub || gun.wsp.on('network').event(function(req){
						if(!stream){ return this.off() } // self cleans up after itself!
						if(!req || (req.headers && req.headers['gun-sid'] === stream.sid)){ return }
						(stream.queue = stream.queue || []).push(req);
						stream.drain(stream.reply);
					});
					cb = function(r){ (r.headers||{}).poll = gun.wsp.poll; res(r) }
					stream.drain = stream.drain || function(res){
						if(!res || !stream || !stream.queue || !stream.queue.length){ return }
						res({headers: {'gun-sid': stream.sid}, body: stream.queue });
						stream.off = setTimeout(function(){ stream = null }, gun.wsp.pull);
						stream.reply = stream.queue = null;
						return true;
					}
					clearTimeout(stream.off);
					if(req.headers.pull){
						if(stream.drain(cb)){ return }
						return stream.reply = cb;
					}
				}
				gun.wsp.wire(req, cb);
			}), true;
		}
		if((gun.__.opt.maxSockets = opt.maxSockets || gun.__.opt.maxSockets) !== false){
			require('https').globalAgent.maxSockets = require('http').globalAgent.maxSockets = gun.__.opt.maxSockets || Infinity;
		}
		gun.wsp.wire = gun.wsp.wire || (function(){
			// all streams, technically PATCH but implemented as PUT or POST, are forwarded to other trusted peers
			// except for the ones that are listed in the message as having already been sending to.
			// all states, implemented with GET, are replied to the source that asked for it.
			function tran(req, cb){
				req.method = req.body? 'put' : 'get'; // put or get is based on whether there is a body or not
				req.url.key = req.url.pathname.replace(gun.wsp.regex,'').replace(/^\//i,'') || '';
				if('get' == req.method){ return tran.get(req, cb) }
				if('put' == req.method || 'post' == req.method){ return tran.put(req, cb) }
				cb({body: {hello: 'world'}});
			}
			tran.get = function(req, cb){
				var key = req.url.key
				, reply = {headers: {'Content-Type': tran.json}};
				//console.log(req);
				// NTS HACK! SHOULD BE ITS OWN ISOLATED MODULE! //
				if(req && req.url && req.url.pathname && req.url.pathname.indexOf('gun.nts') >= 0){
					return cb({headers: reply.headers, body: {time: Gun.time.is() }});
				}
				// NTS END! SHOULD HAVE BEEN ITS OWN MODULE //
				// ALL HACK! SHOULD BE ITS OWN MODULE OR CORE? //
				if(req && req.url && Gun.obj.has(req.url.query, '*')){
					return gun.all(req.url.key + req.url.search, function(err, list){
						cb({headers: reply.headers, body: (err? (err.err? err : {err: err || "Unknown error."}) : list || null ) })
					});
				}
				// END ALL HACK! //
				if(!key){
					if(!Gun.obj.has(req.url.query, Gun._.soul)){
						return cb({headers: reply.headers, body: {err: "No key or soul to get."}});
					}
					key = {};
					key[Gun._.soul] = req.url.query[Gun._.soul];
				}
				console.log("tran.get", key);
				gun.__.opt.wire.get(key, function(err, node){
					//tran.sub.scribe(req.tab, graph._[Gun._.soul]);
					console.log("tran.get", key, "<---", err, node);
					if(err || !node){
						return cb({headers: reply.headers, body: (err? (err.err? err : {err: err || "Unknown error."}) : null)});
					}
					if(Gun.obj.empty(node)){ return cb({headers: reply.headers, body: node}) } // we're out of stuff!
					
					/*
					(function(chunks){// FEATURE! Stream chunks if the nodes are large!
						var max = 10;
						Gun.is.graph(graph, function(node, soul){
							var chunk = {};
							if(Object.keys(node).length > max){
								var count = 0, n = Gun.union.pseudo(soul);
								Gun.obj.map(node, function(val, field){
									if(!(++count % max)){
										console.log("Sending chunk", chunk);
										cb({headers: reply.headers, chunk: chunk});
										n = Gun.union.pseudo(soul);
										chunk = {};
									}
									chunk[soul] = n;
									n[field] = val;
									(n._[Gun._.HAM] = n._[Gun._.HAM] || {})[field] = ((node._||{})[Gun._.HAM]||{})[field];
								});
								if(count % max){ // finish off the last chunk
									cb({headers: reply.headers, chunk: chunk});
								}
							} else {
								chunk[soul] = node;
								console.log("Send BLOB", chunk);
								cb({headers: reply.headers, chunk: chunk});
							}
						});
					}([]));
					*/
					cb({headers: reply.headers, chunk: node }); // Use this if you don't want streaming chunks feature.
				});
			}
			tran.put = function(req, cb){
				// NOTE: It is highly recommended you do your own PUT/POSTs through your own API that then saves to gun manually.
				// This will give you much more fine-grain control over security, transactions, and what not.
				var reply = {headers: {'Content-Type': tran.json}};
				if(!req.body){ return cb({headers: reply.headers, body: {err: "No body"}}) }
				gun.wsp.on('network').emit(Gun.obj.copy(req));
				console.log("tran.put", req.body);					
				if(Gun.is.graph(req.body)){
					if(req.err = Gun.union(gun, req.body, function(err, ctx){ // TODO: BUG? Probably should give me ctx.graph
						if(err){ return cb({headers: reply.headers, body: {err: err || "Union failed."}}) }
						var ctx = ctx || {}; ctx.graph = {};
						Gun.is.graph(req.body, function(node, soul){
							ctx.graph[soul] = gun.__.graph[soul];
						});
						(gun.__.opt.wire.put || function(g,cb){cb("No save.")})(ctx.graph, function(err, ok){
							if(err){ return cb({headers: reply.headers, body: {err: err || "Failed."}}) } // TODO: err should already be an error object?
							cb({headers: reply.headers, body: {ok: ok || "Persisted."}});
						});
					}).err){ cb({headers: reply.headers, body: {err: req.err || "Union failed."}}) }
				} else {
					cb({headers: reply.headers, body: {err: "Not a valid graph!"}});
				}
			}
			gun.wsp.on('network').event(function(req){
				// TODO: MARK! You should move the networking events to here, not in WSS only.
			});
			tran.json = 'application/json';
			return tran;
		}());
		if(opt.server){
			wsp(opt.server);
		}
	});
}({}));