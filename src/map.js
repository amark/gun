
var Gun = require('./index'), next = Gun.chain.get.next;
Gun.chain.get.next = function(gun, lex){ var tmp;
	if(!Object.plain(lex)){ return (next||noop)(gun, lex) }
	if(tmp = ((tmp = lex['#'])||'')['='] || tmp){ return gun.get(tmp) }
	(tmp = gun.chain()._).lex = lex; // LEX!
	gun.on('in', function(eve){
		if(String.match(eve.get|| (eve.put||'')['.'], lex['.'] || lex['#'] || lex)){
			tmp.on('in', eve);
		}
		this.to.next(eve);
	});
	return tmp.$;
}
Gun.chain.map = function(cb, opt, t){
	var gun = this, cat = gun._, lex, chain;
	if(Object.plain(cb)){ lex = cb['.']? cb : {'.': cb}; cb = u }
	if(!cb){
		if(chain = cat.each){ return chain }
		(cat.each = chain = gun.chain())._.lex = lex || chain._.lex || cat.lex;
		chain._.nix = gun.back('nix');
		gun.on('in', map, chain._);
		return chain;
	}
	Gun.log.once("mapfn", "Map functions are experimental, their behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
	chain = gun.chain();
	gun.map().on(function(data, key, msg, eve){
		var next = (cb||noop).call(this, data, key, msg, eve);
		if(u === next){ return }
		if(data === next){ return chain._.on('in', msg) }
		if(Gun.is(next)){ return chain._.on('in', next._) }
		var tmp = {}; Object.keys(msg.put).forEach(function(k){ tmp[k] = msg.put[k] }, tmp); tmp['='] = next; 
		chain._.on('in', {get: key, put: tmp});
	});
	return chain;
}
function map(msg){ this.to.next(msg);
	var cat = this.as, gun = msg.$, at = gun._, put = msg.put, tmp;
	if(!at.soul && !msg.$$){ return } // this line took hundreds of tries to figure out. It only works if core checks to filter out above chains during link tho. This says "only bother to map on a node" for this layer of the chain. If something is not a node, map should not work.
	if((tmp = cat.lex) && !String.match(msg.get|| (put||'')['.'], tmp['.'] || tmp['#'] || tmp)){ return }
	Gun.on.link(msg, cat);
}
var noop = function(){}, event = {stun: noop, off: noop}, u;
	