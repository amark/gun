if(typeof window !== "undefined"){
  var Gun = window.Gun;
} else { 
  var Gun = require('gun/gun');
}

Gun.chain.path = function(field, cb, opt){
	var back = this, gun = back, tmp;
	opt = opt || {}; opt.path = true;
	if(gun === gun._.root){if(cb){cb({err: Gun.log("Can't do that on root instance.")})}return gun}
	if(typeof field === 'string'){
		tmp = field.split(opt.split || '.');
		if(1 === tmp.length){
			gun = back.get(field, cb, opt);
			gun._.opt = opt;
			return gun;
		}
		field = tmp;
	}
	if(field instanceof Array){
		if(field.length > 1){
			gun = back;
			var i = 0, l = field.length;
			for(i; i < l; i++){
				gun = gun.get(field[i], (i+1 === l)? cb : null, opt);
			}
			//gun.back = back; // TODO: API change!
		} else {
			gun = back.get(field[0], cb, opt);
		}
		gun._.opt = opt;
		return gun;
	}
	if(!field && 0 != field){
		return back;
	}
	gun = back.get(''+field, cb, opt);
	gun._.opt = opt;
	return gun;
}