if(typeof window !== "undefined"){
  var Gun = window.Gun;
} else { 
  var Gun = require('../gun');
}

Gun.on('opt', function(ctx){
	this.to.next(ctx);
	if(ctx.once){ return }
	ctx.on('in', function(msg){
		if(!msg.peer || !msg.BYE){ return this.to.next(msg) }
		var peer = msg.peer();
		(peer.bye = peer.bye || []).push(msg.BYE);
	})
	ctx.on('bye', function(peer){
		this.to.next(peer);
		if(!peer.bye){ return }
		var gun = ctx.gun;
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