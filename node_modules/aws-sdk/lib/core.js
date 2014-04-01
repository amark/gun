/**
 * The main AWS namespace
 */
var AWS = {};

/**
 * @api private
 * @!macro [new] nobrowser
 *   @note This feature is not supported in the browser environment of the SDK.
 */
var _hidden = {}; _hidden = {}; // hack to parse macro

module.exports = AWS;
require('./util');

AWS.util.update(AWS, {

  /**
   * @constant
   */
  VERSION: '2.0.0-rc13',

  /**
   * @api private
   */
  ServiceInterface: {},

  /**
   * @api private
   */
  Signers: {},

  /**
   * @api private
   */
  XML: {}

});

require('./service');

require('./credentials');
require('./credentials/credential_provider_chain');
require('./credentials/temporary_credentials');
require('./credentials/web_identity_credentials');
require('./credentials/saml_credentials');

require('./config');
require('./http');
require('./sequential_executor');
require('./event_listeners');
require('./request');
require('./response');
require('./resource_waiter');
require('./signers/request_signer');
require('./param_validator');

/**
 * @readonly
 * @return [AWS.SequentialExecutor] a collection of global event listeners that
 *   are attached to every sent request.
 * @see AWS.Request AWS.Request for a list of events to listen for
 * @example Logging the time taken to send a request
 *   AWS.events.on('send', function startSend(resp) {
 *     resp.startTime = new Date().getTime();
 *   }).on('complete', function calculateTime(resp) {
 *     var time = (new Date().getTime() - resp.startTime) / 1000;
 *     console.log('Request took ' + time + ' seconds');
 *   });
 *
 *   new AWS.S3().listBuckets(); // prints 'Request took 0.285 seconds'
 */
AWS.events = new AWS.SequentialExecutor();

if (typeof window !== 'undefined') window.AWS = AWS;
