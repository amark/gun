module.exports=require('theory')
({name: 'echo'
, state: {way:'state', flow:-1}
, invincible: true
, dep: ['../shots']
, init: function(a){
	console.log("ECHO");
	var echo = {}, redis, client;
	echo.shot = a.shots();
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
		if(echo.shot.server(m,a.com.reply)){ return }
		m.what.body = '';
		a.com.reply(m);
	};
	/*echo.shot.stream.on(function(m){
		console.log('stream on!', m);
	});*/
	return echo;
}});