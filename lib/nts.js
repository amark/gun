Gun.on('opt').event(function(gun, opt){
	var objectiveTimeOffset = 0;
	Gun.obj.map(opt.peers || gun.__.opt.peers, function(peer, url){
		var NTS = {};
		NTS.start = Gun.time.is();
		request(url, null, function(err, reply){
			if(err || !reply || !reply.body){
				return console.log("Network Time Synchronization error", err, (reply || {}).body);
			}
			NTS.end = Gun.time.is();
			NTS.latency = (NTS.end - NTS.start)/2;
			if(Gun.obj.has(reply.body, 'time')){ return }
			NTS.calc = reply.body.time + NTS.latency;
			objectiveTimeOffset += (objectiveTimeOffset - NTS.calc)/2;
		}, {});
	});
});