window.AWS = module.exports = require('./core');

// Load the DOMParser XML parser
require('./xml/browser_parser');

// Load the XHR HttpClient
require('./http/xhr');
