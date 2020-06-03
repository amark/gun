

function Gun(o){
	if(o instanceof Gun){ return (this._ = {$: this}).$ }
	if(!(this instanceof Gun)){ return new Gun(o) }
	return Gun.create(this._ = {$: this, opt: o});
}

Gun.is = function($){ return ($ instanceof Gun) || ($ && $._ && ($ === $._.$)) || false }

Gun.version = 0.2020;

Gun.chain = Gun.prototype;
Gun.chain.toJSON = function(){};

var Type = require('./type');
Type.obj.to(Type, Gun);
Gun.HAM = require('./HAM');
Gun.val = require('./val');
Gun.node = require('./node');
Gun.state = require('./state');
Gun.graph = require('./graph');
Gun.on = require('./onto');
Gun.ask = require('./ask');
Gun.dup = require('./dup');
Gun.puff = require('./puff');

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
		if(!at.ask(msg['@'], msg)){ // is this machine listening for an ack?
			DBG && (DBG.u = +new Date);
			if(msg.get){ Gun.on._get(msg, gun) }
			if(msg.put){ put(msg); return }
		}
		DBG && (DBG.uc = +new Date);
		eve.to.next(msg);
		DBG && (DBG.ua = +new Date);
		msg.out = universe; at.on('out', msg);
		DBG && (DBG.ue = +new Date);
	}
	function put(msg){
		if(!msg){ return }
		var ctx = msg._||'', root = ctx.root = ((msg.$||'')._||'').root;
		var put = msg.put, id = msg['#'], err, tmp;
		var DBG = ctx.DBG = msg.DBG;
		if(put['#'] && put['.']){ root.on('put', msg); return }
		/*root.on(id, function(m){
			console.log('ack:', m);
		});*/
		ctx.out = msg;
		ctx.lot = {s: 0, more: 1};
		var S = +new Date;
		DBG && (DBG.p = S);
		for(var soul in put){ // Gun.obj.native() makes this safe.
			var node = put[soul], states;
			if(!node){ err = ERR+cut(soul)+"no node."; break }
			if(!(tmp = node._)){ err = ERR+cut(soul)+"no meta."; break }
			if(soul !== tmp[_soul]){ err = ERR+cut(soul)+"soul not same."; break }
			if(!(states = tmp[state_])){ err = ERR+cut(soul)+"no state."; break }
			for(var key in node){ // double loop uncool, but have to support old format.
				if(node_ === key){ continue }
				var val = node[key], state = states[key];
				if(u === state){ err = ERR+cut(key)+"on"+cut(soul)+"no state."; break }
				if(!val_is(val)){ err = ERR+cut(key)+"on"+cut(soul)+"bad "+(typeof val)+cut(val); break }
				ham(val, key, soul, state, msg);
			}
			if(err){ break }
		}
		DBG && (DBG.pe = +new Date);
		if(console.STAT){ console.STAT(S, +new Date - S, 'mix');console.STAT(S, ctx.lot.s, 'mix #') }
		if(ctx.err = err){ root.on('in', {'@': id, err: Gun.log(err)}); return }
		if(!(--ctx.lot.more)){ fire(ctx) } // if synchronous.
		if(!ctx.stun && !msg['@']){ root.on('in', {'@': id, ok: -1}) } // in case no diff sent to storage, etc., still ack.
	} Gun.on.put = put;
	function ham(val, key, soul, state, msg){
		var ctx = msg._||'', root = ctx.root, graph = root.graph, lot;
		var vertex = graph[soul] || empty, was = state_is(vertex, key, 1), known = vertex[key];
		var machine = State(), is = HAM(machine, state, was, val, known), u;
		if(!is.incoming){
			if(is.defer){
				var to = state - machine;
				setTimeout(function(){
					ham(val, key, soul, state, msg);
				}, to > MD? MD : to); // setTimeout Max Defer 32bit :(
				if(!ctx.to){ root.on('in', {'@': msg['#'], err: to}) } ctx.to = 1;
				return to;
			}
			return;
		}
		(lot = ctx.lot||'').s++; lot.more++;
		(ctx.stun || (ctx.stun = {}))[soul+key] = 1;
		var DBG = ctx.DBG; DBG && (DBG.ph = DBG.ph || +new Date);
		root.on('put', {'#': msg['#'], '@': msg['@'], put: {'#': soul, '.': key, ':': val, '>': state}, _: ctx});
	}
	function map(msg){
		var DBG; if(DBG = (msg._||'').DBG){ DBG.pa = +new Date; DBG.pm = DBG.pm || +new Date}
      	var eve = this, root = eve.as, graph = root.graph, ctx = msg._, put = msg.put, soul = put['#'], key = put['.'], val = put[':'], state = put['>'], id = msg['#'], tmp;
		graph[soul] = state_ify(graph[soul], key, state, val, soul); // TODO: Only put in graph if subscribed? Relays vs Browsers?
		chain(ctx, soul, key, (u !== (tmp = put['=']))? tmp : val, state); // TODO: This should NOT be how the API works, this should be done at an extension layer, but hacky solution to migrate with old code for now.
		if((tmp = ctx.out) && (tmp = tmp.put)){
			tmp[soul] = state_ify(tmp[soul], key, state, val, soul); // TODO: Hacky, fix & come back later, for actual pushing messages.
		}
		if(!(--ctx.lot.more)){ fire(ctx) } // TODO: 'forget' feature in SEA tied to this, bad approach, but hacked in for now. Any changes here must update there.
		eve.to.next(msg);
	}
	function chain(ctx, soul, key,val, state){
		var root = ctx.root, put, tmp;
		(root.opt||'').super && root.$.get(soul); // I think we need super for now, but since we are rewriting, should consider getting rid of it.
		if(!root || !(tmp = root.next) || !(tmp = tmp[soul]) || !tmp.$){ return }
		(put = ctx.put || (ctx.put = {}))[soul] = state_ify(put[soul], key, state, val, soul);
		tmp.put = state_ify(tmp.put, key, state, val, soul);
	}
	function fire(ctx){
		if(ctx.err){ return }
		var stop = {};
		var root = ctx.root, next = root.next||'', put = ctx.put, tmp;
		var S = +new Date;
		//Gun.graph.is(put, function(node, soul){
		for(var soul in put){ var node = put[soul]; // Gun.obj.native() makes this safe.
			if(!(tmp = next[soul]) || !tmp.$){ continue }
			root.stop = stop; // temporary fix till a better solution?
			tmp.on('in', {$: tmp.$, get: soul, put: node});
			root.stop = null; // temporary fix till a better solution?
		}
		console.STAT && console.STAT(S, +new Date - S, 'fire');
		ctx.DBG && (ctx.DBG.f = +new Date);
		if(!(tmp = ctx.out)){ return }
		tmp.out = universe;
		root.on('out', tmp);
	}
	var ERR = "Error: Invalid graph!";
	var cut = function(s){ return " '"+(''+s).slice(0,9)+"...' " }
	var HAM = Gun.HAM, MD = 2147483647, State = Gun.state;
}());

