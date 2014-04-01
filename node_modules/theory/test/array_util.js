module.exports=require('../theory')
('list_utils',function(a){
	//alert('arrays util');
	describe('arrays',function(){
		beforeEach(function(done){ // IE6 stack release
			setTimeout(function(){done()}, 0);
		});
		it('at',function(){
			expect(theory.list([1,2,3,4,5,6,7,8,9]).at(2)).to.be(2);
			expect(theory.list.at([1,2,3,4,5,6,7,8,9],2)).to.be(2);
			expect(theory.list([1,2,3,4,5,6,7,8,9]).at(-2)).to.be(8);
			expect(theory.list.at([1,2,3,4,5,6,7,8,9],-2)).to.be(8);
			expect(theory.list([1,2]).at(9)).to.be(undefined);
			expect(theory.list.at([1,2],9)).to.be(undefined);
			expect(theory.list([2,3,4]).at(2,{ebb:true})).to.be(3);
			expect(theory.list.at([2,3,4],2,{ebb:1})).to.be(3);
			expect(theory.list([2,3,4]).at(-2,{ebb:1})).to.be(3);
			expect(theory.list.at([2,3,4],-2,{ebb:true})).to.be(3);
			expect(theory.list([2,3,4]).at(9,{ebb:true})).to.be(4);
			expect(theory.list.at([2,3,4],9,{ebb:true})).to.be(4);
			expect(theory.list([2,3,4]).at(-9,{ebb:true})).to.be(2);
			expect(theory.list.at([2,3,4],-9,{ebb:true})).to.be(2);
			expect(theory.list([2,3,0]).at(9,{ebb:true})).to.be(0);
			expect(theory.list.at([2,3,0],9,{ebb:true})).to.be(0);
			expect(theory.list([false,3,0]).at(-9,{ebb:true})).to.be(false);
			expect(theory.list.at([false,3,0],-9,{ebb:true})).to.be(false);
		});
		it('ify',function(){
			expect(theory.list("Bob, Joe,Isaac , Fred").ify()).to.eql(["Bob","Joe","Isaac","Fred"]);
			expect(theory.list.ify("Bob, Joe,Isaac , Fred")).to.eql(["Bob","Joe","Isaac","Fred"]);
			expect(theory.list("1,2,3 ; 4,5,6").ify({split:';'})).to.eql(["1,2,3","4,5,6"]);
			expect(theory.list.ify("1,2,3 ; 4,5,6",{split:';'})).to.eql(["1,2,3","4,5,6"]);
			expect(theory.list({a:1,b:'c',d:[0,1,2]}).ify()).to.eql(['a:1','b:c','d:0,1,2']);
			expect(theory.list.ify({a:1,b:'c',d:[0,1,2]})).to.eql(['a:1','b:c','d:0,1,2']);
			expect(theory.list({a:1,b:'c',d:[0,1,2],e:{f:'g'}}).ify({wedge:'='})).to.eql(["a=1", "b=c", "d=0,1,2", 'e={"f":"g"}']);
			expect(theory.list.ify({a:1,b:'c',d:[0,1,2],e:{f:'g'}},{wedge:'='})).to.eql(["a=1", "b=c", "d=0,1,2", 'e={"f":"g"}']);
		});
		it('fuse',function(){
			expect(theory.list([2,3]).fuse([4,5],[6,7])).to.eql([2,3,4,5,6,7]);
			expect(theory.list.fuse([2,3],[4,5],[6,7])).to.eql([2,3,4,5,6,7]);
		});
		it('less',function(){
			expect(theory.list([1]).less(1)).to.eql([]);
			expect(theory.list.less([1],1)).to.eql([]);
			expect(theory.list([4,5]).less(1)).to.eql([4,5]);
			expect(theory.list.less([4,5],1)).to.eql([4,5]);
			expect(theory.list([0,1,'a','b','c','b','d']).less('b')).to.eql([0,1,'a','c','d']);
			expect(theory.list.less([0,1,'a','b','c','b','d'],'b')).to.eql([0,1,'a','c','d']);
			expect(theory.list([0,1,NaN,'','c',false,true,[1],[]]).less(NaN,false,0,[],'')).to.eql([1,'c',true,[1]]);
			expect(theory.list.less([0,1,NaN,'','c',false,true,[1],[]],NaN,false,0,[],'')).to.eql([1,'c',true,[1]]);
			expect(theory.list(2).less([0,0,1,2,2,3],[0,2])).to.eql([1,3]);
		});
		it('find',function(){
			expect(theory.list([-2,-1,0,1,2]).find(0)).to.be(3);
			expect(theory.list.find([-2,-1,0,1,2],0)).to.be(3);
			expect(theory.list(['a','b','c']).find('z')).to.be(0);
			expect(theory.list.find(['a','b','c'],'z')).to.be(0);
			expect(theory.list([false,true,NaN,0,1,'','a',['b'],{c:'d'}]).find(NaN)).to.be(3);
			expect(theory.list.find([false,true,NaN,0,1,'','a',['b'],{c:'d'}],NaN)).to.be(3);
			expect(theory.list([false,true,NaN,0,1,'','a',['b'],{c:'d'}]).find(['b'])).to.be(8);
			expect(theory.list.find([false,true,NaN,0,1,'','a',['b'],{c:'d'}],['b'])).to.be(8);
			expect(theory.list([false,true,NaN,0,1,'','a',['b'],{c:'d'}]).find({c:'d'})).to.be(9);
			expect(theory.list.find([false,true,NaN,0,1,'','a',['b'],{c:'d'}],{c:'d'})).to.be(9);
		});
		it('each',function(){
			expect(theory.list([1,2,3,4,5]).each(function(v,i,t){ t(v+=this.d); this.d=v; },{d:0})).to.eql([1,3,6,10,15]);
			expect(theory.list.each([1,2,3,4,5],function(v,i,t){ t(v+=this.d); this.d=v; },{d:0})).to.eql([1,3,6,10,15]);
			expect(theory.list([2,3,0,4]).each(function(v,i,t){ if(!v){ return } t(v*=this.d); this.d=v; },{d:1})).to.eql([2,6,24]);
			expect(theory.list.each([2,3,0,4],function(v,i,t){ if(!v){ return } t(v*=this.d); this.d=v; },{d:1})).to.eql([2,6,24]);
			expect(theory.list([true,false,NaN,Infinity,'',9]).each(function(v,i,t){ if(i===3){ return 0 }})).to.be(0);
			expect(theory.list.each([true,false,NaN,Infinity,'',9],function(v,i,t){ if(i===3){ return 0 }})).to.be(0);
		});
	});
	return [3,2,1];
});