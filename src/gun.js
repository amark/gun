function Gun(o){
	var gun = this;
	if(!Gun.is(gun)){ return new Gun(o) }
	if(Gun.is(o)){ return gun }
	return gun.opt(o);
}


Gun.version = 0.3;
		
Gun._ = { // some reserved key words, these are not the only ones.
	meta: '_' // all metadata of the node is stored in the meta property on the node.
	,soul: '#' // a soul is a UUID of a node but it always points to the "latest" data known.
	,field: '.' // a field is a property on a node which points to a value.
	,state: '>' // other than the soul, we store HAM metadata.
	,'#':'soul'
	,'.':'field'
	,'=':'value'
	,'>':'state'
}

// check to see if it is a GUN instance.
Gun.is = function(gun){ 
	return (gun instanceof Gun);
}

var root = this || {}; // safe for window, global, root, and 'use strict'.
root.console = root.console || {log: function(s){ return s }}; // safe for old browsers

if(typeof window !== "undefined"){ 
	root = window;
	window.Gun = Gun;
}
module.exports = Gun;


Gun.log = function(s){ 
	return (!Gun.log.squelch && root.console.log.apply(root.console, arguments)), s;
}
Gun.log.count = function(s){ return Gun.log.count[s] = Gun.log.count[s] || 0, Gun.log.count[s]++ }

/*
var console = {
	log: function(s){return root.console.log.apply(root.console, arguments), s},
	Log: Gun.log
};
console.debug = function(i, s){ return (Gun.log.debug && i === Gun.log.debug && Gun.log.debug++) && root.console.log.apply(root.console, arguments), s };
*/


/*
Gun.fn = require('./fn');
Gun.bi = require('./bi');
Gun.num = require('./num');
Gun.text = require('./text');
Gun.list = require('./list');
Gun.obj = require('./obj');
Gun.time = require('./time');
Gun.schedule = require('./schedule');

var on = require('./event');
Gun.on = on.create();
Gun.on.create = on.create;

Gun.HAM = require('./HAM');
require('./ify');

require('./node');
require('./union');

// chain!
Gun.chain = Gun.prototype;
require('./opt');
require('./chain');
require('./put');
require('./get');
require('./key');
require('./on');
require('./path');
require('./map');
require('./val');
require('./not');
require('./set');
require('./init');
*/