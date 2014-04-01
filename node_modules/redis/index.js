/*global Buffer require exports console setTimeout */

var net = require("net"),
    util = require("./lib/util"),
    Queue = require("./lib/queue"),
    to_array = require("./lib/to_array"),
    events = require("events"),
    crypto = require("crypto"),
    parsers = [], commands,
    connection_id = 0,
    default_port = 6379,
    default_host = "127.0.0.1";

// can set this to true to enable for all connections
exports.debug_mode = false;

var arraySlice = Array.prototype.slice
function trace() {
    if (!exports.debug_mode) return;
    console.log.apply(null, arraySlice.call(arguments))
}

// hiredis might not be installed
try {
    require("./lib/parser/hiredis");
    parsers.push(require("./lib/parser/hiredis"));
} catch (err) {
    if (exports.debug_mode) {
        console.warn("hiredis parser not installed.");
    }
}

parsers.push(require("./lib/parser/javascript"));

function RedisClient(stream, options) {
    this.stream = stream;
    this.options = options = options || {};

    this.connection_id = ++connection_id;
    this.connected = false;
    this.ready = false;
    this.connections = 0;
    if (this.options.socket_nodelay === undefined) {
        this.options.socket_nodelay = true;
    }
    this.should_buffer = false;
    this.command_queue_high_water = this.options.command_queue_high_water || 1000;
    this.command_queue_low_water = this.options.command_queue_low_water || 0;
    this.max_attempts = null;
    if (options.max_attempts && !isNaN(options.max_attempts) && options.max_attempts > 0) {
        this.max_attempts = +options.max_attempts;
    }
    this.command_queue = new Queue(); // holds sent commands to de-pipeline them
    this.offline_queue = new Queue(); // holds commands issued but not able to be sent
    this.commands_sent = 0;
    this.connect_timeout = false;
    if (options.connect_timeout && !isNaN(options.connect_timeout) && options.connect_timeout > 0) {
        this.connect_timeout = +options.connect_timeout;
    }
    this.enable_offline_queue = true;
    if (typeof this.options.enable_offline_queue === "boolean") {
        this.enable_offline_queue = this.options.enable_offline_queue;
    }
    this.retry_max_delay = null;
    if (options.retry_max_delay !== undefined && !isNaN(options.retry_max_delay) && options.retry_max_delay > 0) {
        this.retry_max_delay = options.retry_max_delay;
    }

    this.initialize_retry_vars();
    this.pub_sub_mode = false;
    this.subscription_set = {};
    this.monitoring = false;
    this.closing = false;
    this.server_info = {};
    this.auth_pass = null;
    if (options.auth_pass !== undefined) {
        this.auth_pass = options.auth_pass;
    }
    this.parser_module = null;
    this.selected_db = null;	// save the selected db here, used when reconnecting

    this.old_state = null;

    var self = this;

    this.stream.on("connect", function () {
        self.on_connect();
    });

    this.stream.on("data", function (buffer_from_socket) {
        self.on_data(buffer_from_socket);
    });

    this.stream.on("error", function (msg) {
        self.on_error(msg.message);
    });

    this.stream.on("close", function () {
        self.connection_gone("close");
    });

    this.stream.on("end", function () {
        self.connection_gone("end");
    });

    this.stream.on("drain", function () {
        self.should_buffer = false;
        self.emit("drain");
    });

    events.EventEmitter.call(this);
}
util.inherits(RedisClient, events.EventEmitter);
exports.RedisClient = RedisClient;

RedisClient.prototype.initialize_retry_vars = function () {
    this.retry_timer = null;
    this.retry_totaltime = 0;
    this.retry_delay = 150;
    this.retry_backoff = 1.7;
    this.attempts = 1;
};

RedisClient.prototype.unref = function () {
    trace("User requesting to unref the connection");
    if (this.connected) {
        trace("unref'ing the socket connection");
        this.stream.unref();
    }
    else {
        trace("Not connected yet, will unref later");
        this.once("connect", function () {
            this.unref();
        })
    }
};

// flush offline_queue and command_queue, erroring any items with a callback first
RedisClient.prototype.flush_and_error = function (message) {
    var command_obj, error;

    error = new Error(message);

    while (this.offline_queue.length > 0) {
        command_obj = this.offline_queue.shift();
        if (typeof command_obj.callback === "function") {
            try {
                command_obj.callback(error);
            } catch (callback_err) {
                this.emit("error", callback_err);
            }
        }
    }
    this.offline_queue = new Queue();

    while (this.command_queue.length > 0) {
        command_obj = this.command_queue.shift();
        if (typeof command_obj.callback === "function") {
            try {
                command_obj.callback(error);
            } catch (callback_err) {
                this.emit("error", callback_err);
            }
        }
    }
    this.command_queue = new Queue();
};

