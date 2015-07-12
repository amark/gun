(function(env){
	root = env.window? env.window : root;
	env.window && root.localStorage && root.localStorage.clear();
	root.Gun = root.Gun || require('../gun');
}(this));
Gun.log.squelch = true;

describe('Gun', function(){
	var t = {};
	
	describe('Utility', function(){

		it('verbose console.log debugging', function(done) { console.log("TURN THIS BACK ON the DEBUGGING TEST"); done(); return;

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
			it('empty',function(){
				expect(Gun.obj.empty()).to.be(true);
				expect(Gun.obj.empty({a:false})).to.be(false);
				expect(Gun.obj.empty({a:false},'a')).to.be(true);
				expect(Gun.obj.empty({a:false},{a:1})).to.be(true);
				expect(Gun.obj.empty({a:false,b:1},'a')).to.be(false);
				expect(Gun.obj.empty({a:false,b:1},{a:1})).to.be(false);
				expect(Gun.obj.empty({1:1},'danger')).to.be(false);
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

	describe('ify', function(){
		var test, gun = Gun();
		
		it('null', function(done){
			Gun.ify(null)(function(err, ctx){
				expect(err).to.be.ok(); 
				done();
			});
		});
		
		it('basic', function(done){
			var data = {a: false, b: true, c: 0, d: 1, e: '', f: 'g', h: null};
			Gun.ify(data)(function(err, ctx){
				expect(err).to.not.be.ok();
				expect(ctx.err).to.not.be.ok();
				expect(ctx.root).to.eql(data);
				expect(ctx.root === data).to.not.ok();
				done();
			});
		});
		
		it('basic soul', function(done){
			var data = {_: {'#': 'SOUL'}, a: false, b: true, c: 0, d: 1, e: '', f: 'g', h: null};
			Gun.ify(data)(function(err, ctx){
				expect(err).to.not.be.ok();
				expect(ctx.err).to.not.be.ok();
				
				expect(ctx.root).to.eql(data);
				expect(ctx.root === data).to.not.be.ok();
				expect(Gun.is.soul.on(ctx.root) === Gun.is.soul.on(data));
				done();
			});
		});
		
		it('arrays', function(done){
			var data = {before: {path: 'kill'}, one: {two: {lol: 'troll', three: [9, 8, 7, 6, 5]}}};
			Gun.ify(data)(function(err, ctx){
				expect(err).to.be.ok();
				expect(err.err.indexOf("one.two.three")).to.not.be(-1);
				done();
			});
		});
		
		it('undefined', function(done){
			var data = {z: undefined, x: 'bye'};
			Gun.ify(data)(function(err, ctx){
				expect(err).to.be.ok();
				done();
			});
		});
		
		it('NaN', function(done){
			var data = {a: NaN, b: 2};
			Gun.ify(data)(function(err, ctx){
				expect(err).to.be.ok();
				done();
			});
		});
		
		it('Infinity', function(done){ // SAD DAY PANDA BEAR :( :( :(... Mark wants Infinity. JSON won't allow.
			var data = {a: 1, b: Infinity};
			Gun.ify(data)(function(err, ctx){
				expect(err).to.be.ok();
				done();
			});
		});
		
		it('function', function(done){
			var data = {c: function(){}, d: 'hi'};
			Gun.ify(data)(function(err, ctx){
				expect(err).to.be.ok();
				done();
			});
		});
		
		it('extraneous', function(done){
			var data = {_: {'#': 'shhh', meta: {yay: 1}}, sneak: true};
			Gun.ify(data)(function(err, ctx){
				expect(err).to.not.be.ok(); // extraneous metadata needs to be stored, but it can't be used for data.
				done();
			});
		});
		
		return; // TODO! Fix GUN to handle this!
		data = {};
		data.sneak = false;
		data.both = {inside: 'meta data'};
		data._ = {'#': 'shhh', data: {yay: 1}, spin: data.both};
		test = Gun.ify(data);
		expect(test.err.meta).to.be.ok(); // TODO: Fail: this passes, somehow? Fix ify code!
	});
	
	describe('Event Promise Back In Time', function(){ return; // TODO: I think this can be removed entirely now.
		/*	
			var ref = gun.put({field: 'value'}).key('field/value').get('field/value', function(){
				expect()
			});
			setTimeout(function(){
				ref.get('field/value', function(){
					expect();
				});
			}, 50);
			
			A) Synchronous
				1. fake (B)
			B) Asychronous
				1. In Memory
					DONE
				2. Will be in Memory
					LISTEN to something SO WE CAN RESUME
						DONE
				3. Not in Memory
					Ask others.
						DONE
		*/
		it('A1', function(done){ // this has behavior of a .get(key) where we already have it in memory but need to fake async it.
			var graph = {};
			var keys = {};
			graph['soul'] = {foo: 'bar'};
			keys['some/key'] = graph['soul'];
			
			var ctx = {key: 'some/key'};
			if(ctx.node = keys[ctx.key]){
				console.log("yay we are synchronously in memory!");
				setTimeout(function(){
					expect(ctx.flag).to.be.ok();
					expect(ctx.node.foo).to.be('bar');
					done();
				},0);
				ctx.flag = true;
			}
		});
		
		it('B1', function(done){ // this has the behavior a .val() where we don't even know what is going on, we just want context.
			var graph = {};
			var keys = {};
			
			var ctx = {
				promise: function(cb){
					setTimeout(function(){
						graph['soul'] = {foo: 'bar'};
						keys['some/key'] = graph['soul'];
						cb('soul');
					},50);
				}
			};
			if(ctx.node = keys[ctx.key]){
				// see A1 test
			} else {
				ctx.promise(function(soul){
					if(ctx.node = graph[soul]){
						expect(ctx.node.foo).to.be('bar');
						done();
					} else {
						// I don't know
					}
				});
			}
		});
		
		it('B2', function(done){ // this is the behavior of a .get(key) which synchronously follows a .put(obj).key(key) which fakes async.
			var graph = {};
			var keys = {};
			
			var ctx = {};
			(function(data){ // put
				setTimeout(function(){
					graph['soul'] = data;
					fn();
				},10);
				
				ctx.promise = function(fn){
					
				}
			}({field: "value"}));
			
			(function(key){ // key
				keys[key] = true;
				ctx.promise(function(){
					keys[key] = node;
				})
			}('some/key'));
			
			(function(ctx){ // get
				if(get.node = keys[get.key]){
					
				} else 
				if(get.inbetweenMemory){
					
				} else {
					loadFromDiskOrPeers(get.key, function(){
						
					});
				}
			}({key: 'some/key'}));
		});
	});
	
	describe('Schedule', function(){
		it('one', function(done){
			Gun.schedule(Gun.time.is(), function(){
				expect(true).to.be(true);
				done(); //setTimeout(function(){ done() },1);
			});
		});
		
		it('many', function(done){
			Gun.schedule(Gun.time.is() + 50, function(){
				done.first = true;
			});
			Gun.schedule(Gun.time.is() + 100, function(){
				done.second = true;
			});
			Gun.schedule(Gun.time.is() + 200, function(){
				done.third = true;
				expect(done.first).to.be(true);
				expect(done.second).to.be(true);
				expect(done.third).to.be(true);
				done(); //setTimeout(function(){ done() },1);
			});
		});
	});
	
	describe('Union', function(){
		var gun = Gun();
		
		it('fail', function(){
			var prime = {
				'asdf': {
					_: {'#': 'asdf', '>':{
						a: 'cheating'
					}},
					a: 0
				}
			}

			expect(gun.__.graph['asdf']).to.not.be.ok();
			var ctx = Gun.union(gun, prime);
			expect(ctx.err).to.be.ok();
		});
		
		it('basic', function(done){
			var prime = {
				'asdf': {
					_: {'#': 'asdf', '>':{
						a: Gun.time.is()
					}},
					a: 0
				}
			}

			expect(gun.__.graph['asdf']).to.not.be.ok();
			var ctx = Gun.union(gun, prime, function(){
				expect(gun.__.graph['asdf'].a).to.be(0);
				done();
			});
		});
		
		it('disjoint', function(done){
			var prime = {
				'asdf': {
					_: {'#': 'asdf', '>':{
						b: Gun.time.is()
					}},
					b: 'c'
				}
			}

			expect(gun.__.graph['asdf'].a).to.be(0);
			expect(gun.__.graph['asdf'].b).to.not.be.ok();
			var ctx = Gun.union(gun, prime, function(){
				expect(gun.__.graph['asdf'].a).to.be(0);
				expect(gun.__.graph['asdf'].b).to.be('c');
				done();
			});
		});
		
		it('mutate', function(done){
			var prime = {
				'asdf': {
					_: {'#': 'asdf', '>':{
						b: Gun.time.is()
					}},
					b: 'd'
				}
			}

			expect(gun.__.graph['asdf'].b).to.be('c');
			var ctx = Gun.union(gun, prime, function(){
				expect(gun.__.graph['asdf'].b).to.be('d');
				done();
			});
		});
		
		it('disjoint past', function(done){
			var prime = {
				'asdf': {
					_: {'#': 'asdf', '>':{
						x: 0 // beginning of time!
					}},
					x: 'hi'
				}
			}

			expect(gun.__.graph['asdf'].x).to.not.be.ok();
			var ctx = Gun.union(gun, prime, function(){
				expect(gun.__.graph['asdf'].x).to.be('hi');
				done();
			});
		});
		
		it('past', function(done){
			var prime = {
				'asdf': {
					_: {'#': 'asdf', '>':{
						x: Gun.time.is() - (60 * 1000) // above lower boundary, below now or upper boundary.
					}},
					x: 'hello'
				}
			}

			expect(gun.__.graph['asdf'].x).to.be('hi');
			var ctx = Gun.union(gun, prime, function(){
				expect(gun.__.graph['asdf'].x).to.be('hello');
				done();
			});
		});
		
		it('future', function(done){
			var prime = {
				'asdf': {
					_: {'#': 'asdf', '>':{
						x: Gun.time.is() + (200) // above now or upper boundary, aka future.
					}},
					x: 'how are you?'
				}
			}

			expect(gun.__.graph['asdf'].x).to.be('hello');
			var now = Gun.time.is();
			var ctx = Gun.union(gun, prime, function(){
				expect(Gun.time.is() - now).to.be.above(100);
				expect(gun.__.graph['asdf'].x).to.be('how are you?');
				done();
			});
		});
		var to = 5000;
		it('disjoint future', function(done){
			var prime = {
				'asdf': {
					_: {'#': 'asdf', '>':{
						y: Gun.time.is() + (200) // above now or upper boundary, aka future.
					}},
					y: 'goodbye'
				}
			}
			expect(gun.__.graph['asdf'].y).to.not.be.ok();
			var now = Gun.time.is();
			var ctx = Gun.union(gun, prime, function(){
				expect(Gun.time.is() - now).to.be.above(100);
				expect(gun.__.graph['asdf'].y).to.be('goodbye');
				done();
			});
		});
		
		it('disjoint future max', function(done){
			var prime = {
				'asdf': {
					_: {'#': 'asdf', '>':{
						y: Gun.time.is() + (2), // above now or upper boundary, aka future.
						z: Gun.time.is() + (200) // above now or upper boundary, aka future.
					}},
					y: 'bye',
					z: 'who'
				}
			}

			expect(gun.__.graph['asdf'].y).to.be('goodbye');
			expect(gun.__.graph['asdf'].z).to.not.be.ok();
			var now = Gun.time.is();
			var ctx = Gun.union(gun, prime, function(){
				expect(Gun.time.is() - now).to.be.above(100);
				expect(gun.__.graph['asdf'].y).to.be('bye');
				expect(gun.__.graph['asdf'].z).to.be('who');
				done(); //setTimeout(function(){ done() },1);
			});
		});
		
		it('future max', function(done){
			var prime = {
				'asdf': {
					_: {'#': 'asdf', '>':{
						w: Gun.time.is() + (2), // above now or upper boundary, aka future.
						x: Gun.time.is() - (60 * 1000), // above now or upper boundary, aka future.
						y: Gun.time.is() + (200), // above now or upper boundary, aka future.
						z: Gun.time.is() + (50) // above now or upper boundary, aka future.
					}},
					w: true,
					x: 'nothing',
					y: 'farewell',
					z: 'doctor who'
				}
			}

			expect(gun.__.graph['asdf'].w).to.not.be.ok();
			expect(gun.__.graph['asdf'].x).to.be('how are you?');
			expect(gun.__.graph['asdf'].y).to.be('bye');
			expect(gun.__.graph['asdf'].z).to.be('who');
			var now = Gun.time.is();
			var ctx = Gun.union(gun, prime, function(){
				expect(Gun.time.is() - now).to.be.above(100);
				expect(gun.__.graph['asdf'].w).to.be(true);
				expect(gun.__.graph['asdf'].x).to.be('how are you?');
				expect(gun.__.graph['asdf'].y).to.be('farewell');
				expect(gun.__.graph['asdf'].z).to.be('doctor who');
				done(); //setTimeout(function(){ done() },1);
			});
		});
		
		it('two nodes', function(done){ // chat app problem where disk dropped the last data, turns out it was a union problem!
			var state = Gun.time.is();
			var prime = {
				'sadf': {
					_: {'#': 'sadf', '>':{
						1: state
					}},
					1: {'#': 'fdsa'}
				},
				'fdsa': {
					_: {'#': 'fdsa', '>':{
						msg: state
					}},
					msg: "Let's chat!"
				}
			}

			expect(gun.__.graph['sadf']).to.not.be.ok();
			expect(gun.__.graph['fdsa']).to.not.be.ok();
			var ctx = Gun.union(gun, prime, function(){
				expect(gun.__.graph['sadf'][1]).to.be.ok();
				expect(gun.__.graph['fdsa'].msg).to.be("Let's chat!");
				done();
			});
		});
		
		it('append third node', function(done){ // chat app problem where disk dropped the last data, turns out it was a union problem!
			var state = Gun.time.is();
			var prime = {
				'sadf': {
					_: {'#': 'sadf', '>':{
						2: state
					}},
					2: {'#': 'fads'}
				},
				'fads': {
					_: {'#': 'fads', '>':{
						msg: state
					}},
					msg: "hi"
				}
			}

			expect(gun.__.graph['sadf']).to.be.ok();
			expect(gun.__.graph['fdsa']).to.be.ok();
			var ctx = Gun.union(gun, prime, function(){
				expect(gun.__.graph['sadf'][1]).to.be.ok();
				expect(gun.__.graph['sadf'][2]).to.be.ok();
				expect(gun.__.graph['fads'].msg).to.be("hi");
				done();
			});
		});
		
		it('pseudo null', function(){
				var node = Gun.union.pseudo('pseudo');
				expect(Gun.is.soul.on(node)).to.be('pseudo');
		});
		
		it('pseudo node', function(){
			
			var graph = {
				'asdf': {
					_: {'#': 'asdf', '>': {
						x: Gun.time.is(),
						y: Gun.time.is()
					}},
					x: 1,
					y: 2
				}
			}
			var node = Gun.union.pseudo('soul', graph);
			expect(node).to.not.be.ok();
		});
		
		it('pseudo graph', function(){
			
			var graph = {
				'asdf': {
					_: {'#': 'asdf', '>': {
						a: Gun.time.is() - 2,
						z: Gun.time.is() - 2
					}},
					a: 1,
					z: 1
				},
				'fdsa': {
					_: {'#': 'fdsa', '>': {
						b: Gun.time.is() - 1,
						z: Gun.time.is() - 1
					}},
					b: 2,
					z: 2
				},
				'sadf': {
					_: {'#': 'sadf', '>': {
						c: Gun.time.is(),
						z: Gun.time.is() - 100
					}},
					c: 3,
					z: 3
				}
			}
			var node = Gun.union.pseudo('soul', graph);
			expect(Gun.is.soul.on(node)).to.be('soul');
			expect(node.a).to.be(1);
			expect(node.b).to.be(2);
			expect(node.c).to.be(3);
			expect(node.z).to.be(2);
		});
	});
	
	describe('API', function(){
		var gun = Gun();
		
		it('put', function(done){
			gun.put("hello", function(err, ok){
				expect(err).to.be.ok();
				done();
			});
		});
		
		it('put node', function(done){
			gun.put({hello: "world"}, function(err, ok){
				expect(err).to.not.be.ok();
				done();
			});
		});
		
		it('put node then value', function(done){
			var ref = gun.put({hello: "world"});
			
			ref.put('hello', function(err, ok){
				expect(err).to.be.ok();
				done();
			});
		});
		
		it('put node then put', function(done){
			gun.put({hello: "world"}).put({goodbye: "world"}, function(err, ok){
				expect(err).to.not.be.ok();
				done();
			});
		});
		
		it('put node key get', function(done){
			gun.put({hello: "key"}).key('yes/key', function(err, ok){
				expect(err).to.not.be.ok();
			}).get('yes/key', function(err, data){
				expect(err).to.not.be.ok();
				var c = 0;
				Gun.is.graph(data, function(node){
					expect(c++).to.be(0);
					if(Gun.obj.empty(node, Gun._.meta)){ return done(), true }
					expect(node.hello).to.be('key');
				});
			});
		});
		
		it('put node key gun get', function(done){
			gun.put({hello: "a key"}).key('yes/a/key', function(err, ok){
				expect(err).to.not.be.ok();
			});
			
			gun.get('yes/a/key', function(err, data){
				expect(err).to.not.be.ok();
				var c = 0;
				Gun.is.graph(data, function(node){
					expect(c++).to.be(0);
					if(Gun.obj.empty(node, Gun._.meta)){ return done(), true }
					expect(node.hello).to.be('a key');
				});
			});
		});
		
		it('gun key', function(){ // Revisit this behavior?
			try{ gun.key('fail/key') }
			catch(err){
				expect(err).to.be.ok();
			}
		});
		
		it('get key', function(done){
			gun.get('yes/key', function(err, data){
				expect(err).to.not.be.ok();
				var c = 0;
				Gun.is.graph(data, function(node){
					expect(c++).to.be(0);
					if(Gun.obj.empty(node, Gun._.meta)){ return }
					expect(node.hello).to.be('key');
				});
			}).key('hello/key', function(err, ok){
				expect(err).to.not.be.ok();
				done.key = true;
				if(done.yes){ done() }
			}).key('yes/hello', function(err, ok){
				expect(err).to.not.be.ok();
				done.yes = true;
				if(done.key){ done() }
			});
		});
		
		it('get key null', function(done){
			gun.get('yes/key').key('', function(err, ok){
				expect(err).to.be.ok();
				done();
			});
		});
		
		it('get node put node merge', function(done){
			gun.get('hello/key', function(err, data){
				expect(err).to.not.be.ok();
				var c = 0;
				Gun.is.graph(data, function(node){
					expect(c++).to.be(0);
					done.soul = Gun.is.soul.on(node);
				});
			}).put({hi: 'you'}, function(err, ok){
				expect(err).to.not.be.ok();
				var node = gun.__.graph[done.soul];
				expect(node.hello).to.be('key');
				expect(node.hi).to.be('you');
				done();
			});
		});
		
		it('get null put node never', function(done){ // TODO: GET returns nothing, and then doing a PUT?
			gun.get(null, function(err, ok){
				expect(err).to.be.ok();
				done.err = true;
			}).put({hi: 'you'}, function(err, ok){
				done.flag = true;
			});
			setTimeout(function(){
				expect(done.err).to.be.ok();
				expect(done.flag).to.not.be.ok();
				done();
			}, 500);
		});
		
		/* // not sure what this is suppose to do. Review later
		it('get key no data put', function(done){
			gun.get('this/key/definitely/does/not/exist', function(err, data){
				expect(err).to.not.be.ok();
				expect(data).to.not.be.ok();
			}).put({testing: 'stuff'}, function(err, ok){
				console.log("what?", err, ok);
				expect(err).to.not.be.ok();
				var node = gun.__.graph[done.soul];
				expect(node.hello).to.be('key');
				expect(node.hi).to.be('overwritten');
				done();
			});
		});
		*/
		
		it('get node put node merge conflict', function(done){
			gun.get('hello/key', function(err, data){
				expect(err).to.not.be.ok();
				var c = 0;
				Gun.is.graph(data, function(node){
					expect(c++).to.be(0);
					if(Gun.obj.empty(node, Gun._.meta)){ return true }
					expect(node.hi).to.be('you');
					done.soul = Gun.is.soul.on(node);
				});
			}).put({hi: 'overwritten'}, function(err, ok){
				expect(err).to.not.be.ok();
				var node = gun.__.graph[done.soul];
				expect(node.hello).to.be('key');
				expect(node.hi).to.be('overwritten');
				done();
			});
		});
		
		it('get node path', function(done){
			gun.get('hello/key').path('hi', function(err, val){
				expect(err).to.not.be.ok();
				expect(val).to.be('overwritten');
				done();
			});
		});
		
		it('get node path put value', function(done){
			gun.get('hello/key', function(err, data){
				expect(err).to.not.be.ok();
				var c = 0;
				Gun.is.graph(data, function(node){
					expect(c++).to.be(0);
					if(Gun.obj.empty(node, Gun._.meta)){ return true }
					expect(node.hi).to.be('overwritten');
					done.soul = Gun.is.soul.on(node);
				});
			}).path('hi').put('again', function(err, ok){
				expect(err).to.not.be.ok();
				var node = gun.__.graph[done.soul];
				expect(node.hello).to.be('key');
				expect(node.hi).to.be('again');
				done();
			});
		});
		
		it('get node path put object', function(done){
			gun.get('hello/key', function(err, data){
				expect(err).to.not.be.ok();
				var c = 0;
				Gun.is.graph(data, function(node){
					expect(c++).to.be(0);
					if(Gun.obj.empty(node, Gun._.meta)){ return true }
					expect(node.hi).to.be('again');
					done.soul = Gun.is.soul.on(node);
				});
			}).path('hi').put({yay: "value"}, function(err, ok){
				expect(err).to.not.be.ok();
				var root = gun.__.graph[done.soul];
				expect(root.hello).to.be('key');
				expect(root.yay).to.not.be.ok();
				expect(Gun.is.soul(root.hi)).to.be.ok();
				expect(Gun.is.soul(root.hi)).to.not.be(done.soul);
				done();
			});
		});
		
		it('get node path put object merge', function(done){
			gun.get('hello/key', function(err, data){
				expect(err).to.not.be.ok();
				var c = 0;
				Gun.is.graph(data, function(node){
					expect(c++).to.be(0);
					if(Gun.obj.empty(node, Gun._.meta)){ return true }
					expect(done.ref = Gun.is.soul(node.hi)).to.be.ok();
					done.soul = Gun.is.soul.on(node);
				});
			}).path('hi').put({happy: "faces"}, function(err, ok){
				expect(err).to.not.be.ok();
				var root = gun.__.graph[done.soul];
				var sub = gun.__.graph[done.ref];
				expect(root.hello).to.be('key');
				expect(root.yay).to.not.be.ok();
				expect(Gun.is.soul.on(sub)).to.be(done.ref);
				expect(sub.yay).to.be('value');
				expect(sub.happy).to.be('faces');
				done();
			});
		});
		
		it('get node path put value conflict relation', function(done){
			gun.get('hello/key', function(err, data){
				expect(err).to.not.be.ok();
				var c = 0;
				Gun.is.graph(data, function(node){
					expect(c++).to.be(0);
					if(Gun.obj.empty(node, Gun._.meta)){ return true }
					expect(done.ref = Gun.is.soul(node.hi)).to.be.ok();
					done.soul = Gun.is.soul.on(node);
				});
			}).path('hi').put('crushed', function(err, ok){
				expect(err).to.not.be.ok();
				var root = gun.__.graph[done.soul];
				var sub = gun.__.graph[done.ref];
				expect(root.hello).to.be('key');
				expect(root.yay).to.not.be.ok();
				expect(Gun.is.soul.on(sub)).to.be(done.ref);
				expect(sub.yay).to.be('value');
				expect(sub.happy).to.be('faces');
				expect(root.hi).to.be('crushed');
				done();
			});
		});
		
		/* // Future feature!
		it('put gun node', function(done){
			var mark = gun.put({age: 23, name: "Mark Nadal"});
			var amber = gun.put({age: 23, name: "Amber Nadal"});
			mark.path('wife').put(amber, function(err){
				expect(err).to.not.be.ok();
				expect(false).to.be.ok(); // what whatttt???
			});
		});
		*/
		
		it('put val', function(done){
			gun.put({hello: "world"}).val(function(val){
				expect(val.hello).to.be('world');
				done();
			});
		});
		
		it('put key val', function(done){
			gun.put({hello: "world"}).key('hello/world').val(function(val){
				expect(val.hello).to.be('world');
				done();
			});
		});
		
		it('get', function(done){
			gun.get('hello/world').val(function(val){
				expect(val.hello).to.be('world');
				done();
			});
		});
		
		it('get path', function(done){
			gun.get('hello/world').path('hello').val(function(val){
				expect(val).to.be('world');
				done();
			});
		});
		
		it('get put path', function(done){
			gun.get('hello/world').put({hello: 'Mark'}).path('hello').val(function(val){
				expect(val).to.be('Mark');
				done();
			});
		});
		
		it('get path put', function(done){
			gun.get('hello/world').path('hello').put('World').val(function(val){
				expect(val).to.be('World');
				done();
			});
		});
		
		it('get path empty put', function(done){
			gun.get('hello/world').path('earth').put('mars').val(function(val){
				expect(val).to.be('mars');
				done();
			});
		});
		
		it('get path val', function(done){
			gun.get('hello/world').path('earth').val(function(val){
				expect(val).to.be('mars');
				done();
			});
		});
		
		/* // CHANGELOG: This behavior is no longer allowed! Sorry peeps.
		it('key put val', function(done){
			gun.key('world/hello').put({world: "hello"}).val(function(val){
				expect(val.world).to.be('hello');
				done();
			});
		});
		
		it('get again', function(done){
			gun.get('world/hello').val(function(val){
				expect(val.world).to.be('hello');
				done();
			});
		});
		*/
		
		it('get not kick val', function(done){
			gun.get("some/empty/thing").not(function(){ // that if you call not first
				return this.put({now: 'exists'}).key("some/empty/thing"); // you can put stuff
			}).val(function(val){ // and THEN still retrieve it.
				expect(val.now).to.be('exists');
				done();
			});
		});
		
		it('get not kick val when it already exists', function(done){
			gun.get("some/empty/thing").not(function(){
				return this.put({now: 'THIS SHOULD NOT HAPPEN'});
			}).val(function(val){
				expect(val.now).to.be('exists');
				done();
			});
		});
		
		it('put path val sub', function(done){
			gun.put({last: {some: 'object'}}).path('last').val(function(val){
				expect(val.some).to.be('object');
				done();
			});
		});
		
		it('get put null', function(done){
			gun.put({last: {some: 'object'}}).path('last').val(function(val){
				expect(val.some).to.be('object');
			}).put(null).val(function(val){
				expect(val).to.be(null);
				done();
			});
		});
		
		it('var put key path', function(done){ // contexts should be able to be saved to a variable
			var foo = gun.put({foo: 'bar'}).key('foo/bar');
			foo.path('hello.world.nowhere'); // this should become a sub-context, that doesn't alter the original
			setTimeout(function(){
				foo.path('foo').val(function(val){ // and then the original should be able to be reused later
					expect(val).to.be('bar'); // this should work
					done();
				});
			}, 500);
		});
		
		it('var get path', function(done){ // contexts should be able to be saved to a variable
			var foo = gun.get('foo/bar');
			foo.path('hello.world.nowhere'); // this should become a sub-context, that doesn't alter the original
			setTimeout(function(){
				foo.path('foo').val(function(val){ // and then the original should be able to be reused later
					expect(val).to.be('bar'); // this should work
					done();
				});
			}, 500);
		});
		
		it('get not put val path val', function(done){
			gun.get("examples/list/foobar").not(function(){
				return this.put({
					id: 'foobar',
					title: 'awesome title',
					todos: {}
				}).key("examples/list/foobar");
			}).val(function(data){
				expect(data.id).to.be('foobar');
			}).path('todos').val(function(todos){
				expect(todos).to.not.have.property('id');
				done();
			});
		});
		
		it('put circular ref', function(done){
			var data = {};
			data[0] = "DATA!";
			data.a = {c: 'd', e: 1, f: true};
			data.b = {x: 2, y: 'z'};
			data.a.kid = data.b;
			data.b.parent = data.a;
			gun.put(data, function(err, ok){
				expect(err).to.not.be.ok();
			}).val(function(val){
				var a = gun.__.graph[Gun.is.soul(val.a)];
				var b = gun.__.graph[Gun.is.soul(val.b)];
				expect(Gun.is.soul(val.a)).to.be(Gun.is.soul.on(a));
				expect(Gun.is.soul(val.b)).to.be(Gun.is.soul.on(b));
				expect(Gun.is.soul(a.kid)).to.be(Gun.is.soul.on(b));
				expect(Gun.is.soul(b.parent)).to.be(Gun.is.soul.on(a));
				done();
			});
		});

		it('put circular deep', function(done){
			var mark = {
				age: 23,
				name: "Mark Nadal"
			}
			var amber = {
				age: 23,
				name: "Amber Nadal",
				phd: true
			}
			mark.wife = amber;
			amber.husband = mark;
			var cat = {
				age: 3,
				name: "Hobbes"
			}
			mark.pet = cat;
			amber.pet = cat;
			cat.owner = mark;
			cat.master = amber;
			gun.put(mark, function(err, ok){
				expect(err).to.not.be.ok();
			}).val(function(val){
				expect(val.age).to.be(23);
				expect(val.name).to.be("Mark Nadal");
				expect(Gun.is.soul(val.wife)).to.be.ok();
				expect(Gun.is.soul(val.pet)).to.be.ok();
			}).path('wife.pet.name').val(function(val){
				expect(val).to.be('Hobbes');
			}).back.path('pet.master').val(function(val){
				expect(val.name).to.be("Amber Nadal");
				expect(val.phd).to.be.ok();
				expect(val.age).to.be(23);
				expect(Gun.is.soul(val.pet)).to.be.ok();
				done();
			});
		});
		
		it('put partial sub merge', function(done){
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
			}, 500);
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
		
		it('context null put value val error', function(done){
			gun.put("oh yes", function(err){
				expect(err).to.be.ok();
				done();
			});
		});
		
		var foo;
		it('context null put node', function(done){
			foo = gun.put({foo: 'bar'}).val(function(obj){
				expect(obj.foo).to.be('bar');
				done(); //setTimeout(function(){ done() },1);
			});
		});
		
		it('context node put val', function(done){
			// EFFECTIVELY a TIMEOUT from the previous test. NO LONGER!
			foo.put('banana', function(err){
				expect(err).to.be.ok();
				done(); //setTimeout(function(){ done() },1);
			});
		});
		
		it('context node put node', function(done){
			// EFFECTIVELY a TIMEOUT from the previous test. NO LONGER!
			foo.put({bar: {zoo: 'who'}}).val(function(obj){
				expect(obj.foo).to.be('bar');
				expect(Gun.is.soul(obj.bar)).to.ok();
				done(); //setTimeout(function(){ done() },1);
			});
		});
		
		it('context node and field put value', function(done){
			// EFFECTIVELY a TIMEOUT from the previous test. NO LONGER!
			var tar = foo.path('tar');
			tar.put('zebra').val(function(val){
				expect(val).to.be('zebra');
				done(); //setTimeout(function(){ done() },1);
			});
		});
		
		var bar;
		it('context node and field of relation put node', function(done){
			// EFFECTIVELY a TIMEOUT from the previous test. NO LONGER!
			bar = foo.path('bar');
			bar.put({combo: 'double'}).val(function(obj){
				expect(obj.zoo).to.be('who');
				expect(obj.combo).to.be('double');
				done(); //setTimeout(function(){ done() },1);
			});
		});
		
		it('context node and field, put node', function(done){
			// EFFECTIVELY a TIMEOUT from the previous test. NO LONGER!
			bar.path('combo').put({another: 'node'}).val(function(obj){
				expect(obj.another).to.be('node');
				bar.val(function(node){
					expect(Gun.is.soul(node.combo)).to.be.ok();
					expect(Gun.is.soul(node.combo)).to.be(Gun.is.soul.on(obj));
					done(); //setTimeout(function(){ done() },1);
				});
			});
		});
		
		it('val path put val', function(done){
			var gun = Gun();
			
			var al = gun.put({gender:'m', age:30, name:'alfred'}).key('user/alfred');
			var beth = gun.put({gender:'f', age:22, name:'beth'  }).key('user/beth');
			
			al.val(function(a){
				beth.path('friend').put(a).val(function(aa){
					expect(Gun.is.soul.on(a)).to.be(Gun.is.soul.on(aa));
					done();
				});
			});
			
		});
		
		it('val path put val key', function(done){ // bug discovered from Jose's visualizer // TODO: still timing issues, 0.6!
			var gun = Gun(), s = Gun.time.is(), n = function(){ return Gun.time.is() }
			this.timeout(5000);
			
			gun.put({gender:'m', age:30, name:'alfred'}).key('user/alfred');
			gun.put({gender:'f', age:22, name:'beth'  }).key('user/beth');
			gun.get('user/alfred').val(function(a){
				gun.get('user/beth').path('friend').put(a); // b - friend_of -> a
				gun.get('user/beth').val(function(b){ // TODO: We should have b.friend by now!
					gun.get('user/alfred').path('friend').put(b, function(){ // a - friend_of -> b
						gun.get('user/beth').path('cat').put({name: "fluffy", age: 3, coat: "tabby"}, function(err, ok){
							
							gun.get('user/alfred').path('friend.cat').key('the/cat');
							
							gun.get('the/cat').val(function(c){
								expect(c.name).to.be('fluffy');
								expect(c.age).to.be(3);
								expect(c.coat).to.be('tabby');
								done();
							});
						});
					});
				});
			});
		});
		
		it('map', function(done){
			var c = 0, set = gun.put({a: {here: 'you'}, b: {go: 'dear'}, c: {sir: '!'} });
			set.map(function(obj, field){
				c++;
				if(field === 'a'){
					expect(obj.here).to.be('you');
				}
				if(field === 'b'){
					expect(obj.go).to.be('dear');	
				}
				if(field === 'c'){
					expect(obj.sir).to.be('!');
				}
				if(c === 3){
					done();
				}
			})
		});
		
		it('key soul', function(done){
			var gun = Gun();
			gun.key('me', function(err, ok){
				expect(err).to.not.be.ok();
				expect(gun.__.key.s['me']).to.be.ok();
				Gun.is.graph(gun.__.key.s['me'], function(node, soul){ done.soul = soul });
				expect(done.soul).to.be.ok('qwertyasdfzxcv');
				done();
			}, 'qwertyasdfzxcv');
		});
		
		it('no false positive null emit', function(done){
			var gun = Gun({hooks: {get: function(key, cb){
				var g = {};
				g[soul] = {_: {'#': soul, '>': {'a': 0}},
					'a': 'b'
				};
				cb(null, g);
				g = {};
				g[soul] = {_: {'#': soul, '>': {'c': 0}},
					'c': 'd'
				};
				cb(null, g);
				g = {};
				g[soul] = {_: {'#': soul }};
				cb(null, g);
				cb(); // false trigger!
			}}}), soul = Gun.text.random();
			
			gun.get('me').not(function(){
				done.fail = true;
			}).val(function(val){
				setTimeout(function(){
					expect(val.a).to.be('b');
					expect(val.c).to.be('d');
					expect(done.fail).to.not.be.ok();
					done();
				},5);
			});
		});
		
		it('unique val on stream', function(done){
			var gun = Gun({hooks: {get: function(key, cb){
				var g = {};
				g[soul] = {_: {'#': soul, '>': {'a': 0}},
					'a': 'b'
				};
				cb(null, g);
				g = {};
				g[soul] = {_: {'#': soul, '>': {'c': 0}},
					'c': 'd'
				}; 
				cb(null, g);
				g = {};
				g[soul] = {_: {'#': soul }};
				cb(null, g);
			}}}), soul = Gun.text.random();
			
			gun.get('me').val(function(val){
				done.count = (done.count || 0) + 1;
				setTimeout(function(){
					expect(val.a).to.be('b');
					expect(val.c).to.be('d');
					expect(done.count).to.be(1);
					done();
				},5);
			});
		});
		
		it('unique path val on stream', function(done){
			var gun = Gun({hooks: {get: function(key, cb){
				var g = {};
				g[soul] = {_: {'#': soul, '>': {'a': 0}},
					'a': 'a'
				};
				cb(null, g);
				g = {};
				g[soul] = {_: {'#': soul, '>': {'a': 1}},
					'a': 'b'
				};
				cb(null, g);
				g = {};
				g[soul] = {_: {'#': soul }};
				cb(null, g);
			}}}), soul = Gun.text.random();
			
			gun.get('me').path('a').val(function(val){
				done.count = (done.count || 0) + 1;
				setTimeout(function(){
					expect(val).to.be('b');
					expect(done.count).to.be(1);
					done();
				},5);
			});
		});
		
		it('double not', function(done){ // from the thought tutorial
			var gun = Gun().get('thoughts').not(function(key){
				return this.put({}).key(key);
			});
			
			setTimeout(function(){
				gun.not(function(){
					console.log("DOUBLE NOT!!!!!!");
					done.not = true;
				}).val(function(){
					expect(done.not).to.not.be.ok();
					done();
				})
			}, 10);
		});

		it('set', function(done){
			done.c = 0;
			var gun = Gun();
			gun.get('set').set().set().val(function(val){
				done.c += 1;
				expect(Gun.obj.empty(val, '_')).to.be.ok();
				setTimeout(function(){ 
					expect(done.c).to.be(1);
					done() 
				},10)
			});
		});
		
		it('set multiple', function(done){
			var gun = Gun().get('sets').set(), i = 0;
			gun.val(function(val){
				expect(done.soul = Gun.is.soul.on(val)).to.be.ok();
				expect(Gun.obj.empty(val, '_')).to.be.ok();
			});
			
			gun.set(1).set(2).set(3).set(4); // if you set an object you'd have to do a `.back`
			gun.map().val(function(val, field){
				i += 1;
				expect(val).to.be(i);
				if(i % 4 === 0){
					setTimeout(function(){
						done.i = 0;
						Gun.obj.map(gun.__.graph, function(){ done.i++ });
						expect(done.i).to.be(1); // make sure there isn't double.
						Gun.log.verbose = false;
						done() 
					},10);
				}
			});
		});
		
		it('peer 1 get key, peer 2 put key, peer 1 val', function(done){
			var hooks = {get: function(key, cb, opt){
				cb();
			}, put: function(nodes, cb, opt){
				//console.log("put hook", nodes);
				Gun.union(gun1, nodes);
				cb();
			}, key: function(key, soul, cb, opt){
				//console.log("key hook", key, soul);
				gun1.key(key, null, soul);
				cb();
			}},
			gun1 = Gun({hooks: {get: hooks.get}}).get('race')
			, gun2 = Gun({hooks: hooks}).get('race');
			
			setTimeout(function(){
				gun2.put({the: 'data'}).key('race');
				setTimeout(function(){
					gun1.on(function(val){
						expect(val.the).to.be('data');
						done();
					});
				},10);
			},10);
		});
		
		it('get pseudo merge', function(done){
			var gun = Gun();
			
			gun.put({a: 1, z: -1}).key('pseudo');
			gun.put({b: 2, z: 0}).key('pseudo');
			
			gun.get('pseudo').val(function(val){
				expect(val.a).to.be(1);
				expect(val.b).to.be(2);
				expect(val.z).to.be(0);
				done();
			});
		});
		
		it('get pseudo merge on', function(done){
			var gun = Gun();
			
			gun.put({a: 1, z: -1}).key('pseudon');
			gun.put({b: 2, z: 0}).key('pseudon');
			
			gun.get('pseudon').on(function(val){
				if(done.val){ return } // TODO: Maybe prevent repeat ons where there is no diff?
				done.val = val;
				expect(val.a).to.be(1);
				expect(val.b).to.be(2);
				expect(val.z).to.be(0);
				done();
			});
		});
		
		it('get pseudo merge across peers', function(done){
			Gun.on('opt').event(function(gun, o){
				if(connect){ return }
				gun.__.opt.hooks = {get: function(key, cb, opt){
					var other = (o.alice? gun2 : gun1);
					if(connect){
						//console.log('connect to peer and get', key);
						other.get(key, cb);
					} else {
						cb();
					}
				}, put: function(nodes, cb, opt){
					var other = (o.alice? gun2 : gun1);
					if(connect){
						Gun.union(other, nodes);
					}
					cb();
				}, key: function(key, soul, cb, opt){
					var other = (o.alice? gun2 : gun1);
					if(connect){
						other.key(key, null, soul);
					}
					cb();
				}}
			});
			var connect, gun1 = Gun({alice: true}).get('pseudo/merge').not(function(){
				return this.put({hello: "world!"}).key('pseudo/merge');
			}), gun2;
			
			gun1.val(function(val){
				expect(val.hello).to.be('world!');
			});
			setTimeout(function(){
				gun2 = Gun({bob: true}).get('pseudo/merge').not(function(){
					return this.put({hi: "mars!"}).key('pseudo/merge');
				});
				gun2.val(function(val){
					expect(val.hi).to.be('mars!');
				});
				setTimeout(function(){
					// CONNECT THE TWO PEERS
					connect = true;
					gun1.get('pseudo/merge', null, {force: true}); // fake a browser refersh, in real world we should auto-reconnect
					gun2.get('pseudo/merge', null, {force: true}); // fake a browser refersh, in real world we should auto-reconnect
					setTimeout(function(){
						gun1.val(function(val){
							expect(val.hello).to.be('world!');
							expect(val.hi).to.be('mars!');
							done.gun1 = true;
						});
						gun2.val(function(val){
							expect(val.hello).to.be('world!');
							expect(val.hi).to.be('mars!');
							expect(done.gun1).to.be.ok();
							Gun({});
							done();
						});
					},10);
				},10);
			},10);
		});
				
		it("get map val -> map val", function(done){ // Terje's bug
			var gun = Gun(); // we can test GUN locally.
			var passengers = gun.get('passengers'); // this is now a list of passengers that we will map over.
			var ctx = {n: 0, d: 0, l: 0};
			passengers.map().val(function(passenger, id){
				this.map().val(function(change, field){
					//console.log("Passenger", passenger.name, "had", field, "change to:", change, '\n\n');
					if('name' == field){ expect(change).to.be(passenger.name); ctx.n++ }
					if('direction' == field){ expect(change).to.be(passenger.direction); ctx.d++ }
					if('location' == field){
						delete change._; ctx.l++;
						if('Bob' == passenger.name){
							expect(change).to.eql({'lat': '37.6159', 'lng': '-128.5'}); 
						} else {
							expect(change).to.eql({'lat': 'f37.6159', 'lng': 'f-128.5'}); 
						}
					}
					if(ctx.n == 2 && ctx.d == 2 && ctx.l == 2){ done() }
				});
			});
			var bob = passengers.set({
				name: "Bob",
				location: {'lat': '37.6159', 'lng': '-128.5'},
				direction: '128.2'
			});
			var fred = passengers.set({
				name: "Fred",
				location: {'lat': 'f37.6159', 'lng': 'f-128.5'},
				direction: 'f128.2'
			});
		});
				
		it("get map map val", function(done){ // Terje's bug
			var gun = Gun(); // we can test GUN locally.
			var passengers = gun.get('passengers/map'); // this is now a list of passengers that we will map over.
			var ctx = {n: 0, d: 0, l: 0};
			passengers.map().map().val(function(val, field){
				if('name' == field){ expect(val).to.be(!ctx.n? 'Bob' : 'Fred'); ctx.n++ }
				if('direction' == field){ expect(val).to.be(!ctx.d? '128.2' : 'f128.2'); ctx.d++ }
				if('location' == field){
					delete val._;
					if(!ctx.l){
						expect(val).to.eql({'lat': '37.6159', 'lng': '-128.5'}); 
					} else {
						expect(val).to.eql({'lat': 'f37.6159', 'lng': 'f-128.5'}); 
					}
					ctx.l++;
				}
				if(ctx.n == 2 && ctx.d == 2 && ctx.l == 2){ done() }
			});
			var bob = passengers.set({
				name: "Bob",
				location: {'lat': '37.6159', 'lng': '-128.5'},
				direction: '128.2'
			});
			setTimeout(function(){
				var fred = passengers.set({
					name: "Fred",
					location: {'lat': 'f37.6159', 'lng': 'f-128.5'},
					direction: 'f128.2'
				});
			},100);
		});
				
		it("get map path val", function(done){ // Terje's bug
			var gun = Gun();
			var ctx = {l: -1, d: 0};
			var passengers = gun.get('passengers/path');
			passengers.map().path('location.lng').val(function(val, field){
				expect(field).to.be('lng');
				if(ctx.l){
					expect(val).to.be('-128.5'); 
				} else {
					expect(val).to.eql('f-128.5'); 
				}
				ctx.l++;
				if(ctx.l){ done() }
			});
			var bob = passengers.set({
				name: "Bob",
				location: {'lat': '37.6159', 'lng': '-128.5'},
				direction: '128.2'
			});
			setTimeout(function(){
				var fred = passengers.set({
					name: "Fred",
					location: {'lat': 'f37.6159', 'lng': 'f-128.5'},
					direction: 'f128.2'
				});
			},100);
		});
		
		it("put path deep val -> path val", function(done){ // Terje's bug
			var gun = Gun();
			gun.put({you: {have: {got: {to: {be: {kidding: "me!"}}}}}}).path('you.have.got.to.be').val(function(val, field){
				expect(val.kidding).to.be('me!');
				this.path('kidding').val(function(val){
					expect(val).to.be('me!');
					done();
				});
			});
		});
		
		it("get set path put, map path val -> path val", function(done){ // Terje's bug
			var gun = Gun();
			var ctx = {l: -1, d: 0};
			var passengers = gun.get('passengers/set/path');
			passengers.set({name: 'Bob'}).path('direction').put({lol: {just: 'kidding', dude: '!'}}, function(err, ok){});
			passengers.map().path('direction.lol').val(function(val){
				this.path('just').val(function(val){
					expect(val).to.be('kidding');
				}).back.path('dude').val(function(val){
					expect(val).to.be('!');
					done();
				});
			})
		});
	});	
		
	describe('Streams', function(){
		var gun = Gun(), g = function(){
			return Gun({hooks: {get: ctx.get}});
		}, ctx = {gen: 5, extra: 45, network: 2};
		
		it('prep hook', function(done){
			this.timeout(ctx.gen * ctx.extra);
			var peer = Gun(), ref;
			ctx.get = function(key, cb){
				var c = 0;
				cb = cb || function(){};
				if('big' !== key){ return cb(null, null) }
				setTimeout(function badNetwork(){
					c += 1;
					var soul = Gun.is.soul.on(ref);
					var graph = {};
					var data = graph[soul] = {_: {'#': soul, '>': {}}};
					if(!ref['f' + c]){ 
						return cb(null, graph), cb(null, {});
					}
					data._[Gun._.HAM]['f' + c] = ref._[Gun._.HAM]['f' + c];
					data['f' + c] = ref['f' + c];
					cb(null, graph);
					setTimeout(badNetwork, ctx.network);
				},ctx.network);
			}
			ctx.get.fake = {};
			for(var i = 1; i < (ctx.gen) + 1; i++){
				ctx.get.fake['f'+i] = i;
				ctx.length = i;
			}
			var big = peer.put(ctx.get.fake).val(function(val){
				ref = val;
				ctx.get('big', function(err, graph){
					if(Gun.obj.empty(graph)){ done() }
				});
				gun.opt({hooks: {get: ctx.get}});
			});
		});
		
		it('map chain', function(done){
			var set = gun.put({a: {here: 'you'}, b: {go: 'dear'}, c: {sir: '!'} });
			set.map().val(function(obj, field){
				if(obj.here){
					done.a = obj.here;
					expect(obj.here).to.be('you');
				}
				if(obj.go){
					done.b = obj.go;
					expect(obj.go).to.be('dear');	
				}
				if(obj.sir){
					done.c = obj.sir;
					expect(obj.sir).to.be('!');
				}
				if(done.a && done.b && done.c){
					done();
				}
			});
		});
		
		it('map chain path', function(done){
			var set = gun.put({
				a: {name: "Mark",
					pet: {coat: "tabby", name: "Hobbes"}
				}, b: {name: "Alice",
					pet: {coat: "calico", name: "Cali"}
				}, c: {name: "Bob",
					pet: {coat: "tux", name: "Casper"}
				} 
			});
			set.map().path('pet').val(function(obj, field){
				if(obj.name === 'Hobbes'){
					done.hobbes = obj.name;
					expect(obj.name).to.be('Hobbes');
					expect(obj.coat).to.be('tabby');
				}
				if(obj.name === 'Cali'){
					done.cali = obj.name;
					expect(obj.name).to.be('Cali');
					expect(obj.coat).to.be('calico');
				}
				if(obj.name === 'Casper'){
					done.casper = obj.name;
					expect(obj.name).to.be('Casper');
					expect(obj.coat).to.be('tux');
				}
				if(done.hobbes && done.cali && done.casper){
					done();
				}
			});
		});
		
		it('get big on', function(done){
			this.timeout(ctx.gen * ctx.extra);
			var test = {c: 0, last: 0};
			g().get('big').on(function(val){
				if(test.done){ return console.log("hey yo! you got duplication on your ons!"); }
				delete val._;
				if(val['f' + (test.last + 1)]){ 
					test.c += 1;
					test.last += 1;
				}
				var obj = {};
				for(var i = 1; i < test.c + 1; i++){
					obj['f'+i] = i;
				}
				expect(val).to.eql(obj);
				if(test.c === ctx.length){
					test.done = true;
					done();
				}
			});
		});
		
		it('get big on delta', function(done){
			this.timeout(ctx.gen * ctx.extra);
			var test = {c: 0, seen: {}};
			g().get('big').on(function(val){
				delete val._;
				if(test.seen['f' + test.c]){ return }
				test.seen['f' + test.c] = true;
				test.c += 1;
				var obj = {};
				obj['f' + test.c] = test.c;
				expect(val).to.eql(obj);
				if(test.c === ctx.length){
					done();
				}
			}, true);
		});
		
		it('get val', function(done){
			this.timeout(ctx.gen * ctx.extra);
			g().get('big').val(function(obj){
				delete obj._;
				expect(obj.f1).to.be(1);
				expect(obj['f' + ctx.length]).to.be(ctx.length);
				expect(obj).to.be.eql(ctx.get.fake);
				done();
			});
		});
		
		it('get big map val', function(done){
			this.timeout(ctx.gen * ctx.extra);
			var test = {c: 0, seen: {}};
			g().get('big').map().val(function(val, field){
				if(test.seen[field]){ return }
				test.seen[field] = true;
				delete val._;
				expect(field).to.be('f' + (test.c += 1));
				expect(val).to.be(test.c);
				if(test.c === ctx.length){
					done();
				}
			});
		});
	});
});