
var Gun = require('./root');
Gun.chain.back = function(n, opt){ var tmp;
	if(-1 === n || Infinity === n){
		return this._.root;
	} else
	if(1 === n){
		return this._.back || this;
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
			return tmp.back(n, opt);
		}
		return;
	}
	if(n instanceof Function){
		var yes, tmp = {back: gun};
		while((tmp = tmp.back)
		&& (tmp = tmp._)
		&& !(yes = n(tmp, opt))){}
		return yes;
	}
}
var empty = {}, u;
	