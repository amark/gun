var Gun = Gun || require('../gun');
if(typeof window !== 'undefined'){ root = window }
describe('Gun', function(){
	var t = {};
	describe('Utility', function(){

		it('verbose console.log debugging', function(done) {

			var gun = Gun();
			var log = root.console.log, counter = 1;
			root.console.log = function(a,b,c){
				--counter;
				//log(a,b,c);
			}
			Gun.log.verbose = true;
			gun.put('bar', function(err, yay){ // intentionally trigger an error that will get logged.
				expect(counter).to.be(0);

				Gun.log.verbose = false;
				gun.put('bar', function(err, yay){ // intentionally trigger an error that will get logged.
					expect(counter).to.be(0);

					root.console.log = log;
					done();
				});
			});
		});

		describe('Type Check', function(){
			it('binary', function(){
				expect(Gun.bi.is(false)).to.be(true);
				expect(Gun.bi.is(true)).to.be(true);
				expect(Gun.bi.is('')).to.be(false);
				expect(Gun.bi.is('a')).to.be(false);
				expect(Gun.bi.is(0)).to.be(false);
				expect(Gun.bi.is(1)).to.be(false);
				expect(Gun.bi.is([])).to.be(false);
				expect(Gun.bi.is([1])).to.be(false);
				expect(Gun.bi.is({})).to.be(false);
				expect(Gun.bi.is({a:1})).to.be(false);
				expect(Gun.bi.is(function(){})).to.be(false);
			});
			it('number',function(){
				expect(Gun.num.is(0)).to.be(true);
				expect(Gun.num.is(1)).to.be(true);
				expect(Gun.num.is(Infinity)).to.be(true);
				expect(Gun.num.is(NaN)).to.be(false);
				expect(Gun.num.is('')).to.be(false);
				expect(Gun.num.is('a')).to.be(false);
				expect(Gun.num.is([])).to.be(false);
				expect(Gun.num.is([1])).to.be(false);
				expect(Gun.num.is({})).to.be(false);
				expect(Gun.num.is({a:1})).to.be(false);
				expect(Gun.num.is(false)).to.be(false);
				expect(Gun.num.is(true)).to.be(false);
				expect(Gun.num.is(function(){})).to.be(false);
			});
			it('text',function(){
				expect(Gun.text.is('')).to.be(true);
				expect(Gun.text.is('a')).to.be(true);
				expect(Gun.text.is(false)).to.be(false);
				expect(Gun.text.is(true)).to.be(false);
				expect(Gun.text.is(0)).to.be(false);
				expect(Gun.text.is(1)).to.be(false);
				expect(Gun.text.is([])).to.be(false);
				expect(Gun.text.is([1])).to.be(false);
				expect(Gun.text.is({})).to.be(false);
				expect(Gun.text.is({a:1})).to.be(false);
				expect(Gun.text.is(function(){})).to.be(false);
			});
			it('list',function(){
				expect(Gun.list.is([])).to.be(true);
				expect(Gun.list.is([1])).to.be(true);
				expect(Gun.list.is(0)).to.be(false);
				expect(Gun.list.is(1)).to.be(false);
				expect(Gun.list.is('')).to.be(false);
				expect(Gun.list.is('a')).to.be(false);
				expect(Gun.list.is({})).to.be(false);
				expect(Gun.list.is({a:1})).to.be(false);
				expect(Gun.list.is(false)).to.be(false);
				expect(Gun.list.is(true)).to.be(false);
				expect(Gun.list.is(function(){})).to.be(false);
			});
			it('obj',function(){
				expect(Gun.obj.is({})).to.be(true);
				expect(Gun.obj.is({a:1})).to.be(true);
				expect(Gun.obj.is(0)).to.be(false);
				expect(Gun.obj.is(1)).to.be(false);
				expect(Gun.obj.is('')).to.be(false);
				expect(Gun.obj.is('a')).to.be(false);
				expect(Gun.obj.is([])).to.be(false);
				expect(Gun.obj.is([1])).to.be(false);
				expect(Gun.obj.is(false)).to.be(false);
				expect(Gun.obj.is(true)).to.be(false);
				expect(Gun.obj.is(function(){})).to.be(false);
			});
			it('fns',function(){
				expect(Gun.fns.is(function(){})).to.be(true);
				expect(Gun.fns.is('')).to.be(false);
				expect(Gun.fns.is('a')).to.be(false);
				expect(Gun.fns.is(0)).to.be(false);
				expect(Gun.fns.is(1)).to.be(false);
				expect(Gun.fns.is([])).to.be(false);
				expect(Gun.fns.is([1])).to.be(false);
				expect(Gun.fns.is({})).to.be(false);
				expect(Gun.fns.is({a:1})).to.be(false);
				expect(Gun.fns.is(false)).to.be(false);
				expect(Gun.fns.is(true)).to.be(false);
			});
			it('time',function(){
				t.ts = Gun.time.is();
				expect(13 <= t.ts.toString().length).to.be.ok();
				expect(Gun.num.is(t.ts)).to.be.ok();
				expect(Gun.time.is(new Date())).to.be.ok();
			});
		});
		describe('Text', function(){
			it('ify',function(){
				expect(Gun.text.ify(0)).to.be('0');
				expect(Gun.text.ify(22)).to.be('22');
				expect(Gun.text.ify([true,33,'yay'])).to.be('[true,33,"yay"]');
				expect(Gun.text.ify({a:0,b:'1',c:[0,'1'],d:{e:'f'}})).to.be('{"a":0,"b":"1","c":[0,"1"],"d":{"e":"f"}}');
				expect(Gun.text.ify(false)).to.be('false');
				expect(Gun.text.ify(true)).to.be('true');
			});
			it('random',function(){
				expect(Gun.text.random().length).to.be(24);
				expect(Gun.text.random(11).length).to.be(11);
				expect(Gun.text.random(4).length).to.be(4);
				t.tr = Gun.text.random(2,'as'); expect((t.tr=='as'||t.tr=='aa'||t.tr=='sa'||t.tr=='ss')).to.be.ok();
			});
		});
		describe('List', function(){
			it('slit',function(){
				(function(){
					expect(Gun.list.slit.call(arguments, 0)).to.eql([1,2,3,'a','b','c']);
				}(1,2,3,'a','b','c'));
			});
			it('sort',function(){
				expect([{i:9},{i:4},{i:1},{i:-3},{i:0}].sort(Gun.list.sort('i'))).to.eql([{i:-3},{i:0},{i:1},{i:4},{i:9}]);
			});
			it('map',function(){
				expect(Gun.list.map([1,2,3,4,5],function(v,i,t){ t(v+=this.d); this.d=v; },{d:0})).to.eql([1,3,6,10,15]);
				expect(Gun.list.map([2,3,0,4],function(v,i,t){ if(!v){ return } t(v*=this.d); this.d=v; },{d:1})).to.eql([2,6,24]);
				expect(Gun.list.map([true,false,NaN,Infinity,'',9],function(v,i,t){ if(i===3){ return 0 }})).to.be(0);
			});
		});
		describe('Object', function(){
			it('del',function(){
				var obj = {a:1,b:2};
				Gun.obj.del(obj,'a');
				expect(obj).to.eql({b:2});
			});
			it('has',function(){
				var obj = {a:1,b:2};
				expect(Gun.obj.has(obj,'a')).to.be.ok();
			});
			it('copy',function(){
				var obj = {"a":false,"b":1,"c":"d","e":[0,1],"f":{"g":"h"}};
				var copy = Gun.obj.copy(obj);
				expect(copy).to.eql(obj);
				expect(copy).to.not.be(obj);
			});
			it('ify',function(){
				expect(Gun.obj.ify('[0,1]')).to.eql([0,1]);
				expect(Gun.obj.ify('{"a":false,"b":1,"c":"d","e":[0,1],"f":{"g":"h"}}')).to.eql({"a":false,"b":1,"c":"d","e":[0,1],"f":{"g":"h"}});
			});
			it('map',function(){
				expect(Gun.obj.map({a:'z',b:'y',c:'x'},function(v,i,t){ t(v,i) })).to.eql({x:'c',y:'b',z:'a'});
				expect(Gun.obj.map({a:'z',b:false,c:'x'},function(v,i,t){ if(!v){ return } t(i,v) })).to.eql({a:'z',c:'x'});
				expect(Gun.obj.map({a:'z',b:3,c:'x'},function(v,i,t){ if(v===3){ return 0 }})).to.be(0);
			});
		});
		describe('Functions', function(){
			it('sum',function(done){
				var obj = {a:2, b:2, c:3, d: 9};
				Gun.obj.map(obj, function(num, key){
					setTimeout(this.add(function(){
						this.done(null, num * num);
					}, key), parseInt((""+Math.random()).substring(2,5)));
				}, Gun.fns.sum(function(err, val){
					expect(val.a).to.eql(4);
					expect(val.b).to.eql(4);
					expect(val.c).to.eql(9);
					expect(val.d).to.eql(81);
					done();
				}));
			});
		});

		describe('Gun Safety', function(){
			var gun = Gun();
			it('is',function(){
				expect(Gun.is(gun)).to.be(true);
				expect(Gun.is(true)).to.be(false);
				expect(Gun.is(false)).to.be(false);
				expect(Gun.is(0)).to.be(false);
				expect(Gun.is(1)).to.be(false);
				expect(Gun.is('')).to.be(false);
				expect(Gun.is('a')).to.be(false);
				expect(Gun.is(Infinity)).to.be(false);
				expect(Gun.is(NaN)).to.be(false);
				expect(Gun.is([])).to.be(false);
				expect(Gun.is([1])).to.be(false);
				expect(Gun.is({})).to.be(false);
				expect(Gun.is({a:1})).to.be(false);
				expect(Gun.is(function(){})).to.be(false);
			});
			it('is value',function(){
				expect(Gun.is.value(false)).to.be(true);
				expect(Gun.is.value(true)).to.be(true);
				expect(Gun.is.value(0)).to.be(true);
				expect(Gun.is.value(1)).to.be(true);
				expect(Gun.is.value('')).to.be(true);
				expect(Gun.is.value('a')).to.be(true);
				expect(Gun.is.value({'#':'somesoulidhere'})).to.be('somesoulidhere');
				expect(Gun.is.value({'#':'somesoulidhere', and: 'nope'})).to.be(false);
				expect(Gun.is.value(Infinity)).to.be(false); // boohoo :(
				expect(Gun.is.value(NaN)).to.be(false);
				expect(Gun.is.value([])).to.be(false);
				expect(Gun.is.value([1])).to.be(false);
				expect(Gun.is.value({})).to.be(false);
				expect(Gun.is.value({a:1})).to.be(false);
				expect(Gun.is.value(function(){})).to.be(false);
			});
			it('is soul',function(){
				expect(Gun.is.soul({'#':'somesoulidhere'})).to.be('somesoulidhere');
				expect(Gun.is.soul({'#':'somethingelsehere'})).to.be('somethingelsehere');
				expect(Gun.is.soul({'#':'somesoulidhere', and: 'nope'})).to.be(false);
				expect(Gun.is.soul({or: 'nope', '#':'somesoulidhere'})).to.be(false);
				expect(Gun.is.soul(false)).to.be(false);
				expect(Gun.is.soul(true)).to.be(false);
				expect(Gun.is.soul('')).to.be(false);
				expect(Gun.is.soul('a')).to.be(false);
				expect(Gun.is.soul(0)).to.be(false);
				expect(Gun.is.soul(1)).to.be(false);
				expect(Gun.is.soul(Infinity)).to.be(false); // boohoo :(
				expect(Gun.is.soul(NaN)).to.be(false);
				expect(Gun.is.soul([])).to.be(false);
				expect(Gun.is.soul([1])).to.be(false);
				expect(Gun.is.soul({})).to.be(false);
				expect(Gun.is.soul({a:1})).to.be(false);
				expect(Gun.is.soul(function(){})).to.be(false);
			});
			it('is node',function(){
				expect(Gun.is.node({_:{'#':'somesoulidhere'}})).to.be(true);
				expect(Gun.is.node({_:{'#':'somesoulidhere'}, a:0, b: 1, c: '', d: 'e', f: {'#':'somethingelsehere'}})).to.be(true);
				expect(Gun.is.node({_:{'#':'somesoulidhere'}, a:0, b: 1, c: '', d: 'e', f: {'#':'somethingelsehere'}, g: Infinity})).to.be(false);
				expect(Gun.is.node({_:{'#':'somesoulidhere'}, a:0, b: 1, z: NaN, c: '', d: 'e'})).to.be(false);
				expect(Gun.is.node({_:{'#':'somesoulidhere'}, a:0, b: 1, y: {_: 'cool'}, c: '', d: 'e'})).to.be(false);
				expect(Gun.is.node({_:{'#':'somesoulidhere'}, a:0, b: 1, x: [], c: '', d: 'e'})).to.be(false);
				expect(Gun.is.node({})).to.be(false);
				expect(Gun.is.node({a:1})).to.be(false);
				expect(Gun.is.node({_:{}})).to.be(false);
				expect(Gun.is.node({_:{}, a:1})).to.be(false);
				expect(Gun.is.node({'#':'somesoulidhere'})).to.be(false);
			});
			it('is graph',function(){
				expect(Gun.is.graph({'somesoulidhere': {_:{'#':'somesoulidhere'}}})).to.be(true);
				expect(Gun.is.graph({'somesoulidhere': {_:{'#':'somesoulidhere'}}, 'somethingelsehere': {_:{'#':'somethingelsehere'}}})).to.be(true);
				expect(Gun.is.graph({'somesoulidhere': {_:{'#':'somesoulidhere'}, a:0, b: 1, c: '', d: 'e', f: {'#':'somethingelsehere'}}, 'somethingelsehere': {_:{'#':'somethingelsehere'}}})).to.be(true);
				expect(Gun.is.graph({'somesoulidhere': {_:{'#':'somesoulidhere'}, a:0, b: 1, c: '', d: 'e', f: {'#':'somethingelsehere'}}})).to.be(true);
				expect(Gun.is.graph({'somesoulidhere': {_:{'#':'somesoulidhere'}, a:0, b: 1, c: '', d: 'e', f: {'#':'somethingelsehere'}}, foo: 1, 'somethingelsehere': {_:{'#':'somethingelsehere'}}})).to.be(false);
				expect(Gun.is.graph({'somesoulidhere': {_:{'#':'somesoulidhere'}, a:0, b: 1, c: '', d: 'e', f: {'#':'somethingelsehere'}}, foo: {}, 'somethingelsehere': {_:{'#':'somethingelsehere'}}})).to.be(false);
				expect(Gun.is.graph({'somesoulidhere': {_:{'#':'somesoulidhere'}, a:0, b: 1, c: '', d: 'e', f: {'#':'somethingelsehere'}}, foo: {_:{'#':'FOO'}}, 'somethingelsehere': {_:{'#':'somethingelsehere'}}})).to.be(false);
				expect(Gun.is.graph({'somesoulidhere': {_:{'#':'somesoulidhere'}, a:0, b: 1, c: '', d: 'e', f: {'#':'somethingelsehere'}}, foo: {_:{}}, 'somethingelsehere': {_:{'#':'somethingelsehere'}}})).to.be(false);
				expect(Gun.is.graph({'somesoulidhere': {_:{'#':'somesoulidhere'}, a:0, b: Infinity, c: '', d: 'e', f: {'#':'somethingelsehere'}}})).to.be(false);
				expect(Gun.is.graph({'somesoulidhere': {_:{'#':'somesoulidhere'}, a:0, b: Infinity, c: '', d: 'e', f: {'#':'somethingelsehere'}}, 'somethingelsehere': {_:{'#':'somethingelsehere'}}})).to.be(false);
				expect(Gun.is.graph({_:{'#':'somesoulidhere'}})).to.be(false);
				expect(Gun.is.graph({_:{'#':'somesoulidhere'}, a:0, b: 1, c: '', d: 'e', f: {'#':'somethingelsehere'}})).to.be(false);
				expect(Gun.is.graph({_:{'#':'somesoulidhere'}, a:0, b: 1, c: '', d: 'e', f: {'#':'somethingelsehere'}, g: Infinity})).to.be(false);
				expect(Gun.is.graph({_:{'#':'somesoulidhere'}, a:0, b: 1, z: NaN, c: '', d: 'e'})).to.be(false);
				expect(Gun.is.graph({_:{'#':'somesoulidhere'}, a:0, b: 1, y: {_: 'cool'}, c: '', d: 'e'})).to.be(false);
				expect(Gun.is.graph({_:{'#':'somesoulidhere'}, a:0, b: 1, x: [], c: '', d: 'e'})).to.be(false);
				expect(Gun.is.graph({})).to.be(false); // Empty graph is not a graph :(
				expect(Gun.is.graph({a:1})).to.be(false);
				expect(Gun.is.graph({_:{}})).to.be(false);
				expect(Gun.is.graph({_:{}, a:1})).to.be(false);
				expect(Gun.is.graph({'#':'somesoulidhere'})).to.be(false);
			});
		});
	});

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
	});

	it('union', function(){
		var graph, prime;

		graph = Gun.ify({a: false, b: true, c: 0, d: 1, e: '', f: 'g', h: null}).nodes;
		prime = Gun.ify({h: 9, i: 'foo', j: 'k', l: 'bar', m: 'Mark', n: 'Nadal'}).nodes;

		Gun.union(graph, prime); // TODO: BUG! Where is the expect???
	});

	describe('API', function(){

		(typeof window === 'undefined') && require('../lib/file');
		var gun = Gun({file: 'data.json'});
		
		it('set key get', function(done){
			gun.put({hello: "world"}).key('hello/world').val(function(val){
				expect(val.hello).to.be('world');
				done();
			});
		});

		it('load', function(done){
			gun.get('hello/world').val(function(val){
				expect(val.hello).to.be('world');
				done();
			});
		});

		it('load path', function(done){
			gun.get('hello/world').path('hello').val(function(val){
				expect(val).to.be('world');
				done();
			});
		});

		it('load set path', function(done){
			gun.get('hello/world').put({hello: 'Mark'}).path('hello').val(function(val){
				expect(val).to.be('Mark');
				done();
			});
		});

		it('load path set', function(done){
			gun.get('hello/world').path('hello').put('World').val(function(val){
				expect(val).to.be('World');
				done();
			});
		});
		
		it('load path empty set', function(done){
			gun.get('hello/world').path('earth').put('mars').val(function(val){
				expect(val).to.be('mars');
				done();
			});
		});

		it('load path get', function(done){
			gun.get('hello/world').path('earth').val(function(val){
				expect(val).to.be('mars');
				done();
			});
		});

		it('key set get', function(done){
			gun.key('world/hello').put({world: "hello"}).val(function(val){
				expect(val.world).to.be('hello');
				done();
			});
		});

		it('load again', function(done){
			gun.get('world/hello').val(function(val){
				expect(val.world).to.be('hello');
				done();
			});
		});
		
		it('load not kick get', function(done){ // it would be cool with GUN
			gun.get("some/empty/thing").not(function(){ // that if you call blank first
				this.put({now: 'exists'}); // you can set stuff
			}).val(function(val){ // and THEN still retrieve it.
				expect(val.now).to.be('exists');
				done();
			});
		});

		it('load not kick get when it already exists', function(done){
			gun.get("some/empty/thing").not(function(){
				this.put({now: 'THIS SHOULD NOT HAPPEN'});
			}).val(function(val){
				expect(val.now).to.be('exists');
				done();
			});
		});

		it('set path get sub', function(done){
			gun.put({last: {some: 'object'}}).path('last').val(function(val){
				expect(val.some).to.be('object');
				done();
			});
		});
		
		it('load set null', function(done){
			gun.put({last: {some: 'object'}}).path('last').val(function(val){
				expect(val.some).to.be('object');
			}).put(null, function(err){
				//console.log("ERR?", err);
			}).val(function(val){
				expect(val).to.be(null);
				done();
			});
		});

		it('var set key path', function(done){ // contexts should be able to be saved to a variable
			var foo = gun.put({foo: 'bar'}).key('foo/bar');
			foo.path('hello.world.nowhere'); // this should become a sub-context, that doesn't alter the original
			setTimeout(function(){
				foo.path('foo').val(function(val){ // and then the original should be able to be reused later
					expect(val).to.be('bar'); // this should work
					done();
				});
			}, 100);
		});

		it('var load path', function(done){ // contexts should be able to be saved to a variable
			var foo = gun.get('foo/bar');
			foo.path('hello.world.nowhere'); // this should become a sub-context, that doesn't alter the original
			setTimeout(function(){
				foo.path('foo').val(function(val){ // and then the original should be able to be reused later
					expect(val).to.be('bar'); // this should work
					done();
				});
			}, 100);
		});

		it('load not set get path get', function(done){ // stickies issue
			gun.get("examples/list/foobar").not(function(){
					this.put({
						id: 'foobar',
						title: 'awesome title',
						todos: {}
					});
			}).val(function(data){
				expect(data.id).to.be('foobar');
			}).path('todos').val(function(todos){
				expect(todos).to.not.have.property('id');
				done();
			});
		});

		it('set partial sub merge', function(done){
			var mark = gun.put({name: "Mark", wife: { name: "Amber" }}).key('person/mark').val(function(mark){
				expect(mark.name).to.be("Mark");
			});

			mark.put({age: 23, wife: {age: 23}});
			
			setTimeout(function(){
				mark.put({citizen: "USA", wife: {citizen: "USA"}}).val(function(mark){
					expect(mark.name).to.be("Mark");
					expect(mark.age).to.be(23);
					expect(mark.citizen).to.be("USA");

					this.path('wife').val(function(Amber){
						expect(Amber.name).to.be("Amber");
						expect(Amber.age).to.be(23);
						expect(Amber.citizen).to.be("USA");
						done();
					});
				});
			}, 50);
		});

		it('path path', function(done){
			var deep = gun.put({some: {deeply: {nested: 'value'}}});
			deep.path('some.deeply.nested').val(function(val){
				expect(val).to.be('value');
			});
			deep.path('some').path('deeply').path('nested').val(function(val){
				expect(val).to.be('value');
				done();
			});
		});

		it('context null set value get error', function(done){
			gun.put("oh yes",function(err){
				expect(err).to.be.ok();
				done();
			});
		});

		var foo;
		it('context null set node', function(done){
			foo = gun.put({foo: 'bar'}).val(function(obj){
				expect(obj.foo).to.be('bar');
				done();
			});
		});

		it('context node set val', function(done){
			foo.put('banana', function(err){
				expect(err).to.be.ok();
				done();
			});
		});
		
		it('context node set node', function(done){
			foo.put({bar: {zoo: 'who'}}).val(function(obj){
				expect(obj.foo).to.be('bar');
				expect(Gun.is.soul(obj.bar)).to.ok();
				done();
			});
		});
		
		it('context node and field set value', function(done){
			var tar = foo.path('tar');
			tar.put('zebra').val(function(val){
				expect(val).to.be('zebra');
				done();
			});
		});

		var bar;
		it('context node and field of relation set node', function(done){
			bar = foo.path('bar');
			bar.put({combo: 'double'}).val(function(obj){
				expect(obj.zoo).to.be('who');
				expect(obj.combo).to.be('double');
				done();
			});
		});

		it('context node and field, set node', function(done){
			bar.path('combo').put({another: 'node'}).val(function(obj){
				expect(obj.another).to.be('node');
				bar.val(function(node){
					expect(Gun.is.soul(node.combo)).to.be.ok();
					expect(Gun.is.soul(node.combo)).to.be(Gun.is.soul.on(obj));
					done();
				});
			});
		});


		it('map', function(done){
			var c = 0, map = gun.put({a: {here: 'you'}, b: {go: 'dear'}, c: {sir: '!'} });
			map.map(function(obj, soul){
				c++;
				if(soul === 'a'){
					expect(obj.here).to.be('you');
				}
				if(soul === 'b'){
					expect(obj.go).to.be('dear');	
				}
				if(soul === 'c'){
					expect(obj.sir).to.be('!');
				}
				if(c === 3){
					done();
				}
			})
		});
	});
});