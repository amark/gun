var fs = require('fs');

fs.watch('.', {persistent: false, recursive: true}, function(eve, name){
	console.log("changed!", eve, name);
})