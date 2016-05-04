var Gun = require('./gun');

Gun.is.val = function(v){ // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
	if(v === null){ return true } // "deletes", nulling out fields.
	if(v === Infinity){ return false } // we want this to be, but JSON does not support it, sad face.
	if(Gun.bi.is(v) // by "binary" we mean boolean.
	|| Gun.num.is(v)
	|| Gun.text.is(v)){ // by "text" we mean strings.
		return true; // simple values are valid.
	}
	return Gun.is.rel(v) || false; // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
}

Gun.is.rel = function(v){ // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
	if(Gun.obj.is(v)){ // must be an object.
		var id;
		Gun.obj.map(v, function(s, f){ // map over the object...
			if(id){ return id = false } // if ID is already defined AND we're still looping through the object, it is considered invalid.
			if(f == Gun._.soul && Gun.text.is(s)){ // the field should be '#' and have a text value.
				id = s; // we found the soul!
			} else {
				return id = false; // if there exists anything else on the object that isn't the soul, then it is considered invalid.
			}
		});
		if(id){ // a valid id was found.
			return id; // yay! Return it.
		}
	}
	return false; // the value was not a valid soul relation.
}

Gun.is.rel.ify = function(s){ var r = {}; return Gun.obj.put(r, Gun._.soul, s), r } // convert a soul into a relation and return it.

Gun.is.lex = function(l){ var r = true;
	if(!Gun.obj.is(l)){ return false }
	Gun.obj.map(l, function(v,f){
		if(!Gun.obj.has(Gun._,f) || !(Gun.text.is(v) || Gun.obj.is(v))){ return r = false }
	}); // TODO: What if the lex cursor has a document on the match, that shouldn't be allowed!
	return r;
}

Gun.is.node = function(n, cb, t){ var s; // checks to see if an object is a valid node.
	if(!Gun.obj.is(n)){ return false } // must be an object.
	if(s = Gun.is.node.soul(n)){ // must have a soul on it.
		return !Gun.obj.map(n, function(v, f){ // we invert this because the way we check for this is via a negation.
			if(f == Gun._.meta){ return } // skip over the metadata.
			if(!Gun.is.val(v)){ return true } // it is true that this is an invalid node.
			if(cb){ cb.call(t, v, f, n) } // optionally callback each field/value.
		});
	}
	return false; // nope! This was not a valid node.
}

Gun.is.node.ify = function(n, s, o){ // convert a shallow object into a node.
	o = Gun.bi.is(o)? {force: o} : o || {}; // detect options.
	n = Gun.is.node.soul.ify(n, s, o.force); // put a soul on it.
	Gun.obj.map(n, function(v, f){ // iterate over each field/value.
		if(Gun._.meta === f){ return } // ignore meta.
		Gun.is.node.state.ify([n], f, v, o.state = o.state || Gun.time.now()); // and set the state for this field and value on this node.
	});
	return n; // This will only be a valid node if the object wasn't already deep!
}

Gun.is.node.soul = function(n, s){ return (n && n._ && n._[s || Gun._.soul]) || false } // convenience function to check to see if there is a soul on a node and return it.

Gun.is.node.soul.ify = function(n, s, o){ // put a soul on an object.
	n = n || {}; // make sure it exists.
	n._ = n._ || {}; // make sure meta exists.
	n._[Gun._.soul] = o? s : n._[Gun._.soul] || s || Gun.text.random(); // if it already has a soul then use that instead - unless you force the soul you want with an option.
	return n;
}

Gun.is.node.state = function(n, f){ return (f && n && n._ && n._[Gun._.state] && Gun.num.is(n._[Gun._.state][f]))? n._[Gun._.state][f] : false } // convenience function to get the state on a field on a node and return it.

Gun.is.node.state.ify = function(l, f, v, state){ // put a field's state and value on some nodes.
	l = Gun.list.is(l)? l : [l]; // handle a list of nodes or just one node.
	var l = l.reverse(), d = l[0]; // we might want to inherit the state from the last node in the list.
	Gun.list.map(l, function(n, i){ // iterate over each node.
		n = n || {}; // make sure it exists.
		if(Gun.is.val(v)){ n[f] = v } // if we have a value, then put it.
		n._ = n._ || {}; // make sure meta exists.
		n = n._[Gun._.state] = n._[Gun._.state] || {}; // make sure HAM state exists.
		if(i = d._[Gun._.state][f]){ n[f] = i } // inherit the state!
		if(Gun.num.is(state)){ n[f] = state } // or manually set the state.
	});
}

Gun.is.graph = function(g, cb, fn, t){ // checks to see if an object is a valid graph.
	var exist = false;
	if(!Gun.obj.is(g)){ return false } // must be an object.
	return !Gun.obj.map(g, function(n, s){ // we invert this because the way we check for this is via a negation.
		if(!n || s !== Gun.is.node.soul(n) || !Gun.is.node(n, fn)){ return true } // it is true that this is an invalid graph.				 
		(cb || function(){}).call(t, n, s, function(fn){ // optional callback for each node.
			if(fn){ Gun.is.node(n, fn, t) } // where we then have an optional callback for each field/value.
		});
		exist = true;
	}) && exist; // makes sure it wasn't an empty object.
}

Gun.is.graph.ify = function(n){ var s; // wrap a node into a graph.
	if(s = Gun.is.node.soul(n)){ // grab the soul from the node, if it is a node.
		return Gun.obj.put({}, s, n); // then create and return a graph which has a node on the matching soul property.
	}
}