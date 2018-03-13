var Gun = require('../gun');
var Radisk = require('./radisk');
var fs = require('fs');
var Radix = Radisk.Radix;
var u;

Gun.on('opt', function(ctx){
	this.to.next(ctx);
	var opt = ctx.opt;
	if(ctx.once){ return }
	if(false !== opt.localStorage && !process.env.AWS_S3_BUCKET){ return } // TODO: Remove this after migration.
	if(false === opt.radisk){ return }
	console.log("BUG WARNING: Radix Storage Engine (RSE) has a known rare edge case, if data gets split between file chunks, a GET may only return the first chunk!!!");
	opt.store = opt.store || Store(opt);
	var rad = Radisk(opt);

	ctx.on('put', function(at){
		this.to.next(at);
		var id = at['#'], track = !at['@'], acks = track? 0 : u; // only ack non-acks.
		Gun.graph.is(at.put, null, function(val, key, node, soul){
			if(track){ ++acks }
			val = Radisk.encode(val)+'>'+Radisk.encode(Gun.state.is(node, key));
			rad(soul+'.'+key, val, (track? ack : u));
		});
		function ack(err, ok){
			acks--;
			if(ack.err){ return }
			if(ack.err = err){
				ctx.on('in', {'@': id, err: Gun.log(err)});
				return;
			}
			if(acks){ return }
			ctx.on('in', {'@': id, ok: 1});
		}
	});

	ctx.on('get', function(at){
		this.to.next(at);
		var id = at['#'], soul = at.get['#'], key = at.get['.']||'', tmp = soul+'.'+key, node;
		rad(tmp, function(err, val){
			if(val){
				Radix.map(val, each);
				if(!node){ each(val, key) }
			}
			ctx.on('in', {'@': id, put: Gun.graph.node(node), err: err? err : u});
		});
		function each(val, key){
			tmp = val.lastIndexOf('>');
			var state = Radisk.decode(val.slice(tmp+1));
			val = Radisk.decode(val.slice(0,tmp));
			node = Gun.state.ify(node, key, state, val, soul);
		}
	});

});

function Store(opt){
	opt = opt || {};
	opt.file = String(opt.file || 'radata');

	var store = function Store(){};
	store.put = function(file, data, cb){
		var random = Math.random().toString(36).slice(-3)
		fs.writeFile(opt.file+'-'+random+'.tmp', data, function(err, ok){
			if(err){ return cb(err) }
			fs.rename(opt.file+'-'+random+'.tmp', opt.file+'/'+file, cb);
		});
	};
	store.get = function(file, cb){
		fs.readFile(opt.file+'/'+file, function(err, data){
			if(err){
				if('ENOENT' === (err.code||'').toUpperCase()){
					return cb(null);
				}
				Gun.log("ERROR:", err)
			}
			if(data){ data = data.toString() }
			cb(err, data);
		});
	};
	store.list = function(cb, match){
		fs.readdir(opt.file, function(err, dir){
			Gun.obj.map(dir, cb) || cb(); // Stream interface requires a final call to know when to be done.
		});
	};
	if(!fs.existsSync(opt.file)){ fs.mkdirSync(opt.file) }
	//store.list(function(){ return true });
	return store;
}

module.exports = Store;


;(function(){
	return;
	process.env.AWS_S3_BUCKET = 'test-s3';
	process.env.AWS_ACCESS_KEY_ID = 'asdf';
	process.env.AWS_SECRET_ACCESS_KEY = 'fdsa';
	process.env.fakes3 = 'http://localhost:4567';
	process.env.AWS_S3_THROTTLE = 0;

	return;
	global.Gun = require('../gun');
	//require('./rs3');
	
	
	require('../test/abc');
}());