RedisClient.prototype.on_error = function (msg) {
    var message = "Redis connection to " + this.host + ":" + this.port + " failed - " + msg;

    if (this.closing) {
        return;
    }

    if (exports.debug_mode) {
        console.warn(message);
    }

    this.flush_and_error(message);

    this.connected = false;
    this.ready = false;

    this.emit("error", new Error(message));
    // "error" events get turned into exceptions if they aren't listened for.  If the user handled this error
    // then we should try to reconnect.
    this.connection_gone("error");
};

RedisClient.prototype.do_auth = function () {
    var self = this;

    if (exports.debug_mode) {
        console.log("Sending auth to " + self.host + ":" + self.port + " id " + self.connection_id);
    }
    self.send_anyway = true;
    self.send_command("auth", [this.auth_pass], function (err, res) {
        if (err) {
            if (err.toString().match("LOADING")) {
                // if redis is still loading the db, it will not authenticate and everything else will fail
                console.log("Redis still loading, trying to authenticate later");
                setTimeout(function () {
                    self.do_auth();
                }, 2000); // TODO - magic number alert
                return;
            } else if (err.toString().match("no password is set")) {
                console.log("Warning: Redis server does not require a password, but a password was supplied.")
                err = null;
                res = "OK";
            } else {
                return self.emit("error", new Error("Auth error: " + err.message));
            }
        }
        if (res.toString() !== "OK") {
            return self.emit("error", new Error("Auth failed: " + res.toString()));
        }
        if (exports.debug_mode) {
            console.log("Auth succeeded " + self.host + ":" + self.port + " id " + self.connection_id);
        }
        if (self.auth_callback) {
            self.auth_callback(err, res);
            self.auth_callback = null;
        }

        // now we are really connected
        self.emit("connect");
        self.initialize_retry_vars();

        if (self.options.no_ready_check) {
            self.on_ready();
        } else {
            self.ready_check();
        }
    });
    self.send_anyway = false;
};

RedisClient.prototype.on_connect = function () {
    if (exports.debug_mode) {
        console.log("Stream connected " + this.host + ":" + this.port + " id " + this.connection_id);
    }

    this.connected = true;
    this.ready = false;
    this.connections += 1;
    this.command_queue = new Queue();
    this.emitted_end = false;
    if (this.options.socket_nodelay) {
        this.stream.setNoDelay();
    }
    this.stream.setTimeout(0);

    this.init_parser();

    if (this.auth_pass) {
        this.do_auth();
    } else {
        this.emit("connect");
        this.initialize_retry_vars();

        if (this.options.no_ready_check) {
            this.on_ready();
        } else {
            this.ready_check();
        }
    }
};

RedisClient.prototype.init_parser = function () {
    var self = this;

    if (this.options.parser) {
        if (! parsers.some(function (parser) {
            if (parser.name === self.options.parser) {
                self.parser_module = parser;
                if (exports.debug_mode) {
                    console.log("Using parser module: " + self.parser_module.name);
                }
                return true;
            }
        })) {
            throw new Error("Couldn't find named parser " + self.options.parser + " on this system");
        }
    } else {
        if (exports.debug_mode) {
            console.log("Using default parser module: " + parsers[0].name);
        }
        this.parser_module = parsers[0];
    }

    this.parser_module.debug_mode = exports.debug_mode;

    // return_buffers sends back Buffers from parser to callback. detect_buffers sends back Buffers from parser, but
    // converts to Strings if the input arguments are not Buffers.
    this.reply_parser = new this.parser_module.Parser({
        return_buffers: self.options.return_buffers || self.options.detect_buffers || false
    });

    // "reply error" is an error sent back by Redis
    this.reply_parser.on("reply error", function (reply) {
        if (reply instanceof Error) {
            self.return_error(reply);
        } else {
            self.return_error(new Error(reply));
        }
    });
    this.reply_parser.on("reply", function (reply) {
        self.return_reply(reply);
    });
    // "error" is bad.  Somehow the parser got confused.  It'll try to reset and continue.
    this.reply_parser.on("error", function (err) {
        self.emit("error", new Error("Redis reply parser error: " + err.stack));
    });
};

