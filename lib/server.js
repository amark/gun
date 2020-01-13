;(function(){
	var Gun = require('../gun'), u;
	Gun.serve = require('./serve');
	//process.env.GUN_ENV = process.env.GUN_ENV || 'debug';
	//console.LOG = true; // only temporarily, REVERT THIS IN FUTURE!
	Gun.on('opt', function(root){
		if(u === root.opt.super){
			root.opt.super = true;
		}
		root.opt.log = root.opt.log || Gun.log;
		this.to.next(root);
	})
	require('../nts');
	require('./store');
	require('./rs3');
	require('./wire');
	try{require('../sea');}catch(e){}
	try{require('../axe');}catch(e){}
	require('./file');
	require('./evict');
	require('./multicast');
	require('./stats');
	if('debug' === process.env.GUN_ENV){ require('./debug') }
	module.exports = Gun;
}());
