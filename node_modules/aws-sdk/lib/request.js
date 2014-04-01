var AWS = require('./core');
var AcceptorStateMachine = require('./state_machine');
var inherit = AWS.util.inherit;

var fsm = new AcceptorStateMachine();
fsm.setupStates = function() {
  var hardErrorStates = {success:1, error:1, complete:1};
  var transition = function transition(err, done) {
    try {
      var self = this;
      var origError = self.response.error;
      self.emit(self._asm.currentState, function() {
        function isTerminalState() {
          return hardErrorStates[self._asm.currentState] === 1;
        }

        var nextError = self.response.error;
        if (self.response.error && origError !== self.response.error) {
          if (isTerminalState()) self._hardError = true;
        }

        if (self.response.error && !self._hardError && isTerminalState()) {
          // error did not change to complete, no need to pass this as an
          // uncaughtException
          nextError = null;
        }

        done(nextError);
      });

    } catch (e) {
      this.response.error = e;
      if (this._hardError) {
        throw e;
      }
      else if (hardErrorStates.indexOf(this._asm.currentState) >= 0) {
        this._hardError = true;
      }
      done(e);
    }
  };

  this.addState('validate', 'build', 'error', transition);
  this.addState('restart', 'build', 'error', function(err, done) {
    err = this.response.error;
    if (!err) return done();
    if (!err.retryable) return done(err);

    if (this.response.retryCount < this.service.config.maxRetries) {
      this.response.retryCount++;
      done();
    } else {
      done(err);
    }
  });
  this.addState('build', 'afterBuild', 'restart', transition);
  this.addState('afterBuild', 'sign', 'restart', transition);
  this.addState('sign', 'send', 'retry', transition);
  this.addState('retry', 'afterRetry', 'afterRetry', transition);
  this.addState('afterRetry', 'sign', 'error', transition);
  this.addState('send', 'validateResponse', 'retry', transition);
  this.addState('validateResponse', 'extractData', 'extractError', transition);
  this.addState('extractError', 'extractData', 'retry', transition);
  this.addState('extractData', 'success', 'retry', transition);
  this.addState('success', 'complete', 'complete', transition);
  this.addState('error', 'complete', 'complete', transition);
  this.addState('complete', null, 'uncaughtException', transition);
  this.addState('uncaughtException', function(err, done) {
    try {
      AWS.SequentialExecutor.prototype.unhandledErrorCallback.call(this, err);
    } catch (e) {
      if (this._hardError) {
        e._hardError = true;
        throw e;
      }
    }
    done(err);
  });
};
fsm.setupStates();

