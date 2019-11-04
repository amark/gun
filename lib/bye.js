var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

Gun.on('create', function(root){
	this.to.next(root);
	var mesh = root.opt.mesh;
	if(!mesh){ return }
	mesh.hear['bye'] = function(msg, peer){
		(peer.byes = peer.byes || []).push(msg.bye);
	}
	root.on('bye', function(peer){
		this.to.next(peer);
		if(!peer.byes){ return }
		var gun = root.$;
		Gun.obj.map(peer.byes, function(data){
			Gun.obj.map(data, function(put, soul){
				gun.get(soul).put(put);
			});
		});
		peer.byes = [];
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
		root.on('out', {bye: data});
		return gun;
	}
	return bye;
}
