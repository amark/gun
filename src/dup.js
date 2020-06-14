
var Type = require('./type');
function Dup(opt){
	var dup = {s:{}}, s = dup.s;
	opt = opt || {max: 1000, age: /*1000 * 9};//*/ 1000 * 9 * 3};
	dup.check = function(id){
		if(!s[id]){ return false }
		return dt(id);
	}
	var dt = dup.track = function(id){
		var it = s[id] || (s[id] = {});
		it.was = +new Date;
		if(!dup.to){ dup.to = setTimeout(dup.drop, opt.age + 9) }
		return it;
	}
	dup.drop = function(age){
		var now = +new Date;
		Type.obj.map(s, function(it, id){
			if(it && (age || opt.age) > (now - it.was)){ return }
			delete s[id];
		});
		dup.to = null;
		console.STAT && (age = +new Date - now) > 9 && console.STAT(now, age, 'dup drop');
	}
	return dup;
}
module.exports = Dup;
	