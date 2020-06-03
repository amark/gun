
var Gun = require('./index');
Gun.chain.set = function(item, cb, opt){
	var gun = this, soul;
	cb = cb || function(){};
	opt = opt || {}; opt.item = opt.item || item;
	if(soul = Gun.node.soul(item)){ item = Gun.obj.put({}, soul, Gun.val.link.ify(soul)) }
	if(!Gun.is(item)){
		if(Gun.obj.is(item)){
			//item = gun.back(-1).get(soul = soul || Gun.node.soul(item) || (gun.back('opt.uuid') || uuid)()).put(item);
			soul = soul || Gun.node.soul(item) || uuid(); // this just key now, not a soul.
		}
		return gun.get(soul || uuid()).put(item, cb, opt);
	}
	item.get(function(soul, o, msg){
		if(!soul && item._.stun){ item._.on('res', function(){ this.off(); gun.set(item, cb, opt) }); return }
		if(!soul){ return cb.call(gun, {err: Gun.log('Only a node can be linked! Not "' + msg.put + '"!')}) }
		gun.put(Gun.obj.put({}, soul, Gun.val.link.ify(soul)), cb, opt);
	},true);
	return item;
}
function uuid(){ return Gun.state.lex() + Gun.text.random(7) }
	