;(function(){
	Gun.on._put = function(msg, gun){
		var at = gun._, ctx = {$: gun, graph: at.graph, put: {}, map: {}, souls: {}, machine: Gun.state(), ack: msg['@'], cat: at, stop: {}};
		if(!Gun.obj.map(msg.put, perf, ctx)){ return } // HNPERF: performance test, not core code, do not port.
		if(!Gun.graph.is(msg.put, null, verify, ctx)){ ctx.err = "Error: Invalid graph!" }
		if(ctx.err){ return at.on('in', {'@': msg['#'], err: Gun.log(ctx.err) }) }
		obj_map(ctx.put, merge, ctx);
		if(!ctx.async){ obj_map(ctx.map, map, ctx) }
		if(u !== ctx.defer){
			var to = ctx.defer - ctx.machine;
			setTimeout(function(){
				Gun.on._put(msg, gun);
			}, to > MD? MD : to ); // setTimeout Max Defer 32bit :(
		}
		if(!ctx.diff){ return }
		at.on('put', obj_to(msg, {put: ctx.diff}));
	};
	function verify(val, key, node, soul){ var ctx = this;
		var state = Gun.state.is(node, key), tmp;
		if(!state){ return ctx.err = "Error: No state on '"+key+"' in node '"+soul+"'!" }
		var vertex = ctx.graph[soul] || empty, was = Gun.state.is(vertex, key, true), known = vertex[key];
		var HAM = Gun.HAM(ctx.machine, state, was, val, known);
		if(!HAM.incoming){
			if(HAM.defer){ // pick the lowest
				ctx.defer = (state < (ctx.defer || Infinity))? state : ctx.defer;
			}
			return;
		}
		ctx.put[soul] = Gun.state.to(node, key, ctx.put[soul]);
		(ctx.diff || (ctx.diff = {}))[soul] = Gun.state.to(node, key, ctx.diff[soul]);
		ctx.souls[soul] = true;
	}
	function merge(node, soul){
		var ctx = this, cat = ctx.$._, at = (cat.next || empty)[soul];
		if(!at){
			if(!(cat.opt||empty).super){
				ctx.souls[soul] = false;
				return;
			}
			at = (ctx.$.get(soul)._);
		}
		var msg = ctx.map[soul] = {
			put: node,
			get: soul,
			$: at.$
		}, as = {ctx: ctx, msg: msg};
		ctx.async = !!cat.tag.node;
		if(ctx.ack){ msg['@'] = ctx.ack }
		obj_map(node, each, as);
		if(!ctx.async){ return }
		if(!ctx.and){
			// If it is async, we only need to setup one listener per context (ctx)
			cat.on('node', function(m){
				this.to.next(m); // make sure to call other context's listeners.
				if(m !== ctx.map[m.get]){ return } // filter out events not from this context!
				ctx.souls[m.get] = false; // set our many-async flag
				obj_map(m.put, patch, m); // merge into view
				if(obj_map(ctx.souls, function(v){ if(v){ return v } })){ return } // if flag still outstanding, keep waiting.
				if(ctx.c){ return } ctx.c = 1; // failsafe for only being called once per context.
				this.off();
				obj_map(ctx.map, map, ctx); // all done, trigger chains.
			});
		}
		ctx.and = true;
		cat.on('node', msg); // each node on the current context's graph needs to be emitted though.
	}
	function each(val, key){
		var ctx = this.ctx, graph = ctx.graph, msg = this.msg, soul = msg.get, node = msg.put, at = (msg.$._), tmp;
		graph[soul] = Gun.state.to(node, key, graph[soul]);
		if(ctx.async){ return }
		at.put = Gun.state.to(node, key, at.put);
	}
	function patch(val, key){
		var msg = this, node = msg.put, at = (msg.$._);
		at.put = Gun.state.to(node, key, at.put);
	}
	function map(msg, soul){
		if(!msg.$){ return }
		this.cat.stop = this.stop; // temporary fix till a better solution?
		(msg.$._).on('in', msg);
		this.cat.stop = null; // temporary fix till a better solution?
	}
	function perf(node, soul){ if(node !== this.graph[soul]){ return true } } // HNPERF: do not port!

	Gun.on._get = function(msg, gun){
		var root = gun._, get = msg.get, soul = get[_soul], node = root.graph[soul], has = get[_has], tmp;
		var next = root.next || (root.next = {}), at = next[soul];
		// queue concurrent GETs?
		var ctx = msg._||'', DBG = ctx.DBG = msg.DBG;
		DBG && (DBG.g = +new Date);
		if(!node){ return root.on('get', msg) }
		if(has){
			if('string' != typeof has || !obj_has(node, has)){ return root.on('get', msg) }
			node = Gun.state.to(node, has);
			// If we have a key in-memory, do we really need to fetch?
			// Maybe... in case the in-memory key we have is a local write
			// we still need to trigger a pull/merge from peers.
		} else {
			node = Gun.window? Gun.obj.copy(node) : node; // HNPERF: If !browser bump Performance? Is this too dangerous to reference root graph? Copy / shallow copy too expensive for big nodes. Gun.obj.to(node); // 1 layer deep copy // Gun.obj.copy(node); // too slow on big nodes
		}
		node = Gun.graph.node(node);
		tmp = (at||empty).ack;
		var faith = function(){}; faith.ram = faith.faith = true; // HNPERF: We're testing performance improvement by skipping going through security again, but this should be audited.
		DBG && (DBG.ga = +new Date);
		root.on('in', {
			'@': msg['#'],
			put: node,
			ram: 1,
			$: gun,
			_: faith
		});
		DBG && (DBG.gm = +new Date);
		//if(0 < tmp){ return }
		root.on('get', msg);
		DBG && (DBG.gd = +new Date);
	}
}());

