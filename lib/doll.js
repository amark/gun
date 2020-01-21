;(function(){ // jQuery shim
	if(window.$){ return }
	(($ = window.$ = function(q, tag){
		if(!(this instanceof $)){ return new $(q, tag) }
		this.tags = (q && q.tags) || (('string' != typeof q)?
			(q?[q]:[]) : (tag||document).querySelectorAll(q));
		return this;
	}).fn = $.prototype).each = function(cb){ return $.each(this.tags, cb), this }
	$.each = function(o, cb){ Object.keys(o).forEach(function(k){ cb(k, o[k]) }) }
	$.fn.get = function(i, l, u){ return l = this.tags, (i === u)? l : l[i] }
	$.fn.on = function(eve, cb){ return this.each(function(i, tag){ tag.addEventListener(eve, cb) })}
	$.fn.is = function(q, b){ return this.each(function(i, tag){ b = b || tag.matches(q) }), b }
	$.fn.css = function(obj){ return this.each(function(i, tag){ $.each(obj, function(k,v){ tag.style[k] = v }) })}
	$.fn.text = function(text, key, f, u){
		text = (text === u)? '' : (f = 1) && text;
		key = key || 'textContent';
		this.each(function(i, tag){
			if(f){ tag[key] = text }
			else { text += (tag[key]||'') }
		});
		return f? this : text;
	}
	$.fn.html = function(html){ return this.text(html, 'innerHTML') }
	$.fn.find = function(q){
		var I = $(), l = I.tags;
		this.each(function(i, tag){
			$(q, tag).each(function(i, tag){
				if(0 > l.indexOf(tag)){ l.push(tag) }
			});
		});
		return I;
	}
	$.fn.add = function(html, div){
		(div = document.createElement('div')).innerHTML = html;
		this.tags = [].slice.call(this.tags).concat([].slice.call(div.childNodes));
		return this;
	}
	$.fn.append = function(html, op, f){ return this.each(function(i, tag){
		(('<' === html[0])? $().add(html) : $(html)).each(function(i, node){
			(f? node : tag)[op || 'appendChild'](f? tag : node);
		})
	})}
	$.fn.appendTo = function(html){ return this.append(html, 0, 1) }
	$.fn.parents = function(q, c){
		var I = $(), l = I.tags, p = 'parentElement';
		this.each(function(i, tag){
			if(c){ (c = {})[p] = tag ; tag = c }
			while(tag){ if((tag = tag[p]) && $(tag).is(q)){
				l.push(tag); if(c){ return }
			}}
		});
		return I;
	}
	$.fn.closest = function(q, c){ return this.parents(q, 1) }
}());