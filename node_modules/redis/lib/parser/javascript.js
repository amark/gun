var events = require("events"),
    util   = require("../util");

function Packet(type, size) {
    this.type = type;
    this.size = +size;
}

exports.name = "javascript";
exports.debug_mode = false;

function ReplyParser(options) {
    this.name = exports.name;
    this.options = options || { };

    this._buffer            = null;
    this._offset            = 0;
    this._encoding          = "utf-8";
    this._debug_mode        = options.debug_mode;
    this._reply_type        = null;
}

util.inherits(ReplyParser, events.EventEmitter);

exports.Parser = ReplyParser;

function IncompleteReadBuffer(message) {
    this.name = "IncompleteReadBuffer";
    this.message = message;
}
util.inherits(IncompleteReadBuffer, Error);

// Buffer.toString() is quite slow for small strings
function small_toString(buf, start, end) {
    var tmp = "", i;

    for (i = start; i < end; i++) {
        tmp += String.fromCharCode(buf[i]);
    }

    return tmp;
}

ReplyParser.prototype._parseResult = function (type) {
    var start, end, offset, packetHeader;

    if (type === 43 || type === 45) { // + or -
        // up to the delimiter
        end = this._packetEndOffset() - 1;
        start = this._offset;

        // include the delimiter
        this._offset = end + 2;

        if (end > this._buffer.length) {
            this._offset = start;
            throw new IncompleteReadBuffer("Wait for more data.");
        }

        if (this.options.return_buffers) {
            return this._buffer.slice(start, end);
        } else {
            if (end - start < 65536) { // completely arbitrary
                return small_toString(this._buffer, start, end);
            } else {
                return this._buffer.toString(this._encoding, start, end);
            }
        }
    } else if (type === 58) { // :
        // up to the delimiter
        end = this._packetEndOffset() - 1;
        start = this._offset;

        // include the delimiter
        this._offset = end + 2;

        if (end > this._buffer.length) {
            this._offset = start;
            throw new IncompleteReadBuffer("Wait for more data.");
        }

        if (this.options.return_buffers) {
            return this._buffer.slice(start, end);
        }

        // return the coerced numeric value
        return +small_toString(this._buffer, start, end);
    } else if (type === 36) { // $
        // set a rewind point, as the packet could be larger than the
        // buffer in memory
        offset = this._offset - 1;

        packetHeader = new Packet(type, this.parseHeader());

        // packets with a size of -1 are considered null
        if (packetHeader.size === -1) {
            return undefined;
        }

        end = this._offset + packetHeader.size;
        start = this._offset;

        // set the offset to after the delimiter
        this._offset = end + 2;

        if (end > this._buffer.length) {
            this._offset = offset;
            throw new IncompleteReadBuffer("Wait for more data.");
        }

        if (this.options.return_buffers) {
            return this._buffer.slice(start, end);
        } else {
            return this._buffer.toString(this._encoding, start, end);
        }
    } else if (type === 42) { // *
        offset = this._offset;
        packetHeader = new Packet(type, this.parseHeader());

        if (packetHeader.size < 0) {
            return null;
        }

        if (packetHeader.size > this._bytesRemaining()) {
            this._offset = offset - 1;
            throw new IncompleteReadBuffer("Wait for more data.");
        }

        var reply = [ ];
        var ntype, i, res;

        offset = this._offset - 1;

        for (i = 0; i < packetHeader.size; i++) {
            ntype = this._buffer[this._offset++];

            if (this._offset > this._buffer.length) {
                throw new IncompleteReadBuffer("Wait for more data.");
            }
            res = this._parseResult(ntype);
            if (res === undefined) {
                res = null;
            }
            reply.push(res);
        }

        return reply;
    }
};

ReplyParser.prototype.execute = function (buffer) {
    this.append(buffer);

    var type, ret, offset;

    while (true) {
        offset = this._offset;
        try {
            // at least 4 bytes: :1\r\n
            if (this._bytesRemaining() < 4) {
                break;
            }

            type = this._buffer[this._offset++];

            if (type === 43) { // +
                ret = this._parseResult(type);

                if (ret === null) {
                    break;
                }

                this.send_reply(ret);
            } else  if (type === 45) { // -
                ret = this._parseResult(type);

                if (ret === null) {
                    break;
                }

                this.send_error(ret);
            } else if (type === 58) { // :
                ret = this._parseResult(type);

                if (ret === null) {
                    break;
                }

                this.send_reply(ret);
            } else if (type === 36) { // $
                ret = this._parseResult(type);

                if (ret === null) {
                    break;
                }

                // check the state for what is the result of
                // a -1, set it back up for a null reply
                if (ret === undefined) {
                    ret = null;
                }

                this.send_reply(ret);
            } else if (type === 42) { // *
                // set a rewind point. if a failure occurs,
                // wait for the next execute()/append() and try again
                offset = this._offset - 1;

                ret = this._parseResult(type);

                this.send_reply(ret);
            }
        } catch (err) {
            // catch the error (not enough data), rewind, and wait
            // for the next packet to appear
            if (! (err instanceof IncompleteReadBuffer)) {
              throw err;
            }
            this._offset = offset;
            break;
        }
    }
};

ReplyParser.prototype.append = function (newBuffer) {
    if (!newBuffer) {
        return;
    }

    // first run
    if (this._buffer === null) {
        this._buffer = newBuffer;

        return;
    }

    // out of data
    if (this._offset >= this._buffer.length) {
        this._buffer = newBuffer;
        this._offset = 0;

        return;
    }

    // very large packet
    // check for concat, if we have it, use it
    if (Buffer.concat !== undefined) {
        this._buffer = Buffer.concat([this._buffer.slice(this._offset), newBuffer]);
    } else {
        var remaining = this._bytesRemaining(),
            newLength = remaining + newBuffer.length,
            tmpBuffer = new Buffer(newLength);

        this._buffer.copy(tmpBuffer, 0, this._offset);
        newBuffer.copy(tmpBuffer, remaining, 0);

        this._buffer = tmpBuffer;
    }

    this._offset = 0;
};

ReplyParser.prototype.parseHeader = function () {
    var end   = this._packetEndOffset(),
        value = small_toString(this._buffer, this._offset, end - 1);

    this._offset = end + 1;

    return value;
};

ReplyParser.prototype._packetEndOffset = function () {
    var offset = this._offset;

    while (this._buffer[offset] !== 0x0d && this._buffer[offset + 1] !== 0x0a) {
        offset++;

        if (offset >= this._buffer.length) {
            throw new IncompleteReadBuffer("didn't see LF after NL reading multi bulk count (" + offset + " => " + this._buffer.length + ", " + this._offset + ")");
        }
    }

    offset++;
    return offset;
};

ReplyParser.prototype._bytesRemaining = function () {
    return (this._buffer.length - this._offset) < 0 ? 0 : (this._buffer.length - this._offset);
};

ReplyParser.prototype.parser_error = function (message) {
    this.emit("error", message);
};

ReplyParser.prototype.send_error = function (reply) {
    this.emit("reply error", reply);
};

ReplyParser.prototype.send_reply = function (reply) {
    this.emit("reply", reply);
};
