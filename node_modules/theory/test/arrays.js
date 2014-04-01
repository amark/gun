module.exports=require('../theory')
('syllabus',function(a){
	describe('arrays',function(){
		it('deps',function(){
			expect(root.ArrayIs).to.be(true);
			expect(a.array_is).to.be(undefined);
		});
	});
	return [1,2,3];
},['./array_util', './array_is']);