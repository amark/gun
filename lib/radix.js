var Gun = require('../gun');
var gbm = Gun.obj.map, no = {}, u;

function Radix(){
	var radix = function(key, val, t){
		t = t || radix._ || (radix._ = {});
		var i = 0, l = key.length-1, k = key[i], at, tmp;
		while(!(at = t[k]) && i < l){
			k += key[++i];
		}
		if(!at){
			if(!gbm(t, function(r, s){
				var ii = 0, kk = '';
				while(s[ii] == key[ii]){
					kk += s[ii++];
				}
				if(kk){
					if(u === val){ return (tmp || (tmp = {}))[s.slice(ii)] = r; }
					var _ = {};
					_[s.slice(ii)] = r;
					_[key.slice(ii)] = {$: val};
					t[kk] = {_: _};
					delete t[s];
					return true;
				}
			})){
				if(u === val){ return; }
				(t[k] || (t[k] = {})).$ = val;
			} else
			if(u === val){
				return tmp;
			}
		} else 
		if(i == l){
			if(u === val){ return (u === (tmp = at.$))? at._ : tmp }
			at.$ = val;
		} else {
			return radix(key.slice(++i), val, at._ || (at._ = {}));
		}
	}
	return radix;
};
;(function(){
	Radix.map = function map(radix, cb, opt, pre){ pre = pre || []; 
		var _ = radix._ || radix, keys = Object.keys(_).sort(), i = 0, l = keys.length;
		for(;i < l; i++){ var key = keys[i], tree = _[key], tmp;
			if(u !== (tmp = tree.$)){
				tmp = cb(tmp, pre.join('') + key, key, pre);
				if(u !== tmp){ return tmp }
			} else 
			if(opt){
				cb(u, pre.join(''), key, pre);
			}
			if(tmp = tree._){
				pre.push(key);
				tmp = map(tmp, cb, opt, pre);
				if(u !== tmp){ return tmp }
				pre.pop();
			}
		}
	};
	Object.keys = Object.keys || function(o){ return gbm(o, function(v,k,t){t(k)}) }
}());

module.exports = Radix;