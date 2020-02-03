;(async function start(){
	var z;
	try{ z = require('0x');
	} catch(e){
		return require('./examples/http.js');
	}
	function go(){
		start();
		setTimeout(function(){try{
		var zip = require("child_process");
		zip.execSync('zip -r flametracedata.zip flamedata/');
		require('./lib/fsrm')('./flamedata');
		require('./lib/email').send({
			text: "zip attached",
			from: "mark@gun.eco",
			to: "mark@gun.eco",
			subject: "TRACE GUN",
			attachment:[{path: __dirname+"/flametracedata.zip", type:"application/zip", name:"flametracedata.zip"}]
		}, function(err){
			if(!err){ return }
			console.log("@@@@@@@@@@ EMAIL ERROR @@@@@@@@@@", err);
			require('./lib/email').send({text: "check https://gunjs.herokuapp.com/gun/flametracedata.zip", from: "mark@gun.eco", to: "mark@gun.eco", subject: "TRACE GUN CHECK"}, function(err){});
		})
		}catch(err){ console.log("@@@@@@@@@@ TRACE ERROR @@@@@@@@@", err) }},5000);
	}
	require('0x')({argv: ['./examples/http.js'], outputDir: 'flamedata', workingDir: __dirname, onProcessExit: go});
}());