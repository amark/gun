
if(typeof Gun === 'undefined'){ return }

var noop = function(){}, store, u;
try{store = (Gun.window||noop).localStorage}catch(e){}
if(!store){
	Gun.log("Warning: No localStorage exists to persist data to!");
	store = {setItem: function(k,v){this[k]=v}, removeItem: function(k){delete this[k]}, getItem: function(k){return this[k]}};
}
Gun.on('create', function lg(root){
	this.to.next(root);
	var opt = root.opt, graph = root.graph, acks = [], disk, to;
	if(false === opt.localStorage){ return }
	opt.prefix = opt.file || 'gun/';
	try{ disk = lg[opt.prefix] = lg[opt.prefix] || JSON.parse(store.getItem(opt.prefix)) || {}; // TODO: Perf! This will block, should we care, since limited to 5MB anyways?
	}catch(e){ disk = lg[opt.prefix] = {}; }

	root.on('get', function(msg){
		this.to.next(msg);
		var lex = msg.get, soul, data, tmp, u;
		if(!lex || !(soul = lex['#'])){ return }
		data = disk[soul] || u;
		if(data && (tmp = lex['.']) && !Object.plain(tmp)){ // pluck!
			data = Gun.state.ify({}, tmp, Gun.state.is(data, tmp), data[tmp], soul);
		}
		//if(data){ (tmp = {})[soul] = data } // back into a graph.
		//setTimeout(function(){
		Gun.on.get.ack(msg, data); //root.on('in', {'@': msg['#'], put: tmp, lS:1});// || root.$});
		//}, Math.random() * 10); // FOR TESTING PURPOSES!
	});

	root.on('put', function(msg){
		this.to.next(msg); // remember to call next middleware adapter
		var put = msg.put, soul = put['#'], key = put['.'], tmp; // pull data off wire envelope
		disk[soul] = Gun.state.ify(disk[soul], key, put['>'], put[':'], soul); // merge into disk object
		if(!msg['@']){ acks.push(msg['#']) } // then ack any non-ack write. // TODO: use batch id.
		if(to){ return }
		//flush();return;
		to = setTimeout(flush, opt.wait || 1); // that gets saved as a whole to disk every 1ms
	});
	function flush(){
		var err, ack = acks; clearTimeout(to); to = false; acks = [];
		try{store.setItem(opt.prefix, JSON.stringify(disk));
		}catch(e){
			Gun.log((err = (e || "localStorage failure")) + " Consider using GUN's IndexedDB plugin for RAD for more storage space, https://gun.eco/docs/RAD#install");
			root.on('localStorage:error', {err: err, get: opt.prefix, put: disk});
		}
		if(!err && !Object.empty(opt.peers)){ return } // only ack if there are no peers. // Switch this to probabilistic mode
		setTimeout.each(ack, function(id){
			root.on('in', {'@': id, err: err, ok: 0}); // localStorage isn't reliable, so make its `ok` code be a low number.
		});
	}

});
	