;(function(){
	if('debug' !== process.env.GUN_ENV){ return }

	var db = {};

	console.log("start :)");
	global.DEBUG = 1;
	setInterval(function(){
		var mem = process.memoryUsage();
		var used = mem.heapTotal / 1024 / 1024;
		var print = '';
		used = used.toFixed(1);
		print += used +' MB. '
		if(db.root){
			db.concurrency = Object.keys(db.peers||{}).length;
			print += db.concurrency +' peers. ';
			db.nodes = Object.keys(db.root.graph||{}).length;
			print += db.nodes + ' nodes. ';
		}
		if(db.count){ print += db.count + ' msgs. '}
		console.log(print);
	}, 2500);

	var Gun = require('../gun');
	Gun.on('opt', function(root){
		this.to.next(root);
		if(root.once){ return }
		db.root = root;
		db.peers = root.opt.peers;

		db.count = 0;
		root.on('in', function(msg){
			this.to.next(msg);
			db.last = msg;
			db.count++;
		})
	})

}());