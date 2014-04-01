var AWS = require('../core');
require('./rest');
require('./json');

/**
 * @api private
 */
AWS.ServiceInterface.RestJson = {
  buildRequest: function buildRequest(req) {
    AWS.ServiceInterface.Rest.buildRequest(req);
    AWS.ServiceInterface.RestJson.populateBody(req);
  },

  extractError: function extractError(resp) {
    AWS.ServiceInterface.Json.extractError(resp);
  },

  extractData: function extractData(resp) {
    AWS.ServiceInterface.Rest.extractData(resp);

    var req = resp.request;
    var rules = req.service.api.operations[req.operation].output || {};
    if (rules.payload && rules.members[rules.payload]) {
      if (rules.members[rules.payload].streaming) {
        resp.data[rules.payload] = resp.httpResponse.body;
      } else {
        resp.data[rules.payload] = resp.httpResponse.body.toString();
      }
    } else {
      var data = resp.data;
      AWS.ServiceInterface.Json.extractData(resp);
      resp.data = AWS.util.merge(data, resp.data);
    }
  },

  populateBody: function populateBody(req) {
    var input = req.service.api.operations[req.operation].input;
    var payload = input.payload;
    var params = {};

    if (typeof payload === 'string') {

      var rules = input.members[payload];
      params = req.params[payload];

      if (params === undefined) return;

      if (rules.type === 'structure') {
        req.httpRequest.body = this.buildJSON(params, input, req.service.api);
      } else {
        // non-xml paylaod
        req.httpRequest.body = params;
      }

    } else if (payload) {

      AWS.util.arrayEach(payload, function (param) {
        if (req.params[param] !== undefined) {
          params[param] = req.params[param];
        }
      });
      req.httpRequest.body = this.buildJSON(params, input, req.service.api);

    }
  },

  buildJSON: function buildJSON(params, rules, api) {
    var builder = new AWS.JSON.Builder(rules, api);
    return builder.build(params);
  }

};
