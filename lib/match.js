var Type = require('../src/type');
function match(t, o){ var r = false;
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
module.exports = match;