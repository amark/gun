
    const Buffer = require('./buffer')
    const api = {Buffer: Buffer}

    if (typeof __webpack_require__ === 'function' || typeof window !== 'undefined') {
      const { msCrypto, crypto = msCrypto } = window          // STD or M$
      const { webkitSubtle, subtle = webkitSubtle } = crypto  // STD or iSafari
      const { TextEncoder, TextDecoder } = window
      Object.assign(api, {
        crypto,
        subtle,
        TextEncoder,
        TextDecoder,
        random: (len) => Buffer.from(crypto.getRandomValues(new Uint8Array(Buffer.alloc(len))))
      })
    } else {
      try{
      const crypto = require('crypto')
      //const WebCrypto = require('node-webcrypto-ossl')
      //const { subtle: ossl } = new WebCrypto({directory: 'key_storage'}) // ECDH
      const { subtle } = require('@trust/webcrypto')             // All but ECDH
      const { TextEncoder, TextDecoder } = require('text-encoding')
      Object.assign(api, {
        crypto,
        subtle,
        //ossl,
        TextEncoder,
        TextDecoder,
        random: (len) => Buffer.from(crypto.randomBytes(len))
      })
      }catch(e){
        console.log("@trust/webcrypto and text-encoding are not included by default, you must add it to your package.json!");
        TRUST_WEBCRYPTO_OR_TEXT_ENCODING_NOT_INSTALLED;
      }
    }

    module.exports = api
  