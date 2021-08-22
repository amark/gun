var Gun = require('../../index');

var gun = Gun({file: __dirname+'/old2020json'});

gun.get('test').once(function(data, key){
	console.log(key, data);
	if(!data){ throw "not compatible!" }
});