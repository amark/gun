(function() {
  var JsonpReceiver, transport,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  transport = require('./transport');

  JsonpReceiver = (function(_super) {

    __extends(JsonpReceiver, _super);

    JsonpReceiver.prototype.protocol = "jsonp-polling";

    JsonpReceiver.prototype.max_response_size = 1;

    function JsonpReceiver(req, res, options, callback) {
      this.callback = callback;
      JsonpReceiver.__super__.constructor.call(this, req, res, options);
    }

    JsonpReceiver.prototype.doSendFrame = function(payload) {
      return JsonpReceiver.__super__.doSendFrame.call(this, this.callback + "(" + JSON.stringify(payload) + ");\r\n");
    };

    return JsonpReceiver;

  })(transport.ResponseReceiver);

  exports.app = {
    jsonp: function(req, res, _, next_filter) {
      var callback;
      if (!('c' in req.query || 'callback' in req.query)) {
        throw {
          status: 500,
          message: '"callback" parameter required'
        };
      }
      callback = 'c' in req.query ? req.query['c'] : req.query['callback'];
      if (/[^a-zA-Z0-9-_.]/.test(callback)) {
        throw {
          status: 500,
          message: 'invalid "callback" parameter'
        };
      }
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
      res.writeHead(200);
      transport.register(req, this, new JsonpReceiver(req, res, this.options, callback));
      return true;
    },
    jsonp_send: function(req, res, query) {
      var d, jsonp, message, _i, _len;
      if (!query) {
        throw {
          status: 500,
          message: 'Payload expected.'
        };
      }
      if (typeof query === 'string') {
        try {
          d = JSON.parse(query);
        } catch (x) {
          throw {
            status: 500,
            message: 'Broken JSON encoding.'
          };
        }
      } else {
        d = query.d;
      }
      if (typeof d === 'string' && d) {
        try {
          d = JSON.parse(d);
        } catch (x) {
          throw {
            status: 500,
            message: 'Broken JSON encoding.'
          };
        }
      }
      if (!d || d.__proto__.constructor !== Array) {
        throw {
          status: 500,
          message: 'Payload expected.'
        };
      }
      jsonp = transport.Session.bySessionId(req.session);
      if (jsonp === null) {
        throw {
          status: 404
        };
      }
      for (_i = 0, _len = d.length; _i < _len; _i++) {
        message = d[_i];
        jsonp.didMessage(message);
      }
      res.setHeader('Content-Length', '2');
      res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
      res.writeHead(200);
      res.end('ok');
      return true;
    }
  };

}).call(this);
