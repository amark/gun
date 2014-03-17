module.exports=require('theory')
({name: 'echo'
, state: {way:'state', flow:-1}
, invincible: true
//, dep: ['../gun']
, init: function(a){
	var echo = {};
	echo.put = function(m){
		console.log('stream', m);
	}
	echo.state = function(m){
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