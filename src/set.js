var Gun = require('./gun');

Gun.chain.set = function(item, cb, opt){
	var gun = this, ctx = {}, chain;
	cb = cb || function(){};
	if(!Gun.is(item)){ return cb.call(gun, {err: Gun.log('Set only supports node references currently!')}), gun } // TODO: Bug? Should we return not gun on error?
	(ctx.chain = item.chain()).back = gun;
	ctx.chain._ = item._;
	item.val(function(node){ // TODO: BUG! Return proxy chain with back = list.
		if(ctx.done){ return } ctx.done = true;
		var put = {}, soul = Gun.is.node.soul(node);
		if(!soul){ return cb.call(gun, {err: Gun.log('Only a node can be linked! Not "' + node + '"!')}) }
		gun.put(Gun.obj.put(put, soul, Gun.is.rel.ify(soul)), cb, opt);
	});
	return ctx.chain;
}