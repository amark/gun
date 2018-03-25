var Gun = Gun || require('../gun');

Gun.on('opt', function(ctx){
	this.to.next(ctx);
	if(ctx.once){ return }
	ctx.on('put', function(msg){
		Gun.graph.is(msg.put, null, function(val, key, node, soul){
			if(null !== val){ return }
			// TODO: Refactor this to use `.off()`?
			var tmp = ctx.graph[soul];
			if(tmp){
				delete tmp[key];
			}
			tmp = tmp._ && tmp._['>'];
			if(tmp){
				delete tmp[key];
			}
			tmp = ctx.next;
			if(tmp && (tmp = tmp[soul]) && (tmp = tmp.put)){
				delete tmp[key];
				tmp = tmp._ && tmp._['>'];
				if(tmp){
					delete tmp[key];
				}
			}
		});
		this.to.next(msg);
	});
});