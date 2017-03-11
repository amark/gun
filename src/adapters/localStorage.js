
if(typeof Gun === 'undefined'){ return } // TODO: localStorage is Browser only. But it would be nice if it could somehow plugin into NodeJS compatible localStorage APIs?

var root, noop = function(){}, u;
if(typeof window !== 'undefined'){ root = window }
var store = root.localStorage || {setItem: noop, removeItem: noop, getItem: noop};

var check = {}, dirty = {}, async = {}, count = 0, max = 10000, wait;

Gun.on('put', function(at){ var err, id, opt, root = at.gun._.root;
	this.to.next(at);
	(opt = {}).prefix = (at.opt || opt).prefix || at.gun.back('opt.prefix') || 'gun/';
	var graph = root._.graph;
	
	Gun.obj.map(at.put, function(node, soul){
		async[soul] = graph[soul] || node;
	});
	count += 1;
	check[at['#']] = root;
	function save(){
		clearTimeout(wait);
		var ack = check;
		var all = async;
		count = 0;
		wait = false;
		check = {};
		async = {};
		Gun.obj.map(all, function(node, soul){
			// Since localStorage only has 5MB, it is better that we keep only
			// the data that the user is currently interested in.
			node = graph[soul] || all[soul];
			try{store.setItem(opt.prefix + soul, JSON.stringify(node));
			}catch(e){ err = e || "localStorage failure" }
		});
		if(!Gun.obj.empty(at.gun.back('opt.peers'))){ return } // only ack if there are no peers.
		Gun.obj.map(ack, function(root, id){
			root.on('in', {
				'@': id,
				err: err,
				ok: 0 // localStorage isn't reliable, so make its `ok` code be a low number.
			});
		});
	}
	if(count >= max){ // goal is to do 10K inserts/second.
		return save();
	}
	if(wait){ return }
	clearTimeout(wait);
	wait = setTimeout(save, 1000);
});
Gun.on('get', function(at){
	this.to.next(at);
	var gun = at.gun, lex = at.get, soul, data, opt, u;
	//setTimeout(function(){
	(opt = at.opt || {}).prefix = opt.prefix || at.gun.back('opt.prefix') || 'gun/';
	if(!lex || !(soul = lex[Gun._.soul])){ return }
	//if(0 >= at.cap){ return }
	var field = lex['.'];

	data = Gun.obj.ify(store.getItem(opt.prefix + soul) || null) || async[soul] || u;
	if(data && field){
		data = Gun.state.ify(u, field, Gun.state.is(data, field), data[field], soul);
	}
	if(!data && !Gun.obj.empty(gun.back('opt.peers'))){ // if data not found, don't ack if there are peers.
		return; // Hmm, what if we have peers but we are disconnected?
	}
	gun.on('in', {'@': at['#'], put: Gun.graph.node(data), how: 'lS'});
	//},11);
});
	