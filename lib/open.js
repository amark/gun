if(typeof window !== "undefined"){
  var Gun = window.Gun;
} else { 
  var Gun = require('gun/gun');
}

Gun.chain.open = function(cb, opt, at){
	opt = opt || {};
	opt.doc = opt.doc || {};
	opt.ids = opt.ids || {};
	return this.on(function(data, key){
		delete ((data = Gun.obj.copy(data))||{})._;
		clearTimeout(opt.to);
		opt.to = setTimeout(function(){
			cb(opt.doc);
		}, opt.wait || 1);
		if(Gun.val.is(data)){
			if(!at){
				opt.doc = data;
			} else {
				at[key] = data;
			}
			return;
		}
		var tmp = this, id;
		Gun.obj.map(data, function(val, key){
			if(!(id = Gun.val.rel.is(val))){
				(at || opt.doc)[key] = val;
				return;
			}
			if(opt.ids[id]){
				(at || opt.doc)[key] = opt.ids[id];
				return;
			}
			tmp.get(key).open(cb, opt, opt.ids[id] = (at || opt.doc)[key] = {});
		});
	})
}