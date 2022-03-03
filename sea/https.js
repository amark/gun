"use strict";

    var SEA = require('./root');
    try{ if(SEA.window){
      if(!window.isSecureContext && location.protocol == 'http:'){
        console.warn('WebCrypto only available in secure context in SEA, redirecting to https...');
        location.protocol = 'https:'; // WebCrypto does NOT work without HTTPS!
      }
    } }catch(e){}
  