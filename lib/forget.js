;(function(){

	var Gun = (this||{}).Gun || require('../gun');

	Gun.on('opt', function(ctx){
		once(ctx);
		this.to.next(ctx);
	});

	function once(ctx){
		if(ctx.once){ return }
		var forget = ctx.opt.forget = ctx.opt.forget || {};
		ctx.on('put', function(msg){
			Gun.graph.is(msg.put, function(node, soul){
				if(!Gun.obj.has(forget, soul)){ return }
				delete msg.put[soul];
			});
			this.to.next(msg);
		});
	}

}());