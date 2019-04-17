//client.js writes data up to a listening hub.js, which relays to a server.js that reads the data.

var http = require('http');

var Gun = require('../../index');
var gun = Gun({ 
	file: 'http.json'
});


var server = http.createServer(function(req, res){});
gun.wsp(server);
server.listen(8765);

console.log('Server started on port ' + 8765 + ' with /gun');