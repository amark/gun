(function(){
	if(!this.Gun){ return }
	function Test(o){
		var test = this;
		if(!(test instanceof Test)){ return new Test(o) }
		test._ = {};
		test._.stack = [];
		return test;
	}
	Test.chain = Test.prototype;
	Test.chain.run = function(fn){
		var test = this;
		var e = test._.i, i = 0;
		var stack = test._.stack;
		stack.push(fn);
		//var to = setInterval(function(){ if(++i >= e){ return clearTimeout(to) }
		var start = Gun.time.is();
		while(++i <= e){
			Gun.list.map(stack, function(fn){ (fn||function(){})(i) })
		}
		console.log((Gun.time.is() - start) / 1000);
		//},0);
		return test;
	}
	Test.chain.it = function(i){
		var test = this;
		test._.i = i || 1000;
		return test;
	}
	Test.chain.gen = function(fn){
		var test = this;
		test._.stack.push(fn);
		return test;
	}
	var gun = window.gun = Gun(); //Gun('http://localhost:8080/gun');
	window.SPAM = function(read){ // TODO: BUG? gun-sid in transport layer not correct?
		//localStorage.clear();
		var start = Gun.time.is();
		/*var mark = {
			name: "Mark Nadal"
		};
		var amber = {
			name: "Amber Nadal",
			spouse: mark
		}
		mark.spouse = amber;
		amber.pet = {
			name: "Fluffy",
			slave: mark
		}
		Test().it(read).gen(function(i){
			Gun.ify(mark);
		}).run();return;*/
		Test().it(read).gen(function(i){
			gun.get('users').path(i).path('where').put({lat: Math.random(), lng: Math.random(),i:i});
		}).run();return;
		Test().it(read === true? 1 : read || 1000).gen(function(i){
			if(read === true){
				gun.get('users').map().path('where').on(function(node){
					console.log("node:", node);
					if(node.i === (1000)){
						console.log("total:", Gun.time.is() - start);
						start = Gun.time.is();
					}
				});
				return;
			}
			// PUT, GET, PATH, ON
			var now = Gun.time.is();
			/*var obj = {'i': i, 'v': Gun.text.random(100)};
			gun.put(obj, function(err, ok){
				//console.log("put done", i, 'in', Gun.time.is() - now);//, i % 1000);
				if(i % (1000) === 0){
					console.log("total:", Gun.time.is() - start);
					start = Gun.time.is();
				}
			});return;*/
			gun.get('users').path(i).path('where').put({
				lat: Math.random(),lng: Math.random(),i: i
				//lol: i / 2
			}, function(err, ok){
				console.log("put done", i, 'in', Gun.time.is() - now);//, i % 1000);
				if(i % (1000) === 0){
					console.log("total:", Gun.time.is() - start);
					start = Gun.time.is();
				}
			});return;
		}).run(function(){});
	}
	//window.SPAM(1000000);
}());
/* EXTRA GUN UTILITY FUNCTIONS I MIGHT WANT TO KEEP
(function(){
	Gun().get('chat').path('messages').since(Gun().get('me').path('last')).map().val(function(msg){

	});
	Gun().get('chat').path('messages').last(100).map().val(function(msg){
	});

var peers = [
    peer1,
    peer2
];

Gun.on('put').event(function(graph, cb, opt){
	Gun.is.graph(graph, function(node, soul){
		localStorage[soul] = node;
	});
});
Gun.on('put').event(function(graph, cb, opt){
	Peers(opt.peers).send({
		id: MsgID,
    value: data,
    from: myPeerID
  }, cb);
});

Gun.on('get').event(function(lex, cb, opt){
	Peers(opt.peers || peers).send({
    '#': MsgID,
    '$': lex,
    '~': myPeerID
  }, cb);
});

Peers.server(function(req, res){
	if(Msg.IDs[req.id]){ return } // throttle
	// auth
	Peers(peers).send(req); // relay
	// auth
	if(req.rid){ return } // ignore
	if(req.put && opt.everything || graph[for soul in req.body]){ // process
		Gun.put(gun, req.body, REPLY);
	}
});

// TODO: MARK / JESSE need to solve infinite circular loop on get flushing and put flushing.

GUN = {'#': 'soul', '.': 'field', '=': 'value', '>': 'state'}
MSG = {'#': 'id', '$': 'body', '@': 'to'}

Gun.wire = function(data){

}
Gun.get.wire = function(lex, cb, opt){ return Gun.text.is(lex)? Gun.get.wire.from(lex, cb, opt) : Gun.get.wire.to(lex, cb, opt) }
Gun.get.wire.to = function(lex, cb, opt){
	var t = '';
	Gun.obj.map(lex, function(v,f){
		if(!v){ return }
		Gun.list.map(Gun.list.is(v)? v : [v], function(v){
			t += f + "'" + Gun.put.wire.ify(v) + "'";
		});
	});
	return t + '?';
}
Gun.get.wire.from = function(t, cb, opt){
	if(!t){ return null }
	var a = Gun.put.wire.from.parse(t), lex = {};
	Gun.list.map([Gun._.soul, Gun._.field, Gun._.value, Gun._.state], function(sym, i){
		if(!(i = a.indexOf(sym) + 1)){ return }
		lex[sym] = Gun.put.wire.type(a[i]);
	});
	return lex;
}
// #soul.field
// "#soul.field=value>state"
// #messages>>1234567890 //{soul: 'messages', state: {'>': 1234567890}}
// #id$"msg"~who@to

Gun.put.wire = function(n, cb, opt){ return Gun.text.is(n)? Gun.put.wire.from(n, cb, opt) : Gun.put.wire.to(n, cb, opt) }
Gun.put.wire.ify = function(s){ var tmp;
	if(Infinity === s || -Infinity === s){ return s }
	if(tmp = Gun.is.rel(s)){ return '#' + JSON.stringify(tmp) }
	return JSON.stringify(s)
}
Gun.put.wire.type = function(s){ var tmp;
	if(Gun._.soul === s.charAt(0)){ return Gun.is.rel.ify(JSON.parse(s.slice(1))) }
	if(String(Infinity) === s){ return Infinity }
	if(String(-Infinity) === s){ return -Infinity }
	return JSON.parse(s) 
}
Gun.put.wire.to = function(n, cb, opt){ var t, b;
	if(!n || !(t = Gun.is.node.soul(n))){ return null }
	cb = cb || function(){};
	t = (b = "#'" + Gun.put.wire.ify(t) + "'");
	var val = function(v,f, nv,nf){
		var w = '', s = Gun.is.node.state(n,f), sw = '';
		if(!s){ return }
		w += ".'" + Gun.put.wire.ify(f) + "'";
		console.log("yeah value?", v, Gun.put.wire.ify(v));
		w += "='" + Gun.put.wire.ify(v) + "'";
		if(s !== Gun.is.node.state(n,nf)){
			w += ">'" + Gun.put.wire.ify(s) + "'";
		} else {
			sw = ">'" + Gun.put.wire.ify(s) + "'";
		}
		t += w;
		w = b + w + sw;
		cb(null, w);
	}
	var next = function(v,f){ // TODO: BUG! Missing adding meta data.
		if(Gun._.meta === f){ return }
		if(next.f){ 
			val(next.v, next.f, v,f);
		}
		next.f = f;
		next.v = v;
	}
	Gun.obj.map(n, next);
	next();
	return t;
}
Gun.put.wire.from = function(t, cb, opt){
	if(!t){ return null }
	var a = Gun.put.wire.from.parse(t);
	Gun.list.map(a, function(v, i){
		if(Gun._.soul === v){
			Gun.is.node.soul.ify(n, Gun.put.wire.type(a[i]));
			return;
		}
		if(Gun._.field === v){
			var val = a.indexOf(Gun._.value,i), state = a.indexOf(Gun._.state,i);	
			Gun.is.node.state.ify([n], Gun.put.wire.type(a[i]), Gun.put.wire.type(a[val+1]), Gun.put.wire.type(a[state+1]));
			return;
		}
	})
	return n;
}
Gun.put.wire.from.parse = function(t){
	var a = [], s = -1, e = 0, end = 1, n = {};
	while((e = t.indexOf("'", s + 1)) >= 0){
		if(s === e || '\\' === t.charAt(e-1)){}else{
			a.push(t.slice(s + 1,e));
			s = e;
		}
	}
	return a;
}
}());
*/

;(function(){ // make as separate module!
	function SQL(){}
	SQL.select = function(sel){
		this._.sql.select = sel;
		return this;
	}
	SQL.from = function(from){
		this._.sql.from = from;
		//this.get(from).map();
		return this;
	}
	SQL.where = function(where){
		this._.sql.where = where;
		return this;
	}
	Gun.chain.sql = function(sql){
		var gun = this;//.chain();
		sql = gun._.sql = sql || {};
		gun.select = SQL.select;
		gun.from = SQL.from;
		gun.where = SQL.where;
		return gun;
	}

	Gun.on('chain').event(function(gun, at){
		console.log("sql stuff?", gun._, at.node);
		var query = gun._.sql;
		if(!query){ return }
		var node = at.node;
	});
}());