var AWS = require('../core');

AWS.util.update(AWS.Route53.prototype, {
  /**
   * @api private
   */
  setupRequestListeners: function setupRequestListeners(request) {
    request.on('build', this.sanitizeUrl);
  },

  /**
   * @api private
   */
  sanitizeUrl: function sanitizeUrl(request) {
    var path = request.httpRequest.path;
    request.httpRequest.path = path.replace(/\/%2F\w+%2F/, '/');
  },

  /**
   * @api private
   */
  setEndpoint: function setEndpoint(endpoint) {
    if (endpoint) {
      AWS.Service.prototype.setEndpoint(endpoint);
    } else {
      var opts = {sslEnabled: true}; // SSL is always enabled for Route53
      this.endpoint = new AWS.Endpoint(this.api.globalEndpoint, opts);
    }
  }
});
