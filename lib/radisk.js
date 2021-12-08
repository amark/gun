;(function(){

	function Radisk(opt){

		opt = opt || {};
		opt.log = opt.log || console.log;
		opt.file = String(opt.file || 'radata');
		var has = (Radisk.has || (Radisk.has = {}))[opt.file];
		if(has){ return has }

		opt.max = opt.max || (opt.memory? (opt.memory * 999 * 999) : 300000000) * 0.3;
		opt.until = opt.until || opt.wait || 250;
		opt.batch = opt.batch || (10 * 1000);
		opt.chunk = opt.chunk || (1024 * 1024 * 1); // 1MB
		opt.code = opt.code || {};
		opt.code.from = opt.code.from || '!';
		opt.jsonify = true;


		function ename(t){ return encodeURIComponent(t).replace(/\*/g, '%2A') } // TODO: Hash this also, but allow migration!
		function atomic(v){ return u !== v && (!v || 'object' != typeof v) }
		var timediate = (''+u === typeof setImmediate)? setTimeout : setImmediate;
		var puff = setTimeout.turn || timediate, u;
		var map = Radix.object;
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

		if(''+u != typeof require){ require('./ison') }
		var parse = JSON.parseAsync || function(t,cb,r){ var u; try{ cb(u, JSON.parse(t,r)) }catch(e){ cb(e) } }
		var json = JSON.stringifyAsync || function(v,cb,r,s){ var u; try{ cb(u, JSON.stringify(v,r,s)) }catch(e){ cb(e) } }
		/*
			Any and all storage adapters should...
			1. Because writing to disk takes time, we should batch data to disk. This improves performance, and reduces potential disk corruption.
			2. If a batch exceeds a certain number of writes, we should immediately write to disk when physically possible. This caps total performance, but reduces potential loss.
		*/
		var r = function(key, data, cb, tag, DBG){
			if('function' === typeof data){
				var o = cb || {};
				cb = data;
				r.read(key, cb, o, DBG || tag);
				return;
			}
			//var tmp = (tmp = r.batch = r.batch || {})[key] = tmp[key] || {};
			//var tmp = (tmp = r.batch = r.batch || {})[key] = data;
			r.save(key, data, cb, tag, DBG);
		}
		r.save = function(key, data, cb, tag, DBG){
			var s = {key: key}, tags, f, d, q;
			s.find = function(file){ var tmp;
				s.file = file || (file = opt.code.from);
				DBG && (DBG = DBG[file] = DBG[file] || {});
				DBG && (DBG.sf = DBG.sf || +new Date);
				//console.only.i && console.log('found', file);
				if(tmp = r.disk[file]){ s.mix(u, tmp); return }
				r.parse(file, s.mix, u, DBG);
			}
			s.mix = function(err, disk){
				DBG && (DBG.sml = +new Date);
				DBG && (DBG.sm = DBG.sm || +new Date);
				if(s.err = err || s.err){ cb(err); return } // TODO: HANDLE BATCH EMIT
				var file = s.file = (disk||'').file || s.file, tmp;
				if(!disk && file !== opt.code.from){ // corrupt file?
					r.find.bad(file); // remove from dir list
					r.save(key, data, cb, tag); // try again
					return;
				}
				(disk = r.disk[file] || (r.disk[file] = disk || Radix())).file || (disk.file = file);
				if(opt.compare){
					data = opt.compare(disk(key), data, key, file);
					if(u === data){ cb(err, -1); return } // TODO: HANDLE BATCH EMIT
				}
				(s.disk = disk)(key, data);
				if(tag){
					(tmp = (tmp = disk.tags || (disk.tags = {}))[tag] || (tmp[tag] = r.tags[tag] || (r.tags[tag] = {})))[file] || (tmp[file] = r.one[tag] || (r.one[tag] = cb));
					cb = null;
				}
				DBG && (DBG.st = DBG.st || +new Date);
				//console.only.i && console.log('mix', disk.Q);
				if(disk.Q){ cb && disk.Q.push(cb); return } disk.Q = (cb? [cb] : []);
				disk.to = setTimeout(s.write, opt.until);
			}
			s.write = function(){
				DBG && (DBG.sto = DBG.sto || +new Date);
				var file = f = s.file, disk = d = s.disk;
				q = s.q = disk.Q;
				tags = s.tags = disk.tags;
				delete disk.Q;
				delete r.disk[file];
				delete disk.tags;
				//console.only.i && console.log('write', file, disk, 'was saving:', key, data);
				r.write(file, disk, s.ack, u, DBG);
			}
			s.ack = function(err, ok){
				DBG && (DBG.sa = DBG.sa || +new Date);
				DBG && (DBG.sal = q.length);
				var ack, tmp;
				// TODO!!!! CHANGE THIS INTO PUFF!!!!!!!!!!!!!!!!
				for(var id in r.tags){
					if(!r.tags.hasOwnProperty(id)){ continue } var tag = r.tags[id];
					if((tmp = r.disk[f]) && (tmp = tmp.tags) && tmp[tag]){ continue }
					ack = tag[f];
					delete tag[f];
					var ne; for(var k in tag){ if(tag.hasOwnProperty(k)){ ne = true; break } } // is not empty?
					if(ne){ continue } //if(!obj_empty(tag)){ continue }
					delete r.tags[tag];
					ack && ack(err, ok);
				}
				!q && (q = '');
				var l = q.length, i = 0;
				// TODO: PERF: Why is acks so slow, what work do they do??? CHECK THIS!!
				// TODO: PERF: Why is acks so slow, what work do they do??? CHECK THIS!!
				// TODO: PERF: Why is acks so slow, what work do they do??? CHECK THIS!!
				// TODO: PERF: Why is acks so slow, what work do they do??? CHECK THIS!!
				// TODO: PERF: Why is acks so slow, what work do they do??? CHECK THIS!!
				// TODO: PERF: Why is acks so slow, what work do they do??? CHECK THIS!!
				// TODO: PERF: Why is acks so slow, what work do they do??? CHECK THIS!!
				var S = +new Date;
				for(;i < l; i++){ (ack = q[i]) && ack(err, ok) }
				console.STAT && console.STAT(S, +new Date - S, 'rad acks', ename(s.file));
				console.STAT && console.STAT(S, q.length, 'rad acks #', ename(s.file));
			}
			cb || (cb = function(err, ok){ // test delete!
				if(!err){ return }
			});
			//console.only.i && console.log('save', key);
			r.find(key, s.find);
    }
    r.disk = {};
    r.one = {};
    r.tags = {};

		/*
			Any storage engine at some point will have to do a read in order to write.
			This is true of even systems that use an append only log, if they support updates.
			Therefore it is unavoidable that a read will have to happen,
			the question is just how long you delay it.
		*/
		var RWC = 0;
		r.write = function(file, rad, cb, o, DBG){
			if(!rad){ cb('No radix!'); return }
			o = ('object' == typeof o)? o : {force: o};
			var f = function Fractal(){}, a, b;
			f.text = '';
			f.file = file = rad.file || (rad.file = file);
			if(!file){ cb('What file?'); return }
			f.write = function(){
				var text = rad.raw = f.text;
				r.disk[file = rad.file || f.file || file] = rad;
				var S = +new Date;
				DBG && (DBG.wd = S);
				//console.only.i && console.log('add', file);
				r.find.add(file, function add(err){
					DBG && (DBG.wa = +new Date);
					if(err){ cb(err); return }
					//console.only.i && console.log('disk', file, text);
					opt.store.put(ename(file), text, function safe(err, ok){
						DBG && (DBG.wp = +new Date);
						console.STAT && console.STAT(S, ST = +new Date - S, "wrote disk", JSON.stringify(file), ++RWC, 'total all writes.');
						//console.only.i && console.log('done', err, ok || 1, cb);
						cb(err, ok || 1);
						if(!rad.Q){ delete r.disk[file] } // VERY IMPORTANT! Clean up memory, but not if there is already queued writes on it!
					});
				});
			}
			f.split = function(){
				var S = +new Date;
				DBG && (DBG.wf = S);
				f.text = '';
				if(!f.count){ f.count = 0;
					Radix.map(rad, function count(){ f.count++ }); // TODO: Perf? Any faster way to get total length?
				}
				DBG && (DBG.wfc = f.count);
				f.limit = Math.ceil(f.count/2);
				var SC = f.count;
				f.count = 0;
				DBG && (DBG.wf1 = +new Date);
				f.sub = Radix();
				Radix.map(rad, f.slice, {reverse: 1}); // IMPORTANT: DO THIS IN REVERSE, SO LAST HALF OF DATA MOVED TO NEW FILE BEFORE DROPPING FROM CURRENT FILE.
				DBG && (DBG.wf2 = +new Date);
				r.write(f.end, f.sub, f.both, o);
				DBG && (DBG.wf3 = +new Date);
				f.hub = Radix();
				Radix.map(rad, f.stop);
				DBG && (DBG.wf4 = +new Date);
				r.write(rad.file, f.hub, f.both, o);
				DBG && (DBG.wf5 = +new Date);
				console.STAT && console.STAT(S, +new Date - S, "rad split", ename(rad.file), SC);
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
				DBG && (DBG.wfd = +new Date);
				if(b){ cb(err || b); return }
				if(a){ cb(err, ok); return }
				a = true;
				b = err;
			}
			f.each = function(val, key, k, pre){
				if(u !== val){ f.count++ }
				if(opt.max <= (val||'').length){ return cb("Data too big!"), true }
				var enc = Radisk.encode(pre.length) +'#'+ Radisk.encode(k) + (u === val? '' : ':'+ Radisk.encode(val)) +'\n';
				if((opt.chunk < f.text.length + enc.length) && (1 < f.count) && !o.force){
					return f.split();
				}
				f.text += enc;
			}
			//console.only.i && console.log('writing');
			if(opt.jsonify){ r.write.jsonify(f, rad, cb, o, DBG); return } // temporary testing idea
			if(!Radix.map(rad, f.each, true)){ f.write() }
		}

		r.write.jsonify = function(f, rad, cb, o, DBG){
			var raw;
			var S = +new Date;
			DBG && (DBG.w = S);
			try{raw = JSON.stringify(rad.$);
			}catch(e){ cb("Cannot radisk!"); return }
			DBG && (DBG.ws = +new Date);
			console.STAT && console.STAT(S, +new Date - S, "rad stringified JSON");
			if(opt.chunk < raw.length && !o.force){
				var c = 0;
				Radix.map(rad, function(){
					if(c++){ return true } // more than 1 item
				});
				if(c > 1){
					return f.split();
				}
			}
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
			r.read = function(key, cb, o, DBG){
				o = o || {};
				var g = {key: key};
				g.find = function(file){ var tmp;
					g.file = file || (file = opt.code.from);
					DBG && (DBG = DBG[file] = DBG[file] || {});
					DBG && (DBG.rf = DBG.rf || +new Date);
					if(tmp = r.disk[g.file = file]){ g.check(u, tmp); return }
					r.parse(file, g.check, u, DBG);
				}
				g.get = function(err, disk, info){
					DBG && (DBG.rgl = +new Date);
					DBG && (DBG.rg = DBG.rg || +new Date);
					if(g.err = err || g.err){ cb(err); return }
					var file = g.file = (disk||'').file || g.file;
					if(!disk && file !== opt.code.from){ // corrupt file?
						r.find.bad(file); // remove from dir list
						r.read(key, cb, o); // try again
						return;
					}
					disk = r.disk[file] || (r.disk[file] = disk);
					if(!disk){ cb(file === opt.code.from? u : "No file!"); return }
					disk.file || (disk.file = file);
					var data = r.range(disk(key), o);
					DBG && (DBG.rr = +new Date);
					o.unit = disk.unit;
					o.chunks = (o.chunks || 0) + 1;
					o.parsed = (o.parsed || 0) + ((info||'').parsed||(o.chunks*opt.chunk));
					o.more = 1;
					o.next = u;
					Radix.map(r.list, function next(v,f){
						if(!v || file === f){ return }
						o.next = f;
						return 1;
					}, o.reverse? {reverse: 1, end: file} : {start: file});
					DBG && (DBG.rl = +new Date);
					if(!o.next){ o.more = 0 }
					if(o.next){
						if(!o.reverse && ((key < o.next && 0 != o.next.indexOf(key)) || (u !== o.end && (o.end || '\uffff') < o.next))){ o.more = 0 }
						if(o.reverse && ((key > o.next && 0 != key.indexOf(o.next)) || ((u !== o.start && (o.start || '') > o.next && file <= o.start)))){ o.more = 0 }
					}
					//console.log(5, process.memoryUsage().heapUsed);
					if(!o.more){ cb(g.err, data, o); return }
					if(data){ cb(g.err, data, o) }
					if(o.parsed >= o.limit){ return }
					var S = +new Date;
					DBG && (DBG.rm = S);
					var next = o.next;
					timediate(function(){
						console.STAT && console.STAT(S, +new Date - S, 'rad more');
						r.parse(next, g.check);
					},0);
				}
				g.check = function(err, disk, info){
					//console.log(4, process.memoryUsage().heapUsed);
					g.get(err, disk, info);
					if(!disk || disk.check){ return } disk.check = 1;
					var S = +new Date;
					(info || (info = {})).file || (info.file = g.file);
					Radix.map(disk, function(val, key){
						// assume in memory for now, since both write/read already call r.find which will init it.
						r.find(key, function(file){
							if((file || (file = opt.code.from)) === info.file){ return }
							var id = (''+Math.random()).slice(-3);
							puff(function(){
							r.save(key, val, function ack(err, ok){
								if(err){ r.save(key, val, ack); return } // ad infinitum???
								// TODO: NOTE!!! Mislocated data could be because of a synchronous `put` from the `g.get(` other than perf shouldn't we do the check first before acking?
								console.STAT && console.STAT("MISLOCATED DATA CORRECTED", id, ename(key), ename(info.file), ename(file));
							});
							},0);
						})
					});
					console.STAT && console.STAT(S, +new Date - S, "rad check");
				}
				r.find(key || (o.reverse? (o.end||'') : (o.start||'')), g.find); 
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
			r.parse = function(file, cb, raw, DBG){ var q;
				if(!file){ return cb(); }
				if(q = Q[file]){ q.push(cb); return } q = Q[file] = [cb];
				var p = function Parse(){}, info = {file: file};
				(p.disk = Radix()).file = file;
				p.read = function(err, data){ var tmp;
					DBG && (DBG.rpg = +new Date);
					console.STAT && console.STAT(S, +new Date - S, 'read disk', JSON.stringify(file), ++RPC, 'total all parses.');
					//console.log(2, process.memoryUsage().heapUsed);
					if((p.err = err) || (p.not = !data)){
						delete Q[file];
						p.map(q, p.ack);
						return;
					}
					if('string' !== typeof data){
						try{
							if(opt.max <= data.length){
								p.err = "Chunk too big!";
							} else {
								data = data.toString(); // If it crashes, it crashes here. How!?? We check size first!
							}
						}catch(e){ p.err = e }
						if(p.err){
							delete Q[file];
							p.map(q, p.ack);
							return;
						}
					}
					info.parsed = data.length;
					DBG && (DBG.rpl = info.parsed);
					DBG && (DBG.rpa = q.length);
					S = +new Date;
					if(!(opt.jsonify || '{' === data[0])){
						p.radec(err, data);
						return;
					}
					parse(data, function(err, tree){
						//console.log(3, process.memoryUsage().heapUsed);
						if(!err){
							delete Q[file];
							p.disk.$ = tree;
							console.STAT && (ST = +new Date - S) > 9 && console.STAT(S, ST, 'rad parsed JSON');
							DBG && (DBG.rpd = +new Date);
							p.map(q, p.ack); // hmmm, v8 profiler can't see into this cause of try/catch?
							return;
						}
						if('{' === data[0]){
							delete Q[file];
							p.err = tmp || "JSON error!";
							p.map(q, p.ack);
							return;
						}
						p.radec(err, data);
					});
				}
				p.map = function(){ // switch to setTimeout.each now?
					if(!q || !q.length){ return }
					//var i = 0, l = q.length, ack;
					var S = +new Date;
					var err = p.err, data = p.not? u : p.disk;
					var i = 0, ack; while(i < 9 && (ack = q[i++])){ ack(err, data, info) } // too much?
					console.STAT && console.STAT(S, +new Date - S, 'rad packs', ename(file));
					console.STAT && console.STAT(S, i, 'rad packs #', ename(file)); 
					if(!(q = q.slice(i)).length){ return }
					puff(p.map, 0);
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
					delete Q[file];
					S = +new Date;
					var tmp = p.split(data), pre = [], i, k, v;
					if(!tmp || 0 !== tmp[1]){
						p.err = "File '"+file+"' does not have root radix! ";
						p.map(q, p.ack);
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
					console.STAT && console.STAT(S, +new Date - S, 'parsed RAD');
					p.map(q, p.ack);
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
				if(r.disk){ raw || (raw = (r.disk[file]||'').raw) }
				var S = +new Date, SM, SL;
				DBG && (DBG.rp = S);
				if(raw){ return puff(function(){ p.read(u, raw) }, 0) }
				opt.store.get(ename(file), p.read);
				// TODO: What if memory disk gets filled with updates, and we get an old one back?
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
				Radix.map(r.list = dir, function(val, key){
					if(!val){ return }
					return cb(key) || true;
				}, {reverse: 1, end: key}) || cb(opt.code.from);
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
				map(tmp, function(arg){
					r.find(arg[0], arg[1]);
				});
			}
		}());

		try{ !Gun.window && require('./radmigtmp')(r) }catch(e){}

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
			if(d && d['#'] && 1 == Object.keys(d).length){
				return t + '#' + tmp + t;
			} else
			if('number' == typeof d){
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
				return {'#':d};
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