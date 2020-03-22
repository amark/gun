

function Gun(o){
	if(o instanceof Gun){ return (this._ = {gun: this, $: this}).$ }
	if(!(this instanceof Gun)){ return new Gun(o) }
	return Gun.create(this._ = {gun: this, $: this, opt: o});
}

Gun.is = function($){ return ($ instanceof Gun) || ($ && $._ && ($ === $._.$)) || false }

Gun.version = 0.9;

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

;(function(){
	Gun.create = function(at){
		at.root = at.root || at;
		at.graph = at.graph || {};
		at.on = at.on || Gun.on;
		at.ask = at.ask || Gun.ask;
		at.dup = at.dup || Gun.dup();
		var gun = at.$.opt(at.opt);
		if(!at.once){
			at.on('in', root, at);
			at.on('out', root, {at: at, out: root});
			Gun.on('create', at);
			at.on('create', at);
		}
		at.once = 1;
		return gun;
	}
	function root(msg){
		//add to.next(at); // TODO: MISSING FEATURE!!!
		var ev = this, as = ev.as, at = as.at || as, gun = at.$, dup, tmp;
		if(!(tmp = msg['#'])){ tmp = msg['#'] = text_rand(9) }
		if((dup = at.dup).check(tmp)){
			if(as.out === msg.out){
				msg.out = u;
				ev.to.next(msg);
			}
			return;
		}
		dup.track(tmp);
		if(tmp = msg['@']){ dup.track(tmp) } // HNPERF: Bump original request's liveliness.
		if(!at.ask(tmp, msg)){
			if(msg.get){
				Gun.on.get(msg, gun); //at.on('get', get(msg));
			}
			if(msg.put){
				Gun.on.put(msg, gun); //at.on('put', put(msg));
			}
		}
		ev.to.next(msg);
		if(!as.out){
			msg.out = root;
			at.on('out', msg);
		}
	}
}());

;(function(){
	Gun.on.put = function(msg, gun){
		var at = gun._, ctx = {$: gun, graph: at.graph, put: {}, map: {}, souls: {}, machine: Gun.state(), ack: msg['@'], cat: at, stop: {}};
		if(!Gun.obj.map(msg.put, perf, ctx)){ return } // HNPERF: performance test, not core code, do not port.
		if(!Gun.graph.is(msg.put, null, verify, ctx)){ ctx.err = "Error: Invalid graph!" }
		if(ctx.err){ return at.on('in', {'@': msg['#'], err: Gun.log(ctx.err) }) }
		obj_map(ctx.put, merge, ctx);
		if(!ctx.async){ obj_map(ctx.map, map, ctx) }
		if(u !== ctx.defer){
			var to = ctx.defer - ctx.machine;
			setTimeout(function(){
				Gun.on.put(msg, gun);
			}, to > MD? MD : to ); // setTimeout Max Defer 32bit :(
		}
		if(!ctx.diff){ return }
		at.on('put', obj_to(msg, {put: ctx.diff}));
	};
	var MD = 2147483647;
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

	Gun.on.get = function(msg, gun){
		var root = gun._, get = msg.get, soul = get[_soul], node = root.graph[soul], has = get[_has], tmp;
		var next = root.next || (root.next = {}), at = next[soul];
		// queue concurrent GETs?
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
		var faith = function(){}; faith.faith = true; // HNPERF: We're testing performance improvement by skipping going through security again, but this should be audited.
		root.on('in', {
			'@': msg['#'],
			how: 'mem',
			put: node,
			$: gun,
			_: faith
		});
		//if(0 < tmp){ return }
		root.on('get', msg);
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
		at.opt.uuid = at.opt.uuid || function(){ return state_lex() + text_rand(12) }
		return gun;
	}
}());

var list_is = Gun.list.is;
var text = Gun.text, text_is = text.is, text_rand = text.random;
var obj = Gun.obj, obj_is = obj.is, obj_has = obj.has, obj_to = obj.to, obj_map = obj.map, obj_copy = obj.copy;
var state_lex = Gun.state.lex, _soul = Gun.val.link._, _has = '.', node_ = Gun.node._, rel_is = Gun.val.link.is;
var empty = {}, u;

console.only = function(i, s){ return (console.only.i && i === console.only.i && console.only.i++) && (console.log.apply(console, arguments) || s) };

Gun.log = function(){ return (!Gun.log.off && console.log.apply(console, arguments)), [].slice.call(arguments).join(' ') }
Gun.log.once = function(w,s,o){ return (o = Gun.log.once)[w] = o[w] || 0, o[w]++ || Gun.log(s) }

;"Please do not remove these messages unless you are paying for a monthly sponsorship, thanks!";
Gun.log.once("welcome", "Hello wonderful person! :) Thanks for using GUN, feel free to ask for help on https://gitter.im/amark/gun and ask StackOverflow questions tagged with 'gun'!");
;"Please do not remove these messages unless you are paying for a monthly sponsorship, thanks!";

if(typeof window !== "undefined"){ (window.GUN = window.Gun = Gun).window = window }
try{ if(typeof common !== "undefined"){ common.exports = Gun } }catch(e){}
module.exports = Gun;

/*Gun.on('opt', function(ctx){ // FOR TESTING PURPOSES
	this.to.next(ctx);
	if(ctx.once){ return }
	ctx.on('node', function(msg){
		var to = this.to;
		//Gun.node.is(msg.put, function(v,k){ msg.put[k] = v + v });
		setTimeout(function(){
			to.next(msg);
		},1);
	});
});*/
	