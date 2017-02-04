
// TODO: Needs to be redone.
var On = require('./onto');

function Chain(create, opt){
	opt = opt || {};
	opt.id = opt.id || '#';
	opt.rid = opt.rid || '@';
	opt.uuid = opt.uuid || function(){
		return (+new Date()) + Math.random();
	};
	var on = On;//On.scope();

	on.stun = function(chain){
		var stun = function(ev){
			if(stun.off && stun === this.stun){
				this.stun = null;
				return false;
			}
			if(on.stun.skip){
				return false;
			}
			if(ev){
				ev.cb = ev.fn;
				ev.off();
				res.queue.push(ev);
			}
			return true;
		}, res = stun.res = function(tmp, as){
			if(stun.off){ return }
			if(tmp instanceof Function){
				on.stun.skip = true;
				tmp.call(as);
				on.stun.skip = false;
				return;
			}
			stun.off = true;
			var i = 0, q = res.queue, l = q.length, act;
			res.queue = [];
			if(stun === at.stun){
				at.stun = null;
			}
			for(i; i < l; i++){ act = q[i];
				act.fn = act.cb;
				act.cb = null;
				on.stun.skip = true;
				act.ctx.on(act.tag, act.fn, act);
				on.stun.skip = false;
			}
		}, at = chain._;
		res.back = at.stun || (at.back||{_:{}})._.stun;
		if(res.back){
			res.back.next = stun;
		}
		res.queue = [];
		at.stun = stun; 
		return res;
	}
	return on;
	return;
	return;
	return;
	return;
	var ask = on.ask = function(cb, as){
		if(!ask.on){ ask.on = On.scope() }
		var id = opt.uuid();
		if(cb){ ask.on(id, cb, as) }
		return id;
	}
	ask._ = opt.id;
	on.ack = function(at, reply){
		if(!at || !reply || !ask.on){ return }
		var id = at[opt.id] || at;
		if(!ask.ons[id]){ return }
		ask.on(id, reply);
		return true;
	}
	on.ack._ = opt.rid;


	return on;
	return;
	return;
	return;
	return;
	on.on('event', function event(act){
		var last = act.on.last, tmp;
		if('in' === act.tag && Gun.chain.chain.input !== act.fn){ // TODO: BUG! Gun is not available in this module.
			if((tmp = act.ctx) && tmp.stun){
				if(tmp.stun(act)){
					return;
				}
			}
		}
		if(!last){ return }
		if(act.on.map){
			var map = act.on.map, v;
			for(var f in map){ v = map[f];
				if(v){
					emit(v, act, event);
				}
			}
			/*
			Gun.obj.map(act.on.map, function(v,f){ // TODO: BUG! Gun is not available in this module.
				//emit(v[0], act, event, v[1]); // below enables more control
				//console.log("boooooooo", f,v);
				emit(v, act, event);
				//emit(v[1], act, event, v[2]);
			});
			*/
		} else {
			emit(last, act, event);
		}
		if(last !== act.on.last){
			event(act);
		}
	});
	function emit(last, act, event, ev){
		if(last instanceof Array){
			act.fn.apply(act.as, last.concat(ev||act));
		} else {
			act.fn.call(act.as, last, ev||act);
		}
	}

	/*on.on('emit', function(ev){
		if(ev.on.map){
			var id = ev.arg.via.gun._.id + ev.arg.get;
			//
			//ev.id = ev.id || Gun.text.random(6);
			//ev.on.map[ev.id] = ev.arg;
			//ev.proxy = ev.arg[1];
			//ev.arg = ev.arg[0];
			// below gives more control.
			ev.on.map[id] = ev.arg;
			//ev.proxy = ev.arg[2];
		}
		ev.on.last = ev.arg;
	});*/

	on.on('emit', function(ev){
		var gun = ev.arg.gun;
		if('in' === ev.tag && gun && !gun._.soul){ // TODO: BUG! Soul should be available. Currently not using it though, but should enable it (check for side effects if made available).
			(ev.on.map = ev.on.map || {})[gun._.id || (gun._.id = Math.random())] = ev.arg;
		}
		ev.on.last = ev.arg;
	});
	return on;
}
module.exports = Chain;
	