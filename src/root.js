

function Gun(o){
	if(o instanceof Gun){ return (this._ = {gun: this}).gun }
	if(!(this instanceof Gun)){ return new Gun(o) }
	return Gun.create(this._ = {gun: this, opt: o});
}

Gun.is = function(gun){ return (gun instanceof Gun) }

Gun.version = 0.6;

Gun.chain = Gun.prototype;
Gun.chain.toJSON = function(){};

var Type = require('./type');
Type.obj.to(Type, Gun);
Gun.HAM = require('./HAM');
Gun.val = require('./val');
Gun.node = require('./node');
Gun.state = require('./state');
Gun.graph = require('./graph');
Gun.dup = require('./dup');
Gun.on = require('./onify')();

Gun._ = { // some reserved key words, these are not the only ones.
	node: Gun.node._ // all metadata of a node is stored in the meta property on the node.
	,soul: Gun.val.rel._ // a soul is a UUID of a node but it always points to the "latest" data known.
	,state: Gun.state._ // other than the soul, we store HAM metadata.
	,field: '.' // a field is a property on a node which points to a value.
	,value: '=' // the primitive value.
}

;(function(){
	Gun.create = function(at){
		at.on = at.on || Gun.on;
		at.root = at.root || at.gun;
		at.graph = at.graph || {};
		at.dup = at.dup || new Gun.dup;
		var gun = at.gun.opt(at.opt);
		if(!at.once){
			at.on('in', input, at);
			at.on('out', output, at);
		}
		at.once = 1;
		return gun;
	}
	function output(at){
		//console.log("add to.next(at)!"); // TODO: BUG!!!!
		var cat = this.as, gun = cat.gun, tmp;
		// TODO: BUG! Outgoing `get` to read from in memory!!!
		if(at.get && get(at, cat)){ return }
		cat.on('in', obj_to(at, {gun: cat.gun})); // TODO: PERF! input now goes to output so it would be nice to reduce the circularity here for perf purposes.
		if(at['#']){
			cat.dup.track(at['#']);
		}
		if(!at.gun){
			at = obj_to(at, {gun: gun});
		}
		Gun.on('out', at); // TODO: BUG! PERF? WARNING!!! A in-memory `put` triggers an out with an existing ID which reflows into IN which at the end also goes Gun OUT, and then this scope/function resumes and it triggers OUT again!
	}
	function get(at, cat){
		var soul = at.get[_soul], node = cat.graph[soul], field = at.get[_field], tmp;
		var next = cat.next || (cat.next = {}), as = /*(at.gun||empty)._ ||*/ (next[soul] || (next[soul] = cat.gun.get(soul)))._;
		if(!node){ return }
		if(field){
			if(!obj_has(node, field)){ return }
			tmp = Gun.obj.put(Gun.node.soul.ify({}, soul), field, node[field]);
			node = Gun.state.ify(tmp, field, Gun.state.is(node, field));
		}
		as.on('in', {
			put: node, // TODO: BUG! Clone node!
			get: as.soul,
			gun: as.gun
		});
		if(0 < as.ack){
			return true;
		}
	}
	function input(at){
		//console.log("add to.next(at)"); // TODO: BUG!!!
		var ev = this, cat = ev.as;
		if(!at.gun){ at.gun = cat.gun }
		if(!at['#'] && at['@']){
			at['#'] = Gun.text.random(); // TODO: Use what is used other places instead.
			if(Gun.on.ack(at['@'], at)){ return } // TODO: Consider not returning here, maybe, where this would let the "handshake" on sync occur for Holy Grail?
			cat.dup.track(at['#']);
			cat.on('out', at);
			return;
		}
		if(at['#'] && cat.dup.check(at['#'])){ return }
		cat.dup.track(at['#']);
		if(Gun.on.ack(at['@'], at)){ return }
		if(at.put){
			Gun.HAM.synth(at, ev, cat.gun); // TODO: Clean up, just make it part of on('put')!
			Gun.on('put', at);
		}
		if(at.get){ Gun.on('get', at) }
		Gun.on('out', at);
	}
}());

;(function(){
	var ask = Gun.on.ask = function(cb, as){
		var id = Gun.text.random();
		if(cb){ ask.on(id, cb, as) }
		return id;
	}
	ask.on = Gun.on;
	Gun.on.ack = function(at, reply){
		if(!at || !reply || !ask.on){ return }
		var id = at['#'] || at;
		if(!ask.tag || !ask.tag[id]){ return }
		ask.on(id, reply);
		return true;
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
		at.opt.peers = at.opt.peers || {};
		obj_to(opt, at.opt); // copies options on to `at.opt` only if not already taken.
		Gun.on('opt', at);
		return gun;
	}
}());

var text_is = Gun.text.is;
var list_is = Gun.list.is;
var obj = Gun.obj, obj_is = obj.is, obj_has = obj.has, obj_to = obj.to, obj_map = obj.map;
var _soul = Gun._.soul, _field = Gun._.field;
//var u;

console.debug = function(i, s){ return (console.debug.i && i === console.debug.i && console.debug.i++) && (console.log.apply(console, arguments) || s) };

Gun.log = function(){ return (!Gun.log.off && console.log.apply(console, arguments)), [].slice.call(arguments).join(' ') }
Gun.log.once = function(w,s,o){ return (o = Gun.log.once)[w] = o[w] || 0, o[w]++ || Gun.log(s) }

/* Please do not remove these messages unless you are paying for a monthly sponsorship, thanks! */
Gun.log.once("welcome", "Hello wonderful person! :) Thanks for using GUN, feel free to ask for help on https://gitter.im/amark/gun and ask StackOverflow questions tagged with 'gun'!");
/* Please do not remove these messages unless you are paying for a monthly sponsorship, thanks! */

if(typeof window !== "undefined"){ window.Gun = Gun }
if(typeof common !== "undefined"){ common.exports = Gun }
module.exports = Gun;
	