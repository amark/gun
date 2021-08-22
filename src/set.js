
var Gun = require('./index');
Gun.chain.set = function(item, cb, opt){
	var gun = this, root = gun.back(-1), soul, tmp;
	cb = cb || function(){};
	opt = opt || {}; opt.item = opt.item || item;
	if(soul = ((item||'')._||'')['#']){ (item = {})['#'] = soul } // check if node, make link.
	if('string' == typeof (tmp = Gun.valid(item))){ return gun.get(soul = tmp).put(item, cb, opt) } // check if link
	if(!Gun.is(item)){
		if(Object.plain(item)){
			item = root.get(soul = gun.back('opt.uuid')()).put(item);
		}
		return gun.get(soul || root.back('opt.uuid')(7)).put(item, cb, opt);
	}
	gun.put(function(go){
		item.get(function(soul, o, msg){ // TODO: BUG! We no longer have this option? & go error not handled?
			if(!soul){ return cb.call(gun, {err: Gun.log('Only a node can be linked! Not "' + msg.put + '"!')}) }
			(tmp = {})[soul] = {'#': soul}; go(tmp);
		},true);
	})
	return item;
}
	