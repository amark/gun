;(function(){
	var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');
	var Rad = (Gun.window||{}).Radix || require('./radix');
	/// Store the subscribes
	Gun.subs = Rad();
	function input(msg){
		var at = this.as, to = this.to, peer = (msg._||empty).via;
		var get = msg.get, soul, key;
		if(!peer || !get){ return to.next(msg) }
		// console.log("super", msg);
		if(soul = get['#']){
			if(key = get['.']){

			} else {

			}
			if (!peer.id) {console.log('[*** WARN] no peer.id %s', soul);}
			var subs = Gun.subs(soul) || null;
			var tmp = subs ? subs.split(',') : [], p = at.opt.peers;
			if (subs) {
				Gun.obj.map(subs.split(','), function(peerid) {
					if (peerid in p) { tmp.push(peerid); }
				});
			}
			if (tmp.indexOf(peer.id) === -1) { tmp.push(peer.id);}
			tmp = tmp.join(',');
			Gun.subs(soul, tmp);
			var dht = {};
			dht[soul] = tmp;
			at.opt.mesh.say({dht:dht}, peer);
		}
		to.next(msg);
	}
	var empty = {}, u;
	if(Gun.window){ return }
	try{module.exports = input}catch(e){}
}());
