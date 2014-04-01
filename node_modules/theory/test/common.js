var TS = new Date().getTime();
module.exports=require('../theory')
('tests',function(a){
	var s='',i;for(i in a){s+=i+', '};console.log(s);
	root.page && (document.getElementById('debug').innerHTML = (new Date().getTime() - TS)/1000+'s '+module.sync);
	describe('Dependencies',function(){
		it('are',function(){
			expect(a.binary).to.be(true);
			expect(a.count).to.be(42);
			expect(a.texts).to.be("Hello World!");
			expect(theory.language).to.be("Hello World!");
			expect(a.enumerate).to.eql([1,2,3]);
			expect(theory.syllabus).to.eql([1,2,3]);
			expect(a.array_util).to.eql(undefined);
			expect(theory.list_utils).to.eql([3,2,1]);
			expect(a.hash).to.eql({all:'your',tests:'belong',to:'us'});
			expect(root.TimeFull).to.be.ok();
			expect(a.events).to.be.ok();
		});
	});
	describe('Test',function(){
		it('equality',function(){
			(function(){
				expect(theory.test(function(){ return 1; })()).to.be(1);
				expect(theory.test(function(){ explode; return 1; })()).to.not.be(1);
			})();
			expect(theory.test(function(){ return 'testing'; }).is(function(){ return 'testing'; })).to.be.ok();
			expect(theory.test(NaN).is(NaN)).to.be.ok();
			expect(theory.test(null).is(null)).to.be.ok();
			expect(theory.test(-0).is(-0)).to.be.ok();
			expect(theory.test({a:1,b:'c',d:[false,'e'],f:{g:function(){return false}}})
				.is({a:1,b:'c',d:[false,'e'],f:{g:function(){return false}}})).to.be.ok();
			expect(theory.test(function(){return 'tests'}).is(function(){ return 'testing'; })).to.not.be.ok();
			expect(theory.test(undefined).is(null)).to.not.be.ok();
			expect(theory.test(null).is(undefined)).to.not.be.ok();
			expect(theory.test.is(undefined,null)).to.not.be.ok();
			expect(theory.test(undefined).is(0)).to.not.be.ok();
			expect(theory.test(0).is(undefined)).to.not.be.ok();
			expect(theory.test.is(0,undefined)).to.not.be.ok();
			expect(theory.test(null).is(0)).to.not.be.ok();
			expect(theory.test(0).is(null)).to.not.be.ok();
			expect(theory.test.is(null,0)).to.not.be.ok();
			expect(theory.test(true).is(1)).to.not.be.ok();
			expect(theory.test(1).is(true)).to.not.be.ok();
			expect(theory.test.is(1,true)).to.not.be.ok();
			expect(theory.test(0).is(-0)).to.not.be.ok();
			expect(theory.test(-0).is(0)).to.not.be.ok();
		});
	});	
	describe('Require',function(){
		it('callback',function(){
			if(root.node){
				return expect('use native require').to.ok();
			}
			require(['./sub/three','./sub/four'])(function(){
				expect(root.Three).to.be(3);
				expect(root.Four).to.be(4);
				require('./ready')(function(){
					expect(root.Ready).to.be.ok();
				});
			});
		});
	});
	if(root.page){
		mocha.run();
	}
},{
	'./dep':[
		'./a'
		,'./b'
	]
	,'./sub':''
	,'./binary':''
	,'./numbers':'count'
	,'./strings':'texts'
	,'./arrays':'enumerate'
	,'./objects':'hash'
	,'./functions':''
	,'./time':'travel'
	,'./events':''
});