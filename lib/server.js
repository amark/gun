;(function(){
	var Gun = require('../gun'), u;
	Gun.serve = require('./serve');
	process.env.GUN_ENV = process.env.GUN_ENV || 'debug';
	Gun.on('opt', function(root){
		this.to.next(root);
		if(root.once){ return }
		if(u !== root.opt.super){ return }
		root.opt.super = true;
	})
	require('../nts');
	require('./store');
	require('./rs3');
	//try{require('./ws');}catch(e){require('./wsp/server');}
	require('./wire');
	require('./verify');
	require('./file');
	require('./bye');
	require('./evict');
	if('debug' === process.env.GUN_ENV){ require('./debug') }
	module.exports = Gun;
}());