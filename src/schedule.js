// Generic javascript scheduler utility.

var fn = require('./fn');
var list = require('./list');
var time = require('./time');

var schedule = function(state, cb){ // maybe use lru-cache?
	schedule.waiting.push({when: state, event: cb || function(){}});
	if(schedule.soonest < state){ return }
	schedule.set(state);
}

schedule.waiting = [];

schedule.soonest = Infinity;

schedule.sort = list.sort('when');

schedule.set = function(future){
	if(Infinity <= (schedule.soonest = future)){ return }
	var now = time.now(); // WAS time.is() TODO: Hmmm, this would make it hard for every gun instance to have their own version of time.
	future = (future <= now)? 0 : (future - now);
	clearTimeout(schedule.id);
	schedule.id = setTimeout(schedule.check, future);
}

schedule.check = function(){
	var now = time.now(), soonest = Infinity; // WAS time.is() TODO: Same as above about time. Hmmm.
	schedule.waiting.sort(schedule.sort);
	schedule.waiting = list.map(schedule.waiting, function(wait, i, map){
		if(!wait){ return }
		if(wait.when <= now){
			if(fn.is(wait.event)){
				setTimeout(function(){ wait.event() },0);
			}
		} else {
			soonest = (soonest < wait.when)? soonest : wait.when;
			map(wait);
		}
	}) || [];
	schedule.set(soonest);
}

module.exports = schedule;