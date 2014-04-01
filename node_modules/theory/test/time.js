describe('Time',function(){
	var t = {};
	it('is',function(){
		t.ts = theory.time.is();
		expect(13 <= t.ts.toString().length).to.be.ok();
	});
	it('now',function(){
		t.ts = theory.time.now();
		expect(15 <= t.ts.toString().length).to.be.ok();
	});
	it('loop',function(done){
		t.count = 0;
		t.loop = theory.time.loop(function(){
			if(t.count === 19){
				expect(theory.time.stop(t.loop)).to.be.ok();
				return done();
			} t.count++;
		},7);
	});
	it('wait',function(done){
		t.wait = theory.time.wait(function(){
			expect(true).to.be.ok();	
			done();
		},57);
	});
});
root.TimeFull = 'Time Travel';