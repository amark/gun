// Time

var time = {
	is: function(t){ 
		return t? t instanceof Date : (+new Date().getTime());
	},
	now: function(t){
		// TODO: BUG! Causes lots of terrible problems.
		return ((t=t||time.is()) > (time.now.last || -Infinity)? (time.now.last = t) : time.now(t + 1)) + (time.now.drift || 0); // TODO: BUG? Should this go on the inside?
	}
}

module.exports = time;