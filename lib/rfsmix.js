module.exports = function(opt, store){
	var rfs = require('./rfs')(opt);
	var p = store.put;
	var g = store.get;
	store.put = function(file, data, cb){
		rfs.put(file, data, function(err, ok){
			if(err){ return cb(err) }
			//console.log("rfs3 cached", file);
			p(file, data, cb);
		});
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