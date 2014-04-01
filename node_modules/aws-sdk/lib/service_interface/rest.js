var AWS = require('../core');

/**
 * @api private
 */
AWS.ServiceInterface.Rest = {
  buildRequest: function buildRequest(req) {
    AWS.ServiceInterface.Rest.populateMethod(req);
    AWS.ServiceInterface.Rest.populateURI(req);
    AWS.ServiceInterface.Rest.populateHeaders(req);
  },

  extractError: function extractError() {
  },

  extractData: function extractData(resp) {
    var req = resp.request;
    var data = {};
    var r = resp.httpResponse;
    var operation = req.service.api.operations[req.operation];
    var rules = (operation.output || {}).members || {};

    // normalize headers names to lower-cased keys for matching
    var headers = {};
    AWS.util.each(r.headers, function (k, v) {
      headers[k.toLowerCase()] = v;
    });

    AWS.util.each(rules, function (name, rule) {
      if (rule.location === 'header') {
        var header = (rule.name || name).toLowerCase();
        if (rule.type === 'map') {
          data[name] = {};
          AWS.util.each(r.headers, function (k, v) {
            var result = k.match(new RegExp('^' + rule.name + '(.+)', 'i'));
            if (result !== null) {
              data[name][result[1]] = v;
            }
          });
        }
        if (headers[header] !== undefined) {
          data[name] = headers[header];
        }
      }
      if (rule.location === 'status') {
        data[name] = parseInt(r.statusCode, 10);
      }
    });

    resp.data = data;
  },

  populateMethod: function populateMethod(req) {
    req.httpRequest.method = req.service.api.operations[req.operation].http.method;
  },

  populateURI: function populateURI(req) {
    var operation = req.service.api.operations[req.operation];
    var uri = [req.httpRequest.endpoint.path, operation.http.uri].join('/');
    uri = uri.replace(/\/+/g, '/');
    var pathPattern = uri.split(/\?/)[0];
    var rules = (operation.input || {}).members || {};

    var escapePathParam = req.service.escapePathParam ||
      AWS.ServiceInterface.Rest.escapePathParam;
    var escapeQuerystringParam = req.service.escapeQuerystringParam ||
      AWS.ServiceInterface.Rest.escapeQuerystringParam;

    AWS.util.each.call(this, rules, function (name, rule) {
      if (rule.location === 'uri') {
        var paramValue = req.params[name];
        if (paramValue === null || paramValue === undefined) return;

        // if the value is being inserted into the path portion of the
        // URI, then we need to use a different (potentially) escaping
        // pattern, this is especially true for S3 path params like Key.
        var value = pathPattern.match('{' + name + '}') ?
          escapePathParam(paramValue) :
          escapeQuerystringParam(paramValue);

        uri = uri.replace('{' + name + '}', value);
      }
    });

    var path = uri.split('?')[0];
    var querystring = uri.split('?')[1];

    if (querystring) {
      var parts = [];
      AWS.util.arrayEach(querystring.split('&'), function (part) {
        if (!part.match('{\\w+}')) parts.push(part);
      });
      uri = (parts.length > 0 ? path + '?' + parts.join('&') : path);
    } else {
      uri = path;
    }

    req.httpRequest.path = uri;
  },

  escapePathParam: function escapePathParam(value) {
    return AWS.util.uriEscape(String(value));
  },

  escapeQuerystringParam: function escapeQuerystringParam(value) {
    return AWS.util.uriEscape(String(value));
  },

  populateHeaders: function populateHeaders(req) {
    var operation = req.service.api.operations[req.operation];
    var rules = (operation.input || {}).members || {};

    AWS.util.each.call(this, rules, function (name, rule) {
      if (rule.location === 'header' && req.params[name]) {
        if (rule.type === 'map') {
          AWS.util.each(req.params[name], function (key, value) {
            req.httpRequest.headers[rule.name + key] = value;
          });
        } else {
          var value = req.params[name];
          if (rule.type === 'timestamp') {
            var timestampFormat = rule.format || req.service.api.timestampFormat;
            value = AWS.util.date.format(value, timestampFormat);
          }
          req.httpRequest.headers[rule.name || name] = value;
        }
      }
    });

  }
};
