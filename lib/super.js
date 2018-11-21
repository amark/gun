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
			subscribe(soul, peer, msg);
		}
		to.next(msg);
	}
	/// Store the subscribes
	Gun.subscribe = {}; /// TODO: use Rad instead of plain object?
	function subscribe(soul, peer, msg) {
		if (!peer.id) { console.log('super jump peer without id: ', peer, msg); return; } /// TODO: this occurs in first subscription. Use peer reference or peer.wire.id?
		Gun.subscribe[soul] = Gun.subscribe[soul] || {};
		Gun.subscribe[soul][peer.id] = 1;
	}
	var empty = {}, u;
	if(Gun.window){ return }
	try{module.exports = input}catch(e){}
}());
