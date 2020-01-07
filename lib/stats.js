var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

Gun.on('opt', function(root){
	this.to.next(root);
	if(root.once){ return }
	if(typeof process === 'undefined'){ return }
	if(typeof require === 'undefined'){ return }
	if(false === root.opt.stats){ return }
	var noop = function(){};
	var os = require('os') || {};
	var fs = require('fs') || {};
	fs.existsSync = fs.existsSync || require('path').existsSync;
	if(!fs.existsSync){ return }
	if(!process){ return }
	process.uptime = process.uptime || noop;
	process.cpuUsage = process.cpuUsage || noop;
	process.memoryUsage = process.memoryUsage || noop;
	os.totalmem = os.totalmem || noop;
	os.freemem = os.freemem || noop;
	os.loadavg = os.loadavg || noop;
	os.cpus = os.cpus || noop;
	setTimeout(function(){
		root.stats = Gun.obj.ify((fs.existsSync(__dirname+'/../stats.'+root.opt.file) && fs.readFileSync(__dirname+'/../stats.'+root.opt.file).toString())) || {};
		root.stats.up = root.stats.up || {};
		root.stats.up.start = root.stats.up.start || +(new Date);
		root.stats.up.count = (root.stats.up.count || 0) + 1;
		root.stats.stay = root.stats.stay || {};
		root.stats.gap = {};
	},1);
	setInterval(function(){
		if(!root.stats){ root.stats = {} }
		var stats = root.stats, tmp;
		(stats.up||{}).time = process.uptime();
		stats.memory = process.memoryUsage() || {};
		stats.memory.totalmem = os.totalmem();
		stats.memory.freemem = os.freemem();
		stats.cpu = process.cpuUsage() || {};
		stats.cpu.loadavg = os.loadavg();
		stats.peers = {};
		stats.peers.count = Object.keys(root.opt.peers||{}).length;
		stats.node = {};
		stats.node.count = Object.keys(root.graph||{}).length;
		stats.all = all;
		var dam = root.opt.mesh;
		if(dam){
			stats.dam = {'in': {count: dam.hear.c, done: dam.hear.d, long: dam.hear.long}, 'out': {count: dam.say.c, done: dam.say.d}};
			dam.hear.c = dam.hear.d = dam.say.c = dam.say.d = 0; // reset
			stats.peers.time = dam.bye.time || 0;
			dam.hear.long = [];
		}
		var rad = root.opt.store; rad = rad && rad.stats;
		if(rad){
			stats.rad = rad;
			root.opt.store.stats = {get:{time:{}, count:0}, put: {time:{}, count:0}}; // reset
		}

		fs.writeFile(__dirname+'/../stats.'+root.opt.file, JSON.stringify(stats, null, 2), function(err){});
		stats.gap = {};
	}, 1000 * 15);
	Object.keys = Object.keys || function(o){ return Gun.obj.map(o, function(v,k,t){t(k)}) }
});


var log = Gun.log, all = {}, max = 1000;
Gun.log = function(a,b,c,d){
	if('number' == typeof a && 'number' == typeof b && 'string' == typeof c){
		var tmp = (all[c] || (all[c] = []));
		if(max < tmp.push([a,b])){ all[c] = [] } // reset
		//return;
	}
	return log.apply(Gun, arguments);
}