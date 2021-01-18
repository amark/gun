var fs = require('fs');
var path = require('path');
var dot = /\.\.+/g;
var slash = /\/\/+/g;

function CDN(dir){
	return function(req, res){
		req.url = (req.url||'').replace(dot,'').replace(slash,'/');
		if(serve(req, res)){ return } // filters GUN requests!
		if (req.url.slice(-3) === '.js') {
			res.writeHead(200, {'Content-Type': 'text/javascript'});
		}
		fs.createReadStream(path.join(dir, req.url)).on('error',function(tmp){ // static files!
			fs.readFile(path.join(dir, 'index.html'), function(err, tmp){
				try{ res.writeHead(200, {'Content-Type': 'text/html'});
				res.end(tmp+''); }catch(e){} // or default to index
		})}).pipe(res); // stream
	}
}

function serve(req, res, next){ var tmp;
	if(typeof req === 'string'){
		return CDN(req);
	}
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
		var path = __dirname + '/../' + req.url.split('/').slice(2).join('/');
		if('/' === path.slice(-1)){
			fs.readdir(path, function(err, dir){ res.end((dir || (err && 404))+'') });
			return true;
		}
		var S = +new Date;
		var rs = fs.createReadStream(path);
		rs.on('open', function(){ console.STAT && console.STAT(S, +new Date - S, 'serve file open'); rs.pipe(res) });
		rs.on('error', function(err){ res.end(404+'') });
		rs.on('end', function(){ console.STAT && console.STAT(S, +new Date - S, 'serve file end') });
		return true;
	}
	if((tmp = req.socket) && (tmp = tmp.server) && (tmp = tmp.route)){ var url;
		if(tmp = tmp[(((req.url||'').slice(1)).split('/')[0]||'').split('.')[0]]){
			try{ return tmp(req, res, next) }catch(e){ console.log(req.url+' crashed with '+e) }
		}
	}
	return next();
}

module.exports = serve;
