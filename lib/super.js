;(function(){
	var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');
	var Rad = (Gun.window||{}).Radix || require('./radix');
	function input(msg){
		var at = this.as, to = this.to, peer = (msg.mesh||empty).via;
		var get = msg.get, soul, key;
		if(!peer || !get){ return to.next(msg) }
		console.log("super", msg);
		if(soul = get['#']){
			if(key = get['.']){

			} else {

			}
		}
		to.next(msg);
	}
	var empty = {}, u;
	if(Gun.window){ return }
	try{module.exports = input}catch(e){}
}());