
require('./shim');
function Dup(opt){
	var dup = {s:{}}, s = dup.s;
	opt = opt || {max: 999, age: 1000 * 9};//*/ 1000 * 9 * 3};
	dup.check = function(id){
		if(!s[id]){ return false }
		return dt(id);
	}
	var dt = dup.track = function(id){
		var it = s[id] || (s[id] = {});
		it.was = dup.now = +new Date;
		if(!dup.to){ dup.to = setTimeout(dup.drop, opt.age + 9) }
		return it;
	}
	dup.drop = function(age){
		dup.to = null;
		dup.now = +new Date;
		var l = Object.keys(s);
		console.STAT && console.STAT(dup.now, +new Date - dup.now, 'dup drop keys'); // prev ~20% CPU 7% RAM 300MB // now ~25% CPU 7% RAM 500MB
		setTimeout.each(l, function(id){ var it = s[id]; // TODO: .keys( is slow?
			if(it && (age || opt.age) > (dup.now - it.was)){ return }
			delete s[id];
		},0,99);
	}
	return dup;
}
module.exports = Dup;
	