module.exports = function serve(req, res, next){
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