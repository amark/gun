
var Gun = require('./index');
Gun.chain.map = function(cb, opt, t){
	var gun = this, cat = gun._, chain;
	if(!cb){
		if(chain = cat.fields){ return chain }
		chain = cat.fields = gun.chain();
		chain._.val = gun.back('val');
		gun.on('in', map, chain._);
		return chain;
	}
	Gun.log.once("mapfn", "Map functions are experimental, their behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
	chain = gun.chain();
	gun.map().on(function(data, key, at, ev){
		var next = (cb||noop).call(this, data, key, at, ev);
		if(u === next){ return }
		if(Gun.is(next)){
			chain._.on('in', next._);
			return;
		}
		chain._.on('in', {get: key, put: next, gun: chain});
	});
	return chain;
}
function map(at){
	if(!at.put || Gun.val.is(at.put)){ return }
	if(this.as.val){ this.off() } // TODO: Ugly hack!
	obj_map(at.put, each, {cat: this.as, gun: at.gun});
	this.to.next(at);
}
function each(v,f){
	if(n_ === f){ return }
	var cat = this.cat, gun = this.gun.get(f), at = (gun._);
	(at.echo || (at.echo = {}))[cat.id] = cat;
}
var obj_map = Gun.obj.map, noop = function(){}, event = {stun: noop, off: noop}, n_ = Gun.node._, u;
	