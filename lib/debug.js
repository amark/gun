;(function(){
	if('debug' !== process.env.GUN_ENV){ return }

	var db = {};

	console.log("start :)");
	global.DEBUG = 1;
	setInterval(function(){
		var mem = process.memoryUsage();
		var used = mem.heapUsed / 1024 / 1024;
		var print = '';
		used = used.toFixed(1);
		print += used +' MB. '
		if(db.root){
			db.concurrency = Object.keys(db.peers||{}).length;
			print += db.concurrency +' peers. ';
		}
		console.log(print);
	}, 2500);

	var Gun = require('../gun');
	Gun.on('opt', function(root){
		this.to.next(root);
		if(root.once){ return }
		db.root = root;
		db.peers = root.opt.peers;
	})

}());