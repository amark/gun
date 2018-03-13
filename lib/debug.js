;(function(){
	if('debug' !== process.env.GUN_ENV){ return }

	console.log("start :)");
	global.DEBUG = 1;
	setInterval(function(){
		var mem = process.memoryUsage();
		var used = mem.heapUsed / 1024 / 1024;
		used = used.toFixed(1);
		console.log(used, 'MB');
	}, 1000);

}());