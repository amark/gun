// This was written by the wonderful Forrest Tait
// modified by Mark to be part of core for convenience
// twas not designed for production use
// only simple local development.
var Gun = require('../gun'),
	fs = require('fs'),
	file = {};

// queue writes, adapted from https://github.com/toolness/jsondown/blob/master/jsondown.js
var isWriting = false, queuedWrites = [];
function writeFile(path, disk, cb) {
	if(isWriting) return queuedWrites.push(cb);
	isWriting = true;
	fs.writeFile(String(path), Gun.text.ify(disk), function(err) {
		var batch = queuedWrites.splice(0);
		isWriting = false;
		cb(err);
		if(batch.length)
			writeFile(path, disk, function(err) {
				batch.forEach( function(cb) { cb(err); } )
	    });
	});
}

Gun.on('put').event(function(gun, graph, cb, opt){
	Gun.obj.map(gun.__.graph, function(node, soul){
		file.disk.graph[soul] = gun.__.graph[soul] || graph[soul];
	});
	writeFile(opt.file || file.file, file.disk, cb);
});
Gun.on('get').event(function(gun, lex, cb, opt){
	var node, soul = lex[Gun._.soul];
	node = file.disk.graph[soul];
	cb(null, node);
});

Gun.on('opt').event(function(gun, opts) {
	if ((opts.file === false) || (opts.s3 && opts.s3.key)) {
		return; // don't use this plugin if S3 is being used.
	}
	console.log("WARNING! This `file.js` module for gun is intended only for local development testing!")
	file.file = opts.file || file.file || 'data.json';
	file.raw = file.raw || (fs.existsSync || require('path').existsSync)(opts.file) ? fs.readFileSync(opts.file).toString() : null;
	file.disk = file.disk || Gun.obj.ify(file.raw || {graph: {}});
	file.disk.graph = file.disk.graph || {};
});