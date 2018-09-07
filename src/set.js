
var Gun = require('./index');
Gun.chain.set = function(item, cb, opt){
	var gun = this, soul;
	cb = cb || function(){};
	opt = opt || {}; opt.item = opt.item || item;
	if(soul = Gun.node.soul(item)){ return gun.set(gun.back(-1).get(soul), cb, opt) }
	if(!Gun.is(item)){
		var id = gun.back('opt.uuid')();
		if(id && Gun.obj.is(item)){
			return gun.set(gun._.root.$.put(item, id), cb, opt);
		}
		return gun.get((Gun.state.lex() + Gun.text.random(7))).put(item, cb, opt);
	}
	item.get(function(soul, o, msg){
		if(!soul){ return cb.call(gun, {err: Gun.log('Only a node can be linked! Not "' + msg.put + '"!')}) }
		gun.put(Gun.obj.put({}, soul, Gun.val.link.ify(soul)), cb, opt);
	},true);
	return item;
}
	