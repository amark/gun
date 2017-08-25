if(typeof window !== "undefined"){
  var Gun = window.Gun;
} else { 
  var Gun = require('gun/gun');
}

Gun.chain.open || require('gun/lib/open');

var _on = Gun.chain.on;
Gun.chain.on = function(a,b,c){
	if('value' === a){
		return this.open(b,c);
	}
	return _on.call(this, a,b,c);
}

Gun.chain.bye || require('gun/lib/bye');
Gun.chain.onDisconnect = Gun.chain.bye;