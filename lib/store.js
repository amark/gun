var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

Gun.on('create', function(root){
	this.to.next(root);
	var opt = root.opt, u;
	if(false === opt.radisk){ return }
	var Radisk = (Gun.window && Gun.window.Radisk) || require('./radisk');
	var Radix = Radisk.Radix;

	opt.store = opt.store || (!Gun.window && require('./rfs')(opt));
	var rad = Radisk(opt), esc = String.fromCharCode(27);

	root.on('put', function(msg){
		this.to.next(msg);
		var id = msg['#'], track = !msg['@'], acks = track? 0 : u; // only ack non-acks.
		if(msg.rad && !track){ return } // don't save our own acks
		Gun.graph.is(msg.put, null, function(val, key, node, soul){
			if(track){ ++acks }
			val = Radisk.encode(val, null, esc)+'>'+Radisk.encode(Gun.state.is(node, key), null, esc);
			rad(soul+'.'+key, val, (track? ack : u));
		});
		function ack(err, ok){
			acks--;
			if(ack.err){ return }
			if(ack.err = err){
				root.on('in', {'@': id, err: err});
				return;
			}
			if(acks){ return }
			root.on('in', {'@': id, ok: 1});
		}
	});

	root.on('get', function(msg){
		this.to.next(msg);
		var id = msg['#'], soul = msg.get['#'], key = msg.get['.']||'', tmp = soul+'.'+key, node;
		rad(tmp, function(err, val){
			if(val){
				if(val && typeof val !== 'string'){
					if(key){
						val = u;
					} else {
						Radix.map(val, each) 
					}
				}
				if(!node && val){ each(val, key) }
			}
			root.on('in', {'@': id, put: Gun.graph.node(node), err: err? err : u, rad: Radix});
		});
		function each(val, key){
			tmp = val.lastIndexOf('>');
			var state = Radisk.decode(val.slice(tmp+1), null, esc);
			val = Radisk.decode(val.slice(0,tmp), null, esc);
			node = Gun.state.ify(node, key, state, val, soul);
		}
	});

});