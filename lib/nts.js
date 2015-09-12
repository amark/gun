Gun.on('opt').event(function(gun, opt){
	if(!Gun.request){ return }
	var objectiveTimeOffset = 0;
	Gun.obj.map(opt.peers || gun.__.opt.peers, function(peer, url){
		var NTS = {};
		NTS.start = Gun.time.is();
		console.log(url + '.nts');
		Gun.request(url + '.nts', null, function(err, reply){
			console.log("reply", err, reply);
			if(err || !reply || !reply.body){
				return console.log("Network Time Synchronization not supported", err, (reply || {}).body);
			}
			NTS.end = Gun.time.is();
			NTS.latency = (NTS.end - NTS.start)/2;
			if(Gun.obj.has(reply.body, 'time')){ return }
			NTS.calc = reply.body.time + NTS.latency;
			objectiveTimeOffset += (objectiveTimeOffset - NTS.calc)/2;
			console.log('NTS', NTS.latency, NTS.calc, objectiveTimeOffset);
		}, {});
	});
});
// You need to figure out how to make me write tests for this!
// maybe we can do human based testing where we load a HTML that just
// prints out in BIG FONT the objectiveTime it thinks it is
// and we open it up on a couple devices.