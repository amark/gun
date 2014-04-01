(function (parent) {
    'use strict';

    var url    = require('url'),
        http   = require('http'),
        https  = require('https'),
        uuid   = require('node-uuid'),
        events = require('events'),
        util;

    function InvalidURL (parsedURL) {
        this.parsedURL = parsedURL;
    }
    InvalidURL.prototype = {
        prototype: Error.prototype,
        toString: function () { return "Invalid URL: " + this.parsedURL.href; }
    };

    function InvalidState (extra) {
        this.extra = extra;
    }
    InvalidState.prototype = {
        prototype: Error.prototype,
        toString: function () { return "Invalid State " + this.extra; }
    };

    util = (function () {
        var empty = {};
        return {
            hasOwnProperty: function (obj, field) {
                return empty.hasOwnProperty.call(obj, field);
            },

            shallowCopy: function (src, dest) {
                var keys = Object.keys(src),
                    i;
                for (i = 0; i < keys.length; i += 1) {
                    dest[keys[i]] = src[keys[i]];
                }
            },

            liftFunctions: function (src, dest, fields) {
                var i, field;
                for (i = 0; i < fields.length; i += 1) {
                    field = fields[i];
                    if (undefined !== src[field] &&
                        undefined !== src[field].call) {
                        dest[field] = src[field].bind(src);
                    }
                }
            }
        };
    }());

    function SockJSClient (server) {
        var parsed, serverId, sessionId;

        parsed = url.parse(server);

        if ('http:' === parsed.protocol) {
            this.client = http;
        } else if ('https:' === parsed.protocol) {
            this.client = https;
        } else {
            throw new InvalidURL(parsed);
        }

        if (parsed.pathname === '/') {
            parsed.pathname = '';
        }

        serverId = Math.round(Math.random() * 999);
        sessionId = uuid();

        this.server = url.parse(
            parsed.protocol + "//" + parsed.host + parsed.pathname +
                "/" + serverId + "/" + sessionId);

        this.error = Object.getPrototypeOf(this).error.bind(this);
        this.connection = Object.getPrototypeOf(this).connection.bind(this);
        this.closed = Object.getPrototypeOf(this).closed.bind(this);

        this.emitter = new events.EventEmitter();
        util.liftFunctions(
            this.emitter, this,
            ['on', 'once', 'removeListener', 'removeAllListeners', 'emit']);

        this.writeBuffer = [];
    }

    SockJSClient.prototype = {
        isReady:   false,
        isClosing: false,
        isClosed:  false,

        connect: function () {
            if (this.isReady || this.isClosing || this.isClosed) {
                return;
            }
            var transport = new XHRStreaming(this);
            transport.on('error', this.error);
            transport.on('connection', this.connection);
            transport.on('close', this.closed);
            (new StateMachine(transport)).invoke();
        },

        connection: function (transport) {
            if (this.isClosing) {
                transport.close();
            } else if (! (this.isReady || this.isClosed)) {
                this.isReady = true;
                this.transport = transport;
                this.emit('connection');
                if (0 !== this.writeBuffer.length) {
                    transport.write(this.writeBuffer);
                    this.writeBuffer = [];
                }
            }
        },

        error: function () {
            this.isReady = false;
            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift('error');
            this.emit.apply(this, args);
            if (this.isClosing) {
                this.closed();
            }
        },

        write: function (message) {
            if (this.isClosed || this.isClosing) {
                return;
            } else if (this.isReady) {
                return this.transport.write([message]);
            } else {
                this.writeBuffer.push(message);
            }
        },

        close: function () {
            if (! (this.isClosing || this.isClosed)) {
                this.isClosing = true;
                if (this.isReady) {
                    this.isReady = false;
                    this.transport.close();
                }
            }
        },

        closed: function () {
            if (! this.isClosed) {
                var args = Array.prototype.slice.call(arguments, 0);
                args.unshift('close');
                this.emit.apply(this, args);
            }
            this.isClosed  = true;
            this.isClosing = false;
            this.isReady   = false;
        }
    };

    function XHRStreaming (sjs) {
        this.sjs = sjs;
        this.emitter = new events.EventEmitter();
        util.liftFunctions(
            this.emitter, this,
            ['on', 'once', 'removeListener', 'removeAllListeners', 'emit']);
        this.error = Object.getPrototypeOf(this).error.bind(this);
        this.initialPayloadRemaining = this.initialPayloadLength;
        this.partialChunk = "";
    }
    XHRStreaming.prototype = {
        fsm: {'start':          'connected',
              'connected':      'dataInitial',
              'dataInitial':    'dataOpen',
              'dataOpen':       'running',
              'running':        'running',
              'errored':        'errored'
             },

        initialPayloadLength: 2049,

        start: function (sm) {
            var request = {method: 'POST',
                           headers: {'Content-Length': 0}},
                clientRequest;
            util.shallowCopy(this.sjs.server, request);
            request.path += '/xhr_streaming';
            clientRequest = this.sjs.client.request(request, sm.stepper());
            clientRequest.on('error', this.error.bind(this, sm));
            clientRequest.end();
        },

        write: function (message) {
            var data = JSON.stringify(message),
                request = {method: 'POST',
                           headers: {
                               'Content-Type': 'application/json',
                               'Content-Length': Buffer.byteLength(data,'utf8')}},
                clientRequest;
            util.shallowCopy(this.sjs.server, request);
            request.path += '/xhr_send';
            clientRequest = this.sjs.client.request(request);
            clientRequest.write(data);
            clientRequest.end();
        },

        close: function () {
            if (undefined !== this.response) {
                this.response.removeAllListeners();
                this.response.destroy();
            }
            this.emit('close');
        },

        connected: function (sm, result) {
            this.response = result;
            if (200 !== result.statusCode) {
                this.error(sm, result.statusCode);
            } else {
                result.setEncoding('utf8');
                result.on('data', sm.stepper());
                result.on('end', this.reopen.bind(this, sm));
            }
        },

        dataInitial: function (sm, chunk) {
            var remaining = this.initialPayloadRemaining - chunk.length;
            if (remaining > 0) {
                this.initialPayloadRemaining = remaining;
                sm.switchTo('dataInitial');
            } else {
                this.initialPayloadRemaining = this.initialPayloadLength;
                if (remaining < 0) {
                    (sm.stepper())(sm, chunk.slice(this.initialPayloadRemaining));
                }
            }
        },

        dataOpen: function (sm, chunk) {
            var fsm;
            chunk = this.partialChunk.concat(chunk);
            if (chunk.length < 2) {
                this.partialChunk = chunk;
                sm.switchTo('dataOpen');
            } else {
                this.partialChunk = "";
                if ('o\n' === chunk.slice(0, 2)) {
                    fsm = {};
                    util.shallowCopy(this.fsm, fsm);
                    this.fsm = fsm;
                    fsm['dataInitial'] = 'running'; // from here on, another 'o\n' is an error
                    this.emit('connection', this);
                    if (2 < chunk.length) {
                        (sm.stepper())(sm, chunk.slice(2));
                    }
                } else {
                    this.error(sm, chunk);
                }
            }
        },

        running: function (sm, chunk) {
            var type;
            chunk = this.partialChunk.concat(chunk);
            if (1 < chunk.length) {
                type = chunk.charAt(0);
                switch (type) {
                case 'h': // heartbeat
                    this.partialChunk = chunk.slice(2);
                    break;
                case 'a': // data
                    this.emitData(chunk, this.partialChunk.length);
                    break;
                case 'c': // close frame
                    this.close();
                    break;
                default:
                    this.error(sm, "Unexpected frame type", type, chunk);
                }
            } else {
                this.partialChunk = chunk;
            }
        },

        emitData: function (chunk, searchStart) {
            var index = chunk.indexOf('\n', searchStart),
                array, i;
            if (-1 === index) {
                this.partialChunk = chunk;
            } else {
                index += 1;
                if (index === chunk.length) {
                    this.partialChunk = "";
                } else {
                    this.partialChunk = chunk.slice(index);
                }
                array = JSON.parse(chunk.slice(1, index));
                for (i = 0; i < array.length; i += 1) {
                    this.sjs.emit('data', array[i]);
                }
            }
        },

        reopen: function (sm) {
            (sm.stepper('start'))();
        },

        error: function () {
            if (undefined !== this.response) {
                this.response.removeAllListeners();
                this.response.destroy();
            }
            var args = Array.prototype.slice.call(arguments, 0),
                sm;
            sm = args.shift();
            sm.switchTo('errored');
            this.emit('error', args);
        },

        errored: function () {}
    }

    function StateMachine (callbacks) {
        this.callbacks = callbacks;
        this.stepper = Object.getPrototypeOf(this).stepper.bind(this);
        this.fun = this.stepper();
    }
    StateMachine.prototype = {
        invoke: function () {
            if (undefined === this.fun) {
                throw new InvalidState(this);
            }
            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(this);
            return this.fun.apply(this.callbacks, args);
        },

        nextStateName: function () {
            if (util.hasOwnProperty(this, 'switchedTo')) {
                return this.switchedTo;
            } else if (util.hasOwnProperty(this, 'stateName')) {
                return this.callbacks.fsm[this.stateName];
            } else {
                return 'start';
            }
        },

        switchTo: function (name) {
            if (undefined === name) {
                delete this.switchedTo;
            } else {
                this.switchedTo = name;
            }
        },

        stepper: function (name) {
            return (function () {
                if (undefined !== name) {
                    this.switchTo(name);
                }
                this.stateName = this.nextStateName();
                this.switchTo();
                this.fun = this.callbacks[this.stateName];
                this.invoke.apply(this, arguments);
            }).bind(this);
        }
    };

    exports.create = function (url) {
        var sjsc = new SockJSClient(url);
        sjsc.connect();
        return sjsc;
    };
    exports.InvalidURL = InvalidURL;
    exports.InvalidState = InvalidState;

}(this));
