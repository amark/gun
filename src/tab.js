;(function(Tab){
	if(typeof window === "undefined"){ return }
		
	if(!window.JSON){ throw new Error("Include JSON first: ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js") } // for old IE use

	;(function(exports){
		function s(){}
		s.put = function(key, val, cb){ try{ store.setItem(key, Gun.text.ify(val)) }catch(e){if(cb)cb(e)} }
		s.get = function(key, cb){ /*setTimeout(function(){*/ try{ cb(null, Gun.obj.ify(store.getItem(key) || null)) }catch(e){cb(e)} /*},1)*/} 
		s.del = function(key){ return store.removeItem(key) }
		var store = this.localStorage || {setItem: function(){}, removeItem: function(){}, getItem: function(){}};
		exports.store = s;
	}.bind(this || module)(Tab));

	Gun.on('opt').event(function(gun, opt){
		opt = opt || {};
		var tab = gun.tab = gun.tab || {};
		tab.store = tab.store || Tab.store;
		tab.request = tab.request || request;
		tab.request.s = tab.request.s || {};
		tab.headers = opt.headers || {};
		tab.headers['gun-sid'] = tab.headers['gun-sid'] || Gun.text.random(); // stream id
		tab.prefix = tab.prefix || opt.prefix || 'gun/';
		tab.get = tab.get || function(lex, cb, opt){
			if(!lex){ return }
			var soul = lex[Gun._.soul];
			if(!soul){ return }
			cb = cb || function(){};
			(opt.headers = Gun.obj.copy(tab.headers)).id = tab.msg();
			(function local(soul, cb){
				tab.store.get(tab.prefix + soul, function(err, data){
					if(!data){ return } // let the peers handle no data.
					if(err){ return cb(err) }
					cb(err, cb.node = data); // node
					cb(err, Gun.is.node.soul.ify({}, Gun.is.node.soul(data))); // end
					cb(err, {}); // terminate
				});
			}(soul, cb));
			if(!(cb.local = opt.local)){
				tab.request.s[opt.headers.id] = tab.error(cb, "Error: Get failed!", function(reply){
					setTimeout(function(){ tab.put(Gun.is.graph.ify(reply.body), function(){}, {local: true, peers: {}}) },1); // and flush the in memory nodes of this graph to localStorage after we've had a chance to union on it.
				});
				Gun.obj.map(opt.peers || gun.__.opt.peers, function(peer, url){ var p = {};
					tab.request(url, lex, tab.request.s[opt.headers.id], opt);
					cb.peers = true;
				});
				var node = gun.__.graph[soul];
				if(node){
					tab.put(Gun.is.graph.ify(node));
				}
			} tab.peers(cb);
		}
		tab.put = tab.put || function(graph, cb, opt){
			//console.log("SAVE", graph);
			cb = cb || function(){};
			opt = opt || {};
			(opt.headers = Gun.obj.copy(tab.headers)).id = tab.msg();
			Gun.is.graph(graph, function(node, soul){
				if(!gun.__.graph[soul]){ return }
				tab.store.put(tab.prefix + soul, gun.__.graph[soul], function(err){if(err){ cb({err: err}) }});
			});
			if(!(cb.local = opt.local)){
				tab.request.s[opt.headers.id] = tab.error(cb, "Error: Put failed!");
				Gun.obj.map(opt.peers || gun.__.opt.peers, function(peer, url){
					tab.request(url, graph, tab.request.s[opt.headers.id], opt);
					cb.peers = true;
				});
			} tab.peers(cb);
		}
		tab.error = function(cb, error, fn){
			return function(err, reply){
				reply.body = reply.body || reply.chunk || reply.end || reply.write;
				if(err || !reply || (err = reply.body && reply.body.err)){
					return cb({err: Gun.log(err || error) });
				}
				if(fn){ fn(reply) }
				cb(null, reply.body);
			}
		}
		tab.peers = function(cb, o){
			if(Gun.text.is(cb)){ return (o = {})[cb] = {}, o }
			if(cb && !cb.peers){ setTimeout(function(){
				if(!cb.local){ if(!Gun.log.count('no-peers')){ Gun.log("Warning! You have no peers to connect to!") } }
				if(!(cb.graph || cb.node)){ cb(null) }
			},1)}
		}
		tab.msg = tab.msg || function(id){
			if(!id){
				return tab.msg.debounce[id = Gun.text.random(9)] = Gun.time.is(), id;
			}
			clearTimeout(tab.msg.clear);
			tab.msg.clear = setTimeout(function(){
				var now = Gun.time.is();
				Gun.obj.map(tab.msg.debounce, function(t,id){
					if(now - t < 1000 * 60 * 5){ return }
					Gun.obj.del(tab.msg.debounce, id);
				});
			},500);
			if(id = tab.msg.debounce[id]){ 
				return tab.msg.debounce[id] = Gun.time.is(), id;
			}
		};
		tab.msg.debounce = tab.msg.debounce || {};
		tab.server = tab.server || function(req, res){
			if(!req || !res || !req.body || !req.headers || !req.headers.id){ return }
			if(tab.request.s[req.headers.rid]){ return tab.request.s[req.headers.rid](null, req) }
			if(tab.msg(req.headers.id)){ return }
			// TODO: Re-emit message to other peers if we have any non-overlaping ones.
			if(req.headers.rid){ return } // no need to process
			if(Gun.is.lex(req.body)){ return tab.server.get(req, res) }
			else { return tab.server.put(req, res) }
		}
		tab.server.json = 'application/json';
		tab.server.regex = gun.__.opt.route = gun.__.opt.route || opt.route || /^\/gun/i;
		tab.server.get = function(req, cb){
			var soul = req.body[Gun._.soul], node;
			if(!(node = gun.__.graph[soul])){ return }
			var reply = {headers: {'Content-Type': tab.server.json, rid: req.headers.id, id: tab.msg()}};
			cb({headers: reply.headers, body: node});
		}
		tab.server.put = function(req, cb){
			var reply = {headers: {'Content-Type': tab.server.json, rid: req.headers.id, id: tab.msg()}}, keep;
			if(!req.body){ return cb({headers: reply.headers, body: {err: "No body"}}) }
			if(!Gun.obj.is(req.body, function(node, soul){
				if(gun.__.graph[soul]){ return true }
			})){ return }
			if(req.err = Gun.union(gun, req.body, function(err, ctx){
				if(err){ return cb({headers: reply.headers, body: {err: err || "Union failed."}}) }
				var ctx = ctx || {}; ctx.graph = {};
				Gun.is.graph(req.body, function(node, soul){ ctx.graph[soul] = gun.__.graph[soul] });
				gun.__.opt.wire.put(ctx.graph, function(err, ok){
					if(err){ return cb({headers: reply.headers, body: {err: err || "Failed."}}) }
					cb({headers: reply.headers, body: {ok: ok || "Persisted."}});
				}, {local: true, peers: {}});
			}).err){ cb({headers: reply.headers, body: {err: req.err || "Union failed."}}) }
		}
		Gun.obj.map(gun.__.opt.peers, function(){ // only create server if peers and do it once by returning immediately.
			return (tab.server.able = tab.server.able || tab.request.createServer(tab.server) || true);
		});
		gun.__.opt.wire.get = gun.__.opt.wire.get || tab.get;
		gun.__.opt.wire.put = gun.__.opt.wire.put || tab.put;
		gun.__.opt.wire.key = gun.__.opt.wire.key || tab.key;
	});

	var request = (function(){
		function r(base, body, cb, opt){
			opt = opt || (base.length? {base: base} : base);
			opt.base = opt.base || base;
			opt.body = opt.body || body;
			cb = cb || function(){};
			if(!opt.base){ return }
			r.transport(opt, cb);
		}
		r.createServer = function(fn){ r.createServer.s.push(fn) }
		r.createServer.ing = function(req, cb){
			var i = r.createServer.s.length;
			while(i--){ (r.createServer.s[i] || function(){})(req, cb) }
		}
		r.createServer.s = [];
		r.back = 2; r.backoff = 2;
		r.transport = function(opt, cb){
			//Gun.log("TRANSPORT:", opt);
			if(r.ws(opt, cb)){ return }
			r.jsonp(opt, cb);
		}
		r.ws = function(opt, cb){
			var ws, WS = window.WebSocket || window.mozWebSocket || window.webkitWebSocket;
			if(!WS){ return }
			if(ws = r.ws.peers[opt.base]){
				if(!ws.readyState){ return setTimeout(function(){ r.ws(opt, cb) },10), true }
				var req = {};
				if(opt.headers){ req.headers = opt.headers }
				if(opt.body){ req.body = opt.body }
				if(opt.url){ req.url = opt.url }
				req.headers = req.headers || {};
				r.ws.cbs[req.headers['ws-rid'] = 'WS' + (+ new Date()) + '.' + Math.floor((Math.random()*65535)+1)] = function(err,res){
					if(res.body || res.end){ delete r.ws.cbs[req.headers['ws-rid']] }
					cb(err,res);
				}
				ws.send(JSON.stringify(req));
				return true;
			}
			if(ws === false){ return }
			ws = r.ws.peers[opt.base] = new WS(opt.base.replace('http','ws'));
			ws.onopen = function(o){ r.back = 2; r.ws(opt, cb) };
			ws.onclose = window.onbeforeunload = function(c){
				if(!c){ return }
				if(ws && ws.close instanceof Function){ ws.close() }
				if(1006 === c.code){ // websockets cannot be used
					/*ws = r.ws.peers[opt.base] = false; // 1006 has mixed meanings, therefore we can no longer respect it.
					r.transport(opt, cb);
					return;*/
				}
				ws = r.ws.peers[opt.base] = null; // this will make the next request try to reconnect
				setTimeout(function(){
					r.ws(opt, function(){}); // opt here is a race condition, is it not? Does this matter?
				}, r.back *= r.backoff);
			};
			ws.onmessage = function(m){
				if(!m || !m.data){ return }
				var res;
				try{res = JSON.parse(m.data);
				}catch(e){ return }
				if(!res){ return }
				res.headers = res.headers || {};
				if(res.headers['ws-rid']){ return (r.ws.cbs[res.headers['ws-rid']]||function(){})(null, res) }
				//Gun.log("We have a pushed message!", res);
				if(res.body){ r.createServer.ing(res, function(res){ r(opt.base, null, null, res)}) } // emit extra events.
			};
			ws.onerror = function(e){ Gun.log(e); };
			return true;
		}
		r.ws.peers = {};
		r.ws.cbs = {};
		r.jsonp = function(opt, cb){
			//Gun.log("jsonp send", opt);
			r.jsonp.ify(opt, function(url){
				//Gun.log(url);
				if(!url){ return }
				r.jsonp.send(url, function(reply){
					//Gun.log("jsonp reply", reply);
					cb(null, reply);
					r.jsonp.poll(opt, reply);
				}, opt.jsonp);
			});
		}
		r.jsonp.send = function(url, cb, id){
			var js = document.createElement('script');
			js.src = url;
			window[js.id = id] = function(res){
				cb(res);
				cb.id = js.id;
				js.parentNode.removeChild(js);
				window[cb.id] = null; // TODO: BUG: This needs to handle chunking!
				try{delete window[cb.id];
				}catch(e){}
			}
			js.async = true;
			document.getElementsByTagName('head')[0].appendChild(js);
			return js;
		}
		r.jsonp.poll = function(opt, res){
			if(!opt || !opt.base || !res || !res.headers || !res.headers.poll){ return }
			(r.jsonp.poll.s = r.jsonp.poll.s || {})[opt.base] = r.jsonp.poll.s[opt.base] || setTimeout(function(){ // TODO: Need to optimize for Chrome's 6 req limit?
				//Gun.log("polling again");
				var o = {base: opt.base, headers: {pull: 1}};
				r.each(opt.headers, function(v,i){ o.headers[i] = v })
				r.jsonp(o, function(err, reply){
					delete r.jsonp.poll.s[opt.base];
					while(reply.body && reply.body.length && reply.body.shift){ // we're assuming an array rather than chunk encoding. :(
						var res = reply.body.shift();
						//Gun.log("-- go go go", res);
						if(res && res.body){ r.createServer.ing(res, function(){ r(opt.base, null, null, res) }) } // emit extra events.
					}
				});
			}, res.headers.poll);
		}
		r.jsonp.ify = function(opt, cb){
			var uri = encodeURIComponent, q = '?';
			if(opt.url && opt.url.pathname){ q = opt.url.pathname + q; }
			q = opt.base + q;
			r.each((opt.url||{}).query, function(v, i){ q += uri(i) + '=' + uri(v) + '&' });
			if(opt.headers){ q += uri('`') + '=' + uri(JSON.stringify(opt.headers)) + '&' }
			if(r.jsonp.max < q.length){ return cb() }
			q += uri('jsonp') + '=' + uri(opt.jsonp = 'P'+Math.floor((Math.random()*65535)+1));
			if(opt.body){
				q += '&';
				var w = opt.body, wls = function(w,l,s){
					return uri('%') + '=' + uri(w+'-'+(l||w)+'/'+(s||w))  + '&' + uri('$') + '=';
				}
				if(typeof w != 'string'){
					w = JSON.stringify(w);
					q += uri('^') + '=' + uri('json') + '&';
				}
				w = uri(w);
				var i = 0, l = w.length
				, s = r.jsonp.max - (q.length + wls(l.toString()).length);
				if(s < 0){ return cb() }
				while(w){
					cb(q + wls(i, (i = i + s), l) + w.slice(0, i));
					w = w.slice(i);
				}
			} else {
				cb(q);
			}
		}
		r.jsonp.max = 2000;
		r.each = function(obj, cb){
			if(!obj || !cb){ return }
			for(var i in obj){
				if(obj.hasOwnProperty(i)){
					cb(obj[i], i);
				}
			}
		}
		return r;
	}());
}({}));