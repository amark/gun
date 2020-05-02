
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
      console.log("text-encoding and @peculiar/webcrypto may not be included by default, please add it to your package.json!");
      TEXT_ENCODING_OR_PECULIAR_WEBCRYPTO_NOT_INSTALLED;
    }}

    module.exports = api
  