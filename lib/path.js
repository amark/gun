var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

Gun.chain.path = function(field, opt){
	var back = this, gun = back, tmp;
	if(typeof field === 'string'){
		tmp = field.split(opt || '.');
		if(1 === tmp.length){
			gun = back.get(field);
			return gun;
		}
		field = tmp;
	}
	if(field instanceof Array){
		if(field.length > 1){
			gun = back;
			var i = 0, l = field.length;
			for(i; i < l; i++){
				//gun = gun.get(field[i], (i+1 === l)? cb : null, opt);
				gun = gun.get(field[i]);
			}
		} else {
			gun = back.get(field[0]);
		}
		return gun;
	}
	if(!field && 0 != field){
		return back;
	}
	gun = back.get(''+field);
	return gun;
}