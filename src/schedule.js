
// Generic javascript scheduler utility.
var Type = require('./type');
function s(state, cb, time){ // maybe use lru-cache?
	s.time = time || Gun.time.is;
	s.waiting.push({when: state, event: cb || function(){}});
	if(s.soonest < state){ return }
	s.set(state);
}
s.waiting = [];
s.soonest = Infinity;
s.sort = Type.list.sort('when');
s.set = function(future){
	if(Infinity <= (s.soonest = future)){ return }
	var now = s.time();
	future = (future <= now)? 0 : (future - now);
	clearTimeout(s.id);
	s.id = setTimeout(s.check, future);
}
s.each = function(wait, i, map){
	var ctx = this;
	if(!wait){ return }
	if(wait.when <= ctx.now){
		if(wait.event instanceof Function){
			setTimeout(function(){ wait.event() },0);
		}
	} else {
		ctx.soonest = (ctx.soonest < wait.when)? ctx.soonest : wait.when;
		map(wait);
	}
}
s.check = function(){
	var ctx = {now: s.time(), soonest: Infinity};
	s.waiting.sort(s.sort);
	s.waiting = Type.list.map(s.waiting, s.each, ctx) || [];
	s.set(ctx.soonest);
}
module.exports = s;
	