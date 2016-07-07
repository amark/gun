;(function(){
	console.log("Hello wonderful person! :) I'm mark@gunDB.io, message me for help or with hatemail. I want to hear from you! <3");
	var Gun = require('../gun');
	require('./s3');
	require('./file');
	require('./wsp');
	module.exports = Gun;
}());
