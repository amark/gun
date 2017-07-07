
var Gun = require('./index');
Gun.chain.set = function(item, cb, opt){
	var gun = this, soul;
	cb = cb || function(){};
	if(soul = Gun.node.soul(item)){ return gun.set(gun.back(-1).get(soul), cb, opt) }
	if(!Gun.is(item)){
		if(Gun.obj.is(item)){ return gun.set(gun._.root.put(item), cb, opt) }
		return gun.get(gun._.root._.opt.uuid()).put(item);
	}
	item.get('_').get(function(at, ev){
		if(!at.gun || !at.gun._.back){ return }
		ev.off();
		at = (at.gun._.back._);
		var put = {}, node = at.put, soul = Gun.node.soul(node);
		if(!soul){ return cb.call(gun, {err: Gun.log('Only a node can be linked! Not "' + node + '"!')}) }
		gun.put(Gun.obj.put(put, soul, Gun.val.rel.ify(soul)), cb, opt);
	},{wait:0});
	return item;
}
	