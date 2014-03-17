$(function(){
	/*
		Tests not finished!
		How does one automate testing of human input?
	*/
	describe('Start',function(){
		it('tests',function(){
			//return;
			var s = theory.shot({src: '/test/server.js'})
			, g = s.gun('gunjs.herokuapp.com/state.json');
			s.wait();
			var b = g({});
			var c = g({});
			b('name','Bob');
			c('name','Calvin');
			c('brother',b);
			s.go();
			console.log('first test done');
		});
	});
	(function run(){
		if(theory && theory.shot){
			return mocha.run();
		}
		theory.time.wait(run,10);
	})();
});