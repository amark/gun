Gun.on('opt').event(function(gun, opt){
	if(!gun.tab || !gun.tab.request){ return }
	Gun.time.now.drift = 0;
	function ping(){
		Gun.obj.map(opt.peers || gun.__.opt.peers, function(peer, url){
			var NTS = {};
			NTS.start = Gun.time.now();
			gun.tab.request(url, null, function(err, reply){
				if(err || !reply || !reply.body){
					return console.log("Network Time Synchronization not supported", err, (reply || {}).body);
				}
				NTS.end = Gun.time.now();
				NTS.latency = (NTS.end - NTS.start)/2;
				if(!Gun.obj.has(reply.body, 'time')){ return }
				NTS.calc = NTS.latency + reply.body.time;
				Gun.time.now.drift -= (NTS.end - NTS.calc)/2;
				setTimeout(ping, 250);
			}, {url: {pathname: '.nts'}});
		});
	}; ping();
});
// You need to figure out how to make me write tests for this!
// maybe we can do human based testing where we load a HTML that just
// prints out in BIG FONT the objectiveTime it thinks it is
// and we open it up on a couple devices.