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
	gun.load('my/first/data', function(err, data){
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

#### Commands
- **set** `gun.set(stuff, function(err){})`
	- `gun.set({ name: "Mark Nadal", email: "mark@gunDB.io", cat: { name: "Hobbes", species: "kitty" } })`
 	- Just pass in whatever you want to save and gun will automatically deconstruct it into a graph for you. Magical? Yes.
 	However, there are some sad disclaimers, the current version of gun does not support arrays,
	but it can handle circular references and partials! We'll go over this more later.
	- `function`, this callback will return with an error if gun failed to serialize the data.
	Please report any bugs!
- **key** `gun.set(stuff).key(index)`
	- `gun.set(Mark).key('mark@gunDB.io') // where Mark is the object from above`
	- Imagine the whole big universe out there, your app has to _start_ somewhere.
	That is exactly what keys do, they open the door to your data.
	Like a house with many entrances, we want to begin our experience from a certain perspective.
	And so we step into our graph from a key, entering onto the node that we made it reference.
	This beginning node is probably usually the user of your app,
	so our key should be something easily uniquely rememberable -
	like their email, phone number, or username.
	Just index all of them by chaining many keys together `gun.set(Mark).key('mark@gunDB.io').key('username/amark')`!
- **load** `gun.load(key).get(function(data){})`
	- Now, without further ado, let us begin our journey.
	Load will retrieve the top layer of our data in the fastest possible way.
	If we have it in memory, it'll come to us instantly.
	If not, we'll pull it in from your closest gun peers (probably your server) that have it
	and then cache it for future use. GUN handles all this data synchronization for you,
	so that way you can focus on what you love - building awesome apps.
- **path** `gun.load(key).path('cat').get(function(data){})`
	- To keep things blazing fast, we only return partials.
	In fact, everything is composed of partials - that is how we construct our graph.
	Now we want to start exploring it, like getting Mark's cat.
	Let's get fancy with partials and circular references!
```javascript
gun.load('mark@gunDB.io').get(function(Mark){
	console.log("Hello ", Mark.name);
	this.path('username').set('amark'); // because we hadn't specified this yet!
	this.path('cat').get(function(Hobbes){ // `this` is a gun context of the node.
		this.set({ servant: Mark, coat: "tabby" }); // Hobbes has become Mark's master!
		this.key('kitten/hobbes'); // index cats that are taking over the internet!
	});
});
```
- 
	- Note how we were able to use path to navigate into a field and set its value.
	We are also able to use path to follow relations into other nodes, like Hobbes.
	Notice how we performed a set directly on Hobbes -
	gun handled the complexity of merging the new data into the existing data.
	Partials won't overwrite anything unless we explicitly reuse the same field,
	in which case it just becomes an update.
	The cool thing is, gun will handle conflicts on concurrent updates for you!
- **get** `gun.load('kitten/hobbes').path('servant.cat.servant.name').get(function(name){ console.log(name) })`
	- Now let us invert our perspective. Because we made a key to open our graph with Hobbes
	we can now start with him. From that point of view,
	we can then trace our path out into Hobbes' servant,
	whom has a cat (named Hobbes),
	whom has a servant, whose name we want to know.
	Just who might it be? Well, `"Mark Nadal"` of course!

Send me an email before Hobbes takes over! I want to hear from you, and help. <3

## Ahead
- ~~Realtime push to the browser~~
- Persistence in the browser
- Authorization callbacks
- Graph manipulation
- Server to server communication
- Test more
- Bug fixes
- More via additional module hooks (schema, queries, etc.)
