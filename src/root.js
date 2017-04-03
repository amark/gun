

function Gun(o){
	if(o instanceof Gun){ return (this._ = {gun: this}).gun }
	if(!(this instanceof Gun)){ return new Gun(o) }
	return Gun.create(this._ = {gun: this, opt: o});
}

Gun.is = function(gun){ return (gun instanceof Gun) }

Gun.version = 0.7;

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
		at.ask = Gun.on.ask;
		at.ack = Gun.on.ack;
		var gun = at.gun.opt(at.opt);
		if(!at.once){
			at.on('in', root, at);
			at.on('out', root, at);
		}
		at.once = 1;
		return gun;
	}
	function root(at){
		//console.log("add to.next(at)"); // TODO: BUG!!!
		var ev = this, cat = ev.as, coat;
		if(!at.gun){ at.gun = cat.gun }
		if(!at['#'] && at['@']){
			at['#'] = Gun.text.random(); // TODO: Use what is used other places instead.
			// TODO: BUG! For multi-instances, the "ack" system is globally shared, but it shouldn't be. 
			if(cat.ack(at['@'], at)){ return } // TODO: Consider not returning here, maybe, where this would let the "handshake" on sync occur for Holy Grail?
			cat.dup.track(at['#']);
			Gun.on('out', obj_to(at, {gun: cat.gun}));
			return;
		}
		if(at['#'] && cat.dup.check(at['#'])){ return }
		cat.dup.track(at['#']);
		if(cat.ack(at['@'], at)){ return }
		//cat.ack(at['@'], at);
		coat = obj_to(at, {gun: cat.gun});
		if(at.get){
			if(!get(at, cat)){
				Gun.on('get', coat);
			}
		}
		if(at.put){
			Gun.HAM.synth(at, ev, cat.gun); // TODO: Clean up, just make it part of on('put')!
			Gun.on('put', coat);
		}
		Gun.on('out', coat);
	}
	function get(at, cat){
		var soul = at.get[_soul], node = cat.graph[soul], field = at.get[_field], tmp;
		var next = cat.next || (cat.next = {}), as = /*(at.gun||empty)._ ||*/ (next[soul] || (next[soul] = cat.gun.get(soul)))._;
		//console.log("GET", soul, field);
		if(!node){ return }
		if(field){
			if(!obj_has(node, field)){ return }
			tmp = Gun.obj.put(Gun.node.soul.ify({}, soul), field, node[field]);
			node = Gun.state.ify(tmp, field, Gun.state.is(node, field));
		}
		//if(at.gun === cat.gun){
			node = Gun.graph.node(node); // TODO: BUG! Clone node?
		//} else {
		//	cat = (at.gun._);
		//}
		tmp = as.ack;
		cat.on('in', {
			'@': at['#'],
			how: 'mem',
			put: node,
			gun: as.gun
		});
		if(0 < tmp){
			return true;
		}
	}
}());

;(function(){
	Gun.on.ask = function(cb, as){
		if(!this.on){ return }
		var id = Gun.text.random();
		if(cb){ this.on(id, cb, as) }
		return id;
	}
	Gun.on.ack = function(at, reply){
		if(!at || !reply || !this.on){ return }
		var id = at['#'] || at;
		if(!this.tag || !this.tag[id]){ return }
		this.on(id, reply);
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
		at.opt.wsc = at.opt.wsc || {protocols:null} 
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
	