var Gun = Gun || require('../gun');

Gun.chain.list = function(cb, opt){
	opt = opt || {};
	cb = cb || function(){}; 
	var gun = this.set({}); // insert assumes a graph node. So either create it or merge with the existing one.
	gun.last = function(obj, cb){
		var last = gun.path('last');
		if(!arguments.length){ return last }
		return gun.path('last').set(null).set(obj).get(function(){ // warning! these are not transactional! They could be.
			last.path('next').set(this._.node, cb);
		});
	}
	gun.first = function(obj, cb){
		var first = gun.path('first');
		if(!arguments.length){ return first }
		return gun.path('first').set(null).set(obj).get(function(){ // warning! these are not transactional! They could be.
			first.path('prev').set(this._.node, cb);
		});
	}
	return gun;
};
