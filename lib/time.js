;(function(){
	var ify = Gun.node.ify, u;
	Gun.chain.time = function(data, cb, opt){
		if(Gun.is(data)){
			var soul = data._.soul;
			if(!soul){ return cb({err: "Only root level node references supported currently, hopefully will change this in the future."}), this }
			data = Gun.val.rel.ify(soul);
		}
		if(data instanceof Function){
			return travel(data, cb, opt, this);
		}
		opt = opt || {};
		var t = new Date(Gun.state()).toISOString().split(/[\-t\:\.z]/ig);
		var gun = this, root = gun.back(-1);
		var p, tmp = t.pop();
		gun.get('_', function(msg, ev){ ev.off();
			var id = (msg.put && msg.put['#']) || ((root.back('opt.uuid') || Gun.text.random)(6) + ':'); // TODO: BUG! THIS SHOULD NOT BE HARDCODED.
			p = id;
			// could shrink this into a loop. Do later?
			var rid = (root.back('opt.uuid') || Gun.text.random)(9);
			var milli = ify({}, p + t.join(':'));
			milli[rid] = data;
			tmp = t.pop();
			var sec = ify({}, p + t.join(':'));
			sec[tmp] = milli;
			tmp = t.pop();
			var min = ify({}, p + t.join(':'));
			min[tmp] = sec;
			tmp = t.pop();
			var hour = ify({}, p + t.join(':'));
			hour[tmp] = min;
			tmp = t.pop();
			var day = ify({}, p + t.join(':'));
			day[tmp] = hour;
			tmp = t.pop();
			var month = ify({}, p + t.join(':'));
			month[tmp] = day;
			tmp = t.pop();
			var year = ify({}, p + t.join(':'));
			year[tmp] = month;
			tmp = t.pop();
			var time = ify({}, p + t.join(':'));
			time[tmp] = year;
			var ref = root.put(time);
			gun.put(ref, cb);
		})
		return gun;
	}
	function travel(cb, opt, b, gun){
		var root = gun.back(-1), tmp;
		(opt = Gun.num.is(opt)? {start: opt} : opt || {}).seen = opt.seen || {};
		var t = new Date(opt.start || Gun.state()).toISOString().split(/[\-t\:\.z]/ig).slice(0,-1);
		gun.get('_', function(msg, ev){ ev.off();
			var id = (msg.put && msg.put['#']);
			if(':' == id[id.length-1]){
				id = id.slice(0,-1);
			} else {
				id = null;
			}
			if(!id){ return Gun.log("Could not find time index.") }
			opt.at = opt.start = [id].concat(t);
			find(opt, cb, root);
		})
		return gun;
	}
	function find(o, cb, root){
		var at = o.at, t = at.join(':');
		if(1 == at.length){ t += ':' }
		if(o.seen[t]){ return } o.seen[t] = true;
		var next = o.start[at.length];
		root.get(t).get(function(msg, ev){
			var g = this;
			if(/*true || */u === msg.put){
				o.at = at.slice(0,-1);
				console.debug(5, o.at);
				console.debug(4, o.at);
				console.debug(3, o.at);
				console.debug(2, o.at);
				console.debug(1, o.at);
				find(o, cb, root);
			}
			if(7 < at.length){
				Gun.node.is(msg.put, function(v, k){
					cb(v, k, ev);
					if(o.last){ --o.last }
				})
				if(!o.last){ return }
				if(o.last <= 0){ return }
				var tmp = {seen: {}};
				tmp.last = o.last;
				tmp.start = tmp.at = o.at;
				tmp.at = tmp.at.slice(0,-1);
				tmp.was = true;
				find(tmp, cb, root);
				return;
			}
			if(u === msg.put){ return }
			if(o.last){
				var keys = Object.keys(msg.put).sort().reverse();
				var less = Gun.list.map(keys, function(k){
					if(parseFloat(k) < parseFloat(next)){ return k }
				})
				if(!less){
					o.at = at.slice(0,-1);
					find(o, cb, root);
					return;
				}
				o.at.push(less);
				(o.start = o.at.slice()).push(Infinity);
				o.at.length === 8 && (console.debug.i = console.debug.i || 1);
				find(o, cb, root);
				return;
			}
			Gun.node.is(msg.put, function(v, k){
				if(k < o.start[at.length]){ return }
				(o.at = at.slice()).push(k)
				//console.log('>>>>>', o.at);
				find(o, cb, root);
			})
			//console.log(o.at, msg.put, o.start[o.at.length]);
		})
	}
}());