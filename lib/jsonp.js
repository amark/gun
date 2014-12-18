var Gun = require('../gun');
module.exports = function(req, cb){
	if(!req.url || !req.url.query || !req.url.query.jsonp){ return cb }
	cb.jsonp = req.url.query.jsonp;
	delete req.url.query.jsonp;
	Gun.obj.map(Gun.obj.ify(req.url.query['`']), function(val, i){
		req.headers[i] = val;
	});
	delete req.url.query['`'];
	if(req.url.query.$){
		req.body = req.url.query.$;
		if(!Gun.obj.has(req.url.query, '^') || 'json' == req.url.query['^']){
			req.body = Gun.obj.ify(req.body); // TODO: BUG! THIS IS WRONG! This doesn't handle multipart chunking, and will fail!
		}
	}
	delete req.url.query.$;
	delete req.url.query['^'];
	delete req.url.query['%'];
	var reply = {headers:{}};
	return function(res){
		if(!res){ return }
		if(res.headers){
			Gun.obj.map(res.headers, function(val, field){
				reply.headers[field] = val;
			});
		}
		reply.headers['Content-Type'] = "text/javascript";
		if(Gun.obj.has(res,'chunk') && (!reply.body || Gun.list.is(reply.chunks))){
			(reply.chunks = reply.chunks || []).push(res.chunk);
		}
		if(Gun.obj.has(res,'body')){
			reply.body = res.body; // self-reference yourself so on the client we can get the headers and body.
			reply.body = ';'+ cb.jsonp + '(' + Gun.text.ify(reply) + ');'; // javascriptify it! can't believe the client trusts us.
			cb(reply);
		}
	}
}
