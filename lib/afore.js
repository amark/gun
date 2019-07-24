function afore(tag, hear){
	if(!tag){ return }
	tag = tag.the; // grab the linked list root
	var tmp = tag.to; // grab first listener
	hear = tmp.on.on(tag.tag, hear); // add us to end
	hear.to = tmp || hear.to; // make our next be current first
	hear.back.to = hear.to; // make our back point to our next
	tag.last = hear.back; // make last be same as before
	hear.back = tag; // make our back be the start
	tag.to = hear; // make the start be us
	return hear;
}
if(typeof module !== "undefined"){ module.exports = afore } // afore(gun._.on('in'), function(){ })