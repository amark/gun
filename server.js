/*
	THIS IS FOR OPENSHIFT ONLY
*/
console.log("OPENSHIFT ONLY");
require('./init');
/*
var http = require('http');

var server = http.createServer(function(req, res) {
    res.writeHead(200);
    res.end('Hello Shift');
});
server.listen(process.env.OPENSHIFT_NODEJS_PORT, process.env.OPENSHIFT_NODEJS_IP);
console.log(process.env.OPENSHIFT_NODEJS_PORT, process.env.OPENSHIFT_NODEJS_IP);*/