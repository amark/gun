if(typeof window === "undefined"){
  var Gun = require('../gun');
}

Gun.on('opt', function(ctx){
	this.to.next(ctx);
	var opt = ctx.opt, u;
	if(typeof window !== "undefined"){
		opt.window = window;
	}
	if(ctx.once){ return }
	if(false !== opt.localStorage && !(!opt.window && process.env.AWS_S3_BUCKET)){ return } // TODO: Remove this after migration.
	if(false === opt.radisk){ return }
	console.log("BUG WARNING: Radix Storage Engine (RAD) has a known rare edge case, if data gets split between file chunks, a GET may only return the first chunk!!!");
	var Radisk = (opt.window && opt.window.Radisk) || require('./radisk');
	var Radix = Radisk.Radix;

	opt.store = opt.store || (!opt.window && require('./rfs')(opt));
	var rad = Radisk(opt);

	ctx.on('put', function(at){
		this.to.next(at);
		var id = at['#'], track = !at['@'], acks = track? 0 : u; // only ack non-acks.
		Gun.graph.is(at.put, null, function(val, key, node, soul){
			if(track){ ++acks }
			val = Radisk.encode(val)+'>'+Radisk.encode(Gun.state.is(node, key));
			rad(soul+'.'+key, val, (track? ack : u));
		});
		function ack(err, ok){
			acks--;
			if(ack.err){ return }
			if(ack.err = err){
				ctx.on('in', {'@': id, err: Gun.log(err)});
				return;
			}
			if(acks){ return }
			ctx.on('in', {'@': id, ok: 1});
		}
	});

	ctx.on('get', function(at){
		this.to.next(at);
		var id = at['#'], soul = at.get['#'], key = at.get['.']||'', tmp = soul+'.'+key, node;
		rad(tmp, function(err, val){
			if(val){
				Radix.map(val, each);
				if(!node){ each(val, key) }
			}
			ctx.on('in', {'@': id, put: Gun.graph.node(node), err: err? err : u});
		});
		function each(val, key){
			tmp = val.lastIndexOf('>');
			var state = Radisk.decode(val.slice(tmp+1));
			val = Radisk.decode(val.slice(0,tmp));
			node = Gun.state.ify(node, key, state, val, soul);
		}
	});

});