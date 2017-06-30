var fs = require('fs');
var Gun = require('gun');
var gbm = Gun.obj.map, no = {}, u;

function Radix(){
	var radix = function(key, val, t){
		t = t || tree;
		var i = 0, l = key.length-1, k = key[i], at, tmp;
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
					if(u === val){ return (tmp || (tmp = {}))[s.slice(ii)] = r; }
					var _ = {};
					_[s.slice(ii)] = r;
					_[key.slice(ii)] = {$: val};
					t[kk] = {_: _};
					delete t[s];
					return true;
				}
			})){
				if(u === val){ return; }
				(t[k] || (t[k] = {})).$ = val;
			} else
			if(u === val){
				return tmp;
			}
		} else 
		if(i == l){
			if(u === val){ return (u === (tmp = at.$))? at._ : tmp }
			at.$ = val;
		} else {
			return radix(key.slice(++i), val, at._);
		}
	}
	var tree = radix._ = {};
	return radix;
}



(function(){
	var radix = Radix();
	radix('user/marknadal', 'asdf');
	radix('user/ambercazzell', 'dafs');
	radix('user/taitforrest', 'sadf');
	radix('user/taitveronika', 'fdsa');
	radix('user/marknadal', 'foo');
	radix('user/table', 'foo');
	console.log("__________________");
	console.log(radix._);
	console.log(radix('user/table'));
	//fs.writeFileSync('radix-data.json', JSON.stringify(radix._, null, 2));
}());
(function(){return;
	var radix = Radix();
	var gtr = Gun.text.random;
	var c = 0, l = 10;
	function bench(){
		if(c > 1000){ return clearInterval(it), console.log(radix._, Object.keys(radix._).length), fs.writeFileSync('radix-data.json', JSON.stringify(radix._, null, 2)); }
		for(var i = 0; i < l; i++){
			radix(gtr(7), c++);
		}
		//if(c % 1000 === 0){ console.log(radix._) }
	}
	var it = setInterval(bench, 1);
}());

function Radisk(){
	var radix = Radix();
	var radisk = function(key, val, cb){
		if(val instanceof Function){
			cb = val;
			val = radix(key);
			if(u !== val){
				return cb(null, val);
			}
			return console.log("read from disk");
		}
		radix(key, val);
		if(!to){ return flush(to = true) }
		clearTimeout(to);
		to = setTimeout(flush, opt.wait)
	};
	var opt = {file: 'radix', size: 1024 * 1024 * 2, wait: 10 * 1000, batch: 10 * 1000}, to;

	var flush = function(){

	}
	var read = function(path){
		return fs.readFileSync(nodePath.join(dir, path)).toString();
	}

	var write = function(path, data){
		return fs.writeFileSync(nodePath.join(dir, path), data);
	}

	var mk = function(path){
		path = nodePath.join(dir, path);
	  if(fs.existsSync(path)){ return }
		fs.mkdirSync(path);
	}
	return radisk;
}