RedisClient.prototype.on_ready = function () {
    var self = this;

    this.ready = true;

    if (this.old_state !== null) {
        this.monitoring = this.old_state.monitoring;
        this.pub_sub_mode = this.old_state.pub_sub_mode;
        this.selected_db = this.old_state.selected_db;
        this.old_state = null;
    }

    // magically restore any modal commands from a previous connection
    if (this.selected_db !== null) {
        // this trick works if and only if the following send_command
        // never goes into the offline queue
        var pub_sub_mode = this.pub_sub_mode;
        this.pub_sub_mode = false;
        this.send_command('select', [this.selected_db]);
        this.pub_sub_mode = pub_sub_mode;
    }
    if (this.pub_sub_mode === true) {
        // only emit "ready" when all subscriptions were made again
        var callback_count = 0;
        var callback = function () {
            callback_count--;
            if (callback_count === 0) {
                self.emit("ready");
            }
        };
        Object.keys(this.subscription_set).forEach(function (key) {
            var parts = key.split(" ");
            if (exports.debug_mode) {
                console.warn("sending pub/sub on_ready " + parts[0] + ", " + parts[1]);
            }
            callback_count++;
            self.send_command(parts[0] + "scribe", [parts[1]], callback);
        });
        return;
    } else if (this.monitoring) {
        this.send_command("monitor");
    } else {
        this.send_offline_queue();
    }
    this.emit("ready");
};

RedisClient.prototype.on_info_cmd = function (err, res) {
    var self = this, obj = {}, lines, retry_time;

    if (err) {
        return self.emit("error", new Error("Ready check failed: " + err.message));
    }

    lines = res.toString().split("\r\n");

    lines.forEach(function (line) {
        var parts = line.split(':');
        if (parts[1]) {
            obj[parts[0]] = parts[1];
        }
    });

    obj.versions = [];
    if( obj.redis_version ){
        obj.redis_version.split('.').forEach(function (num) {
            obj.versions.push(+num);
        });
    }

    // expose info key/vals to users
    this.server_info = obj;

    if (!obj.loading || (obj.loading && obj.loading === "0")) {
        if (exports.debug_mode) {
            console.log("Redis server ready.");
        }
        this.on_ready();
    } else {
        retry_time = obj.loading_eta_seconds * 1000;
        if (retry_time > 1000) {
            retry_time = 1000;
        }
        if (exports.debug_mode) {
            console.log("Redis server still loading, trying again in " + retry_time);
        }
        setTimeout(function () {
            self.ready_check();
        }, retry_time);
    }
};

RedisClient.prototype.ready_check = function () {
    var self = this;

    if (exports.debug_mode) {
        console.log("checking server ready state...");
    }

    this.send_anyway = true;  // secret flag to send_command to send something even if not "ready"
    this.info(function (err, res) {
        self.on_info_cmd(err, res);
    });
    this.send_anyway = false;
};

RedisClient.prototype.send_offline_queue = function () {
    var command_obj, buffered_writes = 0;

    while (this.offline_queue.length > 0) {
        command_obj = this.offline_queue.shift();
        if (exports.debug_mode) {
            console.log("Sending offline command: " + command_obj.command);
        }
        buffered_writes += !this.send_command(command_obj.command, command_obj.args, command_obj.callback);
    }
    this.offline_queue = new Queue();
    // Even though items were shifted off, Queue backing store still uses memory until next add, so just get a new Queue

    if (!buffered_writes) {
        this.should_buffer = false;
        this.emit("drain");
    }
};

RedisClient.prototype.connection_gone = function (why) {
    var self = this;

    // If a retry is already in progress, just let that happen
    if (this.retry_timer) {
        return;
    }

    if (exports.debug_mode) {
        console.warn("Redis connection is gone from " + why + " event.");
    }
    this.connected = false;
    this.ready = false;

    if (this.old_state === null) {
        var state = {
            monitoring: this.monitoring,
            pub_sub_mode: this.pub_sub_mode,
            selected_db: this.selected_db
        };
        this.old_state = state;
        this.monitoring = false;
        this.pub_sub_mode = false;
        this.selected_db = null;
    }

    // since we are collapsing end and close, users don't expect to be called twice
    if (! this.emitted_end) {
        this.emit("end");
        this.emitted_end = true;
    }

    this.flush_and_error("Redis connection gone from " + why + " event.");

    // If this is a requested shutdown, then don't retry
    if (this.closing) {
        this.retry_timer = null;
        if (exports.debug_mode) {
            console.warn("connection ended from quit command, not retrying.");
        }
        return;
    }

    var nextDelay = Math.floor(this.retry_delay * this.retry_backoff);
    if (this.retry_max_delay !== null && nextDelay > this.retry_max_delay) {
        this.retry_delay = this.retry_max_delay;
    } else {
        this.retry_delay = nextDelay;
    }

    if (exports.debug_mode) {
        console.log("Retry connection in " + this.retry_delay + " ms");
    }

    if (this.max_attempts && this.attempts >= this.max_attempts) {
        this.retry_timer = null;
        // TODO - some people need a "Redis is Broken mode" for future commands that errors immediately, and others
        // want the program to exit.  Right now, we just log, which doesn't really help in either case.
        console.error("node_redis: Couldn't get Redis connection after " + this.max_attempts + " attempts.");
        return;
    }

    this.attempts += 1;
    this.emit("reconnecting", {
        delay: self.retry_delay,
        attempt: self.attempts
    });
    this.retry_timer = setTimeout(function () {
        if (exports.debug_mode) {
            console.log("Retrying connection...");
        }

        self.retry_totaltime += self.retry_delay;

        if (self.connect_timeout && self.retry_totaltime >= self.connect_timeout) {
            self.retry_timer = null;
            // TODO - engage Redis is Broken mode for future commands, or whatever
            console.error("node_redis: Couldn't get Redis connection after " + self.retry_totaltime + "ms.");
            return;
        }

        self.stream.connect(self.port, self.host);
        self.retry_timer = null;
    }, this.retry_delay);
};

