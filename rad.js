;(function(){ // RAD
	console.log("Warning: Experimental rewrite of RAD to use Book. It is not API compatible with RAD yet and is very alpha.");
	var sT = setTimeout, Book = sT.Book || require('gun/src/book'), RAD = sT.RAD || (sT.RAD = function(opt){
		opt = opt || {};
		opt.file = String(opt.file || 'radata');
		var log = opt.log || nope;

		var has = (sT.RAD.has || (sT.RAD.has = {}))[opt.file];
		if(has){ return has }
		var r = function rad(word, is, reply){ r.word = word;
			if(!b){ start(word, is, reply); return r }
			if(is === undefined || 'function' == typeof is){ // THIS IS A READ:
				var page = b.page(word);
				if(page.from){ return is && is(page, null), r }
				return read(word, is, page), r; // get from disk
			}
			//console.log("OFF");return;
			// ON WRITE:
			// batch until read from disk is done (and if a write was going, do that first)
			//if(!valid(word, is, reply)){ return }
			b(word, is);
			write(word, reply);
			return r;
		}, /** @param b the book */ b;
		r.then = function(cb, p){ return p = (new Promise(function(yes, no){ r(r.word, yes) })), cb? p.then(cb) : p }
		r.read = r.results = function(cb){ return (new Promise(async function(yes, no){ yes((await r(r.word)).read(cb)) })) }

		async function read(word, reply, page){ // TODO: this function doesn't do much, inline it???
			if(!reply){ return }
			var p = page || b.page(word);
			get(p, function(err, disk){
				if(err){ log("ERR! in read() get() cb", err); reply(p.no, err); return }
				p.from = disk || p.from;
				reply(p, null, b);
			})
		}

		async function write(word, reply){
			log('write() word', word);
			var p = b.page(word), tmp;
			if(tmp = p.saving){ reply && tmp.push(reply); return } p.saving = [reply];
			var S = +new Date; log("   writing", p.substring(), 'since last', S - p.saved, RAD.c, 'records', env.count++, 'mid-swap.');
			get(p, function(err, disk){
				if(err){ log("ERR! in write() get() cb ", err); return }
				log('      get() - p.saving ', (p.saving || []).length);
				if(p.from && disk){
					log("      get() merge: p.from ", p.toString().slice(0, 40), " disk.length", disk?.length || 0);
				}
				p.from = disk || p.from;
				// p.list = p.text = p.from = 0;
				// p.first = p.first.word || p.first;
				tmp = p.saving; p.saving = [];
				put(p, '' + p, function(err, ok){
					env.count--; p.saved = +new Date; log("      ...wrote %d bytes in %dms", ('' + p).length, (p.saved = +new Date) - S);
					// TODO: BUG: Confirmed! Only calls back first. Need to fix + use perf hack from old RAD.
					sT.each(tmp, function(cb){ cb && cb(err, ok) });
					if(!p.saving.length){ p.saving = 0; return; } //p.saving = 0; // what?
					// log({ tmp });
					console.log("hm?", word, reply+'');
					write(word, reply);
				});
			}, p);
		}
		function put(file, data, cb){
			put[file = fname(file)] = { data: data };
			RAD.put(file, data, function(err, ok){
				delete put[file];
				cb && cb(err, ok);
			}, opt);
		};
		function get(file, cb){
			var tmp;
			if(!file){ return } // TODO: HANDLE ERROR!!
			if(file.from){ cb(null, file.from); return } // IS THIS LINE SAFE? ADD TESTS!
			if(b&&1==b.list.length){ file.first = (file.first < '!')? file.first : '!'; } // TODO: BUG!!!! This cleanly makes for a common first file, but SAVING INVISIBLE ASCII KEYS IS COMPLETELY UNTESTED and guaranteed to have bugs/corruption issues.
			if(tmp = put[file = fname(file)]){ cb(u, tmp.data); return }
			if(tmp = get[file]){ tmp.push(cb); return } get[file] = [cb];
			RAD.get(file, function(err, data){
				tmp = get[file]||''; delete get[file];
				var i = -1, f; while (f = tmp[++i]){ f(err, data) } // TODO: BUG! CPU SCHEDULE?
			}, opt);
		};

		function start(word, is, reply){
			if(b){ r(word, is, reply); return }
			get(' ', function(err, d){
				if(err){ log('ERR! in start() get()', err); reply && reply(err); return }
				if(b){ r(word, is, reply); return }
				b = r.book = Book();
				if((d = Book.slot(d)).length){ b.list = d } // TODO: BUG! Add some other sort of corrupted/error check here?
				watch(b).parse = function(t){ return ('string' == typeof t)? Book.decode(Book.slot(t)[0]) : t } // TODO: This was ugly temporary, but is necessary, and is logically correct, but is there a cleaner, nicer, less assumptiony way to do it? // TODO: SOLUTION?! I think this needs to be in Book, not RAD.
				r(word, is, reply);
			})
		}
		function watch(b){ // SPLIT LOGIC!
			var split = b.split;
			b.list.toString = function(){
				//console.time();
				var i = -1, t = '', p; while (p = this[++i]){
					t += "|" +"`"+Book.encode(p.substring())+"`"+Book.encode(p.meta||null)+"`"
				}
				t += "|";
				//console.timeEnd();
				return t;
			}
			b.split = function(next, page){
				log("SPLIT!!!!", b.list.length);
				put(' ', '' + b.list, function(err, ok){
					if(err){ console.log("ERR!"); return }
					// ??
				});
			}
			return b;
		}

		function ename(t){ return encodeURIComponent(t).replace(/\*/g, '%2A').slice(0, 250) }
		//function fname(p){ return opt.file + '/' + ename(p.substring()) }
		function fname(p){ return ename(p.substring()) }


		function valid(word, is, reply){
			if(is !== is){ reply(word +" cannot be NaN!"); return }
			return true;
		}

		function valid(word, is, reply){
			if(is !== is){ reply(word +" cannot be NaN!"); return }
			return true;
		}

		return r;
	}), MAX = 1000/* 300000000 */;
	sT.each = sT.each || function(l,f){l.forEach(f)};

	try { module.exports = RAD } catch (e){ }

	// junk below that needs to be cleaned up and corrected for the actual correct RAD API.
	var env = {}, nope = function(){ }, nah = function(){ return nope }, u;
	env.require = (typeof require !== '' + u && require) || nope;
	env.process = (typeof process != '' + u && process) || { memoryUsage: nah };
	env.os = env.require('os') || { totalmem: nope, freemem: nope };
	env.v8 = env.require('v8') || { getHeapStatistics: nah };
	env.fs = env.require('fs') || { writeFile: nope, readFile: nope };


	env.max = env.v8.getHeapStatistics().total_available_size / (2 ** 12);

	env.count = env.last = 0;
	return;

	//if(err && 'ENOENT' === (err.code||'').toUpperCase()){ err = null }

	setInterval(function(){
		var stats = { memory: {} };

		stats.memory.total = env.os.totalmem() / 1024 / 1024; // in MB
		stats.memory.free = env.os.freemem() / 1024 / 1024; // in MB
		stats.memory.hused = env.v8.getHeapStatistics().used_heap_size / 1024 / 1024; // in MB
		stats.memory.used = env.process.memoryUsage().rss / 1024 / 1024; // in MB
		console.log(stats.memory);
	}, 9);

}());


