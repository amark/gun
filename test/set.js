(function(){

	var Gun = require('../index');
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
		name: "Amber Nadal",
		age: 23,
		type: "human"
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