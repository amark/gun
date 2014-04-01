var net       = require('net'),
    websocket = require('../lib/websocket/driver');

var server = net.createServer(function(connection) {
  var driver = websocket.server();

  driver.on('connect', function() {
    if (websocket.isWebSocket(driver)) driver.start();
  });

  driver.on('close', function() { connection.end() });
  connection.on('error', function() {});

  connection.pipe(driver.io);
  driver.io.pipe(connection);

  driver.messages.pipe(driver.messages);
});

server.listen(process.argv[2]);

