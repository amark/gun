module.exports=require('../theory')
('functions',function(a){
	function Func(){
		return Func;
	}
	describe('Functions',function(){
		beforeEach(function(done){ // IE6 stack release
			setTimeout(function(){done()}, 0);
		});
		it('is()',function(){
			expect(theory.fns(function(){}).is()).to.be(true);
			expect(theory.fns('').is()).to.be(false);
			expect(theory.fns('a').is()).to.be(false);
			expect(theory.fns(0).is()).to.be(false);
			expect(theory.fns(1).is()).to.be(false);
			expect(theory.fns([]).is()).to.be(false);
			expect(theory.fns([1]).is()).to.be(false);
			expect(theory.fns({}).is()).to.be(false);
			expect(theory.fns({a:1}).is()).to.be(false);
			expect(theory.fns(false).is()).to.be(false);
			expect(theory.fns(true).is()).to.be(false);
		});
		it('is',function(){
			expect(theory.fns.is(function(){})).to.be(true);
			expect(theory.fns.is('')).to.be(false);
			expect(theory.fns.is('a')).to.be(false);
			expect(theory.fns.is(0)).to.be(false);
			expect(theory.fns.is(1)).to.be(false);
			expect(theory.fns.is([])).to.be(false);
			expect(theory.fns.is([1])).to.be(false);
			expect(theory.fns.is({})).to.be(false);
			expect(theory.fns.is({a:1})).to.be(false);
			expect(theory.fns.is(false)).to.be(false);
			expect(theory.fns.is(true)).to.be(false);
		});
		it('sort',function(){
			Func.sort = theory.fns.sort([true,false,0,1,'','a',[],[2],{},{b:3},function(){}]);
			expect(Func.sort.b).to.eql([true,false]);
			expect(Func.sort.n).to.eql([0,1]);
			expect(Func.sort.t).to.eql(['','a']);
			expect(Func.sort.l).to.eql([[],[2]]);
			expect(Func.sort.o).to.eql([{},{b:3}]);
			expect(Func.sort.f[0]).to.be.a('function');
		});
		it('pass',function(){
			expect(theory.fns(function(){ this.pass = 5; return this.pass +2; }).pass(Func)()).to.be(7);
			expect(theory.fns.pass(function(){ this.pass = 5; return this.pass +2; },Func)()).to.be(7);
		});
		it('flow',function(done){
			theory.fns.flow([
				function(next){
					next(Func.val = 5);
				},function(x,next){
					next(x*x);
				}
			],function(x){
				Func.val = x*x;
				expect(Func.val).to.be(625);
				done();
			});
		});
	});
	return Func;
});