// Objects

var fn = require('./fn');
var list = require('./list');

var obj = {
	is: function(o) { 
		return !o || !o.constructor? false
		: o.constructor === Object? true 
			: (!o.constructor.call 
				|| o.constructor.toString().match(/\[native\ code\]/))
				? false : true;
	}
}

obj.put = function(o, f, v){ 
	return (o||{})[f] = v, o;
}

obj.del = function(o, k){
	if(!o){ return }
	o[k] = null;
	delete o[k];
	return true;
}

obj.ify = function(o){
	if(obj.is(o)){ return o }
	try{o = JSON.parse(o);
	}catch(e){o={}};
	return o;
}

// because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2 . It is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
obj.copy = function(o){
	return !o? o : JSON.parse(JSON.stringify(o));
}

obj.as = function(b, f, d){ 
	return b[f] = b[f] || (arguments.length >= 3? d : {});
}

obj.has = function(o, t){ 
	return o && Object.prototype.hasOwnProperty.call(o, t);
}

obj.empty = function(o, n){
	if(!o){ return true }
	return obj.map(o,function(v,i){
		if(n && (i === n || (obj.is(n) && obj.has(n, i)))){ return }
		if(i){ return true }
	})? false : true;
}

obj.map = function(l, c, _){
	var u, i = 0, ii = 0, x, r, rr, ll, lle, f = fn.is(c),
	t = function(k,v){
		if(2 === arguments.length){
			rr = rr || {};
			rr[k] = v;
			return;
		} rr = rr || [];
		rr.push(k);
	};
	if(Object.keys && obj.is(l)){
		ll = Object.keys(l); lle = true;
	}
	if(list.is(l) || ll){
		x = (ll || l).length;
		for(;i < x; i++){
			ii = (i + list.index);
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
				if(obj.has(l,i)){
					r = _? c.call(_, l[i], i, t) : c(l[i], i, t);
					if(r !== u){ return r }
				}
			} else {
				//if(a.test.is(c,l[i])){ return i } // should implement deep equality testing!
				if(c === l[i]){ return i } // use this for now
			}
		}
	}
	return f? rr : list.index? 0 : -1;
}

module.exports = obj;