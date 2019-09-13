
// Generic javascript utilities.
var Type = {};
//Type.fns = Type.fn = {is: function(fn){ return (!!fn && fn instanceof Function) }}
Type.fn = {is: function(fn){ return (!!fn && 'function' == typeof fn) }}
Type.bi = {is: function(b){ return (b instanceof Boolean || typeof b == 'boolean') }}
Type.num = {is: function(n){ return !list_is(n) && ((n - parseFloat(n) + 1) >= 0 || Infinity === n || -Infinity === n) }}
Type.text = {is: function(t){ return (typeof t == 'string') }}
Type.text.ify = function(t){
	if(Type.text.is(t)){ return t }
	if(typeof JSON !== "undefined"){ return JSON.stringify(t) }
	return (t && t.toString)? t.toString() : t;
}
Type.text.random = function(l, c){
	var s = '';
	l = l || 24; // you are not going to make a 0 length random number, so no need to check type
	c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
	while(l > 0){ s += c.charAt(Math.floor(Math.random() * c.length)); l-- }
	return s;
}
Type.text.match = function(t, o){ var tmp, u;
	if('string' !== typeof t){ return false }
	if('string' == typeof o){ o = {'=': o} }
	o = o || {};
	tmp = (o['='] || o['*'] || o['>'] || o['<']);
	if(t === tmp){ return true }
	if(u !== o['=']){ return false }
	tmp = (o['*'] || o['>'] || o['<']);
	if(t.slice(0, (tmp||'').length) === tmp){ return true }
	if(u !== o['*']){ return false }
	if(u !== o['>'] && u !== o['<']){
		return (t >= o['>'] && t <= o['<'])? true : false;
	}
	if(u !== o['>'] && t >= o['>']){ return true }
	if(u !== o['<'] && t <= o['<']){ return true }
	return false;
}
Type.list = {is: function(l){ return (l instanceof Array) }}
Type.list.slit = Array.prototype.slice;
Type.list.sort = function(k){ // creates a new sort function based off some key
	return function(A,B){
		if(!A || !B){ return 0 } A = A[k]; B = B[k];
		if(A < B){ return -1 }else if(A > B){ return 1 }
		else { return 0 }
	}
}
Type.list.map = function(l, c, _){ return obj_map(l, c, _) }
Type.list.index = 1; // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
Type.obj = {is: function(o){ return o? (o instanceof Object && o.constructor === Object) || Object.prototype.toString.call(o).match(/^\[object (\w+)\]$/)[1] === 'Object' : false }}
Type.obj.put = function(o, k, v){ return (o||{})[k] = v, o }
Type.obj.has = function(o, k){ return o && Object.prototype.hasOwnProperty.call(o, k) }
Type.obj.del = function(o, k){
	if(!o){ return }
	o[k] = null;
	delete o[k];
	return o;
}
Type.obj.as = function(o, k, v, u){ return o[k] = o[k] || (u === v? {} : v) }
Type.obj.ify = function(o){
	if(obj_is(o)){ return o }
	try{o = JSON.parse(o);
	}catch(e){o={}};
	return o;
}
;(function(){ var u;
	function map(v,k){
		if(obj_has(this,k) && u !== this[k]){ return }
		this[k] = v;
	}
	Type.obj.to = function(from, to){
		to = to || {};
		obj_map(from, map, to);
		return to;
	}
}());
Type.obj.copy = function(o){ // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
	return !o? o : JSON.parse(JSON.stringify(o)); // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
}
;(function(){
	function empty(v,i){ var n = this.n;
		if(n && (i === n || (obj_is(n) && obj_has(n, i)))){ return }
		if(i){ return true }
	}
	Type.obj.empty = function(o, n){
		if(!o){ return true }
		return obj_map(o,empty,{n:n})? false : true;
	}
}());
;(function(){
	function t(k,v){
		if(2 === arguments.length){
			t.r = t.r || {};
			t.r[k] = v;
			return;
		} t.r = t.r || [];
		t.r.push(k);
	};
	var keys = Object.keys, map;
	Object.keys = Object.keys || function(o){ return map(o, function(v,k,t){t(k)}) }
	Type.obj.map = map = function(l, c, _){
		var u, i = 0, x, r, ll, lle, f = fn_is(c);
		t.r = null;
		if(keys && obj_is(l)){
			ll = keys(l); lle = true;
		}
		if(list_is(l) || ll){
			x = (ll || l).length;
			for(;i < x; i++){
				var ii = (i + Type.list.index);
				if(f){
					r = lle? c.call(_ || this, l[ll[i]], ll[i], t) : c.call(_ || this, l[i], ii, t);
					if(r !== u){ return r }
				} else {
					//if(Type.test.is(c,l[i])){ return ii } // should implement deep equality testing!
					if(c === l[lle? ll[i] : i]){ return ll? ll[i] : ii } // use this for now
				}
			}
		} else {
			for(i in l){
				if(f){
					if(obj_has(l,i)){
						r = _? c.call(_, l[i], i, t) : c(l[i], i, t);
						if(r !== u){ return r }
					}
				} else {
					//if(a.test.is(c,l[i])){ return i } // should implement deep equality testing!
					if(c === l[i]){ return i } // use this for now
				}
			}
		}
		return f? t.r : Type.list.index? 0 : -1;
	}
}());
Type.time = {};
Type.time.is = function(t){ return t? t instanceof Date : (+new Date().getTime()) }

var fn_is = Type.fn.is;
var list_is = Type.list.is;
var obj = Type.obj, obj_is = obj.is, obj_has = obj.has, obj_map = obj.map;
module.exports = Type;
	