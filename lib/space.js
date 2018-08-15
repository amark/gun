;(function(){
	var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');
	var ify = Gun.node.ify, empty = {}, u;
	Gun.chain.space = function(key, data, opt){
		if(data instanceof Function){
			return travel(key, data, opt, this);
		}
		var gun = this;
		if(Gun.is(data)){
			data.get(function(soul){
				if(!soul){
					return cb && cb({err: "Indexspace cannot link `undefined`!"});
				}
				gun.space(key, Gun.val.link.ify(soul), opt);
			}, true);
			return gun;
		}
		var cb = (opt instanceof Function && opt), rank = (opt||empty).rank || opt, tmp;
		gun.get(function(soul){
			if(!soul){
				soul = (gun.back('opt.uuid') || Gun.text.random)(9);
			}
			var space = ify({}, soul), sub = space, l = 0, tmp;
			Gun.list.map(index(0, key.length), function(i){
				sub[(tmp = key.slice(l, i))+'"'] = data;
				sub = sub[tmp] = ify({}, soul+'"'+key.slice(0,i));
				l = i;
			});
			tmp = {}; tmp[key] = data; tmp = ify(tmp, soul+'"');
			sub[key.slice(l, key.length)] = tmp;
			//console.log(space);
			gun.put(space, cb);
		},true);
		return gun;
	}
	function travel(key, cb, opt, ref){
		var root = ref.back(-1), tmp;
		opt = opt || {};
		ref.get(function(soul){
			root.get(soul+'"').get(key).get(function(msg, eve){
				if(u !== msg.put){
					eve.off();
					cb(msg.put, msg.get, msg, eve);
					return;
				}
				opt.soul = soul;
				opt.start = soul+'"';
				opt.key = key;
				opt.top = index(0, opt.find);
				opt.low = opt.top.reverse();
				find(opt, cb, root);
			});
		}, true)
	}
	function find(o, cb, root){
		var id = o.start+o.key.slice(0,o.low[0]);
		root.get(id).get(function(msg, eve){
			eve.off();
			console.log("oh my!", msg.put, o.start);
		});
	}
	function index(n, m, l, k){
		l = l || [];
		if(!m){ return l }
	  k = Math.ceil((n||1) / 10);
	  if((n+k) >= m){ return l }
	  l.push(n + k);
	  return index(n + k, m, l);
	}
}());

/*
gun.user('google').space('martti', "testing 123!");
gun.user('google').get('search').space('ma', function(){
	// tree & index
	// UNFINISHED API!
});
*/
