// This was written by the wonderful Forrest Tait
// modified by Mark to be part of core for convenience
// twas not designed for production use
// only simple local development.
var Gun = require('../gun'),
		file = {};

Gun.on('opt').event(function(gun, opts) {
	if ((opts.file === false) || (opts.s3 && opts.s3.key)) {
		return; // don't use this plugin if S3 is being used.
	}
	console.log("WARNING! This `file.js` module for gun is intended only for local development testing!")
	opts.file = opts.file || 'data.json';
	var fs = require('fs');
	file.raw = file.raw || (fs.existsSync || require('path').existsSync)(opts.file) ? fs.readFileSync(opts.file).toString() : null;
	var all = file.all = file.all || Gun.obj.ify(file.raw || {
		nodes: {},
		keys: {}
	});
	all.keys = all.keys || {};
	all.nodes = all.nodes || {};

	// queue writes, adapted from https://github.com/toolness/jsondown/blob/master/jsondown.js
	var isWriting = false, queuedWrites = [];
	function writeFile(cb) {
		if(isWriting) return queuedWrites.push(cb);
		isWriting = true;
		fs.writeFile(opts.file, Gun.text.ify(all), function(err) {
			var batch = queuedWrites.splice(0);
			isWriting = false;
			cb(err);
			if(batch.length)
				writeFile( function(err) {
					batch.forEach( function(cb) { cb(err); } )
		    });
		});
  }

	gun.opt({hooks: {
		get: function get(key, cb, o){
			var graph, soul;
			if(soul = Gun.is.soul(key)){
				if(all.nodes[soul]){
					(graph = {})[soul] = all.nodes[soul];
					cb(null, graph);
					(graph = {})[soul] = Gun.union.pseudo(soul);
					cb(null, graph); // end.
				}
				return;
			}
			Gun.obj.map(all.keys[key], function(rel){
				if(Gun.is.soul(rel)){ get(soul = rel, cb, o) }
			});
			return soul? cb(null, {}) : cb(null, null);
		},
		put: function(graph, cb, o){
			for (key in gun.__.graph) all.nodes[key]=gun.__.graph[key];
			writeFile(cb);
		},
		key: function(key, soul, cb, o){
			var meta = {};
			meta[Gun._.soul] = soul = Gun.is.soul(soul) || soul;
			((all.keys = all.keys || {})[key] = all.keys[key] || {})[soul] = meta;
			writeFile(cb);
		},
		all: function(list, opt, cb) {
			opt = opt || {};
			opt.from = opt.from || '';
			opt.start = opt.from + (opt.start || '');
			if(opt.end){ opt.end = opt.from + opt.end }
			var match = {};
			cb = cb || function(){};
			Gun.obj.map(list, function(soul, key){
				var end = opt.end || key;
				if(key.indexOf(opt.from) === 0 && opt.start <= key && (key <= end || key.indexOf(end) === 0)){
					if(opt.upto){
						if(key.slice(opt.from.length).indexOf(opt.upto) === -1){
							yes(soul, key);
						}
					} else {
						yes(soul, key);
					}
				}
			});
			function yes(soul, key){
				cb(key);
				match[key] = {};
				match[key][Gun._.soul] = soul;
			}
			return match;
		}
	}}, true);
	gun.all = gun.all || function(url, cb) {
		url = require('url').parse(url, true);
		var r = gun.__.opt.hooks.all(all.keys, {
				from: url.pathname,
				upto: url.query['*'],
				start: url.query['*>'],
				end: url.query['*<']
		});
		console.log("All please", url.pathname, url.query['*'], r);
		cb = cb || function() {};
		cb(null, r);
	}
});
