module.exports=require('theory')
({name: 'echo'
, state: {way:'state', flow:-1}
, invincible: true
, init: function(a){
	var echo = {};
	console.log("serverB online");
	echo.state = function(m){
		console.log('serverB state ->', m);
		m.what.body = 'serverA';
		a.com.reply(m);
	};
	echo.stream = function(m){
		console.log('serverB stream ->', m);
		if(!m || !m.what){ return }
		if(!m.what.spam){ m.what.spam = 0 }
		m.what.spam += 1;
		if(3 < m.what.spam){ return }
		a.com.reply(m);
	}
	a.time.wait(function(){
		console.log("serverB send message");
		a.com.send({here:'we go!'});
	},1000);
	return echo.stream;
}});