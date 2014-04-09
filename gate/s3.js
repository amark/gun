module.exports=require('theory')
('s3', function(a){
	var AWS = a['aws-sdk'], conf = {}, dev = process.env.fakes3;
	AWS.config.region = conf.region = process.env.AWS_REGION || "us-east-1";
	AWS.config.accessKeyId = conf.accessKeyId = process.env.AWS_ACCESS_KEY_ID || 'abc';
	AWS.config.secretAccessKey = conf.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || 'a1b2c3';
	if(dev){
		AWS.config.endpoint = conf.endpoint = dev;
		AWS.config.sslEnabled = conf.sslEnabled = false;
	}
	AWS.config.update(conf);
	function s3(db){
		db = db || conf.s3Bucket || (conf.s3Bucket = process.env.s3Bucket);
		if(dev){
			db = db.replace('.','p');
		}
		s3.bucket = db;
		return s3;
	}; var S3 = function(){
		var s = new AWS.S3();
		if(dev){
			s.endpoint = conf.endpoint;
		}
		return s;
	}
	S3.batch = function(m, cb){
		var id = S3.batch.id(m);
		if(a.list.is(S3.batch.list[id])){
			S3.batch.list[id].push(cb);
			return true;
		}
		S3.batch.list[id] = [cb];
	}
	S3.batch.list = {};
	S3.batch.id = function(m){ return m.Bucket +'/'+ m.Key }
	S3.batch.reply = function(m,e,d,t,r){
		var id = S3.batch.id(m);
		a.list(S3.batch.list[id]).each(function(cb){
			if(a.fns.is(cb)){
				try{
					cb(e,d,t,r);
				}catch(e){}
			}
		});
		S3.batch.list[id] = null;
		delete S3.batch.list[id];
	}
	
	s3.put = function(key, o, cb, m){
		if(!key) return;
		var m = m || {
			Bucket: s3.bucket
			,Key: key
		}
		if(a.obj.is(o) || a.list.is(o)){
			m.Body = a.text.ify(o);
			m.ContentType = a.mime.lookup('json')
		} else {
			m.Body = a.text.ify(o);
		}
		S3().putObject(m, function(e,r){
			//console.log('saved', e,r);
			if(!cb) return;
			cb(e,r);
		});
		return s3;
	}
	s3.get = function(key, cb, o){
		if(!key) return;
		var m = {
			Bucket: s3.bucket
			,Key: key
		};
		if(S3.batch(m,cb)){ console.log('no!', m.Bucket + m.Key); return }
		console.log("s3 info:", m);
		S3().getObject(m, function(e,r){
			var d, t, r = r || (this && this.httpResponse);
			if(e || !r){ return S3.batch.reply(m,e) }
			r.Text = r.text = t = (r.Body||r.body||'').toString('utf8');
			r.Type = r.type = r.ContentType || (r.headers||{})['content-type'];
			if(r.type && 'json' === a.mime.extension(r.type)){
				d = a.obj.ify(t);
			}
			S3.batch.reply(m, e, d, t, r); // Warning about the r parameter, is is the raw response and may result in stupid SAX errors.
		});
		return s3;
	}
	s3.del = function(key, cb){
		if(!key) return;
		var m = {
			Bucket: s3.bucket
			,Key: key
		}
		S3().deleteObject(m, function(e,r){
			if(!cb) return;
			cb(e, r);
		});
		return s3;
	}
	s3.dbs = function(o, cb){
		cb = cb || o;
		var m = {}
		S3().listBuckets(m, function(e,r){
			//console.log('dbs',e);
			a.list((r||{}).Contents).each(function(v){console.log(v);});
			//console.log('---end list---');
			if(!a.fns.is(cb)) return;
			cb(e,r);
		});
		return s3;
	}
	s3.keys = function(from, upto, cb){
		cb = cb || upto || from;
		var m = {
			Bucket: s3.bucket
		}
		if(a.text.is(from)){
			m.Prefix = from;
		}
		if(a.text.is(upto)){
			m.Delimiter = upto;
		}
		S3().listObjects(m, function(e,r){
			//console.log('list',e);
			a.list((r||{}).Contents).each(function(v){console.log(v);});
			//console.log('---end list---');
			if(!a.fns.is(cb)) return;
			cb(e,r);
		});
		return s3;
	}
	return s3;
},['aws-sdk','mime']);