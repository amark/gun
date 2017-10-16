/*

// Let's do all old-fashion require stuff before '@std/mjs' steps in...
const Gun = require('../gun')

if (process.env.SEA) {
  Gun.SEA = require('../sea')
}
require('../lib/file')

const myDir = __dirname // TODO: where did __dirname go ?

// From here on we're ES6 import compatible...
require = require('@std/esm')(module) // eslint-disable-line no-global-assign

module.exports = require('../lib/server.mjs').default(Gun, myDir)

*/