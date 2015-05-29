function radix(r){
	r = r || {};
	var u, n = null, c = 0;
	function get(p){
		var v = match(p, r);
		return v;
	}
	function match(path, tree, v){
		if(!Gun.obj.map(tree, function(val, key){
			if(key[0] !== path[0]){ return }
			var i = 1;
			while(key[i] === path[i] && path[i]){ i++ }
			if(key = key.slice(i)){ // recurse
				console.log("match", key, i)
				v = {sub: tree, pre: path.slice(0, i), val: val, post: key, path: path.slice(i) };
			} else { // replace
				console.log("matching", path, key, i);
				v = match(path.slice(i), val);
			}
			return true;
		})){ console.log("matched", tree, path); v = {sub: tree, path: path} } // insert
		return v;
	}
	function rebalance(ctx, val){
		console.log("rebalance", ctx, val);
		if(!ctx.post){ return ctx.sub[ctx.path] = val }
		ctx.sub[ctx.pre] = ctx.sub[ctx.pre] || (ctx.post? {} : ctx.val || {});
		ctx.sub[ctx.pre][ctx.path] = val;
		if(ctx.post){
			ctx.sub[ctx.pre][ctx.post] = ctx.val;
			delete ctx.sub[ctx.pre + ctx.post];
		}
	}
	function set(p, val){
		rebalance(match(p, r), val);
		console.log('-------------------------');
		return r;
	}
	return function(p, val){
		return (1 < arguments.length)? set(p, val) : get(p || '');
	}
} // IT WORKS!!!!!!

var rad = radix({});

rad('user/marknadal', {'#': 'asdf'});
rad('user/ambercazzell', {'#': 'dafs'});
rad('user/taitforrest', {'#': 'sadf'});
rad('user/taitveronika', {'#': 'fdsa'});
rad('user/marknadal', {'#': 'foo'});

/*

function radix(r){
	var u, n = null, c = 0;
	r = r || {};
	function get(){

	}
	function match(p, l, cb){
		cb = cb || function(){};
		console.log("LETS DO THIS", p, l);
		if(!Gun.obj.map(l, function(v, k){
			if(k[0] === p[0]){
				var i = 1;
				while(k[i] === p[i] && p[i]){ i++ }
				k = k.slice(i);
				if(k){
					cb(p.slice(0, i), v, k, l, p.slice(i));
				} else {
					match(p.slice(i), v, cb);
				}
				return 1;
			}
		})){ cb(p, l, null, l) }
	}
	function set(p, val){
		match(p, r, function(pre, data, f, rr, pp){
			if(f === null){
				rr[pre] = val;
				return;
			}
			console.log("Match?", c, pre, data, f);
			rr[pre] = r[pre] || (f? {} : data || {});
			rr[pre][pp] = val;
			if(f){
				rr[pre][f] = data;
				delete rr[pre + f];
			}
		});
		return r;
	}
	return function(p, val){
		return (1 < arguments.length)? set(p, val) : get(p || '');
	}
} // IT WORKS!!!!!!

var rad = radix({});

rad('user/marknadal', {'#': 'asdf'});
//rad('user/ambercazzell', {'#': 'dafs'});
//rad('user/taitforrest', {'#': 'sadf'});
//rad('user/taitveronika', {'#': 'fdsa'});
*/