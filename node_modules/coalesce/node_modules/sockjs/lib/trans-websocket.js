(function() {
  var FayeWebsocket, RawWebsocketSessionReceiver, Transport, WebSocketReceiver, transport, utils,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  FayeWebsocket = require('faye-websocket');

  utils = require('./utils');

  transport = require('./transport');

  exports.app = {
    _websocket_check: function(req, connection, head) {
      var conn;
      if ((req.headers.upgrade || '').toLowerCase() !== 'websocket') {
        throw {
          status: 400,
          message: 'Can "Upgrade" only to "WebSocket".'
        };
      }
      conn = (req.headers.connection || '').toLowerCase();
      if ((conn.split(/, */)).indexOf('upgrade') === -1) {
        throw {
          status: 400,
          message: '"Connection" must be "Upgrade".'
        };
      }
    },
    sockjs_websocket: function(req, connection, head) {
      var ws,
        _this = this;
      this._websocket_check(req, connection, head);
      ws = new FayeWebsocket(req, connection, head);
      ws.onopen = function() {
        return transport.registerNoSession(req, _this, new WebSocketReceiver(ws, connection));
      };
      return true;
    },
    raw_websocket: function(req, connection, head) {
      var ver, ws,
        _this = this;
      this._websocket_check(req, connection, head);
      ver = req.headers['sec-websocket-version'] || '';
      if (['8', '13'].indexOf(ver) === -1) {
        throw {
          status: 400,
          message: 'Only supported WebSocket protocol is RFC 6455.'
        };
      }
      ws = new FayeWebsocket(req, connection, head);
      ws.onopen = function() {
        return new RawWebsocketSessionReceiver(req, connection, _this, ws);
      };
      return true;
    }
  };

  WebSocketReceiver = (function(_super) {

    __extends(WebSocketReceiver, _super);

    WebSocketReceiver.prototype.protocol = "websocket";

    function WebSocketReceiver(ws, connection) {
      var _this = this;
      this.ws = ws;
      this.connection = connection;
      try {
        this.connection.setKeepAlive(true, 5000);
        this.connection.setNoDelay(true);
      } catch (x) {

      }
      this.ws.addEventListener('message', function(m) {
        return _this.didMessage(m.data);
      });
      WebSocketReceiver.__super__.constructor.call(this, this.connection);
    }

    WebSocketReceiver.prototype.setUp = function() {
      WebSocketReceiver.__super__.setUp.apply(this, arguments);
      return this.ws.addEventListener('close', this.thingy_end_cb);
    };

    WebSocketReceiver.prototype.tearDown = function() {
      this.ws.removeEventListener('close', this.thingy_end_cb);
      return WebSocketReceiver.__super__.tearDown.apply(this, arguments);
    };

    WebSocketReceiver.prototype.didMessage = function(payload) {
      var message, msg, _i, _len, _results;
      if (this.ws && this.session && payload.length > 0) {
        try {
          message = JSON.parse(payload);
        } catch (x) {
          return this.didClose(1002, 'Broken framing.');
        }
        if (payload[0] === '[') {
          _results = [];
          for (_i = 0, _len = message.length; _i < _len; _i++) {
            msg = message[_i];
            _results.push(this.session.didMessage(msg));
          }
          return _results;
        } else {
          return this.session.didMessage(message);
        }
      }
    };

    WebSocketReceiver.prototype.doSendFrame = function(payload) {
      if (this.ws) {
        try {
          this.ws.send(payload);
          return true;
        } catch (x) {

        }
      }
      return false;
    };

    WebSocketReceiver.prototype.didClose = function() {
      WebSocketReceiver.__super__.didClose.apply(this, arguments);
      try {
        this.ws.close(1000, "Normal closure", false);
      } catch (x) {

      }
      this.ws = null;
      return this.connection = null;
    };

    return WebSocketReceiver;

  })(transport.GenericReceiver);

  Transport = transport.Transport;

  RawWebsocketSessionReceiver = (function(_super) {

    __extends(RawWebsocketSessionReceiver, _super);

    function RawWebsocketSessionReceiver(req, conn, server, ws) {
      var _this = this;
      this.ws = ws;
      this.prefix = server.options.prefix;
      this.readyState = Transport.OPEN;
      this.recv = {
        connection: conn,
        protocol: "websocket-raw"
      };
      this.connection = new transport.SockJSConnection(this);
      this.decorateConnection(req);
      server.emit('connection', this.connection);
      this._end_cb = function() {
        return _this.didClose();
      };
      this.ws.addEventListener('close', this._end_cb);
      this._message_cb = function(m) {
        return _this.didMessage(m);
      };
      this.ws.addEventListener('message', this._message_cb);
    }

    RawWebsocketSessionReceiver.prototype.didMessage = function(m) {
      if (this.readyState === Transport.OPEN) this.connection.emit('data', m.data);
    };

    RawWebsocketSessionReceiver.prototype.send = function(payload) {
      if (this.readyState !== Transport.OPEN) return false;
      this.ws.send(payload);
      return true;
    };

    RawWebsocketSessionReceiver.prototype.close = function(status, reason) {
      if (status == null) status = 1000;
      if (reason == null) reason = "Normal closure";
      if (this.readyState !== Transport.OPEN) return false;
      this.readyState = Transport.CLOSING;
      this.ws.close(status, reason, false);
      return true;
    };

    RawWebsocketSessionReceiver.prototype.didClose = function() {
      if (!this.ws) return;
      this.ws.removeEventListener('message', this._message_cb);
      this.ws.removeEventListener('close', this._end_cb);
      try {
        this.ws.close(1000, "Normal closure", false);
      } catch (x) {

      }
      this.ws = null;
      this.readyState = Transport.CLOSED;
      this.connection.emit('end');
      this.connection.emit('close');
      return this.connection = null;
    };

    return RawWebsocketSessionReceiver;

  })(transport.Session);

}).call(this);
