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
		var ST = 0;

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
		var r = function(key, data, cb){
			if('function' === typeof data){
				var o = cb || {};
				cb = data;
				r.read(key, cb);
				return;
			}
			//var tmp = (tmp = r.batch = r.batch || {})[key] = tmp[key] || {};
			//var tmp = (tmp = r.batch = r.batch || {})[key] = data;
			r.save(key, data, cb);
		}
		r.save = function(key, data, cb){
			var s = {key: key};
			s.find = function(file){ var tmp;
				s.file = file || (file = opt.code.from);
				if(tmp = r.disk[file]){ s.mix(u, tmp); return }
				r.parse(file, s.mix);
			}
			s.mix = function(err, disk){
				if(err){ cb(err); return }
				var file = s.file = (disk||'').file || s.file;
				if(!disk && file !== opt.code.from){ // corrupt file?
					r.find.bad(file); // remove from dir list
					r.save(key, data, cb); // try again
					return;
				}
				(disk = r.disk[file] || (r.disk[file] = disk || Radix())).file || (disk.file = file);
				if(opt.compare){
					data = opt.compare(disk(key), data, key, file);
					if(u === data){ cb(err, -1); return }
				}
				(s.disk = disk)(key, data);
				if(disk.Q){ disk.Q.push(cb); return } disk.Q = [cb];
				disk.to = setTimeout(s.write, opt.until);
			}
			s.write = function(){
				var file = s.file, disk = s.disk;
				s.q = disk.Q;
				delete disk.Q;
				delete r.disk[file];
				r.write(file, disk, s.ack);
			}
			s.ack = function(err, ok){
				var q = s.q || [], i = 0, ack;
				//var S = +new Date;
				while(ack = q[i++]){ ack(err, ok) }
				//console.log('acks:', +new Date - S, s.file, q.length);
			}
			r.find(key, s.find); 
    }
    r.disk = {};

		/*
			Any storage engine at some point will have to do a read in order to write.
			This is true of even systems that use an append only log, if they support updates.
			Therefore it is unavoidable that a read will have to happen,
			the question is just how long you delay it.
		*/
		var RWC = 0;
		r.write = function(file, rad, cb, o){
			if(!rad){ cb('No radix!'); return }
			o = ('object' == typeof o)? o : {force: o};
			var f = function Fractal(){}, a, b;
			f.text = '';
			f.file = file = rad.file || (rad.file = file);
			if(!file){ cb('What file?'); return }
			f.write = function(){
				var text = rad.raw = f.text;
				r.disk[file = rad.file || f.file || file] = rad;
				var S; LOG && (S = +new Date);
				r.find.add(file, function add(err){
					if(err){ cb(err); return }
					opt.store.put(ename(file), text, function safe(err, ok){
						LOG && opt.log(S, ST = +new Date - S, "wrote disk", JSON.stringify(file), ++RWC, 'total all writes.');
						cb(err, ok || 1);
						if(!rad.Q){ delete r.disk[file] } // VERY IMPORTANT! Clean up memory, but not if there is already queued writes on it!
					});
				});
			}
			f.split = function(){
				f.text = '';
				if(!f.count){ f.count = 0;
					Radix.map(rad, function count(){ f.count++ }); // TODO: Perf? Any faster way to get total length?
				}
				f.limit = Math.ceil(f.count/2);
				f.count = 0;
				f.sub = Radix();
				Radix.map(rad, f.slice, {reverse: 1}); // IMPORTANT: DO THIS IN REVERSE, SO LAST HALF OF DATA MOVED TO NEW FILE BEFORE DROPPING FROM CURRENT FILE.
				r.write(f.end, f.sub, f.both, o);
				f.hub = Radix();
				Radix.map(rad, f.stop);
				r.write(rad.file, f.hub, f.both, o);
				return true;
			}
			f.slice = function(val, key){
				f.sub(f.end = key, val);
				if(f.limit <= (++f.count)){ return true }
			}
			f.stop = function(val, key){
				if(key >= f.end){ return true }
				f.hub(key, val);
			}
			f.both = function(err, ok){
				if(b){ cb(err || b); return }
				if(a){ cb(err, ok); return }
				a = true;
				b = err;
			}
			f.each = function(val, key, k, pre){
				//console.log("RAD:::", JSON.stringify([val, key, k, pre]));
				if(u !== val){ f.count++ }
				if(opt.pack <= (val||'').length){ return cb("Record too big!"), true }
				var enc = Radisk.encode(pre.length) +'#'+ Radisk.encode(k) + (u === val? '' : ':'+ Radisk.encode(val)) +'\n';
				if((opt.chunk < f.text.length + enc.length) && (1 < f.count) && !o.force){
					return f.split();
				}
				f.text += enc;
			}
			if(opt.jsonify){ r.write.jsonify(f, rad, cb, o); return } // temporary testing idea
			if(!Radix.map(rad, f.each, true)){ f.write() }
		}

		r.write.jsonify = function(f, rad, cb, o){
			var raw;
			var S; LOG && (S = +new Date);
			try{raw = JSON.stringify(rad.$);
			}catch(e){ cb("Cannot radisk!"); return }
			LOG && opt.log(S, +new Date - S, "rad stringified JSON");
			if(opt.chunk < raw.length && !o.force){ return f.split() }
			f.text = raw;
			f.write();
		}

		r.range = function(tree, o){
			if(!tree || !o){ return }
			if(u === o.start && u === o.end){ return tree }
			if(atomic(tree)){ return tree }
			var sub = Radix();
			Radix.map(tree, function(v,k){ sub(k,v) }, o); // ONLY PLACE THAT TAKES TREE, maybe reduce API for better perf?
			return sub('');
		}

		;(function(){
			var Q = {};
			r.read = function(key, cb, o){
				o = o || {};
				if(RAD && !o.next){ // cache
					var S; LOG && (S = +new Date);
					var val = RAD(key);
					LOG && (ST = +new Date - S) > 9 && opt.log(S, ST, 'rad cached');
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
							g.it(u, u, {});
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
						r.find.bad(g.file); // remove from dir list
						r.read(key, cb, o); // look again
						return;
					}
					g.info = info;
					if(disk){ RAD = g.disk = disk }
					disk = Q[g.file]; delete Q[g.file];
					map(disk, g.ack);
				}
				g.ack = function(as){
					if(!as.ack){ return }
					var S; LOG && (S = +new Date);
					var key = as.key, o = as.opt, info = g.info, rad = g.disk || noop, data = r.range(rad(key), o), last = rad.last || Radix.map(rad, rev, revo);
					LOG && (ST = +new Date - S) > 9 && opt.log(S, ST, "rad range loaded");
					o.parsed = (o.parsed || 0) + (info.parsed||0);
					o.chunks = (o.chunks || 0) + 1;
					o.more = true;
					if((!as.file) // if no more places to look
					|| (!o.span && last === key) // if our key exactly matches the very last atomic record
					|| (!o.span && last && last > key && 0 != last.indexOf(key)) // 'zach' may be lexically larger than 'za', but there still might be more, like 'zane' in the 'za' prefix bucket so do not end here.
					){
						o.more = u;
						as.ack(g.err, data, o);
						return;
					}
					if(u !== data){
						as.ack(g.err, data, o); // more might be coming!
						if(o.parsed >= o.limit){ return } // even if more, we've hit our limit, asking peer will need to make a new ask with a new starting point.
					} 
					o.next = as.file;
					r.read(key, as.ack, o);
				}
				g.check = function(err, disk, info){
					g.it(err, disk, info);
					var good = true;
					Radix.map(disk, function(val, key){
						// assume in memory for now, since both write/read already call r.find which will init it.
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
					var id = Gun.text.random(3);
					r.save(disk, function ack(err, ok){
						if(err){ r.save(disk, ack); return } // ad infinitum???
						console.log("MISLOCATED DATA CORRECTED", id);
					});
				}
				/*g.check2 = function(err, disk, info){
					if(err || !disk){ g.it(err, disk, info); return }
					var good = true;
					Radix.map(disk, function(val, key){
						// assume in memory for now, since both write/read already call r.find which will init it.
						var go = function(file){
							if(info.file !== file){ good = false }
							return true;
						}
						go.reverse = 1;
						go.end = key;
						r.list(go);
					});
					if(good){ g.it(err, disk, info); return }
					var id = Gun.text.random(3); console.log("MISLOCATED DATA", id);
					r.save(disk, function ack(err, ok){
						if(err){ r.save(disk, ack); return } // ad infinitum???
						console.log("MISLOCATED CORRECTED", id);
						r.read(key, cb, o);
					});
				}*/
				if(o.reverse){ g.lex.reverse = true }
				LOG && (S = +new Date);
				r.find(key, g.lex);
			}

			r.read = function(key, cb, o){
				var g = {key: key};
				g.find = function(file){ var tmp;
					g.file = file || (file = opt.code.from); // this may not be true for reads? Hit "end of dir"?
					if(tmp = r.disk[file]){ g.check(u, tmp); return }
					r.parse(file, g.check);
				}
				g.get = function(err, disk, info){
					if(err){ cb(err); return }
					var file = g.file = (disk||'').file || g.file;
					if(!disk && file !== opt.code.from){ // corrupt file?
						r.find.bad(file); // remove from dir list
						r.save(key, cb); // try again
						return;
					}
					disk = r.disk[file] || (r.disk[file] = disk);
					if(!disk){ cb(); return }
					disk.file || (disk.file = file);
					// ----------------------------
					info = info || {};
					var data = disk(key);
					info.atom = disk.atom;
					if(u !== data){ cb(u, data, info); return }
					// ----------------------------
					return;
					var S; LOG && (S = +new Date);
					var rad = disk || noop, data = r.range(rad(key), o), last = rad.last || Radix.map(rad, rev, revo);
					LOG && (ST = +new Date - S) > 9 && opt.log(S, ST, "rad range loaded");
					o.parsed = (o.parsed || 0) + (info.parsed||0);
					o.chunks = (o.chunks || 0) + 1;
					o.more = true;
					if((!as.file) // if no more places to look
					|| (!o.span && last === key) // if our key exactly matches the very last atomic record
					|| (!o.span && last && last > key && 0 != last.indexOf(key)) // 'zach' may be lexically larger than 'za', but there still might be more, like 'zane' in the 'za' prefix bucket so do not end here.
					){
						o.more = u;
						as.ack(g.err, data, o);
						return;
					}
					if(u !== data){
						as.ack(g.err, data, o); // more might be coming!
						if(o.parsed >= o.limit){ return } // even if more, we've hit our limit, asking peer will need to make a new ask with a new starting point.
					} 
					o.next = as.file;
					r.read(key, as.ack, o);
				}
				g.check = function(err, disk, info){
					g.get(err, disk, info);
					(info || (info = {})).file || (info.file = g.file);
					Radix.map(disk, function(val, key){
						// assume in memory for now, since both write/read already call r.find which will init it.
						r.find(key, function(file){
							if(file === info.file){ return }
							var id = Gun.text.random(3);
							console.log("MISLOCATED DATA", id, key, info.file, file);
							r.save(key, val, function ack(err, ok){
								if(err){ r.save(key, val, ack); return } // ad infinitum???
								console.log("MISLOCATED DATA CORRECTED", id);
							});
						})
					});
				}
				r.find(key, g.find); 
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
			var RPC = 0;
			var Q = {}, s = String.fromCharCode(31);
			r.parse = function(file, cb, raw){ var q;
				if(q = Q[file]){ q.push(cb); return } q = Q[file] = [cb];
				var p = function Parse(){}, info = {file: file};
				(p.disk = Radix()).file = file;
				p.read = function(err, data){ var tmp;
					LOG && opt.log(S, +new Date - S, 'read disk', JSON.stringify(file), ++RPC, 'total all parses.');
					delete Q[file];
					if((p.err = err) || (p.not = !data)){ map(q, p.ack); return }
					if('string' !== typeof data){
						try{
							if(opt.pack <= data.length){
								p.err = "Chunk too big!";
							} else {
								data = data.toString(); // If it crashes, it crashes here. How!?? We check size first!
							}
						}catch(e){ p.err = e }
						if(p.err){ map(q, p.ack); return }
					}
					info.parsed = data.length;
					LOG && (S = +new Date);
					if(opt.jsonify || '{' === data[0]){
						try{
							var json = JSON.parse(data); // TODO: this caused a out-of-memory crash!
							p.disk.$ = json;
							LOG && (ST = +new Date - S) > 9 && opt.log(S, ST, 'rad parsed JSON');
							map(q, p.ack);
							return;
						}catch(e){ tmp = e }
						if('{' === data[0]){
							p.err = tmp || "JSON error!";
							map(q, p.ack);
							return;
						}
					}
					p.radec(err, data);
				}
				p.ack = function(cb){
					if(!cb){ return }
					if(p.err || p.not){
						cb(p.err, u, info);
						return;
					}
					cb(u, p.disk, info);
				}
				p.radec = function(err, data){
					LOG && (S = +new Date);
					var tmp = p.split(data), pre = [], i, k, v;
					if(!tmp || 0 !== tmp[1]){
						p.err = "File '"+file+"' does not have root radix! ";
						map(q, p.ack);
						return; 
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
				var S; LOG && (S = +new Date);
				if(r.disk){ raw || (raw = (r.disk[file]||'').raw) }
				if(raw){ return p.read(u, raw) }
				opt.store.get(ename(file), p.read);
			}
		}());

		;(function(){
			var dir, f = String.fromCharCode(28), Q;
			r.find = function(key, cb){
				if(!dir){
					if(Q){ Q.push([key, cb]); return } Q = [[key, cb]];
					r.parse(f, init);
					return;
				}
				Radix.map(dir, function(val, key){
					if(!val){ return }
					return cb(key) || true;
				}, {reverse: 1, end: key}) || cb();
			}
			r.find.add = function(file, cb){
				var has = dir(file);
				if(has || file === f){ cb(u, 1); return }
				dir(file, 1);
				cb.found = (cb.found || 0) + 1;
				r.write(f, dir, function(err, ok){
					if(err){ cb(err); return }
					cb.found = (cb.found || 0) - 1;
					if(0 !== cb.found){ return }
					cb(u, 1);
				}, true);
			}
			r.find.bad = function(file, cb){
				dir(file, 0);
				r.write(f, dir, cb||noop);
			}
			function init(err, disk){
				if(err){
					opt.log('list', err);
					setTimeout(function(){ r.parse(f, init) }, 1000);
					return;
				}
				if(disk){ drain(disk); return }
				dir = dir || disk || Radix();
				if(!opt.store.list){ drain(dir); return }
				// import directory.
				opt.store.list(function(file){
					if(!file){ drain(dir); return }
					r.find.add(file, noop);
				});
			}
			function drain(rad, tmp){
				dir = dir || rad;
				dir.file = f;
				tmp = Q; Q = null;
				Gun.list.map(tmp, function(arg){
					r.find(arg[0], arg[1]);
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