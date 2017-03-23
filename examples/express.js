console.log("If modules not found, run `npm install` in /example folder!"); // git subtree push -P examples heroku master // OR // git subtree split -P examples master && git push heroku [['HASH']]:master --force
var port    = process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8080;
var express = require('express');
var Gun     = require('..');

var app    = express();
app.use(Gun.serve);
app.use(express.static(__dirname));

var server = app.listen(port);
Gun({	file: 'data.json', web: server });

console.log('Server started on port ' + port + ' with /gun');
