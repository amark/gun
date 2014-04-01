var url        = require('url'),
    util       = require('util'),
    HttpParser = require('./http_parser'),
    Base       = require('./base'),
    Hybi       = require('./hybi');

var Client = function(url, options) {
  this.version = 'hybi-13';
  Hybi.call(this, null, url, options);

  this.readyState = -1;
  this._key       = Client.generateKey();
  this._accept    = Hybi.generateAccept(this._key);
  this._http      = new HttpParser('response');
};
util.inherits(Client, Hybi);

Client.generateKey = function() {
  var buffer = new Buffer(16), i = buffer.length;
  while (i--) buffer[i] = Math.floor(Math.random() * 256);
  return buffer.toString('base64');
};

var instance = {
  start: function() {
    if (this.readyState !== -1) return false;
    this._write(this._handshakeRequest());
    this.readyState = 0;
    return true;
  },

  parse: function(data) {
    if (this.readyState > 0) return Hybi.prototype.parse.call(this, data);

    this._http.parse(data);
    if (!this._http.isComplete()) return;
    
    this._validateHandshake();
    this.parse(this._http.body);
  },

  _handshakeRequest: function() {
    var uri = url.parse(this.url);

    var headers = [ 'GET ' + (uri.pathname || '/') + (uri.search || '') + ' HTTP/1.1',
                    'Host: ' + uri.hostname + (uri.port ? ':' + uri.port : ''),
                    'Upgrade: websocket',
                    'Connection: Upgrade',
                    'Sec-WebSocket-Key: ' + this._key,
                    'Sec-WebSocket-Version: 13'
                  ];

    if (this._protocols.length > 0)
      headers.push('Sec-WebSocket-Protocol: ' + this._protocols.join(', '));

    if (uri.auth)
      headers.push('Authorization: Basic ' + new Buffer(uri.auth, 'utf8').toString('base64'));

    return new Buffer(headers.concat(this.__headers.toString(), '').join('\r\n'), 'utf8');
  },

  _failHandshake: function(message) {
    message = 'Error during WebSocket handshake: ' + message;
    this.emit('error', new Error(message));
    this.readyState = 3;
    this.emit('close', new Base.CloseEvent(this.ERRORS.protocol_error, message));
  },

  _validateHandshake: function() {
    this.statusCode = this._http.statusCode;
    this.headers    = this._http.headers;

    if (this._http.statusCode !== 101)
      return this._failHandshake('Unexpected response code: ' + this._http.statusCode);

    var headers    = this._http.headers,
        upgrade    = headers['upgrade'] || '',
        connection = headers['connection'] || '',
        accept     = headers['sec-websocket-accept'] || '',
        protocol   = headers['sec-websocket-protocol'] || '';

    if (upgrade === '')
      return this._failHandshake("'Upgrade' header is missing");
    if (upgrade.toLowerCase() !== 'websocket')
      return this._failHandshake("'Upgrade' header value is not 'WebSocket'");

    if (connection === '')
      return this._failHandshake("'Connection' header is missing");
    if (connection.toLowerCase() !== 'upgrade')
      return this._failHandshake("'Connection' header value is not 'Upgrade'");

    if (accept !== this._accept)
      return this._failHandshake('Sec-WebSocket-Accept mismatch');

    this.protocol = null;

    if (protocol !== '') {
      if (this._protocols.indexOf(protocol) < 0)
        return this._failHandshake('Sec-WebSocket-Protocol mismatch');
      else
        this.protocol = protocol;
    }

    this._open();
  }
};

for (var key in instance)
  Client.prototype[key] = instance[key];

module.exports = Client;

