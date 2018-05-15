var Gun = require('../gun');
var Radisk = require('./radisk');
var fs = require('fs');
var Radix = Radisk.Radix;
var u, AWS;

Gun.on('opt', function(ctx){
	this.to.next(ctx);
	var opt = ctx.opt;
	if(ctx.once){ return }
	if(!process.env.AWS_S3_BUCKET){ return }
	opt.batch = opt.batch || (1000 * 10);
	opt.thrash = opt.thrash || (1000 * 15);
	opt.size = opt.size || (1024 * 1024 * 10); // 10MB

	try{AWS = require('aws-sdk');
	}catch(e){
		console.log("aws-sdk is no longer included by default, you must add it to your package.json! `npm install aws-sdk`.");
		AWS_SDK_NOT_INSTALLED;
	}

	var opts = opt.s3 || (opt.s3 = {});
	opts.bucket = opts.bucket || process.env.AWS_S3_BUCKET;
	opts.region = opts.region || process.AWS_REGION || "us-east-1";
	opts.accessKeyId = opts.key = opts.key || opts.accessKeyId || process.env.AWS_ACCESS_KEY_ID;
	opts.secretAccessKey = opts.secret = opts.secret || opts.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;

	if(opt.fakes3 = opt.fakes3 || process.env.fakes3){
		opts.endpoint = opt.fakes3;
		opts.sslEnabled = false;
		opts.bucket = opts.bucket.replace('.','p');
	}

	opts.config = new AWS.Config(opts);
	opts.s3 = opts.s3 || new AWS.S3(opts.config);

	opt.store = opt.store || Store(opt);
});

function Store(opt){
	opt = opt || {};
	opt.file = String(opt.file || 'radata');
	var opts = opt.s3, s3 = opts.s3;
	var c = {p: {}, g: {}, l: {}};

	var store = function Store(){};
	store.put = function(file, data, cb){
		var params = {Bucket: opts.bucket, Key: file, Body: data};
		//console.log("RS3 PUT ---->", (data||"").slice(0,20));
		Gun.obj.del(c.g, file);
		Gun.obj.del(c.l, 1);
    s3.putObject(params, cb);
	};
	store.get = function(file, cb){
		if(c.g[file]){ return c.g[file].push(cb) }
		var cbs = c.g[file] = [cb];
		var params = {Bucket: opts.bucket, Key: file||''};
		//console.log("RS3 GET ---->", file);
		s3.getObject(params, function(err, ack){
			//console.log("RS3 GOT <----", err, file, cbs.length, ((ack||{}).Body||'').toString().slice(0,20));
			Gun.obj.del(c.g, file);
			var data, cbe = function(cb){
				if(!ack){ cb(null); return; }
				cb(err, data);
			};
			if(data = (ack||{}).Body){ data = data.toString() }
			Gun.obj.map(cbs, cbe);
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
	return store;
}

module.exports = Store;