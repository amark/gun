var fs = require('fs');
var Gun = require('../gun');
var Radix = require('./radix');

function Radisk(opt){

	opt = opt || {};
	opt.file = String(opt.file || 'radata');
	opt.thrash = opt.thrash || opt.wait || 1;
	opt.batch = opt.batch || 10 * 1000;
	opt.size = opt.size || (1024 * 1024 * 10); // 10MB
	opt.code = opt.code || {};
	opt.code.from = opt.code.from || '!';

	if(!opt.store){
		return Gun.log("ERROR: Radisk needs `opt.store` interface with `{get: fn, put: fn, list: fn}`!");
	}
	if(!opt.store.put){
		return Gun.log("ERROR: Radisk needs `store.put` interface with `(file, data, cb)`!");
	}
	if(!opt.store.get){
		return Gun.log("ERROR: Radisk needs `store.get` interface with `(file, cb)`!");
	}
	if(!opt.store.list){
		return Gun.log("ERROR: Radisk needs a streaming `store.list` interface with `(cb)`!");
	}

	/*
		Any and all storage adapters should...
		1. Because writing to disk takes time, we should batch data to disk. This improves performance, and reduces potential disk corruption.
		2. If a batch exceeds a certain number of writes, we should immediately write to disk when physically possible. This caps total performance, but reduces potential loss.
	*/
	var r = function(key, val, cb){
		key = ''+key;
		if(val instanceof Function){
			cb = val;
			val = r.batch(key);
			if(u !== val){
				return cb(u, val);
			}
			if(r.thrash.at){
				val = r.thrash.at(key);
				if(u !== val){
					return cb(u, val);
				}
			}
			//console.log("READ FROM DISK");
			return r.read(key, cb);
		}
		r.batch(key, val);
		if(cb){ r.batch.acks.push(cb) }
		if(++r.batch.ed >= opt.batch){ return r.thrash() } // (2)
		clearTimeout(r.batch.to); // (1)
		r.batch.to = setTimeout(r.thrash, opt.thrash || 1);
	}

	r.batch = Radix();
	r.batch.acks = [];
	r.batch.ed = 0;

	r.thrash = function(){
		var thrash = r.thrash;
		if(thrash.ing){ return thrash.more = true }
		thrash.more = false;
		thrash.ing = true;
		var batch = thrash.at = r.batch, i = 0;
		clearTimeout(r.batch.to);
		r.batch = null;
		r.batch = Radix();
		r.batch.acks = [];
		r.batch.ed = 0;
		r.save(batch, function(err, ok){
			if(++i > 1){ return }
			if(err){ Gun.log(err) }
			Gun.obj.map(batch.acks, function(cb){ cb(err, ok) });
			thrash.at = null;
			thrash.ing = false;
			if(thrash.more){ thrash() }
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
	r.save = function(rad, cb){
		var s = function Span(){};
		s.find = function(tree, key){
			if(key < s.start){ return }
			s.start = key;
			opt.store.list(s.lex);
			return true;
		}
		s.lex = function(file){
			if(!file || file > s.start){
				s.mix(s.file || opt.code.from, s.start, s.end = file);
				return true;
			}
			s.file = file;
		}
		s.mix = function(file, start, end){
			s.start = s.end = s.file = u;
			r.parse(file, function(err, disk){
				if(err){ return cb(err) }
				Radix.map(rad, function(val, key){
					if(key < start){ return }
					if(end && end < key){ return s.start = key }
					disk(key, val);
				});
				r.write(file, disk, s.next);
			});
		}
		s.next = function(err, ok){
			if(s.err = err){ return cb(err) }
			if(s.start){ return Radix.map(rad, s.find) }
			cb(err, ok);
		}
		Radix.map(rad, s.find);
	}

	/*
		Any storage engine at some point will have to do a read in order to write.
		This is true of even systems that use an append only log, if they support updates.
		Therefore it is unavoidable that a read will have to happen,
		the question is just how long you delay it.
	*/
	r.write = function(file, rad, cb){
		var f = function Fractal(){};
		f.text = '';
		f.count = 0;
		f.file = file;
		f.each = function(val, key, k, pre){
			f.count++;
			var enc = Radisk.encode(pre.length) +'#'+ Radisk.encode(k) + (u === val? '' : '='+ Radisk.encode(val)) +'\n';
			if(opt.size < f.text.length + enc.length){
				f.text = '';
				f.limit = Math.ceil(f.count/2);
				f.count = 0;
				f.sub = Radix();
				Radix.map(rad, f.slice);
				return true;
			}
			f.text += enc;
		}
		f.write = function(){ opt.store.put(file, f.text, cb) }
		f.slice = function(val, key){
			if(key < f.file){ return }
			if(f.limit < (++f.count)){
				var name = f.file;
				f.file = key;
				f.count = 0;
				r.write(name, f.sub, f.next);
				return true;
			}
			f.sub(key, val);
		}
		f.next = function(err){
			if(err){ return cb(err) }
			f.sub = Radix();
			if(!Radix.map(rad, f.slice)){
				r.write(f.file, f.sub, cb);
			}
		}
		if(!Radix.map(rad, f.each, true)){ f.write() }
	}

	r.read = function(key, cb){
		// TODO: BUG!!! If a node spans multiple file chunks, it won't return all!
		// TODO: BUG!!! If a node spans multiple file chunks, it won't return all!
		// TODO: BUG!!! If a node spans multiple file chunks, it won't return all!
		// TODO: BUG!!! If a node spans multiple file chunks, it won't return all!
		// TODO: BUG!!! If a node spans multiple file chunks, it won't return all!
		// TODO: BUG!!! If a node spans multiple file chunks, it won't return all!
		// TODO: BUG!!! If a node spans multiple file chunks, it won't return all!
		if(RAD){ // cache
			var val = RAD(key);
			if(u !== val){
				return cb(u, val);
			}
		}
		var g = function Get(){}, tmp;
		g.lex = function(file){
			if(!file || file > key){
				if(tmp = q[g.file]){
					tmp.push({key: key, ack: cb});
					return true;
				}
				q[g.file] = [{key: key, ack: cb}];
				r.parse(g.file, g.it);
				return true;
			}
			g.file = file;
		}
		g.it = function(err, disk){
			if(g.err = err){ Gun.log(err) }
			if(disk){ RAD = disk }
			disk = q[g.file]; Gun.obj.del(q, g.file);
			Gun.obj.map(disk, g.ack);
		}
		g.ack = function(as){
			if(!as.ack){ return }
			as.ack(g.err, RAD(as.key));
		}
		opt.store.list(g.lex);
	}
	/*
		Let us start by assuming we are the only process that is
		changing the directory or bucket. Not because we do not want
		to be multi-process/machine, but because we want to experiment
		with how much performance and scale we can get out of only one.
		Then we can work on the harder problem of being multi-process.
	*/
	r.parse = function(file, cb){
		var p = function Parse(){}, s = String.fromCharCode(31);
		p.disk = Radix();
		p.read = function(err, data){ var tmp;
			if(err){ return cb(err) }
			if(!data){ return cb(u, p.disk) }
			var tmp = p.split(data), pre = [], i, k, v;
			while(tmp){
				k = v = u;
				i = tmp[1];
				tmp = p.split(tmp[2])||'';
				if('#' == tmp[0]){
					k = tmp[1];
					pre = pre.slice(0,i);
					if(i <= pre.length){
						pre.push(k);
					}
				}
				tmp = p.split(tmp[2])||'';
				if('\n' == tmp[0]){ continue }
				if('=' == tmp[0]){ v = tmp[1] }
				if(u !== k && u !== v){ p.disk(pre.join(''), v) }
				tmp = p.split(tmp[2]);
			}
			cb(u, p.disk);
		};
		p.split = function(t){
			if(!t){ return }
			var l = [], o = {}, i = -1, a = '', b, c;
			while(c = t[++i]){
				if(s === c){ break }
				a += c;
			}
			if(!c){ return }
			l[0] = a;
			l[1] = b = Radisk.decode(t.slice(i), o);
			l[2] = t.slice(i + o.i);
			return l;
		}
		opt.store.get(file, p.read);
	}

	var q = {}, RAD, u;
	return r;
}


;(function(){
	s = String.fromCharCode(31);
	Radisk.encode = function(d, o){
		var t = s, tmp;
		if(typeof d == 'string'){
			var i = -1, c;
			while(c = d[++i]){
				if(s === c){
					t += s;
				}
			}
			return t + '"' + d + s;
		} else
		if(d && d['#'] && (tmp = Gun.val.rel.is(d))){
			return t + '#' + tmp + t;
		} else
		if(Gun.num.is(d)){
			return t + '+' + (d||0) + t;
		} else
		if(null === d){
			return t + ' ' + t;
		} else
		if(true === d){
			return t + '+' + t;
		} else
		if(false === d){
			return t + '-' + t;
		}// else
		//if(binary){}
	}
	Radisk.decode = function(t, o){
		var d = '', i = -1, n = 0, c, p;
		if(s !== t[0]){ return }
		while(c = t[++i]){
			if(p){
				if(s === c){
					if(--n <= 0){
						break;	
					}
				}
				d += c;
			} else
			if(s === c){
				++n;
			} else {
				p = c || true;
			}
		}
		if(o){ o.i = i+1 }
		if('"' === p){
			return d;
		} else
		if('#' === p){
			return Gun.val.rel.ify(d);
		} else
		if('+' === p){
			if(0 === d.length){
				return true;
			}
			return parseFloat(d);
		} else
		if(' ' === p){
			return null;
		} else
		if('-' === p){
			return false;
		}
	}
}());

Radisk.Radix = Radix;

module.exports = Radisk;