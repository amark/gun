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
	fs.writeFile(String(path), Gun.text.ify(disk), function(err) {
		var batch = queuedWrites.splice(0);
		isWriting = false;
		at.cb(err);
		if(batch.length){
			writeFile(path, disk, {cb: function(err) {
				batch.forEach( function(at) { at.cb(err); } )
	    }});
	  }
	});
}

Gun.on('put', function(at){
	var gun = at.gun, graph = at.graph, opt = at.opt;
	Gun.obj.map(gun.__.graph, function(node, soul){
		file.disk.graph[soul] = gun.__.graph[soul] || graph[soul];
	});
	writeFile(opt.file || file.file, file.disk, at);
});
Gun.on('get', function(at){
	var gun = at.gun, lex = at.lex, opt = at.opt;
	at.cb(null, file.disk.graph[lex.soul]);
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