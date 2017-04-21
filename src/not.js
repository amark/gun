
var Gun = require('./core'), u;
Gun.chain.not = function(cb, opt, t){
	Gun.log.once("nottobe", "Warning: `.not` to be removed from core (but available as an extension), use `.val` instead, which now supports (v0.7.x+) 'not found data' as `undefined` data in callbacks. If you are opposed to this, please voice your opinion in https://gitter.im/amark/gun and ask others.");
	return this.get(ought, {not: cb});
}
function ought(at, ev){ ev.off();
	if(at.err || (u !== at.put)){ return }
	if(!this.not){ return }
	this.not.call(at.gun, at.get, function(){ console.log("Please report this bug on https://gitter.im/amark/gun and in the issues."); need.to.implement; });
}
	