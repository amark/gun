var Gun = Gun || require('../gun');

Gun.chain.promise = function(cb) {
  var gun = this, cb = cb || function(ctx) { return ctx };
  return (new Promise(function(res, rej) {
    gun.val(function(data, key){
    	res({put: data, get: key, gun: this});
    });
  })).then(cb);
};

Gun.chain.then = function(cb) {
	return this.promise(function(res){
		return cb? cb(res.put) : res.put;
	});
};