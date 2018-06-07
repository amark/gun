
var Gun = require('./index');
Gun.chain.set = function(item, cb, opt){
	var gun = this, soul;
	cb = cb || function(){};
	opt = opt || {}; opt.item = opt.item || item;
	if(soul = Gun.node.soul(item)){ return gun.set(gun.back(-1).get(soul), cb, opt) }
	if(!Gun.is(item)){
		var id = gun.back('opt.uuid')();
		if(id && Gun.obj.is(item)){
			return gun.set(gun._.root.gun.put(item, id), cb, opt);
		}
		return gun.get((Gun.state.lex() + Gun.text.random(7))).put(item, cb, opt);
	}
	item.get('_').get(function(at, ev){
		if(!at.gun || !at.gun._.back){ return }
		ev.off();
		var soul = (at.put||{})['#'];
		at = (at.gun._.back);
		var put = {}, node = at.put;
		soul = at.soul || Gun.node.soul(node) || soul;
		if(!soul){ return cb.call(gun, {err: Gun.log('Only a node can be linked! Not "' + node + '"!')}) }
		gun.put(Gun.obj.put(put, soul, Gun.val.rel.ify(soul)), cb, opt);
	},{wait:0});
	return item;
}
	