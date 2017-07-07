if(typeof window !== "undefined"){
  var Gun = window.Gun;
} else { 
  var Gun = require('gun/gun');
}

var u;

Gun.chain.not = function(cb, opt, t){
	return this.get(ought, {not: cb});
}

function ought(at, ev){ ev.off();
	if(at.err || (u !== at.put)){ return }
	if(!this.not){ return }
	this.not.call(at.gun, at.get, function(){ console.log("Please report this bug on https://gitter.im/amark/gun and in the issues."); need.to.implement; });
}