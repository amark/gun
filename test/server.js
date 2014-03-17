module.exports=require('theory')
({name: 'echo'
, state: {way:'state', flow:-1}
, invincible: true
, dep: ['../shots']
, init: function(a){
	console.log("ECHO");
	var echo = {}, redis, client;
	echo.put = function(m){
		console.log('stream', m);
	}
	echo.state = function(m){
		redis = redis || require('redis')
		, client = client || redis.createClient();
		client.set("string key", "string val", redis.print);
		client.get("string key", function(e,r){
			console.log("WE DID IT!!!!");
			console.log(e, r);
		});
		var w = echo.get(m);
		console.log('state', w);
		if(w){
			m.what.body = 1;
		}
		a.com.reply(m);
	};
	echo.get = function(m){	
		return !a.obj.empty(a(m,'what.form'))? a(m,'what.form')
			: !a.obj.empty(a(m,'what.url.query'))? a(m,'what.url.query')
			: false ;
	};
	return echo;
}});