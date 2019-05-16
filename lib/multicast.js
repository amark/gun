var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

Gun.on('create', function(root){
	this.to.next(root);
	var opt = root.opt;
  if(false === opt.multicast){ return }
	if(true !== opt.multicast){ return } // disable multicast by default for now.

  var udp = opt.multicast = opt.multicast || {};
  udp.address = udp.address || '233.255.255.255';
  udp.pack = udp.pack || 50000; // UDP messages limited to 65KB.
  udp.port  = udp.port || 23456;

  var noop = function(){}, port;

  var dgram = require("dgram");
  var socket = dgram.createSocket({type: "udp4", reuseAddr: true});
  socket.bind(udp.port);

  socket.on("listening", function() {
    socket.addMembership(udp.address);
    udp.peer = {url: udp.address + ':' + udp.port, wire: socket};

    udp.peer.say = function(raw){
      var buf = Buffer.from(raw, 'utf8');
      if(udp.pack <= buf.length){ // message too big!!!
        return;
      }
      socket.send(buf, 0, buf.length, udp.port, udp.address, noop);
    }
    opt.mesh.hi(udp.peer);

    console.log('multicasting on', udp.peer.url);
    return; // below code only needed for when WebSocket connections desired!
    setInterval(function broadcast(){
      port = port || (opt.web && opt.web.address()||{}).port;
      if(!port){ return }
      udp.peer.say(JSON.stringify({id: opt.pid || (opt.pid = Math.random().toString(36).slice(2)), port: port}));
    }, 1000);
  });

  socket.on("message", function(raw, info) { try {
    if(!raw){ return }
    raw = raw.toString('utf8');
    opt.mesh.hear(raw, udp.peer);

    return; // below code only needed for when WebSocket connections desired!
    var message;
    message = JSON.parse(raw.toString('utf8'));

    if(opt.pid === message.id){ return } // ignore self

    var url = 'http://' + info.address + ':' + (port || (opt.web && opt.web.address()||{}).port) + '/gun';
    if(root.opt.peers[url]){ return }
  
    console.log('discovered', url, message, info);
    root.$.opt(url);

  } catch(e){
    console.log('multicast error', e, raw);
    return;
  } });

});
