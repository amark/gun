var Gun = Gun || require('../gun');

Gun.chain.group = function(obj, cb, opt){
	var gun = this;
	opt = opt || {};
	cb = cb || function(){};
	gun = gun.set({}); // insert assumes a graph node. So either create it or merge with the existing one.
	var error, item = gun.chain().set(obj, function(err){ // create the new item in its own context.
		error = err; // if this happens, it should get called before the .get
	}).get(function(val){
		if(error){ return cb.call(gun, error) } // which in case it is, allows us to fail fast.
		var add = {}, soul = Gun.is.soul.on(val);
		if(!soul){ return cb.call(gun, {err: Gun.log("No soul!")}) }
		add[soul] = val; // other wise, let's then
		gun.set(add, cb); // merge with the graph node.
	});
	return gun;
};