
    const Buffer = require('./buffer')
    const api = {Buffer: Buffer}

    if (typeof __webpack_require__ === 'function' || typeof window !== 'undefined') {
      var crypto = window.crypto || window.msCrypto;
      var subtle = crypto.subtle || crypto.webkitSubtle;
      const TextEncoder = window.TextEncoder
      const TextDecoder = window.TextDecoder
      Object.assign(api, {
        crypto,
        subtle,
        TextEncoder,
        TextDecoder,
        random: (len) => Buffer.from(crypto.getRandomValues(new Uint8Array(Buffer.alloc(len))))
      })
    } else {
      try{
        var crypto = require('crypto');
        const { subtle } = require('@trust/webcrypto')             // All but ECDH
        const { TextEncoder, TextDecoder } = require('text-encoding')
        Object.assign(api, {
          crypto,
          subtle,
          TextEncoder,
          TextDecoder,
          random: (len) => Buffer.from(crypto.randomBytes(len))
        });
        try{
          const WebCrypto = require('node-webcrypto-ossl')
          api.ossl = new WebCrypto({directory: 'key_storage'}).subtle // ECDH
        }catch(e){
          console.log("node-webcrypto-ossl is optionally needed for ECDH, please install if needed.");
        }
      }catch(e){
        console.log("@trust/webcrypto and text-encoding are not included by default, you must add it to your package.json!");
        TRUST_WEBCRYPTO_OR_TEXT_ENCODING_NOT_INSTALLED;
      }
    }

    module.exports = api
  