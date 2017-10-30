

function Gun(o){
	if(o instanceof Gun){ return (this._ = {gun: this}).gun }
	if(!(this instanceof Gun)){ return new Gun(o) }
	return Gun.create(this._ = {gun: this, opt: o});
}

Gun.is = function(gun){ return (gun instanceof Gun) }

Gun.version = 0.8;

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

Gun._ = { // some reserved key words, these are not the only ones.
	node: Gun.node._ // all metadata of a node is stored in the meta property on the node.
	,soul: Gun.val.rel._ // a soul is a UUID of a node but it always points to the "latest" data known.
	,state: Gun.state._ // other than the soul, we store HAM metadata.
	,field: '.' // a field is a property on a node which points to a value.
	,value: '=' // the primitive value.
}

;(function(){
	Gun.create = function(at){
		at.root = at.root || at.gun;
		at.graph = at.graph || {};
		at.on = at.on || Gun.on;
		at.ask = at.ask || Gun.ask;
		at.dup = at.dup || Gun.dup();
		var gun = at.gun.opt(at.opt);
		if(!at.once){
			at.on('in', root, at);
			at.on('out', root, at);
		}
		at.once = 1;
		return gun;
	}
	function root(msg){
		//console.log("add to.next(at)"); // TODO: BUG!!!
		var ev = this, at = ev.as, gun = at.gun, tmp;
		//if(!msg.gun){ msg.gun = at.gun }
		if(!(tmp = msg['#'])){ tmp = msg['#'] = text_rand(9) }
		if(at.dup.check(tmp)){ return }
		at.dup.track(tmp);
		msg = obj_to(msg);//, {gun: at.gun});
		if(!at.ask(msg['@'], msg)){
			if(msg.get){
				Gun.on.get(msg, gun);
				//at.on('get', get(msg));
			}
			if(msg.put){
				Gun.on.put(msg, gun);
				//at.on('put', put(msg));
			}
		}
		at.on('out', msg);
	}
}());

;(function(){
	Gun.on.put = function(msg, gun){
		var at = gun._, ctx = {gun: gun, graph: at.graph, put: {}, map: {}, machine: Gun.state(), ack: msg['@']};
		if(!Gun.graph.is(msg.put, null, verify, ctx)){ ctx.err = "Error: Invalid graph!" }
		if(ctx.err){ return at.on('in', {'@': msg['#'], err: Gun.log(ctx.err) }) }
		obj_map(ctx.put, merge, ctx);
		obj_map(ctx.map, map, ctx);
		if(u !== ctx.defer){
			setTimeout(function(){
				Gun.on.put(msg, gun);
			}, ctx.defer - at.machine);
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
	}
	function merge(node, soul){
		var cat = this.gun._, at = (cat.next || empty)[soul];
		if(!at){ return }
		var msg = this.map[soul] = {
			put: this.node = node,
			get: this.soul = soul,
			gun: this.at = at
		};
		if(this.ack){ msg['@'] = this.ack }
		obj_map(node, each, this);
	}
	function each(val, key){
		var graph = this.graph, soul = this.soul, at = (this.at._), tmp;
		graph[soul] = Gun.state.to(this.node, key, graph[soul]);
		at.put = Gun.state.to(this.node, key, at.put);
	}
	function map(msg, soul){ var tmp;
		if(!msg.gun){ return }
		if((tmp = this.gun._).tag.node){
			return tmp.on('node', function(msg){ this.off();
				(msg.gun._).on('in', msg);
			}).on.on('node', msg);
		}
		(msg.gun._).on('in', msg);
	}

	Gun.on.get = function(msg, gun){
		var root = gun._, soul = msg.get[_soul], node = root.graph[soul], field = msg.get[_field], tmp;
		var next = root.next || (root.next = {}), at = ((next[soul] || empty)._);
		if(!node || !at){ return root.on('get', msg) }
		if(field){
			if(!obj_has(node, field)){ return root.on('get', msg) }
			node = Gun.state.to(node, field);
		} else {
			node = Gun.obj.copy(node);
		}
		node = Gun.graph.node(node);
		//tmp = at.ack;
		root.on('in', {
			'@': msg['#'],
			//how: 'mem',
			put: node,
			gun: gun
		});
		//if(0 < tmp){
		//	return;
		//}
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
				map(url, {url: url});
			});
			if(!obj_is(at.opt.peers)){ at.opt.peers = {}}
			at.opt.peers = obj_to(tmp, at.opt.peers);
		}
		at.opt.uuid = at.opt.uuid || function(){ 
			return state().toString(36).replace('.','') + text_rand(12);
		}
		at.opt.peers = at.opt.peers || {};
		obj_to(opt, at.opt); // copies options on to `at.opt` only if not already taken.
		Gun.on('opt', at);
		return gun;
	}
}());

var list_is = Gun.list.is;
var text = Gun.text, text_is = text.is, text_rand = text.random;
var obj = Gun.obj, obj_is = obj.is, obj_has = obj.has, obj_to = obj.to, obj_map = obj.map, obj_copy = obj.copy;
var state = Gun.state, _soul = Gun._.soul, _field = Gun._.field, node_ = Gun._.node, rel_is = Gun.val.rel.is;
var empty = {}, u;

console.debug = function(i, s){ return (console.debug.i && i === console.debug.i && console.debug.i++) && (console.log.apply(console, arguments) || s) };

Gun.log = function(){ return (!Gun.log.off && console.log.apply(console, arguments)), [].slice.call(arguments).join(' ') }
Gun.log.once = function(w,s,o){ return (o = Gun.log.once)[w] = o[w] || 0, o[w]++ || Gun.log(s) }

;"Please do not remove these messages unless you are paying for a monthly sponsorship, thanks!";
Gun.log.once("welcome", "Hello wonderful person! :) Thanks for using GUN, feel free to ask for help on https://gitter.im/amark/gun and ask StackOverflow questions tagged with 'gun'!");
;"Please do not remove these messages unless you are paying for a monthly sponsorship, thanks!";

if(typeof window !== "undefined"){ window.Gun = Gun }
if(typeof common !== "undefined"){ common.exports = Gun }
module.exports = Gun;

Gun.log.once("0.8", "0.8 WARNING! Breaking changes, test that your app works before upgrading! The adapter interface has been upgraded (non-default storage and transport layers probably won't work). Also, `.path()` and `.not()` are outside core and now in 'lib/'.");
	