; (function(){ // temporary fs storage plugin, needs to be refactored to use the actual RAD plugin interface.
	var fs;
	try { fs = require('fs') } catch (e){ };
	if(!fs){ return }

	var sT = setTimeout, RAD = sT.RAD;
	RAD.put = function(file, data, cb, opt){
		fs.writeFile(opt.file+'/'+file, data, cb);
	}
	RAD.get = function(file, cb, opt){
		fs.readFile(opt.file+'/'+file, function(err, data){
			if(err && 'ENOENT' === (err.code||'').toUpperCase()){ return cb() }
			cb(err, (data||'').toString()||data);
		});
	}
}());


;(function(){ // temporary fs storage plugin, needs to be refactored to use the actual RAD plugin interface.
	var lS;
	try { lS = localStorage } catch (e){ };
	if(!lS){ return }

	var sT = setTimeout, RAD = sT.RAD;
	RAD.put = function(file, data, cb, opt){
		setTimeout(function(){
		lS[opt.file+'/'+file] = data;
		cb(null, 1);
		},1);
	}
	RAD.get = function(file, cb, opt){
		setTimeout(function(){
		cb(null, lS[opt.file+'/'+file]);
		},1);
	}
}());

;(function(){ return;
	var get;
	try { get = fetch } catch (e){ console.log("WARNING! need `npm install node-fetch@2.6`"); get = fetch = require('node-fetch') };
	if(!get){ return }

	var sT = setTimeout, RAD = sT.RAD, put = RAD.put, get = RAD.get;
	RAD.put = function(file, data, cb, opt){ put && put(file, data, cb, opt);
		cb(401)
	}
	RAD.get = async function(file, cb, opt){ get && get(file, cb, opt);
		var t = (await (await fetch('http://localhost:8766/gun/1data/'+file)).text());
		if('404' == t){ cb(); return }
		cb(null, t);
	}
}());