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

## API
At its core, gun is just a synchronization protocol - but that is boring and useless by itself. So I've implemented a really exciting and easy API for you to use. If you don't like my approach or naming convention, you can simply rename things yourself or better yet fork the project and build a beautifully custom API and everything will still work via the protocol.

#### Approach
- If you are unfamiliar with **reactive** programming, it is a code structure that emphasizes vertical readability by avoiding nested loops and callbacks. Instead of doing
```javascript
// ugly
for(var i = 0; i < PDFs.length; i += 1){
	var fileName = PDFs[i];
	readFromDisk(filename, function(file){
		var pages = splitIntoPages(file);
		for(var j = 0; j < pages.length; j += 1){
			var page = pages[j];
			saveToFolder('page' + j, page, function(err, done){
				console.log("Done! If no," err);
			});
		}
	});
}
```
you can simplify to something more clearer and reusable
```javascript
var PDF = {};
PDF.read = function(fileName){
	readFromDisk(filename, PDF.split);
}
PDF.split = function(file){
	splitIntoPages(file).forEach(PDF.save);
}
PDF.save = function(page, number){
	saveToFolder('page' + number, page, PDF.done);
}
PDF.done = function(err, done){
	console.log("Done! If no," err);
}
PDFs.forEach(PDF.read);
```
- If you are unfamiliar with **chaining**, it is an API style that allows you to zoom into a context without having to create new variables. So rather than doing
```javascript
// ugly
var page = document.getElementById("page");
var child = page.firstElementChild;
child.style.background = "blue";
child.style.color = "green";
child.addEventListener('click', function(event){
  console.log("hello world!");
}, true);
```
you can just do
```javascript
$('#page')
	.children()
	.first()
	.css("background", "blue")
	.css("color", "green")
	.on("click", function(event){
		console.log("hello world");
	});
```

## Ahead
- ~~Realtime push to the browser~~
- Persistence in the browser
- Authorization callbacks
- Graph manipulation
- Server to server communication
- Test more
- Bug fixes
- More via additional module hooks (schema, queries, etc.)
