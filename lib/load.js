var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');
Gun.chain.open || require('./open');

Gun.chain.load = function(cb, opt, at){
	(opt = opt || {}).off = !0;
	return this.open(cb, opt, at);
}