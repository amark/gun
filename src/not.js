var Gun = require('./gun');

Gun.chain.not = function(cb, opt){
	var gun = this, chain = gun.chain();
	cb = cb || function(){};
	opt = opt || {};
	function not(at,e){
		if(at.field){
			if(Gun.obj.has(gun.__.by(at.soul).node, at.field)){ return Gun.obj.del(at, 'not'), chain._.at(e).emit(at) }
		} else
		if(at.soul && gun.__.by(at.soul).node){ return Gun.obj.del(at, 'not'), chain._.at(e).emit(at) }
		if(!at.not){ return }
		var kick = function(next){
			if(++kick.c){ return Gun.log("Warning! Multiple `not` resumes!"); }
			next._.at.all(function(on ,e){ // TODO: BUG? Switch back to .at? I think .on is actually correct so it doesn't memorize. // TODO: BUG! What about other events?
				chain._.at(e).emit(on); 
			});
		};
		kick.c = -1
		kick.chain = gun.chain();
		kick.next = cb.call(kick.chain, opt.raw? at : (at.field || at.soul || at.not), kick);
		kick.soul = Gun.text.random();
		if(Gun.is(kick.next)){ kick(kick.next) }
		kick.chain._.at('soul').emit({soul: kick.soul, field: at.field, not: true, via: 'not'});
	}
	gun._.at.all(not);
	if(gun === gun.back){ Gun.log('You have no context to `.not`!') }
	chain._.not = true; // TODO: CLEAN UP! Would be ideal if we could accomplish this in a more elegant way.
	return chain;
}