;(function(){
	Gun.chain.opt = function(opt){
		opt = opt || {};
		var gun = this, at = gun._, tmp = opt.peers || opt;
		if(!obj_is(opt)){ opt = {} }
		if(!obj_is(at.opt)){ at.opt = opt }
		if(text_is(tmp)){ tmp = [tmp] }
		if(list_is(tmp)){
			tmp = obj_map(tmp, function(url, i, map){
				i = {}; i.id = i.url = url; map(url, i);
			});
			if(!obj_is(at.opt.peers)){ at.opt.peers = {}}
			at.opt.peers = obj_to(tmp, at.opt.peers);
		}
		at.opt.peers = at.opt.peers || {};
		obj_map(opt, function each(v,k){
			if(!obj_has(this, k) || text.is(v) || obj.empty(v)){ this[k] = v ; return }
			if(v && v.constructor !== Object && !list_is(v)){ return }
			obj_map(v, each, this[k]);
		}, at.opt);
		Gun.on('opt', at);
		//at.opt.uuid = at.opt.uuid || function(){ return state_lex() + text_rand(12) }
		Gun.obj.native();
		return gun;
	}
}());
Gun.obj.native = function(){ var p = Object.prototype; for(var i in p){ console.log("Native Object.prototype polluted, reverting", i); delete p[i]; } };

