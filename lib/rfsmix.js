module.exports = function(opt, store){
	var rfs = require('./rfs')(opt);
	var p = store.put;
	var g = store.get;
	store.put = function(file, data, cb){
		var a, b, c = function(err, ok){
			if(b){ return cb(err || b) }
			if(a){ return cb(err, ok) }
			a = true;
			b = err;
		}
		p(file, data, c); // parallel
		rfs.put(file, data, c); // parallel
	}
	store.get = function(file, cb){
		rfs.get(file, function(err, data){
			//console.log("rfs3 hijacked", file);
			if(data){ return cb(err, data) }
			g(file, cb);
		});
	}
	return store;
}