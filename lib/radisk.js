;(function(){

	function Radisk(opt){

		opt = opt || {};
		opt.log = opt.log || console.log;
		opt.file = String(opt.file || 'radata');
		var has = (Radisk.has || (Radisk.has = {}))[opt.file];
		if(has){ return has }

		opt.pack = opt.pack || (opt.memory? (opt.memory * 1000 * 1000) : 1399000000) * 0.3; // max_old_space_size defaults to 1400 MB.
		opt.until = opt.until || opt.wait || 250;
		opt.batch = opt.batch || (10 * 1000);
		opt.chunk = opt.chunk || (1024 * 1024 * 1); // 1MB
		opt.code = opt.code || {};
		opt.code.from = opt.code.from || '!';
		opt.jsonify = true;

		function ename(t){ return encodeURIComponent(t).replace(/\*/g, '%2A') }
		function atomic(v){ return u !== v && (!v || 'object' != typeof v) }
		var map = Gun.obj.map;
		var LOG = console.LOG;

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
				var o = cb || {};
				cb = val;
				var S; LOG && (S = +new Date);
				val = r.batch(key);
				LOG && opt.log(S, +new Date - S, 'rad mem');
				if(u !== val){
					cb(u, r.range(val, o), o);
					if(atomic(val)){ return }
					// if a node is requested and some of it is cached... the other parts might not be.
				}
				if(r.thrash.at){
					val = r.thrash.at(key);
					if(u !== val){
						cb(u, r.range(val, o), o);
						if(atomic(val)){ cb(u, val, o); return }
						// if a node is requested and some of it is cached... the other parts might not be.
					}
				}
				return r.read(key, cb, o);
			}
			r.batch(key, val);
			if(cb){ r.batch.acks.push(cb) }
			if(++r.batch.ed >= opt.batch){ return r.thrash() } // (2)
			if(r.batch.to){ return }
			//clearTimeout(r.batch.to); // (1) // THIS LINE IS EVIL! NEVER USE IT! ALSO NEVER DELETE THIS SO WE NEVER MAKE THE SAME MISTAKE AGAIN!
			r.batch.to = setTimeout(r.thrash, opt.until || 1);
		}

		r.batch = Radix();
		r.batch.acks = [];
		r.batch.ed = 0;

		r.thrash = function(){
			var thrash = r.thrash;
			if(thrash.ing){ return thrash.more = true }
			LOG = console.LOG; // dirty place to cheaply update LOG settings over time.
			thrash.more = false;
			thrash.ing = true;
			var batch = thrash.at = r.batch, i = 0;
			clearTimeout(r.batch.to);
			r.batch = null;
			r.batch = Radix();
			r.batch.acks = [];
			r.batch.ed = 0;
			//console.debug(99); var ID = Gun.text.random(2), S = (+new Date); console.log("[[[[[[[[", ID, batch.acks.length);
			r.save(batch, function(err, ok){
				if(++i > 1){ opt.log('RAD ERR: Radisk has callbacked multiple times, please report this as a BUG at github.com/amark/gun/issues ! ' + i); return }
				if(err){ opt.log('err', err) }
				//console.debug(99); var TMP; console.log("]]]]]]]]", ID, batch.acks.length, (TMP = +new Date) - S, 'more?', thrash.more);
				map(batch.acks, function(cb){ cb(err, ok) });
				//console.log("][", +new Date - TMP, thrash.more);
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
			7. If file too large, split. More details needed here.
		*/
		/* NEW APPROACH:
			1. For each item in radix memory
			2. Add it to a radix bucket corresponding to directory of files
			3. Iterate over each bucket
			4. Resume old approach.
		*/
		r.save = function(rad, cb){
			if(r.save.ing){
				r.save.ing.push({rad: rad, ack: cb});
				return;
			}
			//console.only(99); var ID = Gun.text.random(2), S = (+new Date); console.log("[[[[[[[[", ID);
			r.save.ing = [];
			var ack = cb;
			var s = function Span(err, ok){
				var tmp = r.save.ing;
				//console.only(99); var TMP; console.log("]]]]]]]]", ID, (TMP = +new Date) - S, 'more?', !!tmp);
				r.save.ing = null;
				map(tmp, function(q){ // if many, not the most efficient to requeue, but works for now.
					if(!q || !q.rad || !q.ack){ return }
					r.save(q.rad, q.ack);
				})
				ack(err, ok);
			};
			cb = s;
			s.files = {};
			s.i = 0; // TODO: revise? Using counter for critical path not my favorite.
			s.place = function(tree, key){
				var go = function(file, last){
					file = decodeURIComponent(file || last || opt.code.from);
					(s.files[file] || (s.files[file] = Radix()))(key, tree);
					if(!(--s.i)){ s.go() } // TODO: See above, revise?
					return true;
				}
				go.reverse = 1;
				go.end = key;
				r.list(go);
				++s.i; // TODO: See above, revise?
			}
			s.go = function(){
				if(s.gone){ return } s.gone = true;
				s.seq = [];
				map(s.files, function(mem, file){ s.seq.push({file: file, mem: mem}) });
				s.files = null;
				s.c = 0;
				s.merge(s.c);
			}
			s.merge = function(i){
				i = i || 0;
				//var at = s.seq[i];
				var at = s.seq.shift();
				if(!at){
					if(s.ok){ return cb(null, s.ok) }
					return cb("No file to save data to.");
				}
				var file = at.file, mem = at.mem;
				r.parse(file, function(err, disk){
					if(err){ return cb(err) }
					if(!disk && file !== opt.code.from){ // corrupt file?
						r.list.bad(file); // remove from dir list
						r.save(rad, cb); // try again
						return;
					}
					disk = disk || Radix();
					Radix.map(mem, function(val, key){
						// PLUGIN: consider adding HAM as an extra layer of protection
						disk(key, val); // merge batch[key] -> disk[key]
					});
					r.write(file, disk, s.pop);
				})
			}
			s.pop = function(err, ok){
				if(s.err = err || s.err){ return cb(err) }
				s.ok = ok || s.ok || 1;
				s.merge(++s.c);
			}
			Radix.map(rad, s.place);
			if(!s.i){ s.go() }; // TODO: See above, revise?
		}

		/*
			Any storage engine at some point will have to do a read in order to write.
			This is true of even systems that use an append only log, if they support updates.
			Therefore it is unavoidable that a read will have to happen,
			the question is just how long you delay it.
		*/
		r.write = function(file, rad, cb, o){
			o = ('object' == typeof o)? o : {force: o};
			var f = function Fractal(){};
			f.text = '';
			f.count = 0;
			f.file = file;
			f.each = function(val, key, k, pre){
				//console.log("RAD:::", JSON.stringify([val, key, k, pre]));
				if(u !== val){ f.count++ }
				if(opt.pack <= (val||'').length){ return cb("Record too big!"), true }
				var enc = Radisk.encode(pre.length) +'#'+ Radisk.encode(k) + (u === val? '' : ':'+ Radisk.encode(val)) +'\n';
				if((opt.chunk < f.text.length + enc.length) && (1 < f.count) && !o.force){
					f.text = '';
					f.limit = Math.ceil(f.count/2);
					f.count = 0;
					f.sub = Radix();
					// IMPORTANT: DO THIS IN REVERSE, SO LAST HALF OF DATA MOVED TO NEW FILE BEFORE DROPPING FROM CURRENT FILE.
					Radix.map(rad, f.slice, {reverse: true});
					return true;
				}
				f.text += enc;
			}
			f.write = function(){
				var tmp = ename(file);
				var S; LOG && (S = +new Date);
				r.list.add(tmp, function(err){
					LOG && opt.log(S, +new Date - S, "wrote disk", tmp);
					if(err){ return cb(err) }
					opt.store.put(tmp, f.text, cb);
				});
			}
			f.slice = function(val, key){
				f.sub(f.end = key, val);
				if(f.limit <= (++f.count)){
					r.write(key, f.sub, f.swap, o);
					return true;
				}
			}
			f.swap = function(err){
				if(err){ return cb(err) }
				f.sub = Radix();
				Radix.map(rad, f.stop);
				r.write(f.file, f.sub, cb, o);
			}
			f.stop = function(val, key){
				if(key >= f.end){ return true }
				f.sub(key, val);
			}
			if(opt.jsonify){ return r.write.jsonify(f, file, rad, cb, o) } // temporary testing idea
			if(!Radix.map(rad, f.each, true)){ f.write() }
		}

		r.write.jsonify = function(f, file, rad, cb, o){
			var raw;
			var S; LOG && (S = +new Date);
			try{raw = JSON.stringify(rad.$);
			}catch(e){ return cb("Record too big!") }
			LOG && opt.log(S, +new Date - S, "rad stringified JSON");
			if(opt.chunk < raw.length && !o.force){
				if(Radix.map(rad, f.each, true)){ return }
			}
			f.text = raw;
			f.write();
		}

		r.range = function(tree, o){
			if(!tree || !o){ return }
			if(u === o.start && u === o.end){ return tree }
			if(atomic(tree)){ return tree }
			var sub = Radix();
			Radix.map(tree, function(v,k){
				sub(k,v);
			}, o);
			return sub('');
		}

		;(function(){
			var Q = {};
			r.read = function(key, cb, o){
				o = o || {};
				if(RAD && !o.next){ // cache
					var S; LOG && (S = +new Date);
					var val = RAD(key);
					LOG && opt.log(S, +new Date - S, 'rad cached');
					//if(u !== val){
						//cb(u, val, o);
						if(atomic(val)){ cb(u, val, o); return }
						// if a node is requested and some of it is cached... the other parts might not be.
					//}
				}
				o.span = (u !== o.start) || (u !== o.end); // is there a start or end?
				var g = function Get(){};
				g.lex = function(file){ var tmp;  // // TODO: this had a out-of-memory crash!
					file = (u === file)? u : decodeURIComponent(file);
					tmp = o.next || key || (o.reverse? o.end || '\uffff' : o.start || '');
					if(!file || (o.reverse? file < tmp : file > tmp)){
						LOG && opt.log(S, +new Date - S, 'rad read lex'); S = +new Date;
						if(o.next || o.reverse){ g.file = file }
						if(tmp = Q[g.file]){
							tmp.push({key: key, ack: cb, file: g.file, opt: o});
							return true;
						}
						Q[g.file] = [{key: key, ack: cb, file: g.file, opt: o}];
						if(!g.file){
							g.it(null, u, {});
							return true;
						}
						r.parse(g.file, g.check);
						return true;
					}
					g.file = file;
				}
				g.it = function(err, disk, info){
					if(g.err = err){ opt.log('err', err) }
					if(!disk && g.file){ // corrupt file?
						r.list.bad(g.file); // remove from dir list
						r.read(key, cb, o); // look again
						return;
					}
					g.info = info;
					if(disk){ RAD = g.disk = disk }
					disk = Q[g.file]; delete Q[g.file];
					LOG && opt.log(S, +new Date - S, 'rad read in, ack', disk.length); S = +new Date;
					var STMP = disk.length; // TMP STATS! DELETE!
					map(disk, g.ack);
					LOG && opt.log(S, +new Date - S, 'rad read acked', STMP, JSON.stringify(g.file));
				}
				g.ack = function(as){
					if(!as.ack){ return }
					var key = as.key, o = as.opt, info = g.info, rad = g.disk || noop, data = r.range(rad(key), o), last = rad.last || Radix.map(rad, rev, revo);
					o.parsed = (o.parsed || 0) + (info.parsed||0);
					o.chunks = (o.chunks || 0) + 1;
					o.more = true;
					if((!as.file) // if no more places to look
					|| (!o.span && last === key) // if our key exactly matches the very last atomic record
					|| (!o.span && last && last > key && 0 != last.indexOf(key)) // 'zach' may be lexically larger than 'za', but there still might be more, like 'zane' in the 'za' prefix bucket so do not end here.
					){
						o.more = u;
						as.ack(g.err, data, o);
						return
					}
					if(u !== data){
						var S = +new Date;
						as.ack(g.err, data, o); // more might be coming!
						LOG && opt.log(S, +new Date - S, 'rad range ack.'); // 1.4s
						if(o.parsed >= o.limit){ return } // even if more, we've hit our limit, asking peer will need to make a new ask with a new starting point.
					}
					o.next = as.file;
					r.read(key, as.ack, o);
				}
				g.check = function(err, disk, info){
					g.it(err, disk, info);
					var good = true;
					Radix.map(disk, function(val, key){
						// assume in memory for now, since both write/read already call r.list which will init it.
						var go = function(file){
							if(info.file !== file){
								good = false
							}
							return true;
						}
						go.reverse = 1;
						go.end = key;
						r.list(go);
					});
					if(good){ return }
					var id = Gun.text.random(3); opt.log("MISLOCATED DATA", id);
					r.save(disk, function ack(err, ok){
						if(err){ return r.save(disk, ack) } // ad infinitum???
						opt.log("MISLOCATED CORRECTED", id);
					});
				}
				/*g.check2 = function(err, disk, info){
					if(err || !disk){ return g.it(err, disk, info) }
					var good = true;
					Radix.map(disk, function(val, key){
						// assume in memory for now, since both write/read already call r.list which will init it.
						var go = function(file){
							if(info.file !== file){ good = false }
							return true;
						}
						go.reverse = 1;
						go.end = key;
						r.list(go);
					});
					if(good){ return g.it(err, disk, info) }
					var id = Gun.text.random(3); console.log("MISLOCATED DATA", id);
					r.save(disk, function ack(err, ok){
						if(err){ return r.save(disk, ack) } // ad infinitum???
						console.log("MISLOCATED CORRECTED", id);
						r.read(key, cb, o);
					});
				}*/
				if(o.reverse){ g.lex.reverse = true }
				LOG && (S = +new Date);
				r.list(g.lex);
			}
			function rev(a,b){ return b }
			var revo = {reverse: true};
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
			r.parse = function(file, cb, raw){ var q;
				if(q = Q[file]){ return q.push(cb) } q = Q[file] = [cb];
				var p = function Parse(){}, info = {file: ename(file)};
				p.disk = Radix();
				p.read = function(err, data){ var tmp;
					LOG && opt.log(S, +new Date - S, 'read disk', ename(file));
					delete Q[file];
					if((p.err = err) || (p.not = !data)){
						return map(q, p.ack);
					}
					if(typeof data !== 'string'){
						try{
							if(opt.pack <= data.length){
								p.err = "Chunk too big!";
							} else {
								data = data.toString(); // If it crashes, it crashes here. How!?? We check size first!
							}
						}catch(e){ p.err = e }
						if(p.err){ return map(q, p.ack) }
					}
					info.parsed = data.length;

					LOG && (S = +new Date);
					if(opt.jsonify || '{' === data[0]){ // temporary testing idea
						try{
							var json = JSON.parse(data); // TODO: this caused a out-of-memory crash!
							p.disk.$ = json;
							LOG && opt.log(S, +new Date - S, 'rad parsed JSON');
							map(q, p.ack);
							return;
						}catch(e){ tmp = e }
						if('{' === data[0]){
							p.err = tmp || "JSON error!";
							return map(q, p.ack);
						}
					}
					LOG && (S = +new Date);
					var tmp = p.split(data), pre = [], i, k, v;
					if(!tmp || 0 !== tmp[1]){
						p.err = "File '"+file+"' does not have root radix! ";
						return map(q, p.ack);
					}
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
					LOG && opt.log(S, +new Date - S, 'parsed RAD');
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
					if(p.err || p.not){ return cb(p.err, u, info) }
					cb(u, p.disk, info);
				}
				var S; LOG && (S = +new Date);
				if(raw){ return p.read(null, raw) }
				opt.store.get(ename(file), p.read);
			}
		}());

		;(function(){
			var dir, q, f = String.fromCharCode(28), ef = ename(f);
			r.list = function(cb){
				if(dir){
					var last, tmp = {reverse: (cb.reverse)? 1 : 0, start: cb.start, end: cb.end};
					Radix.map(dir, function(val, key){
						if(!val){ return }
						return cb(last = key);
					}, tmp) || cb(u, last);
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
				dir(file, 1);
				cb.listed = (cb.listed || 0) + 1;
				r.write(f, dir, function(err, ok){
					if(err){ return cb(err) }
					cb.listed = (cb.listed || 0) - 1;
					if(cb.listed !== 0){ return }
					cb(u, 1);
				}, true);
			}
			r.list.bad = function(file, cb){
				dir(ename(file), 0);
				r.write(f, dir, cb||noop);
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
					r.list(cb);
				});
			}
		}());

		var noop = function(){}, RAD, u;
		Radisk.has[opt.file] = r;
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
		//var Radix = require('./radix2'); Radisk = require('./radisk2');
		try{ module.exports = Radisk }catch(e){}
	}

	Radisk.Radix = Radix;

}());
