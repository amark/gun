console.log("If module not found, install express globally `npm i express -g`!");
var port    = process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8765;
var express = require('express');
var Gun     = require('..');

var app    = express();
app.use(Gun.serve);
app.use(express.static(__dirname));

var server = app.listen(port);
Gun({	file: 'data.json', web: server });

console.log('Server started on port ' + port + ' with /gun');
