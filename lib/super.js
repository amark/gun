;(function(){
	var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');
	var Rad = (Gun.window||{}).Radix || require('./radix');
	/// Store the subscribes
	Gun.subscribe = {}; /// TODO: use Rad instead of plain object?
	function input(msg){
		var at = this.as, to = this.to, peer = (msg.mesh||empty).via;
		var get = msg.get, soul, key;
		if(!peer || !get){ return to.next(msg) }
		// console.log("super", msg);
		if(soul = get['#']){
			if(key = get['.']){

			} else {

			}
			Gun.subscribe[soul] = Gun.subscribe[soul] || [];
			if (Gun.subscribe[soul].indexOf(peer) === -1) {
				Gun.subscribe[soul].push(peer);
			}
		}
		to.next(msg);
	}
	var empty = {}, u;
	if(Gun.window){ return }
	try{module.exports = input}catch(e){}
}());
