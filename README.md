gun [![Build Status](https://travis-ci.org/amark/gun.svg?branch=master)](https://travis-ci.org/amark/gun)
===

## Getting Started

If you do not have [node](http://nodejs.org/) or [npm](https://www.npmjs.com/), read [this](https://github.com/amark/gun/blob/master/examples/install.sh) first.
Then in your terminal, run:

```bash
npm install gun
```

Now you can require it in the app you want to build.

```javascript
var Gun = require('gun');
```

Once included, initialize a gun instance with a file path or your AWS S3 credentials.

```javascript
var gun = Gun({
	file: 'data.json',
	s3: { // Optional!
		key: '', // AWS Access Key
		secret: '', // AWS Secret Token
		bucket: '' // The bucket you want to save into
	}
});
```

These are the default persistence layers, they are modular and can be replaced others.

Using S3 is recommended for deployment, and using a file is recommended for local development.

Now you can save your first object, and create a reference to it.

```javascript
gun.set({ hello: 'world' }).key('my/first/data');
```

Altogether, try it with the node hello world web server which will reply with your data.

```javascript
var Gun = require('gun');
var gun = Gun({ file: 'data.json' });
gun.set({ hello: 'world' }).key('my/first/data');

var http = require('http');
http.createServer(function(req, res){
	gun.load('my/first/data', function(err, data){
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(data));
	});
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
```

Fire up your browser and hit that URL - you'll see your data, plus some gun specific metadata.

## Examples

Try out some online [examples](http://gunjs.herokuapp.com/) or run them yourself with the following command:

```bash
git clone http://github.com/amark/gun
cd gun/examples && npm install
node express.js 8080
```
Then visit [http://localhost:8080](http://localhost:8080) in your browser.


## API

Below is a really basic overview of how the gun API works. For a more detailed explanation with many more examples, [check out the wiki](https://github.com/amark/gun/wiki).

## Setting Data

In gun, it can be helpful to think of everything as field/value pairs. For example, let's say we have a `user` object that looks like this:

```json
{
  "username": "marknadal",
  "name": "Mark Nadal",
  "email": "mark@gunDB.io"
}
```
Now, we want to save this object to a key called `usernames/marknadal`. We can do that like this:

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
}, function(err){
  // Do something to handle the error
}).key('usernames/marknadal');
```

### Getting Data

Once we have some data stored in gun, we need a way to get them out again. Retrieving the data that we just stored would look like this:

```javascript
gun.load('usernames/marknadal').get(function(user){
  console.log(user.name); // Prints `Mark Nadal` to the console
});
```

Basically, this tells gun to check `usernames/marknadal`, and then return the object it finds associated with it. For more information, including how to save relational or document based data, [check out the wiki](https://github.com/amark/gun/wiki).

---

## YOU
We're just getting started, so join us! Being lonely is never any fun, especially when programming.
I want to help you, because my goal is for GUN to be the easiest database ever.
That means if you ever get stuck on something for longer than 5 minutes,
you should talk to me so I can help you solve it.
Your input will then help me improve gun.
We are also really open to contributions! GUN is easy to extend and customize:

`Gun.on('opt').event(function(gun, opt){ /* Your module here! */  })`

It is also important to us that your database is not a magical black box.
So often our questions get dismissed with "its complicated hard low level stuff, let the experts handle it."
And we do not think that attitude will generate any progress for people.
Instead, we want to make everyone an expert by actually getting really good at explaining the concepts.
So join our community, in the quest of learning cool things and helping yourself and others build awesome technology. 

 - [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/amark/gun?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) (all chats relating to GUN and development should be here! IRC style)
 - Google Group: https://groups.google.com/forum/#!forum/g-u-n (for slower threaded discussions)

## Ahead
- ~~Realtime push to the browser~~
- ~~Persistence in the browser~~
- Authorization callbacks
- Security or ACLs
- Schema Validation
- Point of Entry Encryption
- ~~Graph manipulation~~
- Server to server communication
- Test more
- Bug fixes
- Data Structures:
 - ~~Groups~~
 - Linked Lists
 - Collections (hybrid: linked-groups/paginated-lists)
 - CRDTs
 - OT
 - Locking / Strong Consistency (sacrifices Availability)
- Query:
 - SQL
 - MongoDB Query Documents
 - Neo4j Cypher
 - Gremlin Query Language
