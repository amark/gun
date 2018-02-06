
    // This internal func returns SHA-1 hashed data for KeyID generation
    const sha1hash = (b) => (subtleossl || subtle).digest('SHA-1', new ArrayBuffer(b))
    module.exports = sha1hash;
  