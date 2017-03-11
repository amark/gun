
return;
var Gun = require('./root');
var onto = require('./onto');
function Chain(back){
	var at = this._ = {back: back, on: onto, $: this, next: {}};
	at.root = back? back.root : at;
	at.on('in', input, at);
	at.on('out', output, at);
}
var chain = Chain.prototype;
chain.back = function(arg){ var tmp;
	if(tmp = this._.back){
		return tmp.$;
	}
}
chain.next = function(arg){
	var at = this._, cat;
	if(cat = at.next[arg]){
		return cat.$;
	}
	cat = (new Chain(at)._);
	at.next[arg] = cat;
	cat.key = arg;
	return cat.$;
}
chain.get = function(arg){
	if(typeof arg == 'string'){
		var at = this._, cat;
		if(cat = at.next[arg]){
			return cat.$;
		}
		cat = (this.next(arg)._);
		if(at.get || at === at.root){
			cat.get = arg;
		}
		return cat.$;
	} else {
		var at = this._;
		var out = {'#': Gun.text.random(), get: {}, cap: 1};
		var to = at.root.on(out['#'], get, {next: arg})
		at.on('in', get, to);
		at.on('out', out);
	}
	return this;
}
function get(env){
	var as = this.as;
	if(as.next){
		as.next(env, this);
	}
}
chain.map = function(cb){
	var at = this._;
	var chain = new Chain(at);
	var cat = chain._;
	var u;
	at.on('in', function(env){ var tmp;
		if(!env){ return }
		var cat = this.as;
		var to = this.to;
		if(tmp = env.put){
			to.next(env);
			Gun.obj.map(tmp, function(data, key){
				if('_' == key){ return }
				if(cb){
					data = cb(data, key);
					if(u === data){ return }
				}
				cat.on('in', Gun.obj.to(env, {put: data}));
			});
		}
	}, cat);
	return chain;
}
function input(env){ var tmp;
	if(!env){ return }
	var cat = this.as;
	var to = this.to;
	if(tmp = env.put){
		if(tmp && tmp['#'] && (tmp = Gun.val.rel.is(tmp))){
			//input.call(this, Gun.obj.to(env, {put: cat.root.put[tmp]}));
			return;
		}
		cat.put = tmp;
		to.next(env);
		var next = cat.next;
		Gun.obj.map(tmp, function(data, key){
			if(!(key = next[key])){ return }
			key.on('in', Gun.obj.to(env, {put: data}))
		});
	}
}
function output(env){ var tmp;
	var u;
	if(!env){ return }
	var cat = this.as;
	var to = this;
	if(!cat.back){
		env.test = true;
		env.gun = cat.root.$;
		Gun.on('out', env);
		return;
	}
	if(tmp = env.get){
		if(cat.get){
			env = Gun.obj.to(env, {get: {'#': cat.get, '.': tmp}});
		} else
		if(cat.key){
			env = Gun.obj.to(env, {get: Gun.obj.put({}, cat.key, tmp)});
		} else {
			env = Gun.obj.to(env, {get: {'*': tmp}})
		}
	}
	cat.back.on('out', env);
}
chain.val = function(cb, opt){
	var at = this._;
	if(cb){
		if(opt){
		} else {
			if(at.val){
				cb(at.put, at.get, at);
			}
		}
		this.get(function(env, ev){
			cb(env.put, env.get, env);
		});
	}
}




var graph = {
		app: {_:{'#':'app'},
			foo: {_:{'#':'foo'},
				bar: {'#': 'asdf'},
				rab: {'#': 'fdsa'}
			}/*,
			oof: {_:{'#':'oof'},
				bar: {bat: "really"},
				rab: {bat: "nice!"}
			}*/
		},
		asdf: {_:{'#': 'asdf'}, baz: "hello world!"},
		fdsa: {_:{'#': 'fdsa'}, baz: "world hello!"}
	}
Gun.on('out', function(env){
	if(!env.test){ return }
	setTimeout(function(){
		console.log("reply", env.get);
		env.gun._.on('in', {'@': env['#'],
			put: Gun.graph.node(graph[env.get['#']])
		});
		return;
		env.gun._.on('in', {put: graph, '@': env['#']});
	},100);
});
setTimeout(function(){

	//var c = new Chain(), u;
	//c.get('app').map().map(x => x.bat? {baz: x.bat} : u).get('baz').val(function(data, key, env){
	//	console.log("envelope", env);
	//});

},1000);

	