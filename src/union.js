var Gun = require('./gun');

Gun.union = function(gun, prime, cb, opt){ // merge two graphs into the first.
	var opt = opt || Gun.obj.is(cb)? cb : {};
	var ctx = {graph: gun.__.graph, count: 0};
	ctx.cb = function(){
		cb = Gun.fns.is(cb)? cb() && null : null; 
	}
	if(!ctx.graph){ ctx.err = {err: Gun.log("No graph!") } }
	if(!prime){ ctx.err = {err: Gun.log("No data to merge!") } }
	if(ctx.soul = Gun.is.node.soul(prime)){ prime = Gun.is.graph.ify(prime) }
	if(!Gun.is.graph(prime, null, function(val, field, node){ var meta;
		if(!Gun.num.is(Gun.is.node.state(node, field))){
			return ctx.err = {err: Gun.log("No state on '" + field + "'!") } 
		}
	}) || ctx.err){ return ctx.err = ctx.err || {err: Gun.log("Invalid graph!", prime)}, ctx }
	function emit(at){
		Gun.on('operating').emit(gun, at);
	}
	(function union(graph, prime){
		var prime = Gun.obj.map(prime, function(n,s,t){t(n)}).sort(function(A,B){
			var s = Gun.is.node.soul(A);
			if(graph[s]){ return 1 }
			return 0;
		});
		ctx.count += 1;
		ctx.err = Gun.list.map(prime, function(node, soul){
			soul = Gun.is.node.soul(node);
			if(!soul){ return {err: Gun.log("Soul missing or mismatching!")} }
			ctx.count += 1;
			var vertex = graph[soul];
			if(!vertex){ graph[soul] = vertex = Gun.is.node.ify({}, soul) }
			Gun.union.HAM(vertex, node, function(vertex, field, val, state){
				Gun.on('historical').emit(gun, {soul: soul, field: field, value: val, state: state, change: node});
				gun.__.on('historical').emit({soul: soul, field: field, change: node});
			}, function(vertex, field, val, state){
				if(!vertex){ return }
				var change = Gun.is.node.soul.ify({}, soul);
				if(field){
					Gun.is.node.state.ify([vertex, change, node], field, val);
				}
				emit({soul: soul, field: field, value: val, state: state, change: change});
			}, function(vertex, field, val, state){
				Gun.on('deferred').emit(gun, {soul: soul, field: field, value: val, state: state, change: node});
			})(function(){
				emit({soul: soul, change: node});
				if(opt.soul){ opt.soul(soul) }
				if(!(ctx.count -= 1)){ ctx.cb() }
			}); // TODO: BUG? Handle error!
		});
		ctx.count -= 1;
	})(ctx.graph, prime);
	if(!ctx.count){ ctx.cb() }
	return ctx;
}

Gun.union.ify = function(gun, prime, cb, opt){
	if(gun){ gun = (gun.__ && gun.__.graph)? gun.__.graph : gun }
	if(Gun.text.is(prime)){ 
		if(gun && gun[prime]){
			prime = gun[prime];
		} else {
			return Gun.is.node.ify({}, prime);
		}
	}
	var vertex = Gun.is.node.soul.ify({}, Gun.is.node.soul(prime)), prime = Gun.is.graph.ify(prime) || prime;
	if(Gun.is.graph(prime, null, function(val, field){ var node;
		function merge(a, f, v){ Gun.is.node.state.ify(a, f, v) }
		if(Gun.is.rel(val)){ node = gun? gun[field] || prime[field] : prime[field] }
		Gun.union.HAM(vertex, node, function(){}, function(vert, f, v){
			merge([vertex, node], f, v);
		}, function(){})(function(err){
			if(err){ merge([vertex], field, val) }
		})
	})){ return vertex }
}

Gun.union.HAM = function(vertex, delta, lower, now, upper){
	upper.max = -Infinity;
	now.end = true;
	delta = delta || {};
	vertex = vertex || {};
	Gun.obj.map(delta._, function(v,f){
		if(Gun._.state === f || Gun._.soul === f){ return }
		vertex._[f] = v;
	});
	if(!Gun.is.node(delta, function update(incoming, field){
		now.end = false;
		var ctx = {incoming: {}, current: {}}, state;
		ctx.drift = Gun.time.now(); // DANGEROUS!
		ctx.incoming.value = Gun.is.rel(incoming) || incoming;
		ctx.current.value = Gun.is.rel(vertex[field]) || vertex[field];
		ctx.incoming.state = Gun.num.is(ctx.tmp = ((delta._||{})[Gun._.state]||{})[field])? ctx.tmp : -Infinity;
		ctx.current.state = Gun.num.is(ctx.tmp = ((vertex._||{})[Gun._.state]||{})[field])? ctx.tmp : -Infinity;
		upper.max = ctx.incoming.state > upper.max? ctx.incoming.state : upper.max;
		state = Gun.HAM(ctx.drift, ctx.incoming.state, ctx.current.state, ctx.incoming.value, ctx.current.value);
		if(state.err){
			root.console.log(".!HYPOTHETICAL AMNESIA MACHINE ERR!.", state.err); // this error should never happen.
			return;
		}
		if(state.state || state.historical || state.current){
			lower.call(state, vertex, field, incoming, ctx.incoming.state);
			return;
		}
		if(state.incoming){
			now.call(state, vertex, field, incoming, ctx.incoming.state);
			return;
		}
		if(state.defer){
			upper.wait = true;
			upper.call(state, vertex, field, incoming, ctx.incoming.state); // signals that there are still future modifications.
			Gun.schedule(ctx.incoming.state, function(){
				update(incoming, field);
				if(ctx.incoming.state === upper.max){ (upper.last || function(){})() }
			});
		}
	})){ return function(fn){ if(fn){ fn({err: 'Not a node!'}) } } }
	if(now.end){ now.call({}, vertex) } // TODO: Should HAM handle empty updates? YES.
	return function(fn){
		upper.last = fn || function(){};
		if(!upper.wait){ upper.last() }
	}
}