var fs = require('fs');
var Gun = require('gun');

function Radix(){
	var radix = {};
	var tree = radix._ = {};
	var gbm = Gun.obj.map;
	radix.add = function(key, val, t){
		t = t || tree;
		var i = 0, l = key.length-1, k = key[i], at;
		while(!(at = t[k]) && i < l){
			k += key[++i];
		}
		if(!at){
			if(!gbm(t, function(r, s){
				var ii = 0, kk = '';
				while(s[ii] == key[ii]){
					kk += s[ii++];
				}
				if(kk){
					var _ = {};
					_[s.slice(ii)] = r;
					_[key.slice(ii)] = {$: val};
					t[kk] = {_: _};
					delete t[s];
					return true;
				}
			})){
				(t[k] || (t[k] = {})).$ = val;
			}
		} else 
		if(i == l){
			at.$ = val;
		} else {
			return radix.add(key.slice(++i), val, at._);
		}
	}
	return radix;
}



(function(){
	var radix = Radix();
	radix.add('user/marknadal', 'asdf');
	radix.add('user/ambercazzell', 'dafs');
	radix.add('user/taitforrest', 'sadf');
	radix.add('user/taitveronika', 'fdsa');
	radix.add('user/marknadal', 'foo');
	console.log("__________________");
	console.log(radix._);
	fs.writeFileSync('radix-data.json', JSON.stringify(radix._, null, 2));
}());
(function(){return;
	var radix = Radix();
	var gtr = Gun.text.random;
	var c = 0, l = 10;
	function bench(){
		if(c > 1000){ return clearInterval(it), console.log(radix._, Object.keys(radix._).length), fs.writeFileSync('radix-data.json', JSON.stringify(radix._, null, 2)); }
		for(var i = 0; i < l; i++){
			radix.add(gtr(7), c++);
		}
		//if(c % 1000 === 0){ console.log(radix._) }
	}
	var it = setInterval(bench, 1);
}());