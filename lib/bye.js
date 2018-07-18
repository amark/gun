var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

Gun.on('opt', function(root){
	this.to.next(root);
	if(root.once){ return }
	console.log("WARNING: `lib/bye` is out of date!");
	root.on('in', function(msg){
		if(!msg.peer || !msg.BYE){ return this.to.next(msg) }
		var peer = msg.peer();
		(peer.bye = peer.bye || []).push(msg.BYE);
	})
	root.on('bye', function(peer){
		this.to.next(peer);
		if(!peer.bye){ return }
		var gun = root.gun;
		Gun.obj.map(peer.bye, function(data){
			Gun.obj.map(data, function(put, soul){
				gun.get(soul).put(put);
			});
		});
		peer.bye = [];
	});
});

Gun.chain.bye = function(){
	var gun = this, bye = gun.chain(), root = gun.back(-1), put = bye.put;
	bye.put = function(data){
		gun.back(function(at){
			if(!at.get){ return }
			var tmp = data;
			(data = {})[at.get] = tmp;
		});
		root.on('out', {BYE: data});
		return gun;
	}
	return bye;
}