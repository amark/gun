
var Gun = require('./core');
Gun.chain.map = function(cb, opt, t){
	var gun = this, cat = gun._, chain = cat.fields;
	//cb = cb || function(){ return this } // TODO: API BREAKING CHANGE! 0.5 Will behave more like other people's usage of `map` where the passed callback is a transform function. By default though, if no callback is specified then it will use a transform function that returns the same thing it received.
	if(chain){ return chain }
	chain = cat.fields = gun.chain();
	gun.on('in', map, chain._);
	if(cb){
		chain.on(cb);
	}
	return chain;
}
function map(at){
	if(!at.put || Gun.val.is(at.put)){ return }
	obj_map(at.put, each, {cat: this.as, gun: at.gun});
	this.to.next(at);
}
function each(v,f){
	if(n_ === f){ return }
	var cat = this.cat, gun = this.gun.get(f), at = (gun._);
	(at.echo || (at.echo = {}))[cat.id] = cat;
}
var obj_map = Gun.obj.map, noop = function(){}, event = {stun: noop, off: noop}, n_ = Gun.node._;
	