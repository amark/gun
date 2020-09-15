;(function(){
	var Gun = (typeof window !== "undefined")? window.Gun : require('./gun');

	Gun.on('create', function(root){ // switch to DAM, deprecated old
		var opt = root.opt, mesh = opt.mesh;
		if(!mesh){ return }
		var asks = {};
		mesh.hear['nts'] = function(msg, peer){
			if(msg.nts){
				(asks[msg['@']]||noop)(msg);
				return;
			}
			mesh.say({dam: 'nts', nts: Gun.state(), '@': msg['#']}, peer);
		}
		var peers = 0;
		root.on('hi', function(peer){ this.to.next(peer);
			peers++;
			setTimeout(function ping(){
				var NTS = {}, ack = String.random(3), msg = {'#': ack, dam: 'nts'};
				NTS.start = Gun.state();
				asks[ack] = function(msg){
					NTS.end = Gun.state();
					delete asks[ack];
					NTS.latency = (NTS.end - NTS.start)/2;
					if(!msg.nts){ return }
					NTS.calc = NTS.latency + msg.nts;
					NTS.step = (NTS.end - NTS.calc)/2;
					Gun.state.drift -= NTS.step * (1/(peers||1));
					NTS.next = Math.min(2e4, Math.max(250, 150000 / Math.abs((NTS.end - NTS.calc)||1)));
					console.log("I am now", Gun.state(), "they are", NTS.calc, "time sync in", NTS.next/1000, 'sec.');
					setTimeout(ping, NTS.next); // Thanks @finwo ! https://discord.com/channels/612645357850984470/612645357850984473/755334349699809300
				}
				mesh.say(msg, peer);
			}, 1);
		});
		root.on('bye', function(peer){ --peers; this.to.next(peer) });
	});

	// test by opening up examples/game/nts.html on devices that aren't NTP synced.
}());