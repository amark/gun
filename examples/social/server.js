var fs = require('fs');
var http = require('http');
var qs = require('querystring');
var sync = require('../../test/shotgun');

http.route = function(url){
	console.log(url);
	var path = __dirname + url;
	if(!url){ return http.route }
	if(url === '/gun'){
		sync.server(req, res);
	}
	if(fs.existsSync(path)){
		return ((path = require(path)) && path.server)? path : http.route;
	} else 
	if(url.slice(-3) !== '.js'){
		return http.route(url + '.js');
	}
	return http.route;
}
http.route.server = function(req, res){
	console.log("/ no route found");
}
http.cors = function(req, res){
	var headers = {};
	headers["Access-Control-Allow-Origin"] = "*";
	headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
	headers["Access-Control-Allow-Credentials"] = false;
	headers["Access-Control-Max-Age"] = 1000 * 60 * 60 * 24;
	headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";	
	if(res){
		res.writeHead(200, headers);
		if(req && req.method === 'OPTIONS'){
			res.end();
			return true;
		}
	}
}
http.createServer(function(req, res){
	console.log(req.headers);
	console.log(req.method);
	if(http.cors(req, res)){ return }
	if(req.method == 'POST'){
		var body = {};
		body.length = 0;
		body.data = new require('buffer').Buffer('');
		req.on('data', function(buffer){
			if(body.data.length >= body.length + buffer.length){
				buffer.copy(body.data, body.length);
			} else {
				body.data = Buffer.concat([body.data, buffer]);
			}
			body.length += buffer.length;
		});
		req.on('end', function(x){
			body.text = body.data.toString('utf8');
			try{body.json = JSON.parse(body.text);
			}catch(e){}
			delete body.data;
			req.body = body.json || body.text;
			http.route(req.url).server(req, res);
		});
		res.on('end', function(data){
			http.cors(null, res);
			res.end(JSON.stringify(data));
		});
	}
}).listen(8888);
console.log("listening");
//process.on("uncaughtException", function(e){console.log('!!!!!!!!!!!!!!!!!!!!!!');console.log(e);console.log('!!!!!!!!!!!!!!!!!!!!!!')});