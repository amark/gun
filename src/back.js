
var Gun = require('./root');
Gun.chain.back = function(n, opt){ var tmp;
	n = n || 1;
	if(-1 === n || Infinity === n){
		return this._.root.gun;
	} else
	if(1 === n){
		return (this._.back || this._).gun;
	}
	var gun = this, at = gun._;
	if(typeof n === 'string'){
		n = n.split('.');
	}
	if(n instanceof Array){
		var i = 0, l = n.length, tmp = at;
		for(i; i < l; i++){
			tmp = (tmp||empty)[n[i]];
		}
		if(u !== tmp){
			return opt? gun : tmp;
		} else
		if((tmp = at.back)){
			return tmp.gun.back(n, opt);
		}
		return;
	}
	if(n instanceof Function){
		var yes, tmp = {back: at};
		while((tmp = tmp.back)
		&& !(yes = n(tmp, opt))){}
		return yes;
	}
	if(Gun.num.is(n)){
		return (at.back || at).gun.back(n - 1);
	}
	return this;
}
var empty = {}, u;
	