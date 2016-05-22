var Gun = require('./gun');

Gun.chain.init = function(cb, opt){
	var gun = this;
	gun._.at('null').event(function(at){
		if(!at.not){ return } // TODO: BUG! This check is synchronous but it could be asynchronous!
		var ctx = {by: gun.__.by(at.soul)};
		if(at.field){
			if(Gun.obj.has(ctx.by.node, at.field)){ return }
			gun._.at('soul').emit({soul: at.soul, field: at.field, not: true});
			return;
		}
		if(at.soul){
			if(ctx.by.node){ return }
			var soul = Gun.text.random();
			gun.__.gun.put(Gun.is.node.soul.ify({}, soul), null, {init: true});
			gun.__.gun.key(at.soul, null, soul);
		}
	}, {raw: true});
	return gun;
}