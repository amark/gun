var net = require("net"),
    hiredis = require('bindings')('hiredis.node');

exports.Reader = hiredis.Reader;
exports.createConnection = function(port, host) {
    var s = net.createConnection(port || 6379, host);
    var r = new hiredis.Reader();
    var _write = s.write;

    s.write = function() {
        var i, args = arguments;
        _write.call(s, "*" + args.length + "\r\n");
        for (i = 0; i < args.length; i++) {
            var arg = args[i];
            _write.call(s, "$" + arg.length + "\r\n" + arg + "\r\n");
        }
    }

    s.on("data", function(data) {
        var reply;
        r.feed(data);
        try {
            while((reply = r.get()) !== undefined)
                s.emit("reply", reply);
        } catch(err) {
            r = null;
            s.emit("error", err);
            s.destroy();
        }
    });

    return s;
}

