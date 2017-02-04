
if(typeof Gun === 'undefined'){ return } // TODO: localStorage is Browser only. But it would be nice if it could somehow plugin into NodeJS compatible localStorage APIs?

var root, noop = function(){};
if(typeof window !== 'undefined'){ root = window }
var store = root.localStorage || {setItem: noop, removeItem: noop, getItem: noop};

function put(at){ var err, id, opt, root = at.gun._.root;
	this.to.next(at);
	(opt = {}).prefix = (at.opt || opt).prefix || at.gun.back('opt.prefix') || 'gun/';
	Gun.graph.is(at.put, function(node, soul){
		//try{store.setItem(opt.prefix + soul, Gun.text.ify(node));
		// TODO: BUG! PERF! Biggest slowdown is because of localStorage stringifying larger and larger nodes!
		try{store.setItem(opt.prefix + soul, Gun.text.ify(root._.graph[soul]||node));
		}catch(e){ err = e || "localStorage failure" }
	});
	//console.log('@@@@@@@@@@local put!');
	if(Gun.obj.empty(at.gun.back('opt.peers'))){
		Gun.on.ack(at, {err: err, ok: 0}); // only ack if there are no peers.
	}
}
function get(at){
	this.to.next(at);
	var gun = at.gun, lex = at.get, soul, data, opt, u;
	//setTimeout(function(){
	(opt = at.opt || {}).prefix = opt.prefix || at.gun.back('opt.prefix') || 'gun/';
	if(!lex || !(soul = lex[Gun._.soul])){ return }
	data = Gun.obj.ify(store.getItem(opt.prefix + soul) || null);
	if(!data){ // localStorage isn't trustworthy to say "not found".
		if(Gun.obj.empty(gun.back('opt.peers'))){
			gun.back(-1).on('in', {'@': at['#']});
		}
		return;
	}
	if(Gun.obj.has(lex, '.')){var tmp = data[lex['.']];data = {_: data._};if(u !== tmp){data[lex['.']] = tmp}}
	//console.log('@@@@@@@@@@@@local get', data, at);
	gun.back(-1).on('in', {'@': at['#'], put: Gun.graph.node(data)});
	//},11);
}
Gun.on('put', put);
Gun.on('get', get);
	