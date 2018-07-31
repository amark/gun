var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

Gun.chain.open || require('./open');

var _on = Gun.chain.on;
Gun.chain.on = function(a,b,c){
	if('value' === a){
		return this.open(b,c);
	}
	return _on.call(this, a,b,c);
}

Gun.chain.bye || require('./bye');
Gun.chain.onDisconnect = Gun.chain.bye;
Gun.chain.connected = function(cb){
	var root = this.back(-1), last;
	root.on('hi', function(peer){
		if(!cb){ return }
		cb(last = true, peer);
	});
	root.on('bye', function(peer){
		if(!cb || last === peer){ return }
		cb(false, last = peer);
	});
	return this;
}