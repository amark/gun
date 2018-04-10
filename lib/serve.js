var normalize = require('path').normalize;
var UP_PATH_REGEXP = /(?:^|[\\/])\.\.(?:[\\/]|$)/

module.exports = function serve(req, res, next){

	if(!req || !res){ return false }
	next = next || serve;
	if(!req.url){ return next() }
	if(0 <= req.url.indexOf('gun.js')){
		res.writeHead(200, {'Content-Type': 'text/javascript'});
		res.end(serve.js = serve.js || require('fs').readFileSync(__dirname + '/../gun.js'));
		return true;
	}
	if(0 === req.url.indexOf('/gun/')){
		var root = normalize(__dirname + '/../'), file;
		var path = root + req.url.split('/').slice(2).join('/');

		if (UP_PATH_REGEXP.test(path)) {
			res.status(403).end();
			return true;
		}

		try{file = require('fs').readFileSync(path)}catch(e){}
		if(file){
			res.writeHead(200, {'Content-Type': 'text/javascript'});
			res.end(file);
			return true;
		}
	}
	return next();
}
