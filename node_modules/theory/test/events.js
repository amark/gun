module.exports=require('../theory')
({name: 'events'
, init: function(a){
	var t = {};
	describe('On',function(){
		it('event',function(){
			t.on = theory.on('test').event(function(b,c,d){ t.ont = [b,c,d] });
			theory.on('test').emit(4,5,6);
			expect(t.ont).to.eql([4,5,6]);
		});
		it('emit',function(){
			t.on2 = theory.on('test').event(function(b,c,d){ t.ont2 = [b,c,d] });
			theory.on('test').emit(1,2,3);
			expect(t.ont).to.eql([1,2,3]);
			expect(t.ont2).to.eql([1,2,3]);
		});
		it('off',function(){
			t.on.off(); t.ont = 1;
			theory.on('test').emit(-4,-8,0);
			expect(t.ont).to.be(1);
			expect(t.ont2).to.eql([-4,-8,0]);
			t.on2.off(); t.ont2 = 5;
			theory.on('test').emit(9, 9, 9);
			expect(t.ont).to.be(1);
			expect(t.ont2).to.be(5);
		});
		it('on',function(){
			t.on = theory.on('test').event(function(b,c,d){ t.ont = [b,c,d] });
			theory.on('test').emit(11, 22, 33);
			expect(t.ont).to.eql([11,22,33]);
			t.on = theory.on('test').event(function(b,c,d){ t.ont = ['a','b','c']; t.ont2 = [0,0,0] }, -1);
			theory.on('test').emit(12, 23, 34);
			expect(t.ont).to.eql([12,23,34]);
			expect(t.ont2).to.eql([0,0,0]);
		});
	});
	return true;
}});