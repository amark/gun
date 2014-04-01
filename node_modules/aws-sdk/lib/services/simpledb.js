var AWS = require('../core');

AWS.util.update(AWS.SimpleDB.prototype, {
  /**
   * @api private
   */
  setEndpoint: function setEndpoint(endpoint) {
    if (this.config.region === 'us-east-1') {
      var prefix = this.api.endpointPrefix;
      this.endpoint = new AWS.Endpoint(prefix + '.amazonaws.com');
    } else {
      AWS.Service.prototype.setEndpoint.call(this, endpoint);
    }
  }
});
