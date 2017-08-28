
var Type = require('./type');
function Dup(opt){
	var dup = {s:{}};
	opt = opt || {max: 1000, age: 1000 * 9};//1000 * 60 * 2};
	dup.check = function(id){
		return dup.s[id]? dup.track(id) : false;
	}
	dup.track = function(id){
		dup.s[id] = time_is();
		if(!dup.to){
			dup.to = setTimeout(function(){
				Type.obj.map(dup.s, function(time, id){
					if(opt.age > (time_is() - time)){ return }
					Type.obj.del(dup.s, id);
				});
				dup.to = null;
			}, opt.age);
		}
		return id;
	}
	return dup;
}
var time_is = Type.time.is;
module.exports = Dup;
	