
// Shim for generic javascript utilities.
String.random = function(l, c){
	var s = '';
	l = l || 24; // you are not going to make a 0 length random number, so no need to check type
	c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
	while(l-- > 0){ s += c.charAt(Math.floor(Math.random() * c.length)) }
	return s;
}
String.match = function(t, o){ var tmp, u;
	if('string' !== typeof t){ return false }
	if('string' == typeof o){ o = {'=': o} }
	o = o || {};
	tmp = (o['='] || o['*'] || o['>'] || o['<']);
	if(t === tmp){ return true }
	if(u !== o['=']){ return false }
	tmp = (o['*'] || o['>']);
	if(t.slice(0, (tmp||'').length) === tmp){ return true }
	if(u !== o['*']){ return false }
	if(u !== o['>'] && u !== o['<']){
		return (t >= o['>'] && t <= o['<'])? true : false;
	}
	if(u !== o['>'] && t >= o['>']){ return true }
	if(u !== o['<'] && t <= o['<']){ return true }
	return false;
}
String.hash = function(s, c){ // via SO
	if(typeof s !== 'string'){ return }
	    c = c || 0; // CPU schedule hashing by
	    if(!s.length){ return c }
	    for(var i=0,l=s.length,n; i<l; ++i){
	      n = s.charCodeAt(i);
	      c = ((c<<5)-c)+n;
	      c |= 0;
	    }
	    return c;
	  }
var has = Object.prototype.hasOwnProperty;
Object.plain = function(o){ return o? (o instanceof Object && o.constructor === Object) || Object.prototype.toString.call(o).match(/^\[object (\w+)\]$/)[1] === 'Object' : false }
Object.empty = function(o, n){
	for(var k in o){ if(has.call(o, k) && (!n || -1==n.indexOf(k))){ return false } }
	return true;
}
Object.keys = Object.keys || function(o){
	var l = [];
	for(var k in o){ if(has.call(o, k)){ l.push(k) } }
	return l;
}
;(function(){ // max ~1ms or before stack overflow 
	var u, sT = setTimeout, l = 0, c = 0, sI = (typeof setImmediate !== ''+u && setImmediate) || sT; // queueMicrotask faster but blocks UI
	sT.poll = sT.poll || function(f){ //f(); return; // for testing
		if((1 >= (+new Date - l)) && c++ < 3333){ f(); return }
		sI(function(){ l = +new Date; f() },c=0)
	}
}());
;(function(){ // Too many polls block, this "threads" them in turns over a single thread in time.
	var sT = setTimeout, t = sT.turn = sT.turn || function(f){ 1 == s.push(f) && p(T) }
	, s = t.s = [], p = sT.poll, i = 0, f, T = function(){
		if(f = s[i++]){ f() }
		if(i == s.length || 99 == i){
			s = t.s = s.slice(i);
			i = 0;
		}
		if(s.length){ p(T) }
	}
}());
;(function(){
	var u, sT = setTimeout, T = sT.turn;
	(sT.each = sT.each || function(l,f,e,S){ S = S || 9; (function t(s,L,r){
	  if(L = (s = (l||[]).splice(0,S)).length){
	  	for(var i = 0; i < L; i++){
	  		if(u !== (r = f(s[i]))){ break }
	  	}
	  	if(u === r){ T(t); return }
	  } e && e(r);
	}())})();
}());
	