(function(){
	return; // this file is for temporary testings and shouldn't get run.
	var Gun = require('../gun');
	var gun = Gun();
	Gun.log.verbose = true;

	gun.set({foo: {bar: "lol"}}).path("foo", function(err, node, field){
		console.log("on the path:", node, field)
	}).get(function(val){
		console.log("got:", val);
	});
}());