;(function(){
  var Gun  = (typeof window !== "undefined")? window.Gun : require('./gun');
  var dam  = 'nts';
  var smooth = 2;

  Gun.on('create', function(root){ // switch to DAM, deprecated old
  	return ; // stub out for now. TODO: IMPORTANT! re-add back in later.
    var opt = root.opt, mesh = opt.mesh;
    if(!mesh) return;

    // Track connections
    var connections = [];
    root.on('hi', function(peer) {
      this.to.next(peer);
      connections.push({peer, latency: 0, offset: 0, next: 0});
    });
    root.on('bye', function(peer) {
      this.to.next(peer);
      var found = connections.find(connection => connection.peer.id == peer.id);
      if (!found) return;
      connections.splice(connections.indexOf(found), 1);
    });

    function response(msg, connection) {
      var now            = Date.now(); // Lack of drift intentional, provides more accurate RTT
      connection.latency = (now - msg.nts[0]) / 2;
      connection.offset  = (msg.nts[1] + connection.latency) - (now + Gun.state.drift);
      console.log(connection.offset);
      Gun.state.drift   += connection.offset / (connections.length + smooth);
      console.log(`Update time by local: ${connection.offset} / ${connections.length + smooth}`);
    }

    // Handle echo & setting based on known connection latency as well
    mesh.hear[dam] = function(msg, peer) {
      console.log('MSG', msg);
      var now   = Date.now() + Gun.state.drift;
      var connection = connections.find(connection => connection.peer.id == peer.id);
      if (!connection) return;
      if (msg.nts.length >= 2) return response(msg, connection);
      mesh.say({dam, '@': msg['#'], nts: msg.nts.concat(now)}, peer);
      connection.offset = msg.nts[0] + connection.latency - now;
      Gun.state.drift  += connection.offset / (connections.length + smooth);
      console.log(`Update time by remote: ${connection.offset} / ${connections.length + smooth}`);
    };

    // Handle ping transmission
    setTimeout(function trigger() {
      console.log('TRIGGER');
      if (!connections.length) return setTimeout(trigger, 100);
      var now = Date.now(); // Lack of drift intentional, provides more accurate RTT & NTP reference

      // Send pings
      connections.forEach(function(connection) {
        if (connection.next > now) return;
        mesh.say({
          dam,
          '#': String.random(3),
          nts: [now],
        });
      });

      // Plan next round of pings
      connections.forEach(function(connection) {
        if (connection.next > now) return;
        // https://discord.com/channels/612645357850984470/612645357850984473/755334349699809300
        var delay = Math.min(2e4, Math.max(250, 150000 / Math.abs((connection.offset)||1)));
        connection.next = now + delay;
      });

      // Plan next trigger round
      // May overshoot by runtime of this function
      var nextRound = Infinity;
      connections.forEach(function(connection) {
        nextRound = Math.min(nextRound, connection.next);
      });
      setTimeout(trigger, nextRound - now);
      console.log(`Next sync round in ${(nextRound - now) / 1000} seconds`);
    }, 1);
  });

}());
