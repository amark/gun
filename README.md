gun [![Build Status](https://travis-ci.org/amark/gun.svg?branch=master)](https://travis-ci.org/amark/gun)
===

FOR MHACKS!
===
I'll be filling this in with help for you in just a moment!

If you need any help with HTML/CSS/JS just text me 760.689.2468 or email mark@gunDB.io

PRIZE: Win 2 Adult Electric Scooters! To help you zip around town/campus. :)
![WIN THIS!](http://ecx.images-amazon.com/images/I/71kVRVWvTxL._SL1500_.jpg)

## Getting Started

Assuming you already have [node](http://nodejs.org/) and [npm](https://www.npmjs.com/) installed, install GunDB:

```bash
$ npm install gun
```

Then, you can require it in your app.

```javascript
var Gun = require('gun');
```

Once included, initialize a gun instance with your AWS S3 credentials.

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

```javascript
gun.set({ hello: 'world' }).key('my/first/data');
```

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

Below is a really basic overview of how the GunDB API works.  For a more detailed explanation with many more examples, [check out the wiki](#).

## Setting Values

In GunDB, it can be helpful to think of everything as a key-value pair.  For example, let's say we have a `user` object that looks like this:

```json
{
  "username": "marknadal",
  "name": "Mark Nadal",
  "email": "mark@gunDB.io"
}
```
Now, we want to save this object to a key called `usernames/marknadal`.  We can do that like this:

```javascript
gun.set({
  username: "marknadal",
  name: "Mark Nadal",
  email: "mark@gunDB.io"
}).key('usernames/marknadal');
```

We can also pass `set` a callback that can be used to handle errors:

```javascript
gun.set({
  username: "marknadal",
  name: "Mark Nadal",
  email: "mark@gunDB.io"
}, function(error) {
  // Do something to handle the error
}).key('usernames/marknadal');
```

### Getting Values

Once we have some values stored into GunDB, we need a way to get them out again.  Retrieving the data that we just stored would look like this:

```javascript
get.load('usernames/marknadal').get(function(user) {
  console.log(user.name); // Prints `Mark Nadal` to the console
});
```

Basically, this tells GunDB to check `usernames/marknadal`, and then return the object it finds associated with it.  For more information, including object relationships and how to handle unset keys, [check out the wiki](#).

---

## YOU
We're just getting started and gun is foremost designed to be accessible and modular, because the database industry will never make any progress unless we can be more open and approachable. Our goal is to make everybody experts by actually explaining concepts rather than being dismissive with "its complicated hard low level stuff, let the experts handle it." So join the community, learn cool things, and contribute modules and plugins!

`Gun.on('opt').event(function(gun, opt){ /* Your module here! */  })`

Google Group: https://groups.google.com/forum/#!forum/g-u-n

## Ahead
- ~~Realtime push to the browser~~
- Persistence in the browser
- Authorization callbacks
- Graph manipulation
- Server to server communication
- Test more
- Bug fixes
- More via additional module hooks (schema, queries, etc.)
