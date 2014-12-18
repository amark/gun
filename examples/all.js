console.log("If modules not found, run `npm install` in /example folder!"); // git subtree push -P examples heroku master
var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 80;

var express = require('express');
var app = express();

var Gun = require('gun');
var gun = Gun({
	s3: (process.env.NODE_ENV === 'production')? null : require('../test/shotgun') // replace this with your own keys!
});

gun.attach(app);
app.use(express.static(__dirname)).listen(port);

console.log('Server started on port ' + port + ' with /gun');
