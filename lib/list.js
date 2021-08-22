var Gun = Gun || require('../gun');

Gun.chain.list = function(cb, opt){
	opt = opt || {};
	cb = cb || function(){}; 
	var gun = this.put({}); // insert assumes a graph node. So either create it or merge with the existing one.
	gun.last = function(obj, cb){
		var last = gun.path('last');
		if(!arguments.length){ return last }
		return gun.path('last').put(null).put(obj).val(function(val){ // warning! these are not transactional! They could be.
			console.log("last is", val);
			last.path('next').put(this._.node, cb);
		});
	}
	gun.first = function(obj, cb){
		var first = gun.path('first');
		if(!arguments.length){ return first }
		return gun.path('first').put(null).put(obj).val(function(){ // warning! these are not transactional! They could be.
			first.path('prev').put(this._.node, cb);
		});
	}
	return gun;
};

(function(){ // list tests
	return;
	var Gun = require('../index');
	var gun = Gun({file: 'data.json'});
	Gun.log.verbose = true;
	
	var list = gun.list();
	list.last({name: "Mark Nadal", type: "human", age: 23}).val(function(val){
		//console.log("oh yes?", val, '\n', this.__.graph);
	});
	list.last({name: "Timber Nadal", type: "cat", age: 3}).val(function(val){
		//console.log("oh yes?", val, '\n', this.__.graph);
	});
	list.list().last({name: "Hobbes", type: "kitten", age: 4}).val(function(val){
		//console.log("oh yes?", val, '\n', this.__.graph);
	});
	list.list().last({name: "Skid", type: "kitten", age: 2}).val(function(val){
		//console.log("oh yes?", val, '\n', this.__.graph);
	});
	setTimeout(function(){ list.val(function(val){
		console.log("the list!", list.__.graph);
		return;
		list.path('first').val(Gun.log)
			.path('next').val(Gun.log)
			.path('next').val(Gun.log);
	})}, 1000);

	return;
	gun.list().map(function(val, id){
		console.log("each!", id, val);
	})

}());