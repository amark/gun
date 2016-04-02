test(function(){
	this.just("Alice", function(test){
		var gun = Gun('http://localhost:8080/gun');
		gun.put({hello: 'world'}).key('test', test._terminate.bind(test));
	});

	this.just("Bob", function(test){
		var gun = Gun('http://localhost:8080/gun');
		gun.get('test').val(function(data){
			if(data.hello === 'world'){
				test.done();
			} else {
				test.fail("Data was corrupted");
			}
		});
		setTimeout(test.fail.bind("Timeout!"),500);
	});
});