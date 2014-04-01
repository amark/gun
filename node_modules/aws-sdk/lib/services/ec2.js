var AWS = require('../core');

AWS.util.update(AWS.EC2.prototype, {
  /**
   * @api private
   */
  setupRequestListeners: function setupRequestListeners(request) {
    request.removeListener('extractError', AWS.EventListeners.Query.EXTRACT_ERROR);
    request.addListener('extractError', this.extractError);
  },

  /**
   * @api private
   */
  extractError: function extractError(resp) {
    // EC2 nests the error code and message deeper than other AWS Query services.
    var httpResponse = resp.httpResponse;
    var data = new AWS.XML.Parser({}).parse(httpResponse.body.toString() || '');
    if (data.Errors)
      resp.error = AWS.util.error(new Error(), {
        code: data.Errors.Error.Code,
        message: data.Errors.Error.Message
      });
    else
      resp.error = AWS.util.error(new Error(), {
        code: httpResponse.statusCode,
        message: null
      });
  }
});
