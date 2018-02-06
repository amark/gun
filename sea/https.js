
    /*
      Security, Encryption, and Authorization: SEA.js
    */

    // NECESSARY PRE-REQUISITE: http://gun.js.org/explainers/data/security.html

    /* THIS IS AN EARLY ALPHA!!! */
    
    if(typeof window !== 'undefined'){
      if(location.protocol.indexOf('s') < 0
      && location.host.indexOf('localhost') < 0
      && location.protocol.indexOf('file:') < 0){
        location.protocol = 'https:';
      }
    }
  