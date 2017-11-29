if(typeof window !== "undefined"){
  var Gun = window.Gun;
} else { 
  var Gun = require('gun/gun');
}

Gun.chain.open = function(cb, opt, at){
	opt = opt || {};
	opt.doc = opt.doc || {};
	opt.ids = opt.ids || {};
	opt.any = opt.any || cb;
	opt.ev = opt.ev || {off: function(){
		Gun.obj.map(opt.ev.s, function(e){
			if(e){ e.off() }
		});
		opt.ev.s = {};
	}, s:{}}
	return this.on(function(data, key, ctx, ev){
		delete ((data = Gun.obj.copy(data))||{})._;
		clearTimeout(opt.to);
		opt.to = setTimeout(function(){
			if(!opt.any){ return }
			opt.any.call(opt.at.gun, opt.doc, opt.key, opt, opt.ev);
			if(opt.off){
				opt.ev.off();
				opt.any = null;
			}
		}, opt.wait || 1);
		opt.at = opt.at || ctx;
		opt.key = opt.key || key;
		opt.ev.s[this._.id] = ev;
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
			tmp.get(key).open(opt.any, opt, opt.ids[id] = (at || opt.doc)[key] = {});
		});
	})
}