describe('All', function(){ 
	return;
	var expect = global.expect = require("./expect");

	var Gun = Gun || require('../gun');
	(typeof window === 'undefined') && require('../lib/file');
	
	var gun = Gun({file: 'data.json'});

	var keys = {
		'emails/aquiva@gmail.com': 'asdf',
		'emails/mark@gunDB.io': 'asdf',
		'user/marknadal': 'asdf',
		'emails/timber@cazzell.com': 'fdsa',
		'user/timbernadal': 'fdsa',
		'user/forrest': 'abcd',
		'emails/banana@gmail.com': 'qwert',
		'user/marknadal/messages/asdf': 'rti',
		'user/marknadal/messages/fobar': 'yuoi',
		'user/marknadal/messages/lol': 'hjkl',
		'user/marknadal/messages/nano': 'vbnm',
		'user/marknadal/messages/sweet': 'xcvb',
		'user/marknadal/posts': 'qvtxz',
		'emails/for@rest.com': 'abcd'
	};

	it('from', function() {
		var r = gun.__.opt.hooks.all(keys, {from: 'user/'});
		//console.log(r);
		expect(r).to.be.eql({
			'user/marknadal': { '#': 'asdf' },
			'user/timbernadal': { '#': 'fdsa' },
			'user/forrest': { '#': 'abcd' },
			'user/marknadal/messages/asdf': { '#': 'rti' },
			'user/marknadal/messages/fobar': { '#': 'yuoi' },
			'user/marknadal/messages/lol': { '#': 'hjkl' },
			'user/marknadal/messages/nano': { '#': 'vbnm' },
			'user/marknadal/messages/sweet': { '#': 'xcvb' },
			'user/marknadal/posts': { '#': 'qvtxz' } 
		});
	});

	it('from and upto', function() {
		var r = gun.__.opt.hooks.all(keys, {from: 'user/', upto: '/'});
		//console.log('upto', r);
		expect(r).to.be.eql({
			'user/marknadal': { '#': 'asdf' },
			'user/timbernadal': { '#': 'fdsa' },
			'user/forrest': { '#': 'abcd' }
		});
	});

	it('from and upto and start and end', function() {
		var r = gun.__.opt.hooks.all(keys, {from: 'user/', upto: '/', start: "c", end: "f"});
		//console.log('upto and start and end', r);
		expect(r).to.be.eql({
			'user/forrest': { '#': 'abcd' }
		});
	});

	it('map', function(done) { return done();
		var users = gun.put({
			a: {name: "Mark Nadal"},
			b: {name: "timber Nadal"},
			c: {name: "Charlie Chapman"},
			d: {name: "Johnny Depp"},
			e: {name: "Santa Clause"}
		});
		//console.log("map:");
		users.map().val(function(user){
			//console.log("each user:", user);
		}).path("ohboy");
		return;
		users.map(function(){

		});
	});

});