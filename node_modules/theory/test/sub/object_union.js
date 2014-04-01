module.exports=require('../../theory')
('object_union',function(a){
	describe('objects',function(){
		beforeEach(function(done){ // IE6 stack release
			setTimeout(function(){done()}, 0);
		});
		it('union',function(){
			expect(theory.obj({a:'b',c:'d'}).union({c:1,z:2})).to.eql({a:'b',c:'d',z:2});
			expect(theory.obj.union({a:'b',c:'d'},{c:1,z:2})).to.eql({a:'b',c:'d',z:2});
			expect(theory.obj({a:'b',c:'d'}).union({c:1,z:2},{x:3,y:4})).to.eql({a:'b',c:'d',z:2,x:3,y:4});
			expect(theory.obj.union({a:'b',c:'d'},{c:1,z:2},{x:3,y:4})).to.eql({a:'b',c:'d',z:2,x:3,y:4});
			expect(theory.obj([{a:'b',c:'d'},{c:1,z:2}]).u({ig:'nore'})).to.eql({a:'b',c:'d',z:2});
			expect(theory.obj.u([{a:'b',c:'d'},{c:1,z:2}],{ig:'nore'})).to.eql({a:'b',c:'d',z:2});
		});
	});
	return {u:1};
});