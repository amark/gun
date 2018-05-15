
    const {
      subtle, ossl = subtle, random: getRandomBytes, TextEncoder, TextDecoder
    } = require('./shim')
    const Buffer = require('./buffer')
    const parse = require('./parse')
    const { pbkdf2 } = require('./settings')
    // This internal func returns SHA-256 hashed data for signing
    const sha256hash = async (mm) => {
      const m = parse(mm)
      const hash = await ossl.digest({name: pbkdf2.hash}, new TextEncoder().encode(m))
      return Buffer.from(hash)
    }
    module.exports = sha256hash
  