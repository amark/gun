var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

function Store(opt){
	opt = opt || {};
	opt.file = String(opt.file || 'radata');
	var fs = require('fs'), u;
	var store = function Store(){};

	store.put = function(file, data, cb){
		var random = Math.random().toString(36).slice(-3);
		var tmp = opt.file+'-'+file+'-'+random+'.tmp';
		fs.writeFile(tmp, data, function(err, ok){
			if(err){ return cb(err) }
			move(tmp, opt.file+'/'+file, cb);
		});
	};
	store.get = function(file, cb){
		fs.readFile(opt.file+'/'+file, function(err, data){
			if(err){
				if('ENOENT' === (err.code||'').toUpperCase()){
					return cb(null);
				}
				Gun.log("ERROR:", err)
			}
			cb(err, data);
		});
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

function Mem(opt){
  opt = opt || {};
  opt.file = String(opt.file || 'radata');
  var storage = Mem.storage || (Mem.storage = {});
  var store = function Store(){}, u;
  store.put = function(file, data, cb){
  	setTimeout(function(){
      storage[file] = data;
      cb(null, 1);
    }, 1);
  };
  store.get = function(file, cb){
    setTimeout(function(){
      var tmp = storage[file] || u;
      cb(null, tmp);
    }, 1);
  };
  store.list = function(cb, match){ // supporting this is no longer needed! Optional.
    setTimeout(function(){
      Gun.obj.map(Object.keys(storage), cb) || cb();
    }, 1);
  };
  return store;
}

module.exports = Store;//Gun.TESTING? Mem : Store;
