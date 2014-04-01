describe('objects',function(){
	beforeEach(function(done){ // IE6 stack release
		setTimeout(function(){done()}, 0);
	});
	it('ify',function(){
		expect(theory.obj('[0,1]').ify()).to.eql([0,1]);
		expect(theory.obj.ify('[0,1]')).to.eql([0,1]);
		expect(theory.obj('{"a":false,"b":1,"c":"d","e":[0,1],"f":{"g":"h"}}').ify()).to.eql({"a":false,"b":1,"c":"d","e":[0,1],"f":{"g":"h"}});
		expect(theory.obj.ify('{"a":false,"b":1,"c":"d","e":[0,1],"f":{"g":"h"}}')).to.eql({"a":false,"b":1,"c":"d","e":[0,1],"f":{"g":"h"}});
	});
	it('empty',function(){
		expect(theory.obj({}).empty()).to.be(true);
		expect(theory.obj.empty({})).to.be(true);
		expect(theory.obj({a:false}).empty()).to.be(false);
		expect(theory.obj.empty({a:false})).to.be(false);
	});
	it('each',function(){
		expect(theory.obj({a:'z',b:'y',c:'x'}).each(function(v,i,t){ t(v,i) })).to.eql({x:'c',y:'b',z:'a'});
		expect(theory.obj.each({a:'z',b:'y',c:'x'},function(v,i,t){ t(v,i) })).to.eql({x:'c',y:'b',z:'a'});
		expect(theory.obj({a:'z',b:false,c:'x'}).each(function(v,i,t){ if(!v){ return } t(i,v) })).to.eql({a:'z',c:'x'});
		expect(theory.obj.each({a:'z',b:false,c:'x'},function(v,i,t){ if(!v){ return } t(i,v) })).to.eql({a:'z',c:'x'});
		expect(theory.obj({a:'z',b:3,c:'x'}).each(function(v,i,t){ if(v===3){ return 0 }})).to.be(0);
		expect(theory.obj.each({a:'z',b:3,c:'x'},function(v,i,t){ if(v===3){ return 0 }})).to.be(0);
	});
});
root.ObjectUtils = true;