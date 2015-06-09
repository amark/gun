var expect = global.expect = require("./expect");

var Gun = Gun || require('../gun');

describe('All', function(){
	var gun = Gun();

	it('map chain', function(done){
		var set = gun.put({a: {here: 'you'}, b: {go: 'dear'}, c: {sir: '!'} });
		set.map().val(function(obj, field){
			if(obj.here){
				done.a = obj.here;
				expect(obj.here).to.be('you');
			}
			if(obj.go){
				done.b = obj.go;
				expect(obj.go).to.be('dear');	
			}
			if(obj.sir){
				done.c = obj.sir;
				expect(obj.sir).to.be('!');
			}
			if(done.a && done.b && done.c){
				done();
			}
		});
	});

	it('map chain path', function(done){
		var set = gun.put({
			a: {name: "Mark",
				pet: {coat: "tabby", name: "Hobbes"}
			}, b: {name: "Alice",
				pet: {coat: "calico", name: "Cali"}
			},c: {name: "Bob",
				pet: {coat: "tux", name: "Casper"}
			} 
		});
		set.map().path('pet').val(function(obj, field){
			console.log("test", field, obj);
			if(obj.name === 'Hobbes'){
				done.hobbes = obj.name;
				expect(obj.name).to.be('Hobbes');
				expect(obj.coat).to.be('tabby');
			}
			if(obj.name === 'Cali'){
				done.cali = obj.name;
				expect(obj.name).to.be('Cali');
				expect(obj.coat).to.be('calico');
			}
			if(obj.name === 'Casper'){
				done.casper = obj.name;
				expect(obj.name).to.be('Casper');
				expect(obj.coat).to.be('tux');
			}
			if(done.hobbes && done.cali && done.casper){
				done();
			}
		});
	});

});