function Store(opt){
	opt = opt || {};
	opt.file = String(opt.file || 'radata');

	var Gun = require('../gun'), fs = require('fs'), u;
	var store = function Store(){};

	store.batch = [];
	store.counter = 0;//debug
	store.total = 0;//debug
	store.to;

	store.put = function(file, data, cb){
		var random = Math.random().toString(36).slice(-3)
		fs.writeFile(opt.file+'-'+random+'.tmp', data, function(err, ok){
			if(err){ return cb(err) }
			move(opt.file+'-'+random+'.tmp', opt.file+'/'+file, cb);
		});
	};

	store.get = function(file, cb){
		store.batch.push({f:file,cb:cb});
		console.log(`batch at ${store.batch.length}`);
		if(++store.batch.length >= opt.batch){ return store.read.bind(this,'batch') }
			clearTimeout(store.to);
			store.to = setTimeout(store.read.bind(this,'time'), 1000);
			cb(null);
	};

	store.read = function(caller){
		console.log(caller);
		console.log('called with: '+store.batch.length);
		if(store.batch.length>0){
		store.counter += store.batch.length;
		store.total++;
		console.log(`read start: ${store.counter},tot: ${store.total}`);
		var arr = store.batch;
		store.batch=[];
		var item = arr.shift();
		fs.readFile(opt.file+'/'+item.f, store.readDisk.bind(this,item,arr));
	}

	}

	store.readDisk = function(item,arr,err,data){
		if(arr.length>0){
			store.counter--;
			console.log('read finished: ', store.counter, store.total);
			if(err){
				if('ENOENT' === (err.code||'').toUpperCase()){
					return item.cb(null);
				}
				Gun.log("ERROR:", err)
			}
			if(data){ data = data.toString() }
			item.cb(err, data);
			var item = arr.shift();
			fs.readFile(opt.file+'/'+item.f, store.readDisk.bind(this,item,arr));
		} else {
			return;
		}
	};
	store.list = function(cb, match){
		fs.readdir(opt.file, function(err, dir){
			Gun.obj.map(dir, cb) || cb(); // Stream interface requires a final call to know when to be done.
		});
	};
	if(!fs.existsSync(opt.file)){ fs.mkdirSync(opt.file) }
	//store.list(function(){ return true });

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

	return store;
}

module.exports = Store;
