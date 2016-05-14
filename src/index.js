var Gun = require('./gun');

Gun.fns = require('./fn');
Gun.bi = require('./bi');
Gun.num = require('./num');
Gun.text = require('./text');
Gun.list = require('./list');
Gun.obj = require('./obj');
Gun.time = require('./time');
Gun.schedule = require('./schedule');

var on = require('./event');
Gun.on = on.create();
Gun.on.create = on.create;

Gun.HAM = require('./HAM');
require('./ify');

require('./node');
require('./union');
require('./at');

// chain!
Gun.chain = Gun.prototype;
require('./opt');
require('./chain');
require('./put');
require('./get');
require('./key');
require('./on');
require('./path');
require('./map');
require('./val');
require('./not');
require('./set');
require('./init');

module.exports = Gun;