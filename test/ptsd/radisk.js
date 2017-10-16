var Radix = require('../../lib/radix');
var Radisk = require('../../lib/radisk');
var Store = require('../../lib/store');
//var Store = require('../../lib/rs3');
var Gun = require('../../gun');
var fs = require('fs');

var TOTAL = 25000;
var c = 0;
var acked = 0;
var start;
var diff;

(function(){//return;
	//var opt = {size: 1024 * 1024};
	//opt.store = Store(opt);
	//var radix = Radisk();
	var gun = Gun();
	var gtr = gun._.opt.uuid;
	var l = 2000;
	var last = start;
	var t = Gun.time.is;
	var at = c;
	;(function(){

		start = Gun.time.is();
		gun.get('j59an5jj2LUW8IJXl0u3').get('foo').on(function(data){
			/*Radix.map(data, function(val, key){
				console.log('>>>', key, val);
			})*/
			console.log("************", data, 'in', (Gun.time.is() - start)/1000);
			setTimeout(function(){
				console.debug.i=1;console.log("----------------------");
				start = Gun.time.is();
				gun.get('j59an5jj2LUW8IJXl0u3').on(function(data){
					console.log("*****", data, 'in', (Gun.time.is() - start)/1000);
				})
			},2000);
		});

	}());
	return;

	var toc, alldone = function(){
		acked++;
		if(acked < TOTAL){ return }
		diff = (Gun.time.is() - start) / 1000;
		clearTimeout(toc);
		toc = setTimeout(CHECK,5000);
	}
	function bench(){
		for(var i = 0; i < l; i++){
			act(i);
		}
	}
	start = Gun.time.is();
	var it = setInterval(bench, 1);

	function act(i){
		if(c >= (TOTAL)){ clearInterval(it); return; }
		++c;
		var ref = gun.get(gtr());
		ref.put({
			val: c,
			foo: 'hello ' + c,
			why:  c + 'not?'   
		}, alldone);
		setTimeout(function(){ ref.off(); },1);
		//radix(gtr(), Gun.text.random(3), alldone);
		//radix(c, Math.random()/* + '\n' + Gun.text.random(3)*/, alldone);
		//radix(Gun.text.random(5), Math.random(), alldone);
		if(c % 50000 === 0){
			var now = t();
			console.log(c);//, (now - last)/1000);
			at = c;
			last = now; 
		}
	}
}());

function CHECK(){
	console.log(Math.floor(c / diff), 'disk writes per second', acked, 'of', c);
	var opt = {batch: 5, wait: 500};
	opt.store = Store(opt);
	var radix = Radisk(opt);
	var all = {};
	var to;
	var i = c || TOTAL;
	/*while(--i){
		all[i] = true;
	}*/
	var dir = fs.readdirSync('radata'), i = 0;
	function readcheck(i){
		var file = dir[i];
		if(!file){
			var len = Object.keys(all).length;
			console.log("how many?", len);
			if(len < TOTAL){ return }
			var missing = [];
			var fail = Gun.obj.map(all, function(val, key){
				if(val){ missing.push(key); return true }
			});
			//console.log(all);
			console.log("DONE!", 'Verify ALL writes:', fail? '!!!FAIL!!!!' : 'YES');// '. Missing:', missing);
			return;
		}
		radix.parse(file, function(err, rad){
			Radix.map(rad, function(val, key){
				all[key] = false;
			});
			readcheck(++i);
		})
	}
	readcheck(i);
}