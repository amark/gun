;(function(){
	function normalize(opt){
		var el = $(this);
		opt = opt || $.extend(true, normalize.opt, opt||{});
		el.children().each(function(){
			var a = {$: $(this), opt: opt};
			a.tag = normalize.tag(a.$);
			$(a.opt.mutate).each(function(i,fn){
				fn && fn(a);
			});
		})
		return el;
	};
	var n = normalize, u;
	n.get = function(o, p){
		p = p.split('.');
		var i = 0, l = p.length, u;
		while((o = o[p[i++]]) != null && i < l){};
		return i < l ? u : o;
	}
	n.has = function(o,p){
		return Object.prototype.hasOwnProperty.call(o, p); 
	}
	n.tag = function(e){
		return (($(e)[0]||{}).nodeName||'').toLowerCase();
	}
	n.attrs = function(e, cb){
	  var attr = {};
	  (e = $(e)) && e.length && $(e[0].attributes||[]).each(function(v,n){
	  	n = n.nodeName||n.name;
	    v = e.attr(n);
			v = cb? cb(v,n,e) : v;
	    if(v !== u && v !== false){ attr[n] = v }
	  });
	  return attr;
	}
	n.joint = function(e, d){
		d = (d? 'next' : 'previous') + 'Sibling'
		return $(($(e)[0]||{})[d]);
	}
	var h = {
		attr: function(a$, av, al){
			var l = function(i,v){
				var t = v;
				i = al? v : i;
				v = al? av[v.toLowerCase()] : t;
				a$.attr(i, v);
			}
			al? $(al.sort()).each(l) : $.each(av,l);
		}
	}
	n.opt = { // some reasonable defaults, limited to content alone.
		tags: {
			'a': {attrs:{'src':1}, exclude:{'a':1}}, 
			'b': {exclude:{'b':1}},
			//'blockquote':1, 
			'br': {empty: 1},
			'div': 1,
			//'code':1, 
			'i': {exclude:{'i':1}},
			'img': {attrs:{'src':1}, empty: 1},
			'li':1, 'ol':1,
			'p': {exclude:{'p':1,'div':1}},
			//'pre':1,
			's': {exclude:{'s':1}},
			'sub':1, 'sup':1, 
			'span': {exclude:{'p':1,'ul':1,'ol':1,'li':1,'br':1}}, 
			'u': {exclude:{'u':1,'p':1}},
			'ul':1
		}
		// a, audio, b, br, div, i, img, li, ol, p, s, span, sub, sup, u, ul, video
		// button, canvas, embed, form, iframe, input, style, svg, table,
		// Text: bold, italics, underline, align, bullet, list, 
		,convert: {
			'em': 'i', 'strong': 'b'
		}
		,attrs: {
			'id':1
			,'class':1
			,'style':1
		}
		,mutate: [
			function(a){ // attr
				a.attrs = [];
				a.attr = $.extend(a.opt.attrs, n.get(a.opt,'tags.'+ a.tag +'attrs'));
				a.attr = n.attrs(a.$, function(v,i){
					a.$.removeAttr(i);
					if(a.attr[i.toLowerCase()]){
						a.attrs.push(i)
						return v;
					}
				});
				// if this tag is gonna get converted, wait to add attr back till after the convert
				if(a.attrs && !n.get(a.opt, 'convert.' + a.tag)){
					h.attr(a.$, a.attr, a.attrs);
				}
			}
			,function(a, tmp){ // convert
				if(!(tmp = n.get(a.opt,'convert.' + a.tag))){ return }
				a.attr = a.attr || n.attrs(a.$);
				a.$.replaceWith(a.$ = $('<'+ (a.tag = tmp.toLowerCase()) +'>').append(a.$.contents()));
				h.attr(a.$, a.attr, a.attrs);
			}
			,function(a, tmp){ // lookahead
				if((tmp = n.joint(a.$,1)) && (tmp = tmp.contents()).length === 1 && a.tag === n.tag(tmp = tmp.first())){
					a.$.append(tmp.parent()); // no need to unwrap the child, since the recursion will do it for us
				}
			}
			,function(a){ // recurse
				// this needs to precede the exclusion and empty.
				normalize(a);
			}
			,function(a, tmp){ // exclude
				if(!n.get(a.opt,'tags.' + a.tag) 
				|| ((tmp = n.get(a.opt,'tags.'+ a.tag +'.exclude')) 
				&& a.$.parents($.map(tmp,function(i,v){return v})+' ').length)
				){ 
					a.$.replaceWith(a.$.contents());
				}
			}
			,function(a, tmp){ // prior
				if((tmp = n.joint(a.$)).length && a.tag === n.tag(tmp)){
					tmp.append(a.$.contents());
				}
			}
			,function(a){ // empty
				// should always go last, since the element will be removed!
				if(a.opt.empty || !n.has(a.opt,'empty')){
					if(!n.get(a.opt,'tags.'+ a.tag +'.empty') 
					&& !a.$.contents().length){
						a.$.remove();
					}
				}
			}
		]
	}
	$.fn.normalize = normalize;
}());