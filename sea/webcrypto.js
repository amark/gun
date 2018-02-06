

    let subtle
    let subtleossl
    let getRandomBytes
    let crypto
    var Buffer = require('./buffer');
    var wc;
    var api = {};

    if (typeof __webpack_require__ === 'function' || typeof window !== 'undefined') {
      api.crypto = wc = window.crypto || window.msCrypto // STD or M$
      api.subtle = subtle = wc.subtle || wc.webkitSubtle // STD or iSafari
      api.random = getRandomBytes = (len) => Buffer.from(wc.getRandomValues(new Uint8Array(Buffer.alloc(len))))
    } else {
      api.crypto = crypto = require('crypto')
      const WebCrypto = require('node-webcrypto-ossl')
      const webcrypto = new WebCrypto({directory: 'key_storage'})
      api.ossl = subtleossl = webcrypto.subtle
      api.subtle = subtle = require('@trust/webcrypto').subtle   // All but ECDH
      api.random = getRandomBytes = (len) => Buffer.from(crypto.randomBytes(len))
    }

    module.exports = api;
  