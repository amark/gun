
var Gun = require('./index');
Gun.chain.set = function(item, cb, opt){
	var gun = this, soul;
	cb = cb || function(){};
	opt = opt || {}; opt.item = opt.item || item;
	if(soul = Gun.node.soul(item)){ item = Gun.obj.put({}, soul, Gun.val.link.ify(soul)) }
	if(!Gun.is(item)){
		if(Gun.obj.is(item)){;
			item = gun.back(-1).get(soul = soul || Gun.node.soul(item) || gun.back('opt.uuid')()).put(item);
		}
		return gun.get(soul || (Gun.state.lex() + Gun.text.random(7))).put(item, cb, opt);
	}
	item.get(function(soul, o, msg){
		if(!soul){ return cb.call(gun, {err: Gun.log('Only a node can be linked! Not "' + msg.put + '"!')}) }
		gun.put(Gun.obj.put({}, soul, Gun.val.link.ify(soul)), cb, opt);
	},true);
	return item;
}
	