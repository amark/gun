;(function(){
	var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');
	var ev = {}, empty = {}, u;
	Gun.on('opt', function(root){
		this.to.next(root);
		if(root.once){ return }
		if(typeof process == 'undefined'){ return }
		var util = process.memoryUsage;
		if(!util){ return }
		
		ev.max = parseFloat(root.opt.memory || process.env.WEB_MEMORY || 1399) * 0.8; // max_old_space_size defaults to 1400 MB. Note: old space !== memory space though.
		
		setInterval(check, 1000);
		function check(){
			var used = ev.used = util().rss / 1024 / 1024;
			if(used < ev.max){ return }
			setTimeout(GC, 1);
		}
		function GC(){
			var souls = Object.keys(root.graph||empty);
			var toss = Math.ceil(souls.length * 0.01);
			//var start = Gun.state(), i = toss;
			Gun.list.map(souls, function(soul){
				if(--toss < 0){ return }
				root.gun.get(soul).off();
			});
			//console.log("evicted", i, 'nodes in', ((Gun.state() - start)/1000).toFixed(2), 'sec.');
		}
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