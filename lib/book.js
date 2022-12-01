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
	b.list = [{from: text, size: (text||'').length, substring: sub, toString: to, book: b}];
	b.page = page;
	b.set = set;
	b.get = get;
	b.all = {};
	return b;
}), PAGE = 2**12;

function page(word){
	var b = this, l = b.list, i = spot(B.encode(word), l), p = l[i];
	if('string' == typeof p){ l[i] = p = {size: -1, first: p, substring: sub, toString: to, book: b} } // TODO: test, how do we arrive at this condition again?
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
	if(l = from(page)){ has = l[i = spot(B.encode(word), l)] }
	if(has && word == has.word){ return (b.all[word] = has).is }
	if('string' != typeof has){ return }
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
	if(PAGE < page.size){ split(page, b) }
	return b;
}

function split(p, b){
	//console.time();
	var L = p.list = p.list.sort(), l = L.length, i = l/2 >> 0, j = i, half = L[j], tmp;
	//console.timeEnd();
	var next = {list: [], first: B.encode(half.substring()), size: 0, substring: sub, toString: to, book: b}, nl = next.list;
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
function subt(i,j){ return this.word }
//function tot(){ return this.text = this.text || "'"+(this.word)+"'"+(this.is)+"'" }
function tot(){ var tmp;
	if((tmp = this.page) && tmp.saving){ delete tmp.book.all[this.word]; }
	return this.text = this.text || "'"+(this.word)+"'"+(this.is)+"'";
}
function sub(i,j){ return (this.first||this.word||(from(this)||'')[0]||'').substring(i,j) }
function to(){ return this.text = this.text || text(this) }
function join(){ return this.join('|') }
function text(p){
	if(!p.list){ return (p.from||'')+'' }
	if(!p.from){ return '|'+((p.list && (p.list = p.list.sort()).join('|'))||'')+'|' } 
	return '|'+from(p).concat(p.list).sort().join('|')+'|';
}

B.encode = function(d, _){ _ = _ || "'";
	if(typeof d == 'string'){
		var i = d.indexOf(_), t = "";
		while(i != -1){ t += _; i = d.indexOf(_, i+1) }
		return t + _+d+_;
	}
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
