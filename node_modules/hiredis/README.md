[![Build Status](https://travis-ci.org/pietern/hiredis-node.png?branch=master)](https://travis-ci.org/pietern/hiredis-node)

# hiredis-node

Node extension that wraps [hiredis][hiredis].
Because Node is already good at doing I/O, hiredis-node only provides
bindings to the protocol parser.
The hiredis protocol parser is faster than JavaScript protocol parsers,
but the speedup only becomes noticable for large replies.
If you use Redis for simple SET/GET operations, there won't be a big
benefit to using hiredis.
If you use Redis for big SUNION/SINTER/LRANGE/ZRANGE operations, the
benefit to using hiredis-node can be significant.

[hiredis]: http://github.com/redis/hiredis

## Install

Install with [NPM][npm]:

```
npm install hiredis
```

[npm]: https://npmjs.org/

## Usage

hiredis-node works out of the box with Matt Ranney's [node_redis][node_redis].
The latter has an optional dependency on hiredis-node, so maybe you're
already using it without knowing.

Alternatively, you can use it directly:

```javascript
var hiredis = require("hiredis"),
    reader = new hiredis.Reader();

// Data comes in
reader.feed("$5\r\nhello\r\n");

// Reply comes out
reader.get() // => "hello"
```

Instead of returning strings for bulk payloads, it can also return
buffers:

```javascript
var hiredis = require("hiredis"),
    reader = new hiredis.Reader({ return_buffers: true });

// Data comes in
reader.feed("$5\r\nhello\r\n");

// Reply comes out
reader.get() // => <Buffer 68 65 6c 6c 6f>
```

[node_redis]: http://github.com/mranney/node_redis

## Windows

Dmitry Gorbunov (@fuwaneko) made a [fork of hiredis-node][windows_fork] with Windows support.

[windows_fork]: https://github.com/fuwaneko/hiredis-node

## License

This code is released under the BSD license, after the license of hiredis.
