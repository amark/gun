var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8080;

var Gun = require('../');

var server = require('http').createServer(function(req, res){
	if(Gun.serve(req, res)){ return } // filters gun requests!
	require('fs').createReadStream(require('path').join(__dirname, req.url)).on('error',function(){ // static files!
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(require('fs')
			.readFileSync(require('path')
			.join(__dirname, 'index.html') // or default to index
		));
	}).pipe(res); // stream
});

var gun = Gun({ 
	file: 'data.json',
	web: server,
	s3: {
		key: '', // AWS Access Key
		secret: '', // AWS Secret Token
		bucket: '' // The bucket you want to save into
	}
});
// Sync everything
gun.on('out', {get: {'#': {'*': ''}}});

server.listen(port);

console.log('Server started on port ' + port + ' with /gun');
