var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

Gun.on('create', function(root){
	this.to.next(root);
	var opt = root.opt;
  if(false === opt.multicast){ return }
  if((typeof process !== "undefined") && 'false' === ''+(process.env||{}).MULTICAST){ return }
	//if(true !== opt.multicast){ return } // disable multicast by default for now.

  var udp = opt.multicast = opt.multicast || {};
  udp.address = udp.address || '233.255.255.255';
  udp.pack = udp.pack || 50000; // UDP messages limited to 65KB.
  udp.port  = udp.port || 8765;

  var noop = function(){}, u;
  var pid = '2'+Math.random().toString().slice(-8);
  var mesh = opt.mesh = opt.mesh || Gun.Mesh(root);
  var dgram;

  try{ dgram = require("dgram") }catch(e){ return }
  var socket = dgram.createSocket({type: "udp4", reuseAddr: true});
  socket.bind({port: udp.port, exclusive: true}, function(){
    socket.setBroadcast(true);
    socket.setMulticastTTL(128);
  });

  socket.on("listening", function(){
    try { socket.addMembership(udp.address) }catch(e){ console.error(e); return; }
    udp.peer = {id: udp.address + ':' + udp.port, wire: socket};

    udp.peer.say = function(raw){
      var buf = Buffer.from(raw, 'utf8');
      if(udp.pack <= buf.length){ // message too big!!!
        return;
      }
      socket.send(buf, 0, buf.length, udp.port, udp.address, noop);
    }
    //opt.mesh.hi(udp.peer);

    Gun.log.once('multi', 'Multicast on '+udp.peer.id);
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
    if('2'===raw[0]){ return check(raw, info) }
    opt.mesh.hear(raw, udp.peer);

    return; // below code only needed for when WebSocket connections desired!
    var message;
    message = JSON.parse(raw.toString('utf8'));

    if(opt.pid === message.id){ return } // ignore self

    var url = 'http://' + info.address + ':' + (port || (opt.web && opt.web.address()||{}).port) + '/gun';
    if(root.opt.peers[url]){ return }

    //console.log('discovered', url, message, info);
    root.$.opt(url);

  } catch(e){
    //console.log('multicast error', e, raw);
    return;
  } });

  function say(msg){
    this.to.next(msg);
    if(!udp.peer){ return }
    mesh.say(msg, udp.peer);
  }

  function check(id, info){ var tmp;
    if(!udp.peer){ return }
    if(!id){
      id = check.id = check.id || Buffer.from(pid, 'utf8');
      socket.send(id, 0, id.length, udp.port, udp.address, noop);
      return;
    }
    if((tmp = root.stats) && (tmp = tmp.gap) && info){ (tmp.near || (tmp.near = {}))[info.address] = info.port || 1 } // STATS!
    if(check.on || id === pid){ return }
    root.on('out', check.on = say); // TODO: MULTICAST NEEDS TO BE CHECKED FOR NEW CODE SYSTEM!!!!!!!!!! // TODO: This approach seems interferes with other relays, below does not but...
    //opt.mesh.hi(udp.peer); //  IS THIS CORRECT?
  }

  setInterval(check, 1000 * 1);

});
