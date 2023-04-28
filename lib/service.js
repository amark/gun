module.exports = function(root){
	var mesh = root.opt.mesh, cmd = {}, run = require('child_process').exec, fs = require('fs'), home = require('os').homedir(), examp = require('path').resolve(__dirname, '../examples');
	mesh.hear['service'] = function(msg, peer){
		if(!fs.existsSync('/lib/systemd/system/relay.service')){
			mesh.say({dam: '!', err: "Not serviced."});
			return;
		}
		try{ (cmd[msg.try]||cmd.any)(msg, peer); }catch(err){ mesh.say({dam: '!', err: "service error: "+err}) }
	}
	cmd.https = function(msg, peer){ var log;
		if(!msg.email || !msg.domain){
			mesh.say({dam: '!', err: 'Domain/email missing, use `location.hostname`!'});
			return;
		}
		if(fs.existsSync(home+'/cert.pem')){
			mesh.say({dam: '!', err: 'Cert already exists.'});
			return;
		}
		fs.writeFile(examp+'/../email', msg.email, function(){});
		run("bash "+examp+"/https.sh", {env: {'EMAIL': msg.email, 'WEB': examp, 'DOMAIN':  msg.domain}}, function(e, out, err){
			log = "|"+e+"|"+out+"|"+err;
			mesh.say({dam: '!', log: ''+log}, peer);
			setTimeout(function(){ process.exit() },999);
		});
	}
	cmd.update = function(msg, peer){ var log, pass;
		try{ pass = (''+fs.readFileSync(home+'/pass')).trim() }catch(e){}
		if(!pass || (msg.pass||'').trim() != pass){ return }
		root.stats.stay.updated = +new Date;
		run("bash "+examp+"/install.sh", {env: {VERSION: msg.version||''}}, function(e, out, err){
			log = e+"|"+out+"|"+err;
			mesh.say({dam: '!', log: ''+log}, peer);
			setTimeout(function(){ process.exit() },999);
		});
	}
	;(function update(){ var last;
		if(!fs.existsSync(home+'/cert.pem')){ return }
		setTimeout(update, 1000*60*60*24);
		last = root.stats.stay.updated || 0;
		if(+new Date - last < 1000*60*60*24*15){ return }
		root.stats.stay.updated = +new Date;
		run("bash "+examp+"/install.sh", {}, function(){});
	}());

	cmd.any = function(){};

};