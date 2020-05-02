
var to = (typeof setImmediate !== "undefined")? setImmediate : setTimeout, puff = function(cb){
	if(Q.length){ Q.push(cb); return } Q = [cb];
	to(function go(S){ S = S || +new Date;
		var i = 0, cb; while(i < 9 && (cb = Q[i++])){ cb() }
		console.STAT && console.STAT(S, +new Date - S, 'puff');
		if(cb && !(+new Date - S)){ return go(S) }
		if(!(Q = Q.slice(i)).length){ return }
		to(go, 0);
	}, 0);
}, Q = [];
module.exports = setTimeout.puff = puff;
	