var path = require('path');
var http = require('http');
var fs = require('fs');

var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8080;
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var Gun = require('gun');
var gun = Gun({
	file: 'data.json',
	s3: {
		key: '', // AWS Access Key
		secret: '', // AWS Secret Token
		bucket: '' // The bucket you want to save into
	}
});

var server = http.createServer(function(req, res){
	if(gun.wsp.server(req, res)){
		return; // filters gun requests!
	}
	fs.createReadStream(path.join(__dirname, req.url)).on('error',function(){ // static files!
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(fs.readFileSync(path.join(__dirname, 'index.html'))); // or default to index
	}).pipe(res); // stream
});
gun.wsp(server);
server.listen(port, ip);

console.log('Server started on port', port, 'with /gun');
