// This was written by the wonderful Forrest Tait
// modified by Mark to be part of core for convenience
// twas not designed for production use
// only simple local development.
var Gun = require('../gun'),
	fs = require('fs'),
	file = {};

// queue writes, adapted from https://github.com/toolness/jsondown/blob/master/jsondown.js
var isWriting = false, queuedWrites = [];
function writeFile(path, disk, at){
	if(isWriting) return queuedWrites.push(at);
	isWriting = true;
	var contents = JSON.stringify(disk, null, 2);
	fs.writeFile(String(path), contents, function(err) {
		var batch = queuedWrites.splice(0);
		isWriting = false;
		at.gun.Back(-1).on('in', {'@': at['#'], err: err, ok: err? false : 1});
		if(!batch.length){ return }
		batch.forEach(function(at){
			at.gun.Back(-1).on('in', {'@': at['#'], err: err, ok: err? false : 1});
		});
	});
}

Gun.on('put', function(at){
	var gun = at.gun, graph = at.put, opt = at.opt || {};
	var __ = gun._.root._;
	Gun.obj.map(graph, function(node, soul){
		file.disk.graph[soul] = __.graph[soul] || graph[soul];
	});
	writeFile(opt.file || file.file, file.disk, at);
});
Gun.on('get', function(at){
	var gun = at.gun, lex = at.get, opt = at.opt;
	if(!lex){return}
	gun.Back(-1).on('in', {'@': at['#'], put: Gun.graph.node(file.disk.graph[lex['#']])});
	//at.cb(null, file.disk.graph[lex['#']]);
});

Gun.on('opt', function(at){
	var gun = at.gun, opts = at.opt;
	if ((opts.file === false) || (opts.s3 && opts.s3.key)) {
		return; // don't use this plugin if S3 is being used.
	}
	console.log("WARNING! This `file.js` module for gun is intended only for local development testing!")
	file.file = opts.file || file.file || 'data.json';
	file.raw = file.raw || (fs.existsSync || require('path').existsSync)(opts.file) ? fs.readFileSync(opts.file).toString() : null;
	file.disk = file.disk || Gun.obj.ify(file.raw || {graph: {}});
	file.disk.graph = file.disk.graph || {};
});
