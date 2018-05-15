
    var SEA = require('./root');
    if(SEA.window){
      if(location.protocol.indexOf('s') < 0
      && location.host.indexOf('localhost') < 0
      && location.protocol.indexOf('file:') < 0){
        location.protocol = 'https:';
      }
    }
  