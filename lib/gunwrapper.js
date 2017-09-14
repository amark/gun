
// This does all old-fashion require stuff before '@std/mjs' steps in...
const Gun = require('../gun')
require('../nts')
require('./s3')
try {
  require('./ws')
} catch(e) {
  require('./wsp/server')
}
require('./verify')
require('./file')
require('./bye')

module.exports = Gun
