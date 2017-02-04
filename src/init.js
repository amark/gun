
var Gun = require('./core');
Gun.chain.init = function(){ // TODO: DEPRECATE?
	(this._.opt = this._.opt || {}).init = true;
	return this.back(-1).put(Gun.node.ify({}, this._.get), null, this._.get);
}
	