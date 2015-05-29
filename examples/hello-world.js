var Gun = require('gun');
var gun = Gun({
  s3: {
    key: '', // AWS Access Key
    secret: '', // AWS Secret Token
    bucket: '' // The bucket you want to save into
  }
});
gun.put({ hello: 'world' }).key('my/first/data');

var http = require('http');
http.createServer(function(req, res){
  gun.get('my/first/data', function(err, data){
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(data));
  });
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
