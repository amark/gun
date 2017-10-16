var Gun = require('gun/gun');
var Radisk = require('./radisk');
var fs = require('fs');
var Radix = Radisk.Radix;
var u;
var AWS = require('aws-sdk');

Gun.on('opt', function(ctx){
	this.to.next(ctx);
	var opt = ctx.opt;
	if(ctx.once){ return }
	if(!process.env.AWS_S3_BUCKET){ return }
	opt.batch = opt.batch || 10 * 1000;
	opt.wait = opt.wait || 1000 * 15;
	opt.size = opt.size || (1024 * 1024 * 10); // 10MB

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

	var store = function Store(){};
	store.put = function(file, data, cb){
		var params = {Bucket: opts.bucket, Key: file, Body: data};
    s3.putObject(params, cb);
	};
	store.get = function(file, cb){
		var params = {Bucket: opts.bucket, Key: file};
		s3.getObject(params, function(err, ack){
			if(!ack){ return cb(err) }
			var data = ack.Body;
			if(data){ data = data.toString() }
			console.log("HERE WE GO!", data);
			cb(err, data);
		});
	};
	store.list = function(cb, match, params){
		params = params || {Bucket: opts.bucket};
		s3.listObjectsV2(params, function(err, data){
			if(err){ return Gun.log(err, err.stack) }
			if(Gun.obj.map(data.Contents, function(content){
				return cb(content.Key);
			})){ return }
			if(!data.IsTruncated){ return cb() } // Stream interface requires a final call to know when to be done.
	    params.ContinuationToken = data.NextContinuationToken;
	    console.log("get further list...");
	    store.list(cb, match, params);
    });
	};
	//store.list(function(){ return true });
	return store;
}

module.exports = Store;