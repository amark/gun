
// Generic javascript utilities.
var Type = {};
//Type.fns = Type.fn = {is: function(fn){ return (!!fn && fn instanceof Function) }}
Type.fns = Type.fn = {is: function(fn){ return (!!fn && 'function' == typeof fn) }}
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
Type.text.match = function(t, o){ var r = false;
	t = t || '';
	o = Type.text.is(o)? {'=': o} : o || {}; // {'~', '=', '*', '<', '>', '+', '-', '?', '!'} // ignore case, exactly equal, anything after, lexically larger, lexically lesser, added in, subtacted from, questionable fuzzy match, and ends with.
	if(Type.obj.has(o,'~')){ t = t.toLowerCase(); o['='] = (o['='] || o['~']).toLowerCase() }
	if(Type.obj.has(o,'=')){ return t === o['='] }
	if(Type.obj.has(o,'*')){ if(t.slice(0, o['*'].length) === o['*']){ r = true; t = t.slice(o['*'].length) } else { return false }}
	if(Type.obj.has(o,'!')){ if(t.slice(-o['!'].length) === o['!']){ r = true } else { return false }}
	if(Type.obj.has(o,'+')){
		if(Type.list.map(Type.list.is(o['+'])? o['+'] : [o['+']], function(m){
			if(t.indexOf(m) >= 0){ r = true } else { return true }
		})){ return false }
	}
	if(Type.obj.has(o,'-')){
		if(Type.list.map(Type.list.is(o['-'])? o['-'] : [o['-']], function(m){
			if(t.indexOf(m) < 0){ r = true } else { return true }
		})){ return false }
	}
	if(Type.obj.has(o,'>')){ if(t > o['>']){ r = true } else { return false }}
	if(Type.obj.has(o,'<')){ if(t < o['<']){ r = true } else { return false }}
	function fuzzy(t,f){ var n = -1, i = 0, c; for(;c = f[i++];){ if(!~(n = t.indexOf(c, n+1))){ return false }} return true } // via http://stackoverflow.com/questions/9206013/javascript-fuzzy-search
	if(Type.obj.has(o,'?')){ if(fuzzy(t, o['?'])){ r = true } else { return false }} // change name!
	return r;
}
Type.list = {is: function(l){ return (l instanceof Array) }}
Type.list.slit = Array.prototype.slice;
Type.list.sort = function(k){ // creates a new sort function based off some field
	return function(A,B){
		if(!A || !B){ return 0 } A = A[k]; B = B[k];
		if(A < B){ return -1 }else if(A > B){ return 1 }
		else { return 0 }
	}
}
Type.list.map = function(l, c, _){ return obj_map(l, c, _) }
Type.list.index = 1; // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
Type.obj = {is: function(o){ return o? (o instanceof Object && o.constructor === Object) || Object.prototype.toString.call(o).match(/^\[object (\w+)\]$/)[1] === 'Object' : false }}
Type.obj.put = function(o, f, v){ return (o||{})[f] = v, o }
Type.obj.has = function(o, f){ return o && Object.prototype.hasOwnProperty.call(o, f) }
Type.obj.del = function(o, k){
	if(!o){ return }
	o[k] = null;
	delete o[k];
	return o;
}
Type.obj.as = function(o, f, v, u){ return o[f] = o[f] || (u === v? {} : v) }
Type.obj.ify = function(o){
	if(obj_is(o)){ return o }
	try{o = JSON.parse(o);
	}catch(e){o={}};
	return o;
}
;(function(){ var u;
	function map(v,f){
		if(obj_has(this,f) && u !== this[f]){ return }
		this[f] = v;
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
	var keys = Object.keys;
	Type.obj.map = function(l, c, _){
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
	