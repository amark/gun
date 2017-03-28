;(function(){

	var env;
	if(typeof global !== "undefined"){ env = global }
	if(typeof require !== "undefined"){ var Gun = require('../gun') }
	if(typeof window !== "undefined"){ var Gun = (env = window).Gun }

	Gun.on('opt', function(at){
		this.to.next(at);
		if(at.once){ return }
		var root = at.gun;
		root.on('in', function(at){
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
		function ping(){
			var NTS = {}, ack = Gun.text.random(), msg = {'#': ack, NTS: true, gun: root};
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
			Gun.on('out', msg);
		}; ping();
	});
	// test by opening up examples/game/nts.html on devices that aren't NTP synced.
}());