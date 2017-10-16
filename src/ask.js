
// request / response module, for asking and acking messages.
require('./onto'); // depends upon onto!
module.exports = function ask(cb, as){
	if(!this.on){ return }
	if(!(cb instanceof Function)){
		if(!cb || !as){ return }
		var id = cb['#'] || cb, tmp = (this.tag||empty)[id];
		if(!tmp){ return }
		tmp = this.on(id, as);
		clearTimeout(tmp.err);
		return true;
	}
	var id = (as && as['#']) || Math.random().toString(36).slice(2);
	if(!cb){ return id }
	var to = this.on(id, cb, as);
	to.err = to.err || setTimeout(function(){
		//console.log(50, 'TIME OUT', to.err, id);
		to.next({err: "Error: No ACK received yet."});
		to.off();
	}, 1000 * 9); // TODO: Make configurable!!!
	return id;
}
	