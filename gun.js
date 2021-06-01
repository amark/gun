;(function(){

  /* UNBUILD */
  function USE(arg, req){
    return req? require(arg) : arg.slice? USE[R(arg)] : function(mod, path){
      arg(mod = {exports: {}});
      USE[R(path)] = mod.exports;
    }
    function R(p){
      return p.split('/').slice(-1).toString().replace('.js','');
    }
  }
  if(typeof module !== "undefined"){ var MODULE = module }
  /* UNBUILD */

	;USE(function(module){
		// Shim for generic javascript utilities.
		String.random = function(l, c){
			var s = '';
			l = l || 24; // you are not going to make a 0 length random number, so no need to check type
			c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
			while(l-- > 0){ s += c.charAt(Math.floor(Math.random() * c.length)) }
			return s;
		}
		String.match = function(t, o){ var tmp, u;
			if('string' !== typeof t){ return false }
			if('string' == typeof o){ o = {'=': o} }
			o = o || {};
			tmp = (o['='] || o['*'] || o['>'] || o['<']);
			if(t === tmp){ return true }
			if(u !== o['=']){ return false }
			tmp = (o['*'] || o['>'] || o['<']);
			if(t.slice(0, (tmp||'').length) === tmp){ return true }
			if(u !== o['*']){ return false }
			if(u !== o['>'] && u !== o['<']){
				return (t >= o['>'] && t <= o['<'])? true : false;
			}
			if(u !== o['>'] && t >= o['>']){ return true }
			if(u !== o['<'] && t <= o['<']){ return true }
			return false;
		}
		String.hash = function(s, c){ // via SO
			if(typeof s !== 'string'){ return }
	    c = c || 0; // CPU schedule hashing by
	    if(!s.length){ return c }
	    for(var i=0,l=s.length,n; i<l; ++i){
	      n = s.charCodeAt(i);
	      c = ((c<<5)-c)+n;
	      c |= 0;
	    }
	    return c;
	  }
		var has = Object.prototype.hasOwnProperty;
		Object.plain = function(o){ return o? (o instanceof Object && o.constructor === Object) || Object.prototype.toString.call(o).match(/^\[object (\w+)\]$/)[1] === 'Object' : false }
		Object.empty = function(o, n){
			for(var k in o){ if(has.call(o, k) && (!n || -1==n.indexOf(k))){ return false } }
			return true;
		}
		Object.keys = Object.keys || function(o){
			var l = [];
			for(var k in o){ if(has.call(o, k)){ l.push(k) } }
			return l;
		}
		;(function(){ // max ~1ms or before stack overflow 
			var u, sT = setTimeout, l = 0, c = 0, sI = (typeof setImmediate !== ''+u && setImmediate) || sT;
			sT.poll = sT.poll || function(f){
				if((1 >= (+new Date - l)) && c++ < 3333){ f(); return }
				sI(function(){ l = +new Date; f() },c=0)
			}
		}());
		;(function(){ // Too many polls block, this "threads" them in turns over a single thread in time.
			var sT = setTimeout, t = sT.turn = sT.turn || function(f){ 1 == s.push(f) && p(T) }
			, s = t.s = [], p = sT.poll, i = 0, f, T = function(){
				if(f = s[i++]){ f() }
				if(i == s.length || 99 == i){
					s = t.s = s.slice(i);
					i = 0;
				}
				if(s.length){ p(T) }
			}
		}());
		;(function(){
			var u, sT = setTimeout, T = sT.turn;
			sT.each = sT.each || function(l,f,e,S){ S = S || 9; (function t(s,L,r){
			  if(L = (s = (l||[]).splice(0,S)).length){
			  	for(var i = 0; i < L; i++){
			  		if(u !== (r = f(s[i]))){ break }
			  	}
			  	if(u === r){ T(t); return }
			  } e && e(r);
			}())}
		}());
	})(USE, './shim');

	;USE(function(module){
		// On event emitter generic javascript utility.
		module.exports = function onto(tag, arg, as){
			if(!tag){ return {to: onto} }
			var u, f = 'function' == typeof arg, tag = (this.tag || (this.tag = {}))[tag] || f && (
				this.tag[tag] = {tag: tag, to: onto._ = { next: function(arg){ var tmp;
					if(tmp = this.to){ tmp.next(arg) }
			}}});
			if(f){
				var be = {
					off: onto.off ||
					(onto.off = function(){
						if(this.next === onto._.next){ return !0 }
						if(this === this.the.last){
							this.the.last = this.back;
						}
						this.to.back = this.back;
						this.next = onto._.next;
						this.back.to = this.to;
						if(this.the.last === this.the){
							delete this.on.tag[this.the.tag];
						}
					}),
					to: onto._,
					next: arg,
					the: tag,
					on: this,
					as: as,
				};
				(be.back = tag.last || tag).to = be;
				return tag.last = be;
			}
			if((tag = tag.to) && u !== arg){ tag.next(arg) }
			return tag;
		};
	})(USE, './onto');

	;USE(function(module){
		USE('./shim');
		module.exports = function(v){ // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
			if(v === undefined){ return false }
			if(v === null){ return true } // "deletes", nulling out keys.
			if(v === Infinity){ return false } // we want this to be, but JSON does not support it, sad face.
			if(v !== v){ return false } // can you guess what this checks for? ;)
			if('string' == typeof v // text!
			|| 'boolean' == typeof v
			|| 'number' == typeof v){
				return true; // simple values are valid.
			}
			if(v && ('string' == typeof (v['#']||0)) && Object.empty(v, ['#'])){ return v['#'] } // is link
			return false; // If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
		}
	})(USE, './valid');

	;USE(function(module){
		USE('./shim');
		function State(){
			var t = +new Date;
			if(last < t){
				return N = 0, last = t + State.drift;
			}
			return last = t + ((N += 1) / D) + State.drift;
		}
		State.drift = 0;
		var NI = -Infinity, N = 0, D = 999, last = NI, u; // WARNING! In the future, on machines that are D times faster than 2016AD machines, you will want to increase D by another several orders of magnitude so the processing speed never out paces the decimal resolution (increasing an integer effects the state accuracy).
		State.is = function(n, k, o){ // convenience function to get the state on a key on a node and return it.
			var tmp = (k && n && n._ && n._['>']) || o;
			if(!tmp){ return }
			return ('number' == typeof (tmp = tmp[k]))? tmp : NI;
		}
		State.ify = function(n, k, s, v, soul){ // put a key's state on a node.
			(n = n || {})._ = n._ || {}; // safety check or init.
			if(soul){ n._['#'] = soul } // set a soul if specified.
			var tmp = n._['>'] || (n._['>'] = {}); // grab the states data.
			if(u !== k && k !== '_'){
				if('number' == typeof s){ tmp[k] = s } // add the valid state.
				if(u !== v){ n[k] = v } // Note: Not its job to check for valid values!
			}
			return n;
		}
		module.exports = State;
	})(USE, './state');

	;USE(function(module){
		USE('./shim');
		function Dup(opt){
			var dup = {s:{}}, s = dup.s;
			opt = opt || {max: 999, age: 1000 * 9};//*/ 1000 * 9 * 3};
			dup.check = function(id){
				if(!s[id]){ return false }
				return dt(id);
			}
			var dt = dup.track = function(id){
				var it = s[id] || (s[id] = {});
				it.was = dup.now = +new Date;
				if(!dup.to){ dup.to = setTimeout(dup.drop, opt.age + 9) }
				return it;
			}
			dup.drop = function(age){
				dup.to = null;
				dup.now = +new Date;
				var l = Object.keys(s);
				console.STAT && console.STAT(dup.now, +new Date - dup.now, 'dup drop keys'); // prev ~20% CPU 7% RAM 300MB // now ~25% CPU 7% RAM 500MB
				setTimeout.each(l, function(id){ var it = s[id]; // TODO: .keys( is slow?
					if(it && (age || opt.age) > (dup.now - it.was)){ return }
					delete s[id];
				},0,99);
			}
			return dup;
		}
		module.exports = Dup;
	})(USE, './dup');

	;USE(function(module){
		// request / response module, for asking and acking messages.
		USE('./onto'); // depends upon onto!
		module.exports = function ask(cb, as){
			if(!this.on){ return }
			if(!('function' == typeof cb)){
				if(!cb || !as){ return }
				var id = cb['#'] || cb, tmp = (this.tag||'')[id];
				if(!tmp){ return }
				tmp = this.on(id, as);
				clearTimeout(tmp.err);
				return true;
			}
			var id = (as && as['#']) || Math.random().toString(36).slice(2);
			if(!cb){ return id }
			var to = this.on(id, cb, as);
			to.err = to.err || setTimeout(function(){
				to.next({err: "Error: No ACK yet.", lack: true});
				to.off();
			}, (this.opt||{}).lack || 9000);
			return id;
		}
	})(USE, './ask');

	;USE(function(module){

		function Gun(o){
			if(o instanceof Gun){ return (this._ = {$: this}).$ }
			if(!(this instanceof Gun)){ return new Gun(o) }
			return Gun.create(this._ = {$: this, opt: o});
		}

		Gun.is = function($){ return ($ instanceof Gun) || ($ && $._ && ($ === $._.$)) || false }

		Gun.version = 0.2020;

		Gun.chain = Gun.prototype;
		Gun.chain.toJSON = function(){};

		USE('./shim');
		Gun.valid = USE('./valid');
		Gun.state = USE('./state');
		Gun.on = USE('./onto');
		Gun.dup = USE('./dup');
		Gun.ask = USE('./ask');

		;(function(){
			Gun.create = function(at){
				at.root = at.root || at;
				at.graph = at.graph || {};
				at.on = at.on || Gun.on;
				at.ask = at.ask || Gun.ask;
				at.dup = at.dup || Gun.dup();
				var gun = at.$.opt(at.opt);
				if(!at.once){
					at.on('in', universe, at);
					at.on('out', universe, at);
					at.on('put', map, at);
					Gun.on('create', at);
					at.on('create', at);
				}
				at.once = 1;
				return gun;
			}
			function universe(msg){
				if(!msg){ return }
				if(msg.out === universe){ this.to.next(msg); return }
				var eve = this, as = eve.as, at = as.at || as, gun = at.$, dup = at.dup, tmp, DBG = msg.DBG;
				(tmp = msg['#']) || (tmp = msg['#'] = text_rand(9));
				if(dup.check(tmp)){ return } dup.track(tmp);
				tmp = msg._; msg._ = ('function' == typeof tmp)? tmp : function(){};
				(msg.$ && (msg.$ === (msg.$._||'').$)) || (msg.$ = gun);
				if(msg['@'] && !msg.put){ ack(msg) }
				if(!at.ask(msg['@'], msg)){ // is this machine listening for an ack?
					DBG && (DBG.u = +new Date);
					if(msg.put){ put(msg); return } else
					if(msg.get){ Gun.on._get(msg, gun) }
				}
				DBG && (DBG.uc = +new Date);
				eve.to.next(msg);
				DBG && (DBG.ua = +new Date);
				if(msg.nts || msg.NTS){ return } // TODO: This shouldn't be in core, but fast way to prevent NTS spread. Delete this line after all peers have upgraded to newer versions.
				msg.out = universe; at.on('out', msg);
				DBG && (DBG.ue = +new Date);
			}
			function put(msg){
				if(!msg){ return }
				var ctx = msg._||'', root = ctx.root = ((ctx.$ = msg.$||'')._||'').root;
				if(msg['@'] && ctx.faith && !ctx.miss){ // TODO: AXE may split/route based on 'put' what should we do here? Detect @ in AXE?
					msg.out = universe;
					root.on('out', msg);
					return;
				}
				ctx.latch = root.hatch; ctx.match = root.hatch = [];
				var put = msg.put;
				var DBG = ctx.DBG = msg.DBG, S = +new Date;
				if(put['#'] && put['.']){ /*root && root.on('put', msg);*/ return } // TODO: BUG! This needs to call HAM instead.
				DBG && (DBG.p = S);
				ctx['#'] = msg['#'];
				ctx.msg = msg;
				ctx.all = 0;
				ctx.stun = 1;
				var nl = Object.keys(put).sort(); // TODO: This is unbounded operation, large graphs will be slower. Write our own CPU scheduled sort? Or somehow do it in below? Keys itself is not O(1) either, create ES5 shim over ?weak map? or custom which is constant.
				console.STAT && console.STAT(S, ((DBG||ctx).pk = +new Date) - S, 'put sort');
				var ni = 0, nj, kl, soul, node, states, err, tmp;
				(function pop(o){
					if(nj != ni){ nj = ni;
						if(!(soul = nl[ni])){
							console.STAT && console.STAT(S, ((DBG||ctx).pd = +new Date) - S, 'put');
							fire(ctx);
							return;
						}
						if(!(node = put[soul])){ err = ERR+cut(soul)+"no node." } else
						if(!(tmp = node._)){ err = ERR+cut(soul)+"no meta." } else
						if(soul !== tmp['#']){ err = ERR+cut(soul)+"soul not same." } else
						if(!(states = tmp['>'])){ err = ERR+cut(soul)+"no state." }
						kl = Object.keys(node||{}); // TODO: .keys( is slow
					}
					if(err){
						msg.err = ctx.err = err; // invalid data should error and stun the message.
						fire(ctx);
						//console.log("handle error!", err) // handle!
						//ctx.hatch && ctx.hatch(); // TODO: rename/rework how put & this interact.
						return;
					}
					var i = 0, key; o = o || 0;
					while(o++ < 9 && (key = kl[i++])){
						if('_' === key){ continue }
						var val = node[key], state = states[key];
						if(u === state){ err = ERR+cut(key)+"on"+cut(soul)+"no state."; break }
						if(!valid(val)){ err = ERR+cut(key)+"on"+cut(soul)+"bad "+(typeof val)+cut(val); break }
						//ctx.all++; //ctx.ack[soul+key] = '';
						ham(val, key, soul, state, msg);
					}
					if((kl = kl.slice(i)).length){ turn(pop); return }
					++ni; kl = null; pop(o);
				}());
			} Gun.on.put = put;
			console.log("TODO: Mark: HAM is unfinished, new acks, RAD, etc.");
			function ham(val, key, soul, state, msg){
				var ctx = msg._||'', root = ctx.root, graph = root.graph, lot, tmp;
				var vertex = graph[soul] || empty, was = state_is(vertex, key, 1), known = vertex[key];

				if(tmp = console.STAT){ if(!graph[soul] || !known){ tmp.has = (tmp.has || 0) + 1 } }

				var now = State(),u;
				if(state > now){ /*console.log("setTo");*/ /*setTo;*/ return } // TODO: BUG!!!!
				if(state < was){ /*console.log("old");*/ /*old;*/ if(!ctx.miss){ return } } // but some chains have a cache miss that need to re-fire. // TODO: Improve in future. // for AXE this would reduce rebroadcast, but GUN does it on message forwarding.
				if(!ctx.faith){ // TODO: BUG? Can this be used for cache miss as well?
					if(state === was && (val === known || L(val) <= L(known))){ /*console.log("same");*/ /*same;*/ return } // same
				}
				/*if(!is.incoming){
					if(is.defer){
						var to = state - machine;
						setTimeout(function(){
							ham(val, key, soul, state, msg);
						}, to > MD? MD : to); // setTimeout Max Defer 32bit :(
						if(!ctx.to){ root.on('in', {'@': msg['#'], err: to}) } ctx.to = 1; // TODO: This causes too many problems unless sending peers auto-retry.
						return to;
					}
					return;
				}*/
				//ctx.all++;
				ctx.stun++; // TODO: 'forget' feature in SEA tied to this, bad approach, but hacked in for now. Any changes here must update there.
				var aid = msg['#']+ctx.all++, id = {toString: function(){ return aid }, _: ctx}; // this *trick* makes it compatible between old & new versions.
				var DBG = ctx.DBG; DBG && (DBG.ph = DBG.ph || +new Date);
				root.on('put', {'#': id, '@': msg['@'], put: {'#': soul, '.': key, ':': val, '>': state}, _: ctx});
			}
			function map(msg){
				var DBG; if(DBG = (msg._||'').DBG){ DBG.pa = +new Date; DBG.pm = DBG.pm || +new Date}
      	var eve = this, root = eve.as, graph = root.graph, ctx = msg._, put = msg.put, soul = put['#'], key = put['.'], val = put[':'], state = put['>'], id = msg['#'], tmp;
      	if((tmp = ctx.msg) && (tmp = tmp.put) && (tmp = tmp[soul])){ state_ify(tmp, key, state, val, soul) } // necessary! or else out messages do not get SEA transforms.
				graph[soul] = state_ify(graph[soul], key, state, val, soul);
				if(tmp = (root.next||'')[soul]){ tmp.on('in', msg) }
				eve.to.next(msg);
				fire(ctx);
			}
			function fire(ctx, msg){ var root;
				if(ctx.stop){ return }
				if(--ctx.stun !== 0 && !ctx.err){ return } // TODO: 'forget' feature in SEA tied to this, bad approach, but hacked in for now. Any changes here must update there.
				ctx.stop = 1;
				if(!(root = ctx.root)){ return }
				var tmp = ctx.match; tmp.end = 1;
				if(tmp === root.hatch){ if(!(tmp = ctx.latch) || tmp.end){ delete root.hatch } else { root.hatch = tmp } }
				ctx.hatch && ctx.hatch(); // TODO: rename/rework how put & this interact.
				setTimeout.each(ctx.match, function(cb){cb && cb()}); 
				if(!(msg = ctx.msg) || ctx.err || msg.err){ return }
				msg.out = universe;
				ctx.root.on('out', msg);
			}
			function ack(msg){ // aggregate ACKs.
				var id = msg['@'] || '', root = (msg.$._||'').root, tmp;
				// TODO: check for the sharded message err and transfer it onto the original batch?
				if(!(tmp = id._)){ /*console.log("TODO: handle ack id.");*/ return }
				tmp.acks = (tmp.acks||0) + 1;
				if(0 == tmp.stun && tmp.acks == tmp.all){ // TODO: if ack is synchronous this may not work?
					root && root.on('in', {'@': tmp['#'], err: msg.err, ok: 'shard'});
				}
			}

			var ERR = "Error: Invalid graph!";
			var cut = function(s){ return " '"+(''+s).slice(0,9)+"...' " }
			var L = JSON.stringify, MD = 2147483647, State = Gun.state;

		}());

		;(function(){
			Gun.on._get = function(msg, gun){
				var root = gun._, get = msg.get, soul = get['#'], node = root.graph[soul], has = get['.'], tmp;
				var next = root.next || (root.next = {}), at = next[soul];
				// queue concurrent GETs?
				// TODO: consider tagging original message into dup for DAM.
				var ctx = msg._||{}, DBG = ctx.DBG = msg.DBG;
				DBG && (DBG.g = +new Date);
				if(!node){ return root.on('get', msg) }
				if(has){
					if('string' != typeof has || u === node[has]){ return root.on('get', msg) }
					node = state_ify(node, has, state_is(node, has), node[has]);
					// If we have a key in-memory, do we really need to fetch?
					// Maybe... in case the in-memory key we have is a local write
					// we still need to trigger a pull/merge from peers.
				}
				//Gun.window? Gun.obj.copy(node) : node; // HNPERF: If !browser bump Performance? Is this too dangerous to reference root graph? Copy / shallow copy too expensive for big nodes. Gun.obj.to(node); // 1 layer deep copy // Gun.obj.copy(node); // too slow on big nodes
				var S = +new Date;
				var ack = msg['#'], id = text_rand(9), keys = Object.keys(node||''), soul = ((node||'')._||'')['#'], kl = keys.length, j = 0;
				console.STAT && console.STAT(S, ((DBG||ctx).gk = +new Date) - S, 'got keys');
				// PERF: Consider commenting this out to force disk-only reads for perf testing? // TODO: .keys( is slow
				node && (function got(){
					S = +new Date;
					var i = 0, k, put = {};
					while(i < 9 && (k = keys[i++])){
						state_ify(put, k, state_is(node, k), node[k], soul);
					}
					keys = keys.slice(i);
					(tmp = {})[soul] = put; put = tmp;
					var faith = function(){}; faith.ram = faith.faith = true; // HNPERF: We're testing performance improvement by skipping going through security again, but this should be audited.
					tmp = keys.length;
					console.STAT && console.STAT(S, -(S - (S = +new Date)), 'got copied some');
					DBG && (DBG.ga = +new Date);
					root.on('in', {'@': ack, '#': id, put: put, '%': (tmp? (id = text_rand(9)) : u), ram: 1, $: gun, _: faith, DBG: DBG});
					console.STAT && console.STAT(S, +new Date - S, 'got in');
					//root.on('in', {'@': ack, '#': text_rand(9), put: put, '%': tmp? ((j+=i)+'/'+kl) : u, ram: 1, $: gun, _: faith}); console.log("???", j+'/'+kl);
					if(!tmp){ return }
					setTimeout.turn(got);
				}());
				root.on('get', msg); // send GET to storage adapters.
			}
		}());

		;(function(){
			Gun.chain.opt = function(opt){
				opt = opt || {};
				var gun = this, at = gun._, tmp = opt.peers || opt;
				if(!Object.plain(opt)){ opt = {} }
				if(!Object.plain(at.opt)){ at.opt = opt }
				if('string' == typeof tmp){ tmp = [tmp] }
				if(tmp instanceof Array){
					if(!Object.plain(at.opt.peers)){ at.opt.peers = {}}
					tmp.forEach(function(url){
						var p = {}; p.id = p.url = url;
						at.opt.peers[url] = at.opt.peers[url] || p;
					})
				}
				at.opt.peers = at.opt.peers || {};
				obj_each(opt, function each(k){ var v = this[k];
					if((this && this.hasOwnProperty(k)) || 'string' == typeof v || Object.empty(v)){ this[k] = v; return }
					if(v && v.constructor !== Object && !(v instanceof Array)){ return }
					obj_each(v, each);
				});
				Gun.on('opt', at);
				at.opt.uuid = at.opt.uuid || function uuid(l){ return Gun.state().toString(36).replace('.','') + String.random(l||12) }
				return gun;
			}
		}());

		var obj_each = function(o,f){ Object.keys(o).forEach(f,o) }, text_rand = String.random, turn = setTimeout.turn, valid = Gun.valid, state_is = Gun.state.is, state_ify = Gun.state.ify, u, empty = {}, C;

		Gun.log = function(){ return (!Gun.log.off && C.log.apply(C, arguments)), [].slice.call(arguments).join(' ') };
		Gun.log.once = function(w,s,o){ return (o = Gun.log.once)[w] = o[w] || 0, o[w]++ || Gun.log(s) };

		if(typeof window !== "undefined"){ (window.GUN = window.Gun = Gun).window = window }
		try{ if(typeof MODULE !== "undefined"){ MODULE.exports = Gun } }catch(e){}
		module.exports = Gun;
		
		(Gun.window||{}).console = (Gun.window||{}).console || {log: function(){}};
		(C = console).only = function(i, s){ return (C.only.i && i === C.only.i && C.only.i++) && (C.log.apply(C, arguments) || s) };

		;"Please do not remove welcome log unless you are paying for a monthly sponsorship, thanks!";
		Gun.log.once("welcome", "Hello wonderful person! :) Thanks for using GUN, please ask for help on http://chat.gun.eco if anything takes you longer than 5min to figure out!");
	})(USE, './root');

	;USE(function(module){
		var Gun = USE('./root');
		Gun.chain.back = function(n, opt){ var tmp;
			n = n || 1;
			if(-1 === n || Infinity === n){
				return this._.root.$;
			} else
			if(1 === n){
				return (this._.back || this._).$;
			}
			var gun = this, at = gun._;
			if(typeof n === 'string'){
				n = n.split('.');
			}
			if(n instanceof Array){
				var i = 0, l = n.length, tmp = at;
				for(i; i < l; i++){
					tmp = (tmp||empty)[n[i]];
				}
				if(u !== tmp){
					return opt? gun : tmp;
				} else
				if((tmp = at.back)){
					return tmp.$.back(n, opt);
				}
				return;
			}
			if('function' == typeof n){
				var yes, tmp = {back: at};
				while((tmp = tmp.back)
				&& u === (yes = n(tmp, opt))){}
				return yes;
			}
			if('number' == typeof n){
				return (at.back || at).$.back(n - 1);
			}
			return this;
		}
		var empty = {}, u;
	})(USE, './back');

	;USE(function(module){
		// WARNING: GUN is very simple, but the JavaScript chaining API around GUN
		// is complicated and was extremely hard to build. If you port GUN to another
		// language, consider implementing an easier API to build.
		var Gun = USE('./root');
		Gun.chain.chain = function(sub){
			var gun = this, at = gun._, chain = new (sub || gun).constructor(gun), cat = chain._, root;
			cat.root = root = at.root;
			cat.id = ++root.once;
			cat.back = gun._;
			cat.on = Gun.on;
			cat.on('in', Gun.on.in, cat); // For 'in' if I add my own listeners to each then I MUST do it before in gets called. If I listen globally for all incoming data instead though, regardless of individual listeners, I can transform the data there and then as well.
			cat.on('out', Gun.on.out, cat); // However for output, there isn't really the global option. I must listen by adding my own listener individually BEFORE this one is ever called.
			return chain;
		}

		function output(msg){
			var put, get, at = this.as, back = at.back, root = at.root, tmp;
			if(!msg.$){ msg.$ = at.$ }
			this.to.next(msg);
			if(get = msg.get){
				/*if(u !== at.put){
					at.on('in', at);
					return;
				}*/
				if(root.pass){ root.pass[at.id] = at; } // will this make for buggy behavior elsewhere?
				if(at.lex){ msg.get = obj_to(at.lex, msg.get) }
				if(get['#'] || at.soul){
					get['#'] = get['#'] || at.soul;
					msg['#'] || (msg['#'] = text_rand(9)); // A3120 ?
					back = (root.$.get(get['#'])._);
					if(!(get = get['.'])){
						tmp = back.ask && back.ask['']; // check if we have already asked for the full node
						(back.ask || (back.ask = {}))[''] = back; // add a flag that we are now.
						if(u !== back.put){ // if we already have data,
							back.on('in', back); // send what is cached down the chain
							if(tmp){ return } // and don't ask for it again.
						}
						/*if(obj_has(back, 'put')){
							back.on('in', back);
						}
						if(tmp && u !== back.put){ return } // if we already asked for it AND have data, don't ask again. */
						msg.$ = back.$;
					} else
					if(obj_has(back.put, get)){ // TODO: support #LEX !
						tmp = back.ask && back.ask[get];
						(back.ask || (back.ask = {}))[get] = back.$.get(get)._;
						back.on('in', {get: get, put: {'#': back.soul, '.': get, ':': back.put[get], '>': state_is(root.graph[back.soul], get)}});
						if(tmp){ return }
					}
						/*put = (back.$.get(get)._);
						if(!(tmp = put.ack)){ put.ack = -1 }
						back.on('in', {
							$: back.$,
							put: Gun.state.ify({}, get, Gun.state(back.put, get), back.put[get]),
							get: back.get
						});
						if(tmp){ return }
					} else
					if('string' != typeof get){
						var put = {}, meta = (back.put||{})._;
						Gun.obj.map(back.put, function(v,k){
							if(!Gun.text.match(k, get)){ return }
							put[k] = v;
						})
						if(!Gun.obj.empty(put)){
							put._ = meta;
							back.on('in', {$: back.$, put: put, get: back.get})
						}
						if(tmp = at.lex){
							tmp = (tmp._) || (tmp._ = function(){});
							if(back.ack < tmp.ask){ tmp.ask = back.ack }
							if(tmp.ask){ return }
							tmp.ask = 1;
						}
					}
					*/
					root.ask(ack, msg); // A3120 ?
					return root.on('in', msg);
				}
				//if(root.now){ root.now[at.id] = root.now[at.id] || true; at.pass = {} }
				if(get['.']){
					if(at.get){
						msg = {get: {'.': at.get}, $: at.$};
						(back.ask || (back.ask = {}))[at.get] = msg.$._; // TODO: PERFORMANCE? More elegant way?
						return back.on('out', msg);
					}
					msg = {get: {}, $: at.$};
					return back.on('out', msg);
				}
				(at.ask || (at.ask = {}))[''] = at;	 //at.ack = at.ack || -1;
				if(at.get){
					get['.'] = at.get;
					(back.ask || (back.ask = {}))[at.get] = msg.$._; // TODO: PERFORMANCE? More elegant way?
					return back.on('out', msg);
				}
			}
			return back.on('out', msg);
		}; Gun.on.out = output;

		function input(msg, cat){ cat = cat || this.as; // TODO: V8 may not be able to optimize functions with different parameter calls, so try to do benchmark to see if there is any actual difference.
			var root = cat.root, gun = msg.$ || (msg.$ = cat.$), at = (gun||'')._ || empty, tmp = msg.put||'', soul = tmp['#'], key = tmp['.'], change = (u !== tmp['='])? tmp['='] : tmp[':'], state = tmp['>'] || -Infinity, sat; // eve = event, at = data at, cat = chain at, sat = sub at (children chains).
			if(tmp && tmp._ && tmp._['#']){ // convert from old format
				return setTimeout.each(Object.keys(tmp).sort(), function(k){ // TODO: .keys( is slow // BUG? ?Some re-in logic may depend on this being sync?
					if('_' == k || !(state = state_is(tmp, k))){ return }
					cat.on('in', {$: gun, put: {'#': tmp._['#'], '.': k, ':': tmp[k], '>': state}});
				});
			}
			if((msg.seen||'')[cat.id]){ return } (msg.seen || (msg.seen = function(){}))[cat.id] = cat; // help stop some infinite loops

			if(cat !== at){ // don't worry about this when first understanding the code, it handles changing contexts on a message. A soul chain will never have a different context.
				Object.keys(msg).forEach(function(k){ tmp[k] = msg[k] }, tmp = {}); // make copy of message
				tmp.get = cat.get || tmp.get;
				if(!cat.soul && !cat.has){ // if we do not recognize the chain type
					tmp.$$$ = tmp.$$$ || cat.$; // make a reference to wherever it came from.
				} else
				if(at.soul){ // a has (property) chain will have a different context sometimes if it is linked (to a soul chain). Anything that is not a soul or has chain, will always have different contexts.
					tmp.$ = cat.$;
					tmp.$$ = tmp.$$ || at.$;
				}
				msg = tmp; // use the message with the new context instead;
			}
			unlink(msg, cat);

			if(((cat.soul/* && (cat.ask||'')['']*/) || msg.$$) && state >= state_is(root.graph[soul], key)){ // The root has an in-memory cache of the graph, but if our peer has asked for the data then we want a per deduplicated chain copy of the data that might have local edits on it.
				(tmp = root.$.get(soul)._).put = state_ify(tmp.put, key, state, change, soul);
			}
			if(!at.soul /*&& (at.ask||'')['']*/ && state >= state_is(root.graph[soul], key) && (sat = (root.$.get(soul)._.next||'')[key])){ // Same as above here, but for other types of chains. // TODO: Improve perf by preventing echoes recaching.
				sat.put = change; // update cache
				if('string' == typeof (tmp = valid(change))){
					sat.put = root.$.get(tmp)._.put || change; // share same cache as what we're linked to.
				}
			}

			this.to && this.to.next(msg); // 1st API job is to call all chain listeners.
			// TODO: Make input more reusable by only doing these (some?) calls if we are a chain we recognize? This means each input listener would be responsible for when listeners need to be called, which makes sense, as they might want to filter.
			cat.any && setTimeout.each(Object.keys(cat.any), function(any){ (any = cat.any[any]) && any(msg) },0,99); // 1st API job is to call all chain listeners. // TODO: .keys( is slow // BUG: Some re-in logic may depend on this being sync.
			cat.echo && setTimeout.each(Object.keys(cat.echo), function(lat){ (lat = cat.echo[lat]) && lat.on('in', msg) },0,99); // & linked at chains // TODO: .keys( is slow // BUG: Some re-in logic may depend on this being sync.

			if(((msg.$$||'')._||at).soul){ // comments are linear, but this line of code is non-linear, so if I were to comment what it does, you'd have to read 42 other comments first... but you can't read any of those comments until you first read this comment. What!? // shouldn't this match link's check?
				// is there cases where it is a $$ that we do NOT want to do the following? 
				if((sat = cat.next) && (sat = sat[key])){ // TODO: possible trick? Maybe have `ionmap` code set a sat? // TODO: Maybe we should do `cat.ask` instead? I guess does not matter.
					tmp = {}; Object.keys(msg).forEach(function(k){ tmp[k] = msg[k] });
					tmp.$ = (msg.$$||msg.$).get(tmp.get = key); delete tmp.$$; delete tmp.$$$;
					sat.on('in', tmp);
				}
			}

			link(msg, cat);
		}; Gun.on.in = input;

		function link(msg, cat){ cat = cat || this.as || msg.$._;
			if(msg.$$ && this !== Gun.on){ return } // $$ means we came from a link, so we are at the wrong level, thus ignore it unless overruled manually by being called directly.
			if(!msg.put || cat.soul){ return } // But you cannot overrule being linked to nothing, or trying to link a soul chain - that must never happen.
			var put = msg.put||'', link = put['=']||put[':'], tmp;
			var root = cat.root, tat = root.$.get(put['#']).get(put['.'])._;
			if('string' != typeof (link = valid(link))){
				if(this === Gun.on){ (tat.echo || (tat.echo = {}))[cat.id] = cat } // allow some chain to explicitly force linking to simple data.
				return; // by default do not link to data that is not a link.
			}
			if((tat.echo || (tat.echo = {}))[cat.id] // we've already linked ourselves so we do not need to do it again. Except... (annoying implementation details)
				&& !(root.pass||'')[cat.id]){ return } // if a new event listener was added, we need to make a pass through for it. The pass will be on the chain, not always the chain passed down. 
			if(tmp = root.pass){ if(tmp[link+cat.id]){ return } tmp[link+cat.id] = 1 } // But the above edge case may "pass through" on a circular graph causing infinite passes, so we hackily add a temporary check for that.

			(tat.echo||(tat.echo={}))[cat.id] = cat; // set ourself up for the echo! // TODO: BUG? Echo to self no longer causes problems? Confirm.

			if(cat.has){ cat.link = link }
			var sat = root.$.get(tat.link = link)._; // grab what we're linking to.
			(sat.echo || (sat.echo = {}))[tat.id] = tat; // link it.
			var tmp = cat.ask||''; // ask the chain for what needs to be loaded next!
			if(tmp['']){ // we might need to load the whole thing
				if(!(sat.ask||'')['']){ // if it wasn't already fully asked for.
					sat.on('out', {get: {'#': link}});
					return;
				}
			}
			setTimeout.each(Object.keys(tmp), function(get, sat){ // if sub chains are asking for data. // TODO: .keys( is slow // BUG? ?Some re-in logic may depend on this being sync?
				if(!(sat = tmp[get])){ return }
				sat.on('out', {get: {'#': link, '.': get}}); // go get it.
			},0,99);
		}; Gun.on.link = link;

		function unlink(msg, cat){ // ugh, so much code for seemingly edge case behavior.
			var put = msg.put||'', change = (u !== put['='])? put['='] : put[':'], root = cat.root, link, tmp;
			if(u === change){ // 1st edge case: If we have a brand new database, no data will be found.
				// TODO: BUG! because emptying cache could be async from below, make sure we are not emptying a newer cache. So maybe pass an Async ID to check against?
				// TODO: BUG! What if this is a map? // Warning! Clearing things out needs to be robust against sync/async ops, or else you'll see `map val get put` test catastrophically fail because map attempts to link when parent graph is streamed before child value gets set. Need to differentiate between lack acks and force clearing.
				if(cat.soul && u !== cat.put){ return } // data may not be found on a soul, but if a soul already has data, then nothing can clear the soul as a whole.
				//if(!cat.has){ return }
				tmp = (msg.$$||msg.$||'')._||'';
				if(msg['@'] && (u !== tmp.put || u !== cat.put)){ return } // a "not found" from other peers should not clear out data if we have already found it.
				//if(cat.has && u === cat.put && !(root.pass||'')[cat.id]){ return } // if we are already unlinked, do not call again, unless edge case. // TODO: BUG! This line should be deleted for "unlink deeply nested".
				if(link = cat.link || msg.linked){
					delete (root.$.get(link)._.echo||'')[cat.id];
				}
				if(cat.has){ // TODO: Empty out links, maps, echos, acks/asks, etc.?
					cat.link = null;
				}
				cat.put = u; // empty out the cache if, for example, alice's car's color no longer exists (relative to alice) if alice no longer has a car.
				// TODO: BUG! For maps, proxy this so the individual sub is triggered, not all subs.
				setTimeout.each(Object.keys(cat.next||''), function(get, sat){ // empty out all sub chains. // TODO: .keys( is slow // BUG? ?Some re-in logic may depend on this being sync? // TODO: BUG? This will trigger deeper put first, does put logic depend on nested order? // TODO: BUG! For map, this needs to be the isolated child, not all of them.
					if(!(sat = cat.next[get])){ return }
					//if(cat.has && u === sat.put && !(root.pass||'')[sat.id]){ return } // if we are already unlinked, do not call again, unless edge case. // TODO: BUG! This line should be deleted for "unlink deeply nested".
					if(link){ delete (root.$.get(link).get(get)._.echo||'')[sat.id] }
					sat.on('in', {get: get, put: u, $: sat.$}); // TODO: BUG? Add recursive seen check?
				},0,99);
				return;
			}
			if(cat.soul){ return } // a soul cannot unlink itself.
			if(msg.$$){ return } // a linked chain does not do the unlinking, the sub chain does. // TODO: BUG? Will this cancel maps?
			link = valid(change); // need to unlink anytime we are not the same link, though only do this once per unlink (and not on init).
			tmp = msg.$._||'';
			if(link === tmp.link || (cat.has && !tmp.link)){
				if((root.pass||'')[cat.id] && 'string' !== typeof link){

				} else {
					return;
				}
			}
			delete (tmp.echo||'')[cat.id];
			unlink({get: cat.get, put: u, $: msg.$, linked: msg.linked = msg.linked || tmp.link}, cat); // unlink our sub chains.
		}; Gun.on.unlink = unlink;

		function ack(msg, ev){
			// manhattan:
			var as = this.as, at = as.$._, get = as.get||'', tmp = (msg.put||'')[get['#']]||'';
			if(!msg.put || ('string' == typeof get['.'] && u === tmp[get['.']])){
				if(u !== at.put){ return }
				if(!at.soul && !at.has){ return } // TODO: BUG? For now, only core-chains will handle not-founds, because bugs creep in if non-core chains are used as $ but we can revisit this later for more powerful extensions.
				at.ack = (at.ack || 0) + 1;
				at.on('in', {
					get: at.get,
					put: at.put = u,
					$: at.$,
					'@': msg['@']
				});
				return;
			}
			(msg._||{}).miss = 1;
			Gun.on.put(msg);
			return; // eom
		}

		var empty = {}, u, text_rand = String.random, valid = Gun.valid, obj_has = function(o, k){ return o && Object.prototype.hasOwnProperty.call(o, k) }, state = Gun.state, state_is = state.is, state_ify = state.ify;
	})(USE, './chain');

	;USE(function(module){
		var Gun = USE('./root');
		Gun.chain.get = function(key, cb, as){
			var gun, tmp;
			if(typeof key === 'string'){
				var back = this, cat = back._;
				var next = cat.next || empty;
				if(!(gun = next[key])){
					gun = cache(key, back);
				}
				gun = gun.$;
			} else
			if('function' == typeof key){
				if(true === cb){ return soul(this, key, cb, as), this }

				var gun = this, cat = gun._, opt = cb || {}, root = cat.root, id;
				opt.at = cat;
				opt.ok = key;
				var wait = {}; // can we assign this to the at instead, like in once?
				function any(msg, eve, f){
					if(any.stun){ return }
					var at = msg.$._, data = at.put, aid, tmp;
					if((tmp = root.pass) && !tmp[id]){ return }
					if(!at.has && !at.soul){ data = (u !== (msg.put||'')['='])? msg.put['='] : msg.put } // handles non-core messages.
					if('string' == typeof (tmp = Gun.valid(data))){ data = root.$.get(tmp)._.put } // TODO: Can we delete this line of code, because the line below (which was inspired by @rogowski) handles it anyways?
					if(u === data && msg.$$){ data = msg.$$._.put }
					if(u !== opt.not && u === data){ return }
					if(u === opt.stun){
						//if(tmp = root.stun){ tmp = tmp[at.id] || at.$.back(function(back){ return tmp[back.id] || u }); if(tmp && !tmp.end && any.id > (tmp._||'').id){ // this is more thorough, but below seems to work too?
						//if((tmp = root.stun) && (tmp = tmp[at.id] || tmp[at.back.id]) && !tmp.end && any.id > (tmp._||'').id){ // if we are in the middle of a write, don't read until it is done, unless our callback was earlier than the write.
						if((tmp = root.stun) && (tmp = tmp[aid = cat.id] || tmp[aid = at.id] || (msg.$$ && tmp[aid = msg.$$._.id]) || tmp[aid = at.back.id]) && any.id > tmp.run){
							if(tmp.stun && !tmp.stun.end){
								tmp.stun[id] = function(){any(msg,eve,1)}; // add ourself to the stun callback list that is called at end of the write.
								return;
							}
							root.stun[aid] = tmp.next;
							any(msg,eve,f);
							return;
						}
						if((tmp = root.hatch) && !tmp.end && u === opt.hatch && !f){ // quick hack! // What's going on here? Because data is streamed, we get things one by one, but a lot of developers would rather get a callback after each batch instead, so this does that by creating a wait list per chain id that is then called at the end of the batch by the hatch code in the root put listener.
							if(wait[at.$._.id]){ return } wait[at.$._.id] = 1;
							tmp.push(function(){any(msg,eve,1)});
							return;
						}; wait = {}; // end quick hack.
					}
					//tmp = any.wait || (any.wait = {}); console.log(tmp[at.id] === ''); if(tmp[at.id] !== ''){ tmp[at.id] = tmp[at.id] || setTimeout(function(){tmp[at.id]='';any(msg,eve)},1); return } delete tmp[at.id];
					// call:
					if(opt.on){ opt.ok.call(at.$, data, at.get, msg, eve || any); return } // TODO: Also consider breaking `this` since a lot of people do `=>` these days and `.call(` has slower performance.
					if(opt.v2020){ opt.ok(msg, eve || any); return }
					Object.keys(msg).forEach(function(k){ tmp[k] = msg[k] }, tmp = {}); msg = tmp; msg.put = data; // 2019 COMPATIBILITY! TODO: GET RID OF THIS!
					opt.ok.call(opt.as, msg, eve || any); // is this the right
				};
				any.at = cat;
				//(cat.any||(cat.any=function(msg){ setTimeout.each(Object.keys(cat.any||''), function(act){ (act = cat.any[act]) && act(msg) },0,99) }))[id = String.random(7)] = any; // maybe switch to this in future?
				(cat.any||(cat.any={}))[id = String.random(7)] = any;
				any.off = function(){ any.stun = 1; if(!cat.any){ return } delete cat.any[id] }
				any.rid = rid; // logic from old version, can we clean it up now?
				any.id = opt.run || ++root.once; // used in callback to check if we are earlier than a write. // will this ever cause an integer overflow?
				tmp = root.pass; (root.pass = {})[id] = 1; // Explanation: test trade-offs want to prevent recursion so we add/remove pass flag as it gets fulfilled to not repeat, however map map needs many pass flags - how do we reconcile?
				cat.on('out', {get: {}});
				root.pass = tmp;
				return gun;

			} else
			if('number' == typeof key){
				return this.get(''+key, cb, as);
			} else
			if('string' == typeof (tmp = valid(key))){
				return this.get(tmp, cb, as);
			} else
			if(Object.plain(key)){
				gun = this;
				if(tmp = ((tmp = key['#'])||empty)['='] || tmp){ gun = gun.get(tmp) }
				gun._.lex = key;
				return gun;
			} else {
				(as = this.chain())._.err = {err: Gun.log('Invalid get request!', key)}; // CLEAN UP
				if(cb){ cb.call(as, as._.err) }
				return as;
			}
			if(tmp = this._.stun){ // TODO: Refactor?
				gun._.stun = gun._.stun || tmp;
			}
			if(cb && 'function' == typeof cb){
				gun.get(cb, as);
			}
			return gun;
		}
		function cache(key, back){
			var cat = back._, next = cat.next, gun = back.chain(), at = gun._;
			if(!next){ next = cat.next = {} }
			next[at.get = key] = at;
			if(back === cat.root.$){
				at.soul = key;
			} else
			if(cat.soul || cat.has){
				at.has = key;
				//if(obj_has(cat.put, key)){
					//at.put = cat.put[key];
				//}
			}
			return at;
		}
		function soul(gun, cb, opt, as){
			var cat = gun._, acks = 0, tmp;
			if(tmp = cat.soul || cat.link){ return cb(tmp, as, cat) }
			if(cat.jam){ return cat.jam.push([cb, as]) }
			cat.jam = [[cb,as]];
			gun.get(function go(msg, eve){
				if(u === msg.put && !cat.root.opt.super && (tmp = Object.keys(cat.root.opt.peers).length) && ++acks <= tmp){ // TODO: super should not be in core code, bring AXE up into core instead to fix? // TODO: .keys( is slow
					return;
				}
				eve.rid(msg);
				var at = ((at = msg.$) && at._) || {}, i = 0, as;
				tmp = cat.jam; delete cat.jam; // tmp = cat.jam.splice(0, 100);
				//if(tmp.length){ process.nextTick(function(){ go(msg, eve) }) }
				while(as = tmp[i++]){ //Gun.obj.map(tmp, function(as, cb){
					var cb = as[0], id; as = as[1];
					cb && cb(id = at.link || at.soul || Gun.valid(msg.put) || ((msg.put||{})._||{})['#'], as, msg, eve);
				} //);
			}, {out: {get: {'.':true}}});
			return gun;
		}
		function rid(at){
			var cat = this.at || this.on;
			if(!at || cat.soul || cat.has){ return this.off() }
			if(!(at = (at = (at = at.$ || at)._ || at).id)){ return }
			var map = cat.map, tmp, seen;
			//if(!map || !(tmp = map[at]) || !(tmp = tmp.at)){ return }
			if(tmp = (seen = this.seen || (this.seen = {}))[at]){ return true }
			seen[at] = true;
			return;
			//tmp.echo[cat.id] = {}; // TODO: Warning: This unsubscribes ALL of this chain's listeners from this link, not just the one callback event.
			//obj.del(map, at); // TODO: Warning: This unsubscribes ALL of this chain's listeners from this link, not just the one callback event.
			return;
		}
		var empty = {}, valid = Gun.valid, u;
	})(USE, './get');

	;USE(function(module){
		var Gun = USE('./root');
		Gun.chain.put = function(data, cb, as){ // I rewrote it :)
			var gun = this, at = gun._, root = at.root;
			as = as || {};
			as.root = at.root;
			as.run || (as.run = root.once);
			(as.stun || (as.stun = function(){ return as.run })).back = (root.stun || (root.stun = {}))._; (as.ta = root.stun)._ = as.stun;
			stun(as, at.id); // set a flag for reads to check if this chain is writing.
			as.ack = as.ack || cb;
			as.via = as.via || gun;
			as.data = as.data || data;
			as.soul || (as.soul = at.soul || ('string' == typeof cb && cb));
			var s = as.state = as.state || Gun.state();
			if('function' == typeof data){ data(function(d){ as.data = d; gun.put(u,u,as) }); return gun }
			if(!as.soul){ return get(as), gun }
			as.$ = root.$.get(as.soul); // TODO: This may not allow user chaining and similar?
			as.todo = [{it: as.data, ref: as.$}];
			as.turn = as.turn || turn;
			as.ran = as.ran || ran;
			// TODO: Perf! We only need to stun chains that are being modified, not necessarily written to.
			(function walk(){
				var to = as.todo, at = to.pop(), d = at.it, cid = at.ref && at.ref._.id, v, k, cat, tmp, g;
				stun(as, at.ref);
				if(tmp = at.todo){
					k = tmp.pop(); d = d[k];
					if(tmp.length){ to.push(at) }
				}
				if(!(v = valid(d)) && !(g = Gun.is(d))){
					if(!Object.plain(d)){ (as.ack||noop).call(as, as.out = {err: as.err = Gun.log("Invalid data, " + typeof d + " at " + (as.path||[]).join('.'))}); as.ran(as); return }
					var seen = as.seen || (as.seen = []), i = seen.length;
					while(i--){ if(d === (tmp = seen[i]).it){ v = d = tmp.link; break } }
				}
				if(k && v){ at.node = state_ify(at.node, k, s, d) } // handle soul later.
				else {
					as.seen.push(cat = {it: d, link: {}, todo: g? [] : Object.keys(d).sort().reverse()}); // Any perf reasons to CPU schedule this .keys( ?
					at.node = state_ify(at.node, k, s, cat.link);
					!g && cat.todo.length && to.push(cat);
					// ---------------
					var id = as.seen.length;
					(as.wait || (as.wait = {}))[id] = '';
					tmp = (cat.ref = (g? d : k? at.ref.get(k) : at.ref))._;
					(tmp = (d && (d._||'')['#']) || tmp.soul || tmp.link)? resolve({soul: tmp}) : cat.ref.get(resolve, {run: as.run, /*hatch: 0,*/ v2020:1}); // TODO: BUG! This should be resolve ONLY soul to prevent full data from being loaded.
					function resolve(msg, eve){
						if(eve){ eve.off(); eve.rid(msg) } // TODO: Too early! Check all peers ack not found.
						// TODO: BUG maybe? Make sure this does not pick up a link change wipe, that it uses the changign link instead.
						var soul = msg.soul || (tmp = (msg.$$||msg.$)._||'').soul || tmp.link || ((tmp = tmp.put||'')._||'')['#'] || tmp['#'] || (((tmp = msg.put||'') && msg.$$)? tmp['#'] : (tmp['=']||tmp[':']||'')['#']);
						stun(as, msg.$);
						if(!soul){
							soul = [];
							msg.$.back(function(at){
								if(tmp = at.soul || at.link){ return soul.push(tmp) }
								soul.push(at.get);
							});
							soul = soul.reverse().join('/');
						}
						cat.link['#'] = soul;
						!g && (((as.graph || (as.graph = {}))[soul] = (cat.node || (cat.node = {_:{}})))._['#'] = soul);
						delete as.wait[id];
						as.ran(as);
					};
					// ---------------
				}
				if(!to.length){ return as.ran(as) }
				as.turn(walk);
			}());
			return gun;
		}

		function stun(as, id){
			if(!id){ return } id = (id._||'').id||id;
			tmp = as.root.stun || (as.root.stun = as.ta);
			var it = {run: as.run, stun: as.stun};
			(tmp[id]? (tmp[id].last.next = it) : (tmp[id] = it)).last = it;
		}

		function ran(as){
			if(as.err){ console.log("GUN in a buggy state, restart & report please."); return } // move log handle here. // TODO: BUG! Clear out stun!
			if(as.todo.length || as.end || !Object.empty(as.wait)){ return } as.end = 1;
			var cat = (as.$.back(-1)._), root = cat.root, ask = cat.ask(function(ack){
				root.on('ack', ack);
				if(ack.err){ Gun.log(ack) }
				if(++acks > (as.acks || 0)){ this.off() } // Adjustable ACKs! Only 1 by default.
				if(!as.ack){ return }
				as.ack(ack, this);
			}, as.opt), acks = 0, stun = as.stun, tmp;
			(tmp = function(){ // this is not official yet, but quick solution to hack in for now.
				if(!stun){ return } stun.end = noop; // like with the earlier id, cheaper to make this flag a function so below callbacks do not have to do an extra type check.
				if(root.stun){ delete root.stun['s'+as.run] }
				if((tmp = root.stun) && stun === tmp._){
					if(!(tmp = stun.back) || tmp.end){
						delete root.stun; // ABC, ACB, BAC, BCA, CBA, CAB;
					}
					(root.stun||{})._ = tmp;
				}
				setTimeout.each(Object.keys(stun), function(cb){ if(cb = stun[cb]){cb()} }); // resume the stunned reads // Any perf reasons to CPU schedule this .keys( ?
			}).hatch = tmp; // this is not official yet ^
			//console.log(1, "PUT!", as.run, as.graph);
			(as.via._).on('out', {put: as.out = as.graph, opt: as.opt, '#': ask, _: tmp});
		}

		function get(as){
			var at = as.via._, tmp;
			as.via = as.via.back(function(at){
				if(at.soul || !at.get){ return at.$ }
				tmp = as.data; (as.data = {})[at.get] = tmp;
			});
			if(!as.via || !as.via._.soul){
				as.via = at.root.$.get(((as.data||'')._||'')['#'] || at.$.back('opt.uuid')())
			}
			as.via.put(as.data, as.ack, as);
			

			return;
			if(at.get && at.back.soul){
				tmp = as.data;
				as.via = at.back.$;
				(as.data = {})[at.get] = tmp; 
				as.via.put(as.data, as.ack, as);
				return;
			}
		}

		var u, empty = {}, noop = function(){}, turn = setTimeout.turn, valid = Gun.valid, state_ify = Gun.state.ify;
		var iife = function(fn,as){fn.call(as||empty)}
	})(USE, './put');

	;USE(function(module){
		var Gun = USE('./root');
		USE('./chain');
		USE('./back');
		USE('./put');
		USE('./get');
		module.exports = Gun;
	})(USE, './index');

	;USE(function(module){
		var Gun = USE('./index');
		Gun.chain.on = function(tag, arg, eas, as){ // don't rewrite!
			var gun = this, cat = gun._, root = cat.root, act, off, id, tmp;
			if(typeof tag === 'string'){
				if(!arg){ return cat.on(tag) }
				act = cat.on(tag, arg, eas || cat, as);
				if(eas && eas.$){
					(eas.subs || (eas.subs = [])).push(act);
				}
				return gun;
			}
			var opt = arg;
			(opt = (true === opt)? {change: true} : opt || {}).not = 1; opt.on = 1;
			//opt.at = cat;
			//opt.ok = tag;
			//opt.last = {};
			var wait = {}; // can we assign this to the at instead, like in once?
			gun.get(tag, opt);
			/*gun.get(function on(data,key,msg,eve){ var $ = this;
				if(tmp = root.hatch){ // quick hack!
					if(wait[$._.id]){ return } wait[$._.id] = 1;
					tmp.push(function(){on.call($, data,key,msg,eve)});
					return;
				}; wait = {}; // end quick hack.
				tag.call($, data,key,msg,eve);
			}, opt); // TODO: PERF! Event listener leak!!!?*/
			/*
			function one(msg, eve){
				if(one.stun){ return }
				var at = msg.$._, data = at.put, tmp;
				if(tmp = at.link){ data = root.$.get(tmp)._.put }
				if(opt.not===u && u === data){ return }
				if(opt.stun===u && (tmp = root.stun) && (tmp = tmp[at.id] || tmp[at.back.id]) && !tmp.end){ // Remember! If you port this into `.get(cb` make sure you allow stun:0 skip option for `.put(`.
					tmp[id] = function(){one(msg,eve)};
					return;
				}
				//tmp = one.wait || (one.wait = {}); console.log(tmp[at.id] === ''); if(tmp[at.id] !== ''){ tmp[at.id] = tmp[at.id] || setTimeout(function(){tmp[at.id]='';one(msg,eve)},1); return } delete tmp[at.id];
				// call:
				if(opt.as){
					opt.ok.call(opt.as, msg, eve || one);
				} else {
					opt.ok.call(at.$, data, msg.get || at.get, msg, eve || one);
				}
			};
			one.at = cat;
			(cat.act||(cat.act={}))[id = String.random(7)] = one;
			one.off = function(){ one.stun = 1; if(!cat.act){ return } delete cat.act[id] }
			cat.on('out', {get: {}});*/
			return gun;
		}
		// Rules:
		// 1. If cached, should be fast, but not read while write.
		// 2. Should not retrigger other listeners, should get triggered even if nothing found.
		// 3. If the same callback passed to many different once chains, each should resolve - an unsubscribe from the same callback should not effect the state of the other resolving chains, if you do want to cancel them all early you should mutate the callback itself with a flag & check for it at top of callback
		Gun.chain.once = function(cb, opt){ opt = opt || {}; // avoid rewriting
			if(!cb){ return none(this,opt) }
			var gun = this, cat = gun._, root = cat.root, data = cat.put, id = String.random(7), one, tmp;
			gun.get(function(data,key,msg,eve){
				var $ = this, at = $._, one = (at.one||(at.one={}));
				if(eve.stun){ return } //if('' === one[id]){ return }
				if(true === (tmp = Gun.valid(data))){ once(); return }
				if('string' == typeof tmp){ return } // TODO: BUG? Will this always load?
				clearTimeout(one[id]); one[id] = setTimeout(once, opt.wait||99); // TODO: Bug? This doesn't handle plural chains.
				function once(){
					if(eve.stun){ return } //if('' === one[id]){ return } one[id] = '';
					if(cat.soul || cat.has){ eve.off() } // TODO: Plural chains?
					if(!at.has && !at.soul){ at = {put: data, get: key} } // handles non-core messages.
					if(u === (tmp = at.put)){ tmp = ((msg.$$||'')._||'').put }
					if('string' == typeof Gun.valid(tmp)){ tmp = root.$.get(tmp)._.put; if(tmp === u){return} } // TODO: Can we delete this line of code, because the line below (which was inspired by @rogowski) handles it anyways?
					cb.call($, tmp, at.get);
				};
			}, {on: 1});
			return gun;
		}
		function none(gun,opt,chain){
			Gun.log.once("valonce", "Chainable val is experimental, its behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
			(chain = gun.chain())._.nix = gun.once(function(data, key){ chain._.on('in', this._) });
			return chain;
		}

		Gun.chain.off = function(){
			// make off more aggressive. Warning, it might backfire!
			var gun = this, at = gun._, tmp;
			var cat = at.back;
			if(!cat){ return }
			at.ack = 0; // so can resubscribe.
			if(tmp = cat.next){
				if(tmp[at.get]){
					delete tmp[at.get];
				} else {

				}
			}
			if(tmp = cat.ask){
				delete tmp[at.get];
			}
			if(tmp = cat.put){
				delete tmp[at.get];
			}
			if(tmp = at.soul){
				delete cat.root.graph[tmp];
			}
			if(tmp = at.map){
				Object.keys(tmp).forEach(function(i,at){ at = tmp[i]; //obj_map(tmp, function(at){
					if(at.link){
						cat.root.$.get(at.link).off();
					}
				});
			}
			if(tmp = at.next){
				Object.keys(tmp).forEach(function(i,neat){ neat = tmp[i]; //obj_map(tmp, function(neat){
					neat.$.off();
				});
			}
			at.on('off', {});
			return gun;
		}
		var empty = {}, noop = function(){}, u;
	})(USE, './on');

	;USE(function(module){
		var Gun = USE('./index');
		Gun.chain.map = function(cb, opt, t){
			var gun = this, cat = gun._, chain;
			if(!cb){
				if(chain = cat.each){ return chain }
				cat.each = chain = gun.chain();
				chain._.nix = gun.back('nix');
				gun.on('in', map, chain._);
				return chain;
			}
			Gun.log.once("mapfn", "Map functions are experimental, their behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
			chain = gun.chain();
			gun.map().on(function(data, key, msg, eve){
				var next = (cb||noop).call(this, data, key, msg, eve);
				if(u === next){ return }
				if(data === next){ return chain._.on('in', msg) }
				if(Gun.is(next)){ return chain._.on('in', next._) }
				chain._.on('in', {get: key, put: {'=':next}});
			});
			return chain;
		}
		function map(msg){ this.to.next(msg);
			var cat = this.as, gun = msg.$, at = gun._, put = msg.put, tmp;
			if(!at.soul && !msg.$$){ return } // this line took hundreds of tries to figure out. It only works if core checks to filter out above chains during link tho. This says "only bother to map on a node" for this layer of the chain. If something is not a node, map should not work.
			Gun.on.link(msg, cat);
		}
		var noop = function(){}, event = {stun: noop, off: noop}, u;
	})(USE, './map');

	;USE(function(module){
		var Gun = USE('./index');
		Gun.chain.set = function(item, cb, opt){
			var gun = this, soul, tmp;
			cb = cb || function(){};
			opt = opt || {}; opt.item = opt.item || item;
			if(soul = ((item||'')._||'')['#']){ (item = {})[soul] = {'#': soul}; }
			if(!Gun.is(item)){
				if(Object.plain(item)){
					soul = soul || ((item||'')._||'')['#'] || gun.back('opt.uuid')(7); // this just key now, not a soul.
				}
				return gun.get(soul || gun.back('opt.uuid')(7)).put(item, cb, opt);
			}
			gun.put(function(go){
				item.get(function(soul, o, msg){ // TODO: BUG! We no longer have this option? & go error not handled?
					if(!soul){ return cb.call(gun, {err: Gun.log('Only a node can be linked! Not "' + msg.put + '"!')}) }
					(tmp = {})[soul] = {'#': soul}; go(tmp);
				},true);
			})
			return item;
		}
	})(USE, './set');

	;USE(function(module){
		USE('./shim');

		function Mesh(root){
			var mesh = function(){};
			var opt = root.opt || {};
			opt.log = opt.log || console.log;
			opt.gap = opt.gap || opt.wait || 0;
			opt.pack = opt.pack || (opt.memory? (opt.memory * 999 * 999) : 300000000) * 0.3;
			opt.puff = opt.puff || 9; // IDEA: do a start/end benchmark, divide ops/result.
			var puff = setTimeout.turn || setTimeout;
			var parse = JSON.parseAsync || function(t,cb,r){ var u; try{ cb(u, JSON.parse(t,r)) }catch(e){ cb(e) } }
			var json = JSON.stringifyAsync || function(v,cb,r,s){ var u; try{ cb(u, JSON.stringify(v,r,s)) }catch(e){ cb(e) } }

			var dup = root.dup, dup_check = dup.check, dup_track = dup.track;

			var ST = +new Date, LT = ST;

			var hear = mesh.hear = function(raw, peer){
				if(!raw){ return }
				if(opt.pack <= raw.length){ return mesh.say({dam: '!', err: "Message too big!"}, peer) }
				if(mesh === this){
					/*if('string' == typeof raw){ try{
						var stat = console.STAT || {};
						//console.log('HEAR:', peer.id, (raw||'').slice(0,250), ((raw||'').length / 1024 / 1024).toFixed(4));
						
						//console.log(setTimeout.turn.s.length, 'stacks', parseFloat((-(LT - (LT = +new Date))/1000).toFixed(3)), 'sec', parseFloat(((LT-ST)/1000 / 60).toFixed(1)), 'up', stat.peers||0, 'peers', stat.has||0, 'has', stat.memhused||0, stat.memused||0, stat.memax||0, 'heap mem max');
					}catch(e){ console.log('DBG err', e) }}*/

					hear.d += raw.length||0 ; ++hear.c } // STATS!
				var S = peer.SH = +new Date;
				var tmp = raw[0], msg;
				if('[' === tmp){
					parse(raw, function(err, msg){
						if(err || !msg){ return mesh.say({dam: '!', err: "DAM JSON parse error."}, peer) }
						console.STAT && console.STAT(+new Date, msg.length, '# on hear batch');
						var P = opt.puff;
						(function go(){
							var S = +new Date;
							var i = 0, m; while(i < P && (m = msg[i++])){ hear(m, peer) }
							msg = msg.slice(i); // slicing after is faster than shifting during.
							console.STAT && console.STAT(S, +new Date - S, 'hear loop');
							flush(peer); // force send all synchronously batched acks.
							if(!msg.length){ return }
							puff(go, 0);
						}());
					});
					raw = ''; // 
					return;
				}
				if('{' === tmp || ((raw['#'] || Object.plain(raw)) && (msg = raw))){
					if(msg){ return hear.one(msg, peer, S) }
					parse(raw, function(err, msg){
						if(err || !msg){ return mesh.say({dam: '!', err: "DAM JSON parse error."}, peer) }
						hear.one(msg, peer, S);
					});
					return;
				}
			}
			hear.one = function(msg, peer, S){ // S here is temporary! Undo.
				var id, hash, tmp, ash, DBG;
				if(msg.DBG){ msg.DBG = DBG = {DBG: msg.DBG} }
				DBG && (DBG.h = S);
				DBG && (DBG.hp = +new Date);
				if(!(id = msg['#'])){ id = msg['#'] = String.random(9) }
				if(tmp = dup_check(id)){ return }
				// DAM logic:
				if(!(hash = msg['##']) && false && u !== msg.put){ /*hash = msg['##'] = Type.obj.hash(msg.put)*/ } // disable hashing for now // TODO: impose warning/penalty instead (?)
				if(hash && (tmp = msg['@'] || (msg.get && id)) && dup.check(ash = tmp+hash)){ return } // Imagine A <-> B <=> (C & D), C & D reply with same ACK but have different IDs, B can use hash to dedup. Or if a GET has a hash already, we shouldn't ACK if same.
				(msg._ = function(){}).via = mesh.leap = peer;
				if((tmp = msg['><']) && 'string' == typeof tmp){ tmp.slice(0,99).split(',').forEach(function(k){ this[k] = 1 }, (msg._).yo = {}) } // Peers already sent to, do not resend.
				// DAM ^
				if(tmp = msg.dam){
					if(tmp = mesh.hear[tmp]){
						tmp(msg, peer, root);
					}
					dup_track(id);
					return;
				}
				var S = +new Date;
				DBG && (DBG.is = S); peer.SI = id;
				root.on('in', mesh.last = msg);
				//ECHO = msg.put || ECHO; !(msg.ok !== -3740) && mesh.say({ok: -3740, put: ECHO, '@': msg['#']}, peer);
				DBG && (DBG.hd = +new Date);
				console.STAT && console.STAT(S, +new Date - S, msg.get? 'msg get' : msg.put? 'msg put' : 'msg');
				(tmp = dup_track(id)).via = peer; // don't dedup message ID till after, cause GUN has internal dedup check.
				if(msg.get){ tmp.it = msg }
				if(ash){ dup_track(ash) } //dup.track(tmp+hash, true).it = it(msg);
				mesh.leap = mesh.last = null; // warning! mesh.leap could be buggy.
			}
			var tomap = function(k,i,m){m(k,true)};
			var noop = function(){};
			hear.c = hear.d = 0;

			;(function(){
				var SMIA = 0;
				var loop;
				mesh.hash = function(msg, peer){ var h, s, t;
					var S = +new Date;
					json(msg.put, function hash(err, text){
						var ss = (s || (s = t = text||'')).slice(0, 32768); // 1024 * 32
					  h = String.hash(ss, h); s = s.slice(32768);
					  if(s){ puff(hash, 0); return }
						console.STAT && console.STAT(S, +new Date - S, 'say json+hash');
					  msg._.$put = t;
					  msg['##'] = h;
					  say(msg, peer);
					  delete msg._.$put;
					})
				}
				var say = mesh.say = function(msg, peer){ var tmp;
					if((tmp = this) && (tmp = tmp.to) && tmp.next){ tmp.next(msg) } // compatible with middleware adapters.
					if(!msg){ return false }
					var id, hash, raw, ack = msg['@'];
//if(opt.super && (!ack || !msg.put)){ return } // TODO: MANHATTAN STUB //OBVIOUSLY BUG! But squelch relay. // :( get only is 100%+ CPU usage :(
					var meta = msg._||(msg._=function(){});
					var DBG = msg.DBG, S = +new Date; meta.y = meta.y || S; if(!peer){ DBG && (DBG.y = S) }
					if(!(id = msg['#'])){ id = msg['#'] = String.random(9) }
					!loop && dup_track(id);//.it = it(msg); // track for 9 seconds, default. Earth<->Mars would need more! // always track, maybe move this to the 'after' logic if we split function.
					if(msg.put && (msg.err || (dup.s[id]||'').err)){ return false } // TODO: in theory we should not be able to stun a message, but for now going to check if it can help network performance preventing invalid data to relay.
					if(!(hash = msg['##']) && u !== msg.put && !meta.via && ack){ mesh.hash(msg, peer); return } // TODO: Should broadcasts be hashed?
					DBG && (DBG.yh = +new Date);
					if(!(raw = meta.raw)){ mesh.raw(msg, peer); return }
					DBG && (DBG.yr = +new Date);
					if(!peer && ack){ peer = ((tmp = dup.s[ack]) && (tmp.via || ((tmp = tmp.it) && (tmp = tmp._) && tmp.via))) || mesh.leap } // warning! mesh.leap could be buggy!
					if(!peer && ack){
						console.STAT && console.STAT(+new Date, ++SMIA, 'total no peer to ack to');
						return false;
					} // TODO: Temporary? If ack via trace has been lost, acks will go to all peers, which trashes browser bandwidth. Not relaying the ack will force sender to ask for ack again. Note, this is technically wrong for mesh behavior.
					if(!peer && mesh.way){ return mesh.way(msg) }
					if(!peer || !peer.id){
						if(!Object.plain(peer || opt.peers)){ return false }
						var S = +new Date;
						var P = opt.puff, ps = opt.peers, pl = Object.keys(peer || opt.peers || {}); // TODO: .keys( is slow
						console.STAT && console.STAT(S, +new Date - S, 'peer keys');
						;(function go(){
							var S = +new Date;
							//Type.obj.map(peer || opt.peers, each); // in case peer is a peer list.
							loop = 1; var wr = meta.raw; meta.raw = raw; // quick perf hack
							var i = 0, p; while(i < 9 && (p = (pl||'')[i++])){
								if(!(p = ps[p])){ continue }
								say(msg, p);
							}
							meta.raw = wr; loop = 0;
							pl = pl.slice(i); // slicing after is faster than shifting during.
							console.STAT && console.STAT(S, +new Date - S, 'say loop');
							if(!pl.length){ return }
							puff(go, 0);
							dup_track(ack); // keep for later
						}());
						return;
					}
					// TODO: PERF: consider splitting function here, so say loops do less work.
					if(!peer.wire && mesh.wire){ mesh.wire(peer) }
					if(id === peer.last){ return } peer.last = id;  // was it just sent?
					if(peer === meta.via){ return false } // don't send back to self.
					if((tmp = meta.yo) && (tmp[peer.url] || tmp[peer.pid] || tmp[peer.id]) /*&& !o*/){ return false }
					console.STAT && console.STAT(S, ((DBG||meta).yp = +new Date) - (meta.y || S), 'say prep');
					ack && dup_track(ack); // streaming long responses needs to keep alive the ack.
					if(peer.batch){
						peer.tail = (tmp = peer.tail || 0) + raw.length;
						if(peer.tail <= opt.pack){
							peer.batch += (tmp?',':'')+raw;
							return;
						}
						flush(peer);
					}
					peer.batch = '['; // Prevents double JSON!
					var ST = +new Date;
					setTimeout(function(){
						console.STAT && console.STAT(ST, +new Date - ST, '0ms TO');
						flush(peer);
					}, opt.gap); // TODO: queuing/batching might be bad for low-latency video game performance! Allow opt out?
					send(raw, peer);
					console.STAT && (ack === peer.SI) && console.STAT(S, +new Date - peer.SH, 'say ack');
				}
				mesh.say.c = mesh.say.d = 0;
				// TODO: this caused a out-of-memory crash!
				mesh.raw = function(msg, peer){ // TODO: Clean this up / delete it / move logic out!
					if(!msg){ return '' }
					var meta = (msg._) || {}, put, tmp;
					if(tmp = meta.raw){ return tmp }
					if('string' == typeof msg){ return msg }
					var hash = msg['##'], ack = msg['@'];
					if(hash && ack){
						dup_track(ack+hash);//.it = it(msg);
						if((tmp = (dup.s[ack]||'').it) || ((tmp = mesh.last) && ack === tmp['#'])){
							if(hash === tmp['##']){ return false }
							tmp['##'] = hash;
						}
					}
					if(!msg.dam){
						var i = 0, to = []; tmp = opt.peers;
						for(var k in tmp){ var p = tmp[k]; // TODO: Make it up peers instead!
							to.push(p.url || p.pid || p.id);
							if(++i > 6){ break }
						}
						if(i > 1){ msg['><'] = to.join() }
					}
					if(put = meta.$put){
						tmp = {}; Object.keys(msg).forEach(function(k){ tmp[k] = msg[k] });
						tmp.put = ':])([:';
						json(tmp, function(err, raw){
							if(err){ return } // TODO: Handle!!
							var S = +new Date;
							tmp = raw.indexOf('"put":":])([:"');
							res(u, raw = raw.slice(0, tmp+6) + put + raw.slice(tmp + 14));
							console.STAT && console.STAT(S, +new Date - S, 'say slice');
						});
						return;
					}
					json(msg, res);
					function res(err, raw){
						if(err){ return } // TODO: Handle!!
						meta.raw = raw; //if(meta && (raw||'').length < (999 * 99)){ meta.raw = raw } // HNPERF: If string too big, don't keep in memory.
						say(msg, peer);
					}
				}
			}());

			function flush(peer){
				var tmp = peer.batch, t = 'string' == typeof tmp, l;
				if(t){ tmp += ']' }// TODO: Prevent double JSON!
				peer.batch = peer.tail = null;
				if(!tmp){ return }
				if(t? 3 > tmp.length : !tmp.length){ return } // TODO: ^
				if(!t){try{tmp = (1 === tmp.length? tmp[0] : JSON.stringify(tmp));
				}catch(e){return opt.log('DAM JSON stringify error', e)}}
				if(!tmp){ return }
				send(tmp, peer);
			}
			// for now - find better place later.
			function send(raw, peer){ try{
				//console.log('SAY:', peer.id, (raw||'').slice(0,250), ((raw||'').length / 1024 / 1024).toFixed(4));
				var wire = peer.wire;
				if(peer.say){
					peer.say(raw);
				} else
				if(wire.send){
					wire.send(raw);
				}
				mesh.say.d += raw.length||0; ++mesh.say.c; // STATS!
			}catch(e){
				(peer.queue = peer.queue || []).push(raw);
			}}

			mesh.hi = function(peer){
				var tmp = peer.wire || {};
				if(peer.id){
					opt.peers[peer.url || peer.id] = peer;
				} else {
					tmp = peer.id = peer.id || String.random(9);
					mesh.say({dam: '?', pid: root.opt.pid}, opt.peers[tmp] = peer);
					delete dup.s[peer.last]; // IMPORTANT: see https://gun.eco/docs/DAM#self
				}
				peer.met = peer.met || +(new Date);
				if(!tmp.hied){ root.on(tmp.hied = 'hi', peer) }
				// @rogowski I need this here by default for now to fix go1dfish's bug
				tmp = peer.queue; peer.queue = [];
				setTimeout.each(tmp||[],function(msg){
					send(msg, peer);
				},0,9);
				//Type.obj.native && Type.obj.native(); // dirty place to check if other JS polluted.
			}
			mesh.bye = function(peer){
				root.on('bye', peer);
				var tmp = +(new Date); tmp = (tmp - (peer.met||tmp));
				mesh.bye.time = ((mesh.bye.time || tmp) + tmp) / 2;
			}
			mesh.hear['!'] = function(msg, peer){ opt.log('Error:', msg.err) }
			mesh.hear['?'] = function(msg, peer){
				if(msg.pid){
					if(!peer.pid){ peer.pid = msg.pid }
					if(msg['@']){ return }
				}
				mesh.say({dam: '?', pid: opt.pid, '@': msg['#']}, peer);
				delete dup.s[peer.last]; // IMPORTANT: see https://gun.eco/docs/DAM#self
			}

			root.on('create', function(root){
				root.opt.pid = root.opt.pid || String.random(9);
				this.to.next(root);
				root.on('out', mesh.say);
			});

			root.on('bye', function(peer, tmp){
				peer = opt.peers[peer.id || peer] || peer;
				this.to.next(peer);
				peer.bye? peer.bye() : (tmp = peer.wire) && tmp.close && tmp.close();
				delete opt.peers[peer.id];
				peer.wire = null;
			});

			var gets = {};
			root.on('bye', function(peer, tmp){ this.to.next(peer);
				if(tmp = console.STAT){ tmp.peers = (tmp.peers || 0) - 1; }
				if(!(tmp = peer.url)){ return } gets[tmp] = true;
				setTimeout(function(){ delete gets[tmp] },opt.lack || 9000);
			});
			root.on('hi', function(peer, tmp){ this.to.next(peer);
				if(tmp = console.STAT){ tmp.peers = (tmp.peers || 0) + 1 }
				if(!(tmp = peer.url) || !gets[tmp]){ return } delete gets[tmp];
				if(opt.super){ return } // temporary (?) until we have better fix/solution?
				setTimeout.each(Object.keys(root.next), function(soul){ var node = root.next[soul]; // TODO: .keys( is slow
					tmp = {}; tmp[soul] = root.graph[soul]; tmp = String.hash(tmp); // TODO: BUG! This is broken.
					mesh.say({'##': tmp, get: {'#': soul}}, peer);
				});
			});

			return mesh;
		}
	  var empty = {}, ok = true, u;

	  try{ module.exports = Mesh }catch(e){}

	})(USE, './mesh');

	;USE(function(module){
		var Gun = USE('../index');
		Gun.Mesh = USE('./mesh');

		Gun.on('opt', function(root){
			this.to.next(root);
			if(root.once){ return }
			var opt = root.opt;
			if(false === opt.WebSocket){ return }

			var env = Gun.window || {};
			var websocket = opt.WebSocket || env.WebSocket || env.webkitWebSocket || env.mozWebSocket;
			if(!websocket){ return }
			opt.WebSocket = websocket;

			var mesh = opt.mesh = opt.mesh || Gun.Mesh(root);

			var wire = mesh.wire || opt.wire;
			mesh.wire = opt.wire = open;
			function open(peer){ try{
				if(!peer || !peer.url){ return wire && wire(peer) }
				var url = peer.url.replace(/^http/, 'ws');
				var wire = peer.wire = new opt.WebSocket(url);
				wire.onclose = function(){
					opt.mesh.bye(peer);
					reconnect(peer);
				};
				wire.onerror = function(error){
					reconnect(peer);
				};
				wire.onopen = function(){
					opt.mesh.hi(peer);
				}
				wire.onmessage = function(msg){
					if(!msg){ return }
					opt.mesh.hear(msg.data || msg, peer);
				};
				return wire;
			}catch(e){}}

			setTimeout(function(){ !opt.super && root.on('out', {dam:'hi'}) },1); // it can take a while to open a socket, so maybe no longer lazy load for perf reasons?

			var wait = 2 * 999;
			function reconnect(peer){
				clearTimeout(peer.defer);
				if(doc && peer.retry <= 0){ return }
				peer.retry = (peer.retry || opt.retry+1 || 60) - ((-peer.tried + (peer.tried = +new Date) < wait*4)?1:0);
				peer.defer = setTimeout(function to(){
					if(doc && doc.hidden){ return setTimeout(to,wait) }
					open(peer);
				}, wait);
			}
			var doc = (''+u !== typeof document) && document;
		});
		var noop = function(){}, u;
	})(USE, './websocket');

	;USE(function(module){
		if(typeof Gun === 'undefined'){ return }

		var noop = function(){}, store, u;
		try{store = (Gun.window||noop).localStorage}catch(e){}
		if(!store){
			Gun.log("Warning: No localStorage exists to persist data to!");
			store = {setItem: function(k,v){this[k]=v}, removeItem: function(k){delete this[k]}, getItem: function(k){return this[k]}};
		}
		Gun.on('create', function lg(root){
			this.to.next(root);
			var opt = root.opt, graph = root.graph, acks = [], disk, to;
			if(false === opt.localStorage){ return }
			opt.prefix = opt.file || 'gun/';
			try{ disk = lg[opt.prefix] = lg[opt.prefix] || JSON.parse(store.getItem(opt.prefix)) || {}; // TODO: Perf! This will block, should we care, since limited to 5MB anyways?
			}catch(e){ disk = lg[opt.prefix] = {}; }

			root.on('get', function(msg){
				this.to.next(msg);
				var lex = msg.get, soul, data, tmp, u;
				if(!lex || !(soul = lex['#'])){ return }
				data = disk[soul] || u;
				if(data && (tmp = lex['.'])){ // pluck!
					data = Gun.state.ify({}, tmp, Gun.state.is(data, tmp), data[tmp], soul);
				}
				if(data){ (tmp = {})[soul] = data } // back into a graph.
				root.on('in', {'@': msg['#'], put: tmp, lS:1});// || root.$});
			});

			root.on('put', function(msg){
				this.to.next(msg); // remember to call next middleware adapter
				var put = msg.put, soul = put['#'], key = put['.'], tmp; // pull data off wire envelope
				disk[soul] = Gun.state.ify(disk[soul], key, put['>'], put[':'], soul); // merge into disk object
				if(!msg['@']){ acks.push(msg['#']) } // then ack any non-ack write. // TODO: use batch id.
				if(to){ return }
				to = setTimeout(flush, opt.wait || 1); // that gets saved as a whole to disk every 1ms
			});
			function flush(){
				var err, ack = acks; clearTimeout(to); to = false; acks = [];
				try{store.setItem(opt.prefix, JSON.stringify(disk));
				}catch(e){
					Gun.log((err = (e || "localStorage failure")) + " Consider using GUN's IndexedDB plugin for RAD for more storage space, https://gun.eco/docs/RAD#install");
					root.on('localStorage:error', {err: err, get: opt.prefix, put: disk});
				}
				if(!err && !Object.empty(opt.peers)){ return } // only ack if there are no peers. // Switch this to probabilistic mode
				setTimeout.each(ack, function(id){
					root.on('in', {'@': id, err: err, ok: 0}); // localStorage isn't reliable, so make its `ok` code be a low number.
				});
			}
		
		});
	})(USE, './localStorage');

}());