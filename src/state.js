
var Type = require('./type');
var Node = require('./node');
function State(){
	var t;
	if(perf){
		t = start + perf.now();
	} else {
		t = time();
	}
	if(last < t){
		return N = 0, last = t + State.drift;
	}
	return last = t + ((N += 1) / D) + State.drift;
}
var time = Type.time.is, last = -Infinity, N = 0, D = 1000; // WARNING! In the future, on machines that are D times faster than 2016AD machines, you will want to increase D by another several orders of magnitude so the processing speed never out paces the decimal resolution (increasing an integer effects the state accuracy).
var perf = (typeof performance !== 'undefined')? (performance.timing && performance) : false, start = (perf && perf.timing && perf.timing.navigationStart) || (perf = false);
State._ = '>';
State.drift = 0;
State.is = function(n, f, o){ // convenience function to get the state on a field on a node and return it.
	var tmp = (f && n && n[N_] && n[N_][State._]) || o;
	if(!tmp){ return }
	return num_is(tmp = tmp[f])? tmp : -Infinity;
}
State.ify = function(n, f, s, v, soul){ // put a field's state on a node.
	if(!n || !n[N_]){ // reject if it is not node-like.
		if(!soul){ // unless they passed a soul
			return; 
		}
		n = Node.soul.ify(n, soul); // then make it so!
	} 
	var tmp = obj_as(n[N_], State._); // grab the states data.
	if(u !== f && f !== N_){
		if(num_is(s)){
			tmp[f] = s; // add the valid state.
		}
		if(u !== v){ // Note: Not its job to check for valid values!
			n[f] = v;
		}
	}
	return n;
}
State.to = function(from, f, to){
	var val = from[f];
	if(obj_is(val)){
		val = obj_copy(val);
	}
	return State.ify(to, f, State.is(from, f), val, Node.soul(from));
}
;(function(){
	State.map = function(cb, s, as){ var u; // for use with Node.ify
		var o = obj_is(o = cb || s)? o : null;
		cb = fn_is(cb = cb || s)? cb : null;
		if(o && !cb){
			s = num_is(s)? s : State();
			o[N_] = o[N_] || {};
			obj_map(o, map, {o:o,s:s});
			return o;
		}
		as = as || obj_is(s)? s : u;
		s = num_is(s)? s : State();
		return function(v, f, o, opt){
			if(!cb){
				map.call({o: o, s: s}, v,f);
				return v;
			}
			cb.call(as || this || {}, v, f, o, opt);
			if(obj_has(o,f) && u === o[f]){ return }
			map.call({o: o, s: s}, v,f);
		}
	}
	function map(v,f){
		if(N_ === f){ return }
		State.ify(this.o, f, this.s) ;
	}
}());
var obj = Type.obj, obj_as = obj.as, obj_has = obj.has, obj_is = obj.is, obj_map = obj.map, obj_copy = obj.copy;
var num = Type.num, num_is = num.is;
var fn = Type.fn, fn_is = fn.is;
var N_ = Node._, u;
module.exports = State;
	