;(function(){
	var Gun = require('../gun'), u;
	Gun.serve = require('./serve');
	//process.env.GUN_ENV = process.env.GUN_ENV || 'debug';
	Gun.on('opt', function(root){
		if(u === root.opt.super){
			root.opt.super = true;
		}
		this.to.next(root);
	})
	require('../nts');
	require('./store');
	require('./rs3');
	require('./wire');
	try{require('../sea');}catch(e){}
	//try{require('../axe');}catch(e){}
	require('./file');
	require('./evict');
	if('debug' === process.env.GUN_ENV){ require('./debug') }
	module.exports = Gun;
}());