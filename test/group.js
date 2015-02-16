(function(){ // group test

	var Gun = require('../index');
	require('../lib/group');
	var gun = Gun({file: 'data.json'});

	gun.group({
		name: "Mark Nadal",
		age: 23,
		type: "human"
	}).group({
		name: "Amber Nadal",
		age: 23,
		type: "human"
	}).group({
		name: "Hobbes",
		age: 4,
		type: "kitten"
	}).get(function(g){
		//console.log("GOT", g, this.__.graph);
	}).map(function(val, id){
		//console.log("map", id, val);
	});
}());