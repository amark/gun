
    var Gun = require('./sea').Gun;
    Gun.chain.then = function(cb){
      var gun = this, p = (new Promise(function(res, rej){
        gun.once(res);
      }));
      return cb? p.then(cb) : p;
    }
  