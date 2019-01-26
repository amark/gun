;(function(){

	function Radisk(opt){

		opt = opt || {};
		opt.log = opt.log || console.log;
		opt.file = String(opt.file || 'radata');
		opt.pack = opt.pack || (opt.memory? (opt.memory * 1000 * 1000) : 1399000000) * 0.3; // max_old_space_size defaults to 1400 MB.
		opt.until = opt.until || opt.wait || 9;
		opt.batch = opt.batch || 10 * 1000;
		opt.chunk = opt.chunk || (1024 * 1024 * 10); // 10MB
		opt.code = opt.code || {};
		opt.code.from = opt.code.from || '!';

		function ename(t){ return encodeURIComponent(t).replace(/\*/g, '%2A') }
		var map = Gun.obj.map;

		if(!opt.store){
			return opt.log("ERROR: Radisk needs `opt.store` interface with `{get: fn, put: fn (, list: fn)}`!");
		}
		if(!opt.store.put){
			return opt.log("ERROR: Radisk needs `store.put` interface with `(file, data, cb)`!");
		}
		if(!opt.store.get){
			return opt.log("ERROR: Radisk needs `store.get` interface with `(file, cb)`!");
		}
		if(!opt.store.list){
			//opt.log("WARNING: `store.list` interface might be needed!");
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
					// if a node is requested and some of it is cached... the other parts might not be.
					return cb(u, val);
				}
				if(r.thrash.at){
					val = r.thrash.at(key);
					if(u !== val){
						// if a node is requested and some of it is cached... the other parts might not be.
						return cb(u, val);
					}
				}
				return r.read(key, cb);
			}
			r.batch(key, val);
			if(cb){ r.batch.acks.push(cb) }
			if(++r.batch.ed >= opt.batch){ return r.thrash() } // (2)
			clearTimeout(r.batch.to); // (1)
			r.batch.to = setTimeout(r.thrash, opt.until || 1);
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
				if(err){ opt.log('err', err) }
				map(batch.acks, function(cb){ cb(err, ok) });
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
				r.list(s.lex);
				return true;
			}
			s.lex = function(file){
				file = (u === file)? u : decodeURIComponent(file);
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
					disk = disk || Radix();
					Radix.map(rad, function(val, key){
						if(key < start){ return }
						if(end && end < key){ return s.start = key }
						// PLUGIN: consider adding HAM as an extra layer of protection
						disk(key, val); // merge batch[key] -> disk[key]
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
		r.write = function(file, rad, cb, force){
			var f = function Fractal(){};
			f.text = '';
			f.count = 0;
			f.file = file;
			f.each = function(val, key, k, pre){
				if(u !== val){ f.count++ }
				if(opt.pack <= (val||'').length){ return cb("Record too big!"), true }
				var enc = Radisk.encode(pre.length) +'#'+ Radisk.encode(k) + (u === val? '' : ':'+ Radisk.encode(val)) +'\n';
				if((opt.chunk < f.text.length + enc.length) && (1 < f.count) && !force){
					f.text = '';
					f.limit = Math.ceil(f.count/2);
					f.count = 0;
					f.sub = Radix();
					Radix.map(rad, f.slice)
					return true;
				}
				f.text += enc;
			}
			f.write = function(){
				var tmp = ename(file);
				opt.store.put(tmp, f.text, function(err){
					if(err){ return cb(err) }
					r.list.add(tmp, cb);
				});
			}
			f.slice = function(val, key){
				if(key < f.file){ return }
				if(f.limit < (++f.count)){
					var name = f.file;
					f.file = key;
					f.count = 0;
					r.write(name, f.sub, f.next, force);
					return true;
				}
				f.sub(key, val);
			}
			f.next = function(err){
				if(err){ return cb(err) }
				f.sub = Radix();
				if(!Radix.map(rad, f.slice)){
					r.write(f.file, f.sub, cb, force);
				}
			}
			if(!Radix.map(rad, f.each, true)){ f.write() }
		}

		;(function(){
			var Q = {};
			r.read = function(key, cb, next){
				if(RAD && !next){ // cache
					var val = RAD(key);
					if(u !== val){
						// if a node is requested and some of it is cached... the other parts might not be.
						return cb(u, val);
					}
				}
				var g = function Get(){}, tmp;
				g.lex = function(file){
					file = (u === file)? u : decodeURIComponent(file);
					if(!file || file > (next || key)){
						if(next){ g.file = file }
						if(tmp = Q[g.file]){
							tmp.push({key: key, ack: cb, file: g.file});
							return true;
						}
						Q[g.file] = [{key: key, ack: cb, file: g.file}];
						r.parse(g.file, g.it);
						return true;
					}
					g.file = file;
				}
				g.it = function(err, disk){
					if(g.err = err){ opt.log('err', err) }
					if(disk){ RAD = g.disk = disk }
					disk = Q[g.file]; delete Q[g.file];
					map(disk, g.ack);
				}
				g.ack = function(as){
					if(!as.ack){ return }
					var tmp = as.key, rad = g.disk || noop, data = rad(tmp), last = rad.last;
					if(data){ as.ack(g.err, data) }
					else if(!as.file){ return as.ack(g.err, u) }
					if(!last || last === tmp){ return as.ack(g.err, u) } // is this correct?
					if(last > tmp && 0 > last.indexOf(tmp)){ return as.ack(g.err, u) }
					r.read(tmp, as.ack, as.file);
				}
				r.list(g.lex);
			}
		}());

		;(function(){
			/*
				Let us start by assuming we are the only process that is
				changing the directory or bucket. Not because we do not want
				to be multi-process/machine, but because we want to experiment
				with how much performance and scale we can get out of only one.
				Then we can work on the harder problem of being multi-process.
			*/
			var Q = {}, s = String.fromCharCode(31);
			r.parse = function(file, cb){ var q;
				if(q = Q[file]){ return q.push(cb) } q = Q[file] = [cb];
				var p = function Parse(){};
				p.disk = Radix();
				p.read = function(err, data){ var tmp;
					delete Q[file];
					if((p.err = err) || (p.not = !data)){
						//return cb(err, u);//map(q, p.ack);
						return map(q, p.ack);
					}
					if(typeof data !== 'string'){
						try{
							if(opt.pack <= data.length){
								p.err = "Chunk too big!";
							} else {
								data = data.toString();
							}
						}catch(e){ p.err = e }
						if(p.err){ return map(q, p.ack) }
					}
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
						if('=' == tmp[0] || ':' == tmp[0]){ v = tmp[1] }
						if(u !== k && u !== v){ p.disk(pre.join(''), v) }
						tmp = p.split(tmp[2]);
					}
					//cb(err, p.disk);
					map(q, p.ack);
				};
				p.split = function(t){
					if(!t){ return }
					var l = [], o = {}, i = -1, a = '', b, c;
					i = t.indexOf(s);
					if(!t[i]){ return }
					a = t.slice(0, i);
					l[0] = a;
					l[1] = b = Radisk.decode(t.slice(i), o);
					l[2] = t.slice(i + o.i);
					return l;
				}
				p.ack = function(cb){ 
					if(!cb){ return }
					if(p.err || p.not){ return cb(p.err, u) }
					cb(u, p.disk);
				}
				opt.store.get(ename(file), p.read);
			}
		}());

		;(function(){
			var dir, q, f = String.fromCharCode(28), ef = ename(f);
			r.list = function(cb){
				if(dir){
					Radix.map(dir, function(val, key){
						return cb(key);
					}) || cb();
					return;
				}
				if(q){ return q.push(cb) } q = [cb];
				r.parse(f, r.list.init);
			}
			r.list.add = function(file, cb){
				var has = dir(file);
				if(has || file === ef){
					return cb(u, 1);
				}
				dir(file, true);
				r.write(f, dir, function(err, ok){
					if(err){ return cb(err) }
					cb(u, 1);
				}, true);
			}
			r.list.init = function(err, disk){
				if(err){
					opt.log('list', err);
					setTimeout(function(){ r.parse(f, r.list.init) }, 1000);
					return;
				}
				if(disk){
					r.list.drain(disk);
					return;
				}
				if(!opt.store.list){
					r.list.drain(Radix());
					return;
				}
				// import directory.
				opt.store.list(function(file){
					dir = dir || Radix();
					if(!file){ return r.list.drain(dir) }
					r.list.add(file, noop);
				});
			}
			r.list.drain = function(rad, tmp){
				r.list.dir = dir = rad;
				tmp = q; q = null;
				Gun.list.map(tmp, function(cb){
					Radix.map(dir, function(val, key){
						return cb(key);
					}) || cb();
				});
			}
		}());

		var noop = function(){}, RAD, u;
		return r;
	}



	;(function(){
		var _ = String.fromCharCode(31), u;
		Radisk.encode = function(d, o, s){ s = s || _;
			var t = s, tmp;
			if(typeof d == 'string'){
				var i = d.indexOf(s);
				while(i != -1){ t += s; i = d.indexOf(s, i+1) }
				return t + '"' + d + s;
			} else
			if(d && d['#'] && (tmp = Gun.val.link.is(d))){
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
		Radisk.decode = function(t, o, s){ s = s || _;
			var d = '', i = -1, n = 0, c, p;
			if(s !== t[0]){ return }
			while(s === t[++i]){ ++n }
			p = t[c = n] || true;
			while(--n >= 0){ i = t.indexOf(s, i+1) }
			if(i == -1){ i = t.length }
			d = t.slice(c+1, i);
			if(o){ o.i = i+1 }
			if('"' === p){
				return d;
			} else
			if('#' === p){
				return Gun.val.link.ify(d);
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

	if(typeof window !== "undefined"){
	  var Gun = window.Gun;
	  var Radix = window.Radix;
	  window.Radisk = Radisk;
	} else { 
	  var Gun = require('../gun');
		var Radix = require('./radix');
		try{ module.exports = Radisk }catch(e){}
	}

	Radisk.Radix = Radix;

}());