// Numbers
module.exports = {
	is: function(n){ 
		return !list.is(n) && (Infinity === n || n - parseFloat(n) + 1 >= 0);
	}
}

var list = require('./list');