var http = require('http');

var Gun = require('../../index');
var gun = Gun({ 
	file: 'data.json'
});


gun.get('data').put({a: {data: 1}, b: {data: 2}});
var server = http.createServer(function(req, res){});
gun.wsp(server);
server.listen(8081);

console.log('Server started on port ' + 8081 + ' with /gun');