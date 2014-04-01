describe('objects',function(){
	var t = {};
	beforeEach(function(done){ // IE6 stack release
		setTimeout(function(){done()}, 0);
	});
	it('copy',function(){
		expect(theory.obj([]).copy()).to.eql([]);
		expect(theory.obj.copy([])).to.eql([]);
		expect(theory.obj({}).copy()).to.eql({});
		expect(theory.obj.copy({})).to.eql({});
		t.val = {a:1,b:'c',d:[0,1,2],e:{f:'g'},h:function(){ return 1 }};
		t.dup = theory.obj(t.val).copy();
		expect(t.dup.a).to.be(t.val.a);
		expect(t.dup.b).to.be(t.val.b);
		expect(t.dup.d).to.eql(t.val.d);
		expect(t.dup.e).to.eql(t.val.e);
		expect(t.dup.h()).to.eql(t.val.h());
		t.dup.d = 'diff';
		expect(t.dup.d).to.not.be(t.val.d);
		t.val = t.dup = undefined;
		t.val = {a:1,b:'c',d:[0,1,2],e:{f:'g'},h:function(){ return 1 }};
		t.dup = theory.obj(t.val).copy();
		expect(t.dup.a).to.be(t.val.a);
		expect(t.dup.b).to.be(t.val.b);
		expect(t.dup.d).to.eql(t.val.d);
		expect(t.dup.e).to.eql(t.val.e);
		expect(t.dup.h()).to.eql(t.val.h());
		t.dup.d = 'diff';
		expect(t.dup.d).to.not.be(t.val.d);
	});
});
root.CopyObject = true;