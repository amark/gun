var hiredis = require("./hiredis"),
    num_clients = 10,
    active_clients = 0,
    pipeline = 0,
    num_requests = parseInt(process.argv[2]) || 20000,
    issued_requests = 0,
    test_start;

var tests = [];
tests.push({
    descr: "PING",
    command: ["PING"]
});
tests.push({
    descr: "SET",
    command: ["SET", "foo", "bar"]
});
tests.push({
    descr: "GET",
    command: ["GET", "foo"]
});
tests.push({
    descr: "LPUSH 8 bytes",
    command: ["LPUSH", "mylist-8", new Buffer(Array(8).join("-"))]
});
tests.push({
    descr: "LPUSH 64 bytes",
    command: ["LPUSH", "mylist-64", new Buffer(Array(64).join("-"))]
});
tests.push({
    descr: "LPUSH 512 bytes",
    command: ["LPUSH", "mylist-512", new Buffer(Array(512).join("-"))]
});
tests.push({
    descr: "LRANGE 10 elements, 8 bytes",
    command: ["LRANGE", "mylist-8", "0", "9"]
});
tests.push({
    descr: "LRANGE 100 elements, 8 bytes",
    command: ["LRANGE", "mylist-8", "0", "99"]
});
tests.push({
    descr: "LRANGE 100 elements, 64 bytes",
    command: ["LRANGE", "mylist-64", "0", "99"]
});
tests.push({
    descr: "LRANGE 100 elements, 512 bytes",
    command: ["LRANGE", "mylist-512", "0", "99"]
});

function call(client, test) {
    client.on("reply", function() {
        if (issued_requests < num_requests) {
            request();
        } else {
            client.end();
            if (--active_clients == 0)
                done(test);
        }
    });

    function request() {
        issued_requests++;
        client.write.apply(client,test.command);
    };

    request();
}

function done(test) {
    var time = (new Date - test_start);
    var op_rate = (num_requests/(time/1000.0)).toFixed(2);
    console.log(test.descr + ": " + op_rate + " ops/sec");
    next();
}

function concurrent_test(test) {
    var i = num_clients;
    var client;

    issued_requests = 0;
    test_start = new Date;
    while(i-- && issued_requests < num_requests) {
        active_clients++;
        client = hiredis.createConnection();
        call(client, test);
    }
}

function pipelined_test(test) {
    var client = hiredis.createConnection();
    var received_replies = 0;

    issued_requests = 0;
    while (issued_requests < num_requests) {
        issued_requests++;
        client.write.apply(client,test.command);
    }

    test_start = new Date;
    client.on("reply", function() {
        if (++received_replies == num_requests) {
            client.end();
            done(test);
        }
    });
}

function next() {
    var test = tests.shift();
    if (test) {
        if (pipeline) {
            pipelined_test(test);
        } else {
            concurrent_test(test);
        }
    }
}

next();

