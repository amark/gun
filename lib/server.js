;(function(){
	console.log("Hello wonderful person! :) I'm mark@gunDB.io, message me for help or with hatemail. I want to hear from you! <3");
	var Gun = require('../gun');
	console.log("TODO: MARK! UPDATE S3 DRIVER BEFORE PUBLISHING!")
	//require('./s3');
	require('./wsp');
	require('./file');
	module.exports = Gun;
}());
