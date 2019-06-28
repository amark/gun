
var Gun = require('./index');
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
	gun.map().on(function(data, key, at, ev){
		var next = (cb||noop).call(this, data, key, at, ev);
		if(u === next){ return }
		if(data === next){ return chain._.on('in', at) }
		if(Gun.is(next)){ return chain._.on('in', next._) }
		chain._.on('in', {get: key, put: next});
	});
	return chain;
}
function map(msg){
	if(!msg.put || Gun.val.is(msg.put)){ return this.to.next(msg) }
	if(this.as.nix){ this.off() } // TODO: Ugly hack!
	obj_map(msg.put, each, {at: this.as, msg: msg});
	this.to.next(msg);
}
function each(v,k){
	if(n_ === k){ return }
	var msg = this.msg, gun = msg.$, at = gun._, cat = this.at, tmp = at.lex;
	if(tmp && !Gun.text.match(k, tmp['.'] || tmp['#'] || tmp)){ return } // review?
	((tmp = gun.get(k)._).echo || (tmp.echo = {}))[cat.id] = tmp.echo[cat.id] || cat;
}
var obj_map = Gun.obj.map, noop = function(){}, event = {stun: noop, off: noop}, n_ = Gun.node._, u;
	