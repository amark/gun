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
		zip.execSync('zip -r flame *', {cwd: './flame'});
		require('./lib/fsrm')('./flame');
		require('./lib/email').send({
			text: "zip attached",
			from: "mark@gun.eco",
			to: "mark@gun.eco",
			subject: "TRACE GUN",
			attachment:[{path:"./flame.zip", type:"application/zip", name:"flame.zip"}]
		}, function(err){
			err && console.log("@@@@@@@@@@ EMAIL ERROR @@@@@@@@@@", err);
		})
		}catch(err){ console.log("@@@@@@@@@@ TRACE ERROR @@@@@@@@@", err) }},5000);
	}
	require('0x')({argv: ['./examples/http.js'], outputDir: 'flame', workingDir: __dirname, onProcessExit: go});
}());