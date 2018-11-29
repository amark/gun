
var Type = require('./type');
function Dup(opt){
	var dup = {s:{}};
	opt = opt || {max: 1000, age: 1000 * 9};//1000 * 60 * 2};
	dup.check = function(id){ var tmp;
		if(!(tmp = dup.s[id])){ return false }
		if(tmp.pass){ return tmp.pass = false }
		return dup.track(id);
	}
	dup.track = function(id, pass){
		var it = dup.s[id] || (dup.s[id] = {});
		it.was = time_is();
		if(pass){ it.pass = true }
		if(!dup.to){
			dup.to = setTimeout(function(){
				var now = time_is();
				Type.obj.map(dup.s, function(it, id){
					if(it && opt.age > (now - it.was)){ return }
					Type.obj.del(dup.s, id);
				});
				dup.to = null;
			}, opt.age + 9);
		}
		return it;
	}
	return dup;
}
var time_is = Type.time.is;
module.exports = Dup;
	