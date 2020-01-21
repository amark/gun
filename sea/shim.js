
    const SEA = require('./root')
    const Buffer = require('./buffer')
    const api = {Buffer: Buffer}
    var o = {};

    if(SEA.window){
      api.crypto = navigator && navigator.product === 'ReactNative' ? require('isomorphic-webcrypto') : window.crypto || window.msCrypto || require('isomorphic-webcrypto');
      api.subtle = (api.crypto||o).subtle || (api.crypto||o).webkitSubtle;
      api.TextEncoder = window.TextEncoder;
      api.TextDecoder = window.TextDecoder;
      api.random = (len) => Buffer.from(api.crypto.getRandomValues(new Uint8Array(Buffer.alloc(len))));
    }
    if(!api.TextDecoder)
    {
      const { TextEncoder, TextDecoder } = require('text-encoding');
      api.TextDecoder = TextDecoder;
      api.TextEncoder = TextEncoder;
    }
    if(!api.crypto){try{
      var crypto = require('crypto', 1);
      Object.assign(api, {
        crypto,
        random: (len) => Buffer.from(crypto.randomBytes(len))
      });      
      const isocrypto = require('isomorphic-webcrypto');
      api.ossl = api.subtle = isocrypto.subtle;
    }catch(e){
      console.log("node-webcrypto-ossl and text-encoding may not be included by default, please add it to your package.json!");
      OSSL_WEBCRYPTO_OR_TEXT_ENCODING_NOT_INSTALLED;
    }}

    module.exports = api
  