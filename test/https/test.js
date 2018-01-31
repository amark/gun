module.exports = function(port, file, cb, inject){
	port = port || process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8080;

	var fs = require('fs');
	var Gun = require(__dirname+'/../../');

	var server = require('https').createServer({
		key: fs.readFileSync(__dirname+'/server.key'),
		cert: fs.readFileSync(__dirname+'/server.crt'),
		ca: fs.readFileSync(__dirname+'/ca.crt'),
		requestCert: true,
		rejectUnauthorized: false
	},function(req, res){
		if(Gun.serve(req, res)){ return } // filters gun requests!
		var file;
		try{file = require('fs').readFileSync(require('path').join(__dirname+'/../../examples', req.url))
		}catch(e){ file = require('fs').readFileSync(require('path').join(__dirname+'/../../examples', 'index.html')) }
		if(inject){
			file = inject(file, req, res) || file;
		}
		res.end(file);
	});

	var gun = Gun({
		file: file || 'data',
		web: server,
		localStorage: false
	});

	server.listen(port, cb);

	console.log('Server started on port ' + port + ' with /gun');
}