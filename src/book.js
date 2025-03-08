;(function(){

// TODO: BUG! Unbuild will make these globals... CHANGE unbuild to wrap files in a function.
// Book is a replacement for JS objects, maps, dictionaries.
var sT = setTimeout, B = sT.Book || (sT.Book = function(text){
	var b = function book(word, is){
		var has = b.all[word], p;
		if(is === undefined){ return (has && has.is) || b.get(has || word) }
		if(has){
			if(p = has.page){
				p.size += size(is) - size(has.is);
				p.text = '';
			}
			has.text = '';
			has.is = is;
			return b;
		}
		//b.all[word] = {is: word}; return b;
		return b.set(word, is);
	};
	// TODO: if from text, preserve the separator symbol.
	b.list = [{from: text, size: (text||'').length, substring: sub, toString: to, book: b, get: b, read: list}];
	b.page = page;
	b.set = set;
	b.get = get;
	b.all = {};
	return b;
}), PAGE = 2**12;

function page(word){
	var b = this, l = b.list, i = spot(word, l, b.parse), p = l[i];
	if('string' == typeof p){ l[i] = p = {size: -1, first: b.parse? b.parse(p) : p, substring: sub, toString: to, book: b, get: b, read: list} } // TODO: test, how do we arrive at this condition again?
	//p.i = i;
	return p;
	// TODO: BUG! What if we get the page, it turns out to be too big & split, we must then RE get the page!
}
function get(word){
	if(!word){ return }
	if(undefined !== word.is){ return word.is } // JS falsey values!
	var b = this, has = b.all[word];
	if(has){ return has.is }
	// get does an exact match, so we would have found it already, unless parseless page:
	var page = b.page(word), l, has, a, i;
	if(!page || !page.from){ return } // no parseless data
	return got(word, page);
}
function got(word, page){
	var b = page.book, l, has, a, i;
	if(l = from(page)){ has = l[got.i = i = spot(word, l, B.decode)]; } // TODO: POTENTIAL BUG! This assumes that each word on a page uses the same serializer/formatter/structure. // TOOD: BUG!!! Not actually, but if we want to do non-exact radix-like closest-word lookups on a page, we need to check limbo & potentially sort first.
	// parseless may return -1 from actual value, so we may need to test both. // TODO: Double check? I think this is correct.
	if(has && word == has.word){ return (b.all[word] = has).is }
	if('string' != typeof has){ has = l[got.i = i+=1] }
	if(has && word == has.word){ return (b.all[word] = has).is }
	a = slot(has) // Escape!
	if(word != B.decode(a[0])){
		has = l[got.i = i+=1]; // edge case bug?
		a = slot(has); // edge case bug?
		if(word != B.decode(a[0])){ return }
	}
	has = l[i] = b.all[word] = {word: ''+word, is: B.decode(a[1]), page: page, substring: subt, toString: tot}; // TODO: convert to a JS value!!! Maybe index! TODO: BUG word needs a page!!!! TODO: Check for other types!!!
	return has.is;
}

function spot(word, sorted, parse){ parse = parse || spot.no || (spot.no = function(t){ return t }); // TODO: BUG???? Why is there substring()||0 ? // TODO: PERF!!! .toString() is +33% faster, can we combine it with the export?
	var L = sorted, min = 0, page, found, l = (word=''+word).length, max = L.length, i = max/2;
	while(((word < (page = (parse(L[i=i>>0])||'').substring())) || ((parse(L[i+1])||'').substring() <= word)) && i != min){ // L[i] <= word < L[i+1]
		i += (page <= word)? (max - (min = i))/2 : -((max = i) - min)/2;
	}
	return i;
}

function from(a, t, l){
	if('string' != typeof a.from){ return a.from }
	//(l = a.from = (t = a.from||'').substring(1, t.length-1).split(t[0])); // slot
	(l = a.from = slot(t = t||a.from||''));
	return l;
}
function list(each){ each = each || function(x){return x} 
	var i = 0, l = sort(this), w, r = [], p = this.book.parse || function(){};
	//while(w = l[i++]){ r.push(each(slot(w)[1], p(w)||w, this)) }
	while(w = l[i++]){ r.push(each(this.get(w = w.word||p(w)||w), w, this)) } // TODO: BUG! PERF?
	return r;
}

function set(word, is){
	// TODO: Perf on random write is decent, but short keys or seq seems significantly slower.
	var b = this, has = b.all[word];
	if(has){ return b(word, is) } // updates to in-memory items will always match exactly.
	var page = b.page(word=''+word), tmp; // before we assume this is an insert tho, we need to check
	if(page && page.from){ // if it could be an update to an existing word from parseless.
		b.get(word);
		if(b.all[word]){ return b(word, is) }
	}
	// MUST be an insert:
	has = b.all[word] = {word: word, is: is, page: page, substring: subt, toString: tot};
	page.first = (page.first < word)? page.first : word;
	if(!page.limbo){ (page.limbo = []) }
	page.limbo.push(has);
	b(word, is);
	page.size += size(word) + size(is);
	if((b.PAGE || PAGE) < page.size){ split(page, b) }
	return b;
}

function split(p, b){ // TODO: use closest hash instead of half.
	//console.time();
	//var S = performance.now();
	var L = sort(p), l = L.length, i = l/2 >> 0, j = i, half = L[j], tmp;
	//console.timeEnd();
	var next = {first: half.substring(), size: 0, substring: sub, toString: to, book: b, get: b, read: list}, f = next.from = [];
	while(tmp = L[i++]){
		f.push(tmp);
		next.size += (tmp.is||'').length||1;
		tmp.page = next;
	}
	p.from = p.from.slice(0, j);
	p.size -= next.size;
	b.list.splice(spot(next.first, b.list)+1, 0, next); // TODO: BUG! Make sure next.first is decoded text. // TODO: BUG! spot may need parse too?
	//console.timeEnd();
	if(b.split){ b.split(next, p) }
	//console.log(S = (performance.now() - S), 'split');
	//console.BIG = console.BIG > S? console.BIG : S;
}

function slot(t){ return heal((t=t||'').substring(1, t.length-1).split(t[0]), t[0]) } B.slot = slot; // TODO: check first=last & pass `s`.
function heal(l, s){ var i, e;
	if(0 > (i = l.indexOf(''))){ return l } // ~700M ops/sec on 4KB of Math.random()s, even faster if escape does exist.
	if('' == l[0] && 1 == l.length){ return [] } // annoying edge cases! how much does this slow us down?
	//if((c=i+2+parseInt(l[i+1])) != c){ return [] } // maybe still faster than below?
	if((e=i+2+parseInt((e=l[i+1]).substring(0, e.indexOf('"'))||e)) != e){ return [] } // NaN check in JS is weird.
	l[i] = l.slice(i, e).join(s||'|'); // rejoin the escaped value
	return l.slice(0,i+1).concat(heal(l.slice(e), s)); // merge left with checked right.
}

function size(t){ return (t||'').length||1 } // bits/numbers less size? Bug or feature?
function subt(i,j){ return this.word }
//function tot(){ return this.text = this.text || "'"+(this.word)+"'"+(this.is)+"'" }
function tot(){ var tmp = {};
	//if((tmp = this.page) && tmp.saving){ delete tmp.book.all[this.word]; } // TODO: BUG! Book can't know about RAD, this was from RAD, so this MIGHT be correct but we need to refactor. Make sure to add tests that will re-trigger this.
	return this.text = this.text || ":"+B.encode(this.word)+":"+B.encode(this.is)+":";
	tmp[this.word] = this.is;
	return this.text = this.text || B.encode(tmp,'|',':').slice(1,-1);
	//return this.text = this.text || "'"+(this.word)+"'"+(this.is)+"'";
}
function sub(i,j){ return (this.first||this.word||B.decode((from(this)||'')[0]||'')).substring(i,j) }
function to(){ return this.text = this.text || text(this) }
function text(p){ // PERF: read->[*] : text->"*" no edit waste 1 time perf.
	if(p.limbo){ sort(p) } // TODO: BUG? Empty page meaning? undef, '', '||'?
	return ('string' == typeof p.from)? p.from : '|'+(p.from||[]).join('|')+'|';
}

function sort(p, l){
	var f = p.from = ('string' == typeof p.from)? slot(p.from) : p.from||[];
	if(!(l = l || p.limbo)){ return f }
	return mix(p).sort(function(a,b){
		return (a.word||B.decode(''+a)) < (b.word||B.decode(''+b))? -1:1;
	});
}
function mix(p, l){ // TODO: IMPROVE PERFORMANCE!!!! l[j] = i is 5X+ faster than .push(
	l = l || p.limbo || []; p.limbo = null;
	var j = 0, i, f = p.from;
	while(i = l[j++]){
		if(got(i.word, p)){
			f[got.i] = i; // TODO: Trick: allow for a GUN'S HAM CRDT hook here.
		} else {
			f.push(i); 
		}
	}
	return f;
}

B.encode = function(d, s, u){ s = s || "|"; u = u || String.fromCharCode(32);
	switch(typeof d){
		case 'string': // text
			var i = d.indexOf(s), c = 0;
			while(i != -1){ c++; i = d.indexOf(s, i+1) }
			return (c?s+c:'')+ '"' + d;
		case 'number': return (d < 0)? ''+d : '+'+d;
		case 'boolean': return d? '+' : '-';
		case 'object': if(!d){ return ' ' } // TODO: BUG!!! Nested objects don't slot correctly
			var l = Object.keys(d).sort(), i = 0, t = s, k, v;
			while(k = l[i++]){ t += u+B.encode(k,s,u)+u+B.encode(d[k],s,u)+u+s }
			return t;
	}
}
B.decode = function(t, s){ s = s || "|";
	if('string' != typeof t){ return }
	switch(t){ case ' ': return null; case '-': return false; case '+': return true; }
	switch(t[0]){
		case '-': case '+': return parseFloat(t);
		case '"': return t.slice(1);
	}
	return t.slice(t.indexOf('"')+1);
}

B.hash = function(s, c){ // via SO
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

function record(key, val){ return key+B.encode(val)+"%"+key.length }
function decord(t){
	var o = {}, i = t.lastIndexOf("%"), c = parseFloat(t.slice(i+1));
	o[t.slice(0,c)] = B.decode(t.slice(c,i));
	return o;
}

try{module.exports=B}catch(e){}
	
}());