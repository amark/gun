var AWS = require('../core');
var inherit = AWS.util.inherit;

/**
 * @api private
 */
AWS.ServiceInterface.Query = {
  buildRequest: function buildRequest(req) {
    var operation = req.service.api.operations[req.operation];
    var httpRequest = req.httpRequest;
    httpRequest.headers['Content-Type'] =
      'application/x-www-form-urlencoded; charset=utf-8';
    httpRequest.params = {
      Version: req.service.api.apiVersion,
      Action: operation.name
    };

    // convert the request parameters into a list of query params,
    // e.g. Deeply.NestedParam.0.Name=value
    var rules = operation.input;
    if (rules) rules = rules.members;
    var builder = new AWS.QueryParamSerializer(rules, req.service.api);
    builder.serialize(req.params, function(name, value) {
      httpRequest.params[name] = value;
    });
    httpRequest.body = AWS.util.queryParamsToString(httpRequest.params);
  },

  extractError: function extractError(resp) {
    var data, body = resp.httpResponse.body.toString();
    if (body.match('<UnknownOperationException')) {
      data = {
        Code: 'UnknownOperation',
        Message: 'Unknown operation ' + resp.request.operation
      };
    } else {
      data = new AWS.XML.Parser({}).parse(body);
    }

    if (data.Errors) data = data.Errors;
    if (data.Error) data = data.Error;
    if (data.Code) {
      resp.error = AWS.util.error(new Error(), {
        code: data.Code,
        message: data.Message
      });
    } else {
      resp.error = AWS.util.error(new Error(), {
        code: resp.httpResponse.statusCode,
        message: null
      });
    }
  },

  extractData: function extractData(resp) {
    var req = resp.request;
    var operation = req.service.api.operations[req.operation];
    var wrapperKey = operation.name + 'Result';
    var rules = operation.output || {};

    if (req.service.api.resultWrapped) {
      var tmp = {
        type: 'structure',
        members: {}
      };
      tmp.members[wrapperKey] = rules;
      rules = tmp;
    }

    var parser = new AWS.XML.Parser(rules);
    var data = parser.parse(resp.httpResponse.body.toString());

    if (req.service.api.resultWrapped) {
      if (data[wrapperKey]) {
        AWS.util.update(data, data[wrapperKey]);
        delete data[wrapperKey];
      }
    }

    resp.data = data;
  }
};

/**
 * @api private
 */
AWS.QueryParamSerializer = inherit({

  constructor: function QueryParamSerializer(rules, options) {
    this.rules = rules;
    this.timestampFormat = options ? options.timestampFormat : 'iso8601';
  },

  serialize: function serialize(params, fn) {
    this.serializeStructure('', params, this.rules, fn);
  },

  serializeStructure: function serializeStructure(prefix, struct, rules, fn) {
    var that = this;
    AWS.util.each(struct, function (name, member) {
      var n = rules[name].name || name;
      var memberName = prefix ? prefix + '.' + n : n;
      that.serializeMember(memberName, member, rules[name], fn);
    });
  },

  serializeMap: function serialzeMap(name, map, rules, fn) {
    var i = 1;
    var that = this;
    AWS.util.each(map, function (key, value) {
      var prefix = rules.flattened ? '.' : '.entry.';
      var position = prefix + (i++) + '.';
      var keyName = position + (rules.keys.name || 'key');
      var valueName = position + (rules.members.name || 'value');
      that.serializeMember(name + keyName, key, rules.keys, fn);
      that.serializeMember(name + valueName, value, rules.members, fn);
    });
  },

  serializeList: function serializeList(name, list, rules, fn) {
    var that = this;
    var memberRules = rules.members || {};
    AWS.util.arrayEach(list, function (v, n) {
      var suffix = '.' + (n + 1);
      if (rules.flattened) {
        if (memberRules.name) {
          var parts = name.split('.');
          parts.pop();
          parts.push(memberRules.name);
          name = parts.join('.');
        }
      } else {
        suffix = '.member' + suffix;
      }
      that.serializeMember(name + suffix, v, memberRules, fn);
    });
  },

  serializeMember: function serializeMember(name, value, rules, fn) {
    if (value === null || value === undefined) return;
    if (rules.type === 'structure') {
      this.serializeStructure(name, value, rules.members, fn);
    } else if (rules.type === 'list') {
      this.serializeList(name, value, rules, fn);
    } else if (rules.type === 'map') {
      this.serializeMap(name, value, rules, fn);
    } else if (rules.type === 'timestamp') {
      var timestampFormat = rules.format || this.timestampFormat;
      fn.call(this, name, AWS.util.date.format(value, timestampFormat));
    } else {
      fn.call(this, name, String(value));
    }
  }

});
