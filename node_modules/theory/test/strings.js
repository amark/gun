module.exports=require('../theory')
('language',function(a){
	var t = {};
	describe('Text',function(){
		it('is()',function(){
			expect(theory.text('').is()).to.be(true);
			expect(theory.text('a').is()).to.be(true);
			expect(theory.text(false).is()).to.be(false);
			expect(theory.text(true).is()).to.be(false);
			expect(theory.text(0).is()).to.be(false);
			expect(theory.text(1).is()).to.be(false);
			expect(theory.text([]).is()).to.be(false);
			expect(theory.text([1]).is()).to.be(false);
			expect(theory.text({}).is()).to.be(false);
			expect(theory.text({a:1}).is()).to.be(false);
			expect(theory.text(function(){}).is()).to.be(false);
		});
		it('is',function(){
			expect(theory.text.is('')).to.be(true);
			expect(theory.text.is('a')).to.be(true);
			expect(theory.text.is(false)).to.be(false);
			expect(theory.text.is(true)).to.be(false);
			expect(theory.text.is(0)).to.be(false);
			expect(theory.text.is(1)).to.be(false);
			expect(theory.text.is([])).to.be(false);
			expect(theory.text.is([1])).to.be(false);
			expect(theory.text.is({})).to.be(false);
			expect(theory.text.is({a:1})).to.be(false);
			expect(theory.text.is(function(){})).to.be(false);
		});
		it('ify',function(){
			expect(theory.text(0).ify()).to.be('0');
			expect(theory.text.ify(0)).to.be('0');
			expect(theory.text(22).ify()).to.be('22');
			expect(theory.text.ify(22)).to.be('22');
			expect(theory.text([true,33,'yay']).ify()).to.be('[true,33,"yay"]');
			expect(theory.text.ify([true,33,'yay'])).to.be('[true,33,"yay"]');
			expect(theory.text({a:0,b:'1',c:[0,'1'],d:{e:'f'}}).ify()).to.be('{"a":0,"b":"1","c":[0,"1"],"d":{"e":"f"}}');
			expect(theory.text.ify({a:0,b:'1',c:[0,'1'],d:{e:'f'}})).to.be('{"a":0,"b":"1","c":[0,"1"],"d":{"e":"f"}}');
			expect(theory.text(false).ify()).to.be('false');
			expect(theory.text.ify(false)).to.be('false');
			expect(theory.text(true).ify()).to.be('true');
			expect(theory.text.ify(true)).to.be('true');
		});
		it('random',function(){
			expect(theory.text.r().length).to.be(16);
			expect(theory.text(11).r().length).to.be(11);
			expect(theory.text.r(4).length).to.be(4);
			t.tr = theory.text.r(2,'as'); expect((t.tr=='as'||t.tr=='aa'||t.tr=='sa'||t.tr=='ss')).to.be.ok();
			t.tr = theory.text.random('as',2); expect((t.tr=='as'||t.tr=='aa'||t.tr=='sa'||t.tr=='ss')).to.be.ok();
			t.tr = theory.text(2).random('as'); expect((t.tr=='as'||t.tr=='aa'||t.tr=='sa'||t.tr=='ss')).to.be.ok();
			t.tr = theory.text('as').random(2); expect((t.tr=='as'||t.tr=='aa'||t.tr=='sa'||t.tr=='ss')).to.be.ok();
		});
		it('clip',function(){
			expect(theory.text('A B C D').clip(' ',0,-1)).to.be('A B C');
			expect(theory.text.clip('A B C D',' ',0,-1)).to.be('A B C');
			expect(theory.text("path/to/awesome.js").clip('.',-1)).to.be('js');
			expect(theory.text.clip("path/to/awesome.js",'.',-1)).to.be('js');
		});
		it('caps',function(){
			expect(theory.text("shout!").caps()).to.be("SHOUT!");
			expect(theory.text.caps("shout!")).to.be("SHOUT!");
		});
		it('low',function(){
			expect(theory.text("HUSH 1").low()).to.be("hush 1");
			expect(theory.text.low("HUSH 1")).to.be("hush 1");
		});
	});
	return "Hello World!";
});