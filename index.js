
const Gun = require('./lib/gunwrapper')
const myDir = __dirname // TODO: where did __dirname go ?

// From here on we're ES6 import compatible...
require = require('@std/esm')(module) // eslint-disable-line no-global-assign

module.exports = require('./lib/server.mjs').default(Gun, myDir)
