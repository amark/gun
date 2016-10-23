(function(env){
	root = env.window? env.window : root;
	env.window && root.localStorage && root.localStorage.clear();
	root.Gun = root.Gun || require('../gun');
	//root.Gun = root.Gun || require('../src/index');
}(this));

//Gun.log.squelch = true;
var gleak = {globals: {}, check: function(){ // via tobyho
  var leaked = []
  for (var key in gleak.globe){ if (!(key in gleak.globals)){ leaked.push(key)} }
  if (leaked.length > 0){ console.log("GLOBAL LEAK!", leaked); return leaked }
}};
(function(env){
	for (var key in (gleak.globe = env)){ gleak.globals[key] = true }
}(this));

describe('Performance', function(){ return; // performance tests
	var console = root.console || {log: function(){}};
	function perf(fn, i){
		i = i || 1000;
		while(--i){
			fn(i);
		}
	}
	perf.now = this.performance? function(){ return performance.now() } : function(){ return Gun.time.now()/1000 };
	(function(){
		var t1 = perf.now();
		var obj = {1: 'a', 2: 'b', 3: 'c', 4: 'd', 5: 'e', 6: 'f', 7: 'g', 8: 'h', 9: 'i'};
		Object.keys && perf(function(){
			var l = Object.keys(obj), ll = l.length, i = 0, s = '';
			for(; i < ll; i++){
				var v = l[i];
				s += v;
			}
		});
		console.log('map: native', (t1 = (perf.now() - t1)/1000) + 's');
		
		var t2 = perf.now();
		var obj = {1: 'a', 2: 'b', 3: 'c', 4: 'd', 5: 'e', 6: 'f', 7: 'g', 8: 'h', 9: 'i'};
		perf(function(){
			var s = '';
			Gun.obj.map(obj, function(v){
				s += v;
			})
		});
		console.log('map: gun', (t2 = (perf.now() - t2)/1000) + 's', (t2 / t1).toFixed(1)+'x', 'slower.');
	}());
	(function(){
		if(!Gun.store){
			var tab = Gun().tab;
			if(!tab){ return }
			Gun.store = tab.store;
		}
		root.localStorage && root.localStorage.clear();
		var it = 1000;
		var t1 = perf.now();
		perf(function(i){
			var obj = {'i': i, 'v': Gun.text.random(100)};
			Gun.store.put('test/native/' + i, obj);
		}, it);
		console.log('store: native', (t1 = (perf.now() - t1)/1000) + 's');

		root.localStorage && root.localStorage.clear();
		var gun = Gun({wire: {get:function(l,cb){cb()},put:function(g,cb){
			Gun.is.graph(g, function(node, soul){
				Gun.store.put(soul, node);
			});
			cb(null);
		}}});
		var t2 = perf.now();
		perf(function(i){
			var obj = {'i': i, 'v': Gun.text.random(100)};
			gun.put(obj);
		}, it);
		console.log('store: gun', (t2 = (perf.now() - t2)/1000) + 's', (t2 / t1).toFixed(1)+'x', 'slower.');
		root.localStorage && root.localStorage.clear();
	}());
	(function(){ // setTimeout
		if(!Gun.store){
			var tab = Gun().tab;
			if(!tab){ return }
			Gun.store = tab.store;
		}
		root.localStorage && root.localStorage.clear();
		var t1 = perf.now();
		i = i || 1000;
		while(--i){
			var obj = {'i': i, 'v': Gun.text.random(100)};
			Gun.store.put('test/native/' + i, obj);
		}
		console.log('store: native', (t1 = (perf.now() - t1)/1000) + 's');

		root.localStorage && root.localStorage.clear();
		var gun = Gun({wire: {get:function(l,cb){cb()},put:function(g,cb){
			Gun.is.graph(g, function(node, soul){
				Gun.store.put(soul, node);
			});
			cb(null);
		}}});
		var t2 = perf.now();
		perf(function(i){
			var obj = {'i': i, 'v': Gun.text.random(100)};
			gun.put(obj);
		}, it);
		console.log('store: gun', (t2 = (perf.now() - t2)/1000) + 's', (t2 / t1).toFixed(1)+'x', 'slower.');
		root.localStorage && root.localStorage.clear();
	}());
	(function(){
		var t1 = perf.now();
		var on = Gun.on.create(), c = 0, o = [];
		perf(function(i){
			o.push(function(n){
				c += 1;
			});
			var ii = 0, l = o.length;
			for(; ii < l; ii++){
				o[ii](i);
			}
		});
		console.log('on: native', (t1 = (perf.now() - t1)/1000) + 's');
		
		var on = Gun.on.create(), c = 0;
		var t2 = perf.now();
		perf(function(i){
			on('change').event(function(n){
				c += 1;
			});
			on('change').emit(i);
		});
		console.log('on: gun', (t2 = (perf.now() - t2)/1000) + 's', (t2 / t1).toFixed(1)+'x', 'slower.');
	}());return;
	(function(){ // always do this last!
		var t1 = perf.now();
		perf(function(i){
			setTimeout(function(){
				if(i === 1){
					cb1();
				}
			},0);
		}); var cb1 = function(){
			console.log('setTimeout: native', (t1 = (perf.now() - t1)/1000) + 's', (t1 / t2).toFixed(1)+'x', 'slower.');
		}
		var t2 = perf.now();
		perf(function(i){
			setImmediate(function(){
				if(i === 1){
					cb2();
				}
			});
		}); var cb2 = function(){
			console.log('setImmediate: gun', (t2 = (perf.now() - t2)/1000) + 's', (t2 / t1).toFixed(1)+'x', 'slower.');
		}
	}());
});

