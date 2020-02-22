;(function(){ try {
	var fs = require('fs'), logs = [], up = __dirname+'/../';
	fs.readdir(up, function(err, list){ try{
		var i = 0, f; while(f = list[i++]){
			if(0 === f.indexOf('isolate-') && '.log' === f.slice(-4)){ logs.push(f) }
		}
		logs = logs.sort();
		var i = 0, f, lf; while(f = list[i++]){
			if(0 <= f.indexOf('-v8-') && '.log' === f.slice(-4)){ lf = f }
		} f = lf;
		if(!f){ return }
		fs.rename(up+f, up+'v8.log', function(err,ok){
			var i = 0, f; while(f = logs[i++]){ fs.unlink(up+f, noop) }
			if(!process.env.EMAIL){ return } // ONLY EMAIL IF DEVELOPER OPTS IN!!!
			email(); // ONLY EMAIL IF DEVELOPER OPTS IN!!!
		});
	}catch(e){} });
	function noop(){};
	function email(){ try{
		if(!process.env.EMAIL){ return } // ONLY EMAIL IF DEVELOPER OPTS IN!!!
		var address = process.env.EMAIL || "mark@gun.eco";
		// you also have to specify your EMAIL_KEY gmail 2F' app's password (not reg) to send out.
		require('./email').send({
			text: "log attached",
			from: address,
			to: address,
			subject: "GUN V8 LOG",
			attachment:[{path: up+'v8.log', type:"text/plain", name:"v8.log"}]
		}, noop);
	}catch(e){} };
}catch(e){}
}());