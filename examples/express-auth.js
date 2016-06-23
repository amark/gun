console.log("If modules not found, run `npm install` in /example folder!"); // git subtree push -P examples heroku master // OR // git subtree split -P examples master && git push heroku [['HASH']]:master --force
var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 80;

var express = require('express');
var app = express();

var Gun = require('gun');
var gun = Gun({
	file: 'data.json',
	s3: {
		key: '', // AWS Access Key
		secret: '', // AWS Secret Token
		bucket: '' // The bucket you want to save into
	}
});

gun.wsp(app/*, function(req, res, next){
	console.log("auth!", req, req.body['#']);
	if('get' === req.method){
		if('example/todo/data' === req.body['#']){
			next(req, res);
		}
	}
	if('put' === req.method){
		res({body: {err: "Permission denied!"}});
	}
}*/);
app.use(express.static(__dirname)).listen(port);

console.log('Server started on port ' + port + ' with /gun');