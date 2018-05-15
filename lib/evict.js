;(function(){
	var Gun = (typeof window !== 'undefined')? window.Gun : require('../gun');
	
	var LRU = 1, empty = {}, u;
	Gun.on('opt', function(root){
		this.to.next(root);
		if(root.once){ return }
		root.on('get', function(msg){

		})
		/*
		root.on('in', function(msg){
			this.to.next(msg);
			if(msg.get){
				return;
			}
			Gun.graph.is(msg, function(node, soul){
				var meta = (root.next||empty)[soul];
				if(!meta){ return }
				Gun.node.is(node, function(data, key){

				});
			});
		});
		*/
	});
}());