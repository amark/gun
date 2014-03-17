module.exports = {install: function(path, done){
	var fs = require('fs')
	, child = require('child_process')
	, check = (fs.existsSync||require('path').existsSync)
	, server = path + '/redis-stable/src/redis-server';
	if(!check(server)){
		child.exec('cd ' + path
		+ ' && ' + 'curl -O http://download.redis.io/redis-stable.tar.gz'
		+ ' && ' + 'tar xvzf redis-stable.tar.gz'
		+ ' && ' + 'cd redis-stable'
		+ ' && ' + 'make'
		, function(e, r){
			console.log('>>>>>>>>>>>>>>>>>', e, r);
			done(server);
		});
	} else {
		done(server);
	}
}}