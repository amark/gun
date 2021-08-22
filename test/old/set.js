(function(){ return;
	var Gun = require('../gun');
	var done = function(){};
	
	var gun = Gun().get('set').set(), i = 0;
	gun.val(function(val){
		console.log('t1', val);
	}).set(1).set(2).set(3).set(4) // if you set an object you'd have to do a `.back`
		.map().val(function(val){ // TODO! BUG? If we do gun.set it immediately calls and we get stale data. Is this wrong?
		console.log('t2', val, ++i);
		if(4 === i){
			console.log("TODO? BUG! Double soul?", gun.__.graph);
			done() 
		}
	});

	return; // TODO! BUG! Causes tests to crash and burn badly.
	
	require('../lib/set');
	var gun = Gun();
	
	var list = gun.get('thoughts');
	list.set('a');
	list.set('b');
	list.set('c');
	list.set('d').val(function(val){
		console.log('what', val, '\n\n');
		console.log(gun.__.graph);
	})
	return;
	gun.set({
		name: "Mark Nadal",
		age: 23,
		type: "human"
	}).back.set({
		name: "Timber Nadal",
		age: 3,
		type: "cat"
	}).back.set({
		name: "Hobbes",
		age: 4,
		type: "kitten"
	}).back.val(function(g){
		console.log("GOT", g, this.__.graph);
	}).map(function(val, id){
		console.log("map", id, val);
	});
	
}());