describe('Performance', function(){ return; // performance tests
	var console = root.console || {log: function(){}};
	function perf(fn, i){
		i = i || 1000;
		while(--i){
			fn(i);
		}
	}
	perf.now = this.performance? function(){ return performance.now() } : function(){ return Gun.time.now()/1000 };
	(function(){
		var t1 = perf.now();
		var obj = {1: 'a', 2: 'b', 3: 'c', 4: 'd', 5: 'e', 6: 'f', 7: 'g', 8: 'h', 9: 'i'};
		Object.keys && perf(function(){
			var l = Object.keys(obj), ll = l.length, i = 0, s = '';
			for(; i < ll; i++){
				var v = l[i];
				s += v;
			}
		});
		console.log('map: native', (t1 = (perf.now() - t1)/1000) + 's');

		var t2 = perf.now();
		var obj = {1: 'a', 2: 'b', 3: 'c', 4: 'd', 5: 'e', 6: 'f', 7: 'g', 8: 'h', 9: 'i'};
		perf(function(){
			var s = '';
			Gun.obj.map(obj, function(v){
				s += v;
			})
		});
		console.log('map: gun', (t2 = (perf.now() - t2)/1000) + 's', (t2 / t1).toFixed(1)+'x', 'slower.');
	}());
	(function(){
		if(!Gun.store){
			var tab = Gun().tab;
			if(!tab){ return }
			Gun.store = tab.store;
		}
		root.localStorage && root.localStorage.clear();
		var it = 1000;
		var t1 = perf.now();
		perf(function(i){
			var obj = {'i': i, 'v': Gun.text.random(100)};
			Gun.store.put('test/native/' + i, obj);
		}, it);
		console.log('store: native', (t1 = (perf.now() - t1)/1000) + 's');

		root.localStorage && root.localStorage.clear();
		var gun = Gun({wire: {get:function(l,cb){cb()},put:function(g,cb){
			Gun.is.graph(g, function(node, soul){
				Gun.store.put(soul, node);
			});
			cb(null);
		}}});
		var t2 = perf.now();
		perf(function(i){
			var obj = {'i': i, 'v': Gun.text.random(100)};
			gun.put(obj);
		}, it);
		console.log('store: gun', (t2 = (perf.now() - t2)/1000) + 's', (t2 / t1).toFixed(1)+'x', 'slower.');
		root.localStorage && root.localStorage.clear();
	}());
	(function(){ // setTimeout
		if(!Gun.store){
			var tab = Gun().tab;
			if(!tab){ return }
			Gun.store = tab.store;
		}
		root.localStorage && root.localStorage.clear();
		var t1 = perf.now();
		i = i || 1000;
		while(--i){
			var obj = {'i': i, 'v': Gun.text.random(100)};
			Gun.store.put('test/native/' + i, obj);
		}
		console.log('store: native', (t1 = (perf.now() - t1)/1000) + 's');

		root.localStorage && root.localStorage.clear();
		var gun = Gun({wire: {get:function(l,cb){cb()},put:function(g,cb){
			Gun.is.graph(g, function(node, soul){
				Gun.store.put(soul, node);
			});
			cb(null);
		}}});
		var t2 = perf.now();
		perf(function(i){
			var obj = {'i': i, 'v': Gun.text.random(100)};
			gun.put(obj);
		}, it);
		console.log('store: gun', (t2 = (perf.now() - t2)/1000) + 's', (t2 / t1).toFixed(1)+'x', 'slower.');
		root.localStorage && root.localStorage.clear();
	}());
	(function(){
		var t1 = perf.now();
		var on = Gun.on.create(), c = 0, o = [];
		perf(function(i){
			o.push(function(n){
				c += 1;
			});
			var ii = 0, l = o.length;
			for(; ii < l; ii++){
				o[ii](i);
			}
		});
		console.log('on: native', (t1 = (perf.now() - t1)/1000) + 's');

		var on = Gun.on.create(), c = 0;
		var t2 = perf.now();
		perf(function(i){
			on('change').event(function(n){
				c += 1;
			});
			on('change').emit(i);
		});
		console.log('on: gun', (t2 = (perf.now() - t2)/1000) + 's', (t2 / t1).toFixed(1)+'x', 'slower.');
	}());return;
	(function(){ // always do this last!
		var t1 = perf.now();
		perf(function(i){
			setTimeout(function(){
				if(i === 1){
					cb1();
				}
			},0);
		}); var cb1 = function(){
			console.log('setTimeout: native', (t1 = (perf.now() - t1)/1000) + 's', (t1 / t2).toFixed(1)+'x', 'slower.');
		}
		var t2 = perf.now();
		perf(function(i){
			setImmediate(function(){
				if(i === 1){
					cb2();
				}
			});
		}); var cb2 = function(){
			console.log('setImmediate: gun', (t2 = (perf.now() - t2)/1000) + 's', (t2 / t1).toFixed(1)+'x', 'slower.');
		}
	}());
});