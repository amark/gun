
if(typeof Gun === 'undefined'){ return } // TODO: localStorage is Browser only. But it would be nice if it could somehow plugin into NodeJS compatible localStorage APIs?

var root, noop = function(){}, u;
if(typeof window !== 'undefined'){ root = window }
var store = root.localStorage || {setItem: noop, removeItem: noop, getItem: noop};

Gun.on('put', function(at){ var err, id, opt, root = at.gun._.root;
	this.to.next(at);
	(opt = {}).prefix = (at.opt || opt).prefix || at.gun.back('opt.prefix') || 'gun/';
	Gun.graph.is(at.put, function(node, soul, map){
		var keys = Gun.obj.ify(store.getItem(opt.prefix + soul+'_')||{});
		map(function(val, key){
			keys[key] = 1;
			var state = Gun.state.is(node, key);
			// #soul.field=val>state
			try{store.setItem(opt.prefix + soul+key, JSON.stringify([val,state]));
			}catch(e){ err = e || "localStorage failure" }
		});
		try{store.setItem(opt.prefix + soul+'_', JSON.stringify(keys));
		}catch(e){ err = e || "localStorage failure" }
	});
	if(Gun.obj.empty(at.gun.back('opt.peers'))){
		Gun.on.ack(at, {err: err, ok: 0}); // only ack if there are no peers.
	}
});
Gun.on('get', function(at){
	this.to.next(at);
	var gun = at.gun, lex = at.get, soul, data, opt, u;
	//setTimeout(function(){
	(opt = at.opt || {}).prefix = opt.prefix || at.gun.back('opt.prefix') || 'gun/';
	if(!lex || !(soul = lex[Gun._.soul])){ return }
	var field = lex['.'];
	if(field){
		if(data = Gun.obj.ify(store.getItem(opt.prefix + soul+field)||null)||u){
			data = Gun.state.ify(u, field, data[1], data[0], soul);
		}
	} else {
		Gun.obj.map(Gun.obj.ify(store.getItem(opt.prefix + soul+'_')), function(v,field){
			v = Gun.obj.ify(store.getItem(opt.prefix + soul+field)||{});
			data = Gun.state.ify(data, field, v[1], v[0], soul);
		});
	}
	gun.back(-1).on('in', {'@': at['#'], put: Gun.graph.node(data)});
	//},11);
});
	