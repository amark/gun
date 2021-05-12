var Gun   = ('undefined' !== typeof window) ? window.Gun : require('../gun');
var debug = false;

// Adds opts.level, where the value is an initialized levelup (or compatible) instance
Gun.on('create', function(root) {
  this.to.next(root);
  var opt = root.opt;

  if (debug) debug.emit('create');

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
  if (debug) debug.emit('factory');

  var level = opt.level;
  var store = {};

  store.put = function(key, data, cb) {
    if (debug) debug.emit('put', key, data);
    level.put(key, data, function(err) {
      if (debug && err) debug.emit('error', err);
      cb(err, 'level');
    });
  };

  store.get = function(key, cb) {
    if (debug) debug.emit('get', key);
    level.get(key, function(err, data) {
      if (err && (err.name === 'NotFoundError')) err = undefined;
      if (debug && err) debug.emit('error', err);
      cb(err, data);
    });
  };

  store.list = function(cb, match, params, cbs){
    if (debug) debug.emit('list');
    level
      .createKeyStream()
      .on('data', function(key) {
        console.log("KEY", key);
        cb(key);
      })
      .on('end', function() {
        cb();
      });
  };

  return store;
}

// Export debug interface
if ('undefined' === typeof window) {
  var EventEmitter = require('events').EventEmitter;
  module.exports = debug = new EventEmitter();
}
