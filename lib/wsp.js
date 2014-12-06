;(function(wsp){
	var Gun = require('gun/gun')
	, formidable = require('formidable')
	, ws = require('ws').Server
	, http = require('./http')
	, url = require('url');
	Gun.on('opt').event(function(gun, opt){
		gun.__.opt.ws = opt.ws = gun.__.opt.ws || opt.ws || {};
		gun.attach = gun.attach || function(app){
			if(app.use){
				app.use(gun.server);
			}
			var listen = app.listen;
			app.listen = function(port){
				var server = listen.apply(app, arguments);
				gun.__.opt.ws.server = gun.__.opt.ws.server || opt.ws.server || server;
				gun.__.opt.ws.path = gun.__.opt.ws.path || opt.ws.path || '/gun';
				require('./ws')(gun.server.websocket = gun.server.websocket || new ws(gun.__.opt.ws), function(req, res){
					var ws = this;
					req.headers['gun-tid'] = ws.tid = ws.tid? ws.tid : req.headers['gun-tid'];
					ws.sub = ws.sub || gun.server.on('network').event(function(msg){
						if(!ws || !ws.send){ return this.off() }
						if(!msg || (msg.headers && msg.headers['gun-tid'] === ws.tid)){ return }
						delete msg.wsrid; // depreciate this!
						ws.send(Gun.text.ify(msg));
					});
					gun.__.opt.hooks.transport(req, res);
				});
				gun.__.opt.ws.port = port || opt.ws.port || gun.__.opt.ws.port || 80;
				return server;
			}
			return gun;
		}
		gun.server = gun.server || function(req, res, next){
			//console.log("\n\n GUN SERVER!", req);
			next = next || function(){};
			if(!req || !res){ return next() }
			if(!req.url){ return next() }
			if(!req.method){ return next() }
			var msg = {};
			msg.url = url.parse(req.url, true);
			if(!gun.server.regex.test(msg.url.pathname)){ return next() }
			if(msg.url.pathname.replace(gun.server.regex,'').slice(0,3).toLowerCase() === '.js'){
				res.writeHead(200, {'Content-Type': 'text/javascript'});
				res.end(gun.server.js = gun.server.js || require('fs').readFileSync(__dirname + '/../gun.js')); // gun server is caching the gun library for the client
				return;
			}
			http(req, res, function(req, res){
				if(!req){ return next() }
				var tab, cb = res = require('./jsonp')(req, res);
				if(req.headers && (tab = req.headers['gun-tid'])){
					tab = (gun.server.peers = gun.server.peers || {})[tab] = gun.server.peers[tab] || {tid: tab};
					tab.sub = tab.sub || gun.server.on('network').event(function(req){
						if(!tab){ return this.off() } // self cleans up after itself!
						if(!req || (req.headers && req.headers['gun-tid'] === tab.tid)){ return }
						(tab.queue = tab.queue || []).push(req);
						tab.drain(tab.reply);
					});
					cb = function(r){ (r.headers||{}).poll = gun.__.opt.poll; res(r) }
					tab.drain = tab.drain || function(res){
						if(!res || !tab || !tab.queue || !tab.queue.length){ return }
						res({headers: {'gun-tid': tab.tid}, body: tab.queue });
						tab.off = setTimeout(function(){ tab = null }, gun.__.opt.pull);
						tab.reply = tab.queue = null;
						return true;
					}
					clearTimeout(tab.off);
					if(req.headers.pull){
						if(tab.drain(cb)){ return }
						return tab.reply = cb;
					}
				}
				gun.__.opt.hooks.transport(req, cb);
			});
		}
		gun.server.on = gun.server.on || Gun.on.create();
		gun.__.opt.poll = gun.__.opt.poll || opt.poll || 1;
		gun.__.opt.pull = gun.__.opt.pull || opt.pull || gun.__.opt.poll * 1000;
		gun.server.regex = gun.__.opt.route = gun.__.opt.route || opt.route || /^\/gun/i;
		if((gun.__.opt.maxSockets = opt.maxSockets || gun.__.opt.maxSockets) !== false){ 
			require('https').globalAgent.maxSockets = require('http').globalAgent.maxSockets = gun.__.opt.maxSockets || Infinity; // WARNING: Document this!
		}
		/* gun.server.xff = function(r){
			if(!r){ return '' }
			var req = {headers: r.headers || {}, connection: r.connection || {}, socket: r.socket || {}}; 
			return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket || {}).remoteAddress || '';
		} */
		gun.server.transport = gun.server.transport || (function(){
			// all streams, technically PATCH but implemented as POST, are forwarded to other trusted peers
			// except for the ones that are listed in the message as having already been sending to.
			// all states, implemented with GET, are replied to the source that asked for it.
			function tran(req, cb){
				//console.log("gun.server", req);
				req.method = req.body? 'post' : 'get'; // post or get is based on whether there is a body or not
				req.url.key = req.url.pathname.replace(gun.server.regex,'').replace(/^\//i,'') || '';
				if('get' == req.method){ return tran.load(req, cb) }
				if('post' == req.method){ return tran.post(req, cb) }
				cb({body: {hello: 'world'}});
			}
			tran.load = function(req, cb){
				var key = req.url.key
				, reply = {headers: {'Content-Type': tran.json}};
				if(!key){
					if(!Gun.obj.has(req.url.query, Gun._.soul)){
						return cb({headers: reply.headers, body: {err: "No key or soul to load."}});
					}
					key = {};
					key[Gun._.soul] = req.url.query[Gun._.soul];
				}
				gun.load(key, function(err, node){
					//tran.sub.scribe(req.tab, node._[Gun._.soul]);
					cb({headers: reply.headers, body: (err? (err.err? err : {err: err || "Unknown error."}) : node || null)});
				});
			}
			tran.post = function(req, cb){
				// NOTE: It is highly recommended you do your own POSTs through your own API that then saves to gun manually.
				// This will give you much more fine-grain control over security, transactions, and what not.
				var reply = {headers: {'Content-Type': tran.json}};
				if(!req.body){ return cb({headers: reply.headers, body: {err: "No body"}}) }
				if(req.url.key && Gun.obj.has(req.body, Gun._.soul)){ // key hook!
					console.log("TODO: BUG! IMPLEMENT KEY TRANSPORT HOOK!");
					return;
				}
				// saving
				Gun.obj.map(req.body, function(node, soul){
					if(soul != Gun.is.soul.on(node)){ return this.end("No soul!") }
					gun.load(node._, this.add(soul));
				}, Gun.fns.sum(function(err){
					if(err){ return cb({headers: reply.headers, body: {err: err}}) }
					gun.union(req.body, function(err, context){
						if(err || context.err || !context.nodes){ return cb({headers: reply.headers, body: {err: err || context.err || "Union failed." }}) }
						if(!Gun.fns.is(gun.__.opt.hooks.set)){ return cb({headers: reply.headers, body: {err: "Persistence not supported." }}) }
						gun.__.opt.hooks.set(context.nodes, function(err, data){ // since we've already manually done the union, we can now directly call the persistence layer.
							if(err){ return cb({headers: reply.headers, body: {err: err || "Persistence failed." }}) }
							cb({headers: reply.headers, body: {ok: "Persisted."}});
						});
					});
				}));
				gun.server.on('network').emit(req);
			}
			gun.server.on('network').event(function(req){
				// TODO: MARK! You should move the networking events to here, not in WSS only.
			});
			tran.json = 'application/json';
			return tran;
		}());
		
		opt.hooks = opt.hooks || {};
		gun.opt({hooks: {
			transport: opt.hooks.transport || gun.server.transport
		}}, true);
	});
}({}));