var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8765;
var host = process.env.OPENSHIFT_NODEJS_HOST || process.env.VCAP_APP_HOST || process.env.HOST || 'localhost';

var express = require('express');
var proxy = require('express-http-proxy');
var http = require('http');
var app = express();
var server = http.createServer(app);

var Gun = require('gun');
var gun = Gun({
	file: 'data.json',
	web: server
});

app.use(Gun.serve);
app.use(proxy(host + ':4200'));
server.listen(port);

console.log('Server started on port ' + port + ' with /gun');
