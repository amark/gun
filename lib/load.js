var Gun = Gun || require('../gun');
Gun.chain.open || require('gun/lib/open');

Gun.chain.load = function(cb, opt, at){
	(opt = opt || {}).off = !0;
	return this.open(cb, opt, at);
}