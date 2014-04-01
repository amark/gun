(function() {
  var EventSourceReceiver, transport, utils,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  utils = require('./utils');

  transport = require('./transport');

  EventSourceReceiver = (function(_super) {

    __extends(EventSourceReceiver, _super);

    function EventSourceReceiver() {
      EventSourceReceiver.__super__.constructor.apply(this, arguments);
    }

    EventSourceReceiver.prototype.protocol = "eventsource";

    EventSourceReceiver.prototype.doSendFrame = function(payload) {
      var data;
      data = ['data: ', utils.escape_selected(payload, '\r\n\x00'), '\r\n\r\n'];
      return EventSourceReceiver.__super__.doSendFrame.call(this, data.join(''));
    };

    return EventSourceReceiver;

  })(transport.ResponseReceiver);

  exports.app = {
    eventsource: function(req, res) {
      res.setHeader('Content-Type', 'text/event-stream; charset=UTF-8');
      res.writeHead(200);
      res.write('\r\n');
      transport.register(req, this, new EventSourceReceiver(req, res, this.options));
      return true;
    }
  };

}).call(this);
