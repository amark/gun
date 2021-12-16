;(function(){ // jQuery shim
	// u = undefined, n = null, b = boolean = true/false, n = number, t = text, l = list = array, o = object, cb = callback = function, q = query CSS, k = key, eve = event.
	if(window.$){ return }
	(($ = window.$ = function(q, tag, I, u){
		if(q instanceof $){ return q }
		if(!((I = this) instanceof $)){ return new $(q, tag) }
		if('string' != typeof q){ return I.tags = (q = q||[]).tags || (u === q.length)? [q] : q, I }
		if('<' === q[0]){ return I.add(q) }
		return q.split(",").forEach(function(q){ I.add((tag||document).querySelectorAll(q)) }), I;
	}).fn = $.prototype).each = function(cb){ return $.each(this.tags, cb), this }
	$.each = function(o, cb){ Object.keys(o).forEach(function(k){ cb(k, o[k]) }) }
	$.isPlainObject = function(o){
		return (o? (o instanceof Object && o.constructor === Object)
		|| 'Object' === Object.prototype.toString.call(o).match(/^\[object (\w+)\]$/)[1] 
		: false);
	}
	$.fn.add = function(add, tmp, u){ if(!add){ return this }
		if('<' === (tmp = add)[0]){ (add = document.createElement('div')).innerHTML = tmp; add = add.children[0] }
		add = ('string' == typeof add)? $(add).tags : (u == add.length)? add : [].slice.call(add);
		return this.tags = [].slice.call(this.tags||[]).concat(add), this;
	}
	$.fn.get = function(i, l, u){ return l = this.tags, (i === u)? l : l[i] }
	$.fn.is = function(q, b){ return this.each(function(i, tag){ b = b || tag.matches(q) }), b }
	$.fn.css = function(o){ return this.each(function(i, tag){ $.each(o, function(k,v){ tag.style[k] = v }) })}
	$.fn.on = function(t, cb){ return this.each(function(i, tag){
		t.split(" ").forEach(function(t){ tag.addEventListener(t, cb) });
	})}
	$.fn.val = function(t, k, f, u){
		t = (t === u)? '' : (f = 1) && t;
		k = k || 'value';
		return this.each(function(i, tag){
			if(f){ tag[k] = t }
			else { t += (tag[k]||'') }
		}), f? this : t;
	}
	$.fn.text = function(t){ return this.val(t, 'textContent') }
	$.fn.html = function(html){ return this.val(html, 'innerHTML') }
	$.fn.attr = function(attr,val){ return this.val(val, attr) }
	$.fn.find = function(q, I, l){
		I = $(), l = I.tags;
		return this.each(function(i, tag){
			$(q, tag).each(function(i, tag){
				if(0 > l.indexOf(tag)){ l.push(tag) }
			});
		}), I;
	}
	$.fn.place = function(where, on, f, op, I){ return (I = this).each(function(i, tag){ $(on).each(function(i, node){
		(f? tag : node)[op||'insertAdjacentElement'](({
			'-1':'beforebegin', '-0.1': 'afterbegin', '0.1':'beforeend', '1': 'afterend'
		})[where], (f? node : tag));
	})})}
	$.fn.append = function(html){ return $(html).place(0.1, this), this }
	$.fn.appendTo = function(html){ return this.place(0.1, $(html)) }
	function rev(o, I){ (I = $()).tags = [].slice.call(o.tags).reverse(); return I };
	$.fn.prependTo = function(html){ return rev(this).place(-0.1, $(html)), this }
	$.fn.prepend = function(html){ return rev($(html)).place(-0.1, this), this }
	$.fn.parents = function(q, c, I, l, p){
		I = $(), l = I.tags, p = 'parentElement';
		this.each(function(i, tag){
			if(c){ (c = {})[p] = tag ; tag = c }
			while(tag){ if((tag = tag[p]) && $(tag).is(q)){
				l.push(tag); if(c){ return }
			}}
		});
		return I;
	}
	$.fn.closest = function(q, c){ return this.parents(q, 1) }
	$.fn.clone = function(b, I, l){
		I = $(), l = I.tags;
		this.each(function(i, tag){
			l.push(tag.cloneNode(true))
		});
		return I;
	}
}());