var panic = require('panic-client');
var ports = require('./ports');
var Gun = require('gun');
var gun = new Gun({
	file: 'delete-me.json'
});

var http = require('http');

var server = new http.Server(gun.wsp.server);

gun.wsp(server);

server.listen(ports.gun);

panic.server('http://localhost:' + ports.panic);