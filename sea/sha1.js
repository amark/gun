
    // This internal func returns SHA-1 hashed data for KeyID generation
    const { subtle, ossl = subtle } = require('./shim')
    const sha1hash = (b) => ossl.digest({name: 'SHA-1'}, new ArrayBuffer(b))
    module.exports = sha1hash
  