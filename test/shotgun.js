var keys;
if(process.env.LIVE || (process.env.NODE_ENV === 'production')){
	// Keys are provided by environment configs on the server
} else {
	// Keys are hosted outside this public repo folder, you must provide your own with environment variables.
	if((require('fs').existsSync||require('path').existsSync)(keys = __dirname + '/../../../linux/.ssh/keys-gun.js')){
		keys = require(keys);
	}
}

keys = keys || {};
keys.bucket = keys.bucket || 'gunjs.herokuapp.com';

module.exports = keys || {};