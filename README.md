gun [![Build Status](https://travis-ci.org/amark/gun.svg?branch=master)](https://travis-ci.org/amark/gun)
===

Quick getting started guide.

Make sure you already have node and npm installed.

`npm install gun`

Then require it in your app.

`var Gun = require('gun');`

Then initialize a gun instance with your AWS S3 credentials.

```JavaScript
var gun = Gun({
	s3: {
		key: '', // AWS Access Key
		secret: '', // AWS Secret Token
		bucket: '' // The bucket you want to save into
}});
```

S3 is the default persistence layer, it can be replaced with others.

Currently, gun is only key/value but graph support is coming soon.

Save your first object, and create a reference to it.

`gun.set({ hello: 'world' }).key('my/first/data');`

Now, altogether, with the node hello world web server that replies with your data.

```JavaScript
var Gun = require('gun');
var gun = Gun({
	s3: {
  	key: '', // AWS Access Key
  	secret: '', // AWS Secret Token
  	bucket: '' // The bucket you want to save into
}});
gun.set({ hello: 'world' }).key('my/first/data');

var http = require('http');
http.createServer(function (req, res) {
	gun.load('my/first/data', function(data){
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(data));
	});
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
```

Now fire up your browser and hit that URL - you'll see your data, plus some gun specific metadata.

## Ahead
- Realtime push to the browser
- Persistence in the browser
- Authorization callbacks
- Graph manipulation
- Server to server communication
- Test more
- Bug fixes
- More via additional module hooks (schema, queries, etc.)
