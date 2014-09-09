module.exports=require('theory')
({name: 'echo'
, state: {way:'state', flow:-1}
, invincible: true
, dep: ['../shots']
, init: function(a){
	var echo = {}, redis, client;
	echo.shot = a.shots();
	echo.put = function(m){
		console.log('stream', m);
	}
	echo.state = function(m){
		if(echo.shot.server(m,a.com.reply)){ return }
		m.what.body = 'module.exports = {boo: "yay"};';
		m.what.type = 'js';
		a.com.reply(m);
	};
	/*echo.shot.stream.on(function(m){
		console.log('stream on!', m);
	});*/
	return echo;
}});