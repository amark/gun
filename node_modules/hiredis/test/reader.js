var assert = require("assert"),
    hiredis = require("../hiredis");

var passed = 0;
var failed = 0;

function test(str, fn) {
    try {
        fn();
        passed++;
    } catch (err) {
        console.log("\x1B[1;31m" + str + " failed!\x1B[0m");
        console.log(err.stack + "\n");
        failed++;
    }
}

test("CreateReader", function() {
    var reader = new hiredis.Reader();
    assert.notEqual(reader, null);
});

test("StatusReply", function() {
    var reader = new hiredis.Reader();
    reader.feed("+OK\r\n");
    assert.equal("OK", reader.get());
});

test("StatusReplyAsBuffer", function() {
    var reader = new hiredis.Reader({ return_buffers: true });
    reader.feed("+OK\r\n");
    var reply = reader.get();
    assert.ok(Buffer.isBuffer(reply));
    assert.equal("OK", reply.toString());
});

test("IntegerReply", function() {
    var reader = new hiredis.Reader();
    reader.feed(":1\r\n");
    assert.equal(1, reader.get());
});

// This test fails since v8 doesn't to 64-bit integers...
test("LargeIntegerReply", function() {
    var reader = new hiredis.Reader();
    reader.feed(":9223372036854775807\r\n");
    assert.equal("9223372036854775807", String(reader.get()));
});

test("ErrorReply", function() {
    var reader = new hiredis.Reader();
    reader.feed("-ERR foo\r\n");
    var reply = reader.get();
    assert.equal(Error, reply.constructor);
    assert.equal("ERR foo", reply.message);
});

test("ErrorReplyWithReturnBuffers", function() {
    var reader = new hiredis.Reader({ return_buffers: true });
    reader.feed("-ERR foo\r\n");
    var reply = reader.get();
    assert.equal(Error, reply.constructor);
    assert.equal("ERR foo", reply.message);
});

test("NullBulkReply", function() {
    var reader = new hiredis.Reader();
    reader.feed("$-1\r\n");
    assert.equal(null, reader.get());
});

test("EmptyBulkReply", function() {
    var reader = new hiredis.Reader();
    reader.feed("$0\r\n\r\n");
    assert.equal("", reader.get());
});

test("BulkReply", function() {
    var reader = new hiredis.Reader();
    reader.feed("$3\r\nfoo\r\n");
    assert.equal("foo", reader.get());
});

test("BulkReplyAsBuffer", function() {
    var reader = new hiredis.Reader({ return_buffers: true });
    reader.feed("$3\r\nfoo\r\n");
    var reply = reader.get();
    assert.ok(Buffer.isBuffer(reply));
    assert.equal("foo", reply.toString());
});

test("BulkReplyWithEncoding", function() {
    var reader = new hiredis.Reader();
    reader.feed("$" + Buffer.byteLength("☃") + "\r\n☃\r\n");
    assert.equal("☃", reader.get());
});

test("NullMultiBulkReply", function() {
    var reader = new hiredis.Reader();
    reader.feed("*-1\r\n");
    assert.equal(null, reader.get());
});

test("EmptyMultiBulkReply", function() {
    var reader = new hiredis.Reader();
    reader.feed("*0\r\n");
    assert.deepEqual([], reader.get());
});

test("MultiBulkReply", function() {
    var reader = new hiredis.Reader();
    reader.feed("*2\r\n$3\r\nfoo\r\n$3\r\nbar\r\n");
    assert.deepEqual(["foo", "bar"], reader.get());
});

test("NestedMultiBulkReply", function() {
    var reader = new hiredis.Reader();
    reader.feed("*2\r\n*2\r\n$3\r\nfoo\r\n$3\r\nbar\r\n$3\r\nqux\r\n");
    assert.deepEqual([["foo", "bar"], "qux"], reader.get());
});

test("DeeplyNestedMultiBulkReply", function() {
    var i;
    var reader = new hiredis.Reader();
    var expected = 1;

    for (i = 0; i < 8; i++) {
      reader.feed("*1\r\n");
      expected = [expected];
    }

    reader.feed(":1\r\n");

    assert.deepEqual(reader.get(), expected);
});

test("TooDeeplyNestedMultiBulkReply", function() {
    var i;
    var reader = new hiredis.Reader();

    for (i = 0; i < 9; i++) {
      reader.feed("*1\r\n");
    }

    reader.feed(":1\r\n");

    assert.throws(
      function() {
        reader.get();
      },
      /nested multi/
    );
});

test("MultiBulkReplyWithNonStringValues", function() {
    var reader = new hiredis.Reader();
    reader.feed("*3\r\n:1\r\n+OK\r\n$-1\r\n");
    assert.deepEqual([1, "OK", null], reader.get());
});

test("FeedWithBuffer", function() {
    var reader = new hiredis.Reader();
    reader.feed(new Buffer("$3\r\nfoo\r\n"));
    assert.deepEqual("foo", reader.get());
});

test("UndefinedReplyOnIncompleteFeed", function() {
    var reader = new hiredis.Reader();
    reader.feed("$3\r\nfoo");
    assert.deepEqual(undefined, reader.get());
    reader.feed("\r\n");
    assert.deepEqual("foo", reader.get());
});

test("Leaks", function(beforeExit) {
    /* The "leaks" utility is only available on OSX. */
    if (process.platform != "darwin") return;

    var done = 0;
    var leaks = require('child_process').spawn("leaks", [process.pid]);
    leaks.stdout.on("data", function(data) {
        var str = data.toString();
        var notice = "Node 0.2.5 always leaks 16 bytes (this is " + process.versions.node + ")";
        var matches;
        if ((matches = /(\d+) leaks?/i.exec(str)) != null) {
            if (parseInt(matches[1]) > 0) {
                console.log(str);
                console.log('\x1B[31mNotice: ' + notice + '\x1B[0m');
            }
        }
        done = 1;
    });

    process.on('exit', function() {
        assert.ok(done, "Leaks test should have completed");
    });
});