RedisClient.prototype.on_data = function (data) {
    if (exports.debug_mode) {
        console.log("net read " + this.host + ":" + this.port + " id " + this.connection_id + ": " + data.toString());
    }

    try {
        this.reply_parser.execute(data);
    } catch (err) {
        // This is an unexpected parser problem, an exception that came from the parser code itself.
        // Parser should emit "error" events if it notices things are out of whack.
        // Callbacks that throw exceptions will land in return_reply(), below.
        // TODO - it might be nice to have a different "error" event for different types of errors
        this.emit("error", err);
    }
};

RedisClient.prototype.return_error = function (err) {
    var command_obj = this.command_queue.shift(), queue_len = this.command_queue.getLength();

    if (this.pub_sub_mode === false && queue_len === 0) {
        this.command_queue = new Queue();
        this.emit("idle");
    }
    if (this.should_buffer && queue_len <= this.command_queue_low_water) {
        this.emit("drain");
        this.should_buffer = false;
    }

    if (command_obj && typeof command_obj.callback === "function") {
        try {
            command_obj.callback(err);
        } catch (callback_err) {
            this.emit("error", callback_err);
        }
    } else {
        console.log("node_redis: no callback to send error: " + err.message);
        this.emit("error", err);
    }
};

// if a callback throws an exception, re-throw it on a new stack so the parser can keep going.
// if a domain is active, emit the error on the domain, which will serve the same function.
// put this try/catch in its own function because V8 doesn't optimize this well yet.
function try_callback(client, callback, reply) {
    try {
        callback(null, reply);
    } catch (err) {
        if (process.domain) {
            process.domain.emit('error', err);
            process.domain.exit();
        } else {
            client.emit("error", err);
        }
    }
}

// hgetall converts its replies to an Object.  If the reply is empty, null is returned.
function reply_to_object(reply) {
    var obj = {}, j, jl, key, val;

    if (reply.length === 0) {
        return null;
    }

    for (j = 0, jl = reply.length; j < jl; j += 2) {
        key = reply[j].toString();
        val = reply[j + 1];
        obj[key] = val;
    }

    return obj;
}

function reply_to_strings(reply) {
    var i;

    if (Buffer.isBuffer(reply)) {
        return reply.toString();
    }

    if (Array.isArray(reply)) {
        for (i = 0; i < reply.length; i++) {
            if (reply[i] !== null && reply[i] !== undefined) {
                reply[i] = reply[i].toString();
            }
        }
        return reply;
    }

    return reply;
}

