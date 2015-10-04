gun [![NPM downloads](https://img.shields.io/npm/dm/gun.svg?style=flat)](https://npmjs.org/package/gun) [![Build Status](https://travis-ci.org/amark/gun.svg?branch=master)](https://travis-ci.org/amark/gun) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/amark/gun?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
===

GUN is a realtime, decentralized, offline-first, graph database engine.

[![1 minute demo of fault tolerance](http://img.youtube.com/vi/-i-11T5ZI9o/0.jpg)](https://youtu.be/-i-11T5ZI9o)

## Getting Started

For the browser, try out this [tutorial](http://gun.js.org/web/think.html) and then use a [starter template](http://plnkr.co/edit/f1yzn5). This README is for GUN servers.

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

These are the default persistence layers, they are modular and can be replaced by others.

Using S3 is recommended for deployment, and using a file is recommended for local development only.

## Demos

The examples included in this repo are online [here](http://gunjs.herokuapp.com/), you can run them locally by:

```bash
npm install gun
cd node_modules/gun
node examples/http.js 8080
```

Then visit [http://localhost:8080](http://localhost:8080) in your browser. If that did not work it is probably because npm installed it to a global directory. To fix that try `mkdir node_modules` in your desired directory and re-run the above commands. You also might have to add `sudo` in front of the commands.

***
## WARNINGS
### v0.2.0 [![Queued](https://badge.waffle.io/amark/gun.svg?label=Queue&title=Queue)](http://waffle.io/amark/gun) [![In Progress](https://badge.waffle.io/amark/gun.svg?label=InProgress&title=In%20Progress)](http://waffle.io/amark/gun) [![Pending Deploy](https://badge.waffle.io/amark/gun.svg?label=Pending&title=Done)](http://waffle.io/amark/gun) Status

The wire protocol was changed between 0.1.x and 0.2.x, meaning if you upgrade gun your old data might not load properly. If you are listening for errors you will get a `''Not a valid graph!'` but if you are not listening to errors it will be silent, beware of this. Here is a [migration guide](https://github.com/amark/gun/wiki/Migration-Guide) if you are having problems.

Version 0.2.0 is currently in alpha.  Important changes include `.get` to `.val`, `.load` to `.get`, and `.set` to `.put`. Documentation is our current focus, and `.all` functionality will be coming soon.  The latest documentation can be found at https://github.com/amark/gun/wiki/0.2.0-API-and-How-to.  Please report any issues via https://github.com/amark/gun/issues.

GUN is not stable, and therefore should not be trusted in a production environment.
***

## [API](https://github.com/amark/gun/wiki/JS-API)

Below is a really basic overview of how the gun API works. For a more detailed explanation with many more examples, [check out the wiki](https://github.com/amark/gun/wiki).

## Putting Data

In gun, it can be helpful to think of everything as field/value pairs. For example, let's say we have a `user` object that looks like this:

```json
{
  "username": "marknadal",
  "name": "Mark Nadal",
  "email": "mark@gunDB.io"
}
```
Now, we want to save this object to a key called `'usernames/marknadal'`. We can do that like this:

```javascript
gun.put({
  username: "marknadal",
  name: "Mark Nadal",
  email: "mark@gunDB.io"
}).key('usernames/marknadal');
```

We can also pass `put` a callback that can be used to handle errors:

```javascript
gun.put({
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
gun.get('usernames/marknadal').val(function(user){
  console.log(user.name); // Prints `Mark Nadal` to the console
});
```

Basically, this tells gun to check `'usernames/marknadal'`, and then return the object it finds associated with it. For more information, including how to save relational or document based data, [check out the wiki](https://github.com/amark/gun/wiki), or watch this tutorial:

[![7 min | Getting Started with Data Types](http://img.youtube.com/vi/cOO6wz1rZVY/0.jpg)](https://youtu.be/cOO6wz1rZVY)

---

## YOU 
Being lonely is never any fun, especially when programming.
Our goal is for GUN to be the easiest database ever,
which means if you ever get stuck on something for longer than 5 minutes,
let us know so we can help you. Your input is invaluable,
as it enables us where to refine GUN. So drop us a line in the [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/amark/gun?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)! Or join the [mail list](https://groups.google.com/forum/#!forum/g-u-n).

Thanks to the following people who have contributed to GUN, via code, issues, or conversation:

[agborkowski](https://github.com/agborkowski), [alexlafroscia](https://github.com/alexlafroscia), [anubiann00b](https://github.com/anubiann00b), [bromagosa](https://github.com/bromagosa), [coolaj86](https://github.com/coolaj86), [d-oliveros](https://github.com/d-oliveros), [danscan](https://github.com/danscan), [forrestjt](https://github.com/forrestjt), [gedw99](https://github.com/gedw99), [HelloCodeMing](https://github.com/HelloCodeMing), [JosePedroDias](https://github.com/josepedrodias), [onetom](https://github.com/onetom), [ndarilek](https://github.com/ndarilek), [phpnode](https://github.com/phpnode), [RangerMauve](https://github.com/RangerMauve), [riston](https://github.com/riston), [rootsical](https://github.com/rootsical), [rrrene](https://github.com/rrrene), [ssr1ram](https://github.com/ssr1ram), [Xe](https://github.com/Xe), [zot](https://github.com/zot)

This list of contributors was manually compiled, alphabetically sorted. If we missed you, please submit an issue so we can get you added!

## Contribute

Extending GUN or writing modules for it is as simple as:

`Gun.on('opt').event(function(gun, opt){ /* Your module here! */  })`

We also want our database to be comprehensible, not some magical black box.
So often database questions get dismissed with "its complicated hard low level stuff, let the experts handle it".
That attitude prevents progress, instead we welcome teaching people and listening to new perspectives.
Join along side us in a quest to learn cool things and help others build awesome technology!

We need help on the following roadmap.

## Ahead
- ~~Realtime push to the browser~~
- ~~Persistence in the browser~~
- Efficient storage engine
- Authorization callbacks
- Security or ACLs
- ~~Schema Validation~~ [@RangerMauve](https://github.com/gundb/gun-schema)
- Point of Entry Encryption
- ~~Graph manipulation~~
- Server to server communication
- Test more
- WebRTC Transport
- LRU or some Expiry (so RAM doesn't asplode)
- Bug fixes
- Data Structures:
 - ~~Sets~~ (Table/Collections, Unordered Lists)
 - CRDTs
 - OT
 - Locking / Strong Consistency (sacrifices Availability)
- Query:
 - SQL
 - MongoDB Query Documents
 - Neo4j Cypher
 - LINQ
 - Gremlin Query Language
