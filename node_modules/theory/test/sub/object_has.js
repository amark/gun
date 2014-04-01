module.exports=require('../../theory')
('object_has',function(a){
	describe('objects',function(){
		it('has',function(){
			expect(theory.obj({yay:false}).has('yay')).to.be(true);
			expect(theory.obj.has({yay:false},'yay')).to.be(true);
			expect(theory.obj({yay:false}).has('toString')).to.be(false);
			expect(theory.obj.has({yay:false},'toString')).to.be(false);
		});
	});
	return {status:'done'};
},['./object_union']);