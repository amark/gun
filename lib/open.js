var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

window.list = {};
Gun.chain.open = function(cb, opt, at){ // this is a recursive function!
	opt = opt || {}; // init top level options.
	opt.doc = opt.doc || {};
	opt.ids = opt.ids || {};
	opt.any = opt.any || cb;
	opt.meta = opt.meta || false;
	opt.eve = opt.eve || {off: function(){ // collect all recursive events to unsubscribe to if needed.
		Object.keys(opt.eve.s).forEach(function(i,e){ // switch to CPU scheduled setTimeout.each?
			if(e = opt.eve.s[i]){ e.off() }
		});
		opt.eve.s = {};
	}, s:{}}
	return this.on(function(data, key, ctx, eve){ // subscribe to 1 deeper layer of data!
		if(opt.meta !== true){
			//delete data._; // This should be safe now?
			delete ((data = JSON.parse(JSON.stringify(data||'')))||{})._; // BAD PERFORMANCE BUT TRY ANYWAYS!
		}
		clearTimeout(opt.to); // do not trigger callback if bunch of changes...
		opt.to = setTimeout(function(){ // but schedule the callback to fire soon!
			if(!opt.any){ return }
			opt.any.call(opt.at.$, opt.doc, opt.key, opt, opt.eve); // call it.
			if(opt.off){ // check for unsubscribing.
				opt.eve.off();
				opt.any = null;
			}
		}, opt.wait || 1);
		opt.at = opt.at || ctx; // opt.at will always be the first context it finds.
		opt.key = opt.key || key;
		opt.eve.s[this._.id] = eve; // collect all the events together.
		if(true === Gun.valid(data)){ // if primitive value...
			if(!at){
				opt.doc = data;
			} else {
				at[key] = data;
			}
			return;
		}
		var tmp = this; // else if a sub-object, CPU schedule loop over properties to do recursion.
		setTimeout.each(Object.keys(data), function(key, val){
			val = data[key];
			var doc = at || opt.doc, id; // first pass this becomes the root of open, then at is passed below, and will be the parent for each sub-document/object.
			if(!doc){ // if no "parent"
				return;
			}
			if('string' !== typeof (id = Gun.valid(val))){ // if primitive...
				doc[key] = val;
				return;
			}
			if(opt.ids[id]){ // if we've already seen this sub-object/document
				list[id] = (list[id] || 0) + 1;
				doc[key] = opt.ids[id]; // link to itself, our already in-memory one, not a new copy.
				return;
			}
			// now open up the recursion of sub-documents!
			tmp.get(key).open(opt.any, opt, opt.ids[id] = doc[key] = {}); // 3rd param is now where we are "at".
		});
	})
}
GUN.C = 0;