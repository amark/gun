function Store(opt){
	opt = opt || {};
	opt.log = opt.log || console.log;
	opt.file = String(opt.file || 'radata');
	var fs = require('fs'), u;
	var sha256 = require('./sha256');
	var store = function Store(){};
	if(Store[opt.file]){
		console.log("Warning: reusing same fs store and options as 1st.");
		return Store[opt.file];
	}

	if(!fs.existsSync(opt.file)){ fs.mkdirSync(opt.file) }

	const indexFile = opt.file+'/'+opt.file+'.idx'
	var logger = fs.createWriteStream(indexFile, {
		flags: 'a' // 'a' means appending (old data will be preserved)
	  })
	let  cleanupCalled =  false
	const cleanupIndex = (err)  =>  {
		if(cleanupCalled) return;
		cleanupCalled = true;
		logger.end(() => {
			process.exit()
		})
	}
	[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
		process.on(eventType, cleanupIndex);
	})
	var index = {}
	
	Store[opt.file] = store;
	var puts = {};

	// TODO!!! ADD ZLIB INFLATE / DEFLATE COMPRESSION!
	store.put = function(file, data, cb){
		puts[file] = data;
		var random = Math.random().toString(36).slice(-3);
		const hash = sha256.hash(file);
		var tmp = opt.file+'-'+hash+'-'+random+'.tmp';
		fs.writeFile(tmp, data, function(err, ok){
			delete puts[file];
			if(err){ return cb(err) }
			move(tmp, file,hash, cb);
		});
	};
	store.get = function(file, cb){ var tmp; // this took 3s+?
		if(tmp = puts[file]){ cb(u, tmp); return }
		const hash = sha256.hash(file);
		fs.readFile(opt.file+'/'+hash, function(err, data){
			if(err){
				if('ENOENT' === (err.code||'').toUpperCase()){
					return cb();
				}
				opt.log("ERROR:", err);
			}
			cb(err, data);
		});
	};


	function move(oldPath, file, hash, cb) {
		const newPath = opt.file+'/'+hash;
		if(!index[hash])
		{
			index[hash] = true;
			
			logger.write(file+'\n',function(err){
				if(err)
					cb(err)
			})
		}
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
		if(fs.existsSync(indexFile))
		{
			fs.readFileSync(indexFile,'utf8').split(/\r?\n/).forEach(fn => {
				//skip the empty line
				if(!fn) return;
				index[sha256.hash(fn)] = true
				cb(fn)
			});
		}
		cb();
	};
	
	return store;
}

var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');
Gun.on('create', function(root){
	this.to.next(root);
	var opt = root.opt;
	if(opt.rfs === false){ return }
	opt.store = opt.store || (!Gun.window && Store(opt));
});

module.exports = Store;