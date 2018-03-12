;(function(){
	var Gun = require('../gun');
	Gun.serve = require('./serve');
	require('../nts');
	require('./store');
	require('./rs3');
	//try{require('./ws');}catch(e){require('./wsp/server');}
	require('./wire');
	require('./verify');
	require('./file');
	require('./bye');
	if('debug' === process.env.GUN_ENV){ require('./debug') }
	module.exports = Gun;
}());