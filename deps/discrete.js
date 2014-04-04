module.exports=require('theory')((function(){
	var discrete = {};
	discrete.name = 'discrete';
	discrete.author = 'Mark';
	discrete.version = 1.2;
	root.opts.discrete = root.opts.discrete||{};
	discrete.dep = [];
	window.jQuery? '': root.opts.discrete.jquery?
	discrete.dep.push(root.opts.discrete.jquery) : console.log('Error: Needs jQuery! Include it or assign a path to `root.opts.discrete.jquery`');
	discrete.init = (function(a){
		console.log('discrete.init');
		function the(){ return the };
		the.os = (function(){
			function os(){ return os };
			var ua = navigator.userAgent, lua = a.text.low(ua);
			os.is = (function(){
				function is(q){ 
					return (q)?(is.win||is.lin||is.mac||is.and||is.ios||"unknown"):is;
				} if(root.page){
					is.win = (ua.search("Win") >= 0)? "Windows":false;
					is.lin = (ua.search("Linux") >= 0)? "Linux":false;
					is.mac = (ua.search("Mac") >= 0)? "Macintosh":false
					is.and = (lua.search("android") >= 0)? "Android":false
					is.ios = (lua.search('ipod') >= 0 
						|| lua.search('iphone') >= 0 
						|| lua.search('ipad') >= 0)? "iOS":false
				} else {
					is.node = true;
				} return is;
			})();
			os.wkv = a.num.dec(a.list(ua.match(/AppleWebKit\/([\d\.]+)/)).at(-1));
			if(os.is.and){
				var s = '', v = a.list(ua.match(/Android\s+([\d\.]+)/)).at(-1);
				a.list(a.num(v).ify([])).each(function(v,i){
					s += (v*100+'').slice(0,3);
				});
				os.version = os.V = a.num.ify(s);
			} return os;
		})();
		the.device = (function(){
			function device(){ return device };
			device.is = (function(){
				function is(){ return is };
				is.touch = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch); // via Modernizer
				is.oriented = ('onorientationchange' in window) || ('orientation' in window);
				return is;
			})();
			device.size = (function(){
				function size(){ return size };
				size.x = size.width = screen.width;
				size.y = size.height = screen.height;
				return size;
			})();
			device.rotate = (function(fn){
				if(a.fns.is(fn)){
					return a.on('discrete-rotate').event(fn);
				}
				device.vertical = ($(window).height() > $(document).width())? true : false;
				device.horizontal = !device.vertical;
				a.on('discrete-rotate').emit();
			});
			return device;
		})();
		the.event = (function(){ // TODO: MARK: RE-EXAMINE NOW THAT THEORY SUPPORTS EVENTS.
			var event = {}, events = [];
			event.arg = (function(args,w,h){
				var m = {way:w,how:h};
				var jq = a.list(args.o).at(1);
				if(jq){
					m.where = jq.jquery? jq : $(jq);
					m.what = a.text.caps(a.list(args.t).at(1));
				}else{
					if(args.t.length == 2){
						m.what = a.text.caps(a.list(args.t).at(1));
						m.where = $(a.list(args.t).at(2));
					}else{
						m.where = $(a.list(args.t).at(1));
					}
				}
				m.cb = a.list(args.f).at(1);
				events.push(m);
				return m;
			});
			event.emit = (function(e){
				//console.log("--");
				a.list(events).each(function(v,i){
					if(v.way && e.way != v.way){
						return;
					}
					if(v.how && e.how != v.how){
						return;
					}
					if(v.what && a.text.caps(e.what) != v.what){
						return;
					}
					//console.log(e.way +" == "+ v.way +" :: "+ e.how +" == "+ v.how +" :: "+ e.what +" == "+ v.what);
					if(
						v.where[0] == window || v.where.is(document) || 
						$(e.where).closest(v.where.selector||v.where).length
					){
						v.cb(e);
					}
				});
			});
			return event;
		})();
		the.mouse = (function(){
			function mouse(){ return mouse; }
			mouse.x = 0;
			mouse.y = 0;
			mouse.left = false;
			mouse.right = false;
			mouse.move = (function(e){
				var m = the.event.arg(a.fns.sort(a.list.slit.call(arguments, 0)),mouse.name,'move');
			});
			mouse.down = (function(e){
				var m = the.event.arg(a.fns.sort(a.list.slit.call(arguments, 0)),mouse.name,'down');
			});
			mouse.up = (function(h,fn,e){
				var m = the.event.arg(a.fns.sort(a.list.slit.call(arguments, 0)),mouse.name,'up');
			});
			mouse.click = (function(e){
				var m = the.event.arg(a.fns.sort(a.list.slit.call(arguments, 0)),mouse.name,'click');
			});
			mouse.dbl = (function(e){
				var m = the.event.arg(a.fns.sort(a.list.slit.call(arguments, 0)),mouse.name,'dbl');
			});
			mouse.point = (function(s,h,v){ // WARNING! This uses some potentially dangerous tricks which might not work for your page.
				var stack = [], d = [], c = 0, e, e_, b = $('body'), scroll = b.scrollTop(), x = true;
				if(document.elementFromPoint){
					while(x 
						&& (e=the.mouse.at(h||the.mouse.horizontal,v||the.mouse.vertical))
						&& e.style && e.nodeName != 'HTML'
					){
						if(s && $ && $(e).is(s)){
							x = false;
						} if(e == e_){
							e.style.display = 'none';
						} else {
							w = e.style.cssText;
							e.style.width = e.style.maxWidth = e.style.minWidth = 
								e.style.paddingLeft = e.style.paddingRight = 
								e.style.marginLeft = e.style.marginRight = 
								e.style.mouseStacker = 0;
							stack.push(e_=e);
							d.push(w)
						}
					}
				} else if(window.event) {
					stack.push(window.event.target);
				}
				a.list(stack).each(function(e,i){
					e.style.cssText = d[--i];
				});
				b.scrollTop(scroll);
				return stack;
			});
			mouse.poke = (function(e,t,c){
				if(!e.time && !t){ return 0 }
				if(e.time && e.time.scroll != $(document).scrollTop()){ return 0 } // TODO: BUG: Potential? HACK: if scroll pos changed since down, then no go.
				c = c || [];
				c[0] = c[0] || c[0] === 0? c[0] : the.mouse._x;
				c[1] = c[1] || c[1] === 0? c[1] : the.mouse._y;
				if(a.time.is() - (t||e.time.up) < the.touch.opt.dbl && (
					Math.abs(the.mouse.x - c[0]) <= the.touch.opt.radius
					&& Math.abs(the.mouse.y - c[1]) <= the.touch.opt.radius
				)){ return 2 }
				if(a.time.is() - (t||e.time.down) < the.touch.opt.click && (
					Math.abs(the.mouse.x - c[0]) <= the.touch.opt.radius
					&& Math.abs(the.mouse.y - c[1]) <= the.touch.opt.radius
				)){ return 1 }
				return 0;
			});
			mouse.hold = (function(e,r){
				if(!e.time){ return 0 }
				if(e.time.scroll != $(document).scrollTop()){ return 0 } // TODO: BUG: Potential? HACK: if scroll pos changed since down, then no go.
				if(Math.abs(the.mouse.x - the.mouse._x) <= (r||the.touch.opt.radius)
					&& Math.abs(the.mouse.y - the.mouse._y) <= (r||the.touch.opt.radius)
				){
					return a.time.is() - e.time.down;
				} return 0;
			});
			mouse.which = (function(e){
				if(e.way != 'mouse'){ return 'left' }
				function left(e){
					if (e.which) {
						if(e.which == 3) return false;
						else if(e.which == 1) return true;
					} else if (e.button) {
						if(e.button == 2) return false;
						else if(e.button == 1) return true;
					}
				}
				function right(e){
					return !left(e);
				}
				if(left(e)) {
					mouse.left = true;
					return "left";
				} else if(right(e)) {
					mouse.right = true;
					return "right";
				}
			});
			mouse.on = (function(){
				var on = {};
				on.time = {down:0,up:0};
				on.down = (function(e){
					if(!e) return false;
					e.way = mouse.name;
					e.how = 'down';
					e.where = e.target;
					e.what = mouse.which(e);
					e[e.what] = true;
					mouse._x = mouse.x;
					mouse._y = mouse.y;
					mouse.horizontal = e.clientX;
					mouse.vertical = e.clientY;
					on.time.down = a.time.is();
					on.time.scroll = $(document).scrollTop();
					the.event.emit(e);
					return true; // DETERMINE EXCEPTIONS
				});
				on.up = (function(e){
					if(!e) return false;
					e.way = mouse.name;
					e.where = e.target;
					e.what = mouse.which(e);
					e[e.what] = true;
					on.poke(e,on.time);
					e.how = 'up';
					e.time = on.time;
					the.event.emit(e,on.time);
					on.time.up = a.time.is();
					mouse[e.what] = false;
					return true;
				});
				on.move = (function(e){
					if(!e) return false;
					e.way = mouse.name;
					e.how = 'move';
					e.where = e.target;
					mouse.x_ = mouse.x;
					mouse.y_ = mouse.y;
					mouse.horizontal = e.clientX;
					mouse.vertical = e.clientY;
					if(e.pageX || e.pageY){
						mouse.x = e.pageX;
						mouse.y = e.pageY;
						mouse.target = e.target;
					} else if(e.clientX || e.clientY){
						mouse.x = e.clientX + document.body.scrollLeft
							+ document.documentElement.scrollLeft;
						mouse.y = e.clientY + document.body.scrollTop
							+ document.documentElement.scrollTop;
						mouse.target = e.srcElement;
					}
					the.event.emit(e);
				});
				on.poke = (function(e,t){ return });
				on.click = (function(e,p){
					if(!e) return false;
					e.how = 'click';
					e.where = e.where||e.target;
					e.what = mouse.which(e);
					e[e.what] = true;
					e.way = p? mouse.name : e.way||mouse.name;
					the.event.emit(e);
					mouse[e.what] = false;
					return true;
				});
				on.dbl = (function(e){
					if(!e) return false;
					e.way = e.way||mouse.name;
					e.how = 'dbl';
					e.where = e.where||e.target;
					e.what = mouse.which(e);
					e[e.what] = true;
					the.event.emit(e);
					mouse[e.what] = false;
					return true;
				});
				return on;
			})();
			return mouse;
		})();
		the.key = (function(){
			function key($){
				key.$ = $ !== undefined? $ : undefined;
				return key;
			}
			key.e = window.event;
			key.is = '';
			key._is = '';
			key.combo = [];
			key.trail = [];
			key.opt = {forget:1000};
			key.down = (function(h,fn,e){
				var m = key.on.arg(key.$, a.fns.sort(a.list.slit.call(arguments, 0)));
				m.down = m.cb;
				key.on.arch(m,key.on.down_,'-'); // this makes '-' unusuable if we're splitting on it, need to add option for this and handle runs, combos, etc.
			});
			key.hold = (function(h,fn,e){
				var m = key.on.arg(key.$, a.fns.sort(a.list.slit.call(arguments, 0)));
				m.hold = m.cb;
				key.on.arch(m,key.on.hold_,'-'); // same as above
			});
			key.up = (function(h,fn,e){
				var m = key.on.arg(key.$, a.fns.sort(a.list.slit.call(arguments, 0)));
				m.up = m.cb;
				key.on.arch(m,key.on.up_,'-'); // same as above
			});
			key.on = (function(m){
				var on = {}, level = [], arch;
				on.arg = (function(k, args){
					var m = {};
					m.key = k || a.text.caps(a.list(args.t).at(1));
					m.key = (m.key === '')? 'all' : m.key;
					m.cb = a.list(args.f).at(1);
					var jq = a.text.caps(a.list(args.o).at(1));
					if(jq){
						m.jq = jq.jquery? jq : $(jq);
					}else{
						jq = a.text.caps(a.list(args.t).at(2));
						jq = (jq === 'DOCUMENT')? window.document : (jq === 'WINDOW')? window : '';
						m.jq = $(jq);
					}
					return m;
				});
				on.down = (function(e){
					if(!e) return false;
					e.way = key.name;
					e.where = e.target;
					e.code = e.keyCode;
					e.tag = e.key = key._is = a.text.caps(key.tag(e));
					key.e = e;
					e.how = 'hold';
					key.on.emit(e,key.on.hold_);
					if(key.on[key._is]) return a("key.tame->")();
					key.e.how = e.how = 'down';
					key.on[key.is = key._is] = true;
					key.on.emit(e,key.on.down_);
					key.combo.push(key.is);
					key.trail.push(key.is);
					key.trail = key.trail.slice(-12);
					return a(the,"key.tame->")(e);
				});
				on.up = (function(e){
					if(!e) return false;
					e.way = key.name;
					e.how = 'up';
					e.where = e.target;
					e.code = e.keyCode;
					e.tag = e.key = key.is_ = a.text.caps(key.tag(e));
					key.e = e;
					key.on[key.is_] = false;
					key.combo = a.list(key.combo).each(function(v,i,t){
						if(v === key.is_){ return } 
						t(v);
					})||[];
					key.on.emit(e,key.on.up_);
					key.is = '';
					return true; // DETERMINE EXCEPTIONS
				});
				on.arch = (function(m,w,s){
					var arch = w, al;
					m.key = a.text.caps(m.key);
					al = m.key.split(s);
					a.list(al).each(function(u,h){
						if(!a.obj.get(arch,u)){
							if(al.length == h){
								arch[u] = {map:m};
							}else{
								arch[u] = {};
							}
						}
						arch = arch[u];
					});
				});
				on.emit = (function(e,w){
					var r;
					a(w,'ALL.map.'+e.how+'->')(e);
					arch = a.list(level).at(-1)||w;
					if(r = arch[e.tag]){
						a.time.stop(on.forget);
						a(r,'map.'+e.how+'->')(e);
						if(a.obj(r).each(function(v,i){
							if(a.obj.is(v) && i != 'map') return true;
						})){
							level.push(r);
						}
						on.forget = a.time.wait(function(){
							level = [];
						},key.opt.forget);
						return;
					}
				});
				on.forget;
				on.down_ = {};
				on.hold_ = {};
				on.up_ = {};
				return on;
			})();
			key.tag = (function(code){
				if(!code) return false;
				code = (code.keyCode)?code.keyCode:code;
				code = (typeof code == 'number')? 'kc'+code:code;
				return key.special[code] || String.fromCharCode(a.num.ify(code.substring(2)));
			});
			key.code = (function(tag){
				if(!tag) return false;
				return (key.special[tag.toLowerCase()])? key.special[tag.toLowerCase()] : a.text.caps(tag).charCodeAt(0);
			});
			key.tame = function(){return !(key._is in key.strange)};
			key.strange = {' ':1,ERASE:1};
			key.reserved = {Z:1,X:1,C:1,V:1,R:1,T:1,N:1,F12:1,F11:1,PU:1,PD:1,pu:1,pd:1}; // reserved keys
			key.special = {
				'esc':27
				,'kc27': 'esc'
				,'tab':9
				,'kc9':'tab'
				,' ':32
				,'kc32':' '
				,'enter':13
				,'kc13':'enter'
				,'erase':8
				,'kc8': 'erase'
				
				,'kc92':'\\'
				,'\\':92
				
				,'scroll':145
				,'kc145':'scroll'
				,'caps':20
				,'kc20':'caps'
				,'num':144
				,'kc144':'num'
				
				,'pause':19
				,'kc19':'pause'
				
				,'insert':45
				,'kc45':'insert'
				,'home':36
				,'kc36':'home'
				,'delete':46
				,'kc46':'del'
				,'end':35
				,'kc35':'end'
				
				,'pu':33
				,'kc33':'pu'
				
				,'pd':34
				,'kc34':'pd'
				
				,'left':37
				,'kc37':'left'
				
				,'up':38
				,'kc38':'up'

				,'right':39
				,'kc39':'right'

				,'down':40
				,'kc40':'down'
				
				,'shift':16
				,'kc16':'shift'
				,'ctrl':17
				,'kc17':'ctrl'
				,'alt':18
				,'kc18':'alt'
				,'¤':91
				,'cmd':91
				,'kc91':((the.os.is.win||the.os.is.lin||the.os.is.and)?'¤':'cmd')
				
				,'kc91':'['
				,'[':91
				,'kc93':']'
				,']':93
				,'kc126':'`'
				,'`':126
				,'kc95':'-'
				,'-':95
				,'kc61':'='
				,'=':61
				,'kc59':';'
				,';':59
				,'kc222':"'"
				,"'":222
				,'kc47':'/'
				,'/':47
				,'kc62':'.'
				,'.':62
				,'kc44':','
				,',':44
				
				,'f1':112
				,'kc112':'F1'
				,'f2':113
				,'kc113':'F2'
				,'f3':114
				,'kc114':'F3'
				,'f4':115
				,'kc115':'F4'
				,'f5':116
				,'kc116':'F5'
				,'f6':117
				,'kc117':'F6'
				,'f7':118
				,'kc118':'F7'
				,'f8':119
				,'kc119':'F8'
				,'f9':120
				,'kc120':'F9'
				,'f10':121
				,'kc121':'F10'
				,'f11':122
				,'kc122':'F11'
				,'f12':123
				,'kc123':'F12'
			};
			return key;
		})();
		the.touch = (function(){
			var touch = {};
			a.log(touch.name = 'touch');		
			touch.opt = {
				click: 250
				,dbl: 500
				,radius: 50
				,mouse: true
				,react: true
			}
			touch.count = 0;
			touch.point = [{},{},{},{},{},{},{},{},{},{},{}];
			touch.move = (function(e){
				var m = the.event.arg(a.fns.sort(a.list.slit.call(arguments, 0)),touch.name,'move');
			});
			touch.down = (function(e){
				var m = the.event.arg(a.fns.sort(a.list.slit.call(arguments, 0)),touch.name,'down');
			});
			touch.up = (function(e){
				var m = the.event.arg(a.fns.sort(a.list.slit.call(arguments, 0)),touch.name,'up');
			});
			touch.gest = (function(b,c,fn){			
				var gest = {};
				a.log(gest.name = 'gest');
				gest.angle = 0;
				gest.scale = 1.0;
				gest.start = (function(e){
				
				});
				gest.morph = (function(e){
					gest.angle = e.rotation;
					gest.scale = e.scale;
					$(document).trigger('touch/gest/morph');
				});
				gest.end = (function(e){
				
				});
				return gest;
			})();
			touch.time = {down:0,up:0};
			touch.on = (function(){
				var on = {};
				on.down = (function(e){
					the.mouse.target = false;
					var multi = e.touches || [{}], on = e.changedTouches;
					the.mouse._x = the.mouse.x_ = the.mouse.x = multi[0].pageX;
					the.mouse._y = the.mouse.y_ = the.mouse.y = multi[0].pageY;
					the.mouse.horizontal = multi[0].clientX;
					the.mouse.vertical = multi[0].clientY;
					touch.count = multi.length;
					a.list(multi).each(function(v,i){
						v._x = v.x_ = v.x = v.pageX;
						v._y = v.y_ = v.y = v.pageY;
						touch.point[v.id = i] = v||{};
					});
					e.way = touch.name;
					e.what = touch.count;
					e.where = multi[0].target;
					e.stun = jQuery.Event.stun;
					e.stop = jQuery.Event.stop;
					e.how = 'down';
					touch.time.down = a.time.is();
					touch.time.scroll = $(document).scrollTop();
					the.event.emit(e);
				});
				on.move = (function(e){
					var multi = e.touches || [{}];
					the.mouse.x = the.mouse.x_ = multi[0].pageX;
					the.mouse.y = the.mouse.y_ = multi[0].pageY;
					the.mouse.horizontal = multi[0].clientX;
					the.mouse.vertical = multi[0].clientY;
					a.list(multi).each(function(v,i){
						v.x = v.x_ = v.pageX;
						v.y = v.y_ = v.pageY;
						if(!v.id) touch.point[v.id = i] = v||{}; // Android does not update without this.
					});
					e.way = touch.name;
					e.how = 'move';
					e.where = multi[0].target;
					e.what = touch.count;
					e.stun = jQuery.Event.stun;
					e.stop = jQuery.Event.stop;
					the.event.emit(e);
				});
				on.up = (function(e){
					var t = a.time.is(), multi = e.changedTouches;
					e.what = touch.count;
					if((touch.count = multi.length) == 0){
						touch.point = [{},{},{},{},{},{},{},{},{},{},{}];
					}
					e.way = touch.name;
					e.where = multi[0].target;
					e.stun = jQuery.Event.stun;
					e.stop = jQuery.Event.stop;
					if(touch.count === 1){ the.mouse.on.poke(e,touch.time) }
					e.how = 'up';
					e.time = touch.time;
					the.event.emit(e);
					touch.time.up = a.time.is();
				});
				return on;
			})();
			touch.feel = (function(e){
				touch.opt.react = e = a.bi.is(e)?e:!touch.opt.react;
				if(e){
					try{
						document.addEventListener("touchmove", touch.on.move, true);
						document.addEventListener('touchstart', touch.on.down, true);
						document.addEventListener('touchend', touch.on.up, true);
						document.addEventListener("gesturechange", touch.gest.morph, true);
						document.addEventListener('gesturestart', touch.gest.start, true);
						document.addEventListener('gestureend', touch.gest.end, true);
					}catch(e){
					}
				} else {
					console.log('touchless ?');
					try{
						document.removeEventListener("touchmove", touch.on.move, true);
						document.removeEventListener('touchstart', touch.on.down, true);
						document.removeEventListener('touchend', touch.on.up, true);
						document.removeEventListener("gesturechange", touch.gest.morph, true);
						document.removeEventListener('gesturestart', touch.gest.start, true);
						document.removeEventListener('gestureend', touch.gest.end, true);
					}catch(e){
					}
				}
			});
			return touch;
		})();
		the.drag = (function(){
			var drag = {};
			a.log(drag.name = 'drag');		
			drag.enter = (function(e){
				$(document).trigger('dragenter',[e]);
			});
			drag.over = (function(e){
				$(document).trigger('dragover',[e]);
			});
			drag.drop = (function(e){
				$(document).trigger('mousemove',[e]);
				$(document).trigger('dragdrop',[e]);
				e.preventDefault();
				return false;
			});
			drag.change = (function(e){
				$(document).trigger('dragchange',[e]);
			});
			return drag;
		})();
		the.doc = doc = {}
		/** -------- INITIATE JQUERY BINDINGS -------- **/
		if(root.page){
			$(document).ready(function(){
				jQuery.Event.stun = (function(e){(e||this).preventDefault();return (e||this)});
				jQuery.Event.stop = (function(e){(e||this).stopPropagation();return (e||this)});
				jQuery.Event.prototype.stun = jQuery.Event.stun;
				jQuery.Event.prototype.stop = jQuery.Event.stop;
				$(document).scroll(function(e){
					//the.touch.scroll = a.time.is(); iOS calls scroll after touch/mouse events.
				}).mousemove(function(e,el){
					if(el) e = el;
					if(!e) var e = window.event;
					e.stopPropagation();e.preventDefault();
					the.mouse.on.move(e);
				}).mousedown(function(e){
					if(!e) var e = window.event;
					if(the.mouse.on.down(e)){
						return true;
					}
					e.stopPropagation();e.preventDefault();
				}).mouseup(function(e){
					if(!e) var e = window.event;
					if(the.mouse.on.up(e)){
						return true;
					}
					e.stopPropagation();e.preventDefault();
				}).click(function(e){ // iOS only emits on clickable elements
					the.mouse.on.click(e);
				}).dblclick(function(e){
					the.mouse.on.dbl(e);
				}).keydown(function(e){
					if(the.key.on.down(e)){ return true }
				}).keyup(function(e){
					if(the.key.on.up(e)){ return true }
				});
				/** -- DEFAULT SETTINGS -- **/
				$(document).on('focus',"textarea, input, [contenteditable=true]",function(){
					the.key.combo = []; // iOS not trigger 'keyup' sometimes on input exits, so clear combo manually.
					the.key.tame = function(){return true};
				}).on('blur',"textarea, input, [contenteditable=true]",function(){
					the.key.combo = []; // iOS not trigger 'keyup' sometimes on input exits, so clear combo manually.
					the.key.tame = function(){return false}; // PREVENT UNLOAD & SCROLL BOTTOM
				});
				(document.body||{}).onorientationchange = the.device.rotate;
			});
			(function(window){
				the.touch.feel(the.touch.opt.react);
				try{
					document.addEventListener('dragenter', the.drag.enter, false);
					document.addEventListener("change", the.drag.change, false);
					document.addEventListener('drop', the.drag.drop, false);
					document.addEventListener('dragover', the.drag.over, false);
				}catch(e){console.log("drag fail", e);};
				function afocus(e){
					if(e) if(e.target != window) return true;
					the.key.combo = [];
				};
				document.onfocusin = afocus;
				window.onfocus = afocus;
			})(window);
		}
		return the;
	});
	return discrete;
})());