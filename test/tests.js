module.exports=require('theory')
('tests',function(a){
	if(root.node){
		require('../../../lushly/keys');
		var shot = require('../shots')({src: a.com}).pump(function(g, m, done){
			done();
		});
		return shot.spray(function(g, m, done){
			console.log('>>>>>>>>>> gun');
			done();
			console.log(g());
		});
	}
	var shot = a.shot();
	describe('Gun',function(){
		it('ify',function(){
			return;
			var graph = {
				asdf: {
					_: {$: 'asdf'}
					,name: 'Alice'
					,age: 23
					,knows: {$: 'zyx' }
				}
				,fdsa: {
					_: {$: 'fdsa'}
					,name: 'Bob'
					,age: 22
					,friends: ['asdf','xyz','zyx']
				}
				,xyz: {
					_: {$: 'xyz'}
					,name: 'Carl'
					,age: 32
				}
				,zyx: {
					_: {$: 'zyx'}
					,name: 'Dave'
					,age: 22
					,self: {$: 'zyx'}
					,eye: {
						color: 'blue'
					}
				}
			}
			var g = theory.gun(graph);
			var e = g({name: 'Evan', age: 19, knows: {$: 'fdsa'}});
			var f = g({name: 'Fred', age: 20, knows: {$: 'asdf'}});
			expect(f('knows.age')).to.eql(23);
			console.log(g());
			console.log('---------------------');
			expect(e('knows.friends.age')).to.eql(23);
			var ref = {}, val = theory.gun.at(f(),'knows.knows.eye.color',ref);
			expect(val).to.eql('blue');
			expect(ref.prop).to.be('color');
			expect(ref.path).to.be('eye.color');
			expect(ref.node._.$).to.be('zyx');
			expect(ref.at).to.eql({color:'blue'});
			console.log(g());
		});
		it('ify',function(){
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
	describe('Shot',function(){
		it('tests',function(){
			//return;
			//var s = theory.shot({src: '/test/server.js'})
			var s = shot.shell('lushly.org/tests/package.json',function(g){
				if(!g){ return }
				console.log('graph', g());
				var p = g('packageson');
				var val = p('version');
				console.log(val);
				val = a.num.is(val)? (val + 1) : 0;
				console.log(val);
				p('version',val);
				a.time.wait(function(){
					shot.shell('lushly.org/tests/package.json',function(gg){
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