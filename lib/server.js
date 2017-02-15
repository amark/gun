;(function(){
	var Gun = require('../gun');
	//require('./s3');
	require('./wsp/server');
	require('./file');
	Gun.log('NOTE: S3 driver not updated to 0.5 yet!');
	module.exports = Gun;
}());