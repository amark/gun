;(function(){
	var Gun = require('../gun');
	//require('./s3');
	require('./wsp/server');
	require('./file');
	Gun.log(
		'Hello wonderful person! :)\n' +
		'I\'m mark@gunDB.io, message me for help or with hatemail. ' +
		'I want to hear from you! <3'
	);
	Gun.log('NOTE: S3 driver not updated to 0.5 yet!');
	module.exports = Gun;
}());
