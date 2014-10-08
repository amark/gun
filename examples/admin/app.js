console.log("If modules not found, run `npm install` in example/admin folder!"); // git subtree push -P examples/admin heroku master
var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || 8888;
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var Gun = require('gun');
var gun = Gun({
	s3: (process.env.NODE_ENV === 'production')? null : require('../../test/shotgun') // replace this with your own keys!
});
app.use(function(req, res, next){
		console.log("THIS HIT SEEEERVER", req.url);
		next();
	})
	.use(gun.server)
	.use(express.static(__dirname))
app.listen(port);

console.log('Express started on port ' + port + ' with /gun');
gun.load('blob/data').blank(function(){ // in case there is no data on this key
	console.log("blankety blank");
	gun.set({ hello: "world", from: "Mark Nadal",_:{'#':'0DFXd0ckJ9cXGczusNf1ovrE'}}).key('blob/data'); // save some sample data
});