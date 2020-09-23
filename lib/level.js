var Gun = require('../index');

// Adds opts.level, where the value is an initialized levelup (or compatible) instance
Gun.on('create', function(root) {
  this.to.next(root);
  var opt = root.opt;

  // Check if the given 'level' argument implements all the components we need
  // Intentionally doesn't check for levelup explicitly, to allow different handlers implementing the same api
  if (
    (!opt.level) ||
    ('object' !== typeof opt.level) ||
    ('function' !== typeof opt.level.get) ||
    ('function' !== typeof opt.level.put)
  ) {
    return;
  }

  // Register our store
  opt.store = opt.store || factory(opt);
});

function factory(opt) {
  var level = opt.level;
  var store = {};

  store.put = function(key, data, cb) {
    level.put(key, data, function(err) {
      cb(err, 'level');
    });
  };

  store.get = function(key, cb) {
    level.get(key, cb);
  };

  store.list = function(cb, match, params, cbs){
    level
      .createKeyStream()
      .on('data', cb)
      .on('end', function() {
        cb();
      });
  };

  return store;
}
