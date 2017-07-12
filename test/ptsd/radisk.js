var Radix = require('../../lib/radix');
var Radisk = require('../../lib/radisk');
var Gun = require('../../gun');
var fs = require('fs');

var TOTAL = 1000000;
var c = 0;
var acked = 0;
var start;
var diff;

(function(){//return;
	var radix = Radisk();
	var gtr = Gun()._.opt.uuid;
	var l = 500000;
	var last = start;
	var t = Gun.time.is;
	var at = c;
	var toc, alldone = function(){
		acked++;
		if(acked < TOTAL){ return }
		diff = (Gun.time.is() - start) / 1000;
		clearTimeout(toc);
		toc = setTimeout(CHECK,1000);
	}
	function bench(){
		if(c >= (TOTAL)){ return clearInterval(it); }
		for(var i = 0; i < l; i++){
			radix(++c, gtr(), alldone);
			if(c % 50000 === 0){
				var now = t();
				console.log(c);//, (now - last)/1000);
				at = c;
				last = now; 
			}
		}
	}
	start = Gun.time.is();
	var it = setInterval(bench, 1);
}());

function CHECK(){
	console.log(Math.floor(c / diff), 'disk writes per second');
	var disk = Radisk();
	var all = {};
	var to;
	var i = TOTAL;
	/*while(--i){
		all[i] = true;
	}*/
	var dir = fs.readdirSync('radata');
	dir.forEach(function(file){
		disk.read(file, function(err, rad){
			Radix.map(rad, function(val, key){
				all[key] = false;
				clearTimeout(to);
				to = setTimeout(function(){
					var len = Object.keys(all).length;
					console.log("how many?", len);
					if(len < TOTAL){ return }
					var missing = [];
					var fail = Gun.obj.map(all, function(val, key){
						if(val){ missing.push(key); return true }
					});
					//console.log(all);
					console.log("DONE!", 'Verify ALL writes:', fail? '!!!FAIL!!!!' : 'YES');// '. Missing:', missing);
				},1000);
			})
		})
	})
}