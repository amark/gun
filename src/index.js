

var Gun = require('./root');
module.exports = Gun;

;(function(){
	function meta(v,f){
		if(obj_has(Gun.__._, f)){ return }
		obj_put(this._, f, v);
	}
	function map(value, field){
		if(Gun._.node === field){ return }
		var node = this.node, vertex = this.vertex, union = this.union, machine = this.machine;
		var is = state_is(node, field), cs = state_is(vertex, field);
		if(u === is || u === cs){ return true } // it is true that this is an invalid HAM comparison.
		var iv = value, cv = vertex[field];








		// TODO: BUG! Need to compare relation to not relation, and choose the relation if there is a state conflict.








		if(!val_is(iv) && u !== iv){ return true } // Undefined is okay since a value might not exist on both nodes. // it is true that this is an invalid HAM comparison.
		if(!val_is(cv) && u !== cv){ return true }  // Undefined is okay since a value might not exist on both nodes. // it is true that this is an invalid HAM comparison.
		var HAM = Gun.HAM(machine, is, cs, iv, cv);
		if(HAM.err){
			console.log(".!HYPOTHETICAL AMNESIA MACHINE ERR!.", field, HAM.err); // this error should never happen.
			return;
		}
		if(HAM.state || HAM.historical || HAM.current){ // TODO: BUG! Not implemented.
			//opt.lower(vertex, {field: field, value: value, state: is});
			return;
		}
		if(HAM.incoming){
			union[field] = value;
			state_ify(union, field, is);
			return;
		}
		if(HAM.defer){ // TODO: BUG! Not implemented.
			union[field] = value; // WRONG! BUG! Need to implement correct algorithm.
			state_ify(union, field, is); // WRONG! BUG! Need to implement correct algorithm.
			// filler algorithm for now.
			return;
			/*upper.wait = true;
			opt.upper.call(state, vertex, field, incoming, ctx.incoming.state); // signals that there are still future modifications.
			Gun.schedule(ctx.incoming.state, function(){
				update(incoming, field);
				if(ctx.incoming.state === upper.max){ (upper.last || function(){})() }
			}, gun.__.opt.state);*/
		}
	}
	Gun.HAM.union = function(vertex, node, opt){
		if(!node || !node._){ return }
		vertex = vertex || Gun.node.soul.ify({_:{'>':{}}}, Gun.node.soul(node));
		if(!vertex || !vertex._){ return }
		opt = num_is(opt)? {machine: opt} : {machine: Gun.state()};
		opt.union = vertex || Gun.obj.copy(vertex); // TODO: PERF! This will slow things down!
		// TODO: PERF! Biggest slowdown (after 1ocalStorage) is the above line. Fix! Fix!
		opt.vertex = vertex;
		opt.node = node;
		//obj_map(node._, meta, opt.union); // TODO: Review at some point?
		if(obj_map(node, map, opt)){ // if this returns true then something was invalid.
			return;
		}
		return opt.union;
	}
	Gun.HAM.delta = function(vertex, node, opt){
		opt = num_is(opt)? {machine: opt} : {machine: Gun.state()};
		if(!vertex){ return Gun.obj.copy(node) }
		opt.soul = Gun.node.soul(opt.vertex = vertex);
		if(!opt.soul){ return }
		opt.delta = Gun.node.soul.ify({}, opt.soul);
		obj_map(opt.node = node, diff, opt);
		return opt.delta;
	}
	function diff(value, field){ var opt = this;
		if(Gun._.node === field){ return }
		if(!val_is(value)){ return }
		var node = opt.node, vertex = opt.vertex, is = state_is(node, field, true), cs = state_is(vertex, field, true), delta = opt.delta;
		var HAM = Gun.HAM(opt.machine, is, cs, value, vertex[field]);



		// TODO: BUG!!!! WHAT ABOUT DEFERRED!???
		


		if(HAM.incoming){
			delta[field] = value;
			state_ify(delta, field, is);
		}
	}
	Gun.HAM.synth = function(at, ev, as){ var gun = this.as || as;
		var cat = gun._, root = cat.root._, put = {}, tmp;
		if(!at.put){
			//if(obj_has(cat, 'put')){ return }
			if(cat.put !== u){ return }
			cat.on('in', {
			//root.ack(at['@'], {
				get: cat.get,
				put: cat.put = u,
				gun: gun,
				via: at
			})
			return;
		}
		// TODO: PERF! Have options to determine if this data should even be in memory on this peer!
		obj_map(at.put, function(node, soul){ var graph = this.graph;
			put[soul] = Gun.HAM.delta(graph[soul], node, {graph: graph}); // TODO: PERF! SEE IF WE CAN OPTIMIZE THIS BY MERGING UNION INTO DELTA!
			graph[soul] = Gun.HAM.union(graph[soul], node) || graph[soul];
		}, root);
		if(at.gun !== root.gun){
			put = at.put;
		}
		// TODO: PERF! Have options to determine if this data should even be in memory on this peer!
		obj_map(put, function(node, soul){
			var root = this, next = root.next || (root.next = {}), gun = next[soul] || (next[soul] = root.gun.get(soul)), coat = (gun._);
			coat.put = root.graph[soul]; // TODO: BUG! Clone!
			if(cat.field && !obj_has(node, cat.field)){
				(at = obj_to(at, {})).put = u;
				Gun.HAM.synth(at, ev, cat.gun);
				return;
			}
			coat.on('in', {
				put: node,
				get: soul,
				gun: gun,
				via: at
			});
		}, root);
	}
}());

var Type = Gun;
var num = Type.num, num_is = num.is;
var obj = Type.obj, obj_has = obj.has, obj_put = obj.put, obj_to = obj.to, obj_map = obj.map;
var node = Gun.node, node_soul = node.soul, node_is = node.is, node_ify = node.ify;
var state = Gun.state, state_is = state.is, state_ify = state.ify;
var val = Gun.val, val_is = val.is, rel_is = val.rel.is;
var u;
	