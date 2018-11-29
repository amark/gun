var fs = require('fs');
var path = require('path');

function CDN(dir){
	return function(req, res){
		if(serve(req, res)){ return } // filters GUN requests!
		fs.createReadStream(path.join(dir, req.url)).on('error',function(tmp){ // static files!
			try{ tmp = fs.readFileSync(path.join(dir, 'index.html')) }catch(e){}
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(tmp+''); // or default to index
		}).pipe(res); // stream
	}
}

function serve(req, res, next){
	if(typeof req === 'string'){ return CDN(req) }
	if(!req || !res){ return false }
	next = next || serve;
	if(!req.url){ return next() }
	if(0 <= req.url.indexOf('gun.js')){
		res.writeHead(200, {'Content-Type': 'text/javascript'});
		res.end(serve.js = serve.js || require('fs').readFileSync(__dirname + '/../gun.js'));
		return true;
	}
	if(0 <= req.url.indexOf('gun/')){
		res.writeHead(200, {'Content-Type': 'text/javascript'});
		var path = __dirname + '/../' + req.url.split('/').slice(2).join('/'), file;
		try{file = require('fs').readFileSync(path)}catch(e){}
		if(file){
			res.end(file);
			return true;
		}
	}
	return next();
}

module.exports = serve;