function Store(opt){
	opt = opt || {};
	opt.log = opt.log || console.log;
	opt.file = String(opt.file || 'radata');
	var fs = require('fs'), u;

	var store = function Store(){};
	if(Store[opt.file]){
		console.log("Warning: reusing same fs store and options as 1st.");
		return Store[opt.file];
	}
	Store[opt.file] = store;
	var puts = {};

	// TODO!!! ADD ZLIB INFLATE / DEFLATE COMPRESSION!
	store.put = function(file, data, cb){
		puts[file] = data;
		var random = Math.random().toString(36).slice(-3);
		var tmp = opt.file+'-'+file+'-'+random+'.tmp';
		fs.writeFile(tmp, data, function(err, ok){
			delete puts[file];
			if(err){ return cb(err) }
			move(tmp, opt.file+'/'+file, cb);
		});
	};
	store.get = function(file, cb){ var tmp; // this took 3s+?
		if(tmp = puts[file]){ cb(u, tmp); return }
		fs.readFile(opt.file+'/'+file, function(err, data){
			if(err){
				if('ENOENT' === (err.code||'').toUpperCase()){
					return cb();
				}
				opt.log("ERROR:", err);
			}
			cb(err, data);
		});
	};

	if(!fs.existsSync(opt.file)){ fs.mkdirSync(opt.file) }

	function move(oldPath, newPath, cb) {
		fs.rename(oldPath, newPath, function (err) {
			if (err) {
				if (err.code === 'EXDEV') {
					var readStream = fs.createReadStream(oldPath);
					var writeStream = fs.createWriteStream(newPath);

					readStream.on('error', cb);
					writeStream.on('error', cb);

					readStream.on('close', function () {
						fs.unlink(oldPath, cb);
					});

					readStream.pipe(writeStream);
				} else {
					cb(err);
				}
			} else {
				cb();
			}
		});
	};

	store.list = function(cb, match, params, cbs){
		var dir = fs.readdirSync(opt.file);
		dir.forEach(function(file){
			cb(file);
		})
		cb();
	};
	
	return store;
}

module.exports = Store;