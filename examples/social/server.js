var fs = require('fs');
var http = require('http');
var qs = require('querystring');
var gun = require('../../test/shotgun');

http.route = function(url){
	console.log(url);
	var path = __dirname + url;
	if(!url){ return http.route }
	if(gun.server.regex.test(url)){
		return gun;
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
http.createServer(function(req, res){
	console.log(req.headers);
	console.log(req.method, req.url);
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
	res.on('data', function(data){
		res.write(JSON.stringify(data) + '\n');
	});
	res.on('end', function(data){
		res.end(JSON.stringify(data));
	});
}).listen(8888);
console.log("listening");
//process.on("uncaughtException", function(e){console.log('!!!!!!!!!!!!!!!!!!!!!!');console.log(e);console.log('!!!!!!!!!!!!!!!!!!!!!!')});