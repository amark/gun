
    var wc = require('./webcrypto');
    var subtle = wc.subtle;
    var getRandomBytes = wc.random;
    var Buffer = require('./buffer');
    var parseProps = require('./parse');
    var settings = require('./settings');
    var pbKdf2 = settings.pbkdf2;
    // This internal func returns SHA-256 hashed data for signing
    const sha256hash = async (mm) => {
      const hashSubtle = wc.ossl || subtle
      const m = parseProps(mm)
      const hash = await hashSubtle.digest(pbKdf2.hash, new TextEncoder().encode(m))
      return Buffer.from(hash)
    }
    module.exports = sha256hash;
  