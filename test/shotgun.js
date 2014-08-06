var keys;
if(process.env.LIVE || (process.env.NODE_ENV === 'production')){
	// Keys are provided by environment configs on the server
	//process.env['redis-install'] = '/tmp';
} else {
	// Keys are hosted outside this folder, you must provide your own with environment variables.
	if((require('fs').existsSync||require('path').existsSync)(keys = __dirname + '/../../../linux/.ssh/keys-gun.js')){
		keys = require(keys);
	}
}

var Gun = require('../shots2');
var gun = Gun({
	peers: 'http://localhost:8888/gun'
	,s3: keys
});

module.exports = gun;