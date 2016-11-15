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
	Gun.log('TODO: MARK! UPDATE S3 DRIVER BEFORE PUBLISHING!');
	module.exports = Gun;
}());
