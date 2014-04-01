var AWS = require('../core');
var Stream = AWS.util.nodeRequire('stream').Stream;
var WritableStream = AWS.util.nodeRequire('stream').Writable;
var ReadableStream = AWS.util.nodeRequire('stream').Readable;
require('../http');

/**
 * @api private
 */
AWS.NodeHttpClient = AWS.util.inherit({
  handleRequest: function handleRequest(httpRequest, httpOptions, callback, errCallback) {
    var endpoint = httpRequest.endpoint;
    var pathPrefix = '';
    if (!httpOptions) httpOptions = {};
    if (httpOptions.proxy) {
      pathPrefix = endpoint.protocol + '//' + endpoint.hostname;
      if (endpoint.port !== 80 && endpoint.port !== 443) {
        pathPrefix += ':' + endpoint.port;
      }
      endpoint = new AWS.Endpoint(httpOptions.proxy);
    }

    var useSSL = endpoint.protocol === 'https:';
    var http = useSSL ? require('https') : require('http');
    var options = {
      host: endpoint.hostname,
      port: endpoint.port,
      method: httpRequest.method,
      headers: httpRequest.headers,
      path: pathPrefix + httpRequest.path
    };

    if (useSSL && !httpOptions.agent) {
      options.agent = this.sslAgent();
    }

    AWS.util.update(options, httpOptions);
    delete options.proxy; // proxy isn't an HTTP option
    delete options.timeout; // timeout isn't an HTTP option

    var stream = http.request(options, function (httpResp) {
      callback(httpResp);
      httpResp.emit('headers', httpResp.statusCode, httpResp.headers);
    });
    httpRequest.stream = stream; // attach stream to httpRequest

    // timeout support
    stream.setTimeout(httpOptions.timeout || 0);
    stream.once('timeout', function() {
      var msg = 'Connection timed out after ' + httpOptions.timeout + 'ms';
      errCallback(AWS.util.error(new Error(msg), {code: 'TimeoutError'}));

      // HACK - abort the connection without tripping our error handler
      // since we already raised our TimeoutError. Otherwise the connection
      // comes back with ECONNRESET, which is not a helpful error message
      stream.removeListener('error', errCallback);
      stream.on('error', function() { });
      stream.abort();
    });

    stream.on('error', errCallback);
    this.writeBody(stream, httpRequest);
    return stream;
  },

  writeBody: function writeBody(stream, httpRequest) {
    var body = httpRequest.body;

    if (body && WritableStream && ReadableStream) { // progress support
      if (!(body instanceof Stream)) body = this.bufferToStream(body);
      body.pipe(this.progressStream(stream, httpRequest));
    }

    if (body instanceof Stream) {
      body.pipe(stream);
    } else if (body) {
      stream.end(body);
    } else {
      stream.end();
    }
  },

  sslAgent: function sslAgent() {
    var https = require('https');

    if (!AWS.NodeHttpClient.sslAgent) {
      AWS.NodeHttpClient.sslAgent = new https.Agent({rejectUnauthorized: true});
      AWS.NodeHttpClient.sslAgent.setMaxListeners(0);

      // delegate maxSockets to globalAgent
      Object.defineProperty(AWS.NodeHttpClient.sslAgent, 'maxSockets', {
        enumerable: true,
        get: function() { return https.globalAgent.maxSockets; }
      });
    }
    return AWS.NodeHttpClient.sslAgent;
  },

  progressStream: function progressStream(stream, httpRequest) {
    var numBytes = 0;
    var totalBytes = httpRequest.headers['Content-Length'];
    var writer = new WritableStream();
    writer._write = function(chunk, encoding, callback) {
      if (chunk) {
        numBytes += chunk.length;
        stream.emit('sendProgress', {
          loaded: numBytes, total: totalBytes
        });
      }
      callback();
    };
    return writer;
  },

  bufferToStream: function bufferToStream(buffer) {
    if (!AWS.util.Buffer.isBuffer(buffer)) buffer = new AWS.util.Buffer(buffer);

    var readable = new ReadableStream();
    var pos = 0;
    readable._read = function(size) {
      if (pos >= buffer.length) return readable.push(null);

      var end = pos + size;
      if (end > buffer.length) end = buffer.length;
      readable.push(buffer.slice(pos, end));
      pos = end;
    };

    return readable;
  },

  emitter: null
});

/**
 * @!ignore
 */

/**
 * @api private
 */
AWS.HttpClient.prototype = AWS.NodeHttpClient.prototype;

/**
 * @api private
 */
AWS.HttpClient.streamsApiVersion = ReadableStream ? 2 : 1;
