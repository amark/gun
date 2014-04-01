var AWS = require('./core');
module.exports = AWS;

// Load the xml2js XML parser
require('./xml/node_parser');

// Load Node HTTP client
require('./http/node');

// Load all service classes
require('./services');

// Load custom credential providers
require('./credentials/ec2_metadata_credentials');
require('./credentials/environment_credentials');
require('./credentials/file_system_credentials');

// Setup default chain providers
AWS.CredentialProviderChain.defaultProviders = [
  function () { return new AWS.EnvironmentCredentials('AWS'); },
  function () { return new AWS.EnvironmentCredentials('AMAZON'); },
  function () { return new AWS.EC2MetadataCredentials(); }
];

// Update configuration keys
AWS.util.update(AWS.Config.prototype.keys, {
  credentials: function () {
    var credentials = null;
    new AWS.CredentialProviderChain([
      function () { return new AWS.EnvironmentCredentials('AWS'); },
      function () { return new AWS.EnvironmentCredentials('AMAZON'); }
    ]).resolve(function(err, creds) {
      if (!err) credentials = creds;
    });
    return credentials;
  },
  credentialProvider: function() {
    return new AWS.CredentialProviderChain();
  },
  region: function() {
    return process.env.AWS_REGION || process.env.AMAZON_REGION;
  }
});

// Reset configuration
AWS.config = new AWS.Config();
