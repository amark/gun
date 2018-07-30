var Gun = require('../../');

var data = require('fs').readFileSync('/Users/mark/Downloads/raddataformat.txt');

data = data.toString();
data += data + data;

console.log(data.length);

var gun = Gun('http://localhost:8080/gun');

setTimeout(function(){
	console.log("SEND!");
	gun.get('bigsync').get('raw').put(data);

	/*var req = require('http').request({
		host: 'localhost'
		,port: '8080'
		,method: 'POST'
	}, function(res){
		console.log("GOT REPLY!", res);
		res.on('data', function(chunk){
			console.log("!!!", chunk);
		});
		res.on('error', function(err){
			console.log("ERROR", err);
		})
	});
	req.write(data);
	req.end();*/
}, 1000);