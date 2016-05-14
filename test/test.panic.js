test(function(peers){
	console.log(peers.just);
	peers.client(function(){
		console.log("JESSE FREAK OUT!");
		localStorage.clear();
	});

	peers.env({
		key: 'SUPERPANICAWESOMESAUCEYAY',
		url: 'http://gungame.herokuapp.com/gun'
	})

	peers.just("Alice", function(test){
		var gun = Gun(test.env.url);
		gun.put({hello: 'WORLD HISTORY!!!!'}).key(this.env.key, function(err, ok){
			if(!err || (err.err || err).match('memory')){
				test.done();
			}
		});
	});
	
	['bob', 'carl', 'dave', 'eve', 'fred'].forEach(function(name){
		console.log("PEERS!", name);
		peers.just(name, function(test){
			var gun = Gun(test.env.url);
			gun.get(this.env.key).val(function(data){
				console.log("BOB READ DATA", data);
				if(data.hello === 'WORLD HISTORY!!!!'){
					test.done();
				} else {
					test.fail("Data was corrupted");
				}
			});
		});
	});
});