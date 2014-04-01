module.exports=require('../theory')
('hash',function(a){
	//var s='',i;for(i in a){s+=i+', '};alert('hash: '+s);
	describe('Objects',function(){
		it('deps',function(){
			expect(a.object_is).to.be(undefined);
			expect(root.ObjectUtils).to.be.ok();
			expect(a.object_util).to.be(undefined);
			expect(a.get.has.status).to.be('done');
			expect(theory.object_union).to.eql({u:1});
			expect(root.CopyObject).to.be.ok();
		});
	});
	return {all:'your',tests:'belong',to:'us'};
},{
	'./sub/object_is':''
	,'./sub/object_util':'util'
	,'./sub/object_get':'get'
});