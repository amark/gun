
require('./shim');
function State(){
	var t = +new Date;
	if(last < t){
		return N = 0, last = t + State.drift;
	}
	return last = t + ((N += 1) / D) + State.drift;
}
State.drift = 0;
var NI = -Infinity, N = 0, D = 999, last = NI, u; // WARNING! In the future, on machines that are D times faster than 2016AD machines, you will want to increase D by another several orders of magnitude so the processing speed never out paces the decimal resolution (increasing an integer effects the state accuracy).
State.is = function(n, k, o){ // convenience function to get the state on a key on a node and return it.
	var tmp = (k && n && n._ && n._['>']) || o;
	if(!tmp){ return }
	return ('number' == typeof (tmp = tmp[k]))? tmp : NI;
}
State.ify = function(n, k, s, v, soul){ // put a key's state on a node.
	(n = n || {})._ = n._ || {}; // safety check or init.
	if(soul){ n._['#'] = soul } // set a soul if specified.
	var tmp = n._['>'] || (n._['>'] = {}); // grab the states data.
	if(u !== k && k !== '_'){
		if('number' == typeof s){ tmp[k] = s } // add the valid state.
		if(u !== v){ n[k] = v } // Note: Not its job to check for valid values!
	}
	return n;
}
module.exports = State;
	