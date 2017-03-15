;(function(){
	var Gun = require('../gun');
	Gun.serve = require('./serve');
	require('./s3');
	try{require('./uws');}catch(e){require('./wsp/server');}
	require('./file');
	module.exports = Gun;
}());
