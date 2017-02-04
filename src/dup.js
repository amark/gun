
var Type = require('./type');
function Dup(){
	this.cache = {};
}
Dup.prototype.track = function(id){
	this.cache[id] = Type.time.is();
	if (!this.to) {
		this.gc(); // Engage GC.
	}
	return id;
};
Dup.prototype.check = function(id){
	// Have we seen this ID recently?
	return Type.obj.has(this.cache, id)? this.track(id) : false; // Important, bump the ID's liveliness if it has already been seen before - this is critical to stopping broadcast storms.
}
Dup.prototype.gc = function(){
	var de = this, now = Type.time.is(), oldest = now, maxAge = 5 * 60 * 1000;
	// TODO: Gun.scheduler already does this? Reuse that.
	Type.obj.map(de.cache, function(time, id){
		oldest = Math.min(now, time);
		if ((now - time) < maxAge){ return }
		Type.obj.del(de.cache, id);
	});
	var done = Type.obj.empty(de.cache);
	if(done){
		de.to = null; // Disengage GC.
		return;
	}
	var elapsed = now - oldest; // Just how old?
	var nextGC = maxAge - elapsed; // How long before it's too old?
	de.to = setTimeout(function(){ de.gc() }, nextGC); // Schedule the next GC event.
}
module.exports = Dup;
	