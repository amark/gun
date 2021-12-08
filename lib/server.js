;(function(){
	require('./ison');
	var Gun = require('../gun'), u;
	Gun.serve = require('./serve');
	//process.env.GUN_ENV = process.env.GUN_ENV || 'debug';
	//console.LOG = {}; // only do this for dev.
	Gun.on('opt', function(root){
		if(u === root.opt.super){ root.opt.super = true }
		if(u === root.opt.faith){ root.opt.faith = true } // HNPERF: This should probably be off, but we're testing performance improvements, please audit.
		root.opt.log = root.opt.log || Gun.log;
		this.to.next(root);
	})
	//require('../nts');
	require('./store');
	require('./rfs');
	require('./rs3');
	require('./wire');
	try{require('../sea');}catch(e){}
	try{require('../axe');}catch(e){}
	//require('./file');
	//require('./evict');
	require('./multicast');
	require('./stats');
	module.exports = Gun;
}());
