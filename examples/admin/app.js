console.log("HEY YOU please work?");
console.log("If modules not found, run `npm install` in example/admin folder!");

var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || 8888;
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var Gun = require('gun');
var gun = Gun({
	peers: 'http://localhost:' + port + '/gun'
	,s3: require('../../test/shotgun') // replace this with your own keys!
});

app.use(express.static(__dirname))
   .use(bodyParser.json())
   .use(gun.server);
app.listen(port);

console.log('Express started on port ' + port + ' with /gun');

gun.load('blob/data', function(){ // ugh need to initialize the data if there is none, what a waste of LOC!
	gun.set({_:{'#': "yVbyf7BqlXVQQUOE5cw9rf8h",'>':{hello: 1407328713707,from: 1407328713707}}, // this is a nasty trick to force the ID to overwrite itself
		hello: "world",
		from: "Mark Nadal"
	}).key('blob/data');
});