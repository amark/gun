var Gun = require('../gun');
var Radisk = require('./radisk');
var fs = require('fs');
var Radix = Radisk.Radix;
var u, AWS;

Gun.on('create', function(root){
	this.to.next(root);
	var opt = root.opt;
	if(!opt.s3 && !process.env.AWS_S3_BUCKET){ return }
	//opt.batch = opt.batch || (1000 * 10);
	//opt.until = opt.until || (1000 * 3); // ignoring these now, cause perf > cost
	//opt.chunk = opt.chunk || (1024 * 1024 * 10); // 10MB // when cost only cents

	try{AWS = require('aws-sdk');
	}catch(e){
		console.log("Please `npm install aws-sdk` or add it to your package.json !");
		AWS_SDK_NOT_INSTALLED;
	}

	var opts = opt.s3 || (opt.s3 = {});
	opts.bucket = opts.bucket || process.env.AWS_S3_BUCKET;
	opts.region = opts.region || process.env.AWS_REGION || "us-east-1";
	opts.accessKeyId = opts.key = opts.key || opts.accessKeyId || process.env.AWS_ACCESS_KEY_ID;
	opts.secretAccessKey = opts.secret = opts.secret || opts.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;

	if(opt.fakes3 = opt.fakes3 || process.env.fakes3){
		opts.endpoint = opt.fakes3;
		opts.sslEnabled = false;
		opts.bucket = opts.bucket.replace('.','p');
	}

	opts.config = new AWS.Config(opts);
	opts.s3 = opts.s3 || new AWS.S3(opts.config);

	opt.store = Object.keys(opts.s3).length === 0 ? opt.store : Store(opt);
});

function Store(opt){
	opt = opt || {};
	opt.file = String(opt.file || 'radata');
	var opts = opt.s3, s3 = opts.s3;
	var c = {p: {}, g: {}, l: {}};
	
	var store = function Store(){};
	if(Store[opt.file]){
		console.log("Warning: reusing same S3 store and options as 1st.");
		return Store[opt.file];
	}
	Store[opt.file] = store;

	store.put = function(file, data, cb){
		var params = {Bucket: opts.bucket, Key: file, Body: data};
		//console.log("RS3 PUT ---->", (data||"").slice(0,20));
		c.p[file] = data;
		delete c.g[file];//Gun.obj.del(c.g, file);
		delete c.l[1];//Gun.obj.del(c.l, 1);
    s3.putObject(params, function(err, ok){
    	delete c.p[file];
    	cb(err, 's3');
    });
	};
	store.get = function(file, cb){ var tmp;
		if(tmp = c.p[file]){ cb(u, tmp); return }
		if(tmp = c.g[file]){ tmp.push(cb); return }
		var cbs = c.g[file] = [cb];
		var params = {Bucket: opts.bucket, Key: file||''};
		//console.log("RS3 GET ---->", file);
		s3.getObject(params, function got(err, ack){
			if(err && 'NoSuchKey' === err.code){ err = u }
			//console.log("RS3 GOT <----", err, file, cbs.length, ((ack||{}).Body||'').length);//.toString().slice(0,20));
			delete c.g[file];//Gun.obj.del(c.g, file);
			var data, data = (ack||'').Body;
			//console.log(1, process.memoryUsage().heapUsed);
			var i = 0, cba; while(cba = cbs[i++]){ cba && cba(err, data) }//Gun.obj.map(cbs, cbe);
		});
	};
	store.list = function(cb, match, params, cbs){
		if(!cbs){
			if(c.l[1]){ return c.l[1].push(cb) }
			cbs = c.l[1] = [cb];
		}
		params = params || {Bucket: opts.bucket};
		//console.log("RS3 LIST --->");
		s3.listObjectsV2(params, function(err, data){
			//console.log("RS3 LIST <---", err, data, cbs.length);
			if(err){ return Gun.log(err, err.stack) }
			var IT = data.IsTruncated, cbe = function(cb){
				if(cb.end){ return }
				if(Gun.obj.map(data.Contents, function(content){
					return cb(content.Key);
				})){ cb.end = true; return }
				if(IT){ return }
				// Stream interface requires a final call to know when to be done.
				cb.end = true; cb();
			}
			Gun.obj.map(cbs, cbe);
			if(!IT){ Gun.obj.del(c.l, 1); return }
	    params.ContinuationToken = data.NextContinuationToken;
	  	store.list(cb, match, params, cbs);
    });
	};
	//store.list(function(){ return true });
	if(false !== opt.rfs){ require('./rfsmix')(opt, store) } // ugly, but gotta move fast for now.
	return store;
}

module.exports = Store;
