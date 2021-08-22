
// On event emitter generic javascript utility.
module.exports = function onto(tag, arg, as){
	if(!tag){ return {to: onto} }
	var u, f = 'function' == typeof arg, tag = (this.tag || (this.tag = {}))[tag] || f && (
		this.tag[tag] = {tag: tag, to: onto._ = { next: function(arg){ var tmp;
			if(tmp = this.to){ tmp.next(arg) }
	}}});
	if(f){
		var be = {
			off: onto.off ||
			(onto.off = function(){
				if(this.next === onto._.next){ return !0 }
				if(this === this.the.last){
					this.the.last = this.back;
				}
				this.to.back = this.back;
				this.next = onto._.next;
				this.back.to = this.to;
				if(this.the.last === this.the){
					delete this.on.tag[this.the.tag];
				}
			}),
			to: onto._,
			next: arg,
			the: tag,
			on: this,
			as: as,
		};
		(be.back = tag.last || tag).to = be;
		return tag.last = be;
	}
	if((tag = tag.to) && u !== arg){ tag.next(arg) }
	return tag;
};
	