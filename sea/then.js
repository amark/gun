
    var Gun = require('./sea').Gun;
    Gun.chain.then = function(cb, opt = {}){
      opt = {wait: 200, ...opt}
      var gun = this, p = (new Promise(function(res, rej){
        gun.once(res, opt);
      }));
      return cb? p.then(cb) : p;
    }
  