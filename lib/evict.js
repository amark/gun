;(function(){
	var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');
	var ev = {}, empty = {}, u;
	Gun.on('opt', function(root){
		this.to.next(root);
		if(root.once){ return }
		if(typeof process == 'undefined'){ return }
		var util = process.memoryUsage, heap;
		if(!util){ return }
		try{ heap = require('v8').getHeapStatistics }catch(e){}
		if(!heap){ return }

		ev.max = parseFloat(root.opt.memory || (heap().heap_size_limit / 1024 / 1024) || process.env.WEB_MEMORY || 1399) * 0.8; // max_old_space_size defaults to 1400 MB. Note: old space !== memory space though.
		
		setInterval(check, 1000);
		function check(){
			var used = util().rss / 1024 / 1024;
			var hused = heap().used_heap_size / 1024 / 1024;
			if(hused < ev.max && used < ev.max){ return }
			console.LOG && Gun.log('evict memory:', hused.toFixed(), used.toFixed(), ev.max.toFixed());
			GC();//setTimeout(GC, 1);
		}
		function GC(){
			var souls = Object.keys(root.graph||empty);
			var toss = Math.ceil(souls.length * 0.01);
			//var S = +new Date;
			Gun.list.map(souls, function(soul){
				if(--toss < 0){ return }
				root.gun.get(soul).off();
			});
			root.dup.drop(1000 * 9); // clean up message tracker
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