var Gun = require('../../gun');
require('../../lib/memdisk');
//require('../../lib/file');

var gun = Gun();
var TOTAL = 10000000;
var c = 1000, big = "big";
while(--c){big += "big"}
c = 0;

var to = setInterval(function(){
	if(TOTAL < c){ return clearTimeout(to) }
	var i = 100;
	while(--i){
		it(i);
	}
},2);

function it(i){
	c++;
	var key = Gun.text.random(5);
	gun.get(key).put({data: Math.random() + big + Math.random()});
	setTimeout(function(){
		gun.get(key).off();
	},5);
	if(c % 5000){ return }
	if(typeof process === 'undefined'){ return }
	//try{global.gc()}catch(e){console.log(e)}
	var mem = process.memoryUsage();
	console.log(((mem.heapUsed / mem.heapTotal) * 100).toFixed(0) + '% memory with', Object.keys(gun._.graph).length, 'memory nodes, put', c);
}