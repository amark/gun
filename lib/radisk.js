var fs = require('fs');
var Gun = require('../gun');
var Radix = require('./radix');

function Radisk(opt){
	/*
		Any and all storage adapters should...
		1. If not busy, write to disk immediately.
		2. If busy, batch to disk. (Improves performance, reduces potential disk corruption)
		3. If a batch exceeds a certain number of writes, force atomic batch to disk. (This caps total performance, but reduces potential loss)
	*/
	var radisk = function(key, val, cb){
		if(0 <= key.indexOf('_') || 0 <= key.indexOf('$')){ // TODO: BUG! Fix!
			var err = "ERROR: Radix and Radisk not tested against _ or $ keys!";
			console.log(err);
			cb = cb || val;
			if(cb instanceof Function){ cb(err) }
			return;
		}
		if(val instanceof Function){
			cb = val;
			val = radisk.batch(key);
			if(u !== val){
				return cb(null, val);
			}
			if(radisk.was){
				val = radisk.was(key);
				if(u !== val){
					return cb(null, val);
				}
			}
			console.log("READ FROM DISK");
			return cb(null, val);
		}
		radisk.batch(key, val);
		if(cb){ radisk.batch.acks.push(cb) }
		if(!count++){ return thrash() } // (1)
		if(opt.batch <= count){ return thrash() } // (3)
		clearTimeout(to); // (2)
		to = setTimeout(thrash, opt.wait);
	};
	radisk.batch = Radix();
	radisk.batch.acks = [];
	var count = 0, wait, to, u;

	opt = opt || {};
	opt.file = String(opt.file || 'radata');
	opt.size = opt.size || (1024 * 1024 * 10); // 10MB
	opt.batch = opt.batch || 10 * 1000;
	opt.wait = opt.wait || 1;
	opt.nest = opt.nest || ' ';

	console.log("Warning: Radix storage engine has not been tested with all types of values and keys yet.");
  if(!fs.existsSync(opt.file)){ fs.mkdirSync(opt.file) }

	var thrash = function(){
		if(wait){ return }
		clearTimeout(to);
		wait = true;
		var was = radisk.was = radisk.batch;
		radisk.batch = null;
		radisk.batch = Radix();
		radisk.batch.acks = [];
		chunk(radisk.was, function(err, ok){
			radisk.was = null;
			wait = false;
			var tmp = count;
			count = 0;
			Gun.obj.map(was.acks, function(cb){cb(err, ok)});
			if(1 < tmp){ thrash() }
		});
	}

	/*
		1. Find the first radix item in memory.
		2. Use that as the starting index in the directory of files.
		3. Find the first file that is lexically larger than it,
		4. Read the previous file to that into memory
		5. Scan through the in memory radix for all values lexically less than the limit.
		6. Merge and write all of those to the in-memory file and back to disk.
		7. If file to large, split. More details needed here.
	*/
	function chunk(radix, cb){
		var step = {
			check: function(tree, key){
				if(key < step.start){ return }
				step.start = key;
				fs.readdir(opt.file, step.match);
				return true;
			},
			match: function(err, dir){
				step.dir = dir;
				if(!dir.length){
					step.file = '0';
					return step.merge(null, Radix());
				}
				Gun.obj.map(dir, step.lex);
				read(step.file, step.merge);
			},
			lex: function(file){
				if(file > step.start){
					return step.end = file;
				}
				step.file = file;
			},
			merge: function(err, disk){
				if(err){ return console.log("ERROR!!!", err) }
				step.disk = disk;
				Radix.map(radix, step.add);
				write(step.file, step.disk, step.done);
			},
			add: function(val, key){
				if(key < step.start){ return }
				if(step.end && step.end < key){ return step.next = key; }
				step.disk(key, val);
			},
			done: function(err){
				if(err){ console.log("ERROR!!!", err) }
				if(!step.next){
					return cb(err);
				}
				step.start = step.next;
				step.end = step.next = step.file = u;
				Radix.map(radix, step.check);
			}
		}
		Radix.map(radix, step.check);
	}

	var write = function(file, radix, cb){
		var step = {
			rest: "",
			count: 0,
			file: file,
			each: function(val, key, k, pre){
				step.count++;
				if(opt.size < step.rest.length){
					step.rest = "";
					step.limit = Math.ceil(step.count/2);
					step.count = 0;
					step.sub = Radix();
					Radix.map(radix, step.slice);
					return true;
				}
				var i = pre.length;
				while(i--){ step.rest += opt.nest };
				step.rest += k + (u === val? '' : '=' + val) + '\n';
			},
			dump: function(){
				var rest = step.rest;
				step.rest = "";
				fs.writeFile(opt.file +'/'+ file, rest, cb);
				if(opt.disk){ opt.disk(opt.file+'/'+file, rest, cb) }
			},
			slice: function(val, key){
				if(key < step.file){ return }
				if(step.limit < (++step.count)){
					var name = step.file;
					step.file = key;
					step.count = 0;
					write(name, step.sub, step.next);
					return true;
				}
				step.sub(key, val);
			},
			next: function(err){
				if(err){ console.log("ERR!!!!") }
				step.sub = Radix();
				if(!Radix.map(radix, step.slice)){
					write(step.file, step.sub, cb);
				}
			}
		};
		if(!Radix.map(radix, step.each, true)){ step.dump() }
	}

	var read = function(file, cb){
		var step = {
			nest: 0,
			rad: Radix(),
			data: function(err, data){
				if(err){ return console.log("ERROR READING FILE!", err) }
				step.pre = [];
				Gun.obj.map(data.toString().split('\n'), step.split); // TODO: Escape!
				cb(null, step.rad);
			},
			split: function(line){ var LINE = line;
				var nest = -1; while(opt.nest === line[++nest]){};
				if(nest){ line = line.slice(nest) }
				if(nest <= step.nest){ step.pre = step.pre.slice(0, nest - step.nest - 1) }
				line = line.split('='); step.pre.push(line[0]);
				if(1 < line.length){ step.rad(step.pre.join(''), line[1]) }
				step.nest = nest;
			}
		}
		fs.readFile(opt.file +'/'+ file, step.data);
	}

	radisk.read = read;

	return radisk;
}

module.exports = Radisk;