/**
 * ## Asynchronous Requests
 *
 * All requests made through the SDK are asynchronous and use a
 * callback interface. Each service method that kicks off a request
 * returns an `AWS.Request` object that you can use to register
 * callbacks.
 *
 * For example, the following service method returns the request
 * object as "request", which can be used to register callbacks:
 *
 * ```javascript
 * // request is an AWS.Request object
 * var request = ec2.describeInstances();
 *
 * // register callbacks on request to retrieve response data
 * request.on('success', function(response) {
 *   console.log(response.data);
 * });
 * ```
 *
 * When a request is ready to be sent, the {send} method should
 * be called:
 *
 * ```javascript
 * request.send();
 * ```
 *
 * ## Removing Default Listeners for Events
 *
 * Request objects are built with default listeners for the various events,
 * depending on the service type. In some cases, you may want to remove
 * some built-in listeners to customize behaviour. Doing this requires
 * access to the built-in listener functions, which are exposed through
 * the {AWS.EventListeners.Core} namespace. For instance, you may
 * want to customize the HTTP handler used when sending a request. In this
 * case, you can remove the built-in listener associated with the 'send'
 * event, the {AWS.EventListeners.Core.SEND} listener and add your own.
 *
 * ## Multiple Callbacks and Chaining
 *
 * You can register multiple callbacks on any request object. The
 * callbacks can be registered for different events, or all for the
 * same event. In addition, you can chain callback registration, for
 * example:
 *
 * ```javascript
 * request.
 *   on('success', function(response) {
 *     console.log("Success!");
 *   }).
 *   on('error', function(response) {
 *     console.log("Error!");
 *   }).
 *   on('complete', function(response) {
 *     console.log("Always!");
 *   }).
 *   send();
 * ```
 *
 * The above example will print either "Success! Always!", or "Error! Always!",
 * depending on whether the request succeeded or not.
 *
 * @!attribute httpRequest
 *   @readonly
 *   @!group HTTP Properties
 *   @return [AWS.HttpRequest] the raw HTTP request object
 *     containing request headers and body information
 *     sent by the service.
 *
 * @!attribute startTime
 *   @readonly
 *   @!group Operation Properties
 *   @return [Date] the time that the request started
 *
 * @!group Request Building Events
 *
 * @!event validate(request)
 *   Triggered when a request is being validated. Listeners
 *   should throw an error if the request should not be sent.
 *   @param request [Request] the request object being sent
 *   @see AWS.EventListeners.Core.VALIDATE_CREDENTIALS
 *   @see AWS.EventListeners.Core.VALIDATE_REGION
 *
 * @!event build(request)
 *   Triggered when the request payload is being built. Listeners
 *   should fill the necessary information to send the request
 *   over HTTP.
 *   @param (see AWS.Request~validate)
 *
 * @!event sign(request)
 *   Triggered when the request is being signed. Listeners should
 *   add the correct authentication headers and/or adjust the body,
 *   depending on the authentication mechanism being used.
 *   @param (see AWS.Request~validate)
 *
 * @!group Request Sending Events
 *
 * @!event send(response)
 *   Triggered when the request is ready to be sent. Listeners
 *   should call the underlying transport layer to initiate
 *   the sending of the request.
 *   @param response [Response] the response object
 *   @context [Request] the request object that was sent
 *   @see AWS.EventListeners.Core.SEND
 *
 * @!event retry(response)
 *   Triggered when a request failed and might need to be retried.
 *   Listeners are responsible for checking to see if the request
 *   is retryable, and if so, re-signing and re-sending the request.
 *   Information about the failure is set in the `response.error`
 *   property.
 *
 *   If a listener decides that a request should not be retried,
 *   that listener should `throw` an error to cancel the event chain.
 *   Unsetting `response.error` will have no effect.
 *
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *
 * @!group Data Parsing Events
 *
 * @!event extractError(response)
 *   Triggered on all non-2xx requests so that listeners can extract
 *   error details from the response body. Listeners to this event
 *   should set the `response.error` property.
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *
 * @!event extractData(response)
 *   Triggered in successful requests to allow listeners to
 *   de-serialize the response body into `response.data`.
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *
 * @!group Completion Events
 *
 * @!event success(response)
 *   Triggered when the request completed successfully.
 *   `response.data` will contain the response data and
 *   `response.error` will be null.
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *
 * @!event error(error, response)
 *   Triggered when an error occurs at any point during the
 *   request. `response.error` will contain details about the error
 *   that occurred. `response.data` will be null.
 *   @param error [Error] the error object containing details about
 *     the error that occurred.
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *
 * @!event complete(response)
 *   Triggered whenever a request cycle completes. `response.error`
 *   should be checked, since the request may have failed.
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *
 * @!group HTTP Events
 *
 * @!event httpHeaders(statusCode, headers, response)
 *   Triggered when headers are sent by the remote server
 *   @param statusCode [Integer] the HTTP response code
 *   @param headers [map<String,String>] the response headers
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *
 * @!event httpData(chunk, response)
 *   Triggered when data is sent by the remote server
 *   @param chunk [Buffer] the buffer data containing the next data chunk
 *     from the server
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *   @see AWS.EventListeners.Core.HTTP_DATA
 *
 * @!event httpUploadProgress(progress, response)
 *   Triggered when the HTTP request has uploaded more data
 *   @param progress [map] An object containing the `loaded` and `total` bytes
 *     of the request.
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *   @note This event will not be emitted in Node.js 0.8.x.
 *
 * @!event httpDownloadProgress(progress, response)
 *   Triggered when the HTTP request has downloaded more data
 *   @param progress [map] An object containing the `loaded` and `total` bytes
 *     of the request.
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *   @note This event will not be emitted in Node.js 0.8.x.
 *
 * @!event httpError(error, response)
 *   Triggered when the HTTP request failed
 *   @param error [Error] the error object that was thrown
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *
 * @!event httpDone(response)
 *   Triggered when the server is finished sending data
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *
 * @see AWS.Response
 */
