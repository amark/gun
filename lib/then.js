var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

// Returns a gun reference in a promise and then calls a callback if specified
Gun.chain.promise = function(cb) {
  var gun = this, cb = cb || function(ctx) { return ctx };
  return (new Promise(function(res, rej) {
    gun.once(function(data, key){
    	res({put: data, get: key, gun: this}); // gun reference is returned by promise
    });
  })).then(cb); //calling callback with resolved data
};

// Returns a promise for the data, key of the gun call
Gun.chain.then = function(cb) {
	var gun = this;
  var p = (new Promise((res, rej)=>{
    gun.once(function (data, key) {
      res(data, key); //call resolve when data is returned
    })
  }))
  return cb ? p.then(cb) : p;
};
