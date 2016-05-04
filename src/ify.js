var Gun = require('./gun');

// Javascript to Gun Serializer.
function ify(data, cb, opt){
	opt = opt || {};
	cb = cb || function(env, cb){ cb(env.at, Gun.is.node.soul(env.at.obj) || Gun.is.node.soul(env.at.node) || Gun.text.random()) };
	var end = function(fn){
		ctx.end = fn || function(){};
		unique(ctx);
	}, ctx = {at: {path: [], obj: data}, root: {}, graph: {}, queue: [], seen: [], opt: opt, loop: true};
	if(!data){ return ctx.err = {err: Gun.log('Serializer does not have correct parameters.')}, end }
	if(ctx.opt.start){ Gun.is.node.soul.ify(ctx.root, ctx.opt.start) }
	ctx.at.node = ctx.root;
	while(ctx.loop && !ctx.err){
		seen(ctx, ctx.at);
		map(ctx, cb);
		if(ctx.queue.length){
			ctx.at = ctx.queue.shift();
		} else {
			ctx.loop = false;
		}
	}
	return end;
}
function map(ctx, cb){
	var u, rel = function(at, soul){
		at.soul = at.soul || soul || Gun.is.node.soul(at.obj) || Gun.is.node.soul(at.node);
		if(!ctx.opt.pure){
			ctx.graph[at.soul] = Gun.is.node.soul.ify(at.node, at.soul);
			if(ctx.at.field){
				Gun.is.node.state.ify([at.node], at.field, u, ctx.opt.state);
			}
		}
		Gun.list.map(at.back, function(rel){
			rel[Gun._.soul] = at.soul;
		});
		unique(ctx);
	}, it;
	Gun.obj.map(ctx.at.obj, function(val, field){
		ctx.at.val = val;
		ctx.at.field = field;
		it = cb(ctx, rel, map) || true;
		if(field === Gun._.meta){
			ctx.at.node[field] = Gun.obj.copy(val); // TODO: BUG! Is this correct?
			return;
		}
		if(String(field).indexOf('.') != -1 || (false && notValidField(field))){ // TODO: BUG! Do later for ACID "consistency" guarantee.
			return ctx.err = {err: Gun.log("Invalid field name on '" + ctx.at.path.join('.') + "'!")};
		}
		if(!Gun.is.val(val)){
			var at = {obj: val, node: {}, back: [], path: [field]}, tmp = {}, was;
			at.path = (ctx.at.path||[]).concat(at.path || []);
			if(!Gun.obj.is(val)){
				return ctx.err = {err: Gun.log("Invalid value at '" + at.path.join('.') + "'!" )};
			}
			if(was = seen(ctx, at)){
				tmp[Gun._.soul] = Gun.is.node.soul(was.node) || null;
				(was.back = was.back || []).push(ctx.at.node[field] = tmp);
			} else {
				ctx.queue.push(at);
				tmp[Gun._.soul] = null;
				at.back.push(ctx.at.node[field] = tmp);
			}
		} else {
			ctx.at.node[field] = Gun.obj.copy(val);
		}
	});
	if(!it){ cb(ctx, rel) }
}
function unique(ctx){
	if(ctx.err || (!Gun.list.map(ctx.seen, function(at){
		if(!at.soul){ return true }
	}) && !ctx.loop)){ return ctx.end(ctx.err, ctx), ctx.end = function(){}; }
}
function seen(ctx, at){
	return Gun.list.map(ctx.seen, function(has){
		if(at.obj === has.obj){ return has }
	}) || (ctx.seen.push(at) && false);
}
ify.wire = function(n, cb, opt){ return Gun.text.is(n)? ify.wire.from(n, cb, opt) : ify.wire.to(n, cb, opt) }
ify.wire.to = function(n, cb, opt){ var t, b;
	if(!n || !(t = Gun.is.node.soul(n))){ return null }
	cb = cb || function(){};
	t = (b = "#'" + JSON.stringify(t) + "'");
	Gun.obj.map(n, function(v,f){
		if(Gun._.meta === f){ return }
		var w = '', s = Gun.is.node.state(n,f);
		if(!s){ return }
		w += ".'" + JSON.stringify(f) + "'";
		w += "='" + JSON.stringify(v) + "'";
		w += ">'" + JSON.stringify(s) + "'";
		t += w;
		w = b + w;
		cb(null, w);
	});
	return t;
}
ify.wire.from = function(n, cb, opt){
	if(!n){ return null }
	var a = [], s = -1, e = 0, end = 1;
	while((e = n.indexOf("'", s + 1)) >= 0){
		if(s === e || '\\' === n.charAt(e-1)){}else{
			a.push(n.slice(s + 1,e));
			s = e;
		}
	}
	return a;
}
Gun.ify = ify;