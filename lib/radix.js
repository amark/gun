var Gun = require('../gun');
;(function(){
	var map = Gun.obj.map, no = {}, u;

	var $ = String.fromCharCode(30), _ = String.fromCharCode(29);

	function Radix(){
		var radix = function(key, val, t){
			t = t || radix[_] || (radix[_] = {});
			var i = 0, l = key.length-1, k = key[i], at, tmp;
			while(!(at = t[k]) && i < l){
				k += key[++i];
			}
			if(!at){
				if(!map(t, function(r, s){
					var ii = 0, kk = '';
					while(s[ii] == key[ii]){
						kk += s[ii++];
					}
					if(kk){
						if(u === val){
							if(ii <= l){ return }
							return (tmp || (tmp = {}))[s.slice(ii)] = r;
						}
						var __ = {};
						__[s.slice(ii)] = r;
						(__[key.slice(ii)] = {})[$] = val;
						(t[kk] = {})[_] = __;
						delete t[s];
						return true;
					}
				})){
					if(u === val){ return; }
					(t[k] || (t[k] = {}))[$] = val;
				}
				if(u === val){
					return tmp;
				}
			} else 
			if(i == l){
				if(u === val){ return (u === (tmp = at[$]))? at[_] : tmp }
				at[$] = val;
			} else {
				return radix(key.slice(++i), val, at[_] || (at[_] = {}));
			}
		}
		return radix;
	};
	Radix.map = function map(radix, cb, opt, pre){ pre = pre || []; 
		var t = radix[_] || radix, keys = Object.keys(t).sort(), i = 0, l = keys.length;
		for(;i < l; i++){ var key = keys[i], tree = t[key], tmp;
			if(u !== (tmp = tree[$])){
				tmp = cb(tmp, pre.join('') + key, key, pre);
				if(u !== tmp){ return tmp }
			} else 
			if(opt){
				cb(u, pre.join(''), key, pre);
			}
			if(tmp = tree[_]){
				pre.push(key);
				tmp = map(tmp, cb, opt, pre);
				if(u !== tmp){ return tmp }
				pre.pop();
			}
		}
	};
	Object.keys = Object.keys || function(o){ return map(o, function(v,k,t){t(k)}) }
	
	module.exports = Radix;
}());
