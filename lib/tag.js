module.exports = function(root){ // THIS IS THE UNIVERSAL NOTIFICATION MODULE
	var to = {}, key = {}, mesh = root.opt.mesh, email = require('./email');
	if(email.err){ return }
	mesh.hear['tag'] = function(msg, peer, who){
		if(who = key[msg.key]){ who.rate = Math.max(msg.rate||1000*60*15, 1000*60); return }
		if(!msg.src || !msg.email){ return }
		if(+new Date < peer.emailed + 1000*60*2){ mesh.say({dam:'tag',err:'too fast'},peer); return } // peer can only send notifications > 2min
		var src; try{ src = new URL(msg.src = msg.src.split(/\s/)[0]); } catch(e){ return } // throws if invalid URL.
		(who = (to[msg.email] = to[msg.email] || {go:{}})).go[''+src] = 1; // we're keeping in-memory for now, maybe will "stay" to disk in future.
		peer.emailed = +new Date;
		mesh.say({dam:'tag',ok:'queued in-memory'},peer);
		if(who.batch){ return }
		key[who.key = Math.random().toString(36).slice(2)] = who;
		who.batch = setTimeout(function(){
			email.send({
				from: process.env.EMAIL,
				to: msg.email,
				subject: "Notification:",
				text: 'Someone or a bot tagged you at: (⚠️ only click link if you recognize & trust it ⚠️)\n'+
					'[use #'+who.key+' to unsubscribe please mute this thread by tapping the top most "⋮" button and clicking mute]\n\n' +
					Object.keys(who.go).join('\n'), // TODO: NEEDS TO BE CPU SCHEDULED
				headers: {'message-id': '<123456789.8765@example.com>'} // hardcode id so all batches also group into the same email thread to reduce clutter.
			}, function(err, r){
				who.batch = null; who.go = {};
				err && console.log("email TAG:", err);
			});
		}, who.rate || (1000*60*60*24)); // default to 1 day
	};
};