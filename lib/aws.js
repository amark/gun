;module.exports = (function(a, own){

	function s3(opt){
		if(!(a.fns.is(this) || this instanceof s3)){
			return new s3(opt);
		}
		var s = this;
		s.on = a.on.create();
		s.mime = require('mime');
		s.AWS = require('aws-sdk');
		s.config = {};
		opt = opt || {};
		s.AWS.config.bucket = s.config.bucket = opt.bucket || opt.Bucket || s.config.bucket || process.env.AWS_S3_BUCKET;
		s.AWS.config.region = s.config.region = opt.region || s.config.region || process.env.AWS_REGION || "us-east-1";
		s.AWS.config.accessKeyId = s.config.accessKeyId = opt.key = opt.key || opt.accessKeyId || s.config.accessKeyId || process.env.AWS_ACCESS_KEY_ID;
		s.AWS.config.secretAccessKey = s.config.secretAccessKey = opt.secret || opt.secretAccessKey || s.config.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;
		if(s.config.fakes3 = s.config.fakes3 || opt.fakes3 || process.env.fakes3){
			s.AWS.config.endpoint = s.config.endpoint = opt.fakes3 || s.config.fakes3 || process.env.fakes3;
			s.AWS.config.sslEnabled = s.config.sslEnabled = false;
			s.AWS.config.bucket = s.config.bucket = s.config.bucket.replace('.','p');
		}
		s.AWS.config.update(s.config);
		s.S3 = function(){
			var s = new this.AWS.S3();
			if(this.config.fakes3){
				s.endpoint = config.endpoint;
			}
			return s;
		}
		return s;
	};
	s3.id = function(m){ return m.Bucket +'/'+ m.Key }
	s3.chain = s3.prototype;
	s3.chain.PUT = function(key, o, cb, m){
		if(!key){ return }
		m = m || {}
		m.Bucket = m.Bucket || this.config.bucket;
		m.Key = m.Key || key;
		if(a.obj.is(o) || a.list.is(o)){
			m.Body = a.text.ify(o);
			m.ContentType = this.mime.lookup('json')
		} else {
			m.Body = a.text.is(o)? o : a.text.ify(o);
		}
		this.S3().putObject(m, function(e,r){
			//a.log('saved', e,r);
			if(!cb){ return }
			cb(e,r);
		});
		return this;
	}
	s3.chain.GET = function(key, cb, o){
		if(!key){ return }
		var s = this
		, m = {
			Bucket: s.config.bucket
			,Key: key
		}, id = s3.id(m);
		s.on(id).once(function(e,d,t,m,r){
			delete s.batch[id];
			if(!a.fns.is(cb)){ return }
			try{ cb(e,d,t,m,r);
			}catch(e){
				console.log(e);
			}
		});
		s.batch = s.batch || {};
		if(s.batch[id]){ return s }
		s.batch[id] = (s.batch[id] || 0) + 1;
		a.log("no batch!");
		s.S3().getObject(m, function(e,r){
			var d, t, m;
			r = r || (this && this.httpResponse);
			if(e || !r){ return s.on(id).emit(e) }
			r.Text = r.text = t = (r.Body||r.body||'').toString('utf8');
			r.Type = r.type = r.ContentType || (r.headers||{})['content-type'];
			if(r.type && 'json' === s.mime.extension(r.type)){
				d = a.obj.ify(t);
			}
			m = r.Metadata;
			s.on(id).emit(e, d, t, m, r); // Warning about the r parameter, is is the raw response and may result in stupid SAX errors.
		});
		return s;
	}
	s3.chain.del = function(key, cb){
		if(!key){ return }
		var m = {
			Bucket: this.config.bucket
			,Key: key
		}
		this.S3().deleteObject(m, function(e,r){
			if(!cb){ return }
			cb(e, r);
		});
		return this;
	}
	s3.chain.dbs = function(o, cb){
		cb = cb || o;
		var m = {}
		this.S3().listBuckets(m, function(e,r){
			//a.log('dbs',e);
			a.list.map((r||{}).Contents, function(v){console.log(v);});
			//a.log('---end list---');
			if(!a.fns.is(cb)) return;
			cb(e,r);
		});
		return this;
	}
	s3.chain.keys = function(from, upto, cb){
		cb = cb || upto || from;
		var m = {
			Bucket: this.config.bucket
		}
		if(a.text.is(from)){
			m.Prefix = from;
		}
		if(a.text.is(upto)){
			m.Delimiter = upto;
		}
		this.S3().listObjects(m, function(e,r){
			//a.log('list',e);
			a.list.map((r||{}).Contents, function(v){console.log(v)});
			//a.log('---end list---');
			if(!a.fns.is(cb)) return;
			cb(e,r);
		});
		return this;
	}
	return s3;
})(require('../gun'), {});
/**
Knox S3 Config is:
knox.createClient({
    key: ''
  , secret: ''
  , bucket: ''
  , endpoint: 'us-standard'
  , port: 0
  , secure: true
  , token: ''
  , style: ''
  , agent: ''
});

aws-sdk for s3 is:
{ "accessKeyId": "akid", "secretAccessKey": "secret", "region": "us-west-2" }
AWS.config.loadFromPath('./config.json');
 {
	accessKeyId: process.env.AWS_ACCESS_KEY_ID = ''
	,secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY = ''
	,Bucket: process.env.s3Bucket = ''
	,region: process.env.AWS_REGION = "us-east-1"
	,sslEnabled: ''
}
**/
