// This was written by the wonderful Forrest Tait
// modified by Mark to be part of core for convenience
// twas not designed for production use
// only simple local development.
var Gun = require('../gun'),
	fs = require('fs');

var files = {};

Gun.on('put', function(at){
	//console.log("file write", Gun.obj.copy(at), at.gun.back(-1)._.opt.file);
	this.to.next(at);

	var root = at.gun.back(-1);
	var f =  at.gun.back('opt._file') 
	if(!f.use){ return }
	var graph = at.put, opt = at.opt || {};
	var Graph = f.gun._.graph
	Gun.obj.map(graph, function(node, soul){
		f.disk.graph[soul] = Graph[soul] || graph[soul];
	});
	f.count = (f.count || 0) + 1;
	if(!at['@']){ // don't ack other acks!
		(f.check || (f.check = {}))[at['#']] = root;
	}
	function save(){
		clearTimeout(f.wait);
		var ack = f.check;
		f.count = 0;
		f.wait = false;
		f.check = {};
		graph = JSON.stringify(f.disk, null, 2);
		// TODO: Allow for a `fs.writeFile` compatible module, that is more reliable/safe, to be passed in through the options.
		fs.writeFile(opt.file || f.file, graph, function(err){
			Gun.obj.map(ack, function(root, id){
				root.on('in', {
					'@': id,
					ok: err? undefined : 1,
					err: err || undefined
				});
			});
		});
	}
	if(f.count >= 10000){ // goal is to do 10K inserts/second.
		return save();
	}
	if(f.wait){ return }
	clearTimeout(f.wait);
	f.wait = setTimeout(save, 1000);
});

Gun.on('get', function(at){
	var fileOpt =  at.gun.back('opt._file');
	//if(at.cap && fileOpt.use){ at.cap-- }
	this.to.next(at);
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
		'@': at['#'],
		how: 'file'
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
	opt._file.disk = files[opt._file.file] = files[opt._file.file] || opt._file.disk || Gun.obj.ify(opt._file.raw || {graph: {}});
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
