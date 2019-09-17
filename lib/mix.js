;(function(){
	var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');
	Gun.state.node = function(node, vertex, opt){
		opt = opt || {};
		opt.state = opt.state || Gun.state();
		var now = Gun.obj.copy(vertex);
		Gun.node.is(node, function(val, key){
			var ham = Gun.HAM(opt.state, Gun.state.is(node, key), Gun.state.is(vertex, key), val, vertex[key]);
			if(!ham.incoming){
				// if(ham.defer){}
				return;
			}
			now = Gun.state.to(node, key, now);
		});
		return now;
	}
}());