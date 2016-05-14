var Gun = require('./gun');

Gun.chain.on = function(cb, opt){ // on subscribes to any changes on the souls.
	var gun = this, u;
	opt = Gun.obj.is(opt)? opt : {change: opt};
	cb = cb || function(){};
	function map(at){
		opt.on = opt.on || this;
		var ctx = {by: gun.__.by(at.soul)}, change = ctx.by.node;
		if(opt.on.stat && opt.on.stat.first){ (at = Gun.on.at.copy(at)).change = ctx.by.node }
		if(opt.raw){ return cb.call(opt.on, at) }
		if(opt.once){ this.off() }
		if(opt.change){ change = at.change }
		if(!opt.empty && Gun.obj.empty(change, Gun._.meta)){ return }
		cb.call(ctx.by.chain || gun, Gun.obj.copy(at.field? change[at.field] : change), at.field || (at.at && at.at.field));
	};
	opt.on = gun._.at('soul').map(map);
	if(gun === gun.back){ Gun.log('You have no context to `.on`!') }
	return gun;
}