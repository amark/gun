(function(){

console.log("RHC GO FOR THIS");
console.log(process.env.OPENSHIFT_NODEJS_IP);
console.log(process.env.OPENSHIFT_NODEJS_PORT, process.env.PORT, process.env.VCAP_APP_PORT);

var http = require('http');

var server = http.createServer(function(req, res) {
    res.writeHead(200);
    res.end('Hello Shift');
});
server.listen(process.env.OPENSHIFT_NODEJS_PORT);

return;


process.env.rootdir = __dirname;
var LIVE = process.env.LIVE || (process.env.NODE_ENV === 'production')
, web = require('coalesce')
, opt = {};
opt.port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || process.env.VCAP_APP_PORT || 8888;
opt.host = process.env.OPENSHIFT_NODEJS_IP || '';


opt.hook = {
	pre: (function(req,res){
		//console.log("--------- "+req.flow+" : "+req.url.pathname +" ---------------");
	})
};

if(LIVE){
	//process.env['redis-install'] = '/tmp';
}

opt.run = ['./test/server', './test/tests'];
opt.node = {key: "temp gun key", src:["http://gunjs.herokuapp.com/com","http://marknadal.kd.io/com","http://gunjs.aws.af.cm/com"]};

web(opt); 
console.log("Gun @ "+ opt.port);

})();