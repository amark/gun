var fs = require('fs');
var path = require('path');
var dot = /\.\.+/g;
var slash = /\/\/+/g;

function CDN(dir){
	return function(req, res){
		req.url = (req.url||'').replace(dot,'').replace(slash,'/');
		if(serve(req, res)){ return } // filters GUN requests!
		fs.createReadStream(path.join(dir, req.url)).on('error',function(tmp){ // static files!
			try{ tmp = fs.readFileSync(path.join(dir, 'index.html')) }catch(e){}
			try{ res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(tmp+''); }catch(e){} // or default to index
		}).pipe(res); // stream
	}
}

function serve(req, res, next){ var tmp;
	if(typeof req === 'string'){ return CDN(req) }
	if(!req || !res){ return false }
	next = next || serve;
	if(!req.url){ return next() }
	if(res.setHeader){ res.setHeader('Access-Control-Allow-Origin', '*') }
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
	if((tmp = req.socket) && (tmp = tmp.server) && (tmp = tmp.route)){ var url;
		if(tmp = tmp[(((req.url||'').slice(1)).split('/')[0]||'').split('.')[0]]){
			try{ return tmp(req, res, next) }catch(e){ console.log(req.url+' crashed with '+e) }
		}
	} 
	return next();
}

module.exports = serve;