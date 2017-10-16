
if(typeof Gun === 'undefined'){ return } // TODO: localStorage is Browser only. But it would be nice if it could somehow plugin into NodeJS compatible localStorage APIs?

var root, noop = function(){}, u;
if(typeof window !== 'undefined'){ root = window }
var store = root.localStorage || {setItem: noop, removeItem: noop, getItem: noop};

/*
	NOTE: Both `lib/file.js` and `lib/memdisk.js` are based on this design!
	If you update anything here, consider updating the other adapters as well.
*/

Gun.on('opt', function(ctx){
	this.to.next(ctx);
	var opt = ctx.opt;
	if(ctx.once){ return }
	if(false === opt.localStorage){ return }
	opt.file = opt.file || opt.prefix || 'gun/'; // support old option name.
	var graph = ctx.graph, acks = {}, count = 0, to;
	var disk = Gun.obj.ify(store.getItem(opt.file)) || {};
	
	ctx.on('put', function(at){
		this.to.next(at);
		Gun.graph.is(at.put, null, map);
		if(!at['@']){ acks[at['#']] = true; } // only ack non-acks.
		count += 1;
		if(count >= (opt.batch || 1000)){
			return flush();
		}
		if(to){ return }
		to = setTimeout(flush, opt.wait || 1);
	});

	ctx.on('get', function(at){
		this.to.next(at);
		var gun = at.gun, lex = at.get, soul, data, opt, u;
		//setTimeout(function(){
		if(!lex || !(soul = lex[Gun._.soul])){ return }
		//if(0 >= at.cap){ return }
		var field = lex['.'];
		data = disk[soul] || u;
		if(data && field){
			data = Gun.state.to(data, field);
		}
		if(!data && !Gun.obj.empty(gun.back('opt.peers'))){ // if data not found, don't ack if there are peers.
			return; // Hmm, what if we have peers but we are disconnected?
		}
		gun.on('in', {'@': at['#'], put: Gun.graph.node(data), how: 'lS'});
		//},11);
	});

	var map = function(val, key, node, soul){
		disk[soul] = Gun.state.to(node, key, disk[soul]);
	}

	var flush = function(){
		var err;
		count = 0;
		clearTimeout(to);
		to = false;
		var ack = acks;
		acks = {};
		try{store.setItem(opt.file, JSON.stringify(disk));
		}catch(e){ Gun.log(err = e || "localStorage failure") }
		if(!err && !Gun.obj.empty(opt.peers)){ return } // only ack if there are no peers.
		Gun.obj.map(ack, function(yes, id){
			ctx.on('in', {
				'@': id,
				err: err,
				ok: 0 // localStorage isn't reliable, so make its `ok` code be a low number.
			});
		});
	}
});
	