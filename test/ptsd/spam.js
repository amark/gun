;(function(){
window.SPAM = function(cb, opt){
	opt = Gun.num.is(opt)? {each: opt} : opt || {};
	opt.wait = opt.wait || 1;
	setInterval(burst, opt.wait);

var n = Gun.time.is(), i = 0, c = 0, b = opt.burst || 10, l = opt.each || 100;
var r = Gun.text.random, raw;

function save(i){
	if(!window.SPAM){ return }
	if(i > l){
		return clearTimeout(t);
	}
	cb(i, i + raw + i);
}
function burst(){
	raw = r(1000000);
	for(var j = 0; j <= b; j++){
		save(++i);
	}
}
var t;
}
}());

var gun = Gun({localStorage: false, peers: 'http://localhost:8765/gun'});
var g = gun.get('test');
var room = Gun.text.random(100);
var pub = Gun.text.random(1000);
SPAM(function(i, v){
	//console.log(Gun.state(), i);return;
	console.log(i);
	var ref = g.set({
		a: v,
		b: i,
		c: room,
		d: pub
	}, function(ack){
		ref.off();
	});
}, 99999999999999);

/*
;(function(){
	$("#say").on('submit', function(){
		setTimeout(function(){
			$("#say").find('input').first().val(Gun.text.random(1000));
		},1);
	});
});
*/