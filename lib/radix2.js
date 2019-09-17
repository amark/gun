;(function(){

	function Radix(){
		var radix = function(key, val, t){
			key = ''+key;
			if(!t && u !== val){ 
				radix.last = (key < radix.last)? radix.last : key;
				delete (radix.$||{})[_];
			}
			t = t || radix.$ || (radix.$ = {});
			if(!key && Object.keys(t).length){ return t }
			var i = 0, l = key.length-1, k = key[i], at, tmp;
			while(!(at = t[k]) && i < l){
				k += key[++i];
			}
			radix.at = t; /// caching to external access.
			if(!at){
				if(!map(t, function(r, s){
					var ii = 0, kk = '';
					if((s||'').length){ while(s[ii] == key[ii]){
						kk += s[ii++];
					} }
					if(kk){
						if(u === val){
							if(ii <= l){ return }
							return (tmp || (tmp = {}))[s.slice(ii)] = r;
						}
						var __ = {};
						__[s.slice(ii)] = r;
						ii = key.slice(ii);
						('' === ii)? (__[''] = val) : ((__[ii] = {})[''] = val);
						t[kk] = __;
						delete t[s];
						return true;
					}
				})){
					if(u === val){ return; }
					(t[k] || (t[k] = {}))[''] = val;
				}
				if(u === val){
					return tmp;
				}
			} else 
			if(i == l){
				if(u === val){ return (u === (tmp = at['']))? at : tmp }
				at[''] = val;
			} else {
				if(u !== val){ delete at[_] }
				return radix(key.slice(++i), val, at || (at = {}));
			}
		}
		return radix;
	};

	Radix.map = function map(radix, cb, opt, pre){ pre = pre || [];
		var t = ('function' == typeof radix)? radix.$ || {} : radix;
		if(!t){ return }
		var keys = (t[_]||no).sort || (t[_] = function $(){ $.sort = Object.keys(t).sort(); return $ }()).sort;
		//var keys = Object.keys(t).sort();
		opt = (true === opt)? {branch: true} : (opt || {});
		if(opt.reverse){ keys = keys.slice().reverse() }
		var start = opt.start, end = opt.end;
		var i = 0, l = keys.length;
		for(;i < l; i++){ var key = keys[i], tree = t[key], tmp, p, pt;
			if(!tree || '' === key || _ === key){ continue }
			p = pre.slice(); p.push(key);
			pt = p.join('');
			if(u !== start && pt < (start||'').slice(0,pt.length)){ continue }
			if(u !== end && (end || '\uffff') < pt){ continue }
			if(u !== (tmp = tree[''])){
				tmp = cb(tmp, pt, key, pre);
				if(u !== tmp){ return tmp }
			} else
			if(opt.branch){
				tmp = cb(u, pt, key, pre);
				if(u !== tmp){ return tmp }
			}
			pre = p;
			tmp = map(tree, cb, opt, pre);
			if(u !== tmp){ return tmp }
			pre.pop();
		}
	};

	Object.keys = Object.keys || function(o){ return map(o, function(v,k,t){t(k)}) }

	if(typeof window !== "undefined"){
	  var Gun = window.Gun;
	  window.Radix = Radix;
	} else { 
	  var Gun = require('../gun');
		try{ module.exports = Radix }catch(e){}
	}
	
	var map = Gun.obj.map, no = {}, u;
	var _ = String.fromCharCode(24);
	
}());
