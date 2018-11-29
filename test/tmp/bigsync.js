var Gun = require('../../');

/*var data = '';
var a = [], b = Gun.text.random(1000 * 1000 * 10), c;
for(var i = 0; i <= 7; i++){
	data += b;
}
*/
data = 1;

var gun = Gun('http://localhost:8765/gun');
//var gun = Gun();

setTimeout(function(){
	
	/*console.log("READ!");
	gun.get('bigsync').get('raw').on(function(a,b){
		console.log('yay!', b, (a && a.slice && a.slice(0,20)) || a, a.length);
	});
	return;*/
	console.log("SEND!");
	gun.get('bigsync').get('raw').put(data, function(ack){console.log(ack)});

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