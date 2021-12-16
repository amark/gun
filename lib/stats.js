var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

Gun.on('opt', function(root){
	this.to.next(root);
	if(root.once){ return }
	if(typeof process === 'undefined'){ return }
	if(typeof require === 'undefined'){ return }
	if(false === root.opt.stats){ return }
	var path = require('path') || {};
	var file = root.opt.file ? path.resolve(root.opt.file).split(path.sep).slice(-1)[0] : 'radata';
	var noop = function(){};
	var os = require('os') || {};
	var fs = require('fs') || {};
	fs.existsSync = fs.existsSync || path.existsSync;
	if(!fs.existsSync){ return }
	if(!process){ return }
	process.uptime = process.uptime || noop;
	process.cpuUsage = process.cpuUsage || noop;
	process.memoryUsage = process.memoryUsage || noop;
	os.totalmem = os.totalmem || noop;
	os.freemem = os.freemem || noop;
	os.loadavg = os.loadavg || noop;
	os.cpus = os.cpus || noop;
	var S = +new Date, W;
	var obj_ify = function(o){try{o = JSON.parse(o)}catch(e){o={}};return o;}
	setTimeout(function(){
		root.stats = obj_ify((fs.existsSync(__dirname+'/../stats.'+file) && fs.readFileSync(__dirname+'/../stats.'+file).toString())) || {};
		root.stats.up = root.stats.up || {};
		root.stats.up.start = root.stats.up.start || +(new Date);
		root.stats.up.count = (root.stats.up.count || 0) + 1;
		root.stats.stay = root.stats.stay || {};
		root.stats.over = +new Date;
	},1);
	setInterval(function(){
		if(!root.stats){ root.stats = {} }
		if(W){ return }
		var stats = root.stats, tmp;
		stats.over = -(S - (S = +new Date));
		(stats.up||{}).time = process.uptime();
		stats.memory = process.memoryUsage() || {};
		stats.memory.totalmem = os.totalmem();
		stats.memory.freemem = os.freemem();
		stats.cpu = process.cpuUsage() || {};
		stats.cpu.loadavg = os.loadavg();
		stats.cpu.stack = (((setTimeout||'').turn||'').s||'').length;
		stats.peers = {};

		stats.peers.count = console.STAT.peers || Object.keys(root.opt.peers||{}).length; // TODO: .keys( is slow
		stats.node = {};
		stats.node.count = Object.keys(root.graph||{}).length; // TODO: .keys( is slow
		stats.all = all;
		stats.sites = console.STAT.sites;
		all = {}; // will this cause missing stats?
		var dam = root.opt.mesh;
		if(dam){
			stats.dam = {'in': {count: dam.hear.c, done: dam.hear.d}, 'out': {count: dam.say.c, done: dam.say.d}};
			dam.hear.c = dam.hear.d = dam.say.c = dam.say.d = 0; // reset
			stats.peers.time = dam.bye.time || 0;
		}
		var rad = root.opt.store; rad = rad && rad.stats;
		if(rad){
			stats.rad = rad;
			root.opt.store.stats = {get:{time:{}, count:0}, put: {time:{}, count:0}}; // reset
		}
		JSON.stringifyAsync(stats, function(err, raw){ if(err){ return } W = true;
			fs.writeFile(__dirname+'/../stats.'+file, raw, function(err){ W = false; err && console.log(console.STAT.err = err); console.STAT && console.STAT(S, +new Date - S, 'stats stash') });
		});

		//exec("top -b -n 1", function(err, out){ out && fs.writeFile(__dirname+'/../stats.top.'+file, out, noop) }); // was it really seriously actually this?
	//}, 1000 * 15);
	}, 1000 * 5);
});

var exec = require("child_process").exec, noop = function(){};
require('./ison');

var log = Gun.log, all = {}, max = 1000;
Gun.log = console.STAT = function(a,b,c,d){
	if('number' == typeof a && 'number' == typeof b && 'string' == typeof c){
		var tmp = (all[c] || (all[c] = []));
		if(max < tmp.push([a,b])){ all[c] = [] } // reset
		//return;
	}
	if(!console.LOG || log.off){ return a }
	return log.apply(Gun, arguments);
}
Gun.log.once = function(w,s,o){ return (o = Gun.log.once)[w] = o[w] || 0, o[w]++ || Gun.log(s) };
