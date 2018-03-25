var Gun = Gun || require('../gun');

/*
Gun.chain.set = function(obj, cb, opt){
	var set = this;
	opt = opt || {};
	cb = cb || function(){};
	set = set.put({}); // insert assumes a graph node. So either create it or merge with the existing one.
	var error, item = set.chain().put(obj, function(err){ // create the new item in its own context.
		error = err; // if this happens, it should get called before the .val
	}).val(function(val){
		if(error){ return cb.call(set, error) } // which in case it is, allows us to fail fast.
		var add = {}, soul = Gun.is.soul.on(val);
		if(!soul){ return cb.call(set, {err: Gun.log("No soul!")}) }
		add[soul] = val; // other wise, let's then
		set.put(add, cb); // merge with the graph node.
	});
	return item;
};*/

Gun.chain.set = function(val, cb, opt){
	var gun = this, ctx = {}, drift = Gun.time.now();
	cb = cb || function(){};
	opt = opt || {};
	
	if(!gun._.back){ gun = gun.put({}) }
	gun = gun.not(function(next, key){
		return key? this.put({}).key(key) : this.put({});
	});
	if(!val && !Gun.is.value(val)){ return gun }
	
	var obj = {};
	obj['I' + drift + 'R' + Gun.text.random(5)] = val;
	return gun.put(obj, cb);
}