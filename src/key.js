
var Gun = require('./core');
var obj = Gun.obj, obj_is = obj.is, obj_put = obj.put, obj_map = obj.map, obj_empty = obj.empty;
var num = Gun.num, num_is = num.is;
var _soul = Gun.val.rel._, _field = '.';


;(function(){
	Gun.chain.key = function(index, cb, opt){
		if(!index){
			if(cb){
				cb.call(this, {err: Gun.log('No key!')});
			}
			return this;
		}
		var gun = this;
		if(typeof opt === 'string'){
			console.log("Please report this as an issue! key.opt.string");
			return gun;
		}
		if(gun === gun._.root){if(cb){cb({err: Gun.log("Can't do that on root instance.")})};return gun}
		opt = opt || {};
		opt.key = index;
		opt.any = cb || function(){};
		opt.ref = gun.back(-1).get(opt.key);
		opt.gun = opt.gun || gun;
		gun.on(key, {as: opt});
		if(!opt.data){
			opt.res = Gun.on.stun(opt.ref);
		}
		return gun;
	}
	function key(at, ev){ var opt = this;
		ev.off();
		opt.soul = Gun.node.soul(at.put);
		if(!opt.soul || opt.key === opt.soul){ return opt.data = {} }
		opt.data = obj_put({}, keyed._, Gun.node.ify(obj_put({}, opt.soul, Gun.val.rel.ify(opt.soul)), '#'+opt.key+'#'));
		(opt.res||iffe)(function(){
			opt.ref.put(opt.data, opt.any, {soul: opt.key, key: opt.key});				
		},opt);
		if(opt.res){
			opt.res();
		}
	}
	function iffe(fn,as){fn.call(as||{})}
	function keyed(f){
		if(!f || !('#' === f[0] && '#' === f[f.length-1])){ return }
		var s = f.slice(1,-1);
		if(!s){ return }
		return s;
	}
	keyed._ = '##';
	Gun.on('next', function(at){
		var gun = at.gun;
		if(gun.back(-1) !== at.back){ return }
		gun.on('in', pseudo, gun._);
		gun.on('out', normalize, gun._);
	});
	function normalize(at){ var cat = this;
		if(!at.put){
			if(at.get){
				search.call(at.gun? at.gun._ : cat, at);
			}
			return;
		}
		if(at.opt && at.opt.key){ return }
		var put = at.put, graph = cat.gun.back(-1)._.graph;
		Gun.graph.is(put, function(node, soul){
			if(!Gun.node.is(graph['#'+soul+'#'], function each(rel,id){
				if(id !== Gun.val.rel.is(rel)){ return }
				if(rel = graph['#'+id+'#']){
					Gun.node.is(rel, each); // correct params?
					return;
				}
				Gun.node.soul.ify(rel = put[id] = Gun.obj.copy(node), id);
			})){ return }
			Gun.obj.del(put, soul);
		});
	}
	function search(at){ var cat = this;
		var tmp;
		if(!Gun.obj.is(tmp = at.get)){ return }
		if(!Gun.obj.has(tmp, '#')){ return }
		if((tmp = at.get) && (null === tmp['.'])){
			tmp['.'] = '##';
			return;
		}
		if((tmp = at.get) && Gun.obj.has(tmp, '.')){
			if(tmp['#']){
				cat = cat.root.gun.get(tmp['#'])._;
			}
			tmp = at['#'];
			at['#'] = Gun.on.ask(proxy);
		}
		var tried = {};
		function proxy(ack, ev){
			var put = ack.put, lex = at.get;
			if(!cat.pseudo || ack.via){ // TODO: BUG! MEMORY PERF! What about unsubscribing?
				//ev.off();
				//ack.via = ack.via || {};
				return Gun.on.ack(tmp, ack);
			}
			if(ack.put){
				if(!lex['.']){
					ev.off();
					return Gun.on.ack(tmp, ack);
				}
				if(obj_has(ack.put[lex['#']], lex['.'])){
					ev.off();
					return Gun.on.ack(tmp, ack);
				}
			}
			Gun.obj.map(cat.seen, function(ref,id){ // TODO: BUG! In-memory versus future?
				if(tried[id]){
					return Gun.on.ack(tmp, ack);
				}
				tried[id] = true;
				ref.on('out', {
					gun: ref,
					get: id = {'#': id, '.': at.get['.']},
					'#': Gun.on.ask(proxy)
				});
			});
		}
	}
	function pseudo(at, ev){ var cat = this;
		// TODO: BUG! Pseudo can't handle plurals!?
		if(cat.pseudo){
			//ev.stun();return;
			if(cat.pseudo === at.put){ return }
			ev.stun();
			cat.change = cat.changed || cat.pseudo;
			cat.on('in', Gun.obj.to(at, {put: cat.put = cat.pseudo}));
			return;
		}
		if(!at.put){ return }
		var rel = Gun.val.rel.is(at.put[keyed._]);
		if(!rel){ return }
		var soul = Gun.node.soul(at.put), resume = ev.stun(resume), root = cat.gun.back(-1), seen = cat.seen = {};
		cat.pseudo = cat.put = Gun.state.ify(Gun.node.ify({}, soul));
		root.get(rel).on(each, {change: true});
		function each(change){
			Gun.node.is(change, map);
		}
		function map(rel, soul){
			if(soul !== Gun.val.rel.is(rel)){ return }
			if(seen[soul]){ return }
			seen[soul] = root.get(soul).on(on, true);
		}
		function on(put){
			if(!put){ return }
			cat.pseudo = Gun.HAM.union(cat.pseudo, put) || cat.pseudo;
			cat.change = cat.changed = put;
			cat.put = cat.pseudo;
			resume({
				gun: cat.gun,
				put: cat.pseudo,
				get: soul
				//via: this.at
			});
		}
	}
	var obj = Gun.obj, obj_has = obj.has;
}());

	