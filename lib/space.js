;(function(){
	var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');
	var ify = Gun.node.ify, empty = {}, u;
	console.log("Index space is beta, API may change!");
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
		var cb = (opt instanceof Function && opt), rank = (opt||empty).rank || opt, root = gun.back(-1), tmp;
		gun.get(function(soul){
			if(!soul){
				soul = (gun.back('opt.uuid') || Gun.text.random)(9);
			}
      /*var space = ify({}, soul), sub = space, l = 0, tmp;
      var atom = Gun.text.ify({get: key, put: data});
      Gun.list.map(index(0, key.length), function(i){
          sub[(tmp = key.slice(l, i))+'"'] = atom;
          sub = sub[tmp] = ify({}, soul+'"'+key.slice(0,i));
          l = i;
      });
      tmp = {}; tmp[key] = atom.put; tmp = ify(tmp, soul+'"');
      sub[key.slice(l, key.length)] = tmp;
      console.log('????', space);*/
			var shell = {}, l = 0, tmp;
			var atom = Gun.text.ify({get: key, put: data});
			tmp = {}; tmp[key] = data;
			shell.$ = ify(tmp, soul);
			tmp = {}; tmp[key.slice(0,l = 1)] = atom;
			shell[0] = ify(tmp, soul+'"');
			Gun.list.map(index(1, key.length), function(i){
				tmp = {}; tmp[key.slice(l,i)] = atom;
				shell[i] = ify(tmp, soul+'"'+key.slice(0,l));
				l = i;
			});
			tmp = {}; tmp[key.slice(l, key.length)] = atom;
			shell[l+1] = ify(tmp, soul+'"'+key.slice(0,l));
			//tmp = {}; tmp[key.slice(l, key.length)] = Gun.val.link.ify(soul); shell[l+1] = ify(tmp, soul+'"'+key.slice(0,l));
			//console.log('???', shell);
			gun.put(shell, cb, {soul: soul, shell: shell});
		},true);
		return gun;
	}
	function travel(key, cb, opt, ref){
		var root = ref.back(-1), tmp;
		opt = opt || {};
		opt.ack = opt.ack || {};
		ref.get(function(soul){
			ref.get(key).get(function(msg, eve){
				eve.off();
				opt.exact = true;
				opt.ack.key = key;
				opt.ack.data = msg.put;
				if(opt.match){ cb(opt.ack, key, msg, eve) }
			});
			//if(u !== msg.put){
			//	cb(msg.put, msg.get, msg, eve);
			//	return;
			//}
			opt.soul = soul;
			opt.start = soul+'"';
			opt.key = key;
			opt.top = index(0, opt.find);
			opt.low = opt.top.reverse();
			find(opt, cb, root);
		}, true);
	}
	function find(o, cb, root){
		var id = o.start+o.key.slice(0,o.low[0]);
		root.get(id).get(function(msg, eve){
			eve.off();
			o.ack.tree = {};
			if(u === msg.put){
				if(!o.exact){ return o.match = true }
				cb(o.ack, id, msg, eve);
				return;
				o.low = o.low.slice(1);
				if(!o.low.length){
					cb(u, o.key, msg, eve);
					return;
				}
				find(o, cb, root);
				return;
			}
			Gun.node.is(msg.put, function(v,k){
				if(!(k = Gun.obj.ify(v) || empty).get){ return }
				o.ack.tree[k.get] = k.put;
			});
			if(!o.exact){ return o.match = true }
			cb(o.ack, id, msg, eve);
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
