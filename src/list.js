// Arrays
module.exports = {
	is: function(l){ 
		return (l instanceof Array);
	},
	
	slit: Array.prototype.slice,
	
	// creates a new sort function based off some field
	sort: function(k){
		return function(A,B){
			if(!A || !B){ return 0 }
			A = A[k];
			B = B[k];
			if(A < B){ return -1 }
			else if(A > B){ return 1 }
			else { return 0 }
		}
	},
	
	map: function(l, c, _){ 
		return obj.map(l, c, _)
	},
	
	// change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
	index: 1
}

var obj = require('./obj');