(function(){

  $.normalize = function(html, customOpt){
    html = html || '';
    var root$, wrapped, opt;
    opt = html.opt || (customOpt ? prepareOptTags($.extend(true, baseOpt, customOpt))
                                 : defaultOpt);
    if(!html.opt){
      // first call
      unstableList.length = 0; // drop state from previous run (in case there has been error)
      root$ = $('<div>'+html+'</div>');
    }
    // initial recursion
    (html.$ || root$).contents().each(function(){
      if(this.nodeType === this.TEXT_NODE) {
      this.textContent = this.textContent.replace(/^[ \n]+|[ \n]+$/g, ' ');
        return;
      }
      var a = {$: $(this), opt: opt};
      initTag(a);
      $.normalize(a);
    });
    if(root$){
      stateMachine();
      return root$.html();
    }
  }

  var baseOpt = {
    hierarchy: ['div', 'pre', 'ol', 'ul', 'li',
                'h1', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', // block
                'b', 'code', 'i', 'span', 's', 'sub', 'sup', 'u',   // inline
                'br', 'img']                                               // empty
    ,tags: {
      'a': {attrs:{'href':1}, exclude:{'a':1}},
      'b': {exclude:{'b':1,'p':1}},
      'br': {empty: 1},
      'i': {exclude:{'i':1,'p':1}},
      'img': {attrs:{'src':1}, empty: 1},
      'span': {exclude:{'p':1,'ul':1,'ol':1,'li':1,'br':1}},
      's': {space:1},
      'u': {exclude:{'u':1,'p':1},space:1},
    }
    ,convert: {
      'em': 'i', 'strong': 'b', 'strike': 's',
    }
    ,attrs: {
      'id':1
      ,'class':1
      ,'style':1
    }
    ,blockTag: function(a){
      return a.opt.tags[a.tag].order < a.opt.tags.a.order;
    }
    ,mutate: [exclude, moveSpaceUp, next, parentOrderWrap]
  }

  var defaultOpt = prepareOptTags($.extend(true, {}, baseOpt));

  var unstableList = [];

  function addUnstable(a) { // NOT ES5
    if(!a.tag) { throw Error("not tag in ", a) }
    if(a.unstable) return;
    unstableList.push(a);
    a.unstable = true;
  }

  function initTag(a) {
    // initial handling (container, convert, attributes):
    a.tag = tag(a.$);
      if(empty(a)) {
      return;
    }
    parseAndRemoveAttrs(a);
    convert(a);
    setAttrs(a);
    a.$[0].a = a; // link from dom element back to a
    // state machine init
    unstableList.push(a);
    a.unstable = true;
    return a;
  }

  function stateMachine() {
    if(unstableList.length===0)
      return;
    var a, i = -1;
    while (a = unstableList.pop()) { // PERF: running index is probably faster than shift (mutates array)
      a.unstable = false;
      $(a.opt.mutate).each(function(i,fn){
        return fn && fn(a, addUnstable);
      });
    }
  }

  function prepareOptTags(opt) {
    var name, tag, tags = opt.tags;
    for(name in tags) {
      if(opt.hierarchy.indexOf(name)===-1)
        throw Error('tag "'+name+'" is missing hierachy definition');
    }
    opt.hierarchy.forEach(function(name){
      if(!tags[name]){
        tags[name] = {attrs: opt.attrs};
      }
      (tag=tags[name]).attrs = $.extend(tag.attrs||{}, opt.attrs);
      tag.name = name; // not used, debug help (REMOVE later?)
      // order
      tag.order = opt.hierarchy.indexOf(name)
      if(tag.order === -1) {
      throw Error("Order of '"+name+"' not defined in hierarchy");
    }
    });
    return opt;
  }

  // GENERAL UTILS

  function get(o, args){ // path argments as separate string parameters
    if(typeof args === 'string')
      return o[args[0]];
    var i = 0, l = args.length, u;
    while((o = o[args[i++]]) != null && i < l){};
    return i < l ? u : o;
  }

  function has(obj,prop){
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }

  // ELEMENT UTILS

  function tag(e){
    return (($(e)[0]||{}).nodeName||'').toLowerCase();
  }

  function joint(e, d){
    d = (d? 'next' : 'previous') + 'Sibling';
    return $(($(e)[0]||{})[d]);
  }

  var xssattr = /[^a-z:]/ig, xssjs = /javascript:/ig;
  // url("javascript: // and all permutations
  // stylesheets can apparently have XSS?

  // create key val attributes object from elements attributes
  function attrsAsObj(e, filterCb){
    var attrObj = {};
    (e = $(e)) && e.length && $(e[0].attributes||[]).each(function(value,name){
      name = name.nodeName||name.name;
      value = e.attr(name);
      if(value.replace(xssattr,'').match(xssjs)){ e.removeAttr(name); return }
      value = filterCb? filterCb(value,name,e) : value;
      if(value !== undefined && value !== false)
        attrObj[name] = value;
    });
    return attrObj;
  }

  // TODO: PERF testing - for loop to compare through?
  function sameAttrs(a, b) {
    return JSON.stringify(a.attr) === JSON.stringify(b.attr);
  }

  // INITIAL MUTATORS

  function parseAndRemoveAttrs(a) {
    a.attrs = [];
    var tag = a.opt.convert[a.tag] || a.tag,
    tOpt = a.opt.tags[tag];
    a.attr = tOpt && attrsAsObj(a.$, function(value,name){
    a.$.removeAttr(name);
    if(tOpt.attrs[name.toLowerCase()]){
      a.attrs.push(name)
      return value;
    }
    });
  }

  function setAttrs(a){
    var l  = function(ind,name){
      var t = name;
      name = a.attrs? name : ind;
      var value = a.attrs? a.attr[name.toLowerCase()] : t;
      a.$.attr(name, value);
    }
    a.attrs? $(a.attrs.sort()).each(l) : $.each(a.attr,l);
  }

  function convert(a){
    var t;
    if(t = a.opt.convert[a.tag]){
      a.$.replaceWith(a.$ = $('<'+ (a.tag = t.toLowerCase()) +'>').append(a.$.contents()));
    }
  }

  // LOOPING (STATE MACHINE) MUTATORS

  function exclude(a, addUnstable){
    var t = get(a.opt, ['tags', a.tag]),
    pt = get(a.opt, ['tags', tag(a.$.parent())]);
    if(!t || (pt && get(pt, ['exclude', a.tag]))){
      var c = a.$.contents();
      a.$.replaceWith(c);
      c.length===1 && c[0].a && addUnstable(c[0].a);
      return false;
    }
  }

  function moveSpaceUp(a, addUnstable){
    var n = a.$[0];
    if(moveSpace(n, true) + moveSpace(n, false)) {
      // either front, back or both spaces moved
      var c;
      if(n.textContent==='') {
        empty(a);
      } else if((c = a.$.contents()[0]) && c.a) {
        parentOrderWrap(c.a, addUnstable)
      }
    }
  }

  function moveSpace(n, bef) {
    var childRe  = bef? /^ / : / $/,
        parentRe = bef? / $/ : /^ /,
        c = bef? 'firstChild' : 'lastChild',
        s = bef? 'previousSibling' : 'nextSibling';
        sAdd = bef? 'after' : 'before';
        pAdd = bef? 'prepend' : 'append';
    if(!n || !n[c] || n[c].nodeType !== n.TEXT_NODE || !n[c].wholeText.match(childRe)) {
      return 0;
    }
    if((n2 = n[s]) && !n.a.opt.blockTag(n.a)) {
      if(n2.nodeType === 3 && !n2.textContent.match(parentRe)) {
        n2.textContent = (bef?'':' ') + n2.textContent + (bef?' ':'');
      } else if(n2.nodeType === 1) {
        $(n2)[sAdd](' ');
      }
    } else if((n2 = n.parentNode) && !n.a.opt.blockTag(n.a)) {
      $(n2)[pAdd](' ');
    } else {
      return 0;
    }
    n[c].textContent = n[c].wholeText.replace(childRe, '');
    if(!n[c].wholeText.length)
      $(n[c]).remove();
    return 1;
  }

  function next(a, addUnstable, t){
    var t = t || joint(a.$, true), sm;
    if(!t.length || a.opt.blockTag(a))
      return;
    if(a.opt.spaceMerge && t.length===1 && t[0].nodeType === 3 && t[0].wholeText===' '){
      if(!(t2 = joint(t, true)).length || a.opt.blockTag(t2[0].a))
        return;
      t.remove();
      t2.prepend(' ');
      return next(a, addUnstable, t2);
    }
    if(!t[0].a || a.tag !== t[0].a.tag || !sameAttrs(a, t[0].a))
      return;
    t.prepend(a.$.contents());
    empty(a);
    addUnstable(t[0].a);
    (t = t.children(":first")).length && addUnstable(t[0].a);
  }

  function empty(a){
    var t = a.opt.tags[a.tag];
    if((!t || !t.empty) && !a.$.contents().length && !a.$[0].attributes.length){
      a.$.remove();
      return true; // NOTE true/false - different API than in exclude
    }
  }

  function parentOrderWrap(a, addUnstable){
    var parent = a.$.parent(), children = parent.contents(),
    tags = a.opt.tags, ptag;

    if(children.length===1 && children[0] === a.$[0]
    && (ptag=tags[tag(parent)]) && ptag.order > tags[a.tag].order){
      parent.after(a.$);
      parent.append(a.$.contents());
      a.$.append(parent);
      addUnstable(parent[0].a);
      addUnstable(a);
    }
  }
})();