var list_is = Gun.list.is;
var text = Gun.text, text_is = text.is, text_rand = text.random;
var obj = Gun.obj, obj_empty = obj.empty, obj_is = obj.is, obj_has = obj.has, obj_to = obj.to, obj_map = obj.map, obj_copy = obj.copy;
var state_lex = Gun.state.lex, state_ify = Gun.state.ify, state_is = Gun.state.is, _soul = Gun.val.link._, _has = '.', node_ = Gun.node._, val_is = Gun.val.is, rel_is = Gun.val.link.is, state_ = Gun.state._;
var empty = {}, u;
var C;

Gun.log = function(){ return (!Gun.log.off && C.log.apply(C, arguments)), [].slice.call(arguments).join(' ') };
Gun.log.once = function(w,s,o){ return (o = Gun.log.once)[w] = o[w] || 0, o[w]++ || Gun.log(s) };

if(typeof window !== "undefined"){ (window.GUN = window.Gun = Gun).window = window }
try{ if(typeof MODULE !== "undefined"){ MODULE.exports = Gun } }catch(e){}
module.exports = Gun;

(Gun.window||'').console = (Gun.window||'').console || {log: function(){}};
(C = console).only = function(i, s){ return (C.only.i && i === C.only.i && C.only.i++) && (C.log.apply(C, arguments) || s) };

;"Please do not remove welcome log unless you are paying for a monthly sponsorship, thanks!";
Gun.log.once("welcome", "Hello wonderful person! :) Thanks for using GUN, please ask for help on http://chat.gun.eco if anything takes you longer than 5min to figure out!");
	