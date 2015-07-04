(function(){
	return; // this file is for temporary testings and shouldn't get run.
	var Gun = require('../gun');
	var gun = Gun();
	Gun.log.verbose = true;

	/*
	gun.put({foo: "bar"}).val(function(val){
		console.log("POWR HOUSE", val);
		this.put({lol: 'pancakes'}).val(function(v){
			console.log("YEAH CAKES", v);
		})
	});
	*/

	gun.get('hello/world').put({hello: 'Mark'}).path('hello').val(function(val){
		console.log("YO", val);
		expect(val).to.be('Mark');
		done();
	});


	return;
	function Next(){
		var fn = function(cb){
			if(!fn.stack || !fn.stack.length){
				setImmediate(function next(n){
					return (n = (fn.stack||[]).shift() || function(){}), n.back = fn.stack, fn.stack = [], n(function(){
						return (fn.stack = (fn.stack||[]).concat(n.back)), next();
					});
				});
			} if(cb){ 
				(fn.stack = fn.stack || []).push(cb);
			} return fn;
		}, setImmediate = setImmediate || function(cb){return setTimeout(cb,0)}
		return fn;
	}

	module.exports = Next;

	var next = Next();
	var state = {};

	next(function(n){
		console.log(1);
		setTimeout(n, 500);
	});
	next(function(n){
		console.log(2);
		setTimeout(function(){

			//n(function(){
				console.log(3);

				next(function(n){
					console.log(4);
					setTimeout(function(){
						console.log("before five");
						n();
					}, 5000);
				})
				next(function(n){
					console.log(5);
					setTimeout(n, 3000);
				});
				n();
			//});

		}, 1000);
	});
	next(function(n){
		console.log(6);
		n();
	});

}());