/** THEORY **/
;var theory=theory||null;if(theory){root.init()}else{
theory=(function(b,c,fn){
	function theory(b,c){
		var a = (function(b,c){
			var a = a||theory, l = arguments.length;
			if(l == 1){
				if(a.text.is(b)){
					return a.obj.get(a,b);
				}
			} if(l == 2){
				if(a.text.is(c)){
					return a.obj.get(b,c);
				}
			}
		});
		if(this && theory.bi.is(this)){ return theorize(a) }
		return a(b,c);
	} var $, _;
	function theorize(a){
		var $=undefined,_=undefined;
		a.log = (function(s){
			//console.log(s);
			return a.log;
		});
		a.fns = (function(){
			function fns($){
				fns.$_ = $ !== undefined? $ : _;
				return fns;
			} var $;
			fns.is = (function(fn){
				$ = fns.$_;fns.$_=_;fn = $||fn;
				return (fn instanceof Function)? true : false;
			});
			fns.flow = (function(s,f){ // TODO: BUG: Seriously reconsider then().done() because they fail on .end() after a synchronous callback, provide no doc or support for it until you do.
				var t = (function(){
					var args = a.list.slit.call(arguments,0), n;
					args.push(t);
					n = (function(){
						(t.list[t.i++] || t.end).apply(t,args);
					})();
					return t;
				}), list = a.list.is(s)? s : a.list.is(f)? f : 0;
				f = a.fns.is(f)? f : a.fns.is(s)? s : function(){};
				t.end = list? f : function(){}; // TODO: Receives `next` as param, is this desirable?
				t.then = (function(fn){
					if(a.fns.is(fn)){ t.list.push(fn) }
					return t;
				});
				t.done = (function(fn){
					t.end = a.fns.is(fn)? fn : t.end;
					return t;
				});
				t.list = list || [];
				t.i = 0;
				if(list){ t() }
				else{ f(t) }
				return t;
			});
			fns.sort = (function(args){
				if(!args){ return {e:"Empty"} }
				var args = a.list.slit.call(args, 0), r = {b:[],n:[],t:[],l:[],o:[],f:[]};
				for(var i = 0; i < args.length; i++){
					if (fns.is(args[i])){
						r.f.push(args[i]);
					} else if(a.list.is(args[i])){
						r.l.push(args[i]);
					} else if(a.obj.is(args[i])){
						r.o.push(args[i]);
					} else if(a.num.is(args[i])){
						r.n.push(args[i]);
					} else if(a.text.is(args[i])){
						r.t.push(args[i]);
					} else if(a.bi.is(args[i])){
						r.b.push(args[i]);
					}
				}
				return r;
			});
			fns.$ = (function(t,v){
				v = t.$;
				t.$=_;
				return v;
			});
			fns.pass = (function(fn,o){
				$ = fns.$_;fns.$_=_;if($){ o=fn;fn=$ }
				if(a.text.is(o)){ var tmp = a(fn,o); o = fn; fn = tmp }
				if(!fns.is(fn)){ return _ }
				return (function(){
					return fn.apply(o, a.list.slit.call(arguments));
				});
			});
			return fns;
		})();
		a.list = (function(){
			function list($){
				list.$ = $ !== undefined? $ : _;
				return list;
			} var $;
			list.is = (function(l){
				l = a.fns.$(list)||l;
				return (l instanceof Array)? true : false;
			});
			list.slit = Array.prototype.slice;
			list.at = (function(l,i,opt){
				var r;
				if($=a.fns.$(list)){ opt=i;i=l;l=$ }
				if(!l||!i){ return undefined }
				if(a.text.is(l)){ l = l.split('') }
				if(i < 0){
					r = l.slice().reverse();
					i = Math.abs(i);
				} opt = opt || {};
				if(opt.ebb){
					for(--i; 0 <= i; i--){	// upgrade to functionalize
						if(r && r[i] !== undefined){ return r[i] }
						else if(l[i] !== undefined){ return l[i] }
					} return undefined;
				}
				return (r||l)[--i];
			});
			list.ify = (function(l,opt){
				if($=a.fns.$(list)){ opt=l;l=$ }
				opt=opt||{};
				opt.wedge = opt.wedge||':';
				opt.split = opt.split||',';
				var r = [];
				if(a.list.is(l)){
					return l;
				} else
				if(a.text.is(l)){
					var r = new RegExp("\\s*\\"+opt.split+"\\s*",'ig');
					return l.split(r);
				} else
				if(a.obj.is(l)){
					a.obj(l).each(function(v,i){
						r.push(i+opt.wedge+(a.obj.is(v)? a.text.ify(v) : v));
					});
				}
				return r;
			});
			list.fuse = (function(l){
				var args = a.list.slit.call(arguments, 0), ll;
				l = ($=a.fns.$(list))||l;
				ll = $? a.fns.sort(args).l : a.fns.sort(args).l.slice(1);
				return Array.prototype.concat.apply(l,ll);
			});
			list.union = list.u = (function(l,ll){ //[1,2,3,4,5] u [3,5,6,7,8] = [1,2,3,4,5,6,7,8]
				return not_implemented_yet;
				if($=a.fns.$(list)){ ll=l;l=$ }
				// yeaaah, try again.
				return r;
			});
			list.intersect = list.n = (function(l,ll){ //[1,2,3,4,5] n [3,5,6,7,8] = [3,5]
				return not_implemented_yet;
				if($=a.fns.$(list)){ ll=l;l=$ }
				// yeaah, try again.
			});
			list.less = (function(l,s){ // ToDo: Add ability to use a function to determine what is removed.
				var args = a.list.slit.call(arguments, 0), sl = s, ls = l;
				l = ($=a.fns.$(list))||l;
				s = $? args : args.slice(1);
				if($ === args.length){ l=ls;s=sl }
				sl = s.length;
				return a.list(l).each(function(v,i,t){
					if(1 == sl && a.test.is(v,s[0])){ return } else
					if(a.list(s).each(function(w,j){
						if(a.test.is(v,w)){ return true }
					})){ return }
					t(v);
				})||[];
			});
			list.each = list.find = (function(l,c,t){
				if($=a.fns.$(list)){ t=c;c=l;l=$ }
				return a.obj.each(l,c,t);
			});
			list.copy = (function(l){
				return a.obj.copy( ($=a.fns.$(list))||l );
			});
			list.index = 1;
			return list;
		})();
		a.obj = (function(){
			function obj($){
				obj.$ = $ !== undefined? $ : _;
				return obj;
			} var $;
			obj.is = (function(o){
				o = a.fns.$(obj)||o;
				return (o instanceof Object && !a.list.is(o) && !a.fns.is(o))? true : false;
			});
			obj.ify = (function(o){
				o = a.fns.$(obj)||o;
				if(a.obj.is(o)){ return o }
				try{
					o = JSON.parse(o);
				}catch(e){o={}};
				return o;
			});
			obj.empty = (function(o){
				if(!(o = a.fns.$(obj)||o)){ return true }
				return obj.each(o,function(v,i){
					if(i){ return true }
				})? false : true;
			});
			obj.copy = (function(o,r,l){
				if(!r){
					o = a.fns.$(obj) || o;
				} l = a.list.is(o);
				if(r && !a.obj.is(o) && !l){ return o } 
				r = {}; o = a.obj.each(o,function(v,i,t){
					l? t(obj.copy(v,true)) : (r[i] = obj.copy(v,true));
				})||[];
				return l? o : r;
			});
			obj.union = obj.u = (function(x,y){
				var args = a.list.slit.call(arguments, 0), r = {};
				if($=a.fns.$(obj)){ y=x;x=$ }
				if(a.list.is(x)){ y = x } else
				if(a.list.is(y)){ } else {
					y = $? args : args.slice(1);
					y.splice(0,0,x);
				}
				a.list(y).each(function(v,i){
					a.obj(v).each(function(w,j){
						if(a.obj(r).has(j)){ return }
						r[j] = w;
					});
				});
				return r;
			});
			obj.has = (function(o,k){
				if($=a.fns.$(obj)){ k=o;o=$ }
				return Object.prototype.hasOwnProperty.call(o, k);
			});
			obj.each = (function(l,c,_){
				if($=a.fns.$(obj)){ _=c;c=l;l=$ }
				var i = 0, ii = 0, x, r, rr, f = a.fns.is(c),
				t = (function(k,v){
					if(v !== undefined){
						rr = rr || {};
						rr[k] = v;
						return;
					} rr = rr || [];
					rr.push(k);
				});
				if(a.list.is(l)){
					x = l.length;
					for(;i < x; i++){
						ii = (i + a.list.index);
						if(f){
							r = _? c.call(_, l[i], ii, t) : c(l[i], ii, t);
							if(r !== undefined){ return r }
						} else {
							if(a.test.is(c,l[i])){ return ii }
						}
					}
				} else if(a.obj.is(l)){
					for(i in l){
						if(f){
							if(a.obj(l).has(i)){
								r = _? c.call(_, l[i], i, t) : c(l[i], i, t);
								if(r !== undefined){ return r }
							}
						} else {
							if(a.test.is(c,l[i])){ return i }
						}
					}
				}
				return f? rr : a.list.index? 0 : -1;
			});
			obj.get = (function(o,l,opt,f){
				if($=a.fns.$(obj)){ l=o;o=$ }
				if(a.num.is(l)){ l = a.text.ify(l) }
				if(a.list.is(l)){ l = l.join('.') }
				if(a.text.is(l)){
					f = (l.length == (l = l.replace(a.text.find.__.fn,'')).length)? 
					undefined : function(){}; l = l.split(a.text.find.__.dot);
				} if(!l){ return }
				var x = (l||[]).length, r,
				deep = (function(o,v){
					return a.list(o).each(function(w,j){
						if(a.obj(w||{}).has(v)){ return w }
						if(a.list.is(w)){ return deep(w,v) }
					});
				}), get = (function(v,i,t,n){
					if(a.list.is(o)){
						if(/^\-?\d+$/.test(v)){
							n = a.list.index;
							v = a.num.ify(v);
						} else {
							o = deep(o,v);
						}
					}
					if(n || a.obj(o||{}).has(v)){
						o = n? a.list(o).at(v) : o[v];
						if(i === x - (a.list.index? 0 : 1)){
							return f? a.fns.is(o)? o : f : o;
						} return;
					}
					return f || a.test.nil;
				}); r = a.list(l).each(get);
				return r === a.test.nil? undefined : r;
			});
			return obj;
		})();
		a.text = (function(){
			function text($){
				text.$ = $ !== undefined? $ : _;
				return text;
			} var $;
			text.is = (function(t){
				t = (($=a.fns.$(text))!==_)?$:t;
				return typeof t == 'string'?true:false;
			});
			text.get = (function(q){ return });
			text.ify = (function(t){
				t = (($=a.fns.$(text))!==_)?$:t;
				if(JSON){ return JSON.stringify(t) }
				return t.toString? t.toString():t;
			});
			text.random = text.r = (function(l,c){
				if($=a.fns.$(text)){ c=l;l=$ } var $ = $||l, s = '';
				l = a.num.is($)? $ : a.num.is(c)? c : 16;
				c = a.text.is($)? $ : a.text.is(c)? c : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
				while(l>0){ s += c.charAt(Math.floor(Math.random()*c.length)); l-- }
				return s;
			});
			text.clip = (function(t,r,s,e){
				if($=a.fns.$(text)){ e=s;s=r;r=t;t=$ } // IE6 fails if e === undefined with Mocha
				return t = (t||'').split(r), t=a.num.is(e)?t.slice(s,e):t.slice(s), t.join(r);
			});
			text.find = (function(t){
				var regex = {};
				a.log(regex.name = t.name+'.find');
				regex.is = /[\.\\\?\*\[\]\{\}\(\)\^\$\+\|\,]/ig
				regex.special = {'.':1,'\\':1,'?':1,'*':1,'[':1,']':1,'{':1,'}':1,'(':1,')':1,'^':1,'$':1,'+':1,'|':1,',':1}
				regex.mail = /^(("[\w-\s]+")|([\w-]+(?:[\.\+][\w-]+)*)|("[\w-\s]+")([\w-]+(?:[\.\+][\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i;
				regex.base64 = new RegExp("^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$");
				regex.list = /(,\s|;\s|,|;|\s)/ig;
				regex.css = /(.+?):(.+?);/ig;
				regex.url = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
				regex.ext = /\.([^\.]+)$/i;
				regex.ws_ = /\-/ig;
				regex.space = /\s/ig;
				regex.num = /(\-\d+\.\d+|\d+\.\d+|\-\d+|\d+)/g;
				regex['int'] = /(\-\d+|\d+)/g;
				regex.__ = { fn: /\-\>$/, dot: /\./ };
				return regex;
			})(text);
			text.caps = (function(t){
				t = a.fns.$(text)||t;
				t = (text.is(t))?t:"";
				return t.toUpperCase();
			});
			text.low = (function(t){
				t = a.fns.$(text)||t;
				t = (text.is(t))?t:"";
				return t.toLowerCase();
			});
			return text;
		})();
		a.num = (function(){
			function num($){
				num.$ = ($ !== undefined? $ : _);
				return num;
			} var $;
			num.is = (function(n){
				n = (($=a.fns.$(num))!==_)?$:n;
				return ( (n===0)? true : (!isNaN(n) && !a.bi.is(n) && !a.list.is(n) && !a.text.is(n))? true : false);
			});
			num.i = (function(n){return parseInt(a.fns.$(num)||n,10)});
			num.dec = (function(n){return parseFloat(a.fns.$(num)||n)});
			num.ify = (function(n,o){
				if(($=a.fns.$(num))!==_){ o=n;n=$ }
				var r, l = a.list.is(o);
				if(a.list.is(o)){
					if(a.num.is(n)){
						return [n];
					} if(a.text.is(n)){
						r = n.match(a.text.find.num) || [];
						return a.list(r).each(function(v,i,t){
							t(a.num.ify(v));
						});
					}
				}
				r = num.dec(n);
				if(a.num.is(r)){ return r }
				if(!n){	return }
				if(a.text.is(n)){
					return a.num.ify( (n.match(a.text.find.num)||[])[0] );
				}
			});
			num.random = num.r = (function(l){
				l = ((($=a.fns.$(num))!==_)?$:l)||6;
				if(a.list.is(l)){ return (Math.floor(Math.random() * (l[1] - l[0] + 1)) + l[0]) }
				l = (l<=14)? l : 14;
				var n = '9';
				for(var i = 0; i < l-1; i++){ n += '0' }
				n = a.num.ify(n);
				var r = function(){return Math.floor(Math.random()*10)||(l==1?0:r())};
				n = Math.floor(r() + Math.pow(Math.random(),Math.random()) * (n));
				if(n.toString().length != l){ return num.r(l) }
				return n;
			});
			return num;
		})();
		a.bi = (function(){
			function bi($){
				bi.$ = $ !== undefined? $ : _;
				return bi;
			} var $;
			bi.is = (function(b){
				b = (($=a.fns.$(bi))!==_)?$:b;
				return (b instanceof Boolean || typeof b == 'boolean')?true:false;
			});
			return bi;
		})();
		a.on = (function(){
			function on($){
				on.$ = $ !== undefined? $ : _;
				return on;
			} var $, events = {}, sort = (function(A,B){
				if(!A || !B){ return 0 } A = A.i; B = B.i;
				if(A < B){ return -1 }else if(A > B){ return 1 }
				else { return 0 }
			});
			on.emit = (function(){
				if(!a.text.is($ = a.fns.$(on))) return;
				var e = events[$] = events[$] || (events[$] = []), args = arguments;
				if(!(events[$] = a.list(e).each(function(hear, i, t){
					if(!hear.fn) return; t(hear);
					hear.fn.apply(hear, args);
				}))){ delete events[$]; }
			});
			on.event = (function(fn, i){
				if(!a.text.is($ = a.fns.$(on))) return;
				var $ = events[$] = events[$] || (events[$] = [])
				, e = {fn: fn, i: i || 0, off: function(){ return !(e.fn = false); }};
				return $.push(e), $.sort(sort), e;
			});
			return on;
		})();
		a.time = (function(){
			function time($){
				time.$ = $ !== undefined? $ : _;
				return time;
			}
			time.is = (function(t){
				t = ($=a.fns.$(time))||t;
				return t? t instanceof Date : (+new Date().getTime());
			});
			time.now = (function(){
				var n = a.num.ify((a.time.is().toString())+'.'+a.num.r(4));
				return (theory.time.now.last||0) < n? (theory.time.now.last = n) : time.now();
			});
			time.loop = (function(fn,d){
				var args = a.fns.sort(a.list.slit.call(arguments, 0));
				return (args.f.length)?setInterval(a.list(args.f).at(1),a.list(args.n).at(1)):_;
			});
			time.wait = (function(fn,d){
				var args = a.fns.sort(a.list.slit.call(arguments, 0));
				return (args.f.length)?setTimeout(a.list(args.f).at(1),a.list(args.n).at(1)):_;
			});
			time.stop = (function(i){
				i = ($=a.fns.$(time))||i;
				return (clearTimeout(i)&&clearInterval(i))||true;
			});
			return time;
		})();
		a.com = (function($){
			var com = a.com;
			com.$ = $ !== undefined? $ : _;
			com.way = com.way||$;$=_;
			com.queue = [];
			theory.com.queue = theory.com.queue||[];
			com.dc = [theory.time.now()];
			com.node = (function(opt){
				if(!process._events){ process._events = {} }
				if(process.send && !process._events.theory){
					process._events.theory = (function(m){
						com.msg(a.obj.ify(m));
					}); process.on('message',process._events.theory);
					process.send({onOpen:{readyState:(process.readyState = 1)},mod:module.theory[opt.way]});
					com.wire = process;
					return;
				}
			});
			com.page = (function(){
				com.src = com.src||(window.location.protocol +'//'+ window.location.hostname)
					+ ((window.location.port)?':'+window.location.port:'')
					+ (com.path||'/com');
				var municate = (function(){
					if(!window.SockJS){ return }
					theory.com.wire = new window.SockJS(com.src);
					theory.com.wire.onopen = function(){
						theory.com.open&&theory.com.open();
						console.log("Communication initiated at "+com.src+" with "+com.wire.protocol+".");
						com.drain();
					};
					theory.com.wire.onmessage = theory.com.municate||function(m){
						m = a.obj.ify(m.data||m);
						if(theory.com.asked[m.when]){
							a(theory.com.asked,m.when+"->")(m);
							delete theory.com.asked[m.when];
							return;
						}
						com.msg(m);
					};
					theory.com.wire.onclose = function(m){
						console.log('close');
						theory.com.close&&theory.com.close(m);
					};
				});
				if(theory.com.off || root.opts.com === false){ return }
				if(window.SockJS){
					municate();
				} else {
					module.ajax.load(com.url||(location.local+'//cdn.sockjs.org/sockjs-0.3.min.js')
					,function(d){municate()});
				}
			});
			com.drain = (function(){
				while(theory.com.queue.length > 0){
					com.write(theory.com.queue.shift());
				}
			});
			com.write = (function(m,c){
				c = c||theory.com.wire;
				if(!c || c.readyState !== 1){
					theory.com.queue.push(m);
					return;
				}
				if(a.obj.is(m)){
					m = a.text(m).ify();
				}
				//console.log("send --> "+m);
				c.send(m);
			});
			com.init = (function(c){
				if(root.node){ com.node({way:c}) }
				if(c){ return }
				if(root.page){ com.page() }
				return com;
			});
			/** Helpers **/
			com.msg = (function(m,c){
				theory.obj.get(theory,theory.obj.get(m,'how.way')+'->')(m,c);
			});
			com.ways = (function(m,w){
				var way = w||a.obj.get(m,'how.way')||com.way;
				if($=a.fns.$(com)){
					way = ($.charAt(0)=='.')?com.way+$:$;
				} return m = com.meta(m,way);
			});
			com.ask = (function(m,f){
				if(!a.fns.is(f)){ return }
				m = com.ways(m);
				delete m.where;
				theory.com.asked[m.when] = f;
				com.write(m);
			});theory.com.asked = theory.com.asked||{};
			com.reply = (function(m){
				m = com.ways(m);
				if(m.how.web){
					m.how.way = 'web.reply';
				} m.who = m.who||{};
				m.who.to = m.who.to||m.who.tid;
				com.write(m);
			});
			com.send = (function(m){
				m = com.ways(m);
				com.write(m);
			});
			com.meta = (function(m,opt){
				if(!a.obj.is(m)){ m = {what:m} }
				var n = {what: (m.what = m.what||{}) };
				opt = opt||{c:{}};
				if(a.text.is(opt)){ opt = {w:opt,c:{}} }
				if(opt.protocol){ opt.c = opt }
				a.obj(m).each(function(v,i){
					if( i == 'how' || i == 'who' || i == 'what' ||
						i == 'when'|| i == 'where'){ return }
					n.what[i] = m.what[i] = v; delete m[i];
				});
				if(!m.how){ n.how={way: opt.w||com.way} }else{
					n.how = m.how;
					n.how.way = opt.w||m.how.way||com.way;
					delete m.how;
				} m.how = n.how;
				if(!m.when){ n.when=a.time.now() }else{
					n.when = m.when;
					delete m.when;
				} m.when = n.when;
				if(!m.who){
					if(root.page && !com.who){
						n.who = { tid: (com.who=root.who) }
					} if(root.node){ n.who = {} }
				}else{
					if(a.obj.is(m.who)){ n.who=m.who }else{
						n.who = {to: m.who}
					} if(root.node){
					} if(root.page && !com.who){
						n.who.tid = com.who = root.who;
					} delete m.who;
				} m.who = n.who;
				if(!m.where){
					if(root.page){ if(a.text.is(m.where)){}else{};
					} if(root.node){ n.where={pid: process.pid} }
				}else{
					if(a.obj.is(m.where)){ n.where = m.where }else{ 
						n.where = {at: m.where};
					} if(root.node){
						if(!a.obj(m.where).has('pid')){ n.where.pid=process.pid }
					} delete m.where;
				} m.where = n.where;
				return n;
			}); /** END HELPERS **/
			return com;
		});
		a.test = (function(){
			function test($){
				if($===undefined && a.fns.is(test.$)){ try{return test.$()}catch(e){return e} }
				test.$ = arguments.length? $ : test.nil;
				return test;
			} test.nil = test.$ = 'ThEoRy.TeSt.NiL-VaLuE';
			test._ = (function(r){ r = a.fns.$(test); test.$ = test.nil; return r; });
			test.of = (function(t,f){
				if(($=test._()) !== test.nil){ f=t;t=$ }
				return t instanceof f;
			});
			test.is = (function(a, b, aStack, bStack){ // modified Underscore's to fix flaws
				if(($=test._()) !== test.nil){ b=a;a=$ }
				var _ = {isFunction:theory.fns.is
					,has:theory.obj.has}, eq = test.is;
				aStack = aStack||[]; bStack = bStack||[];
				// Identical objects are equal. `0 === -0`, but they aren't identical.
				if(a === b){ return a !== 0 || 1 / a == 1 / b }
				if(a == null || b == null){ return a === b }
				var className = Object.prototype.toString.apply(a);
				if(className != Object.prototype.toString.apply(b)){ return false }
				switch(className){
					case '[object String]': return a == String(b);
					case '[object Number]': return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
					case '[object Function]':  return a.name === b.name && a.toString() === b.toString();
					case '[object Date]':
					case '[object Boolean]': return +a == +b;
					case '[object RegExp]': return a.source == b.source && a.global == b.global && 
						a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
				}
				if(typeof a != 'object' || typeof b != 'object'){ return false }
				var length = aStack.length;
				while(length--){ if(aStack[length] == a){ return bStack[length] == b} }
				aStack.push(a); bStack.push(b);
				var size = 0, result = true;
				if(className == '[object Array]'){
					size = a.length; result = size == b.length;
					if(result){
						while(size--){
							if(!(result = eq(a[size], b[size], aStack, bStack))){ break }
						}
					}
				}else{
					var aCtor = a.constructor, bCtor = b.constructor;
					if(aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) && 
						_.isFunction(bCtor) && (bCtor instanceof bCtor))){ return false }
					for(var key in a){
						if(_.has(a, key)){
							size++;
							if(!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))){ break }
						}
					} if(result){
						for(key in b){
							if(_.has(b, key) && !(size--)){ break }
						} result = !size;
					}
				}
				aStack.pop(); bStack.pop();
				return result;
			});
			return test;
		})();
		return a;
	}
	theory.Name = 'theory';
	theory.version = 2.5;
	theorize(theory);
	return theory;
})(true);

/** 
		BASE 
**/
(function(r){
	var root = root||{}, a = theory;
	root.opts = root.opts || {};
	root.deps = {loaded:{},alias:{},all:{},wait:{}};
	root.pollute = ((typeof GLOBAL !== 'undefined' && GLOBAL.global && GLOBAL.process &&
					GLOBAL.process.env && GLOBAL.process.pid && GLOBAL.process.execPath)?
		(function(){
			global.node = root.node = true;
			global.opts = root.opts;
			global.theory = theory;
			module.theory = module.theory||{}
			process.env.totheory = __filename;
			if(process.env.NODE_ENV==='production'){process.env.LIVE = true};
			module.path = require('path');
			require.sep = module.path.sep;
			module.exports=(function(cb,deps,name){
				if(!arguments.length) return theory;
				var args = a.fns.sort(a.list.slit.call(arguments, 0)), r
					,m = util.require.apply({},arguments);
				args.file = root.submodule||(module.parent||{}).filename;
				global.aname = global.aname||m.name;
				a.obj(util.deps(m.dependencies,{flat:{},src:args.file})).each(function(name,path){
					var p = require(root.submodule=path=util.resolve(path,path));
					m.theory[name] = (theory.obj.is(p) && theory.obj.empty(p))? undefined : p;
				});
				module.theory[m.name] = a.obj.ify(a.text.ify(m));
				var mod = (theory[m.name] = m.init(m.theory));
				if(global.aname === m.name && theory.com) theory.com(theory.Name).init(m.name);
				return mod;
			});
			return;
		}) : (function(){
			root = window.root = window.root||root;
			root.page = true;
			root.who = root.who||a.list((document.cookie+';').match(/tid=(.+?);/)||[]).at(-1)||'';
			window.console = window.console||{log:function(s){return s}};
			console.saw = (function(s){console.log(a.text(s).ify())});
			location.local=(location.protocol==='file:'?'http:':'');
			var noConflict={__dirname: window.__dirname,module:window.module,exports:window.exports,require:window.require};
			window.__dirname = '';
			window.module = {exports: (window.exports = {})};
			window.module.ajax = {load:(function(b,c){
				var d=document,j="script",s=d.createElement(j); module.sync=(s.onload===null||!s.readyState)?0:1; // IE6+
				var e=2166136261,g=b.length,h=c,i=/=\?/,w=window.setTimeout,x,y,a=function(z){
					document.body&&(z=z||x)&&s&&document.body[z]?document.body[y=z](s):w(a,0);
				};if(i.test(b)){for(;g--;)e=e*16777619^b.charCodeAt(g);
					window[j+=e<0?-e:e]=function(){h.apply(h,arguments);delete window[j]};b=b.replace(i,"="+j);c=0
				};s.onload=s.onreadystatechange=function(){if(y&&/de|m/.test(s.readyState||"m")){
					c&&c();a(x='removeChild');try{for(c in s)delete s[c]}catch(b){}
				}};s.src=b;c&&a(x='appendChild');
			})};module.ajax.load('#');
			window.module.ajax.code = util.load;
			window.onerror = (function(e,w,l){
				console.log(e + " at line "+ l +" on "+ w);
				//if(theory.com){ theory.com.send({e:e,url:w,line:l}) }
			});
			window.require = module.require = function require(p){
				if(!p){ return require }
				if(util.stripify(p) == util.stripify(theory.Name)){
					return util.require;
				} var fn, c = 0, cb = function(f){ fn = f; };
				theory.list((p = theory.list.is(p)? p : [p])).each(function(v){
					window.module.ajax.code(v,function(d){++c && (p.length <= c) && fn && fn(d)});
				}); return cb;
			}; window.require.sep = '/'; require.resolve = util.resolve; require.cache = {};
			util.init();
			if(root.opts.amd === false){theory.obj(noConflict).each(function(v,i){window[i]=v});}
			if(theory.com){ theory.com(theory.Name).init() }
		})
	);
	var util = {};	
	util.theorize = (function(mod){
		mod.theory = theory.call(true);
		if(mod.theory.com){ mod.theory.com(mod.name) }
		return mod.theory;
	});
	util.require = (function(){
		var mod, args = a.fns.sort(a.list.slit.call(arguments,0))
		, fail = {name:'fail',init:(function(){console.log('module failed to load')})};
		if(args.o.length === 1 && !args.t.length && !args.l.length){
			mod = a.list(args.o).at(1);
		} else {
			if(args.f.length){
				mod = {
					name: a.list(args.t).at(1)
					,init: a.list(args.f).at(1)
					,dependencies: a.list(args.l).at(1) || a.list(args.o).at(1)
				}
			}
		} mod.name = mod.name||fail.name;
		mod.init = mod.init||mod.main||mod.start||mod.boot||mod.cb||mod.fn||fail.init;
		mod.dependencies = mod.dependencies||mod.require||mod.deps||mod.dep;
		mod.dependencies = a.list.is(mod.dependencies)? 
			a.list(mod.dependencies).each(function(v,i,t){t(v,1)}) : mod.dependencies;
		mod.theory = util.theorize(mod);
		if(root.node){ return mod }
		args = {cb:function(p, opt){
			if(args.launched 
			|| a.list(util.deps(mod.dependencies,{flat:{}})).each(function(v,j){
				if(!(i = root.deps.loaded[j])){ return true }
				if(i === 2){ return true }
				if(i && i.launch && a.text.is(v) && mod.theory[v] === undefined){ mod.theory[v] = i.launch; }
			})){ return }
			args.on.off();
			args.launched = {launch: (theory[mod.name] = mod.init(mod.theory||theory)), n:mod.name};
			module.exports = exports = args.launched.launch;
			if(mod.src){
				root.deps.loaded[mod.src] = args.launched;
				theory.on('ThEoRy_DePs').emit();
			} return args.launched.launch;	
		}}; args.on = theory.on('ThEoRy_DePs').event(args.cb);
		args.start = function(){util.deps(mod.dependencies,args); return args.cb()}
		args.name = function(src){
			module.on = args.name = false;
			root.deps.alias[args.src = mod.src = src] = mod.name;
			if((root.deps.all[src] = mod.dependencies)){
				root.deps.loaded[src] = 2;
			} if(!window.JSON){module.ajax.load(root.opts.JSON||location.local // JSON shim when needed
				+"//ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js",args.start)
			} else { return args.start() };
		}; module.on = (!(require||{}).ing)? args.name(util.src(1))||false : args.name;
	});
	util.deps = (function(deps, opt){
		opt = opt || {};
		a.obj(deps).each(function(v,i){
			var path = i, dopt = {p:i};
			if(opt.src){
				delete deps[i];
				deps[path = util.resolve(opt.src, util.pathify(path))] = v;
			} if(a.list.is(v)){
				delete deps[i];
				v = deps[path] = a.list(v).each(function(w,i,t){t(util.resolve(opt.src,util.pathify(w)),1)})
			} if(a.obj.is(v)){
				dopt.defer = v;
				opt.flat && util.deps(v,{flat: opt.flat});
			} if(v && a.text.is(v)){
				dopt.name = v;
			} if(opt.flat){
				var url = util.urlify(util.pathify(path));
				if((i = opt.flat[url]) && i !== 1){ return }
				opt.flat[url] = (opt.sub? 1 : dopt.name) || util.stripify(path);
				if(i !== 1 && url && a.text.is(url) && (v = root.deps.all[url])){
					(a.obj.is(v) || a.list.is(v)) && util.deps(v,{flat: opt.flat, sub:1});
				} return;
			} return util.load(path, dopt);
		});
		return opt.flat;
	});
	util.urlify = (function(url){ // via SO, IE6+ safe
		if(!root.page){ return url; }
		var el= document.createElement('div');
		el.innerHTML= '<a href="'+url+'">x</a>';
		return el.firstChild.href;
	});
	util.pathify = (function(p){
		if(!root.page){ return p; }
		return p = (/\.js$/i.test(p))? p : p+'.js'; 
	});
	util.stripify = (function(p){
		if(!a.text.is(p)){ return ''; } p=p.replace(/^\./,'');
		return (p.split(require.sep).reverse()[0]).replace(/\.js$/i,'');
	});
	util.resolve = (function(p1, p2){ // via browserify
		if('.' != p2.charAt(0)){ return p2.replace('/',require.sep) }
		var path = p1.replace('/',require.sep).split(require.sep)
		, segs = p2.replace('/',require.sep).split(require.sep)
		path.pop();
		for(var i=0;i<segs.length;i++){
			var seg = segs[i];
			if('..' == seg){ path.pop() }
			else if('.' != seg){ path.push(seg) }
		} return path.join(require.sep);
	});
	util.load = (function(p, opt ,z){
		if(util.stripify(p) == util.stripify(theory.Name)){
			return util.require;
		} opt = opt || {};
		{var w=root.deps.wait;if(module.sync){if(!z && !a.obj.empty(w)){
			w[p] = opt;if(opt.defer){w=root.deps.wait = a.obj(w).u(opt.defer)}return;
		}w[p] = opt;if(opt.defer){w=root.deps.wait = a.obj(w).u(opt.defer)}}}
		var path = util.pathify(p), url = util.urlify(path)
		, cb = (function(d){
			if(false !== d){
				console.log(opt.p||p, ' loaded');
				root.deps.loaded[url] = 1;
				module.on && module.on(url);
				theory.fns.is(opt) && opt(d);
			} theory.on('ThEoRy_DePs').emit();
			!module.sync && opt.defer && util.deps(opt.defer, opt);
			{if(module.sync){delete w[p];if(!a.obj(w).each(function(v,i,t){
			delete w[i];util.load(i,v,1);return 1;})){w=root.deps.wait = false}}}
		}); if(root.deps.loaded[url] 
		|| root.deps.loaded[url] === 0){
			return cb(false); 
		} root.deps.loaded[url] = 0;
		(require||{}).ing=true;
		try{window.module.ajax.load(path,cb);}
		catch(e){console.log("Network error.")};
		console.log('loading', opt.p||p);
	});	
	util.sandbox = (function(s,n){
		try{ // via jQuery
			(window.execScript || function(s){
				window["eval"].call(window, s);
			})(s);
		}catch(e){
			console.log("sandbox fail: "+n);
			console.log(e, s);
		}
	});
	util.theorycount = 0;
	util.src = (function(){
		var s = document.getElementsByTagName('script');
		s = (s[s.length-1]||{}).src;
		return util.stripify(s) === theory.Name? location : s||location;
	});
	util.init = (function(r){
		if(!root.page){ return }
		var z='', s = document.getElementsByTagName('script'), t;
		for(var i in s){var v = s[i]; // IE6 fails on each, use for instead
			r = v.src||r;
			if(v.id || !v.innerHTML || util.stripify(v.src) 
			!== util.stripify(theory.Name)){ false;
			} else { t = v }
		} if(t){
			util.sandbox(t.innerHTML,'Theory Configuration');
			t.id = "theory"+util.theorycount++;
		}
		return r;
	});
	root.init = (function(){
		root.pollute();
		return util.init;
	})();
})()};