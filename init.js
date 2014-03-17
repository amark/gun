process.env.rootdir = __dirname;
console.log(">>>>>>>>>>>>>>>>>>>> environment", process.env.NODE_ENV, process.env.PORT);
var LIVE = process.env.LIVE || (process.env.NODE_ENV === 'production')
, web = require(process.env.COALESCEPATH = LIVE?'coalesce':process.env.rootdir+'/../coalesce/coalesce')
, opt = {};
opt.port = LIVE? 80 : 8888 ;
process.env.domain = LIVE? 'http://gunjs.herokuapp.com' : 
	(function(){require('child_process').exec('ifconfig',function(e,r){
		console.log('on',process.env.domain='http://'+ r.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/)[0] +':'+opt.port)
	})})();
opt.hook = {
	pre: (function(req,res){
		//console.log("--------- "+req.flow+" : "+req.url.pathname +" ---------------");
	})
};

opt.run = [];

web(opt);
console.log("Gun @ "+ opt.port);