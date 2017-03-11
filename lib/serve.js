module.exports = function serve(req, res, next){
	if(!req || !res){ return false }
	next = next || serve;
	if(!req.url){ return next() }
	if(0 <= req.url.indexOf('gun.js')){
		res.writeHead(200, {'Content-Type': 'text/javascript'});
		res.end(serve.js = serve.js || require('fs').readFileSync(__dirname + '/../gun.js'));
		return true;
	}
	return next();
}