console.log("If modules not found, run `npm install` in /example folder!"); // git subtree push -P examples heroku master // OR // git subtree split -P examples master && git push heroku [['HASH']]:master --force
var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8081;
var host = process.env.OPENSHIFT_NODEJS_HOST || process.env.VCAP_APP_HOST || process.env.HOST || 'localhost';

var express = require('express');
var proxy = require('express-http-proxy');
var http = require('http');
var app = express();
var server = http.createServer(app);

var Gun = require('gun');
var gun = Gun({
	file: 'data.json',
	web: server,
	s3: {
		key: '', // AWS Access Key
		secret: '', // AWS Secret Token
		bucket: '' // The bucket you want to save into
	}
});

app.use(Gun.serve);
app.use(proxy(host + ':8080'));
server.listen(port);

console.log('Server started on port ' + port + ' with /gun');
