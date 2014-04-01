module.exports=require('../../theory')
('hash',function(a){
	describe('objects',function(){
		beforeEach(function(done){ // IE6 stack release
			setTimeout(function(){done()}, 0);
		});
		it('get',function(){
			expect(theory.obj({a:1,b:2,c:3}).get('b')).to.be(2);
			expect(theory.obj.get({a:1,b:2,c:3},'b')).to.be(2);
			expect(theory.obj({a:1,b:{x:{z:7}},c:3}).get('b.pow.z.x')).to.be(undefined);
			expect(theory.obj.get({a:1,b:{x:{z:7}},c:3},'b.pow.z.x')).to.be(undefined);
			expect(theory.obj({a:1,b:{x:{z:7}},c:3}).get('b.x.z')).to.be(7);
			expect(theory.obj.get({a:1,b:{x:{z:7}},c:3},'b.x.z')).to.be(7);
			expect(theory.obj({a:1,b:[[1,2],[3,4],[{x:9}]],c:3}).get('b.x')).to.be(9);
			expect(theory.obj.get({a:1,b:[[1,2],[3,4],[{x:9}]],c:3},'b.x')).to.be(9);
			expect(theory.obj({a:1,b:[[1,2],[3,4],{x:9}],c:3}).get('b.1.x')).to.be(undefined);
			expect(theory.obj.get({a:1,b:[[1,2],[3,4],{x:9}],c:3},'b.1.x')).to.be(undefined);
			expect(theory.obj({a:1,b:[[1,2],[3,4],{x:9}],c:3}).get('b.3.x')).to.be(9);
			expect(theory.obj.get({a:1,b:[[1,2],[3,4],{x:9}],c:3},'b.3.x')).to.be(9);
			expect(theory.obj({a:1,b:[[1,2],[3,4],{x:9}],c:3}).get('b.-1.x')).to.be(9);
			expect(theory.obj.get({a:1,b:[[1,2],[3,4],{x:9}],c:3},'b.-1.x')).to.be(9);
			expect(theory.obj({a:{b:{c:null}}}).get('a.b.c')).to.be(null);
			expect(theory.obj.get({a:{b:{c:null}}},'a.b.c')).to.be(null);
			expect(theory.obj({a:{b:{c:null}}}).get('a.b.c->')).to.be.a('function');
			expect(theory.obj.get({a:{b:{c:null}}},'a.b.c->')).to.be.a('function');
			expect(theory.obj({a:{b:{c:function(){return 1}}}}).get('a.b.c->')()).to.be(1);
			expect(theory.obj.get({a:{b:{c:function(){return 1}}}},'a.b.c->')()).to.be(1);
		});
	});
	//var s='',i;for(i in a){s+=i+', '};alert('get: '+s);
	return {has:{status:'done'}};
},{
	'./object_has':'has'
	,'./object_copy':''
})