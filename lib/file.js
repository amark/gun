// This was written by the wonderful Forrest Tait
// modified by Mark to be part of core for convenience
// twas not designed for production use
// only simple local development.
var Gun = require('../gun'),
	fs = require('fs');

Gun.on('put', function(at){
	this.to.next(at);
	var fileOpt =  at.gun.back('opt._file') 
	if(!fileOpt.use){ return }
	var graph = at.put, opt = at.opt || {};
	var Graph = fileOpt.gun._.graph
	
	Gun.obj.map(graph, function(node, soul){
		fileOpt.disk.graph[soul] = Graph[soul] || graph[soul];
	});
	graph = JSON.stringify(fileOpt.disk, null, 2);
	// TODO: Allow for a `fs.writeFile` compatible module, that is more reliable/safe, to be passed in through the options.
	fs.writeFile(opt.file || fileOpt.file, graph, function(err){
		fileOpt.gun.on('in', {
			'@': at['#'],
			ok: err? undefined : 1,
			err: err
		});
	});
});

Gun.on('get', function(at){
	this.to.next(at);
	var fileOpt =  at.gun.back('opt._file') 
	if(!fileOpt.use){ return }
	var opt = at.opt || {};
	var soul = at.get['#'];
	if(!soul){ return }
	var node = fileOpt.disk.graph[soul];
	if(Gun.obj.has(at.get, '.')){
		node = field(node, at.get['.']);
	}
	fileOpt.gun.on('in', {
		put: Gun.graph.node(node),
		'@': at['#']
	})
});

function field(node, field){
	if(!node){ return }
	node = Gun.obj.copy(node);
	var tmp = node[field];
	node = {_: node._};
	if(undefined !== tmp){
		node[field] = tmp;
	}
	tmp = node._;
	if(tmp['>']){
		tmp['>'] = Gun.obj.put({}, field, tmp['>'][field]);
	}
	return node;
}

Gun.on('opt', function(at){
	this.to.next(at);
	var gun = at.gun, opt = at.opt;
	if ((opt.file === false) || (opt.s3 && opt.s3.key)) {
		opt._file = {};
		opt._file.use = false;
		return; // don't use this plugin if S3 is being used.
	}
	Gun.log.once(
		'file-warning',
		'WARNING! This `file.js` module for gun is ' +
		'intended for local development testing only!'
	);
	opt._file = {};
	opt._file.use = true;
	opt._file.file = String(opt.file || opt._file.file || 'data.json');
	opt._file.raw = opt._file.raw || ((fs.existsSync || require('path').existsSync)(opt._file.file) ? fs.readFileSync(opt._file.file).toString() : null);
	opt._file.disk = opt._file.disk || Gun.obj.ify(opt._file.raw || {graph: {}});
	opt._file.disk.graph = opt._file.disk.graph || {};
	opt._file.gun = gun;
});

(function test(){
	return;
	try{
		var graph = Gun.obj.ify(fs.readFileSync('data.json').toString()).graph;
		var read;
		Gun().get('test/5').path('index').val(function(data){
			read = data;
		});
		console.log((5 === read)? "READ SUCCESS" : "FAIL");
	}catch(e){
		var gun = Gun(), i = 100, expect = 0;
		while(--i){
			expect += i;
			gun.get('test/' + i).put({ index: i, test: true });
		}
		setTimeout(function(){
			var graph = Gun.obj.ify(fs.readFileSync('data.json').toString()).graph;
			var count = 0;
			Gun.obj.map(graph, function(node){
				count += node.index;
			});
			console.log((expect && expect === count)? "WRITE SUCCESS! - RUN AGAIN" : "FAIL!");
		},100);
	};
}());
