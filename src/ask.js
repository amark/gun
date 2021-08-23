
// request / response module, for asking and acking messages.
require('./onto'); // depends upon onto!
module.exports = function ask(cb, as){
	if(!this.on){ return }
	var lack = (this.opt||{}).lack || 9000;
	if(!('function' == typeof cb)){
		if(!cb){ return }
		var id = cb['#'] || cb, tmp = (this.tag||'')[id];
		if(!tmp){ return }
		if(as){
			tmp = this.on(id, as);
			clearTimeout(tmp.err);
			tmp.err = setTimeout(function(){ tmp.off() }, lack);
		}
		return true;
	}
	var id = (as && as['#']) || random(9);
	if(!cb){ return id }
	var to = this.on(id, cb, as);
	to.err = to.err || setTimeout(function(){ to.off();
		to.next({err: "Error: No ACK yet.", lack: true});
	}, lack);
	return id;
}
var random = String.random || function(){ return Math.random().toString(36).slice(2) }
	