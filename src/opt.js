var Gun = require('./gun');

Gun.chain.opt = function(opt, stun){
	opt = opt || {};
	var gun = this, root = (gun.__ && gun.__.gun)? gun.__.gun : (gun._ = gun.__ = {gun: gun}).gun.chain(); // if root does not exist, then create a root chain.
	root.__.by = root.__.by || function(f){ return gun.__.by[f] = gun.__.by[f] || {} };
	root.__.graph = root.__.graph || {};
	root.__.opt = root.__.opt || {};
	root.__.opt.wire = root.__.opt.wire || {};
	if(Gun.text.is(opt)){ opt = {peers: opt} }
	if(Gun.list.is(opt)){ opt = {peers: opt} }
	if(Gun.text.is(opt.peers)){ opt.peers = [opt.peers] }
	if(Gun.list.is(opt.peers)){ opt.peers = Gun.obj.map(opt.peers, function(n,f,m){ m(n,{}) }) }
	root.__.opt.peers = opt.peers || gun.__.opt.peers || {};
	Gun.obj.map(opt.wire, function(h, f){
		if(!Gun.fns.is(h)){ return }
		root.__.opt.wire[f] = h;
	});
	Gun.obj.map(['key', 'on', 'path', 'map', 'not', 'init'], function(f){
		if(!opt[f]){ return }
		root.__.opt[f] = opt[f] || root.__.opt[f];
	});
	if(!stun){ Gun.on('opt').emit(root, opt) }
	return gun;
}