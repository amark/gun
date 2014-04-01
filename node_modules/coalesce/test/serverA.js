module.exports=require('theory')
({name: 'echo'
, state: {way:'state', flow:-1}
, invincible: true
, init: function(a){
	var echo = {};
	console.log("serverA online");
	echo.state = function(m){
		console.log('serverA state ->', m);
		m.what.body = 'serverA';
		a.com.reply(m);
	};
	echo.stream = function(m){
		console.log('serverA stream ->', m);
		if(!m || !m.what){ return }
		if(!m.what.spam){ m.what.spam = 0 }
		m.what.spam += 1;
		if(3 < m.what.spam){ return }
		a.com.reply(m);
	}
	return echo.stream;
}});