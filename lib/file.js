// This was written by the wonderful Forrest Tait
// modified by Mark to be part of core for convenience
// twas not designed for production use
// only simple local development.
var Gun = require('../gun'),
	fs = require('fs'),
	file = {};

Gun.on('put', function(at){
	if(!file.use){ return }
	var graph = at.put, Graph = file.gun._.graph, opt = at.opt || {};
	Gun.obj.map(graph, function(node, soul){
		file.disk.graph[soul] = Graph[soul] || graph[soul];
	});
	graph = JSON.stringify(file.disk, null, 2);
	fs.writeFile(opt.file || file.file, graph, function(err){
		file.gun.on('in', {
			'@': at['#'],
			ok: err? undefined : 1,
			err: err
		});
	});
});

Gun.on('get', function(at){
	if(!file.use){ return }
	var soul = at.get['#'];
	if(!soul){ return }
	var node = file.disk.graph[soul];
	if(Gun.obj.has(at.get, '.')){
		node = field(node, at.get['.']);
	}
	file.gun.on('in', {
		put: Gun.graph.node(node),
		'@': at['#']
	})
});

function field(node, field){
	if(!node){ return }
	var tmp = node[field];
	node = {_: node._};
	if(u !== tmp){
		node[field] = tmp;
	}
	tmp = node._;
	if(tmp['>']){
		tmp['>'] = Gun.obj.put({}, field, tmp['>'][field]);
	}
	return node;
}

Gun.on('opt', function(at){
	var gun = at.gun, opt = at.opt;
	if ((opt.file === false) || (opt.s3 && opt.s3.key)) {
		return; // don't use this plugin if S3 is being used.
	}
	Gun.log.once(
		'file-warning',
		'WARNING! This `file.js` module for gun is ' +
		'intended for local development testing only!'
	);
	file.use = true;
	file.file = String(opt.file || file.file || 'data.json');
	file.raw = file.raw || (fs.existsSync || require('path').existsSync)(opt.file) ? fs.readFileSync(opt.file).toString() : null;
	file.disk = file.disk || Gun.obj.ify(file.raw || {graph: {}});
	file.disk.graph = file.disk.graph || {};
	file.gun = gun;
});

function test(){
	var gun = Gun(), i = 2000, expect = 0;
	while(--i){
		expect += i;
		gun.get('test/' + i).put({ index: i });
	}
	setTimeout(function(){
		var graph = Gun.obj.ify(fs.readFileSync('data.json').toString()).graph;
		var count = 0;
		Gun.obj.map(graph, function(node){
			count += node.index;
		})
		console.log(expect === count? "SUCCESS!" : "FAIL!");
	},100);
}
//test();
