describe('Gun', function(){
	var Gun = require('../gun');
	
	it('ify', function(){
		var data, test;
		
		data = {a: false, b: true, c: 0, d: 1, e: '', f: 'g', h: null};
		test = Gun.ify(data);
		expect(test.err).to.not.be.ok();
		
		data = {};
		data.a = {x: 1, y: 2, z: 3}
		data.b = {m: 'n', o: 'p', q: 'r', s: 't'};
		data.a.kid = data.b;
		data.b.parent = data.a;
		data.loop = [data.b, data.a.kid, data];
		test = Gun.ify(data);
		expect(test.err).to.not.be.ok();
		
		data = {_: {'#': 'shhh', meta: {yay: 1}}, sneak: true};
		test = Gun.ify(data);
		expect(test.err).to.not.be.ok(); // metadata needs to be stored, but it can't be used for data.
		
		data = {};
		data.sneak = false;
		data.both = {inside: 'meta data'};
		data._ = {'#': 'shhh', data: {yay: 1}, spin: data.both};
		test = Gun.ify(data);
		expect(test.err.meta).to.be.ok(); // TODO: Fail: this passes, somehow? Fix ify code!
		
		data = {one: {two: [9, 8, 7, 6, 5]}};
		test = Gun.ify(data);
		expect(test.err.array).to.be.ok();
		
		data = {z: undefined, x: 'bye'};
		test = Gun.ify(data);
		expect(test.err.invalid).to.be.ok();
		
		data = {a: NaN, b: 2};
		test = Gun.ify(data);
		expect(test.err.invalid).to.be.ok();
		
		data = {a: 1, b: Infinity};
		test = Gun.ify(data);
		expect(test.err.invalid).to.be.ok();
		
		data = {c: function(){}, d: 'hi'};
		test = Gun.ify(data);
		expect(test.err.invalid).to.be.ok();
		
		console.log(test.nodes);
	});
	
	it('union', function(){
		var graph, prime;
		
		graph = Gun.ify({a: false, b: true, c: 0, d: 1, e: '', f: 'g', h: null}).nodes;
		prime = Gun.ify({h: 9, i: 'foo', j: 'k', l: 'bar', m: 'Mark', n: 'Nadal'}).nodes;
		
		Gun.union(graph, prime);
	});
	
	it('path', function(done){
		this.timeout(9000);
		var gun = require('./shotgun');
		gun.load('d1ed426098eae2bba8c60605e1e4552f66281770', null, {id: true}) // get Rodney Morris
			.path('parent.parent.first') // Rodney's parent is Juan Colon, whose parent is Francis Peters
		.get(function(val){
			console.log("val!", val);
			done();
		});
		console.log("________________________");
	});
	
});