RedisClient.prototype.return_reply = function (reply) {
    var command_obj, len, type, timestamp, argindex, args, queue_len;

    // If the "reply" here is actually a message received asynchronously due to a
    // pubsub subscription, don't pop the command queue as we'll only be consuming
    // the head command prematurely.
    if (Array.isArray(reply) && reply.length > 0 && reply[0]) {
        type = reply[0].toString();
    }

    if (this.pub_sub_mode && (type == 'message' || type == 'pmessage')) {
        trace("received pubsub message");
    }
    else {
        command_obj = this.command_queue.shift();
    }

    queue_len = this.command_queue.getLength();

    if (this.pub_sub_mode === false && queue_len === 0) {
        this.command_queue = new Queue();  // explicitly reclaim storage from old Queue
        this.emit("idle");
    }
    if (this.should_buffer && queue_len <= this.command_queue_low_water) {
        this.emit("drain");
        this.should_buffer = false;
    }

    if (command_obj && !command_obj.sub_command) {
        if (typeof command_obj.callback === "function") {
            if (this.options.detect_buffers && command_obj.buffer_args === false) {
                // If detect_buffers option was specified, then the reply from the parser will be Buffers.
                // If this command did not use Buffer arguments, then convert the reply to Strings here.
                reply = reply_to_strings(reply);
            }

            // TODO - confusing and error-prone that hgetall is special cased in two places
            if (reply && 'hgetall' === command_obj.command.toLowerCase()) {
                reply = reply_to_object(reply);
            }

            try_callback(this, command_obj.callback, reply);
        } else if (exports.debug_mode) {
            console.log("no callback for reply: " + (reply && reply.toString && reply.toString()));
        }
    } else if (this.pub_sub_mode || (command_obj && command_obj.sub_command)) {
        if (Array.isArray(reply)) {
            type = reply[0].toString();

            if (type === "message") {
                this.emit("message", reply[1].toString(), reply[2]); // channel, message
            } else if (type === "pmessage") {
                this.emit("pmessage", reply[1].toString(), reply[2].toString(), reply[3]); // pattern, channel, message
            } else if (type === "subscribe" || type === "unsubscribe" || type === "psubscribe" || type === "punsubscribe") {
                if (reply[2] === 0) {
                    this.pub_sub_mode = false;
                    if (this.debug_mode) {
                        console.log("All subscriptions removed, exiting pub/sub mode");
                    }
                } else {
                    this.pub_sub_mode = true;
                }
                // subscribe commands take an optional callback and also emit an event, but only the first response is included in the callback
                // TODO - document this or fix it so it works in a more obvious way
                // reply[1] can be null
                var reply1String = (reply[1] === null) ? null : reply[1].toString();
                if (command_obj && typeof command_obj.callback === "function") {
                    try_callback(this, command_obj.callback, reply1String);
                }
                this.emit(type, reply1String, reply[2]); // channel, count
            } else {
                throw new Error("subscriptions are active but got unknown reply type " + type);
            }
        } else if (! this.closing) {
            throw new Error("subscriptions are active but got an invalid reply: " + reply);
        }
    } else if (this.monitoring) {
        len = reply.indexOf(" ");
        timestamp = reply.slice(0, len);
        argindex = reply.indexOf('"');
        args = reply.slice(argindex + 1, -1).split('" "').map(function (elem) {
            return elem.replace(/\\"/g, '"');
        });
        this.emit("monitor", timestamp, args);
    } else {
        throw new Error("node_redis command queue state error. If you can reproduce this, please report it.");
    }
};

// This Command constructor is ever so slightly faster than using an object literal, but more importantly, using
// a named constructor helps it show up meaningfully in the V8 CPU profiler and in heap snapshots.
function Command(command, args, sub_command, buffer_args, callback) {
    this.command = command;
    this.args = args;
    this.sub_command = sub_command;
    this.buffer_args = buffer_args;
    this.callback = callback;
}

RedisClient.prototype.send_command = function (command, args, callback) {
    var arg, command_obj, i, il, elem_count, buffer_args, stream = this.stream, command_str = "", buffered_writes = 0, last_arg_type, lcaseCommand;

    if (typeof command !== "string") {
        throw new Error("First argument to send_command must be the command name string, not " + typeof command);
    }

    if (Array.isArray(args)) {
        if (typeof callback === "function") {
            // probably the fastest way:
            //     client.command([arg1, arg2], cb);  (straight passthrough)
            //         send_command(command, [arg1, arg2], cb);
        } else if (! callback) {
            // most people find this variable argument length form more convenient, but it uses arguments, which is slower
            //     client.command(arg1, arg2, cb);   (wraps up arguments into an array)
            //       send_command(command, [arg1, arg2, cb]);
            //     client.command(arg1, arg2);   (callback is optional)
            //       send_command(command, [arg1, arg2]);
            //     client.command(arg1, arg2, undefined);   (callback is undefined)
            //       send_command(command, [arg1, arg2, undefined]);
            last_arg_type = typeof args[args.length - 1];
            if (last_arg_type === "function" || last_arg_type === "undefined") {
                callback = args.pop();
            }
        } else {
            throw new Error("send_command: last argument must be a callback or undefined");
        }
    } else {
        throw new Error("send_command: second argument must be an array");
    }

    if (callback && process.domain) callback = process.domain.bind(callback);

    // if the last argument is an array and command is sadd or srem, expand it out:
    //     client.sadd(arg1, [arg2, arg3, arg4], cb);
    //  converts to:
    //     client.sadd(arg1, arg2, arg3, arg4, cb);
    lcaseCommand = command.toLowerCase();
    if ((lcaseCommand === 'sadd' || lcaseCommand === 'srem') && args.length > 0 && Array.isArray(args[args.length - 1])) {
        args = args.slice(0, -1).concat(args[args.length - 1]);
    }

    // if the value is undefined or null and command is set or setx, need not to send message to redis
    if (command === 'set' || command === 'setex') {
        if(args[args.length - 1] === undefined || args[args.length - 1] === null) {
            var err = new Error('send_command: ' + command + ' value must not be undefined or null');
            return callback && callback(err);
        }
    }

    buffer_args = false;
    for (i = 0, il = args.length, arg; i < il; i += 1) {
        if (Buffer.isBuffer(args[i])) {
            buffer_args = true;
        }
    }

    command_obj = new Command(command, args, false, buffer_args, callback);

    if ((!this.ready && !this.send_anyway) || !stream.writable) {
        if (exports.debug_mode) {
            if (!stream.writable) {
                console.log("send command: stream is not writeable.");
            }
        }

        if (this.enable_offline_queue) {
            if (exports.debug_mode) {
                console.log("Queueing " + command + " for next server connection.");
            }
            this.offline_queue.push(command_obj);
            this.should_buffer = true;
        } else {
            var not_writeable_error = new Error('send_command: stream not writeable. enable_offline_queue is false');
            if (command_obj.callback) {
                command_obj.callback(not_writeable_error);
            } else {
                throw not_writeable_error;
            }
        }

        return false;
    }

    if (command === "subscribe" || command === "psubscribe" || command === "unsubscribe" || command === "punsubscribe") {
        this.pub_sub_command(command_obj);
    } else if (command === "monitor") {
        this.monitoring = true;
    } else if (command === "quit") {
        this.closing = true;
    } else if (this.pub_sub_mode === true) {
        throw new Error("Connection in subscriber mode, only subscriber commands may be used");
    }
    this.command_queue.push(command_obj);
    this.commands_sent += 1;

    elem_count = args.length + 1;

    // Always use "Multi bulk commands", but if passed any Buffer args, then do multiple writes, one for each arg.
    // This means that using Buffers in commands is going to be slower, so use Strings if you don't already have a Buffer.

    command_str = "*" + elem_count + "\r\n$" + command.length + "\r\n" + command + "\r\n";

    if (! buffer_args) { // Build up a string and send entire command in one write
        for (i = 0, il = args.length, arg; i < il; i += 1) {
            arg = args[i];
            if (typeof arg !== "string") {
                arg = String(arg);
            }
            command_str += "$" + Buffer.byteLength(arg) + "\r\n" + arg + "\r\n";
        }
        if (exports.debug_mode) {
            console.log("send " + this.host + ":" + this.port + " id " + this.connection_id + ": " + command_str);
        }
        buffered_writes += !stream.write(command_str);
    } else {
        if (exports.debug_mode) {
            console.log("send command (" + command_str + ") has Buffer arguments");
        }
        buffered_writes += !stream.write(command_str);

        for (i = 0, il = args.length, arg; i < il; i += 1) {
            arg = args[i];
            if (!(Buffer.isBuffer(arg) || arg instanceof String)) {
                arg = String(arg);
            }

            if (Buffer.isBuffer(arg)) {
                if (arg.length === 0) {
                    if (exports.debug_mode) {
                        console.log("send_command: using empty string for 0 length buffer");
                    }
                    buffered_writes += !stream.write("$0\r\n\r\n");
                } else {
                    buffered_writes += !stream.write("$" + arg.length + "\r\n");
                    buffered_writes += !stream.write(arg);
                    buffered_writes += !stream.write("\r\n");
                    if (exports.debug_mode) {
                        console.log("send_command: buffer send " + arg.length + " bytes");
                    }
                }
            } else {
                if (exports.debug_mode) {
                    console.log("send_command: string send " + Buffer.byteLength(arg) + " bytes: " + arg);
                }
                buffered_writes += !stream.write("$" + Buffer.byteLength(arg) + "\r\n" + arg + "\r\n");
            }
        }
    }
    if (exports.debug_mode) {
        console.log("send_command buffered_writes: " + buffered_writes, " should_buffer: " + this.should_buffer);
    }
    if (buffered_writes || this.command_queue.getLength() >= this.command_queue_high_water) {
        this.should_buffer = true;
    }
    return !this.should_buffer;
};

RedisClient.prototype.pub_sub_command = function (command_obj) {
    var i, key, command, args;

    if (this.pub_sub_mode === false && exports.debug_mode) {
        console.log("Entering pub/sub mode from " + command_obj.command);
    }
    this.pub_sub_mode = true;
    command_obj.sub_command = true;

    command = command_obj.command;
    args = command_obj.args;
    if (command === "subscribe" || command === "psubscribe") {
        if (command === "subscribe") {
            key = "sub";
        } else {
            key = "psub";
        }
        for (i = 0; i < args.length; i++) {
            this.subscription_set[key + " " + args[i]] = true;
        }
    } else {
        if (command === "unsubscribe") {
            key = "sub";
        } else {
            key = "psub";
        }
        for (i = 0; i < args.length; i++) {
            delete this.subscription_set[key + " " + args[i]];
        }
    }
};

RedisClient.prototype.end = function () {
    this.stream._events = {};
    this.connected = false;
    this.ready = false;
    this.closing = true;
    return this.stream.destroySoon();
};

function Multi(client, args) {
    this._client = client;
    this.queue = [["MULTI"]];
    if (Array.isArray(args)) {
        this.queue = this.queue.concat(args);
    }
}

exports.Multi = Multi;

// take 2 arrays and return the union of their elements
function set_union(seta, setb) {
    var obj = {};

    seta.forEach(function (val) {
        obj[val] = true;
    });
    setb.forEach(function (val) {
        obj[val] = true;
    });
    return Object.keys(obj);
}

// This static list of commands is updated from time to time.  ./lib/commands.js can be updated with generate_commands.js
commands = set_union(["get", "set", "setnx", "setex", "append", "strlen", "del", "exists", "setbit", "getbit", "setrange", "getrange", "substr",
    "incr", "decr", "mget", "rpush", "lpush", "rpushx", "lpushx", "linsert", "rpop", "lpop", "brpop", "brpoplpush", "blpop", "llen", "lindex",
    "lset", "lrange", "ltrim", "lrem", "rpoplpush", "sadd", "srem", "smove", "sismember", "scard", "spop", "srandmember", "sinter", "sinterstore",
    "sunion", "sunionstore", "sdiff", "sdiffstore", "smembers", "zadd", "zincrby", "zrem", "zremrangebyscore", "zremrangebyrank", "zunionstore",
    "zinterstore", "zrange", "zrangebyscore", "zrevrangebyscore", "zcount", "zrevrange", "zcard", "zscore", "zrank", "zrevrank", "hset", "hsetnx",
    "hget", "hmset", "hmget", "hincrby", "hdel", "hlen", "hkeys", "hvals", "hgetall", "hexists", "incrby", "decrby", "getset", "mset", "msetnx",
    "randomkey", "select", "move", "rename", "renamenx", "expire", "expireat", "keys", "dbsize", "auth", "ping", "echo", "save", "bgsave",
    "bgrewriteaof", "shutdown", "lastsave", "type", "multi", "exec", "discard", "sync", "flushdb", "flushall", "sort", "info", "monitor", "ttl",
    "persist", "slaveof", "debug", "config", "subscribe", "unsubscribe", "psubscribe", "punsubscribe", "publish", "watch", "unwatch", "cluster",
    "restore", "migrate", "dump", "object", "client", "eval", "evalsha"], require("./lib/commands"));

commands.forEach(function (fullCommand) {
    var command = fullCommand.split(' ')[0];

    RedisClient.prototype[command] = function (args, callback) {
        if (Array.isArray(args) && typeof callback === "function") {
            return this.send_command(command, args, callback);
        } else {
            return this.send_command(command, to_array(arguments));
        }
    };
    RedisClient.prototype[command.toUpperCase()] = RedisClient.prototype[command];

    Multi.prototype[command] = function () {
        this.queue.push([command].concat(to_array(arguments)));
        return this;
    };
    Multi.prototype[command.toUpperCase()] = Multi.prototype[command];
});

// store db in this.select_db to restore it on reconnect
RedisClient.prototype.select = function (db, callback) {
    var self = this;

    this.send_command('select', [db], function (err, res) {
        if (err === null) {
            self.selected_db = db;
        }
        if (typeof(callback) === 'function') {
            callback(err, res);
        }
    });
};
RedisClient.prototype.SELECT = RedisClient.prototype.select;

// Stash auth for connect and reconnect.  Send immediately if already connected.
RedisClient.prototype.auth = function () {
    var args = to_array(arguments);
    this.auth_pass = args[0];
    this.auth_callback = args[1];
    if (exports.debug_mode) {
        console.log("Saving auth as " + this.auth_pass);
    }

    if (this.connected) {
        this.send_command("auth", args);
    }
};
RedisClient.prototype.AUTH = RedisClient.prototype.auth;

RedisClient.prototype.hmget = function (arg1, arg2, arg3) {
    if (Array.isArray(arg2) && typeof arg3 === "function") {
        return this.send_command("hmget", [arg1].concat(arg2), arg3);
    } else if (Array.isArray(arg1) && typeof arg2 === "function") {
        return this.send_command("hmget", arg1, arg2);
    } else {
        return this.send_command("hmget", to_array(arguments));
    }
};
RedisClient.prototype.HMGET = RedisClient.prototype.hmget;

RedisClient.prototype.hmset = function (args, callback) {
    var tmp_args, tmp_keys, i, il, key;

    if (Array.isArray(args) && typeof callback === "function") {
        return this.send_command("hmset", args, callback);
    }

    args = to_array(arguments);
    if (typeof args[args.length - 1] === "function") {
        callback = args[args.length - 1];
        args.length -= 1;
    } else {
        callback = null;
    }

    if (args.length === 2 && (typeof args[0] === "string" || typeof args[0] === "number") && typeof args[1] === "object") {
        // User does: client.hmset(key, {key1: val1, key2: val2})
        // assuming key is a string, i.e. email address

        // if key is a number, i.e. timestamp, convert to string
        if (typeof args[0] === "number") {
            args[0] = args[0].toString();
        }

        tmp_args = [ args[0] ];
        tmp_keys = Object.keys(args[1]);
        for (i = 0, il = tmp_keys.length; i < il ; i++) {
            key = tmp_keys[i];
            tmp_args.push(key);
            tmp_args.push(args[1][key]);
        }
        args = tmp_args;
    }

    return this.send_command("hmset", args, callback);
};
RedisClient.prototype.HMSET = RedisClient.prototype.hmset;

Multi.prototype.hmset = function () {
    var args = to_array(arguments), tmp_args;
    if (args.length >= 2 && typeof args[0] === "string" && typeof args[1] === "object") {
        tmp_args = [ "hmset", args[0] ];
        Object.keys(args[1]).map(function (key) {
            tmp_args.push(key);
            tmp_args.push(args[1][key]);
        });
        if (args[2]) {
            tmp_args.push(args[2]);
        }
        args = tmp_args;
    } else {
        args.unshift("hmset");
    }

    this.queue.push(args);
    return this;
};
Multi.prototype.HMSET = Multi.prototype.hmset;

Multi.prototype.exec = function (callback) {
    var self = this;
    var errors = [];
    // drain queue, callback will catch "QUEUED" or error
    // TODO - get rid of all of these anonymous functions which are elegant but slow
    this.queue.forEach(function (args, index) {
        var command = args[0], obj;
        if (typeof args[args.length - 1] === "function") {
            args = args.slice(1, -1);
        } else {
            args = args.slice(1);
        }
        if (args.length === 1 && Array.isArray(args[0])) {
            args = args[0];
        }
        if (command.toLowerCase() === 'hmset' && typeof args[1] === 'object') {
            obj = args.pop();
            Object.keys(obj).forEach(function (key) {
                args.push(key);
                args.push(obj[key]);
            });
        }
        this._client.send_command(command, args, function (err, reply) {
            if (err) {
                var cur = self.queue[index];
                if (typeof cur[cur.length - 1] === "function") {
                    cur[cur.length - 1](err);
                } else {
                    errors.push(new Error(err));
                }
            }
        });
    }, this);

    // TODO - make this callback part of Multi.prototype instead of creating it each time
    return this._client.send_command("EXEC", [], function (err, replies) {
        if (err) {
            if (callback) {
                errors.push(new Error(err));
                callback(errors);
                return;
            } else {
                throw new Error(err);
            }
        }

        var i, il, reply, args;

        if (replies) {
            for (i = 1, il = self.queue.length; i < il; i += 1) {
                reply = replies[i - 1];
                args = self.queue[i];

                // TODO - confusing and error-prone that hgetall is special cased in two places
                if (reply && args[0].toLowerCase() === "hgetall") {
                    replies[i - 1] = reply = reply_to_object(reply);
                }

                if (typeof args[args.length - 1] === "function") {
                    args[args.length - 1](null, reply);
                }
            }
        }

        if (callback) {
            callback(null, replies);
        }
    });
};
Multi.prototype.EXEC = Multi.prototype.exec;

RedisClient.prototype.multi = function (args) {
    return new Multi(this, args);
};
RedisClient.prototype.MULTI = function (args) {
    return new Multi(this, args);
};


// stash original eval method
var eval_orig = RedisClient.prototype.eval;
// hook eval with an attempt to evalsha for cached scripts
RedisClient.prototype.eval = RedisClient.prototype.EVAL = function () {
    var self = this,
        args = to_array(arguments),
        callback;

    if (typeof args[args.length - 1] === "function") {
        callback = args.pop();
    }

    if (Array.isArray(args[0])) {
        args = args[0];
    }

    // replace script source with sha value
    var source = args[0];
    args[0] = crypto.createHash("sha1").update(source).digest("hex");

    self.evalsha(args, function (err, reply) {
        if (err && /NOSCRIPT/.test(err.message)) {
            args[0] = source;
            eval_orig.call(self, args, callback);

        } else if (callback) {
            callback(err, reply);
        }
    });
};


exports.createClient = function (port_arg, host_arg, options) {
    var port = port_arg || default_port,
        host = host_arg || default_host,
        redis_client, net_client;

    net_client = net.createConnection(port, host);

    redis_client = new RedisClient(net_client, options);

    redis_client.port = port;
    redis_client.host = host;

    return redis_client;
};

exports.print = function (err, reply) {
    if (err) {
        console.log("Error: " + err);
    } else {
        console.log("Reply: " + reply);
    }
};
