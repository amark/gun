function Store(opt){
	opt = opt || {};
	opt.file = String(opt.file || 'radata');

	var Gun = require('../gun'), fs = require('fs'), u;
	var store = function Store(){};

	store.batch = new Array();
	store.to;

	store.put = function(file, data, cb){
		var random = Math.random().toString(36).slice(-3)
		fs.writeFile(opt.file+'-'+random+'.tmp', data, function(err, ok){
			if(err){ return cb(err) }
			move(opt.file+'-'+random+'.tmp', opt.file+'/'+file, cb);
		});
	};

	store.get = function(file, cb){
		var item = {f:file,c:cb};
		store.batch.push(item);
		if(store.batch.length >= opt.batch){ return store.read() }
		clearTimeout(store.to);
		store.to = setTimeout(store.read);
		return cb(null);//revisit
	};

	store.read = function(){
		if(store.batch.length>0){
			var arr = store.batch;
			store.batch = new Array();
			var item = arr.shift();
			fs.readFile(opt.file+'/'+item.f, store.readDisk.bind(this,item,arr));
		}
	}

	store.readDisk = function(item,arr,err,data){
		if(arr.length>0){
			store.counter--;
			if(err){
				if('ENOENT' === (err.code||'').toUpperCase()){
					return item.c(null);
				}
				Gun.log("ERROR:", err)
			}
			if(data){ data = data.toString() }
			item.c(err, data);
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
