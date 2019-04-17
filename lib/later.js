var Gun = Gun || require('../gun');
Gun.chain.open || require('./open');

Gun.chain.later = function(cb, age){
	var gun = this;
	age = age * 1000; // convert to milliseconds.
	setTimeout(function(){
		gun.open(cb, {off: true});
	}, age);
	return gun;
}