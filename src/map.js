var Gun = require('./gun');

Gun.chain.map = function(cb, opt){
	var u, gun = this, chain = gun.chain();
	cb = cb || function(){}; cb.hash = {};
	opt = Gun.bi.is(opt)? {change: opt} : opt || {};
	opt.change = Gun.bi.is(opt.change)? opt.change : true;
	function path(err, val, field){
		if(err || (val === u)){ return }
		cb.call(this, val, field);
	}
	function each(val, field){
		//if(!Gun.is.rel(val)){ path.call(this.gun, null, val, field);return;}
		cb.hash[this.soul + field] = cb.hash[this.soul + field] || this.gun.path(field, path, {chain: chain, via: 'map'}); // TODO: path should reuse itself! We shouldn't have to do it ourselves.
		// TODO:
		// 1. Ability to turn off an event. // automatically happens within path since reusing is manual?
		// 2. Ability to pass chain context to fire on. // DONE
		// 3. Pseudoness handled for us. // DONE
		// 4. Reuse. // MANUALLY DONE
	}
	function map(at){
		var ref = gun.__.by(at.soul).chain || gun;
		Gun.is.node(at.change, each, {gun: ref, soul: at.soul});
	}
	gun.on(map, {raw: true, change: true}); // TODO: ALLOW USER TO DO map change false!
	if(gun === gun.back){ Gun.log('You have no context to `.map`!') }
	return chain;
}