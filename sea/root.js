
    // Security, Encryption, and Authorization: SEA.js
    // MANDATORY READING: https://gun.eco/explainers/data/security.html
    // IT IS IMPLEMENTED IN A POLYFILL/SHIM APPROACH.
    // THIS IS AN EARLY ALPHA!

    if(typeof window !== "undefined"){ module.window = window }

    var tmp = module.window || module;
    var SEA = tmp.SEA || function(){};

    if(SEA.window = module.window){ try{
      SEA.window.SEA = SEA;
      tmp = document.createEvent('CustomEvent');
      tmp.initCustomEvent('extension', false, false, {type: "SEA"});
      (window.dispatchEvent || window.fireEvent)(tmp);
      window.postMessage({type: "SEA"}, '*');
    } catch(e){} }

    try{ if(typeof common !== "undefined"){ common.exports = SEA } }catch(e){}
    module.exports = SEA;
  