AWS.Request = inherit({

  /**
   * Creates a request for an operation on a given service with
   * a set of input parameters.
   *
   * @param service [AWS.Service] the service to perform the operation on
   * @param operation [String] the operation to perform on the service
   * @param params [Object] parameters to send to the operation.
   *   See the operation's documentation for the format of the
   *   parameters.
   */
  constructor: function Request(service, operation, params) {
    var endpoint = service.endpoint;
    var region = service.config.region;

    // global endpoints sign as us-east-1
    if (service.hasGlobalEndpoint()) region = 'us-east-1';

    this.service = service;
    this.operation = operation;
    this.params = params || {};
    this.httpRequest = new AWS.HttpRequest(endpoint, region);
    this.startTime = AWS.util.date.getDate();

    this.response = new AWS.Response(this);
    this.restartCount = 0;
    this._asm = new AcceptorStateMachine(fsm.states, 'validate');

    AWS.SequentialExecutor.call(this);
    this.emit = this.emitEvent;
  },

  /**
   * @!group Sending a Request
   */

  /**
   * @overload send(callback = null)
   *   Sends the request object.
   *
   *   @callback callback function(err, data)
   *     If a callback is supplied, it is called when a response is returned
   *     from the service.
   *     @param err [Error] the error object returned from the request.
   *       Set to `null` if the request is successful.
   *     @param data [Object] the de-serialized data returned from
   *       the request. Set to `null` if a request error occurs.
   *   @example Sending a request with a callback
   *     request = s3.putObject({Bucket: 'bucket', Key: 'key'});
   *     request.send(function(err, data) { console.log(err, data); });
   *   @example Sending a request with no callback (using event handlers)
   *     request = s3.putObject({Bucket: 'bucket', Key: 'key'});
   *     request.on('complete', function(response) { ... }); // register a callback
   *     request.send();
   */
  send: function send(callback) {
    if (callback) {
      this.on('complete', function (resp) {
        try {
          callback.call(resp, resp.error, resp.data);
        } catch (e) {
          resp.request._hardError = true;
          throw e;
        }
      });
    }
    this.runTo();

    return this.response;
  },

  build: function build(callback) {
    this._hardError = callback ? false : true;
    return this.runTo('send', callback);
  },

  runTo: function runTo(state, done) {
    this._asm.runTo(state, done, this);
    return this;
  },

  /**
   * Aborts a request, emitting the error and complete events.
   *
   * @!macro nobrowser
   * @example Aborting a request after sending
   *   var params = {
   *     Bucket: 'bucket', Key: 'key',
   *     Body: new Buffer(1024 * 1024 * 5) // 5MB payload
   *   };
   *   var request = s3.putObject(params);
   *   request.send(function (err, data) {
   *     if (err) console.log("Error:", err.code, err.message);
   *     else console.log(data);
   *   });
   *
   *   // abort request in 1 second
   *   setTimeout(request.abort.bind(request), 1000);
   *
   *   // prints "Error: RequestAbortedError Request aborted by user"
   * @return [AWS.Request] the same request object, for chaining.
   * @since v1.4.0
   */
  abort: function abort() {
    this.removeAllListeners('validateResponse');
    this.removeAllListeners('extractError');
    this.on('validateResponse', function addAbortedError(resp) {
      resp.error = AWS.util.error(new Error('Request aborted by user'), {
         code: 'RequestAbortedError', retryable: false
      });
    });

    if (this.httpRequest.stream) { // abort HTTP stream
      this.httpRequest.stream.abort();
      if (this.httpRequest._abortCallback) {
         this.httpRequest._abortCallback();
      } else {
        this.removeAllListeners('send'); // haven't sent yet, so let's not
      }
    }

    return this;
  },

  /**
   * Iterates over each page of results given a pageable request, calling
   * the provided callback with each page of data. After all pages have been
   * retrieved, the callback is called with `null` data.
   *
   * @note This operation can generate multiple requests to a service.
   * @example Iterating over multiple pages of objects in an S3 bucket
   *   var pages = 1;
   *   s3.listObjects().eachPage(function(err, data) {
   *     if (err) return;
   *     console.log("Page", pages++);
   *     console.log(data);
   *   });
   * @callback callback function(err, data)
   *   Called with each page of resulting data from the request.
   *
   *   @param err [Error] an error object, if an error occurred.
   *   @param data [Object] a single page of response data. If there is no
   *     more data, this object will be `null`.
   *   @return [Boolean] if the callback returns `false`, pagination will
   *     stop.
   *
   * @api experimental
   * @see AWS.Request.eachItem
   * @see AWS.Response.nextPage
   * @since v1.4.0
   */
  eachPage: function eachPage(callback) {
    function wrappedCallback(response) {
      var result = callback.call(response, response.error, response.data);
      if (result === false) return;

      if (response.hasNextPage()) {
        response.nextPage().on('complete', wrappedCallback).send();
      } else {
        callback.call(response, null, null);
      }
    }

    this.on('complete', wrappedCallback).send();
  },

  /**
   * Enumerates over individual items of a request, paging the responses if
   * necessary.
   *
   * @api experimental
   * @since v1.4.0
   */
  eachItem: function eachItem(callback) {
    function wrappedCallback(err, data) {
      if (err) return callback(err, null);
      if (data === null) return callback(null, null);

      var config = this.request.service.paginationConfig(this.request.operation);
      var resultKey = config.resultKey;
      if (Array.isArray(resultKey)) resultKey = resultKey[0];
      var results = AWS.util.jamespath.query(resultKey, data);
      AWS.util.arrayEach(results, function(result) {
        AWS.util.arrayEach(result, function(item) { callback(null, item); });
      });
    }

    this.eachPage(wrappedCallback);
  },

  /**
   * @return [Boolean] whether the operation can return multiple pages of
   *   response data.
   * @api experimental
   * @see AWS.Response.eachPage
   * @since v1.4.0
   */
  isPageable: function isPageable() {
    return this.service.paginationConfig(this.operation) ? true : false;
  },

  /**
   * Converts the request object into a readable stream that
   * can be read from or piped into a writable stream.
   *
   * @note The data read from a readable stream contains only
   *   the raw HTTP body contents.
   * @example Manually reading from a stream
   *   request.createReadStream().on('data', function(data) {
   *     console.log("Got data:", data.toString());
   *   });
   * @example Piping a request body into a file
   *   var out = fs.createWriteStream('/path/to/outfile.jpg');
   *   s3.service.getObject(params).createReadStream().pipe(out);
   * @return [Stream] the readable stream object that can be piped
   *   or read from (by registering 'data' event listeners).
   * @!macro nobrowser
   */
  createReadStream: function createReadStream() {
    var streams = AWS.util.nodeRequire('stream');
    var req = this;
    var stream = null;
    var legacyStreams = false;

    if (AWS.HttpClient.streamsApiVersion === 2) {
      stream = new streams.Readable();
      stream._read = function() { stream.push(''); };
    } else {
      stream = new streams.Stream();
      stream.readable = true;
    }

    stream.sent = false;
    stream.on('newListener', function(event) {
      if (!stream.sent && (event === 'data' || event === 'readable')) {
        if (event === 'data') legacyStreams = true;
        stream.sent = true;
        process.nextTick(function() { req.send(function() { }); });
      }
    });

    this.on('httpHeaders', function streamHeaders(statusCode, headers, resp) {
      if (statusCode < 300) {
        this.httpRequest._streaming = true;

        req.removeListener('httpData', AWS.EventListeners.Core.HTTP_DATA);
        req.removeListener('httpError', AWS.EventListeners.Core.HTTP_ERROR);
        req.on('httpError', function streamHttpError(error, resp) {
          resp.error = error;
          resp.error.retryable = false;
        });

        var httpStream = resp.httpResponse.stream;
        stream.response = resp;
        stream._read = function() {
          var data;
          do {
            data = httpStream.read();
            if (data) stream.push(data);
          } while (data);
          stream.push('');
        };

        var events = ['end', 'error', (legacyStreams ? 'data' : 'readable')];
        AWS.util.arrayEach(events, function(event) {
          httpStream.on(event, function(arg) {
            stream.emit(event, arg);
          });
        });
      }
    });

    this.on('error', function(err) {
      stream.emit('error', err);
    });

    return stream;
  },

  /**
   * @param [Array,Response] args This should be the response object,
   *   or an array of args to send to the event.
   * @api private
   */
  emitEvent: function emit(eventName, args, done) {
    if (typeof args === 'function') { done = args; args = null; }
    if (!done) done = this.unhandledErrorCallback;
    if (!args) args = this.eventParameters(eventName, this.response);

    var origEmit = AWS.SequentialExecutor.prototype.emit;
    origEmit.call(this, eventName, args, function (err) {
      if (err) this.response.error = err;
      done.call(this, err);
    });
  },

  /**
   * @api private
   */
  eventParameters: function eventParameters(eventName) {
    switch (eventName) {
      case 'validate':
      case 'sign':
      case 'build':
      case 'afterBuild':
        return [this];
      case 'error':
        return [this.response.error, this.response];
      default:
        return [this.response];
    }
  }
});

AWS.util.mixin(AWS.Request, AWS.SequentialExecutor);
