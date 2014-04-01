var crypto   = require('crypto'),
    util     = require('util'),
    Base     = require('./base'),
    Reader   = require('./hybi/stream_reader');

var Hybi = function(request, url, options) {
  Base.apply(this, arguments);
  this._reset();

  this._reader    = new Reader();
  this._stage     = 0;
  this._masking   = this._options.masking;
  this._protocols = this._options.protocols || [];

  if (typeof this._protocols === 'string')
    this._protocols = this._protocols.split(/\s*,\s*/);

  this._requireMasking = this._options.requireMasking;
  this._pingCallbacks  = {};

  if (!this.version) {
    var version = this._request.headers['sec-websocket-version'];
    this.version = 'hybi-' + version;
  }
};
util.inherits(Hybi, Base);

Hybi.mask = function(payload, mask, offset) {
  if (mask.length === 0) return payload;
  offset = offset || 0;

  for (var i = 0, n = payload.length - offset; i < n; i++) {
    payload[offset + i] = payload[offset + i] ^ mask[i % 4];
  }
  return payload;
};

Hybi.generateAccept = function(key) {
  var sha1 = crypto.createHash('sha1');
  sha1.update(key + Hybi.GUID);
  return sha1.digest('base64');
};

Hybi.GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

var instance = {
  BYTE:   255,
  FIN:    128,
  MASK:   128,
  RSV1:   64,
  RSV2:   32,
  RSV3:   16,
  OPCODE: 15,
  LENGTH: 127,

  OPCODES: {
    continuation: 0,
    text:         1,
    binary:       2,
    close:        8,
    ping:         9,
    pong:         10
  },

  OPCODE_CODES:       [0, 1, 2, 8, 9, 10],
  FRAGMENTED_OPCODES: [0, 1, 2],
  OPENING_OPCODES:    [1, 2],

  TWO_POWERS: [0, 1, 2, 3, 4, 5, 6, 7].map(function(n) { return Math.pow(2, 8 * n) }),

  ERRORS: {
    normal_closure:       1000,
    going_away:           1001,
    protocol_error:       1002,
    unacceptable:         1003,
    encoding_error:       1007,
    policy_violation:     1008,
    too_large:            1009,
    extension_error:      1010,
    unexpected_condition: 1011
  },

  ERROR_CODES:        [1000, 1001, 1002, 1003, 1007, 1008, 1009, 1010, 1011],
  MIN_RESERVED_ERROR: 3000,
  MAX_RESERVED_ERROR: 4999,

  // http://www.w3.org/International/questions/qa-forms-utf-8.en.php
  UTF8_MATCH: /^([\x00-\x7F]|[\xC2-\xDF][\x80-\xBF]|\xE0[\xA0-\xBF][\x80-\xBF]|[\xE1-\xEC\xEE\xEF][\x80-\xBF]{2}|\xED[\x80-\x9F][\x80-\xBF]|\xF0[\x90-\xBF][\x80-\xBF]{2}|[\xF1-\xF3][\x80-\xBF]{3}|\xF4[\x80-\x8F][\x80-\xBF]{2})*$/,

  parse: function(data) {
    this._reader.put(data);
    var buffer = true;
    while (buffer) {
      switch (this._stage) {
        case 0:
          buffer = this._reader.read(1);
          if (buffer) this._parseOpcode(buffer[0]);
          break;

        case 1:
          buffer = this._reader.read(1);
          if (buffer) this._parseLength(buffer[0]);
          break;

        case 2:
          buffer = this._reader.read(this._lengthSize);
          if (buffer) this._parseExtendedLength(buffer);
          break;

        case 3:
          buffer = this._reader.read(4);
          if (buffer) {
            this._mask  = buffer;
            this._stage = 4;
          }
          break;

        case 4:
          buffer = this._reader.read(this._length);
          if (buffer) {
            this._payload = buffer;
            this._emitFrame();
            this._stage = 0;
          }
          break;

        default:
          buffer = null;
      }
    }
  },

  frame: function(data, type, code) {
    if (this.readyState <= 0) return this._queue([data, type, code]);
    if (this.readyState !== 1) return false;

    if (data instanceof Array) data = new Buffer(data);

    var isText = (typeof data === 'string'),
        opcode = this.OPCODES[type || (isText ? 'text' : 'binary')],
        buffer = isText ? new Buffer(data, 'utf8') : data,
        insert = code ? 2 : 0,
        length = buffer.length + insert,
        header = (length <= 125) ? 2 : (length <= 65535 ? 4 : 10),
        offset = header + (this._masking ? 4 : 0),
        masked = this._masking ? this.MASK : 0,
        frame  = new Buffer(length + offset),
        BYTE   = this.BYTE,
        mask, i;

    frame[0] = this.FIN | opcode;

    if (length <= 125) {
      frame[1] = masked | length;
    } else if (length <= 65535) {
      frame[1] = masked | 126;
      frame[2] = Math.floor(length / 256);
      frame[3] = length & BYTE;
    } else {
      frame[1] = masked | 127;
      frame[2] = Math.floor(length / Math.pow(2,56)) & BYTE;
      frame[3] = Math.floor(length / Math.pow(2,48)) & BYTE;
      frame[4] = Math.floor(length / Math.pow(2,40)) & BYTE;
      frame[5] = Math.floor(length / Math.pow(2,32)) & BYTE;
      frame[6] = Math.floor(length / Math.pow(2,24)) & BYTE;
      frame[7] = Math.floor(length / Math.pow(2,16)) & BYTE;
      frame[8] = Math.floor(length / Math.pow(2,8))  & BYTE;
      frame[9] = length & BYTE;
    }

    if (code) {
      frame[offset]   = Math.floor(code / 256) & BYTE;
      frame[offset+1] = code & BYTE;
    }
    buffer.copy(frame, offset + insert);

    if (this._masking) {
      mask = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256),
              Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
      new Buffer(mask).copy(frame, header);
      Hybi.mask(frame, mask, offset);
    }

    this._write(frame);
    return true;
  },

  text: function(message) {
    return this.frame(message, 'text');
  },

  binary: function(message) {
    return this.frame(message, 'binary');
  },

  ping: function(message, callback) {
    message = message || '';
    if (callback) this._pingCallbacks[message] = callback;
    return this.frame(message, 'ping');
  },

  close: function(reason, code) {
    reason = reason || '';
    code   = code   || this.ERRORS.normal_closure;

    if (this.readyState === 0) {
      this.readyState = 3;
      this.emit('close', new Base.CloseEvent(code, reason));
      return true;
    } else if (this.readyState === 1) {
      this.frame(reason, 'close', code);
      this.readyState = 2;
      return true;
    } else {
      return false;
    }
  },

  _handshakeResponse: function() {
    var secKey = this._request.headers['sec-websocket-key'];
    if (!secKey) return '';

    var accept    = Hybi.generateAccept(secKey),
        protos    = this._request.headers['sec-websocket-protocol'],
        supported = this._protocols,
        proto,

        headers = [
          'HTTP/1.1 101 Switching Protocols',
          'Upgrade: websocket',
          'Connection: Upgrade',
          'Sec-WebSocket-Accept: ' + accept
        ];

    if (protos !== undefined) {
      if (typeof protos === 'string') protos = protos.split(/\s*,\s*/);
      proto = protos.filter(function(p) { return supported.indexOf(p) >= 0 })[0];
      if (proto) {
        this.protocol = proto;
        headers.push('Sec-WebSocket-Protocol: ' + proto);
      }
    }

    return new Buffer(headers.concat(this.__headers.toString(), '').join('\r\n'), 'utf8');
  },

  _shutdown: function(code, reason) {
    this.frame(reason, 'close', code);
    this.readyState = 3;
    this._stage = 5;
    this.emit('close', new Base.CloseEvent(code, reason));
  },

  _fail: function(type, message) {
    this.emit('error', new Error(message));
    this._shutdown(this.ERRORS[type], message);
  },

  _parseOpcode: function(data) {
    var rsvs = [this.RSV1, this.RSV2, this.RSV3].map(function(rsv) {
      return (data & rsv) === rsv;
    });

    if (rsvs.filter(function(rsv) { return rsv }).length > 0)
      return this._fail('protocol_error',
          'One or more reserved bits are on: reserved1 = ' + (rsvs[0] ? 1 : 0) +
          ', reserved2 = ' + (rsvs[1] ? 1 : 0) +
          ', reserved3 = ' + (rsvs[2] ? 1 : 0));

    this._final   = (data & this.FIN) === this.FIN;
    this._opcode  = (data & this.OPCODE);
    this._mask    = [];
    this._payload = [];

    if (this.OPCODE_CODES.indexOf(this._opcode) < 0)
      return this._fail('protocol_error', 'Unrecognized frame opcode: ' + this._opcode);

    if (this.FRAGMENTED_OPCODES.indexOf(this._opcode) < 0 && !this._final)
      return this._fail('protocol_error', 'Received fragmented control frame: opcode = ' + this._opcode);

    if (this._mode && this.OPENING_OPCODES.indexOf(this._opcode) >= 0)
      return this._fail('protocol_error', 'Received new data frame but previous continuous frame is unfinished');

    this._stage = 1;
  },

  _parseLength: function(data) {
    this._masked = (data & this.MASK) === this.MASK;
    if (this._requireMasking && !this._masked)
      return this._fail('unacceptable', 'Received unmasked frame but masking is required');

    this._length = (data & this.LENGTH);

    if (this._length >= 0 && this._length <= 125) {
      if (!this._checkFrameLength()) return;
      this._stage = this._masked ? 3 : 4;
    } else {
      this._lengthSize = (this._length === 126 ? 2 : 8);
      this._stage      = 2;
    }
  },

  _parseExtendedLength: function(buffer) {
    this._length = this._getInteger(buffer);

    if (this.FRAGMENTED_OPCODES.indexOf(this._opcode) < 0 && this._length > 125)
      return this._fail('protocol_error', 'Received control frame having too long payload: ' + this._length);

    if (!this._checkFrameLength()) return;

    this._stage  = this._masked ? 3 : 4;
  },

  _checkFrameLength: function() {
    if (this.__blength + this._length > this._maxLength) {
      this._fail('too_large', 'WebSocket frame length too large');
      return false;
    } else {
      return true;
    }
  },

  _emitFrame: function() {
    var payload = Hybi.mask(this._payload, this._mask),
        opcode  = this._opcode;

    if (opcode === this.OPCODES.continuation) {
      if (!this._mode) return this._fail('protocol_error', 'Received unexpected continuation frame');
      this._buffer(payload);
      if (this._final) {
        var message = this._concatBuffer();
        if (this._mode === 'text') message = this._encode(message);
        this._reset();
        if (message === null)
          this._fail('encoding_error', 'Could not decode a text frame as UTF-8');
        else
          this.emit('message', new Base.MessageEvent(message));
      }
    }
    else if (opcode === this.OPCODES.text) {
      if (this._final) {
        var message = this._encode(payload);
        if (message === null)
          this._fail('encoding_error', 'Could not decode a text frame as UTF-8');
        else
          this.emit('message', new Base.MessageEvent(message));
      } else {
        this._mode = 'text';
        this._buffer(payload);
      }
    }
    else if (opcode === this.OPCODES.binary) {
      if (this._final) {
        this.emit('message', new Base.MessageEvent(payload));
      } else {
        this._mode = 'binary';
        this._buffer(payload);
      }
    }
    else if (opcode === this.OPCODES.close) {
      var code   = (payload.length >= 2) ? 256 * payload[0] + payload[1] : null,
          reason = (payload.length > 2) ? this._encode(payload.slice(2)) : null;

      if (!(payload.length === 0) &&
          !(code !== null && code >= this.MIN_RESERVED_ERROR && code <= this.MAX_RESERVED_ERROR) &&
          this.ERROR_CODES.indexOf(code) < 0)
        code = this.ERRORS.protocol_error;

      if (payload.length > 125 || (payload.length > 2 && !reason))
        code = this.ERRORS.protocol_error;

      this._shutdown(code, reason || '');
    }
    else if (opcode === this.OPCODES.ping) {
      this.frame(payload, 'pong');
    }
    else if (opcode === this.OPCODES.pong) {
      var callbacks = this._pingCallbacks,
          message   = this._encode(payload),
          callback  = callbacks[message];

      delete callbacks[message];
      if (callback) callback()
    }
  },

  _buffer: function(fragment) {
    this.__buffer.push(fragment);
    this.__blength += fragment.length;
  },

  _concatBuffer: function() {
    var buffer = new Buffer(this.__blength),
        offset = 0;

    for (var i = 0, n = this.__buffer.length; i < n; i++) {
      this.__buffer[i].copy(buffer, offset);
      offset += this.__buffer[i].length;
    }
    return buffer;
  },

  _reset: function() {
    this._mode     = null;
    this.__buffer  = [];
    this.__blength = 0;
  },

  _encode: function(buffer) {
    try {
      var string = buffer.toString('binary', 0, buffer.length);
      if (!this.UTF8_MATCH.test(string)) return null;
    } catch (e) {}
    return buffer.toString('utf8', 0, buffer.length);
  },

  _getInteger: function(bytes) {
    var number = 0;
    for (var i = 0, n = bytes.length; i < n; i++)
      number += bytes[i] * this.TWO_POWERS[n - 1 - i];
    return number;
  }
};

for (var key in instance)
  Hybi.prototype[key] = instance[key];

module.exports = Hybi;

