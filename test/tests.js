module.exports=require('theory');
('tests',function(a){
	if(root.node){
		console.log("tests live!");
		var shot = require('../shots')({src: a.com}).pump(function(g, m, done){
			done();
		});
		return shot.spray(function(g, m, done){
			//console.log('>>>>>>>>>> gun');
			var gPrime = {};
			done(gPrime); // allow me to send custom modified filtered version
			//console.log(g());
		});
	}
	var shot = a.shot();
	describe('Gun',function(){
		var tests = {};
		it('ify & basics',function(){
			console.log("-------> test gun <-------");
			var graph = {
				asdf: {
					_: {'#': 'asdf'}
					,name: 'Alice'
					,age: 23
					,knows: {'#': 'zyx' }
				}
				,fdsa: {
					_: {'#': 'fdsa'}
					,name: 'Bob'
					,age: 22
					,friends: ['asdf','xyz','zyx']
				}
				,xyz: {
					_: {'#': 'xyz'}
					,name: 'Carl'
					,age: 32
				}
				,zyx: {
					_: {'#': 'zyx'}
					,name: 'Dave'
					,age: 22
					,self: {'#': 'zyx'}
					,eye: {
						color: 'blue'
					}
				}
			}
			var g = tests.social = theory.gun('social', graph);
			var e = g({name: 'Evan', age: 19, knows: {'#': 'fdsa'}});
			var f = g({name: 'Fred', age: 20, knows: {'#': 'asdf'}});
			console.log('test graph', g());
			expect(f('knows.age')).to.eql(23);
			console.log('---------------------');
			expect(e('knows.friends.age')).to.eql(23);
			var ref = {}, val = theory.gun.at(f(),'knows.knows.eye.color',ref);
			expect(val).to.eql('blue');
			expect(ref.prop).to.be('color');
			expect(ref.path).to.be('eye.color');
			console.log("ref???", ref);
			expect(ref.cartridge._['#']).to.be('zyx');
			expect(ref.at).to.eql({color:'blue'});
			console.log('---------------------');
			var now = theory.time.now();
			f('age',21);
			expect(f('age')).to.be(21);
			f('age',22,now);
			expect(f('age')).to.be(21);
			console.log('---------------------');
			f('skin',1);
			var now = theory.time.now();
			expect(f('skin')).to.be(1);
			f('skin',{color: 'olive', freckles: false, softness: .5});
			expect(f('skin.color')).to.be('olive');
			expect(f('skin.softness')).to.be(.5);
			f('skin.freckles',true);
			expect(f('skin.freckles')).to.be(true);
			f('skin',{oily: true});
			expect(f('skin')).to.eql({color: 'olive', freckles: true, softness: .5, oily: true});
			f('skin',{flaky: false},now);
			expect(f('skin')).to.eql({color: 'olive', freckles: true, softness: .5, oily: true, flaky: false});
			f('skin',{color: 'pink', wrinkles: 'none'}, now);
			expect(f('skin')).to.eql({color: 'olive', freckles: true, softness: .5, oily: true, flaky: false, wrinkles: 'none'});
			f('skin',{elastic: .7}, now - 100);
			expect(f('skin')).to.eql({color: 'olive', freckles: true, softness: .5, oily: true, flaky: false, wrinkles: 'none'});
			f('skin.random',a.num.r(), now - 100);
			expect(f('skin')).to.eql({color: 'olive', freckles: true, softness: .5, oily: true, flaky: false, wrinkles: 'none'});
			f('skin.softness',.9, now - 100);
			expect(f('skin')).to.eql({color: 'olive', freckles: true, softness: .5, oily: true, flaky: false, wrinkles: 'none'});
			console.log('fred', f());
			return;
			expect(f('skin')).to.eql({oily: true});
			f('skin',null,now-5);
			f('skin',{wrinkles: false, color: 'pink'},now-1);
			expect(f('skin')).to.eql({oily: true});
			console.log(g());
		});
		it('graph merge sync',function(){
			var graph = {
				asdf: {
					_: {'#': 'asdf'}
					,name: 'Alice'
					,age: 33
					,knows: {'#': 'zyx' }
				}
				,fdsa: {
					_: {'#': 'fdsa'}
					,name: 'Bob'
					,age: 32
					,friends: ['asdf','xyz','zyx']
				}
				,xyz: {
					_: {'#': 'xyz', '>':{'age': a.time.now() }}
					,name: 'Carl'
					,age: 42
				}
				,zyx: {
					_: {'#': 'zyx'}
					,name: 'Dave'
					,age: 32
					,self: {'#': 'zyx'}
					,eye: {
						color: 'green'
						,sight: 1
					}
				}
			}
			console.log("####################################################");
			var g = tests.socialize = theory.gun('social', graph);
			expect(g('xyz.age')).to.eql(42);
			expect(g('asdf.age')).to.eql(23);
			expect(g('fdsa.age')).to.eql(22);
			expect(g('zyx.age')).to.eql(22);
			expect(g('zyx.eye.sight')).to.eql(1);
			expect(g('zyx.eye.color')).to.eql('blue');
			console.log('socializing', g());
		});
		it('primal object existence',function(){
			// Mars testing;
			var graph = {
				doc: {
					_: {'#': 'doc'}
					,thing: 5
				}
			}
			var g = theory.gun(graph);
			var doc = g('doc');
			expect(doc('thing')).to.eql(5);
			// Earth:
			var earthNow1 = a.time.now();
			doc('thing',{a: 'yay'}, earthNow1);
			expect(doc('thing.a')).to.eql('yay');
		});
		it(' ',function(){
			return;
			var g = theory.gun('hi');
			var z = {here:'we',are:'again',name:'z'};
			var y = {to:z,what:'up',name:'y'};
			var x = {from:y,here:'go',name:'x'};
			var n = g.ify(x);
			var q = g.at();
			var p = g.ify(q);
			console.log(g(), q, p);
			expect(q).to.eql(p);
		});
		it('tests',function(){
			return;
			// run before shotgun, or we'll have mixed problems?
			var g = theory.gun();
			var z = g({});
			var y = g({});
			z('name','Zach');
			y('name','Yvan');
			z('list',[y]);
			expect(a.list.is(z('list'))).to.be.ok();
			expect(z('list').length).to.be(1);
			expect(z('list.name')).to.be('Yvan');
			z('list',[z]);
			z('from','USA');
			expect(a.list.is(z('list'))).to.be.ok();
			expect(z('list').length).to.be(2);
			expect(z('list.from')).to.be('USA');
		});
	});
	describe('Shot',function(){ return;
		it('tests',function(){
			//var s = theory.shot({src: '/test/server.js'})
			var s = shot.load('gunjs.herokuapp.com/tests/package.json',function(g){
				if(!g){ return }
				console.log('graph', g());
				var p = g('packageson');
				var val = p('version');
				var ran = p('random');
				if(!a.num.is(val)){
					console.log("Please refresh!!! -- known but unfixed bug encountered");
					return;
				}
				console.log(val, ran);
				val = a.num.is(val)? (val + 1) : 0;
				ran = a.text.r();
				console.log(val, 'and total randomness ---->', ran);
				p('version',val);
				p('random',ran);
				a.time.wait(function(){
					shot.load('gunjs.herokuapp.com/tests/package.json',function(gg){
						var pp = gg('packageson');
						console.log('graph prime', gg());
						expect(val).to.be(pp('version'));
						console.log(pp('version'));
					});
				},1000);
			});
		});
	});
	a.time.wait(mocha.run,50);
	return shot.spray;
},['../shot']);