describe('Gun', function(){
	var t = {};
	
	describe('Utility', function(){
		var u;
		/* // causes logger to no longer log.
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
		} );
		*/

		describe('Type Check', function(){
			it('binary', function(){
				expect(Gun.bi.is(false)).to.be(true);
				expect(Gun.bi.is(true)).to.be(true);
				expect(Gun.bi.is(u)).to.be(false);
				expect(Gun.bi.is(null)).to.be(false);
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
				expect(Gun.num.is(u)).to.be(false);
				expect(Gun.num.is(null)).to.be(false);
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
				expect(Gun.text.is(u)).to.be(false);
				expect(Gun.text.is(null)).to.be(false);
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
				expect(Gun.list.is(u)).to.be(false);
				expect(Gun.list.is(null)).to.be(false);
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
				expect(Gun.obj.is(u)).to.be(false);
				expect(Gun.obj.is()).to.be(false);
				expect(Gun.obj.is(undefined)).to.be(false);
				expect(Gun.obj.is(null)).to.be(false);
				expect(Gun.obj.is(NaN)).to.be(false);
				expect(Gun.obj.is(0)).to.be(false);
				expect(Gun.obj.is(1)).to.be(false);
				expect(Gun.obj.is('')).to.be(false);
				expect(Gun.obj.is('a')).to.be(false);
				expect(Gun.obj.is([])).to.be(false);
				expect(Gun.obj.is([1])).to.be(false);
				expect(Gun.obj.is(false)).to.be(false);
				expect(Gun.obj.is(true)).to.be(false);
				expect(Gun.obj.is(function(){})).to.be(false);
				expect(Gun.obj.is(new Date())).to.be(false);
				expect(Gun.obj.is(/regex/)).to.be(false);
				this.document && expect(Gun.obj.is(document.createElement('div'))).to.be(false);
				expect(Gun.obj.is(new (function Class(){ this.x = 1; this.y = 2 })())).to.be(true);
			});
			it('fns',function(){
				expect(Gun.fns.is(function(){})).to.be(true);
				expect(Gun.fns.is(u)).to.be(false);
				expect(Gun.fns.is(null)).to.be(false);
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
			it('match',function(){
				expect(Gun.text.match("user/mark", {'=': 'user/mark'})).to.be.ok();
				expect(Gun.text.match("user/mark/nadal", {'=': 'user/mark'})).to.not.be.ok();
				expect(Gun.text.match("user/mark/nadal", {'*': 'user/'})).to.be.ok();
				expect(Gun.text.match("email/mark@gunDB.io", {'*': 'user/'})).to.not.be.ok();
				expect(Gun.text.match("user/mark/nadal", {'*': 'user/', '>': 'j', '<': 'o'})).to.be.ok();
				expect(Gun.text.match("user/amber/nadal", {'*': 'user/', '>': 'j', '<': 'o'})).to.not.be.ok();
				expect(Gun.text.match("user/amber/nadal", {'*': 'user/', '>': 'a', '<': 'c'})).to.be.ok();
				expect(Gun.text.match("user/mark/nadal", {'*': 'user/', '>': 'a', '<': 'c'})).to.not.be.ok();
				expect(Gun.text.match("user/mark/nadal", {'*': 'user/', '>': 'j', '<': 'o', '?': 'm/n'})).to.be.ok();
				expect(Gun.text.match("user/amber/cazzell", {'*': 'user/', '?': 'm/n'})).to.not.be.ok();
				expect(Gun.text.match("user/mark/nadal", {'*': 'user/', '-': 'mad'})).to.be.ok();
				expect(Gun.text.match("user/mad/person", {'*': 'user/', '-': 'mad'})).to.not.be.ok();
				expect(Gun.text.match("user/mark/timothy/nadal", {'*': 'user/', '-': ['mark', 'nadal']})).to.not.be.ok();
				expect(Gun.text.match("user/amber/rachel/cazzell", {'*': 'user/', '-': ['mark', 'nadal']})).to.be.ok();
				expect(Gun.text.match("user/mark/nadal", {'*': 'user/', '+': 'ark'})).to.be.ok();
				expect(Gun.text.match("user/mad/person", {'*': 'user/', '+': 'ark'})).to.not.be.ok();
				expect(Gun.text.match("user/mark/timothy/nadal", {'*': 'user/', '+': ['mark', 'nadal']})).to.be.ok();
				expect(Gun.text.match("user/mark/timothy/nadal", {'*': 'user/', '+': ['nadal', 'mark']})).to.be.ok();
				expect(Gun.text.match("user/mark/timothy/nadal", {'*': 'user/', '+': ['mark', 'amber']})).to.not.be.ok();
				expect(Gun.text.match("user/mark/rachel/nadal/cazzell", {'*': 'user/', '+': ['mark', 'cazzell'], '-': ['amber', 'timothy']})).to.be.ok();
				expect(Gun.text.match("user/mark/rachel/timothy/cazzell", {'*': 'user/', '+': ['mark', 'cazzell'], '-': ['amber', 'timothy']})).to.not.be.ok();
				expect(Gun.text.match("photo/kitten.jpg", {'*': 'photo/', '!': '.jpg'})).to.be.ok();
				expect(Gun.text.match("photo/kittens.gif", {'*': 'photo/', '!': '.jpg'})).to.not.be.ok();
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
			/*
			it.skip('sum',function(done){ // deprecate?
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
			*/
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
				expect(Gun.is.val(false)).to.be(true);
				expect(Gun.is.val(true)).to.be(true);
				expect(Gun.is.val(0)).to.be(true);
				expect(Gun.is.val(1)).to.be(true);
				expect(Gun.is.val('')).to.be(true);
				expect(Gun.is.val('a')).to.be(true);
				expect(Gun.is.val({'#':'somesoulidhere'})).to.be('somesoulidhere');
				expect(Gun.is.val({'#':'somesoulidhere', and: 'nope'})).to.be(false);
				expect(Gun.is.val(Infinity)).to.be(false); // boohoo :(
				expect(Gun.is.val(NaN)).to.be(false);
				expect(Gun.is.val([])).to.be(false);
				expect(Gun.is.val([1])).to.be(false);
				expect(Gun.is.val({})).to.be(false);
				expect(Gun.is.val({a:1})).to.be(false);
				expect(Gun.is.val(function(){})).to.be(false);
			});
			it('is rel',function(){
				expect(Gun.is.rel({'#':'somesoulidhere'})).to.be('somesoulidhere');
				expect(Gun.is.rel({'#':'somethingelsehere'})).to.be('somethingelsehere');
				expect(Gun.is.rel({'#':'somesoulidhere', and: 'nope'})).to.be(false);
				expect(Gun.is.rel({or: 'nope', '#':'somesoulidhere'})).to.be(false);
				expect(Gun.is.rel(false)).to.be(false);
				expect(Gun.is.rel(true)).to.be(false);
				expect(Gun.is.rel('')).to.be(false);
				expect(Gun.is.rel('a')).to.be(false);
				expect(Gun.is.rel(0)).to.be(false);
				expect(Gun.is.rel(1)).to.be(false);
				expect(Gun.is.rel(Infinity)).to.be(false); // boohoo :(
				expect(Gun.is.rel(NaN)).to.be(false);
				expect(Gun.is.rel([])).to.be(false);
				expect(Gun.is.rel([1])).to.be(false);
				expect(Gun.is.rel({})).to.be(false);
				expect(Gun.is.rel({a:1})).to.be(false);
				expect(Gun.is.rel(function(){})).to.be(false);
			});
			it('is lex',function(){
				expect(Gun.is.lex({'#': 'soul'})).to.be(true);
				expect(Gun.is.lex({'.': 'field'})).to.be(true);
				expect(Gun.is.lex({'=': 'value'})).to.be(true);
				expect(Gun.is.lex({'>': 'state'})).to.be(true);
				expect(Gun.is.lex({'#': {'=': 'soul'}})).to.be(true);
				expect(Gun.is.lex({'#': {'=': 'soul'}, '.': []})).to.be(false);
				expect(Gun.is.lex({'#': {'=': 'soul'}, 'asdf': 'oye'})).to.be(false);
				expect(Gun.is.lex()).to.be(false);
				expect(Gun.is.lex('')).to.be(false);
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
			Gun.ify(data, null, {pure: true})(function(err, ctx){
				expect(err).to.not.be.ok();
				expect(ctx.err).to.not.be.ok();
				expect(ctx.root).to.eql(data);
				expect(ctx.root === data).to.not.ok();
				done();
			});
		});
		
		it('basic soul', function(done){
			var data = {_: {'#': 'SOUL'}, a: false, b: true, c: 0, d: 1, e: '', f: 'g', h: null};
			Gun.ify(data, null, {pure: true})(function(err, ctx){
				expect(err).to.not.be.ok();
				expect(ctx.err).to.not.be.ok();
				
				expect(ctx.root).to.eql(data);
				expect(ctx.root === data).to.not.be.ok();
				expect(Gun.is.node.soul(ctx.root) === Gun.is.node.soul(data));
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
		
		it('ify null', function(){
				var node = Gun.union.ify(null, 'pseudo');
				expect(Gun.is.node.soul(node)).to.be('pseudo');
		});
		
		it('ify node', function(){
			
			var graph = {
				'asdf': {
					_: {'#': 'asdf', '>': {
						x: Gun.time.is(),
						y: Gun.time.is()
					}},
					x: 1,
					y: 2
				},
				'soul': {
					_: {'#': 'soul', '~': 1, '>': {
						'asdf': Gun.time.is()
					}},
					'asdf': {'#': 'asdf'}
				}
			}
			var node = Gun.union.ify(graph, 'soul');
			expect(Gun.is.node.soul(node)).to.be('soul');
			expect(node.x).to.be(1);
			expect(node.y).to.be(2);
		});
		
		it('ify graph', function(){
			
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
				},
				'soul': {
					_: {'#': 'soul', '~': 1, '>': {
						'asdf': Gun.time.is(),
						'fdsa': Gun.time.is(),
						'sadf': Gun.time.is(),
					}},
					'asdf': {'#': 'asdf'},
					'fdsa': {'#': 'fdsa'},
					'sadf': {'#': 'sadf'}
				}
			}
			var node = Gun.union.ify(graph, 'soul');
			expect(Gun.is.node.soul(node)).to.be('soul');
			expect(node.a).to.be(1);
			expect(node.b).to.be(2);
			expect(node.c).to.be(3);
			expect(node.z).to.be(2);
		});
	});

	describe('API', function(){
		var gopt = {wire:{put:function(n,cb){cb()},get:function(k,cb){cb()}}};
		var gun = Gun();
				
		it('gun chain separation', function(done){
			var gun = Gun();
			
			var c1 = gun.put({hello: 'world'});
			
			var c2 = gun.put({hi: 'earth'});
			
			c1.on(function(val){
				expect(val.hi).to.not.be.ok();
			});
			
			c2.on(function(val){
				expect(val.hello).to.not.be.ok();
				if(done.c){ return }
				done(); done.c = 1;
			});
		});

		describe('timeywimey', function(){ return;
			
			it('kitty', function(done){
				var g1 = gun.put({hey: 'kitty'}).key('timeywimey/kitty');

				var g2 = gun.get('timeywimey/kitty').on(function(val){
					delete val._;
					//console.log("kitty?", val);
					expect(val.hey).to.be('kitty');
					expect(val.hi).to.not.be.ok();
					expect(val.hello).to.not.be.ok();
					expect(val.foo).to.not.be.ok();
					if(done.c){ return }
					done(); done.c = 1;
				});
			});
			
			it('kitty puppy', function(done){
				var g3 = gun.put({hey: 'kitty'}).key('timeywimey/kitty/puppy');

				var g4 = gun.put({hi: 'puppy'}).key('timeywimey/kitty/puppy');
				
				var g5 = gun.get('timeywimey/kitty/puppy').on(function(val){
					delete val._;
					//console.log("puppy?", val);
					expect(val.hey).to.be('kitty');
					expect(val.hi).to.be('puppy');
					if(done.c){ return }
					done(); done.c = 1;
				});
			});
			
			it('hello', function(done){
				gun.get('timeywimey/hello').on(function(val){
					delete val._;
					//console.log("hello?", val);
					expect(val.hello).to.be('world');
					if(done.c){ return }
					done(); done.c = 1;
				});

				gun.put({hello: 'world'}).key('timeywimey/hello');
			});
			
			it('hello foo', function(done){
				gun.get('timeywimey/hello/foo').on(function(val){
					delete val._;
					expect(val.hello).to.be('world');
					if(val.foo){
						expect(val.foo).to.be('bar');
						if(done.c){ return }
						done(); done.c = 1;
					}
				});

				gun.put({hello: 'world'}).key('timeywimey/hello/foo');

				gun.put({foo: 'bar'}).key('timeywimey/hello/foo');
			});
			
			it('all', function(done){
				gun.put({hey: 'kitty'}).key('timeywimey/all');

				gun.put({hi: 'puppy'}).key('timeywimey/all');
				
				gun.get('timeywimey/all').on(function(val){
					// console.log('all', done.c, val);
					expect(val.hey).to.be('kitty');
					expect(val.hi).to.be('puppy');
					if(val.hello){
						expect(val.hello).to.be('world');
						done.hello = true;
					}
					if(val.foo){
						expect(val.foo).to.be('bar');
						if(done.c || !done.hello){ return }
						done(); done.c = 1;
					}
				});
				
				gun.put({hello: 'world'}).key('timeywimey/all');
				
				gun.put({foo: 'bar'}).key('timeywimey/all');
			});
			
		});
		
		it('put', function(done){
			gun.put("hello", function(err, ok){
				expect(err).to.be.ok();
				done();
			});
		});

		it('put NaN', function(done){
			gun.put({num: NaN}, function(err, ok){
				expect(err).to.be.ok();
				done();
			});
		});
		
		it('put date', function(done){
			gun.put({date: new Date()}, function(err, ok){
				expect(err).to.be.ok();
				done();
			});
		});
		
		it('put regex', function(done){
			gun.put({num: /regex/i}, function(err, ok){
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

		it('put node with soul get soul', function(done){
			gun.put({_: {'#': 'foo'}, hello: 'world'})
				.get({'#': 'foo'}, function(err, node){
					expect(err).to.not.be.ok();
					expect(Gun.is.node.soul(node)).to.be('foo');
					expect(node.hello).to.be('world');
					if(done.c){ return }
					done(); done.c = 1;
			})
		});

		it('put node key get', function(done){
			gun.put({hello: "key"}).key('yes/key', function(err, ok){
				expect(err).to.not.be.ok();
				done.w = 1; if(done.c){ return } if(done.r){ done(); done.c = 1 };
			}).get('yes/key', function(err, node){ // CHANGELOG: API 0.3 BREAKING CHANGE FROM err, graph
				expect(err).to.not.be.ok();
				expect(Gun.is.node.soul(node)).to.be('yes/key');
				expect(node.hello).to.be('key');
				done.r = 1; if(done.c){ return } if(done.w){ done(); done.c = 1 };
			});
		});

		it('put node key gun get', function(done){
			gun.put({hello: "a key"}).key('yes/a/key', function(err, ok){
				expect(err).to.not.be.ok();
			});
			
			gun.get('yes/a/key', function(err, node){
				expect(err).to.not.be.ok();
				expect(node.hello).to.be('a key');
				if(done.c){ return }
				done(); done.c = 1;
			});
		});
		
		it('gun key', function(){ // Revisit this behavior?
			try{ gun.key('fail/key') }
			catch(err){
				expect(err).to.be.ok();
			}
		});
		
		it('get key no override', function(done){
			var gun = Gun();
			gun.put({cream: 'pie'}).key('cream/pie').get('cream/pie', function(err, node){
				expect(Gun.is.node.soul(node)).to.be('cream/pie');
				if(done.c >= 2){ return }
				if(done.c){ done(); done.c = 2; return; } done.c = 1;
			});
			gun.get('cream/pie').key('pie/cream');
			gun.get('pie/cream').put({pie: 'cream'});
		});

		it('get key', function(done){
			gun.get('yes/key', function(err, node){
				expect(err).to.not.be.ok();
				expect(node.hello).to.be('key');
			}).key('hello/key', function(err, ok){
				expect(err).to.not.be.ok();
				done.key = true;
				if(done.yes){ done(); }
			}).key('yes/hello', function(err, ok){
				expect(err).to.not.be.ok();
				done.yes = true;
				if(done.key){ done(); }
			});
		});

		it('get key null', function(done){
			gun.get('yes/key').key('', function(err, ok){
				expect(err).to.be.ok();
				done();
			});
		});
		
		it('key node has no key relations', function(done){
			var gun = Gun();
			gun.put({hello: 'world'}).key('hello/earth');
			gun.put({continent: 'africa'}).key('hello/earth');
			gun.put({place: 'asia'}).key('hello/earth');
			gun.put({north: 'america'}).key('hello/galaxy');
			gun.put({south: 'pole'}).key('hello/galaxy');
			gun.get('hello/earth').key('hello/galaxy', function(err, ok){
				expect(err).to.not.be.ok();
			});
			var node = gun.__.by('hello/earth').node;
			expect(node['hello/galaxy']).to.not.be.ok();
			gun.get('hello/earth', function(err, pseudo){
				expect(pseudo.hello).to.be('world');
				expect(pseudo.continent).to.be('africa');
				expect(pseudo.north).to.not.be.ok();
			});
			var galaxy = gun.__.by('hello/galaxy').node;
			expect(galaxy['hello/earth']).to.not.be.ok();
			gun.get('hello/galaxy', function(err, pseudo){
				if(done.c){ return }
				expect(pseudo.hello).to.be('world');
				expect(pseudo.south).to.be('pole');
				expect(pseudo.place).to.be('asia');
				expect(pseudo.continent).to.be('africa');
				expect(pseudo.north).to.be('america');
				done(); done.c = 1;
			});
		});

		it('get node put node merge', function(done){
			gun.get('hello/key', function(err, node){
				if(done.soul){ return }
				expect(err).to.not.be.ok();
				expect(node.hello).to.be('key');
				done.soul = Gun.is.node.soul(node);
			}).put({hi: 'you'}, function(err, ok){
				expect(err).to.not.be.ok();
				var keynode = gun.__.graph[done.soul], soul;
				var c = 0;
				expect(keynode.hi).to.not.be.ok();
				Gun.is.node(keynode, function(node, s){
					soul = s;
					expect(c++).to.not.be.ok();
				});
				var node = gun.__.graph[soul];
				expect(node.hello).to.be('key');
				expect(node.hi).to.be('you');
			}).on(function(node){
				if(done.c){ return }
				//expect(done.soul).to.be(Gun.is.node.soul(node)); // TODO: DISCUSSION! This has changed?
				expect(node.hi).to.be('you');
				expect(node.hello).to.be('key');
				done(); done.c = 1;
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
		
		it('get key no data put', function(done){
			var gun = Gun({init: true});
			gun.get('this/key/definitely/does/not/exist', function(err, data){
				done.gcb = true;
				done.err = err;
				expect(err).to.not.be.ok();
				expect(data).to.not.be.ok();
			}).put({testing: 'stuff'}, function(err, ok){
				done.flag = true;
			});
			setTimeout(function(){
				expect(done.gcb).to.be.ok();
				expect(done.err).to.not.be.ok();
				expect(done.flag).to.not.be.ok();
				done();
			}, 500);
		});

		it('get node put node merge conflict', function(done){
			gun.get('hello/key', function(err, node){
				if(done.soul){ return }
				expect(err).to.not.be.ok();
				expect(node.hello).to.be('key');
				expect(node.hi).to.be('you');
				done.soul = Gun.is.node.soul(node);
			}).put({hi: 'overwritten'}, function(err, ok){
				if(done.c){ return }
				expect(err).to.not.be.ok();
				var keynode = gun.__.graph[done.soul], soul;
				var c = 0;
				Gun.is.node(keynode, function(node, s){
					soul = s;
					expect(c++).to.not.be.ok();
				});
				var node = gun.__.graph[soul];
				expect(node.hello).to.be('key');
				expect(node.hi).to.be('overwritten');
				done.w = 1; if(done.r){ done(); done.c = 1 };
			}).on(function(node){
				if(done.c){ return }
				//expect(done.soul).to.be(Gun.is.node.soul(node)); // since put has changed chains, do we keep the pseudomerge key context?
				expect(node.hello).to.be('key');
				expect(node.hi).to.be('overwritten');
				done.r = 1; if(done.w){ done(); done.c = 1 };
			});
		});

		it('get key path put', function(done){
			var gun = Gun().put({foo:'lol'}).key('key/path/put');
			var data = gun.get('key/path/put');
			data.path('foo').put('epic');
			data.val(function(val, field){
				expect(val.foo).to.be('epic');
				expect(Gun.is.node.soul(val)).to.be('key/path/put');
				done();
			});
		});

		it('put node path', function(done){
			gun.put({hello: 'world'}).path('hello', function(err, val, field){
				if(done.end){ return } // it is okay for path's callback to be called multiple times.
				expect(err).to.not.be.ok();
				expect(field).to.be('hello');
				expect(val).to.be('world');
				done(); done.end = true;
			});
		});

		it('put node path path', function(done){
			gun.put({hello: {little: 'world'}}).path('hello').path('little', function(err, val, field){
				if(done.end){ return } // it is okay for path's callback to be called multiple times.
				expect(err).to.not.be.ok();
				expect(field).to.be('little');
				expect(val).to.be('world');
				done(); done.end = true;
			});
		});

		it('put node path rel', function(done){
			gun.put({foo: {bar: 'lol'}}).path('foo', function(err, val, field){
				if(done.end){ return } // it is okay for path's callback to be called multiple times.
				expect(err).to.not.be.ok();
				expect(field).to.be('foo');
				expect(val.bar).to.be('lol');
				done(); done.end = true;
			});
		});

		it('get node path', function(done){
			gun.get('hello/key').path('hi', function(err, val, field){
				if(done.end){ return } // it is okay for path's callback to be called multiple times.
				expect(err).to.not.be.ok();
				expect(field).to.be('hi');
				expect(val).to.be('overwritten');
				done(); done.end = true;
			});
		});

		it('put node get field', function(done){ // future feature.
			var gun = Gun();
			gun.put({_:{'#': 'soul/field'}, hi: 'lol', foo: 'bar'});//.key('key/field');
			gun.get({'#': 'soul/field', '.': 'hi'}, function(err, val){
				expect(val.hi).to.be('lol');
				expect(Gun.obj.has(val,'foo')).to.not.be.ok();
				done();
			})
		});

		it('get node path put value', function(done){
			gun.get('hello/key', function(err, node){
				expect(err).to.not.be.ok();
				if(done.soul){ return }
				expect(node.hi).to.be('overwritten');
				done.soul = Gun.is.node.soul(node);
			}).path('hi').put('again', function(err, ok){
				if(done.c){ return }
				expect(err).to.not.be.ok();
				var keynode = gun.__.graph[done.soul], soul;
				var c = 0;
				Gun.is.node(keynode, function(node, s){
					soul = s;
					expect(c++).to.not.be.ok();
				});
				var node = gun.__.graph[done.sub = soul];
				expect(node.hello).to.be('key');
				expect(node.hi).to.be('again');
				done.w = 1; if(done.r){ done(); done.c = 1 };
			}).on(function(val, field){
				if(done.c){ return }
				expect(val).to.be('again');
				expect(field).to.be('hi');
				done.r = 1; if(done.w){ done(); done.c = 1 };
			});
		});

		it('get node path put object', function(done){
			gun.get('hello/key', function(err, node){
				if(done.soul){ return }
				expect(err).to.not.be.ok();
				expect(node.hi).to.be('again');
				expect(node.hello).to.be('key');
				done.soul = Gun.is.node.soul(node);
			}).path('hi').put({yay: "value"}, function(err, ok){
				if(done.c){ return }
				expect(err).to.not.be.ok();
				var keynode = gun.__.graph[done.soul], soul;
				var c = 0;
				Gun.is.node(keynode, function(node, s){
					soul = s;
					expect(c++).to.not.be.ok();
				});
				var root = gun.__.graph[soul];
				expect(root.hello).to.be('key');
				expect(root.yay).to.not.be.ok();
				expect(Gun.is.rel(root.hi)).to.be.ok();
				expect(Gun.is.rel(root.hi)).to.not.be(soul);
				var node = gun.__.by(Gun.is.rel(root.hi)).node;
				expect(node.yay).to.be('value');
				if(done.sub){ expect(done.sub).to.be(Gun.is.rel(root.hi)) }
				else { done.sub = Gun.is.rel(root.hi) }
				done.w = 1; if(done.r){ done(); done.c = 1 };
			}).on(function(node, field){
				if(done.c){ return }
				expect(field).to.be('hi');
				expect(node.yay).to.be('value');
				if(done.sub){ expect(done.sub).to.be(Gun.is.node.soul(node)) }
				else { done.sub = Gun.is.node.soul(node) }
				done.r = 1; if(done.w){ done(); done.c = 1 };
			});
		});

		it('get path wire', function(done){
			var gun = Gun();
			var get = gun.get('shallow/path');
			var path = get.path('one');
			var put = path.put('good');
			put.val(function(val, field){
				expect(val).to.be('good');
				expect(field).to.be('one');
				done();
			});
		});

		it('get path wire shallow', function(done){
			var gun = Gun();
			var get = gun.get('slightly/shallow/path');
			var path = get.path('one');
			var put = path.put({you: 'are', here: 1});
			put.val(function(val, field){
				expect(val.you).to.be('are');
				expect(val.here).to.be(1);
				expect(field).to.be('one');
				done();
			});
		});

		it('get put, put deep', function(done){
			var gun = Gun();
			var get = gun.get('put/deep/ish');
			get.put({});
			get.val(function(data){
				expect(Gun.is.rel(data.very)).to.be.ok();
			});
			setTimeout(function(){
				var put = get.put({
					very: {
						deep: {
							ly: {
								oriented: true
							}
						}
					}
				});
				setTimeout(function(){
					put.val(function(data){
						expect(Gun.is.rel(data.very)).to.be.ok();
						done.val = true;
					});
					var p = put.path('very');
					p.put({we: 'have gone!'});
					setTimeout(function(){
						p.put('EXPLODE');
						setTimeout(function(){
							expect(done.val).to.be.ok();
							done();
						},5);
					},50);
				},50);
			},50);
		});

		it('get path wire shallow swoop', function(done){
			var gun = Gun();
			var get = gun.get('slightly/shallow/path/swoop');
			var path = get.path('one.two');
			var put = path.put({oh: 'okay'});
			put.val(function(val, field){
				expect(val.oh).to.be('okay');
				expect(field).to.be('two');
				done();
			});
		});

		it('get path wiring', function(done){
			var gun = Gun();
			var get = gun.get('deep/path');
			var path = get.path('one.two');
			var path3 = path.path('three');
			var put = path3.put({you: 'found', the: 'bottom!'});
			put.val(function(val, field){
				expect(val.you).to.be('found');
				expect(val.the).to.be('bottom!');
				expect(field).to.be('three');
			});
			gun.get('deep/path').path('one.two.three.you').put('are').val(function(val, field){
				expect(val).to.be('are');
				expect(field).to.be('you');
				done();
			})
		});

		it('get node path put object merge isolated', function(done){
			// MORAL OF THE STORY: in KEY ON.GET check for change as NODE = AT.CHANGE || GUN.__.GRAPH[AT.soul] && GUN.IS.NODE.SOUL(NODE, 'KEY') === 1; BAM!
			var gun = Gun();
			var put = gun.put({hello: 'key'}).key('hello/key/iso')
			var get = gun.get('hello/key/iso');
			var puthi = get.put({hi: 'you'});
			puthi.on(function(node){
				if(done.hi){ return }
				expect(node.hi).to.be('you');
				done.hi = 1;
			});
			setTimeout(function(){
				var get2 = gun.get('hello/key/iso');
				var path2 = get2.path('hi');
				path2._.id = 'path2';
				var putyay = path2.put({yay: "value"});
				putyay.on(function(node, field){
					expect(field).to.be('hi');
					expect(node.yay).to.be('value');
				});
				setTimeout(function(){
					var get3 = gun.get('hello/key/iso');
					var path3 = get3.path('hi');
					path3._.id = 'path3';
					var puthappy = path3.put({happy: "faces"});
					puthappy.on(function(node, field){
						expect(field).to.be('hi');
						expect(node.yay).to.be('value');
						expect(node.happy).to.be('faces');
						setTimeout(function(){
							done();
						},200);
					});
				},100);
			},100);
		});

		it('get node path put object merge', function(done){
			var g = gun.get('hello/key', function(err, node){
				if(done.soul){ return }
				expect(err).to.not.be.ok();
				expect(done.ref = Gun.is.rel(node.hi)).to.be.ok();
				done.soul = Gun.is.node.soul(node);
			});
			g.path('hi').put({happy: "faces"}, function(err, ok){
				if(done.c){ return }
				expect(err).to.not.be.ok();
				var keynode = gun.__.graph[done.soul], soul;
				var c = 0;
				Gun.is.node(keynode, function(node, s){
					soul = s;
					expect(c++).to.not.be.ok();
				});
				var root = gun.__.graph[soul];
				var sub = gun.__.graph[done.ref];
				expect(root.hello).to.be('key');
				expect(root.yay).to.not.be.ok();
				expect(Gun.is.node.soul(sub)).to.be(done.ref);
				expect(sub.yay).to.be('value');
				expect(sub.happy).to.be('faces');
				if(done.sub){ expect(done.sub).to.be(done.ref) }
				else { done.sub = done.ref }
				done.w = 1; if(done.r){ done(); done.c = 1 };
			}).on(function(node, field){
				if(done.c){ return }
				expect(field).to.be('hi');
				expect(node.happy).to.be('faces');
				expect(node.yay).to.be('value');
				if(done.sub){ expect(done.sub).to.be(Gun.is.node.soul(node)) }
				else { done.sub = Gun.is.node.soul(node) }
				done.r = 1; if(done.w){ done(); done.c = 1 };
			});
		});
		//return;
		it('get node path put value conflict relation', function(done){
			gun.get('hello/key', function(err, node){
				if(done.soul){ return }
				expect(err).to.not.be.ok();
				expect(done.ref = Gun.is.rel(node.hi)).to.be.ok();
				done.soul = Gun.is.node.soul(node);
			}).path('hi').put('crushed', function(err, ok){
				if(done.c){ return }
				expect(err).to.not.be.ok();
				var keynode = gun.__.graph[done.soul], soul;
				var c = 0;
				Gun.is.node(keynode, function(node, s){
					soul = s;
					expect(c++).to.not.be.ok();
				});
				var root = gun.__.graph[soul];
				var sub = gun.__.graph[done.ref];
				expect(root.hello).to.be('key');
				expect(root.yay).to.not.be.ok();
				expect(Gun.is.node.soul(sub)).to.be(done.ref);
				expect(sub.yay).to.be('value');
				expect(sub.happy).to.be('faces');
				expect(root.hi).to.be('crushed');
				done.w = 1; if(done.r){ done(); done.c = 1 };
			}).on(function(val, field){
				if(done.c){ return }
				expect(field).to.be('hi');
				expect(val).to.be('crushed');
				done.r = 1; if(done.w){ done(); done.c = 1 };
			});
		});

		it('put gun node', function(done){
			var gun = Gun();
			var mark = gun.put({age: 23, name: "Mark Nadal"});
			var amber = gun.put({age: 23, name: "Amber Nadal"});
			mark.path('wife').put(amber, function(err){
				expect(err).to.not.be.ok();
			});
			mark.path('wife.name').val(function(val){
				expect(val).to.be("Amber Nadal");
				done();
			});
		});

		it('put gun node on node', function(done){
			var gun = Gun();
			var mark = gun.put({age: 23, name: "Mark Nadal"});
			var amber = gun.put({age: 23, name: "Amber Nadal"});
			mark.put(amber, function(err){
				expect(err).to.be.ok();
				done();
			});
		});

		it('put gun path on path', function(done){
			var gun = Gun();
			var mark = gun.put({age: 23, name: "Mark Nadal"});
			var amber = gun.put({age: 23, name: "Amber Nadal"});
			mark.path('wife').put(amber.path('age'), function(err){
				expect(err).to.be.ok();
				done();
			});
		});
		
		it('put val', function(done){
			gun.put({hello: "world"}).val(function(val){
				expect(val.hello).to.be('world');
				expect(done.c).to.not.be.ok();
				done.c = 1;
			});
			setTimeout(function(){
				expect(done.c).to.be.ok();
				done();
			}, 100);
		});
		
		it('put key val', function(done){
			gun.put({hello: "world"}).key('hello/world').val(function(val, field){
				if(done.c){ return }
				expect(val.hello).to.be('world');
				expect(done.c).to.not.be.ok();
				done.c = 1;
			});
			setTimeout(function(){
				expect(done.c).to.be.ok();
				done();
			}, 100);
		});
		
		it('get val', function(done){
			gun.get('hello/world').val(function(val, field){
				expect(val.hello).to.be('world');
				expect(done.c).to.not.be.ok();
				done.c = 1;
			});
			setTimeout(function(){
				expect(done.c).to.be.ok();
				done();
			}, 100);
		});

		it('get path', function(done){
			gun.get('hello/world').path('hello').val(function(val){
				expect(val).to.be('world');
				expect(done.c).to.not.be.ok();
				done.c = 1;
			});
			setTimeout(function(){
				expect(done.c).to.be.ok();
				done();
			}, 100);
		});
		
		it('get put path', function(done){
			gun.get('hello/world').put({hello: 'Mark'}).path('hello').val(function(val, field){
				expect(val).to.be('Mark');
				expect(done.c).to.not.be.ok();
				done.c = 1;
			});
			setTimeout(function(){
				expect(done.c).to.be.ok();
				done();
			}, 100);
		});
		
		it('get path put', function(done){
			gun.get('hello/world').path('hello').put('World').val(function(val){
				expect(val).to.be('World');
				expect(done.c).to.not.be.ok();
				done.c = 1;
			});
			setTimeout(function(){
				expect(done.c).to.be.ok();
				done();
			}, 100);
		});
		
		it('get empty put', function(done){
			var gun = Gun({init: true});
			gun.get('nothing/here').put({far: "wide"}, function(err, ok){
				done.put = true;
			});
			gun.get({'#': 'asdfoobar'}).put({far: "wide"}, function(err, ok){
				done.put2 = true;
			});
			setTimeout(function(){
				expect(done.put).to.not.be.ok();
				expect(done.put2).to.not.be.ok();
				done();
			}, 100)
		});

		it('get path empty put val', function(done){
			var gun = Gun({init: true}).put({hello: "Mark"}).key('hello/world/not');
			gun.get('hello/world/not').path('earth').put('mars').val(function(val){
				done.c = 1;
			});
			setTimeout(function(){
				expect(done.c).to.not.be.ok(); // CHANGELOG: API 0.3 BREAKING CHANGE, .put is suppose to be dependent on the previous chain, which means it SHOULD NOT PUT on an empty path.
				done();
			}, 100);
		});

		it('get empty put val implicit', function(done){
			var gun = Gun();
			var get = gun.get('hello/imp/world');
			var put = get.put({planet: 'the earth'});
			put.val(function(val){
				expect(val.planet).to.be('the earth');
				done();
			});
		});

		it('get empty path put val implicit split', function(done){
			var gun = Gun();
			var get = gun.get('hello/imp/where');
			var path = get.path('where');
			var put = path.put('the mars');
			var val = put.val(function(val, field){
				expect(field).to.be('where');
				expect(val).to.be('the mars');
				done();
			});
		});

		it('get path empty put val implicit', function(done){
			gun.get('hello/world').path('earth').put('mars').val(function(val, field){
				expect(val).to.be('mars');
				expect(done.c).to.not.be.ok();
				done.c = 1;
			});
			setTimeout(function(){
				expect(done.c).to.be.ok();
				done();
			}, 100);
		});

		it('get path val', function(done){
			var gun = Gun({init: true}).put({hello: "Mark"}).key('hello/world/not');
			gun.get('hello/world').path('earth').put('mars');
			gun.get('hello/world/not').path('earth').val(function(val){
				expect(val).to.be('mars');
				expect(done.c).to.not.be.ok();
				done.c = 1;
			});
			setTimeout(function(){
				expect(done.c).to.not.be.ok();
				done();
			}, 100);
		});

		it('get path val implicit', function(done){
			gun.get('hello/world').path('earth').val(function(val){
				expect(val).to.be('mars');
				expect(done.c).to.not.be.ok();
				done.c = 1;
			});
			setTimeout(function(){
				expect(done.c).to.be.ok();
				done();
			}, 100);
		});

		it('get not kick val', function(done){
			gun.get("some/empty/thing").not(function(key, kick){ // that if you call not first
				this.put({now: 'exists'}).key(key); // you can put stuff
			}).val(function(val){ // and THEN still retrieve it.
				expect(val.now).to.be('exists');
				done();
			});
		});

		it('get not kick val when it already exists', function(done){
			gun.get("some/empty/thing").not(function(key, kick){
				done.not = true;
				this.put({now: 'THIS SHOULD NOT HAPPEN'}).key(key);
			}).val(function(val){
				expect(val.now).to.be('exists');
				expect(done.not).to.not.be.ok();
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
			gun.put({last: {some: 'object'}}).path('last').val(function(val, field){
				expect(field).to.be('last');
				expect(val.some).to.be('object');
			}).put(null).val(function(val, field){
				expect(field).to.be('last');
				expect(val).to.be(null);
				done();
			});
		});

		it('Gun get put null', function(done){ // flip flop bug
			var gun = Gun();
			gun.put({last: {some: 'object'}}).path('last').val(function(val, field){
				done.some = true;
				expect(val.some).to.be('object');
			}).put(null).val(function(val, field){
				expect(val).to.be(null);
				expect(done.some).to.be.ok();
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
			var todos = gun.get("examples/list/foobar").not(function(key){
				this.put({
					id: 'foobar',
					title: 'awesome title',
					todos: {}
				}).key(key);
			}).val(function(data){
				expect(data.id).to.be('foobar');
			}).path('todos').val(function(todos, field){
				expect(field).to.be('todos');
				expect(todos).to.not.have.property('id');
				done();
			}, {empty: true});
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
				var a = gun.__.graph[Gun.is.rel(val.a)];
				var b = gun.__.graph[Gun.is.rel(val.b)];
				expect(Gun.is.rel(val.a)).to.be(Gun.is.node.soul(a));
				expect(Gun.is.rel(val.b)).to.be(Gun.is.node.soul(b));
				expect(Gun.is.rel(a.kid)).to.be(Gun.is.node.soul(b));
				expect(Gun.is.rel(b.parent)).to.be(Gun.is.node.soul(a));
				done();
			});
		});

		it('gun put path and some changes node', function(done){ done.c = 0;
			var ref = gun.put({
				foo: {bar: 'lol'}
			});
			var sub = ref.path('foo').on(function(val){
				done.c++;
				if(val){
					expect(val.extra).to.not.be.ok();
				}
				if(done.c === 1){
					expect(val.bar).to.be('lol');
					ref.put({foo: 'hi'});
					return;
				}
				if(done.c === 2){
					expect(val).to.be('hi');
					done();
				}
			});
		});

		it('gun put two nodes, link one, path and detach', function(done){ done.c = 0;
			// this test is not written yet!
			var ref = gun.put({
				foo: {bar: 'lol'}
			});
			var sub = ref.path('foo').on(function(val){
				done.c++;
				if(val){
					expect(val.extra).to.not.be.ok();
				}
				if(done.c === 1){
					expect(val.bar).to.be('lol');
					ref.put({foo: 'hi'});
					return;
				}
				if(done.c === 2){
					expect(val).to.be('hi');
					done();
				}
			});
			// ref.put({foo: {extra: 'field'}});
		});

		it('gun put path deep primitive', function(done){
			gun.put({
				foo: {
					bar: {
						lol: true
					}
				}
			}).path('foo.bar.lol').val(function(val){
				expect(val).to.be(true);
				done();
			});
		});

		it('gun put path deep node', function(done){
			gun.put({
				foo: {
					bar: {
						lol: {ok: true}
					}
				}
			}).path('foo.bar.lol').val(function(val){
				expect(val.ok).to.be(true);
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
				expect(Gun.is.rel(val.wife)).to.be.ok();
				expect(Gun.is.rel(val.pet)).to.be.ok();
			}).path('wife.pet.name').val(function(val){
				expect(val).to.be('Hobbes');
			}).back.path('pet.master').val(function(val){
				expect(val.name).to.be("Amber Nadal");
				expect(val.phd).to.be.ok();
				expect(val.age).to.be(23);
				expect(Gun.is.rel(val.pet)).to.be.ok();
				done();
			});
		});

		it('put partial sub merge', function(done){
			var gun = Gun();
			var mark = gun.put({name: "Mark", wife: { name: "Amber" }}).key('person/mark').val(function(mark){
				done.marksoul = Gun.is.node.soul(mark);
				expect(mark.name).to.be("Mark");
			});
			mark.put({age: 23, wife: {age: 23}});
			
			setTimeout(function(){
				mark.put({citizen: "USA", wife: {citizen: "USA"}}).val(function(mark){
					expect(mark.name).to.be("Mark");
					expect(mark.age).to.be(23);
					expect(mark.citizen).to.be("USA");
					this.path('wife').on(function(Amber){ // TODO: turn this .on back into a .val
						if(done.c){ return }
						expect(done.c).to.not.be.ok(); // RELATED TO BELOW #"CONTEXT NO DOUBLE EMIT".
						expect(Amber.name).to.be("Amber");
						expect(Amber.age).to.be(23);
						expect(Amber.citizen).to.be("USA");
						done();done.c=1;
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

		it('context no double emit', function(done){ // annoying problem where somehow the gun.path in a put starts subscribing and firing to its context if we let get handle emitting for the chain in put.
			var c = 0;
			var gun = Gun();
			var fo = gun.put({fo: 'bar'});
			Gun.log.ba = 1;
			fo.put({ba: {}}).val(function(obj, field){
				c += 1;
				expect(c).to.be(1);
				done();
			});
			Gun.log.ba = 0;
			var ba = fo.path('ba');
			ba.put({co: 'do'});
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
			foo.put({bar: {zoo: 'who'}}).val(function(obj, field){
				//console.log("terribly terrilby unpleasant", field, obj);
				expect(obj.foo).to.be('bar');
				expect(Gun.is.rel(obj.bar)).to.ok();
				done(); //setTimeout(function(){ done() },1);
			});
		});

		var bar;
		it('context node and field of relation put node', function(done){
			// EFFECTIVELY a TIMEOUT from the previous test. NO LONGER!
			bar = foo.path('bar');
			expect(gleak.check()).to.not.be.ok();
			bar.put({combo: 'double'}).val(function(obj, field){
				//expect(obj.zoo).to.be('who');
				expect(obj.combo).to.be('double');
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

		it('context node and field, put node', function(done){
			// EFFECTIVELY a TIMEOUT from the previous test. NO LONGER!
			bar.path('combo').put({another: 'node'}).val(function(obj){
				expect(obj.another).to.be('node');
				// double .vals here also RELATED to the #"context no double emit" but because of a faulty .not or .init system.
				bar.val(function(node){
					expect(Gun.is.rel(node.combo)).to.be.ok();
					expect(Gun.is.rel(node.combo)).to.be(Gun.is.node.soul(obj));
					done(); //setTimeout(function(){ done() },1);
				});
			});
		});

		it('path should not slow down', function(done){
			this.timeout(10000);
			//this.timeout(60000);

			//Gun.log.debug = 100; console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
			var gun = Gun({init: true}).put({
			  history: {}
			});
			//console.log("---------- setup data done -----------");
			var prev, diff, max = 25, total = 100, largest = -1, gone = {};
			// TODO: It would be nice if we could change these numbers for different platforms/versions of javascript interpreters so we can squeeze as much out of them.
			gun.path('history').map(function(time, index){
			  diff = Gun.time.is() - time;
			  expect(gone[index]).to.not.be.ok();
				gone[index] = diff;
			  largest = (largest < diff)? diff : largest;
			  //console.log(turns, index, 'largest', largest, diff);
			  expect(diff > max).to.not.be.ok();
			});
			//var p = gun.path('history');
			//console.log("-------- map set up -----------");
			var turns = 0;
			var many = setInterval(function(){
				if(turns > total || (diff || 0) > (max + 5)){
					clearTimeout(many);
			  	expect(Gun.num.is(diff)).to.be.ok();
			  	if(done.c){ return } done(); done.c = 1;
			  	//console.log(turns, largest);
			  	return;
			  }
			  //if(turns === 233){ Gun.log.debug = 1; console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~") }
				prev = Gun.time.is();
			  Gun.log.base = Gun.log.ref = Gun.log.fer = prev;
			  var put = {}; put[turns += 1] = prev;
			  gun.put({history: put});
			}, 1);
		});
		
		it('path rel should not slowdown', function(done){
			this.timeout(5000);
			//this.timeout(60000);

			//Gun.log.debug = 1; console.log("~~~~~ START ~~~~~~");
			var gun = Gun(gopt).put({
			  history: {}
			});
			//console.log("-------- DATA SET UP -----------");
			var prev, diff, max = 100, total = 100, largest = -1, gone = {};
			gun.path('history').map(function(entry, index){
				//if(!entry){ return } // TODO: BUG! KNOWN BUG!!!!!!! FIX!!!!!
				//console.log("WAT", index, entry);
				//console.log("THE GRAPH\n", gun.__.graph);
			  //expect(gone[index]).to.not.be.ok();
				gone[index] = diff;
			  diff = Gun.time.is() - (entry.time || prev);
			  largest = (largest < diff)? diff : largest;
			  //console.log('turn', turns, 'index', index, 'diff', diff, 'largest', largest);
			  expect(diff > max).to.not.be.ok();
			});

			var turns = 0;
			//console.log("------------ PATH MAP SET UP --------------");
			var many = setInterval(function(){
				if(turns > total || diff > (max + 5)){
			  	clearTimeout(many);
			  	expect(Gun.num.is(diff)).to.be.ok();
			  	if(done.c){ return } done(); done.c = 1;
			  	return;
			  }
			  prev = Gun.time.is();
			  Gun.log.base = Gun.log.ref = Gun.log.fer = prev;
			  //if(turns === 0){ Gun.log.debug = 1; console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"); }
			  //console.log("-------------- ", turns + 1, "-----------------");
			  var val = {
			    x: 1,
			    y: 1,
			    axis: 'y',
			    direction: 1,
			    time: prev
			  }
			  var put = {}; put[turns += 1] = val;
			  gun.put({history: put});
			  //gun.path(['history', turns += 1]).put({
			},1);
		});

		it.skip('paths rel should not slowdown', function(done){ // TODO: NEED TO ADD THIS NEW TEST!
			this.timeout(5000);
			//this.timeout(60000);

			//Gun.log.debug = 1; console.log("~~~~~ START ~~~~~~");
			var gun = Gun(gopt).put({
			  history: {}
			});
			//console.log("-------- DATA SET UP -----------");
			var prev, diff, max = 100, total = 100, largest = -1, gone = {};
			gun.path('history').map(function(entry, index){
				//if(!entry){ return } // TODO: BUG! KNOWN BUG!!!!!!! FIX!!!!!
				//console.log("WAT", index, entry);
				//console.log("THE GRAPH\n", gun.__.graph);
			  //expect(gone[index]).to.not.be.ok();
				gone[index] = diff;
			  diff = Gun.time.is() - (entry.time || prev);
			  largest = (largest < diff)? diff : largest;
			  console.log('turn', turns, 'index', index, 'diff', diff, 'largest', largest);
			  expect(diff > max).to.not.be.ok();
			});

			var turns = 0;
			//console.log("------------ PATH MAP SET UP --------------");
			var many = setInterval(function(){
				if(turns > total || diff > (max + 5)){
			  	clearTimeout(many);
			  	expect(Gun.num.is(diff)).to.be.ok();
			  	if(done.c){ return } done(); done.c = 1;
			  	return;
			  }
			  prev = Gun.time.is();
			  Gun.log.base = Gun.log.ref = Gun.log.fer = prev;
			  //if(turns === 0){ Gun.log.debug = 1; console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"); }
			  //console.log("-------------- ", turns + 1, "-----------------");
			  var val = {
			  	TURN: turns + 1,
			    x: 1,
			    y: 1,
			    axis: 'y',
			    direction: 1,
			    time: prev
			  }
			  //var put = {}; put[turns += 1] = val;
			  //gun.put({history: put});
			  gun.path(['history', turns += 1]).put(val);
			},1);
		});

		it('val path put val', function(done){
			var gun = Gun();
			
			var al = gun.put({gender:'m', age:30, name:'alfred'}).key('user/alfred');
			var beth = gun.put({gender:'f', age:22, name:'beth'}).key('user/beth');
			
			al.val(function(a){
				beth.put({friend: a}, function(err, ok){
					expect(err).to.not.be.ok();
				}).path('friend').val(function(aa){
					expect(Gun.is.node.soul(a)).to.be(Gun.is.node.soul(aa));
					done();
				});
			});
			
		});

		// TODO: Write a test that tests for keysoul has a key meta indicator.
		// TODO: A soulsoul does not have a key meta indicator.
		// TODO: Souls match their graph.

		it('val path put val key', function(done){ // bug discovered from Jose's visualizer
			var gun = Gun(), s = Gun.time.is(), n = function(){ return Gun.time.is() }
			this.timeout(5000);
			
			gun.put({gender:'m', age:30, name:'alfred'}).key('user/alfred');
			gun.put({gender:'f', age:22, name:'beth'  }).key('user/beth');
			//gun.get('user/beth').path('friend').put(gun.get('user/alfred')); // ideal format which we have a future test for.
			gun.get('user/alfred').val(function(a){
				expect(a[Gun._.meta]['key']).to.be.ok();
				gun.get('user/beth').put({friend: a}, function(err, ok){ // b - friend_of -> a
					expect(err).to.not.be.ok();
					var keynode = gun.__.graph['user/alfred'];
					Gun.is.node(keynode, function(rel, soul){
						var soulnode = gun.__.by(soul).node;
						expect(soulnode[Gun._.meta]['key']).to.not.be.ok();
					});
				});
				gun.get('user/beth').val(function(b){
					gun.get('user/alfred').put({friend: b}).val(function(beth){ // a - friend_of -> b
						gun.get('user/beth').put({cat: {name: "fluffy", age: 3, coat: "tabby"}}).val(function(cat){
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
				var keynode = gun.__.graph['me'];
				expect(keynode).to.be.ok();
				Gun.is.node(keynode, function(node, soul){ done.soul = soul });
				expect(done.soul).to.be('qwertyasdfzxcv');
				done();
			}, 'qwertyasdfzxcv');
		});
		
		it('no false positive null emit', function(done){
			var gun = Gun({wire: {get: function(key, cb){
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
			gun.get(soul).not(function(err, ok){
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
			var gun = Gun({wire: {get: function(key, cb){
				if(Gun.obj.has(key, Gun._.soul)){
					key = key[Gun._.soul];
					var node = tmp.graph[key];
					cb(null, node);
					cb(null, Gun.is.node.ify({}, key));
					cb(null, {});
				}
			}}}), tmp = {graph: {}};
			tmp.graph[tmp.soul = Gun.text.random()] = tmp.node = {a: 'b', c: 'd'};
			Gun.is.node.ify(tmp.node, tmp.soul);

			tmp.graph['me'] = tmp.keynode = {};
			Gun.obj.as(tmp.rel = {}, Gun._.soul, tmp.soul);
			tmp.keynode[tmp.soul] = tmp.rel;
			Gun.is.node.ify(tmp.keynode, 'me');
			tmp.keynode[Gun._.meta]['key'] = 1;
			
			gun.get('me', function(err, data){
				
			}).val(function(val){
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
			var gun = Gun({wire: {get: function(key, cb){
				var n = {};
				n = {_: {'#': soul, '>': {'a': 0}},
					'a': 'a'
				};
				cb(null, n);
				n = {};
				n = {_: {'#': soul, '>': {'a': 1}},
					'a': 'b'
				};
				cb(null, n);
				n = {};
				n = {_: {'#': soul }};
				cb(null, n);
			}}}), soul = Gun.text.random();
			
			gun.get(soul).path('a').val(function(val){
				done.count = (done.count || 0) + 1;
				setTimeout(function(){
					expect(val).to.be('b');
					expect(done.count).to.be(1);
					done();
				},5);
			});
		});

		it('double not', function(done){ // from the thought tutorial
			var gun = Gun(gopt).get('thoughts').not(function(key){
				this.put({}).key(key);
			});
			
			setTimeout(function(){
				gun.not(function(){
					done.not = true;
				}).val(function(){
					expect(done.not).to.not.be.ok();
					done();
				}, {empty: true});
			}, 10);
		});

		it('node path node path node path', function(done){
			var gun = Gun(gopt);
			var data = gun.get('data');
			gun.put({
				a: 1,
				b: 2,
				c: 3
			}).key('data');
			data.path('a', function(e, v, f){
				expect(done.a).to.not.be.ok();
				expect(v).to.be(1);
				done.a = true;
			});
			data.path('b', function(e, v, f){
				expect(done.b).to.not.be.ok();
				expect(v).to.be(2);
				done.b = true;
			});
			data.path('c', function(e, v, f){
				expect(done.c).to.not.be.ok();
				expect(v).to.be(3);
				done.c = true;
			});
			data.put({d: 4});
			setTimeout(function(){
				expect(done.a).to.be.ok();
				expect(done.b).to.be.ok();
				expect(done.c).to.be.ok();
				done();
			},100);
		});

		it('node path obj node path obj node path obj', function(done){
			var gun = Gun();
			var data = gun.get('data1');
			gun.put({
				a: {v: 1},
				b: {v: 2},
				c: {v: 3}
			}).key('data1');
			data.path('a', function(e, v, f){
				expect(done.a).to.not.be.ok();
				expect(v.v).to.be(1);
				done.a = true;
			});
			data.path('b', function(e, v, f){
				expect(done.b).to.not.be.ok();
				expect(v.v).to.be(2);
				done.b = true;
			});
			data.path('c', function(e, v, f){
				expect(done.c).to.not.be.ok();
				expect(v.v).to.be(3);
				done.c = true;
			});
			data.put({d: {v: 4}});
			setTimeout(function(){
				expect(done.a).to.be.ok();
				expect(done.b).to.be.ok();
				expect(done.c).to.be.ok();
				done();
			},100);
		});

		it('instance.key', function(done){
			Gun().key('oye', function(err){
				expect(err).to.be.ok();
				done();
			});
		});

		it('instance.on', function(done){
			Gun().on();
			done();
		});

		it('instance.path', function(done){
			Gun().path('oye', function(err){
				expect(err).to.be.ok();
				done();
			});
		});

		it('instance.map', function(done){
			Gun().map();
			done();
		});

		it('instance.not', function(done){
			Gun().not();
			done();
		});

		it('instance.val', function(done){
			Gun().val();
			done();
		});

		it('implicit put on empty get', function(done){
			var gun = Gun().get('init');
			gun.on(function(val){
				expect(val.not).to.be(true);
				if(done.c){ return } done(); done.c = 1;
			});
			gun.put({not: true});
		});

		it('implicit put on empty get explicit not', function(done){
			var gun = Gun().get('init/not').not();
			gun.on(function(val){
				done.c = 1;
			});
			gun.put({not: true});
			setTimeout(function(){
				expect(done.c).to.not.be.ok();
				done();
			},1);
		});

		it('no implicit put on empty get', function(done){
			var gun = Gun({init: true}).get('not/init');
			gun.on(function(val){
				expect(val.not).to.be(true);
				if(done.c){ return } done.c = 1;
			});
			gun.put({not: true});
			setTimeout(function(){
				expect(done.c).to.not.be.ok();
				done();
			},1);
		});

		it('no implicit put on empty get explicit init', function(done){
			var gun = Gun({init: true}).get('not/init/init').init();
			gun.on(function(val){
				expect(val.not).to.be(true);
				if(done.c){ return } done(); done.c = 1;
			});
			gun.put({not: true})
		});

		it('init', function(done){
			var gun = Gun().get('init/todo').init();
			gun.on(function(val){
				expect(val.data).to.be('initialized!');
				if(done.c){ return } done(); done.c = 1;
			});
			gun.put({data: 'initialized!'});
		});

		it('init todo', function(done){
			var gun = Gun(), todo = gun.get('init/todo/early');
			todo.path('random1').put('eat chocolate');
			todo.map().on(function(val, field){
				expect(val).to.be('eat chocolate');
				expect(field).to.be('random1');
				if(done.c){ return } done(); done.c = 1;
			});
		});

		it('init todo defer', function(done){
			var gun = Gun(), todo = gun.get('init/todo/defer');
			todo.map().on(function(val, field){
				expect(val).to.be('eat chocolate');
				expect(field).to.be('random1');
				if(done.c){ return } done(); done.c = 1;
			});
			setTimeout(function(){
				todo.path('random1').put('eat chocolate');
			}, 100);
		});

		/* // CHANGELOG: API 0.3 BREAKING CHANGE, .set has been deprecated!
		it('set', function(done){
			done.c = 0;
			var u, gun = Gun();
			gun.get('set').set().set().val(function(val){
				var keynode = gun.__.graph['set'];
				expect(Gun.is.node.soul.ify(keynode, Gun._.key)).to.be.ok();
				Gun.is.node(keynode, function(rel, soul){
					rel = gun.__.by(soul).node;
					expect(Gun.obj.empty(rel, Gun._.meta)).to.be.ok();
				});
				done.c += 1;
				setTimeout(function(){ 
					expect(done.c).to.be(1);
					done() 
				},10);
			});
		});

		it('root set', function(done){
			var gun = Gun().set();
			gun.on(function(val, field){
				expect(Gun.obj.empty(val, Gun._.meta)).to.be.ok();
				if(done.c){return} done(); done.c = 1;
			});
		});
		
		// TODO: BUG! We need 2 more tests... without .set()... and multiple paths on the same node.
		it('set multiple', function(done){ // kinda related to flip flop?
			var gun = Gun().get('sets').set(), i = 0;
			gun.val(function(val){
				console.log("TEST 1", val);
				expect(Gun.obj.empty(val, Gun._.meta)).to.be.ok();
				expect(Gun.is.node.soul(val)).to.be('sets');
				var keynode = gun.__.graph['sets'];
				expect(Gun.obj.empty(keynode, Gun._.meta)).to.not.be.ok();
			});
			gun.set(1); //.set(2).set(3).set(4); // if you set an object you'd have to do a `.back`
			gun.map(function(val, field){
			//gun.map().val(function(val, field){ // TODO: SEAN! DON'T LET ME FORGET!
				console.log("\n TEST 2+", field, val);
				return;
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
			gun.set(2);
		});
		*/

		it('val should not print relation', function(done){ // #132
			var users = Gun().get('example').path('users');
			users.path(Gun.text.random()).put('bob');
			users.path(Gun.text.random()).put('sam');
			setTimeout(function(){
				users.val(function(v){
					expect(Gun.is.rel(v)).to.not.be.ok();
					expect(Object.keys(v).length).to.be(3);
					done();
				});
			},100);
		});

		it('peer 1 get key, peer 2 put key, peer 1 val', function(done){
			var hooks = {get: function(key, cb, opt){
				cb();
			}, put: function(nodes, cb, opt){
				Gun.union(gun1, nodes);
				cb();
			}},
			gun1 = Gun({wire: {get: hooks.get}}).get('race')
			, gun2 = Gun({wire: hooks}); //.get('race');
			
			setTimeout(function(){
				gun2.put({the: 'data'}).key('race');
				setTimeout(function(){
					gun1.on(function(val){
						expect(val.the).to.be('data');
						if(done.c){ return } done(); done.c = 1;
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
				if(done.val){ return } // TODO: Maybe prevent repeat ons where there is no diff? (may not happen to after 1.0.0) 
				done.val = val;
				expect(val.a).to.be(1);
				expect(val.b).to.be(2);
				expect(val.z).to.be(0);
				done();
			});
		});

		it('get pseudo merge across peers', function(done){ // ctx.halt
			var acb, bcb, ag, bg;
			Gun.on('opt').event(function(gun, o){
				if(connect){ return }
				gun.__.opt.wire = {get: function(key, cb, opt){
					key = key[Gun._.soul];
					if(o.alice){ acb = cb; ag = gun.__.graph; } else { bcb = cb; bg = gun.__.graph; }
					var other = (o.alice? gun2 : gun1);
					if(connect){
						var node = other.__.graph[key];
						cb(null, node);
					} else {
						cb();
					}
				}, put: function(nodes, cb, opt){
					var other = (o.alice? gun2 : gun1);
					if(connect){
						Gun.union(other, nodes);
					}
					cb();
				}}
			});
			function pushAtoB(key){
				var node = ag[key];
				bcb(null, node);
			}
			function pushBtoA(key){
				var node = bg[key];
				acb(null, node);
			}
			var connect, gun1 = Gun({alice: true}).get('pseudo/merge').put({hello: 'world!'})/*.not(function(key){
				this.put({hello: "world!"}).key(key);
			})*/, gun2;
			gun1.val(function(val){
				expect(val.hello).to.be('world!');
			});
			setTimeout(function(){
				gun2 = Gun({bob: true}).get('pseudo/merge').put({hi: 'mars!'})/*.not(function(key){
					this.put({hi: "mars!"}).key(key);
				});*/
				gun2.val(function(val){
					expect(val.hi).to.be('mars!');
				});
				setTimeout(function(){
					// CONNECT THE TWO PEERS
					connect = true;
					pushBtoA('pseudo/merge');
					pushAtoB('pseudo/merge');
					//gun1.get('pseudo/merge', null, {force: true}); // fake a browser refersh, in real world we should auto-reconnect
					//gun2.get('pseudo/merge', null, {force: true}); // fake a browser refersh, in real world we should auto-reconnect
					setTimeout(function(){
						gun1.val(function(val){
							expect(val.hello).to.be('world!');
							expect(val.hi).to.be('mars!');
							done.gun1 = true;
						});
						//return;
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
			var passengers = gun.get('passengers').not(function(key){
				this.put({'randombob': {
					name: "Bob",
					location: {'lat': '37.6159', 'lng': '-128.5'},
					direction: '128.2'
				}, 'randomfred': {
					name: "Fred",
					location: {'lat': 'f37.6159', 'lng': 'f-128.5'},
					direction: 'f128.2'
				}}).key(key);
			}); // this is now a list of passengers that we will map over.
			var ctx = {n: 0, d: 0, l: 0};
			passengers.map().val(function(passenger, id){
				this.map().val(function(change, field){
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
		});

		it("put map", function(done){
			var gun = Gun();
			var get = gun.get('map/that');
			var put = gun.put({a: 1, b: 2, c: 3}).key('map/that');
			get.map(function(v,f){
				if(1 === v){ done.a = true }
				if(2 === v){ done.b = true }
				if(3 === v){ done.c = true }
				if(done.a && done.b && done.c){
					if(done.done){ return }
					done(); done.done = 1;
				}
			});
		});

		it("get map map val", function(done){ // Terje's bug
			var gun = Gun({init: true}); // we can test GUN locally.
			var passengers = gun.get('passengers/map').not(function(key){
				gun.put({randombob: {
					name: "Bob",
					location: {'lat': '37.6159', 'lng': '-128.5'},
					direction: '128.2'
				}}).key(key);
			}); // this is now a list of passengers that we will map over.
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
			setTimeout(function(){
				passengers.put({randomfred: {
					name: "Fred",
					location: {'lat': 'f37.6159', 'lng': 'f-128.5'},
					direction: 'f128.2'
				}});
			},100);
		});

		it("get map path val", function(done){ // Terje's bug
			var gun = Gun();
			var ctx = {l: -1, d: 0};
			var passengers = gun.get('passengers/path').not(function(key){
				this.put({randombob: {
					name: "Bob",
					location: {'lat': '37.6159', 'lng': '-128.5'},
					direction: '128.2'
				}}).key(key);
			});
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
			setTimeout(function(){
				passengers.put({randomfred: {
					name: "Fred",
					location: {'lat': 'f37.6159', 'lng': 'f-128.5'},
					direction: 'f128.2'
				}});
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
			var passengers = gun; //.get('passengers/set/path');
			passengers = passengers.put({randombob: {name: 'Bob', direction: {}}});
			passengers.path('randombob.direction', function(err, ok, field){
			}).put({lol: {just: 'kidding', dude: '!'}});
			passengers.map().path('direction.lol').val(function(val){
				this.path('just').val(function(val){
					expect(val).to.be('kidding');
				}).back.path('dude').val(function(val){
					expect(val).to.be('!');
					done();
				});
			})
		});

		it("gun get on, later gun put key", function(done){
			var gun = Gun();
			
			var keyC = gun.get('keyC').on(function(val){ 
				expect(val.hello).to.be('world');
				if(done.done){ return }
				done.done = true;
				done();
			});
			
			setTimeout(function(){
				gun.put({hello: 'world'}).key('keyC');
			}, 100);
		});

		it('gun get put, sub path put, original val', function(done){ // bug from Jesse working on Trace // 
			var gun = Gun(gopt).get('players');
			
			gun.put({
			  taken: true,
			  history: {0: {}, 1: {}}
			});

			gun
				.path('history')
				.put(null)
				.back
				.path('taken')
				.put(false)
			
			// TODO: BUG! There is a variation of this, where we just do `.val` rather than `gun.val` and `.val` by itself (chained off of the sub-paths) doesn't even get called. :(
			gun.on(function(players){ // this val is subscribed to the original put and therefore does not get any of the sub-path listeners, therefore it gets called EARLY with the original/old data rather than waiting for the sub-path data to "finish" and then get called.
				expect(players.history).to.be(null);
				expect(players.taken).to.be(false);
				if(done.c){ return } done(); done.c = 1;
			});
		});

		it("gun put recursive path slowdown", function(done){
			this.timeout(5000);
			var gun = Gun();
			gun.__.opt.wire.put = null;
			function put(num, t) {
				var now = new Date().getTime();
				var cb;
				for (var i = 1; i <= num; i++) {
					if (i === num) {
						cb = function (err, ok) {
							console.log(num + 'ops: ' + (new Date().getTime() - now)/1000 + 's');
						}
					}
					Gun.ify({   //hello: 'world'}, cb);
						deeply: {
							nested: i
						}
					})(cb);
				}
				return new Date().getTime() - now;
			}
			/*
			put(1);
			put(2);
			put(10);
			put(50);
			put(100);
			put(1000);
			put(5000);*/
			put(1000, true);
			
			var gun2 = Gun();
			gun2.__.opt.wire.put = null;
			function put2(num, t) {
				var now = new Date().getTime();
				var cb;
				for (var i = 1; i <= num; i++) {
					if (i === num) {
						cb = function () {
							console.log(num + ' API ops: ' + (new Date().getTime() - now)/1000 + 's');
							t && done();
						}
					}
					gun2.put({  //hello: 'world'}, cb);
						deeply: {
							nested: i
						}
					}, cb);
				}
				return new Date().getTime() - now;
			}
			Gun.log.start = Gun.time.is();
			put2(1);
			put2(1000); // TODO: BUG! Interesting! If you add another 0 it causes a stack overflow! If I make Gun.time.now() not recurse then it runs but takes 4x as long. Even on the 10k ops there seems to be about a 4x overhead with the API versus raw serializer.
			put2(1, true);
			//put2(2);
			//put2(10);
			//put2(50);
			//put2(100, true);
			//put2(5000, true);
		} );

		it('choke time.now by using a while loop', function(){
			var i = 10; //100000; // causes an overflow. 
			while(--i){
				Gun.time.now();
			}
		});
		/* // TODO: These tests should be deleted.
		it("test timeout", function(done){ return done();
			var i = 1000, start = Date.now();
			while(i--){
				setTimeout(function(){
					console.log("ended in", (Date.now() - start)/1000);
				},0);
			}
			return;
				Gun.schedule(start, function(){
					console.log("ended in", (Date.now() - start)/1000);
				});
				setImmediate(function(){
					console.log("ended in", (Date.now() - start)/1000);
				});
				process.nextTick(function(){
					console.log("ended in", (Date.now() - start)/1000);
				});
		});
		it("test assignment", function(done){
			var env = {graph: {}};
			function speed(other){			
				var i = 10000;
				while(i--){
					var $ = {soul: Gun.text.random()};
					var at = {node: {_: {}}};
					var obj = {
						deeply: {
							nested: 'lol'
						}
					}
					env.graph[at.node._[Gun._.soul] = at.soul = $.soul] = at.node
				}
			}
			var start = Date.now();
			speed();
			console.log('wat', (Date.now() - start)/1000);
		});
		it("test fn call", function(done){
			function speed(i, cb){
				var r = 0;
				while(i--){
					if(cb){
						cb(i);
					} else {
						r += i;
					}
				}
			}
			var start = Date.now();
			speed(100000000);
			console.log('no fn', (Date.now() - start)/1000);
			var start = Date.now(), r = 0;
			speed(100000000, function(i){ r += i });
			console.log('w/ fn', (Date.now() - start)/1000);
			var start = Date.now(), r = 0;
			function foo(i){ r += i }
			speed(100000000, foo);
			console.log('w/ named fn', (Date.now() - start)/1000);
		});
		it("gun put recursive path slowdown MUTANT TEST", function(done){
			this.timeout(30000);
			
			Gun.chain.put = function(val, cb, opt){
				var gun = this.chain(), obj;
				var drift = Gun.time.now(), call = {};
				cb = cb || function(){};
				gun._.at('soul').event(
				//(
				function($){
					var chain = $.gun || gun; 
					var ctx = {}, obj = val, $ = Gun.obj.copy($);
					var hash = $.field? $.soul + $.field : ($.from? $.from + ($.at || '') : $.soul);
					if(call[hash]){ return }
					gun.__.meta($.soul).put = true;
					call[hash] = true;
					if(Gun.is.val(obj)){
						if($.from && $.at){
							$.soul = $.from;
							$.field = $.at;
						} // no else!
						if(!$.field){
							return cb.call(gun, {err: Gun.log("No field exists for " + (typeof obj) + "!")});
						} else
						if(gun.__.graph[$.soul]){
							ctx.tmp = {};
							ctx.tmp[ctx.field = $.field] = obj;
							obj = ctx.tmp;
						} else {
							return cb.call(gun, {err: Gun.log("No node exists to put " + (typeof obj) + " in!")});
						}
					}
					if(Gun.obj.is(obj)){
						if($.field && !ctx.field){
							ctx.tmp = {};
							ctx.tmp[ctx.field = $.field] = obj;
							obj = ctx.tmp;
						}
						Gun.ify(obj || val, function(env, cb){
							var at;
							if(!env || !(at = env.at) || !env.at.node){ return }
							if(!at.node._){
								at.node._ = {};
							}
							if(!Gun.is.node.soul(at.node)){
								if(obj === at.obj){
									env.graph[at.node._[Gun._.soul] = at.soul = $.soul] = at.node;
									cb(at, at.soul);
								} else {
									function path(err, data){
										if(at.soul){ return }
										at.soul = Gun.is.node.soul(data) || Gun.is.node.soul(at.obj) || Gun.roulette.call(gun); // TODO: refactor Gun.roulette!
										env.graph[at.node._[Gun._.soul] = at.soul] = at.node;
							//var start = performance.now();
										cb(at, at.soul);
							//first = performance.now() - start;(first > .05) && console.log('here');
									};
									($.empty && !$.field)? path() : chain.back.path(at.path || [], path, {once: true, end: true}); // TODO: clean this up.
								}
								//var diff1 = (first - start), diff2 = (second - first), diff3 = (third - second);
								//(diff1 || diff2 || diff3) && console.log(diff1, '    ', diff2,  '    ', diff3);
							}
							if(!at.node._[Gun._.state]){
								at.node._[Gun._.state] = {};
							}
							if(!at.field){ return }
							at.node._[Gun._.state][at.field] = drift;
						})(function(err, ify){
							//console.log("chain.put PUT <----", ify.graph, '\n');
							if(err || ify.err){ return cb.call(gun, err || ify.err) }
							if(err = Gun.union(gun, ify.graph).err){ return cb.call(gun, err) }
							if($.from = Gun.is.rel(ify.root[$.field])){ $.soul = $.from; $.field = null }
							Gun.obj.map(ify.graph, function(node, soul){ Gun.union(gun, Gun.union.pseudo(soul)) });
							gun._.at('soul').emit({soul: $.soul, field: $.field, key: $.key, PUT: 'SOUL', WAS: 'ON'}); // WAS ON
							//return cb(null, true);
							if(Gun.fns.is(ctx.hook = gun.__.opt.hooks.put)){
								ctx.hook(ify.graph, function(err, data){ // now iterate through those nodes to a persistence layer and get a callback once all are saved
									if(err){ return cb.call(gun, err) }
									return cb.call(gun, null, data);
								}, opt);
							} else {
								//console.Log("Warning! You have no persistence layer to save to!");
								cb.call(gun, null); // This is in memory success, hardly "success" at all.
							}
						});
					}
				})
				gun._.at('soul').emit({soul: Gun.roulette.call(gun), field: null, empty: true});
				return gun;
			}
			
			var gun = Gun(); //.get('bug').put({});
			gun.__.opt.hooks.put = null;
			function put(num, t) {
				var now = new Date().getTime();
				var cb;
				for (var i = 1; i <= num; i++) {
					if (i === num) {
						cb = function (err, ok) {
							console.log(num + 'MUTANT ops: ' + (new Date().getTime() - now)/1000 + 's');
							t && done();
						}
					}
					gun.put({   //hello: 'world'}, cb);
						deeply: {
							nested: i
						}
					}, cb);
				}
				return new Date().getTime() - now;
			}
			
			//put(1, true);
			//put(2);
			//put(10);
			//put(50);
			//put(100);
			//put(1000);
			//put(5000);
			put(10000, true);
		});
		*/
		it("gun get empty set, path not -> this put", function(done){ // Issue #99 #101, bug in survey and trace game.
			var test = {c: 0}, u;
			var gun = Gun();
			var game = gun.get('some/not/yet/set/put/thing').not(function(key){
				gun.put({alias: {}}).key(key);
			});//.set();
			var me = game.path('alias').on(function(val){
				if(!done.put){ return }
				expect(val).to.not.be(u);
				expect(val.a).to.be('b');
				var meid = Gun.is.node.soul(val);
				var self = this;
				/*
				expect(self === game).to.not.be.ok();
				expect(self === me).to.be.ok();
				*/
				if(done.c){ return } done(); done.c = 1;
			});
			setTimeout(function(){
				done.put = true;
				me.put({a: 'b'});
			},100);
		});

		it("gun get empty set path empty later path put multi", function(done){ // Issue #99 #101, bug in survey and trace game. // ctx.halt
			done.c = 0;
			var gun = Gun();
			var data = gun.get('some/not/yet/set/put/thing/2');
			var path = data.path('sub');
			function put(d, t, f){				
				setTimeout(function(){
					path.put(d, function(err, ok){
						expect(err).to.not.be.ok();
						done.c++;
						if(f && done.c >= 3){
							done();
						}
					});
				},t || 10);
			};
			put({on: 'bus', not: 'transparent'});
			put({on: null, not: 'torrent'}, 200);
			put({on: 'sub', not: 'parent'}, 250, true);
		});

		it("ToDo", function(done){ // Simulate ToDo app!
			var gun = Gun().get('example/todo/data');
			gun.on(function renderToDo(val){
				if(done.done){ return }
				if(done.clear){
					done.done = true;
					expect(val[done.id]).to.not.be.ok();
					return done();
				}
				delete val._;
				Gun.obj.map(val, function(val, field){ return done.id = field; });
				expect(val[done.id]).to.be('groceries');
			});
			setTimeout(function(){ // form submit
				gun.path('random1').put("groceries");
				setTimeout(function(){ // clear off element
					done.clear = true;
					gun.path(done.id).put(null);
				},100);
			},200);
		});

		it("gun put null path on put sub object", function(done){ // consensus4's bug
			done.c = 1;
			var gun = Gun();
			//Gun.log.verbose = true;
			var game = gun.put({board: null, teamA: null, teamB: null, turn: null}).key('the/game');
			game.path('board').on(function(board, field){
				expect(field).to.be('board');
				if(done.c === 1){
					expect(board).to.not.be.ok();
				}
				if(done.c === 2){
					if(!board[11] || !board[22] || !board[33]){ return }
					done.c++;
					delete board._;
					expect(board).to.be.eql({11: ' ', 22: ' ', 33: 'A'});
					done();
				}
			});
			setTimeout(function(){
				done.c++;
				game.put({board: {11: ' ', 22: ' ', 33: 'A'}});
			},100);
		});

		it("get init put map -> put, foreach gun path map", function(done){ // replicate Jesse's Trace game bug
			done.c = 0;
			var gun = Gun(gopt).opt({init: true})
			.get('players').init()
			.put({
				0: {
					num: 0
				},
				1: {
					num: 1
				},
				2: {
					num: 2
				},
				3: {
					num: 3
				}
			}, function(err,ok){
				expect(done.c++).to.be(0);
			}).val(function(p){
				done.p = Gun.is.node.soul(p);
				done.m = Gun.is.rel(p[0]);
				expect(Gun.is.rel(p[0])).to.be.ok();
				expect(Gun.is.rel(p[1])).to.be.ok();
				expect(Gun.is.rel(p[2])).to.be.ok();
				expect(Gun.is.rel(p[3])).to.be.ok();
			})
			
			var players = [], me;
			gun.map(function (player, number) {
				players[number] = player;
				players[number].history = [];
				if (!player.taken && !me) {
					this.put({
						taken: true,
						history: {
							0: {x: 1, y: 2}
						}
					}, function(err,ok){});
					me = number;
				}
			});
			
			 Gun.list.map([0, 1, 2, 3], function (player, number) {
				number = number - 1;
				gun
					.path(number + '.history')
					.map(function (entry, logNum) {
						done.c++;
						players[number].history[logNum] = entry;
						expect(entry.x).to.be(1);
						expect(entry.y).to.be(2);
						setTimeout(function(){
							expect(done.c).to.be(2);
							done();
						},100);
					});
			});
		});
		
		it("gun get path empty val", function(done){ // flip flop bug
			done.c = 0;
			var u;
			var gun = Gun(gopt);
			var game = gun.get('game1/players');
			var me = game.path('player1').val(function(val){
				if(!done.c){ done.fail = true }
				expect(val).to.not.be(u);
				expect(val.x).to.be(0);
				expect(val.y).to.be(0);
				expect(done.fail).to.not.be.ok();
				done();
			});
			setTimeout(function(){
				done.c++;
				expect(done.fail).to.not.be.ok();
				me.put({x: 0, y: 0});
			},10);
		});
		
		it("gun get path empty on", function(done){
			done.c = 0;
			var u;
			var gun = Gun(gopt);
			var game = gun.get('game2/players');
			var me = game.path('player2').on(function(val){
				if(!done.c){ done.fail = true }
				expect(done.fail).to.not.be.ok();
				expect(val).to.not.be(u);
				if(done.done || !val.x || !val.y){ return } // it is okay if ON gets called many times, this protects against that.
				// TODO: although it would be nice if we could minimize the amount of duplications. (may not happen to after 1.0.0) 
				expect(val.x).to.be(1);
				expect(val.y).to.be(1);
				done.done = true;
				done();
			});
			setTimeout(function(){
				done.c++;
				expect(done.fail).to.not.be.ok();
				me.put({x: 1, y: 1});
			},10);
		});
		
		it("gun get path empty not", function(done){
			var u;
			var gun = Gun(gopt).opt({init: true})
			var game = gun.get('game3/players').init();
			var me = game.path('player3').not(function(field){
				expect(field).to.be('player3');
				done();
			});
		});
		
		it("gun get path empty init", function(done){
			var u;
			var gun = Gun(gopt).opt({init: true});
			var game = gun.get('game4/players').init();
			var me = game.path('player4').init().path('alias').init().put({oh: 'awesome'}).val(function(val, field){
				expect(val.oh).to.be('awesome');
				expect(field).to.be('alias');
				done();
			})
		});

		it("no invalid graph", function(done){
			var gun = Gun({wire:{
				put: function(graph){
					expect(Gun.is.graph(graph)).to.be.ok();
					if(done.c){ return } if(done.on){ done(); done.c = 1 }
				}
			}}).get('example/todo/data/graph');
			gun.on(function renderToDo(val){
				done.on = true; 
			});
			setTimeout(function(){
				gun.path(Gun.text.random()).put('hoorah');
			},100)
		});

		it("no undefined field", function(done){
			var gun = Gun();
			var chat = gun.get('example/chat/data/graph/field').not(function(key){
				gun.put({1: {who: 'Welcome', what: "to the chat app!", when: 1}}).key(key);
			});
			chat.map().val(function renderToDo(val, field){
				expect(field).to.be.ok();
				expect(val.who).to.be.ok();
				expect(val.when).to.be.ok();
				expect(val.what).to.be.ok();
				if(done.c >= 2){ return }
				if(done.c === 1){ done() }
				done.c = done.c || 0;
				done.c += 1;
			});
			setTimeout(function(){
				var msg = {};
				msg.when = Gun.time.is();
				msg.what = "lol!";
				msg.who = "Alice";
				chat.path(msg.when + '_' + Gun.text.random(4)).put(msg);
			},100);
		});
		/* // This test didn't work for what I was wanting to test :(, will either remove it or modify it if I think of a clever solution to test what I want to test.
		it.only("simulate json app", function(done){
			var peers = {};
			peers.server = Gun();
			function wipeServer(){
				peers.server = Gun();
			}
			var gopt = {wire:{
				put: function(graph, cb){
					Gun.union(peers.server, graph);
					cb(null);
				}
				,get: function(lex, cb){
					setTimeout(function(){
						var soul = lex[Gun._.soul];
						if(peers.localStorage){
							var g = peers.localStorage;
							console.log("VIA LOCALSTORAGE!", lex, g[soul]);
							if(g[soul]){
								var n = g[soul];
								cb(null, n);
								cb(null, Gun.is.node.ify({}, soul));
								cb(null, {});
							}
						}
						setTimeout(function(){
							var graph = peers.server.__.graph;
							console.log("VIA the SERVER!!", lex, graph[soul]);
							if(!graph[soul]){
								cb(null);
								cb(null, {});
								return;
							}
							var node = graph[soul];
							cb(null, node);
							cb(null, Gun.is.node.ify({}, soul));
							cb(null, {});
						},5);
					},5);
				}
			}}
			peers.gun = Gun(gopt);
			function reload(){
				peers.localStorage = Gun.obj.copy(peers.gun.__.graph);
				peers.gun2 = Gun(gopt);
			}
			var ref = peers.gun.get('example/json/data/test');
			setTimeout(function(){
				ref.path('hello').put("value");
				setTimeout(function(){
					wipeServer();
					reload();
					setTimeout(function(){
						Gun.log.debug = 1; console.log("~~~~~~~~~~~~~~~~~~~");
						var ref = peers.gun2.get('example/json/data/test');
						ref.on(function(data){
							console.log("on!", data);
						});
					},100);
				},100);
			},100);
		});
		*/
		it("simulate chat app", function(done){
			var server = Gun();
			var gopt = {wire:{
				put: function(graph, cb){
					Gun.union(server, graph);
					cb(null);
				}
				,get: function(lex, cb){
					setTimeout(function(){
						var soul = lex[Gun._.soul];
						var graph = server.__.graph;
						//console.log('server replying', soul, graph);
						if(!graph[soul]){
							//console.log("replying to Alice...", null);
							cb(null);
							cb(null, {});
							return;
						}
						var node = graph[soul];
						//console.log("replying to Bob...", node);
						cb(null, node);
						cb(null, Gun.is.node.ify({}, soul));
						cb(null, {});
					},5);
				}
			}}
			var gun = Gun(gopt);
			var chat = gun.get('example/chat/data/graph/field').not(function(key){
				gun.put({1: {who: 'Welcome', what: "to the chat app!", when: 1}}).key(key);
			});
			chat.map().val(function renderToDo(val, field){
				//console.log("ALICE", field, val);
				expect(field).to.be.ok();
				expect(val.who).to.be.ok();
				expect(val.when).to.be.ok();
				expect(val.what).to.be.ok();
			});
			setTimeout(function(){
				var gun2 = Gun(gopt);
				//Gun.log.debug =1; console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
				var chat2 = gun2.get('example/chat/data/graph/field').not(function(key){
					//console.log("BOB's key", key);
					gun2.put({1: {who: 'Welcome', what: "to the chat app!", when: 1}}).key(key);
				});
				chat2.map().val(function renderToDo(val, field){
					//console.log("BOB", field, val);
					expect(field).to.be.ok();
					expect(val.who).to.be.ok();
					expect(val.when).to.be.ok();
					expect(val.what).to.be.ok();
					done();
				});
			},100);
		});

		it.skip("gun path via gun path", function(done){ // TODO: Future feature?
			var gun = Gun();
			var book = gun.put({ name: 'Potato Cooking' });
			var author = gun.put({ name: 'Bob Bobson' });
			author.path(book.path('name')).put(book);
		});

		it("gun set", function(done){
			var gun = Gun();
			var users = gun.get('users');
			var alice = gun.put({name: 'alice', birth: Math.random()}).key('person/alice');
			var bob = gun.put({name: 'bob', birth: Math.random()}).key('person/bob');
			var carl = gun.put({name: 'carl', birth: Math.random()}).key('person/carl');
			var dave = gun.put({name: 'dave', birth: Math.random()}).key('person/dave');

			users.set(alice);
			users.set(bob);
			users.set(carl);
			users.set(dave);

			alice.path('friends').set(bob).back.set(carl);
			bob.path('friends').set(alice);
			dave.path('friends').set(alice).back.set(carl);

			var team = gun.get('team/lions').put({name: "Lions"});
			team.path('members').set(alice);
			team.path('members').set(bob);

			alice.path('team').put(team);
			bob.path('team').put(team);

			dave.path('friends').map().path('team.members').map().val(function(member){
				//console.log("Dave's friend is on a team that has", member.name, "on it.");
				if('alice' === member.name){
					done.alice = true;
				} else
				if('bob' === member.name){
					done.bob = true;
				} else {
					expect(member).to.not.be.ok();
				}
				if(done.alice && done.bob){
					setTimeout(function(){
						done();
					},10);
				}
			});
		});

		it("localStorage", function(done){
			var localStorage = localStorage || {clear:function(){}};
			localStorage.clear();
			var gun = Gun();


			var text = Gun.text.random(1024 * 1024 * 6);
			gun.put({i: text}, function(err, ok){
				if(done.c){ return }
				if(!err){ return done() }
				var text = "If you are seeing this message, it means the localStorage error was caught successfully rather than it crashing and stopping replication to peers. Also, the error is now reported back to you via the put callback. Here it is!";
				localStorage.clear();
				done(); done.c = 1;
			});
		});

		it("get context", function(done){ // TODO: HUH?????? This was randomly causing errors?
    	var gun = Gun();
			var ref = gun.get('ctx/lol').get('ctx/foo').put({hello: 'world'});
			gun.get('ctx/lol').val(function(implicit){
				done.fail = true;
				expect(implicit).to.not.be.ok();
			});
			gun.get('ctx/lol').not(function(){
				done.please = true;
			});
			gun.get('ctx/foo').val(function(data){
				expect(data.hello).to.be('world');
				expect(done.fail).to.not.be.ok();
				expect(done.please).to.be.ok();
				done();
			});
		});

		it.skip("chaining val", function(done){ // Not implemented yet!
			var gun = Gun();
			gun.get('users').set(gun.put({name: 'alice'}));
			gun.get('users').set(gun.put({name: 'bob'}));;
			gun.get('users').val().map(function(person){
				if(person.name === 'alice'){
					done.alice = true;
				}
				if(person.name === 'bob'){
					done.bob = true;
				}
				if(person.name === 'carl'){
					done.carl = true;
				}
			});
			gun.get('users').set(gun.put({name: 'carl'}));
			setTimeout(function(){
				console.log('wha?', done.alice, done.bob, done.carl);
				expect(done.alice).to.be.ok();
				expect(done.bob).to.be.ok();
				expect(done.carl).to.not.be.ok();
				done();
			},10);
		});

    it.skip('Deep async change not updating', function (done) { // Issue #167 TODO: NEEDS TO BE ADDED TO 0.5 BRANCH!
			// object nested three layers deep
			// must be at least three layers
			var obj = { 1: { 2: { data: false } } }

			// define gun and place the deep object
			gun = Gun().get('deep change').put(obj)

			// listen for changes
			Gun.log.debug = 1; console.log("------------------");
			gun.path('1.2.data').on(function (data) {
				console.log("??????", data);
			  if (data) {
			    // gun will never receive the "true" update
			    done();
			  }
			})

			// asynchronously set data
			// synchronous deviations will succeed
			setTimeout(function () {
			  obj[1][2].data = true
			  gun.put(obj);
			}, 50)
    });

    it('should allow more than 2 items depthwise', function (done) { // Issue #186
    		var gun = Gun();
    		var list = gun.get('list');
        // create a list two layers deep
        list.put({
            depth: 1,
            next: {
                depth: 2
            }
        });

        //Gun.log.verbose=true;Gun.log.debug=1;console.log("----------------------");
        // append a third item
        list.path('next').put({
            to: {
                depth: 3
            }
        });
        setTimeout(function(){

	        //list.path('next').val('wat');

	        //console.log("!!!!!!", gun.__.graph);

	        // try to read the third item
	        list.path('next.to').val(function () { // TODO: BUG! If this is 'next.next' as with the data, then it fails.
	            done();
	        });
      	},100);
    });

    it("Batch put status update not save", function(done){ // TODO: ADD TO 0.5 BRANCH. Stefdv's bug.
    	var obj = {
				a: 1,
				b: 2,
				c: 3,
				d: 4,
				e: 5,
				f: 6,
				g: 7,
				h: 8,
				i: 9,
				j: 10,
				k: 11,
				l: 12,
				m: 13,
				n: 14,
				o: 15,
				p: 16,
				q: 17,
				r: 18,
				s: 19,
				t: 20
			}

			var bsmi = {
				group1: {
					item1: {
						10: Gun.obj.copy(obj)
					}
				}/*,
				group2: {
					item2: {
						10: Gun.obj.copy(obj)
					}
				}*/
			}

			var gun = Gun();
			var BSMI = gun.get('bsmi').put(bsmi);

			// path is <group><itemId><powerRail>
			//BSMI  is a set  holding all items
			//var allPaths = ["1116.1116-A7001.10","1354.1354-E1930.10"]
			var allPaths = ["group1.item1.10"];//,"group2.item2.10"]
			allPaths.forEach(function(path) {
				BSMI.path(path).put({status:false});
			});
			setTimeout(function(){
				BSMI.path(allPaths[0]).val(function(a,b,c){
					expect(a.a).to.be(1);
					expect(a.b).to.be(2);
					expect(a.c).to.be(3);
					expect(a.d).to.be(4);
					expect(a.e).to.be(5);
					expect(a.f).to.be(6);
					expect(a.g).to.be(7);
					expect(a.h).to.be(8);
					expect(a.i).to.be(9);
					expect(a.j).to.be(10);
					expect(a.k).to.be(11);
					expect(a.l).to.be(12);
					expect(a.m).to.be(13);
					expect(a.n).to.be(14);
					expect(a.o).to.be(15);
					expect(a.p).to.be(16);
					expect(a.q).to.be(17);
					expect(a.r).to.be(18);
					expect(a.s).to.be(19);
					expect(a.t).to.be(20);
					expect(a.status).to.be(false);
					done();
				});
			},100);
    });

    it("Don't put on parents", function(done){ // TODO: ADD TO 0.5 BRANCH! // Another Stefdv find.
			var test = gun.get('test');
			test.path('try.this.at.lvl4').put({msg:'hoi'});
			setTimeout(function(){ // TODO: Is this cheating??
				test.val(function(node,b){
					delete node._;
					expect(Gun.obj.empty(node, 'try')).to.be.ok();
					node = Gun.obj.copy(gun.__.graph[Gun.is.rel(node.try)]);

					delete node._;
					expect(Gun.obj.empty(node, 'this')).to.be.ok();
					node = Gun.obj.copy(gun.__.graph[Gun.is.rel(node.this)]);
					
					delete node._;
					expect(Gun.obj.empty(node, 'at')).to.be.ok();
					node = Gun.obj.copy(gun.__.graph[Gun.is.rel(node.at)]);

					delete node._;
					expect(Gun.obj.empty(node, 'lvl4')).to.be.ok();
					node = Gun.obj.copy(gun.__.graph[Gun.is.rel(node.lvl4)]);

					delete node._;
					expect(Gun.obj.empty(node, 'msg')).to.be.ok();
					expect(node.msg).to.be('hoi');
					done();
				});
			},100);
    });
	});
	
	describe('Streams', function(){
		var gun = Gun(), g = function(){
			return Gun({wire: {get: ctx.get}});
		}, ctx = {gen: 9, extra: 100, network: 2};
		
		it('prep hook', function(done){
			this.timeout(ctx.gen * ctx.extra);
			var peer = Gun(), ref;
			ctx.get = function(key, cb){
				var c = 0;
				cb = cb || function(){};
				key = key[Gun._.soul];
				if('big' !== key){ return cb(null) }
				setTimeout(function badNetwork(){
					c += 1;
					var soul = Gun.is.node.soul(ref);
					var graph = {};
					var data = /*graph[soul] = */ {_: {'#': soul, '>': {}}};
					if(!ref['f' + c]){
						return cb(null, data), cb(null, {});
					}
					data._[Gun._.state]['f' + c] = ref._[Gun._.state]['f' + c];
					data['f' + c] = ref['f' + c];
					cb(null, data);
					setTimeout(badNetwork, ctx.network);
				},ctx.network);
			}
			ctx.get.fake = {};
			for(var i = 1; i < (ctx.gen) + 1; i++){
				ctx.get.fake['f'+i] = i;
				ctx.length = i;
			}
			ctx.get.fake = Gun.is.node.ify(ctx.get.fake, 'big');
			var big = peer.put(ctx.get.fake).val(function(val){
				ref = val;
				ctx.get({'#': 'big'}, function(err, graph){
					if(Gun.obj.empty(graph)){ done() }
				});
				gun.opt({wire: {get: ctx.get}});
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
				var raw = Gun.obj.copy(ctx.get.fake);
				delete raw._;
				expect(obj).to.be.eql(raw);
				Gun.log.debug = 0;
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
		
		it('val emits all data', function(done){ // bug in chat app
			var chat = Gun().get('example/chat/data').not(function(){
				this.put({1: {who: 'Welcome', what: "to the chat app!", when: 0}}).key('example/chat/data');
			});
			chat.put({random1: {who: 'mark', what: "1", when: 1}});
			chat.put({random2: {who: 'mark', what: "2", when: 2}});
			chat.put({random3: {who: 'mark', what: "3", when: 3}});
			chat.put({random4: {who: 'mark', what: "4", when: 4}});
			chat.put({random5: {who: 'mark', what: "5", when: 5}});
			var seen = {1: false, 2: false, 3: false, 4: false, 5: false}
			setTimeout(function(){				
				chat.map(function(m){ }).val(function(msg, field){
					var msg = Gun.obj.copy(msg);
					if(msg.what){
						expect(msg.what).to.be.ok();
						seen[msg.when] = true;
					}
					if(!Gun.obj.map(seen, function(boo){ if(!boo){ return true } })){
						done();
					}
				});
			}, 100);
		});
	});
});
describe('On', function(){
	it('emits to former subscribers', function() {
		var recv = null;
		Gun.on('on-test-1').event(function(val) {
			recv = val;
		});
		Gun.on('on-test-1').emit('foo');
		expect(recv).to.be('foo');
	});
	it('does not emit to future subscribers', function() {
		var recv = null;
		Gun.on('on-test-1').emit('foo');
		Gun.on('on-test-1').event(function(val) {
			recv = val;
		});
		expect(recv).to.be(null);
	});
	it('on subscriptions can unsubscribe', function() {
		var gun = Gun();
		var recv;
		gun.get('on-test-3').put({v: 'foo'});
		var sub = gun.get('on-test-3').on(function(o) {
			recv = o.v;
		});
		expect(recv).to.be('foo');
		gun.get('on-test-3').put({v: 'bar'});
		expect(recv).to.be('bar');
		sub.off();
		gun.get('on-test-3').put({v: 'off'});
		expect(recv).to.be('bar');
	});
	it('map subscriptions can unsubscribe', function() {
		var gun = Gun();
		var recv;
		gun.get('on-test-4').put({v: 'foo'});
		var sub = gun.get('on-test-4').map(function(v, k) {
			if (v == 'off') throw new Error('unexpected');
			recv = v;
		});
		expect(recv).to.be('foo');
		gun.get('on-test-4').put({v: 'bar'});
		expect(recv).to.be('bar');
		sub.off();
		gun.get('on-test-4').put({v: 'off'});
		expect(recv).to.be('bar');
	});
});
