var fs = require('fs');
var config = {
	port: process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8765
};
var Gun = require('../'); // require('gun')

if(process.env.HTTPS_KEY){
	config.key = fs.readFileSync(process.env.HTTPS_KEY);
	config.cert = fs.readFileSync(process.env.HTTPS_CERT);
	config.server = require('https').createServer(config, Gun.serve(__dirname));
} else {
	config.server = require('http').createServer(Gun.serve(__dirname));
}

var gun = Gun({
	web: config.server
});

config.server.listen(config.port);
console.log('Server started on port ' + config.port + ' with /gun');