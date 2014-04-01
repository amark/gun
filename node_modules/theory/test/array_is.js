//alert('array is');
describe('Lists',function(){
	beforeEach(function(done){ // IE6 stack release
		setTimeout(function(){done()}, 0);
	});
	it('is()',function(){
		expect(theory.list([]).is()).to.be(true);
		expect(theory.list([1]).is()).to.be(true);
		expect(theory.list(0).is()).to.be(false);
		expect(theory.list(1).is()).to.be(false);
		expect(theory.list('').is()).to.be(false);
		expect(theory.list('a').is()).to.be(false);
		expect(theory.list({}).is()).to.be(false);
		expect(theory.list({a:1}).is()).to.be(false);
		expect(theory.list(false).is()).to.be(false);
		expect(theory.list(true).is()).to.be(false);
		expect(theory.list(function(){}).is()).to.be(false);
	});
	it('is',function(){
		expect(theory.list.is([])).to.be(true);
		expect(theory.list.is([1])).to.be(true);
		expect(theory.list.is(0)).to.be(false);
		expect(theory.list.is(1)).to.be(false);
		expect(theory.list.is('')).to.be(false);
		expect(theory.list.is('a')).to.be(false);
		expect(theory.list.is({})).to.be(false);
		expect(theory.list.is({a:1})).to.be(false);
		expect(theory.list.is(false)).to.be(false);
		expect(theory.list.is(true)).to.be(false);
		expect(theory.list.is(function(){})).to.be(false);
	});
});
root.ArrayIs = true;