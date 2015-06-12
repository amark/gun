var expect = global.expect = require("./expect");

var Gun = Gun || require('../gun');
Gun.log.squelch = true;

describe('All', function(){
	var gun = Gun(), g = function(){
		return Gun({hooks: {get: ctx.get}});
	}, ctx = {};
	
	/*
	ctx.hook(key, function(err, data){ // multiple times potentially
		//console.log("chain.get from load", err, data);
		if(err){ return cb.call(gun, err, data) }
		if(!data){ return cb.call(gun, null, null), gun._.at('null').emit() }
		if(ctx.soul = Gun.is.soul.on(data)){
			gun._.at('soul').emit({soul: ctx.soul});
		} else { return cb.call(gun, {err: Gun.log('No soul on data!') }, data) }
		if(err = Gun.union(gun, data).err){ return cb.call(gun, err) }
		cb.call(gun, null, data);
		gun._.at('node').emit({soul: ctx.soul});
	}, opt);
	*/
	
	it('prep hook', function(done){
		var peer = Gun(), ref;
		ctx.get = function(key, cb){
			var c = 0;
			cb = cb || function(){};
			if('big' !== key){ return cb(null, null) }
			setTimeout(function badNetwork(){
				c += 1;
				var data = {_: {'#': Gun.is.soul.on(ref), '>': {}}};
				if(!ref['f' + c]){ 
					return cb(null, data);
				}
				data._[Gun._.HAM]['f' + c] = ref._[Gun._.HAM]['f' + c];
				data['f' + c] = ref['f' + c];
				cb(null, data);
				setTimeout(badNetwork, 5);
			},5);
		}
		ctx.get.fake = {};
		for(var i = 1; i < 6; i++){
			ctx.get.fake['f'+i] = i;
		}
		var big = peer.put(ctx.get.fake).val(function(val){
			ref = val;
			ctx.get('big', function(err, data){
				var next = Gun.obj.map(data, function(val, field){
					if(Gun._.meta === field){ return }
					return true;
				});
				//console.log(data);
				if(!next){ done() }
			});
			gun.opt({hooks: {get: ctx.get}});
		});
	});
	
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
			}, c: {name: "Bob",
				pet: {coat: "tux", name: "Casper"}
			} 
		});
		set.map().path('pet').val(function(obj, field){
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
	
	it('get big on', function(done){
		var c = 0;
		g().get('big').on(function(val){
			delete val._;
			c += 1;
			if(c === 1){
				expect(val).to.eql({f1: 1});
			}
			if(c === 5){
				expect(val).to.eql({f1: 1, f2: 2, f3: 3, f4: 4, f5: 5});
				done();
			}
		});
	});
	
	it('get big on delta', function(done){
		var c = 0;
		g().get('big').on(function(val){
			delete val._;
			c += 1;
			if(c === 1){
				expect(val).to.eql({f1: 1});
			}
			if(c === 5){
				expect(val).to.eql({f5: 5});
				done();
			}
		}, true);
	});
	
	it('get val', function(done){
		g().get('big').val(function(obj){
			delete obj._;
			expect(obj.f1).to.be(1);
			expect(obj.f5).to.be(5);
			done();
		});
	});
	
	it('get big map val', function(done){
		g().get('big').map().val(function(val, field){
			delete val._;
			if('f1' === field){
				expect(val).to.be(1);
			}
			if('f5' === field){
				expect(val).to.be(5);
				done();
			}
		});
	});
});