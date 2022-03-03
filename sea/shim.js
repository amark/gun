"use strict";

    const SEA = require('./root')
    const api = {Buffer: require('./buffer')}
    var o = {}, u;

    api.parse = function(t,r){ return new Promise(function(res, rej){
      Gun.__utils__.parseAsync(t,function(err, raw){ err? rej(err) : res(raw) },r);
    })}
    api.stringify = function(v,r,s){ return new Promise(function(res, rej){
      Gun.__utils__.stringifyAsync(v,function(err, raw){ err? rej(err) : res(raw) },r,s);
    })}

    if(SEA.window){
      api.crypto = window.crypto || window.msCrypto
      api.subtle = (api.crypto||o).subtle || (api.crypto||o).webkitSubtle;
      api.TextEncoder = window.TextEncoder;
      api.TextDecoder = window.TextDecoder;
      api.random = (len) => api.Buffer.from(api.crypto.getRandomValues(new Uint8Array(api.Buffer.alloc(len))));
    }
    if(!api.TextDecoder)
    {
      const { TextEncoder, TextDecoder } = require((u+'' == typeof MODULE?'.':'')+'./lib/text-encoding', 1);
      api.TextDecoder = TextDecoder;
      api.TextEncoder = TextEncoder;
    }
    if(!api.crypto)
    {
      try
      {
      var crypto = require('crypto', 1);
      Object.assign(api, {
        crypto,
        random: (len) => api.Buffer.from(crypto.randomBytes(len))
      });
      const { Crypto: WebCrypto } = require('@peculiar/webcrypto', 1);
      api.ossl = api.subtle = new WebCrypto({directory: 'ossl'}).subtle // ECDH
    }
    catch(e){
      console.log("Please `npm install @peculiar/webcrypto` or add it to your package.json !");
    }}

    module.exports = api
  