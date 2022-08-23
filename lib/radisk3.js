; (function () { // RAD
	console.log("Warning: Experimental rewrite of RAD to use Book. It is not API compatible with RAD yet and is very alpha.");
	var sT = setTimeout, Book = sT.Book, RAD = sT.RAD || (sT.RAD = function (opt) {
		opt = opt || {};
		opt.file = String(opt.file || 'radata');
		var log = opt.log || nope;

		var has = (sT.RAD.has || (sT.RAD.has = {}))[opt.file];
		if (has) { return has }
		var r = function rad(word, is, reply) {
			if (!b) { start(word, is, reply); return r }
			if (is === undefined || 'function' == typeof is) { // THIS IS A READ:
				var page = b.page(word);
				if (page.from) {
					return is(null, page);
				}
				read(word, is, page); // get from disk
				return
			}
			//console.log("OFF");return;
			// ON WRITE:
			// batch until read from disk is done (and if a write was going, do that first)
			b(word, is);
			write(word, reply);
			return r;
		}, /** @param b the book */ b;


		async function read(word, reply, page) {
			var p = page;//b.page(word);
			reply = reply.call ? reply : () => { };
			log(`read() ${word.slice(0, 40)}`);
			get(p, function (err, disk) {
				if (err) { log("ERR! in read() get() cb", err); reply(err); return }
				p.from = disk || p.from;
				reply(null, p, b);
			})
		}

		async function write(word, reply) {
			log('write() word', word);
			var p = b.page(word), tmp;
			if (tmp = p.saving) { reply && tmp.push(reply); return } p.saving = [reply];
			var S = +new Date; log("   writing", p.substring(), 'since last', S - p.saved, RAD.c, 'records', env.count++, 'mid-swap.');
			get(p, function (err, disk) {
				if (err) { log("ERR! in write() get() cb ", err); return }
				log('      get() - p.saving ', (p.saving || []).length);
				if (p.from && disk) {
					log("      get() merge: p.from ", p.toString().slice(0, 40), " disk.length", disk?.length || 0);
				}
				p.from = disk || p.from; // TODO: NEED TO MERGE! AND HANDLE ERR!
				// p.list = p.text = p.from = 0;
				// p.first = p.first.word || p.first;
				tmp = p.saving; p.saving = [];
				put(p, '' + p, function (err, ok) {
					env.count--; p.saved = +new Date; log("      ...wrote %d bytes in %dms", ('' + p).length, (p.saved = +new Date) - S);
					if (!p.saving.length) { p.saving = 0; reply?.call && reply(err, ok); return; } p.saving = 0; // what?
					// log({ tmp });
					write(word, reply);
				});
			})
		}
		function put(file, data, cb) {
			file.first && (file = Book.slot(file.first)[0]);
			put[file = fname(file)] = { data: data };
			RAD.put(file, data, function (err, ok) {
				delete put[file];
				cb && cb(err, ok);
			});
		};
		function get(file, cb) {
			var tmp;
			file.first && (file = Book.slot(file.first)[0]);
			if (tmp = put[file = fname(file)]) { cb(u, tmp.data); return }
			if (tmp = get[file]) { tmp.push(cb); return } get[file] = [cb];
			RAD.get(file, function (err, data) {
				tmp = get[file]; delete get[file];
				var i = -1, f; while (f = tmp[++i]) { f(err, data) } // CPU SCHEDULE?
			});
		};

		function start(word, is, reply) {
			if (b) { r(word, is, reply); return }
			get(' ', function (err, d) {
				if (err) { log('ERR! in start() get()', err); reply && reply(err); return }
				if (b) { r(word, is, reply); return }
				//wrap(b = r.book = Book(d));
				(b = r.book = Book()).list = Book.slot(d);
				watch(b).list[0] = "'!'";
				r(word, is, reply);
			})
		}
		function watch(b) { // SPLIT LOGIC!
			var split = b.split;
			b.list.toString = function () {
				console.time();
				var i = -1, t = '', p; while (p = this[++i]) {
					t += "|" + p.substring();
				}
				t += "|";
				console.timeEnd();
				return t;
			}
			b.split = function (next, page) {
				log("SPLIT!!!!", b.list.length);
				put(' ', '' + b.list, function (err, ok) {
					if (err) { console.log("ERR!"); return }
					// ??
				});
			}
			return b;
		}

		function ename(t) { return encodeURIComponent(t).replace(/\*/g, '%2A').slice(0, 250) }
		function fname(p) { return opt.file + '/' + ename(p.substring()) }

		return r;
	}), MAX = 1000/* 300000000 */;

	try { module.exports = RAD } catch (e) { }

	// junk below that needs to be cleaned up and corrected for the actual correct RAD API.
	var env = {}, nope = function () { }, nah = function () { return nope }, u;
	env.require = (typeof require !== '' + u && require) || nope;
	env.process = (typeof process != '' + u && process) || { memoryUsage: nah };
	env.os = env.require('os') || { totalmem: nope, freemem: nope };
	env.v8 = env.require('v8') || { getHeapStatistics: nah };
	env.fs = env.require('fs') || { writeFile: nope, readFile: nope };


	env.max = env.v8.getHeapStatistics().total_available_size / (2 ** 12);

	env.count = env.last = 0;
	return;

	//if(err && 'ENOENT' === (err.code||'').toUpperCase()){ err = null }

	setInterval(function () {
		var stats = { memory: {} };

		stats.memory.total = env.os.totalmem() / 1024 / 1024; // in MB
		stats.memory.free = env.os.freemem() / 1024 / 1024; // in MB
		stats.memory.hused = env.v8.getHeapStatistics().used_heap_size / 1024 / 1024; // in MB
		stats.memory.used = env.process.memoryUsage().rss / 1024 / 1024; // in MB
		console.log(stats.memory);
	}, 9);

}());


; (function () { // temporary fs storage plugin, needs to be refactored to use the actual RAD plugin interface.
	var fs;
	try { fs = require('fs') } catch (e) { };
	if (!fs) { return }

	var sT = setTimeout, RAD = sT.RAD;
	RAD.put = function (file, data, cb) {
		fs.writeFile(file, data, cb);
	}
	RAD.get = function (file, cb) {
		fs.readFile(file, function (err, data) {
			if (err && 'ENOENT' === (err.code || '').toUpperCase()) { return cb() }
			cb(err, data.toString());
		});
	}
}());
