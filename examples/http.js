var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 80;

var http = require('http');

var Gun = require('gun');
var gun = Gun({
	s3: (process.env.NODE_ENV === 'production')? null : require('../test/shotgun') // replace this with your own keys!
});

var server = gun.attach(http.createServer(gun.server)).listen(port);

console.log('Server started on port ' + port + ' with /gun');
