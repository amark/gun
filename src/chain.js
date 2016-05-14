var Gun = require('./gun');

Gun.chain.chain = function(s){
	var from = this, gun = !from.back? from : Gun(from);
	gun.back = gun.back || from;
	gun.__ = gun.__ || from.__;
	gun._ = gun._ || {};
	gun._.on = gun._.on || Gun.on.create();
	gun._.at = gun._.at || Gun.on.at(gun._.on);
	return gun;
}