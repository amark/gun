
if(typeof Gun === 'undefined'){ return } // TODO: localStorage is Browser only. But it would be nice if it could somehow plugin into NodeJS compatible localStorage APIs?

var root, noop = function(){}, store, u;
try{store = (Gun.window||noop).localStorage}catch(e){}
if(!store){
	Gun.log("Warning: No localStorage exists to persist data to!");
	store = {setItem: function(k,v){this[k]=v}, removeItem: function(k){delete this[k]}, getItem: function(k){return this[k]}};
}
/*
	NOTE: Both `lib/file.js` and `lib/memdisk.js` are based on this design!
	If you update anything here, consider updating the other adapters as well.
*/

Gun.on('create', function(root){
	// This code is used to queue offline writes for resync.
	// See the next 'opt' code below for actual saving of data.
	var ev = this.to, opt = root.opt;
	if(root.once){ return ev.next(root) }
	if(false === opt.localStorage){ return ev.next(root) } // we want offline resynce queue regardless! // actually, this doesn't help, per @go1dfish 's observation. Disabling for now, will need better solution later.
	opt.prefix = opt.file || 'gun/';
	var gap = Gun.obj.ify(store.getItem('gap/'+opt.prefix)) || {};
	var empty = Gun.obj.empty, id, to, go;
	// add re-sync command.
	if(!empty(gap)){
		var disk = Gun.obj.ify(store.getItem(opt.prefix)) || {}, send = {};
		Gun.obj.map(gap, function(node, soul){
			Gun.obj.map(node, function(val, key){
				send[soul] = Gun.state.to(disk[soul], key, send[soul]);
			});
		});
		setTimeout(function(){
			// TODO: Holy Grail dangling by this thread! If gap / offline resync doesn't trigger, it doesn't work. Ouch, and this is a localStorage specific adapter. :(
			root.on('out', {put: send, '#': root.ask(ack)});
		},1);
	}

	root.on('out', function(msg){
		if(msg.lS){ return } // TODO: for IndexedDB and others, shouldn't send to peers ACKs to our own GETs.
		if(Gun.is(msg.$) && msg.put && !msg['@']){
			id = msg['#'];
			Gun.graph.is(msg.put, null, map);
			if(!to){ to = setTimeout(flush, opt.wait || 1) }
		}
		this.to.next(msg);
	});
	root.on('ack', ack);

	function ack(ack){ // TODO: This is experimental, not sure if we should keep this type of event hook.
		if(ack.err || !ack.ok){ return }
		var id = ack['@'];
		setTimeout(function(){
			Gun.obj.map(gap, function(node, soul){
				Gun.obj.map(node, function(val, key){
					if(id !== val){ return }
					delete node[key];
				});
				if(empty(node)){
					delete gap[soul];
				}
			});
			flush();
		}, opt.wait || 1);
	};
	ev.next(root);

	var map = function(val, key, node, soul){
		(gap[soul] || (gap[soul] = {}))[key] = id;
	}
	var flush = function(){
		clearTimeout(to);
		to = false;
		try{store.setItem('gap/'+opt.prefix, JSON.stringify(gap));
		}catch(e){ Gun.log(err = e || "localStorage failure") }
	}
});

Gun.on('create', function(root){
	this.to.next(root);
	var opt = root.opt;
	if(root.once){ return }
	if(false === opt.localStorage){ return }
	opt.prefix = opt.file || 'gun/';
	var graph = root.graph, acks = {}, count = 0, to;
	var disk = Gun.obj.ify(store.getItem(opt.prefix)) || {};
	var lS = function(){}, u;
	root.on('localStorage', disk); // NON-STANDARD EVENT!

	root.on('put', function(at){
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

	root.on('get', function(msg){
		this.to.next(msg);
		var lex = msg.get, soul, data, u;
		function to(){
		if(!lex || !(soul = lex['#'])){ return }
		//if(0 >= msg.cap){ return }
		var has = lex['.'];
		data = disk[soul] || u;
		if(data && has){
			data = Gun.state.to(data, has);
		}
		//if(!data && !Gun.obj.empty(opt.peers)){ return } // if data not found, don't ack if there are peers. // Hmm, what if we have peers but we are disconnected?
		root.on('in', {'@': msg['#'], put: Gun.graph.node(data), how: 'lS', lS: msg.$});// || root.$});
		};
		Gun.debug? setTimeout(to,1) : to();
	});

	var map = function(val, key, node, soul){
		disk[soul] = Gun.state.to(node, key, disk[soul]);
	}

	var flush = function(data){
		var err;
		count = 0;
		clearTimeout(to);
		to = false;
		var ack = acks;
		acks = {};
		if(data){ disk = data }
		try{store.setItem(opt.prefix, JSON.stringify(disk));
		}catch(e){
			Gun.log(err = (e || "localStorage failure") + " Consider using GUN's IndexedDB plugin for RAD for more storage space, https://gun.eco/docs/RAD#install");
			root.on('localStorage:error', {err: err, file: opt.prefix, flush: disk, retry: flush});
		}
		if(!err && !Gun.obj.empty(opt.peers)){ return } // only ack if there are no peers.
		Gun.obj.map(ack, function(yes, id){
			root.on('in', {
				'@': id,
				err: err,
				ok: 0 // localStorage isn't reliable, so make its `ok` code be a low number.
			});
		});
	}
});
	