module.exports=require('../theory')
('sub',function(a){
	describe('sub',function(){
		it('a',function(){
			expect(root.Add(2, a.one)).to.be(3);
		});
	});	
	return a.one;
},[
	'./one'
	,'./sub/c'
]);