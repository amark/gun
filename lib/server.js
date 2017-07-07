;(function(){
	var Gun = require('../gun');
	Gun.serve = require('./serve');
	require('../nts');
	require('./s3');
	try{require('./ws');}catch(e){require('./wsp/server');}
	require('./verify');
	require('./file');
	module.exports = Gun;
}());
