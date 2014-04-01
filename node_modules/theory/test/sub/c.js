module.exports=require('../../theory')
('check',function(a){
	describe('sub',function(){
		it('c',function(){
			expect(a.f).to.be('g');
		});
	});
	return a;
},{
	'../d':1
	,'./e':'f'
});