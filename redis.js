module.exports = {install: function(done){
	var fs = require('fs')
	, child = require('child_process')
	, check = (fs.existsSync||require('path').existsSync);
	if(!check('./redis-stable')){
		child.exec('curl -O http://download.redis.io/redis-stable.tar.gz'
		+ ' && ' + 'tar xvzf redis-stable.tar.gz'
		+ ' && ' + 'cd redis-stable'
		+ ' && ' + 'make'
		, function(e, r){
			console.log('>>>>>>>>>>>>>>>>>', e, r);
			done();
		});
	} else {
		done();
	}
}}