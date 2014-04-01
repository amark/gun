module.exports=require('theory')((function(){
	var web = {};
	web.name = 'web';
	web.version = 1.9;
	web.author = 'Mark';
	web.dependencies = [
		'fs'
		,'url'
		,'path'
		,'http'
		,'https'
		,'child_process'
	];
	web.init = (function(a){
		function web(opt){
			return web.configure(opt);
		} var	fs = a.fs
		,	path = a.path
		,	URL = a.url;
		web.opt = {};
		web.configure = (function(opt){
			if(opt.how){ return }
			module.reqdir = a.path.dirname((module.parent||{}).filename);
			opt = a.obj.is(opt)? opt : {};
			opt.host = opt.host||'localhost';
			opt.port = opt.port||80;
			opt.dir = opt.dir || module.reqdir || __dirname;
			if(a.bi.is(opt.sec)){
				opt.sec = {};
			} else if(a.num.is(opt.sec)){
				opt.sec = (opt.sec === -2)? {relay: true, incognito: true} : opt.sec; // incognito, eh?
			}else if(a.obj.is(opt.sec)){
			
			} else {
				opt.sec = {};
			}
			opt.session = opt.session||{};
			opt.session.sid = opt.session.sid||(function(){ return a.text.random(16) });
			opt.session.tid = opt.session.tid||(function(){ return a.text.random(16) });
			opt.session.expire = opt.session.expire||1000*60*60*24*7*4;
			opt.session.wait = opt.session.wait||1000*60*2;
			opt.cache = opt.cache||{};
			opt.cache.age = opt.cache.age||0;
			opt.com = opt.com||{};
			opt.com.log = opt.com.log || function(w,m){};
			opt.com.prefix = opt.com.prefix||'/com';	
			opt.com.url = opt.com.url||"http"+((opt.sec.key&&opt.sec.cert)?'s':'')+"://"
				+opt.host+(opt.port?':'+opt.port:'')
				+(opt.com.path||"/node_modules/sockjs/sockjs-0.3.min.js");
			if(a.list.is(opt.run)){
				var run = opt.run;
				opt.run = {};
				opt.run.is = run;
			} opt.run = opt.run||{};
			opt.run.impatient = opt.run.impatient||1000*3;
			opt.hook = opt.hook||{};
			opt.hook.pre = opt.hook.pre||(function(){});
			opt.hook.aft = opt.hook.aft||(function(){});
			opt.hook.err = opt.hook.err||(function(){});
			opt.hook.reply = opt.hook.reply||(function(){});
			opt.node = opt.node||{};
			opt.node.mid = opt.node.mid || a.text.r(16);
			web.opt = a.obj(opt).u(web.opt||{});
			web.theorize();
			web.run(opt.run.is);
			web.state();
			return web;
		});
		a.text.find.js = /\.js$/i;
		web.state = (function(){
			function state($){
				state.com = sock.createServer({
					sockjs_url: web.opt.com.url
				});
				state.dir = new ns.Server(web.opt.dir);
				if(web.opt.sec.key && web.opt.sec.cert){
					state.on = a.https.createServer({key: web.opt.sec.key, cert: web.opt.sec.cert});
				} else {
					state.on = a.http.createServer();
				}
				state.on.addListener('request',state.req);
				state.on.addListener('upgrade',function(req,res){
					if(state.sent(res)){ return }
					res.end();
				});
				state.on.listen(web.opt.port, web.opt.host);
				state.com.on('connection',state.con);
				state.com.installHandlers(state.on,web.opt.com);
				if(web.opt.node && web.opt.node.src){
					if(!a.list.is(web.opt.node.src)){
						web.opt.node.src = [web.opt.node.src];
					}
					a.list(web.opt.node.src).each(function(url){
						var toe = toes.create(url);
						web.node.cons[url] = toe;
						toe.on('error', function(e){ console.log('ut-oh', e) }); // need to add this before the connection event.
						toe.on('connection', function(){
							toe.writable = true;
							toe.mid = url;
							toe.write(a.text.ify(a.com.meta({
								what: {auth: web.opt.node.key, to: url}
								,where: {mid: web.opt.node.mid}
							})));
							state.con(toe);
						});
					});
				}
				return web;
			}
			var mime = require('mime')
			, 	ns = require('node-static')
			, 	formidable = require('formidable')
			,	toes = require('sockjs-client')
			,	sock = require('sockjs');
			state.ways = [];
			state.sort = (function(A,B){
				if(!A || !B){ return 0 }
				A = A.flow; B = B.flow;
				if(A < B){ return -1 }
				else if(A > B){ return  1 }
				else { return 0 }
			});
			state.map = (function(req,map){
				var url = req.url || url;
				map = map || state.ways;
				return a.list(map).each(function(v,i){
					if(!a.obj.is(v)){ return }
					if(v.flow < (req.flow||-Infinity)){ return }
					v.params = v.params || [];
					if(a.text.is(v.match)){
						v.regex = state.regex(v);
					} if(a.text.is(v.regex)){
						v.regex = new RegExp(v.regex,v.flags);
					} if(a.test(v.regex).of(RegExp)){
						var r = v.regex.exec(url.pathname);
						if(r){
							url.params = state.regex(v,r||[]);
							return v;
						}
					} if(a.fns.is(v.match)){
						if(v.match(url)){ return v}
					}
				})||{flow:Infinity,on:state.err};
				return (0 <= r.flow && (fs.existsSync||path.existsSync)(url.file))?
					url.file : r.file || url.file;
			});
			state.regex = (function(m,r){ // via expressjs
				try{
				var path = m.match, keys = m.params||[], params = {}, sensitive, strict;
				if(r){ m = r; 
					for (var i = 1, len = m.length; i < len; ++i) {
						var key = keys[i - 1];
						var val = 'string' == typeof m[i]
						  ? decodeURIComponent(m[i]) : m[i];
						if (key) {
						  params[key.name] = val;
						} else {
						  params[i] = val;
						}
					}
					return params;
				}
				if (path instanceof RegExp) return path;
				if (Array.isArray(path)) path = '(' + path.join('|') + ')';
				path = path
				.concat(strict ? '' : '/?')
				.replace(/\/\(/g, '(?:/')
				.replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star){
				  keys.push({ name: key, optional: !! optional });
				  slash = slash || '';
				  return ''
					+ (optional ? '' : slash)
					+ '(?:'
					+ (optional ? slash : '')
					+ (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
					+ (optional || '')
					+ (star ? '(/*)?' : '');
				})
				.replace(/([\/.])/g, '\\$1')
				.replace(/\*/g, '(.*)');
				return new RegExp('^' + path + '$', sensitive ? '' : 'i');
				} catch(e){ console.log("something has gone expressively wrong."); }
			});
			state.sent = (function(res){
				if(res.headerSent) { return true }
			});
			state.url = (function(req){
				var url = a.obj.is(req.url)? req.url : URL.parse(req.url,true);
				url.ext = url.ext || path.extname(url.pathname).replace(/^\./,'');
				return url;
			});
			state.file = (function(req,dir){
				return path.normalize(path.join(dir||web.opt.dir,req.url.pathname));
			});
			state.way = (function(req){
				var p = a.text.is(req||'')? req : (req.map.file || req.file) || '';
				return path.basename(p,path.extname(p));
			});
			state.err = (function(req,res){
				web.cookie.set(res,req.cookies);
				state.dir.serve(req,res,function(e,r){
					if(!e){ return web.opt.hook.aft(req,res) }
					if(!req.flow){ return state.req(req,res,++req.flow) }
					if(web.opt.hook.err(req,res,e,r)){ return }
					if(state.sent(res)){ return }
					res.writeHead(e.status, e.headers);
					res.end();
				});
			});
			state.ways.push({
				way: 'state'
				,match: '*'
				,flow: 0
				,on: state.err
			})
			state.req = (function(req,res){
				req.url = state.url(req);
				req.file = state.file(req);
				req.map = state.map(req);
				req.flow = req.map.flow;
				req.cookies = web.cookie.parse(req);
				req.cookies.sid = req.cookies.sid || web.opt.session.sid();
				web.opt.hook.pre(req,res);
				if(web.theorize(req,res)){ return }
				if(req.flow === Infinity){ return state.err(req,res) }
				a.fns.flow([function(next){
					web.run.it({
						file: req.map.file || req.file
						,invincible: req.map.file
						,reply: state.msg
					},function(v){
						if(v && (v=((v=state.way(req))+'.'
							+a(web.run.on,v+'.meta.state.way')))
						){
							if(a.text(req.method).low() == 'post'){
								var form = new formidable.IncomingForm();
								req.form = {}; req.files = {};
								form.on('field',function(k,v){
									req.form[k] = v;
								}).on('file',function(k,v){
									if(!req.files[k]){ req.files[k] = [] }
									(req.files[k]||[]).push(v);
								}).on('error',function(e){
									console.log("formidable error:",e);
									if(form.done){ return }
									next(form.done = v);
								}).on('end', function(){
									if(form.done){ return }
									next(form.done = v);
								});
								return form.parse(req);
							} return next(v);
						} state.err(req,res);
					});
				},function(way,next){
					var m = a.com.meta({how:{way:way,web:'state'},where:{pid:0}});
					m.what.url = req.url;
					m.what.form = req.form;
					m.what.files = req.files;
					m.what.cookies = req.cookies;
					m.what.headers = req.headers;
					m.what.method = a.text(req.method).low();
					web.reply(m,function(m){
						web.opt.hook.reply(m);
						if(m && m.what !== undefined){
							if(m.what.type !== undefined){
								var type = mime.lookup(m.what.type||'')
									,chs = mime.charsets.lookup(type);
								res.setHeader('Content-Type', type + (chs ? '; charset=' + chs : ''));
							} if(m.what.encoding !== undefined){
								res.setHeader('Content-Encoding', m.what.encoding);
							} if(m.what.cache !== undefined){
								if(m.what.cache === 0){
									res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
									res.setHeader('Pragma', 'no-cache');
									res.setHeader('Expires', 0);
								} else {
									res.setHeader('Cache-Control', m.what.cache);
								}
							} web.cookie.set(res,m.what.cookies||req.cookies);
							if(m.what.status !== undefined){
								res.statusCode = m.what.status;
							} if(m.what.redirect !== undefined){
								res.setHeader('Location', m.what.redirect);
								res.statusCode = m.what.status || 302;
								if(state.sent(res)){ return }
								return res.end();
							} if(m.what.body !== undefined){
								if(state.sent(res)){ return }
								res.end(a.text.is(m.what.body)?m.what.body:a.text.ify(m.what.body));
								return web.opt.hook.aft(req,res);
							} req.url.pathname = m.what.pathname||a(m.what,'url.pathname')||req.url.pathname;
							if(req.flow === 0){ return state.err(req,res) }
							req.flow = (m.what.flow === null)? Infinity : 
								a.num.is(m.what.flow)? m.what.flow : (req.flow + 1);
						} next(req,res);
					});
				}],state.req);
			});
			state.msg = (function(m,opt,con){
				if(!a.obj.is(m)) return;
				var way = a(m,'how.way')||a(m,'way')||''
					,opt = opt||{}, g;
				way = a.text(way).clip('.',0,1);
				if(opt != way){
					if(web.run.on[way] && (g = web.run.on[way].meta) && !g.fatal){
						var to = web.run.to(way);
						if(way !== g.name && m && m.how && m.how.way){
							m.how.way = m.how.way.replace(way, g.name);
						}
						to.com && to.com.send && to.com.send(m);
						to.count++;
						return;
					} else
					if(a[way]){ // TODO: Warning this is a no-joke condition! It is now on bottom, but should still think about bug edge cases like "test".
						a(a(m,'how.way')+'->')(m);
						return;
					}else{}
					if(!web.opt.sec.relay){
						return;
					}
				}
				if((con = state.sub(m)) && (m.where.on||m.where.off||m.where.at)){
					m.where.at = m.where.on||m.where.off||m.where.at;
					delete m.where.on;
					delete m.where.off;
					web.event.emit(m.where.at,m);
					// toes should go here too!
					return;
				}
				if((con = state.con.s[m.who.to]) && con.writable){
					return con.write(a.text.ify(state.con.clean(m)));
				}
				a.obj(web.node.cons).each(function(con,i){ // distinguish between 'reply' and 'send'!
					if(!con || !con.write){ return }
					con.write(a.text.ify(m));
				});
			});
			state.sub = (function(m,opt,con){
				if(	!a.obj.is(m) || !a.obj.is(m.where) ||
					!a(m,'who.tid') || !(con = state.con.s[m.who.tid])) return;
				if(m.where.off){
					if(!con.hear[m.where.off]) return;
					web.event.off(con.hear[m.where.off]);
					delete con.hear[m.where.off];
					return con;
				} if(con.hear[m.where.on]) return con;
				con.hear[m.where.on] = web.event.on(m.where.on,function(m){
					if(!con.writable || con.tid == m.who.tid || !state.con.s[con.id]) return;
					con.write(a.text.ify(state.con.clean(m)));
				});
				return con;
			});
			state.con = (function(con){
				con.hear = {};
				state.con.s[con.id] = con;
				con.on('data',function(m){
					m = a.com.meta(a.obj.ify(m),con);
					if(web.node.auth(con,m)){ return }
					web.cookie.tid(con,m,function(v){
						if(!v){ return }
						if(web.name == a.list(m.how.way.split('.')).at(1)){
							m.how.way = '';
						} m.where.pid = (m.where.pid === process.pid)? 0 : m.where.pid;
						state.msg(m);
					});
				});
				con.on('close',function(m){
					console.log(con.id+" disconnected.");
					a.obj(con.hear).each(function(v,i){
						web.event.off(v);
					});
					delete state.con.s[con.id];
					if(con.mid){
						delete web.node.cons[con.mid];
					}
				});
				con.on('error', function(e){ // TODO: if mid try to reconnect!
					console.log('con error', e);
				});
			});
			state.con.s = {};
			state.con.clean = (function(m){
				if(!m) return {};
				m.who = {tid:m.who.tid,sid:m.who.sid
					,to:m.who.to,from:m.who.from
					,of:m.who.of,via:m.who.via
				};
				return m;
			});
			return state;
		})();		
		web.reply = (function(m,fn){
			if(fn){
				web.run.res[m.when] = fn;
				web.state.msg(m,m.how.way);
				return;
			}
			if(fn = web.run.res[m.when]){
				fn(m);
				delete web.run.res[m.when];
				return;
			}
		});
		web.cookie = (function(){
			function cookie($){
				return web;
			}
			cookie.tryst = {};
			cookie.parse = (function(m){
				var l,p,c={};
				if(a(m,'headers.cookie')){
					l = m.headers.cookie.split(/\s?;\s?/ig);
					a.list(l).each(function(v,i){
						p = v.split(/=/);
						c[p[0]] = p.slice(1).join('=');
					});
				} return c;
			});
			cookie.set = (function(res,c,tid){
				var h = res.getHeader('Set-Cookie') || [], m;
				if(a.text.is(h)){ h = [h] }; c = c || {};
				if(c.sid){
					c.sid = {value: c.sid.value || c.sid.val || c.sid, HttpOnly:true};
				}
				if(c.tid){
					if(!tid){ delete c.tid; }
					else{ 
						c.tid = {value: c.tid.value || c.sid.tal || c.tid, HttpOnly:false};
					}
				}
				c = a.obj(c).each(function(v,i,t){
					if(a.text.is(v)){
						v = {value: v};
					} if(a.obj.is(v)){
						i = i+'='+v.value || v.val || '';
						m = a.obj(v).each(function(w,j,q){ q(a.text.low(j),w) })||{};
						m.httponly = a.obj(m).has('httponly')? m.httponly : true;
						m.path = m.path || '/'; 
						if(m.path){ i += "; path=" + m.path }
						if(m.expires){ i += "; expires=" + m.expires }
						if(m.domain){ i += "; domain=" + m.domain }
						if(m.secure){ i += "; secure" }
						if(m.httponly){ i += "; HttpOnly" }
						t(i);
					}
				})||[];
				res.setHeader('Set-Cookie', a.list(h).fuse(c));
			});
			cookie.tid = (function(req,m,fn){
				if(fn){
					if(req.mid){
						return fn(true);
					}
					if(req.sid || req.tid){
						m.who = a.obj(req.who||{}).u(m.who);
						m.how = a.obj(req.how||{}).u(m.how);
						m.where = a.obj(req.where||{}).u(m.where);
						m.who.tid = req.tid;
						m.who.sid = req.sid;
						return fn(true);
					} if(m.who.tid){
						// GETEX REDIS HERE
						var s, t = a.time.is(), w, ws;
						if(s = cookie.tryst[m.who.tid]){
							web.state.con.s[req.tid = m.who.tid] = req;
							req.sid = m.who.sid = s.sid;
							if((w = a.text(m.how.way).clip('.',0,1)) && (ws=a(web.run.on,w+'.meta.stream.on'))){
								var n = a.com.meta({what:s,who:m.who,how:{way:(w+='.'+ws),web:'stream'},where:{pid:0}});
								n.what.data = m.what;
								web.reply(n,function(n){
									delete n.who.to;
									delete n.where.pid;
									delete n.how.way;
									delete n.how.web;
									req.who = n.who;
									req.how = n.how;
									req.where = n.where;
									cookie.tid(req,m,fn);
								});
							} else {
								fn(true);
							}
						} else {
							if(web.opt.sec.incognito){ req.sid = req.tid = m.who.tid; fn(true) }
						} delete cookie.tryst[m.who.tid];
						a.obj(cookie.tryst).each(function(v,i){
							if(web.opt.session.wait < t - v.ts){
								delete cookie.tryst[i];
							}
						}); 
					}
				} if(req.url){ 
					req.cookies = req.cookies||{};
					// SETEX REDIS HERE
					
					cookie.tryst[req.cookies.tid = web.opt.session.tid()] 
						= {sid: req.cookies.sid, ts: a.time.is()
						, cookies: a.obj(req.cookies).each(function(v,i,t){
							if(a.obj.is(v)){
								t(i, v.value || v.val || '');
							}else{
								t(i, v || '');
							} 
						})
					}
					return req.cookies;
				}
			});
			return cookie;
		})();
		web.node = (function(){
			function node(){
			
			}
			node.auth = function(con,m){
				if(con.sid || con.tid){ return }
				if(con.mid){
					if(m.where){ m.where.mid = m.where.mid || con.mid }
					return;
				}
				if(m && m.where && m.where.mid && m.what && m.what.auth){
					console.log('node auth', m);
					//console.log("auth machine...");
					if(!web.opt.node || !web.opt.node.key){
						con.close();
						console.log("none");
						return true;
					}
					if(m.where.mid === web.opt.node.mid){
						con.close();
						console.log("self");
						return true;
					}
					if(m.what.auth === web.opt.node.key){
						con.mid = m.where.mid;
						web.node.cons[con.mid] = con;
						console.log("machine auth success");
						return true;
					}
					con.close();
					return true;
				}
			}
			node.cons = {};
			return node;
		})();
		web.run = (function(){
			function run($){
				if(!$){ return web }
				if(!a.list.is($)){
					$ = [$];
				} a.list($).each(function(v,i,t){
					var p = v; p = p.slice(0,3) == '../'? module.reqdir+'/'+p : p;
						p = p.slice(0,2) == './'? module.reqdir + p.slice(1) : p;
						p = a.text.find.js.test(p)? p : p + '.js';
					run.it({
						file:p
						,reply: web.state.msg
					},function(v){ });
				});
				return web;
			}
			var spawn = a.child_process.spawn
				, fork = a.child_process.fork;
			run.on = {};
			run.res = {};
			run.it = (function(m,fn){
				if(!m){ return }
				var opt = m.what || m
					, way = opt.way = web.state.way(opt.file);
				if(way === theory.name){ return fn(false) }
				if(opt.file == (module.parent||{}).filename){ return fn(false) }
				if(!a.text.find.js.test(opt.file)){ return fn(false) } // ? why again ?
				if(!(fs.existsSync||path.existsSync)(opt.file)){ return fn(false) }
				if(!opt.respawn && run.on[way]){
					if(a(run.on,way+'.meta.state')){ return fn(true) } // change API
					return fn(false);
				}
				console.log("RUN :-->"+" testing "+opt.file)
				var ts = a.time.is()
					, p = fork(opt.file,[],{env:process.env})
					, gear = run.on[way] || (run.on[way]={meta:{},cogs:{}})
					, cog = gear.cogs[p.pid] = {com:p, pid:p.pid, start:ts, count:0}
				gear.meta.invincible = opt.invincible;
				p.on('message',function(m){
					m = a.obj.ify(m);
					if(a(m,'onOpen.readyState')===1){
						a.time.stop(opt.impatient);
						if(m && m.mod && m.mod.state){ m.mod.state.file = opt.file }
						else { fn(0); fn = function(){} }
						gear.meta = a.obj(m.mod).u(gear.meta);
						if(gear.meta && gear.meta.name){
							run.on[gear.meta.name] = gear;
						}
						web.state.ways.push(a(m,'mod.state'));
						web.state.ways.sort(web.state.sort);
						opt.invincible = gear.meta.invincible
						run.track(opt,opt.reply);
						fn(p.pid||true); fn = function(){};
						return;
					} opt.reply(m,(gear.meta&&gear.meta.name)||way);
				});
				p.on('exit',function(d,e){
					if(cog.end){
						delete gear.cogs[p.pid];
						return;
					} if(gear.meta.invincible){
						cog.end = a.time.is();
						console.log("RUN :-->"+" respawn: "+d+" >> "+way+" survived "+(cog.end - cog.start)/1000+" seconds. >> respawn: "+e);
						delete gear.cogs[p.pid];
						opt.respawn = true;
						run.it(opt,(function(){}));
						return;
					} a.time.stop(opt.impatient);
					fn(false); fn = function(){};
					gear.meta.fatal = true;
					cog.end = a.time.is();
					delete cog.com; cog.com = {send:function(){}};
					console.log("RUN :-->"+" exit: "+d+" >> "+way+" survived "+(cog.end - cog.start)/1000+" seconds. >> exit: "+e);
				});
				if(opt.respawn){ return }
				opt.impatient = a.time.wait(function(){
					fn(false); fn = function(){};
				},web.opt.run.impatient);
			});
			run.tracked = {};
			run.track = (function(opt,cb){ // depreciate
				if(run.tracked[opt.way||opt.file]){ return }
				fs.watchFile(opt.file,function(c,o){
					opt.respawn = true;
					run.it(opt,(function(p){
						if(!p) return;
						a.obj(a(run.on,opt.way+'.cogs')).each(function(v,i){
							if(v.pid === p) return;
							if(v.end){
								v.com && v.com.kill && v.com.kill(); // not killing?
								return;
							}
							v.end = a.time.is();
						});
					}),cb);
				});
				run.tracked[opt.way||opt.file] = true;
			});
			run.to = (function(way){ // TODO: Use different algorithm? Such as oldest-used first.
				var low;
				a.obj(a(run.on,way+'.cogs')).each(function(v,i){
					low = (!v.end && v.count < (low||(low=v)).count)? v : low;
				});
				return low||{};
			});
			return run;
		})();
		web.event = (function(){
			function event(e){
				if(e){
					e.on = event.on;
					e.off = event.off;
					e.emit = event.emit;
					return e;
				} return event;
			}
			event.w = event.w||{};
			event.emit = (function(w,m){
				a.obj(event.w[w]||{}).each(function(c,i){
					if(c(m) === null){
						delete event.w[i];
					}
				});
				return event.w[w];
			});
			event.on = (function(w,c){
				if(!w) return {};
				var r = a.time.now();
				(event.w[w]||(event.w[w]={}))[r] = c;
				return r;
			});
			event.off = (function(w){
				if(event.w[w]){
					delete event.w[w];
				} else {
					a.obj(event.w).each(function(v,i){
						delete v[w];
						if(a.obj.empty(v)){
							delete event.w[i];
						}
					});
				}
			});
			return event;
		})();
		web.theorize = (function(req,res){
			if(req){
				if(a.text.low(web.state.way(req.url.pathname)) === theory.name){
					req.cookies = web.cookie.tid(req);
					if(!web.opt.no_global_theory_src){
						web.cookie.set(res,req.cookies,req.cookies.tid);
						if(web.state.sent(res)){ return }
						res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
						res.end(a.theory_js,'utf-8');
						return true;
					}
				}
			} if(!web.opt.no_global_theory_src){
				a.theory_js = a.theory_js||fs.readFileSync(process.env.totheory,'utf8');
				if(	(fs.existsSync||path.existsSync)(module.reqdir+'/node_modules') && 
					(fs.existsSync||path.existsSync)(__dirname+'/node_modules/theory') &&
					!(fs.existsSync||path.existsSync)(module.reqdir+'/node_modules/theory')){
					fs.mkdirSync(module.reqdir+'/node_modules/theory')
					fs.writeFileSync(module.reqdir+'/node_modules/theory/index.js'
						,"module.exports=require('"
						+path.relative(module.reqdir+'/node_modules/theory'
						,process.env.totheory).replace(/\\/ig,'/')
					+"');");
				}
			}
		});
		return a.web = web;
	});
	return web;
})());