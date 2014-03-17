module.exports=require('theory')
({name: 'blah'
, state: {way:'state', flow:-1}
, invincible: true
, dep: ['../shots']
, init: function(a){
	console.log("BLAH");
	var blah = {};
	blah.put = function(m){
		console.log('stream', m);
	}
	blah.state = function(m){
		var w = blah.get(m);
		console.log('state', w);
		if(w){
			m.what.body = 1;
		}
		a.com.reply(m);
	};
	blah.get = function(m){	
		return !a.obj.empty(a(m,'what.form'))? a(m,'what.form')
			: !a.obj.empty(a(m,'what.url.query'))? a(m,'what.url.query')
			: false ;
	};
	return blah;
}});