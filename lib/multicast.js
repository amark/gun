var Gun = (typeof window !== 'undefined')? window.Gun : require('../gun');

var MULTICAST_ADDR = '233.255.255.255';
var MULTICAST_INTERVAL = 1000;
var PORT = 20000;
var DEFAULT_GUN_PORT = 8765;
var ENC = 'utf8';

Gun.on('create', function(root){
	this.to.next(root);
	var opt = root.opt, u;
	if(false === opt.multicast){ return }
	opt.multicast = opt.multicast || {};
	if(typeof window === 'undefined'){
		nodeMulticast(root, opt);
	} else if (chrome && chrome.sockets && chrome.sockets.udp) {
		chromeMulticast(root, opt);
	}
});

function nodeMulticast(root, opt) {
	var dgram = require('dgram');
  var process = require('process');

  socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

  socket.bind(PORT);

  var address;
  socket.on('listening', function() {
    socket.addMembership(MULTICAST_ADDR);
		if (opt.multicast && opt.multicast.port) { // if port is specified, advertise our node
			console.log(`Advertising this node (port ${opt.multicast.port}) on multicast (${MULTICAST_ADDR})`);
			setInterval(sendMessage, MULTICAST_INTERVAL);
		}
    address = socket.address();
  });

  function sendMessage() {
    var msgObj = {
      gun: {
        version: Gun.version,
        port: opt.multicast.port || DEFAULT_GUN_PORT
      }
    };
    var message = Buffer.from(JSON.stringify(msgObj), ENC);
    socket.send(message, 0, message.length, PORT, MULTICAST_ADDR, function() {
      // console.info(`Sending message '${message}'`);
    });
  }

  socket.on('message', function(message, rinfo) {
    try {
      var msgObj = JSON.parse(message.toString(ENC));
      if (!(msgObj.gun && msgObj.gun.port)) { return }
      var peer = `http://${rinfo.address}:${msgObj.gun.port}`;
      if (!root.opt.peers.hasOwnProperty(peer)) {
        console.log(`peer ${peer} found via multicast`);
        root.$.opt({peers: [peer]});
      }
    } catch (e) {
      // console.error(`Received multicast from ${rinfo.address}:${rinfo.port} but failed to connect:`, e);
    }
  });
}

function chromeMulticast(root, opt) {
	chrome.sockets.udp.create({bufferSize: 1024 * 1024}, function (createInfo) {
    var socketId = createInfo.socketId;
    var ttl = 12;
    chrome.sockets.udp.setMulticastTimeToLive(socketId, ttl, function (result) {
      if (result != 0) {
        console.error('Set TTL Error: ', 'Unknown error');
      }
      chrome.sockets.udp.bind(socketId, '0.0.0.0', PORT, function (result) {
        if (result != 0) {
          chrome.sockets.udp.close(socketId, function () {
            console.error('Error on bind(): ', result);
          });
        } else {
          chrome.sockets.udp.joinGroup(socketId, MULTICAST_ADDR, function (result) {
            if (result != 0) {
              chrome.sockets.udp.close(socketId, function () {
                console.error('Error on joinGroup(): ', result);
              });
            } else {
              me.socketId = socketId;
              chrome.sockets.udp.onReceive.addListener(info => {
								console.log('msg received', info);
							});
              chrome.sockets.udp.onReceiveError.addListener(info => {
								console.error('receive error');
							});
              console.log('Chrome multicast socket listening');
            }
          });
        }
      });
    });
  });
}
