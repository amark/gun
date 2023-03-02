;(function(){ // Book
console.log("Warning: Book is in alpha!");
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
	b.list = [{from: text, size: (text||'').length, substring: sub, toString: to, book: b, get: b}];
	b.page = page;
	b.set = set;
	b.get = get;
	b.all = {};
	return b;
}), PAGE = 2**12;

function page(word){
	var b = this, l = b.list, i = spot(B.encode(word), l), p = l[i];
	if('string' == typeof p){ l[i] = p = {size: -1, first: p, substring: sub, toString: to, book: b, get: b} } // TODO: test, how do we arrive at this condition again?
	p.i = i;
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
	if(l = from(page)){ subt.f=1; has = l[i = spot(B.encode(word), l)]; subt.f=0; } // because parseless data is encoded we need to make sure the word is encoded also, but because parseless data incrementally parses we need to set a flag on subt shim to indicate which parseless or not state we're in.
	// parseless may return -1 from actual value, so we may need to test both.
	if(has && word == has.word){ return (b.all[word] = has).is }
	if('string' != typeof has){ has = l[i+=1] }
	if(has && word == has.word){ return (b.all[word] = has).is }
	a = slot(has) // Escape!
	if(word != a[0]){
		has = l[i+=1]; // edge case bug?
		a = slot(has) // edge case bug?
		if(word != a[0]){ return }
	}
	has = l[i] = b.all[word] = {word: word, is: a[1], page: page, substring: subt, toString: tot}; // TODO: convert to a JS value!!! Maybe index! TODO: BUG word needs a page!!!! TODO: Check for other types!!!
	return has.is;
}
function spot(word, sorted){
	var L = sorted, min = 0, page, found, l = word.length, max = L.length, i = max/2;
	while((word < (page = (L[i=i>>0]||'').substring()) || ((L[i+1]||'').substring()||0) <= word) && i != min){ // L[i] <= word < L[i+1]
		i += (page < word)? (max - (min = i))/2 : -((max = i) - min)/2;
	}
	return i; 
}

function from(a, t, l){
	if('string' != typeof a.from){ return a.from }
	(l = a.from = (t = a.from||'').substring(1, t.length-1).split(t[0])).toString = join; // slot
	return l;
}

function set(word, is){
	var b = this, has = b.all[word];
	if(has){ return b(word, is) } // updates to in-memory items will always match exactly.
	var page = b.page(word), tmp; // before we assume this is an insert tho, we need to check
	if(page && page.from){ // if it could be an update to an existing word from parseless.
		b.get(word);
		if(b.all[word]){ return b(word, is) }
	}
	// MUST be an insert:
	has = b.all[word] = {word: word, is: is, page: page, substring: subt, toString: tot};
	page.first = (page.first < (tmp = B.encode(word)))? page.first : tmp; 
	if(!page.list){ (page.list = []).toString = join }
	page.list.push(has);
	page.sort = 1;
	b(word, is);
	page.size += size(word) + size(is);
	if((b.PAGE || PAGE) < page.size){ split(page, b) }
	return b;
}

function split(p, b){
	//console.time();
	var L = p.list = p.list.sort(), l = L.length, i = l/2 >> 0, j = i, half = L[j], tmp;
	//console.timeEnd();
	var next = {list: [], first: B.encode(half.substring()), size: 0, substring: sub, toString: to, book: b, get: b}, nl = next.list;
	nl.toString = join;
	//console.time();
	while(tmp = L[i++]){
		nl.push(tmp);
		next.size += (tmp.is||'').length||1;
		tmp.page = next;
	}
	//console.timeEnd();
	//console.time();
	p.list = p.list.slice(0, j);
	p.size -= next.size;
	p.sort = 0;
	b.list.splice(spot(next.first, b.list)+1, 0, next);
	//console.timeEnd();
	if(b.split){ b.split(next, p) }
}

function slot(t){ return (t=t||'').substring(1, t.length-1).split(t[0]) } B.slot = slot;
function size(t){ return (t||'').length||1 } // bits/numbers less size? Bug or feature?
function subt(i,j){ return subt.f? B.encode(this.word) : this.word }
//function tot(){ return this.text = this.text || "'"+(this.word)+"'"+(this.is)+"'" }
function tot(){ var tmp;
	//if((tmp = this.page) && tmp.saving){ delete tmp.book.all[this.word]; } // TODO: BUG! Book can't know about RAD, this was from RAD, so this MIGHT be correct but we need to refactor. Make sure to add tests that will re-trigger this.
	return this.text = this.text || "'"+(this.word)+"'"+(this.is)+"'";
}
function sub(i,j){ return (this.first||this.word||(from(this)||'')[0]||'').substring(i,j) }
function to(){ return this.text = this.text || text(this) }
function join(){ return this.join('|') }
function text(p){
	if(!p.list){ return (typeof p.from == 'string')? (p.from||'')+'' : '|'+p.from+'|' }
	if(!p.from){ return '|'+((p.list && (p.list = p.list.sort()).join('|'))||'')+'|' }
	return '|'+from(p).concat(p.list).sort().join('|')+'|'; // commenting out this sub-portion of code fixed a more basic test, but will probably cause a bug with a FROM + MEMORY.
}

B.encode = function(d, s){ s = s || "|";
	switch(typeof d){
		case 'string': // text
			var i = d.indexOf(s), t = '';
			while(i != -1){ t += s; i = d.indexOf(s, i+1) }
			return t + '"' + d;
		case 'number': return (d < 0)? ''+d : '+'+d;
		case 'boolean': return d? '+' : '-';
		case 'object': return d? "{TODO}" : ' ';
	}
}
// deprecate this B.encode below:
B.encode2 = function(d, _){ _ = _ || "'";
	if(typeof d == 'string'){
		var i = d.indexOf(_), t = "";
		while(i != -1){ t += _; i = d.indexOf(_, i+1) }
		return t + _+d+_;
	}
}

B.decode = function(t, s){ s = s || "|";
	if('string' != typeof t){ return }
	switch(t){ case ' ': return null; case '-': return false; case '+': return true; }
	switch(t[0]){
		case '-': case '+': return parseFloat(t);
		case '"': return t.slice(1);
	}

	return B.decode(B.parse(t, s));
}

B.parse = function(l, s){ var i, c = 0, s = (s||'|');

	if(0 !== (i = l.indexOf(s))){ return l }
	while(s == l[++c + i]){ console.log('Count escape prefix:', c, i); }; // get count of escape prefix
	return B.parse(l.slice(i+c), s);
}

function heal(l, s){ var i, c = 0;
	if(0 > (i = l.indexOf(''))){ return l }
	while('' == l[++c + i]){}; // get count of escape prefix
	return heal(l.slice(0,i).concat(l.slice(i+c, i+c+c+1).join(s||'|'), l.slice(i+c+c+1)));
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

try{module.exports=B}catch(e){}
}());
