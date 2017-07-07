;(function(){
	// NOTE: While the algorithm is P2P,
	// the current implementation is one sided,
	// only browsers self-modify, servers do not.
	var env;
	if(typeof global !== "undefined"){ env = global }
	if(typeof window !== "undefined"){ var Gun = (env = window).Gun }
	else {
	if(typeof require !== "undefined"){ var Gun = require('./gun') }
	}

	Gun.on('opt', function(ctx){
		this.to.next(ctx);
		if(ctx.once){ return }
		ctx.on('in', function(at){
			if(!at.NTS){
				return this.to.next(at);
			}
			if(at['@']){
				(ask[at['@']]||noop)(at);
				return;
			}
			if(env.window){
				return this.to.next(at);
			}
			this.to.next({'@': at['#'], NTS: Gun.time.is()});
		});
		var ask = {}, noop = function(){};
		if(!env.window){ return }

		Gun.state.drift = Gun.state.drift || 0;
		setTimeout(function ping(){
			var NTS = {}, ack = Gun.text.random(), msg = {'#': ack, NTS: true, gun: ctx.gun};
			NTS.start = Gun.state();
			ask[ack] = function(at){
				NTS.end = Gun.state();
				Gun.obj.del(ask, ack);
				NTS.latency = (NTS.end - NTS.start)/2;
				if(!at.NTS){ return }
				NTS.calc = NTS.latency + at.NTS;
				Gun.state.drift -= (NTS.end - NTS.calc)/2;
				setTimeout(ping, 1000);
			}
			ctx.on('out', msg);
		}, 1);
	});
	// test by opening up examples/game/nts.html on devices that aren't NTP synced.
}());
