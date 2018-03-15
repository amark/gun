;(function(){
	// Performance Testing Stress Development
	// Performance Testing Style Development
	// Performance Testing Speed Development
	// Performance Testing Superior Development
	// Performance Testing Snippet Development
	// Performance Testing Skilled Development
	// Performance Testing Steady Development
	// Performance Testing Stepwise Development
	// Performance Testing Strong Development
	// Performance Testing Specified Development
	// Performance Testing Stipulated Development
	// Performance Testing Systematic Development

	/*
		******* START AT THE BOTTOM AND READ UP *******
	*/
	window.i = 1;
	window.localStorage = window.localStorage || {clear: function(){}};
	if(!this.stool){ return }
	setTimeout(function(){
		stool.run();
	},1);
	stool.setup(window.setup = function(){
			var list = [1,2,3];
			var add = function(a,b){ return a + b };
			var addprop = function(a,b){ return a.num + b.num };
			//var i = 1;
			var pos = {lat: Math.random(), lng: Math.random(), i: i};
			var f1 = function(a){ return a };
			var f2 = function(a,b){ return b };
			var f3 = function(a,b){ return a + b };
			var f4 = function(a,b){ return b + a };
			var f5 = function(a,b,c){ return a + b + c };
			//window.localStorage.clear();
			var g = window.g = window.g || Gun();
			//gun.get('users').path(1).path('where').put(pos);
			//var got = gun.get('hewo');
			//got.put({hello: 'world'});
			var on = Gun.on;
			on('data', function(o){
				o.a = false;
			});
			on('data', function(o){
				o.b++;
			});
			on('data', function(o){
				o.c = 'Hi!';
			});
			on('data', function(o){
				//console.log('last', o);
			});
			var obj = {a: true, b: 1, c: 'Hello world!'};
			var data = {users: {1: {where: {lat: Math.random(), lng: Math.random(), i: 1}}}};

			var any = function(err, node){
				//console.log('any', err, node);
			}
			var ok = function(node, field){
				//$('#log').append(field  + ' ' + Gun.text.ify(node));
				//console.log('ok', field, node);
			}
			var err = function(err){
				console.log(err);
			}
			function fn(){};

			function Thing(){
				this._ = {};
			}
			Thing.prototype.get = function(lex){
				var gun = this, at = gun._;
				return gun;
			}
			Thing.prototype.on = function(cb){
				var gun = this, at = gun._;
				if(at.cache){

				}
				return gun;
			}
			var thing = new Thing();

			function CHAIN(){}
			CHAIN.chain = CHAIN.prototype;
			CHAIN.chain.get = function(){ return this };
			CHAIN.chain.path = function(){ return this };
			CHAIN.chain.put = function(){ return this };
			var chain = new CHAIN();

			function CHAIN2(){}
			CHAIN2.chain = CHAIN2.prototype;
			CHAIN2.chain.get = function(soul, cb, opt){ return this };
			CHAIN2.chain.path = function(field, cb, opt){ return this };
			CHAIN2.chain.put = function(data, cb, opt){ return this };
			var chain2 = new CHAIN2();

			function CHAIN3(){}
			CHAIN3.chain = CHAIN3.prototype;
			CHAIN3.chain.get = function(soul, cb, opt){
				this._ = {soul: soul};
				return this;
			};
			CHAIN3.chain.path = function(field, cb, opt){ 
				this._ = {field: field};
				return this;
			};
			CHAIN3.chain.put = function(data, cb, opt){ 
				this._ = {put: data};
				return this;
			};
			var chain3 = new CHAIN3();

			var u;
			function CHAIN4(){
				this._ = {
					soul: u,
					field: u
				};
			}
			CHAIN4.chain = CHAIN4.prototype;
			CHAIN4.chain.get = function(soul, cb, opt){
				this._.soul = soul;
				return this;
			};
			CHAIN4.chain.path = function(field, cb, opt){ 
				this._.field = field;
				return this;
			};
			CHAIN4.chain.put = function(data, cb, opt){ 
				this._.put = data;
				return this;
			};
			var chain4 = new CHAIN4();

			var u; function noop(){};
			function CHAIN5(){
				this._ = {
					soul: u,
					field: u
				};
				//this.back = this; // compare against CHAIN6!
			}
			CHAIN5.constructor = CHAIN5;
			CHAIN5.chain = CHAIN5.prototype;
			CHAIN5.chain.chain = function(){ 
				var chain = new CHAIN5();
				chain.back = this;
				return chain;
			}
			CHAIN5.chain.get = function(soul, cb, opt){
				var chain = this.chain();
				chain._.soul = soul;
				return chain;
			};
			CHAIN5.chain.path = function(field, cb, opt){ 
				var chain = this.chain();
				chain._.field = field;
				return chain;
			};
			CHAIN5.chain.put = function(data, cb, opt){ 
				this._.put = data;
				return this;
			};
			var chain5 = new CHAIN5();

			var u; function noop(){};
			function CHAIN6(){
				this._ = {
					soul: u,
					field: u
				};
				this.back = this; // compare against CHAIN5!
			}
			CHAIN6.constructor = CHAIN6;
			CHAIN6.chain = CHAIN6.prototype;
			CHAIN6.chain.chain = function(){ 
				var chain = new CHAIN6();
				chain.back = this;
				return chain;
			}
			CHAIN6.chain.get = function(soul, cb, opt){
				var chain = this.chain();
				chain._.soul = soul;
				return chain;
			};
			CHAIN6.chain.path = function(field, cb, opt){ 
				var chain = this.chain();
				chain._.field = field;
				return chain;
			};
			CHAIN6.chain.put = function(data, cb, opt){ 
				this._.put = data;
				return this;
			};
			var chain6 = new CHAIN6();

			var u; function noop(){};
			function CHAIN7(){
				this._ = {
					soul: u,
					field: u
				};
			}
			CHAIN7.constructor = CHAIN7;
			CHAIN7.chain = CHAIN7.prototype;
			CHAIN7.chain.chain = function(){ 
				var chain = new CHAIN7();
				chain.back = this;
				return chain;
			}
			CHAIN7.chain.get = function(soul, cb, opt){
				var chain = this.chain();
				chain._.soul = soul;
				return chain;
			};
			CHAIN7.chain.path = function(field, cb, opt){ 
				var chain = this.chain();
				if(!field){
					if(0 != field){
						return chain;
					}
				}
				chain._.field = field = ''+field;
				return chain;
			};
			CHAIN7.chain.put = function(data, cb, opt){ 
				this._.put = data;
				return this;
			};
			var chain7 = new CHAIN7();

			var u; function noop(){};
			function CHAIN8(){
				this._ = {
					soul: u,
					field: u,
					put: {
						data: u,
						state: u
					}
				};
			}
			CHAIN8.state = Date.now || function(){ return new Date().getTime() }
			CHAIN8.constructor = CHAIN8;
			CHAIN8.chain = CHAIN8.prototype;
			CHAIN8.chain.chain = function(){ 
				var chain = new CHAIN8();
				chain.back = this;
				return chain;
			}
			CHAIN8.chain.get = function(soul, cb, opt){
				var chain = this.chain();
				chain._.soul = soul;
				return chain;
			};
			CHAIN8.chain.path = function(field, cb, opt){ 
				var chain = this.chain();
				if(!field){
					if(0 != field){
						return chain;
					}
				}
				chain._.field = field = ''+field;
				return chain;
			};
			CHAIN8.chain.put = function(data, cb, opt){ 
				var chain = this, put = this._.put;
				put.data = data;
				put.state = CHAIN8.state();
				return chain;
			};
			var chain8 = new CHAIN8();

			var u; function noop(){};
			function CHAIN9(){
				this._ = {
					soul: u,
					field: u
				};
			}
			CHAIN9.state = Date.now || function(){ return new Date().getTime() }
			CHAIN9.constructor = CHAIN9;
			CHAIN9.chain = CHAIN9.prototype;
			CHAIN9.chain.chain = function(){ 
				var chain = new CHAIN9();
				chain.back = this;
				return chain;
			}
			CHAIN9.chain.get = function(soul, cb, opt){
				var chain = this.chain();
				chain._.soul = soul;
				return chain;
			};
			CHAIN9.chain.path = function(field, cb, opt){ 
				var chain = this.chain();
				if(!field){
					if(0 != field){
						return chain;
					}
				}
				chain._.field = field = ''+field;
				return chain;
			};
			function PUT(){ this.data = u; this.state = u; }
			CHAIN9.chain.put = function(data, cb, opt){ 
				var chain = this, put = this._.put = new PUT();
				put.data = data;
				put.state = CHAIN9.state();
				return chain;
			};
			var chain9 = new CHAIN9();

			var u; function noop(){};
			function CHAINA1(){
				this._ = {
					lex: {
						soul: u,
						field: u,
						value: u,
						state: u
					},
					put: {
						data: u,
						state: u
					}
				};
			}
			CHAINA1.state = Date.now || function(){ return new Date().getTime() }
			CHAINA1.constructor = CHAINA1;
			CHAINA1.chain = CHAINA1.prototype;
			CHAINA1.chain.chain = function(){ 
				var chain = new CHAINA1();
				chain.back = this;
				return chain;
			}
			CHAINA1.chain.get = function(soul, cb, opt){
				var chain = this.chain(), at = chain._, lex = at.lex;
				lex.soul = soul;
				if(cb){
					at.ok = cb;
				}
				return chain;
			};
			CHAINA1.chain.path = function(field, cb, opt){ 
				var chain = this.chain(), at = chain._, lex = at.lex;
				if(!field){
					if(0 != field){
						return chain;
					}
				}
				lex.field = field = ''+field;
				return chain;
			};
			CHAINA1.chain.put = function(data, cb, opt){ 
				var chain = this, put = this._.put;
				put.data = data;
				put.state = CHAINA1.state();
				return chain;
			};
			var chaina1 = new CHAINA1();

			var u; function noop(){};
			function CHAINA2(){
				this._ = {
					lex: {
						soul: u,
						field: u,
						value: u,
						state: u
					},
					put: {
						data: u,
						state: u
					}
				};
			}
			CHAINA2.state = Date.now || function(){ return new Date().getTime() }
			CHAINA2.constructor = CHAINA2;
			CHAINA2.chain = CHAINA2.prototype;
			CHAINA2.chain.chain = function(){ 
				var chain = new CHAINA2();
				chain.back = this;
				return chain;
			}
			CHAINA2.chain.get = function(soul, cb, opt){
				var chain = this.chain(), at = chain._, lex = at.lex;
				lex.soul = soul;
				if(cb){
					at.ok = cb;
				}
				return chain;
			};
			CHAINA2.chain.path = function(field, cb, opt){ 
				var chain = this.chain(), at = chain._, lex = at.lex, flex = this._.lex;
				if(!field){
					if(0 != field){
						return chain;
					}
				}
				lex.field = field = ''+field;
				if(!flex.field){
					lex.soul = flex.soul;
				}
				return chain;
			};
			CHAINA2.chain.put = function(data, cb, opt){ 
				var chain = this, put = this._.put;
				put.data = data;
				put.state = CHAINA2.state();
				return chain;
			};
			var chaina2 = new CHAINA2();

			var u; function noop(){};
			function CHAINA3(){
				this._ = {
					lex: {
						soul: u,
						field: u,
						value: u,
						state: u
					},
					put: {
						data: u,
						state: u
					}
				};
			}
			CHAINA3.get = function(lex, cb){

			}
			CHAINA3.state = Date.now || function(){ return new Date().getTime() }
			CHAINA3.constructor = CHAINA3;
			CHAINA3.chain = CHAINA3.prototype;
			CHAINA3.chain.chain = function(){ 
				var chain = new CHAINA3();
				chain.__ = this.__ = this.__ || this._;
				chain.back = this;
				return chain;
			}
			CHAINA3.chain.get = function(soul, cb, opt){
				var chain = this.chain(), at = chain._, lex = at.lex;
				lex.soul = soul;
				if(cb){
					at.ok = cb;
					/*CHAINA3.get(lex, function(){

					});*/
				}
				return chain;
			};
			CHAINA3.chain.path = function(field, cb, opt){ 
				var chain = this.chain(), at = chain._, lex = at.lex, flex = this._.lex;
				if(!field){
					if(0 != field){
						return chain;
					}
				}
				lex.field = field = ''+field;
				if(!flex.field){
					lex.soul = flex.soul;
				}
				return chain;
			};
			CHAINA3.chain.put = function(data, cb, opt){ 
				var chain = this, put = this._.put;;
				put.data = data;
				put.state = CHAINA3.state();
				return chain;
			};
			var chaina3 = new CHAINA3();

			var u; function noop(){};
			function CHAINA3A(){
				if(!(this instanceof CHAINA3A)){ return new CHAINA3A() }
				this._ = {
					lex: {
						soul: u,
						field: u,
						value: u,
						state: u
					},
					put: {
						data: u,
						state: u
					}
				};
			}
			CHAINA3A.is = function(chain){ return chain instanceof CHAINA3A }
			CHAINA3A.get = function(lex, cb){

			}
			CHAINA3A.state = Date.now || function(){ return new Date().getTime() }
			CHAINA3A.constructor = CHAINA3A;
			CHAINA3A.chain = CHAINA3A.prototype;
			CHAINA3A.chain.chain = function(){ 
				var chain = new CHAINA3A();
				chain.__ = this.__ = this.__ || this._;
				chain.back = this;
				return chain;
			}
			CHAINA3A.chain.get = function(soul, cb, opt){
				var chain = this.chain(), at = chain._, lex = at.lex;
				lex.soul = soul;
				if(cb){
					at.ok = cb;
					/*CHAINA3A.get(lex, function(){

					});*/
				}
				return chain;
			};
			CHAINA3A.chain.path = function(field, cb, opt){ 
				var chain = this.chain(), at = chain._, lex = at.lex, flex = this._.lex;
				if(!field){
					if(0 != field){
						return chain;
					}
				}
				lex.field = field = ''+field;
				if(!flex.field){
					lex.soul = flex.soul;
				}
				return chain;
			};
			CHAINA3A.chain.put = function(data, cb, opt){ 
				var chain = this, put = this._.put;
				put.data = data;
				put.state = CHAINA3A.state();
				return chain;
			};
			var chaina3a = CHAINA3A();

			var u; function noop(){};
			function CHAINA3B(){
				if(!CHAINA3B.is(this)){ return new CHAINA3B() }
				this._ = {
					lex: {
						soul: u,
						field: u,
						value: u,
						state: u
					},
					put: {
						data: u,
						state: u
					}
				};
			}
			CHAINA3B.is = function(chain){ return chain instanceof CHAINA3B }
			CHAINA3B.get = function(lex, cb){

			}
			CHAINA3B.state = Date.now || function(){ return new Date().getTime() }
			CHAINA3B.constructor = CHAINA3B;
			CHAINA3B.chain = CHAINA3B.prototype;
			CHAINA3B.chain.chain = function(){ 
				var chain = new CHAINA3B();
				chain.__ = this.__ = this.__ || this._;
				chain.back = this;
				return chain;
			}
			CHAINA3B.chain.get = function(soul, cb, opt){
				var chain = this.chain(), at = chain._, lex = at.lex;
				lex.soul = soul;
				if(cb){
					at.ok = cb;
					/*CHAINA3B.get(lex, function(){

					});*/
				}
				return chain;
			};
			CHAINA3B.chain.path = function(field, cb, opt){ 
				var chain = this.chain(), at = chain._, lex = at.lex, flex = this._.lex;
				if(!field){
					if(0 != field){
						return chain;
					}
				}
				lex.field = field = ''+field;
				if(!flex.field){
					lex.soul = flex.soul;
				}
				return chain;
			};
			CHAINA3B.chain.put = function(data, cb, opt){ 
				var chain = this, put = this._.put;
				put.data = data;
				put.state = CHAINA3B.state();
				return chain;
			};
			var chaina3b = CHAINA3B();

			var u; function noop(){};
			function CHAINA3C(o){
				if(!(this instanceof CHAINA3C)){ return new CHAINA3C(o) }
				this._ = {
					lex: {
						soul: u,
						field: u,
						value: u,
						state: u
					},
					put: {
						data: u,
						state: u
					}
				};
				//if(o instanceof CHAINA3C){ return this }
			}
			CHAINA3C.is = function(chain){ return chain instanceof CHAINA3C }
			CHAINA3C.get = function(lex, cb){

			}
			CHAINA3C.state = Date.now || function(){ return new Date().getTime() }
			CHAINA3C.constructor = CHAINA3C;
			CHAINA3C.chain = CHAINA3C.prototype;
			CHAINA3C.chain.opt = function(){
				var chain = this;
				return chain;
			}
			CHAINA3C.chain.chain = function(){
				var chain = new CHAINA3C(this);
				chain.__ = this.__ = this.__ || this._;
				chain.back = this;
				return chain;
			}
			CHAINA3C.chain.get = function(soul, cb, opt){
				var chain = this.chain(), at = chain._, lex = at.lex;
				lex.soul = soul;
				if(cb){
					at.ok = cb;
					/*CHAINA3C.get(lex, function(){

					});*/
				}
				return chain;
			};
			CHAINA3C.chain.path = function(field, cb, opt){ 
				var chain = this.chain(), at = chain._, lex = at.lex, flex = this._.lex;
				if(!field){
					if(0 != field){
						return chain;
					}
				}
				lex.field = field = ''+field;
				if(!flex.field){
					lex.soul = flex.soul;
				}
				return chain;
			};
			CHAINA3C.chain.put = function(data, cb, opt){ 
				var chain = this, put = this._.put;
				put.data = data;
				put.state = CHAINA3C.state();
				return chain;
			};
			var chaina3c = CHAINA3C();

			var u; function noop(){};
			function CHAINA3D(o){
				if(!(this instanceof CHAINA3D)){ return new CHAINA3D(o) }
				this._ = {
					lex: {
						soul: u,
						field: u,
						value: u,
						state: u
					},
					put: {
						data: u,
						state: u
					}
				};
				if(!(o instanceof CHAINA3D)){ this.opt(o) }
			}
			CHAINA3D.is = function(chain){ return chain instanceof CHAINA3D }
			CHAINA3D.get = function(lex, cb){

			}
			CHAINA3D.state = Date.now || function(){ return new Date().getTime() }
			CHAINA3D.constructor = CHAINA3D;
			CHAINA3D.chain = CHAINA3D.prototype;
			CHAINA3D.chain.opt = function(o){
				var chain = this;
				chain.__ = chain.__ || chain._;
				chain.__.graph = chain.__.graph || {};
				return chain;
			}
			CHAINA3D.chain.chain = function(){
				var chain = new CHAINA3D(this);
				chain.__ = this.__;
				chain.back = this;
				return chain;
			}
			CHAINA3D.chain.get = function(soul, cb, opt){
				var chain = this.chain(), at = chain._, lex = at.lex;
				lex.soul = soul;
				if(cb){
					at.ok = cb;
					/*CHAINA3D.get(lex, function(){

					});*/
				}
				return chain;
			};
			CHAINA3D.chain.path = function(field, cb, opt){ 
				var chain = this.chain(), at = chain._, lex = at.lex, flex = this._.lex;
				if(!field){
					if(0 != field){
						return chain;
					}
				}
				lex.field = field = ''+field;
				if(!flex.field){
					lex.soul = flex.soul;
				}
				return chain;
			};
			CHAINA3D.chain.put = function(data, cb, opt){ 
				var chain = this, put = this._.put;
				put.data = data;
				put.state = CHAINA3D.state();
				return chain;
			};
			var chaina3d = CHAINA3D();

			var u; function noop(){};
			function CHAINA3E(o){
				if(!(this instanceof CHAINA3E)){ return new CHAINA3E(o) }
				this._ = {
					lex: {
						soul: u,
						field: u,
						value: u,
						state: u
					},
					put: {
						data: u,
						state: u
					},
					err: u,
					node: u,
					count: 0
				};
				if(!(o instanceof CHAINA3E)){ this.opt(o) }
			}
			CHAINA3E.is = function(chain){ return chain instanceof CHAINA3E }
			CHAINA3E.get = function(chain, lex, cb){
				var soul = lex.soul, graph = chain.__.graph, node;
				if(node = graph[soul]){
					return cb(null, node);
				}
				return cb(null, node);
			}
			CHAINA3E.state = Date.now || function(){ return new Date().getTime() }
			CHAINA3E.constructor = CHAINA3E;
			CHAINA3E.chain = CHAINA3E.prototype;
			CHAINA3E.chain.opt = function(o){
				var chain = this;
				chain.__ = chain.__ || chain._;
				chain.__.graph = chain.__.graph || {};
				return chain;
			}
			CHAINA3E.chain.chain = function(){
				var chain = new CHAINA3E(this);
				chain.__ = this.__;
				chain.back = this;
				return chain;
			}
			CHAINA3E.chain.get = function(soul, cb, opt){
				var chain = this.chain(), at = chain._, lex = at.lex;
				lex.soul = soul;
				if(cb){
					at.ok = cb;
					CHAINA3E.get(chain, lex, function(err, node){
					});
				}
				return chain;
			};
			CHAINA3E.chain.path = function(field, cb, opt){ 
				var chain = this.chain(), at = chain._, lex = at.lex
				, back = this, from = back._, flex = from.lex, vert;
				if(!field){
					if(0 != field){
						return chain;
					}
				}
				back.next = chain;
				chain.on = function(cat){
				}
				if(from.count){
					chain.on(from);
				} else
				if(!flex.field){
					lex.soul = flex.soul;
					CHAINA3E.get(chain, lex, function(err, node){
					});
				}
				return chain;
			};
			CHAINA3E.chain.put = function(data, cb, opt){ 
				var chain = this, at = this._, put = at.put, back = this, from = this._;
				put.data = data;
				put.state = CHAINA3E.state();
				chain.on = function(cat){
				};
				if(at.count){ chain.on(at) }
				return chain;
			};
			var chaina3e = CHAINA3E();

			var u; function noop(){};
			function CHAINA3F(o){
				if(!(this instanceof CHAINA3F)){ return new CHAINA3F(o) }
				this._ = {
					lex: {
						soul: u,
						field: u,
						value: u,
						state: u
					},
					put: {
						data: u,
						state: u
					},
					err: u,
					node: u,
					count: 0
				};
				if(!(o instanceof CHAINA3F)){ this.opt(o) }
			}
			CHAINA3F.is = function(chain){ return chain instanceof CHAINA3F }
			CHAINA3F.get = function(chain, lex, cb){
				var soul = lex.soul, graph = chain.__.graph, node;
				if(node = graph[soul]){
					return cb(null, node);
				}
				return cb(null, node);
			}
			CHAINA3F.state = Date.now || function(){ return new Date().getTime() }
			CHAINA3F.constructor = CHAINA3F;
			CHAINA3F.chain = CHAINA3F.prototype;
			CHAINA3F.chain.opt = function(o){
				var chain = this;
				chain.__ = chain.__ || chain._;
				chain.__.graph = chain.__.graph || {};
				return chain;
			}
			CHAINA3F.chain.chain = function(){
				var chain = new CHAINA3F(this);
				chain.__ = this.__;
				chain.back = this;
				return chain;
			}
			CHAINA3F.chain.get = function(soul, cb, opt){
				var chain = this.chain(), at = chain._, lex = at.lex;
				lex.soul = soul;
				if(cb){
					at.ok = cb;
					CHAINA3F.get(chain, lex, function(err, node){
						at.count++;
						at.err = err;
						at.node = node;
						if(chain.next){ chain.next.on(at) }
					});
				}
				return chain;
			};
			CHAINA3F.chain.path = function(field, cb, opt){ 
				var chain = this.chain(), at = chain._, lex = at.lex
				, back = this, from = back._, flex = from.lex, vert;
				if(!field){
					if(0 != field){
						return chain;
					}
				}
				back.next = chain;
				chain.on = function(cat){
					var node, vert, val;
					at.count++;
					at.err = cat.err;
					if(node = cat.node){
						if(val = node[field]){
							at.node = vert = {};
							vert[field] = val;
						}
					}
					if(chain.next){ chain.next.on(at) }
				}
				if(from.count){
					chain.on(from);
				} else
				if(!flex.field){
					lex.soul = flex.soul;
					CHAINA3F.get(chain, lex, function(err, node){
						at.err = err;
						at.node = node;
						chain.on(at);
					});
				}
				return chain;
			};
			CHAINA3F.chain.put = function(data, cb, opt){ 
				var chain = this, at = this._, put = at.put, back = this, from = this._;
				put.data = data;
				put.state = CHAINA3F.state();
				chain.on = function(cat){
					cat.node;
				};
				if(at.count){ chain.on(at) }
				return chain;
			};
			var chaina3f = CHAINA3F();

			var u; function noop(){};
			function CHAINA4(o){
				if(!(this instanceof CHAINA4)){ return new CHAINA4(o) }
				this._ = {
					lex: {
						soul: u,
						field: u,
						value: u,
						state: u
					},
					put: {
						data: u,
						state: u
					},
					opt: u,
					err: u,
					node: u,
					count: 0
				};
				if(!(o instanceof CHAINA4)){ this.opt(o) }
			};
			CHAINA4.is = function(chain){ return chain instanceof CHAINA4 }
			CHAINA4.get = function(chain, lex, cb){
				var soul = lex.soul, graph = chain.__.graph, node;
				if(node = graph[soul]){
					return cb.call(chain, null, node);
				}
				return cb.call(chain, null, node);
			};
			CHAINA4.state = Date.now || function(){ return new Date().getTime() }
			CHAINA4.constructor = CHAINA4;
			CHAINA4.chain = CHAINA4.prototype;
			CHAINA4.chain.opt = function(o){
				var chain = this;
				chain.__ = chain.__ || chain._;
				chain.__.graph = chain.__.graph || {};
				return chain;
			};
			CHAINA4.chain.chain = function(){
				var chain = new CHAINA4(this);
				chain.__ = this.__;
				chain.back = this;
				return chain;
			};
			;(function(){
				function get(err, node){
					var chain = this, at = chain._;
					at.count++;
					at.err = err;
					at.node = node;
					if(chain.next){ chain.next.on(at) }
				}
				CHAINA4.chain.get = function(soul, cb, opt){
					var chain = this.chain(), at = chain._, lex = at.lex;
					lex.soul = soul;
					lex.opt = opt;
					if(cb){
						at.ok = cb;
						CHAINA4.get(chain, lex, get);
					}
					return chain;
				};
			}());
			;(function(){
				function get(err, node){
					var chain = this, at = chain._;
					at.err = err;
					at.node = node;
					chain.on(at);
				}
				function on(cat){
					var chain = this, at = chain._, node, vert, val;
					at.count++;
					at.err = cat.err;
					if(node = cat.node){
						if(val = node[field]){
							at.node = vert = {};
							vert[field] = val;
						}
					}
					if(chain.next){ chain.next.on(at) }
				}
				CHAINA4.chain.path = function(field, cb, opt){ 
					var chain = this.chain(), at = chain._, lex = at.lex
					, back = this, from = back._, flex = from.lex, vert;
					if(!field){
						if(0 != field){
							return chain;
						}
					}
					lex.field = field = ''+field;
					back.next = chain;
					chain.on = on;
					if(from.count){
						chain.on(from);
					} else
					if(!flex.field){
						lex.soul = flex.soul;
						CHAINA4.get(chain, lex, get);
					}
					return chain;
				};
			}());
			;(function(){
				function on(cat){
					cat.node;
				}
				CHAINA4.chain.put = function(data, cb, opt){ 
					var chain = this, at = chain._, put = at.put;
					put.data = data;
					put.state = CHAINA4.state();
					chain.on = on;
					if(at.count){ chain.on(at) }
					return chain;
				};
			}());
			var chaina4 = CHAINA4();

			var u; function noop(){};
			function CHAINA5(o){
				if(!(this instanceof CHAINA5)){ return new CHAINA5(o) }
				this._ = {lex: {}, put: {}, count: 0};
				if(!(o instanceof CHAINA5)){ this.opt(o) }
			};
			CHAINA5.is = function(chain){ return chain instanceof CHAINA5 }
			CHAINA5.get = function(chain, lex, cb){
				var soul = lex.soul, graph = chain.__.graph, node;
				if(node = graph[soul]){
					return cb.call(chain, null, node);
				}
				return cb.call(chain, null, node);
			};
			CHAINA5.state = Date.now || function(){ return new Date().getTime() }
			CHAINA5.constructor = CHAINA5;
			CHAINA5.chain = CHAINA5.prototype;
			CHAINA5.chain.opt = function(o){
				var chain = this;
				chain.__ = chain.__ || chain._;
				chain.__.graph = chain.__.graph || {};
				return chain;
			};
			CHAINA5.chain.chain = function(){
				var chain = new CHAINA5(this);
				chain.__ = this.__;
				chain.back = this;
				return chain;
			};
			;(function(){
				function get(err, node){
					var chain = this, at = chain._;
					at.count++;
					at.err = err;
					at.node = node;
					if(chain.next){ chain.next.on(at) }
				}
				CHAINA5.chain.get = function(soul, cb, opt){
					var chain = this.chain(), at = chain._, lex = at.lex;
					lex.soul = soul;
					lex.opt = opt;
					if(cb){
						at.ok = cb;
						CHAINA5.get(chain, lex, get);
					}
					return chain;
				};
			}());
			;(function(){
				function get(err, node){
					var chain = this, at = chain._;
					at.err = err;
					at.node = node;
					chain.on(at);
				}
				function on(cat){
					var chain = this, at = chain._, node, vert, val;
					at.count++;
					at.err = cat.err;
					if(node = cat.node){
						if(val = node[field]){
							at.node = vert = {};
							vert[field] = val;
						}
					}
					if(chain.next){ chain.next.on(at) }
				}
				CHAINA5.chain.path = function(field, cb, opt){ 
					var chain = this.chain(), at = chain._, lex = at.lex
					, back = this, from = back._, flex = from.lex, vert;
					if(!field){
						if(0 != field){
							return chain;
						}
					}
					lex.field = field = ''+field;
					back.next = chain;
					chain.on = on;
					if(from.count){
						chain.on(from);
					} else
					if(!flex.field){
						lex.soul = flex.soul;
						CHAINA5.get(chain, lex, get);
					}
					return chain;
				};
			}());
			;(function(){
				function on(cat){
					cat.node;
				}
				CHAINA5.chain.put = function(data, cb, opt){ 
					var chain = this, at = chain._, put = at.put;
					put.data = data;
					put.state = CHAINA5.state();
					chain.on = on;
					if(at.count){ chain.on(at) }
					return chain;
				};
			}());
			var chaina5 = CHAINA5();

			var u; function noop(){};
			function CHAINA6(o){
				if(!(this instanceof CHAINA6)){ return new CHAINA6(o) }
				this._ = {lex: {}, put: {}, count: 0};
				if(!(o instanceof CHAINA6)){ this.opt(o) }
			};
			CHAINA6.is = function(chain){ return chain instanceof CHAINA6 }
			CHAINA6.get = function(chain, lex, cb){
				var soul = lex.soul, graph = chain.__.graph, node;
				if(node = graph[soul]){
					return cb.call(chain, null, node);
				}
				return cb.call(chain, null, node);
			};
			CHAINA6.state = Date.now || function(){ return new Date().getTime() }
			CHAINA6.constructor = CHAINA6;
			CHAINA6.chain = CHAINA6.prototype;
			CHAINA6.chain.opt = function(o){
				var chain = this;
				chain.__ = chain.__ || chain._;
				chain.__.graph = chain.__.graph || {};
				return chain;
			};
			CHAINA6.chain.chain = function(){
				var chain = new CHAINA6(this);
				chain.__ = this.__;
				chain.back = this;
				return chain;
			};
			;(function(){
				function get(err, node){
					var chain = this, at = chain._;
					at.count++;
					at.err = err;
					at.node = node;
					if(chain.next){ chain.next.on(at) }
				}
				CHAINA6.chain.get = function(soul, cb, opt){
					var chain = this.chain(), at = chain._ = chain._ || {}, lex = at.lex = at.lex || {};
					lex.soul = soul;
					lex.opt = opt;
					if(cb){
						at.ok = cb;
						CHAINA6.get(chain, lex, get);
					}
					return chain;
				};
			}());
			;(function(){
				function get(err, node){
					var chain = this, at = chain._;
					at.err = err;
					at.node = node;
					chain.on(at);
				}
				function on(cat){
					var chain = this, at = chain._, node, vert, val;
					at.count++;
					at.err = cat.err;
					if(node = cat.node){
						if(val = node[field]){
							at.node = vert = {};
							vert[field] = val;
						}
					}
					if(chain.next){ chain.next.on(at) }
				}
				CHAINA6.chain.path = function(field, cb, opt){ 
					var chain = this.chain(), at = chain._, lex = at.lex
					, back = this, from = back._, flex = from.lex, vert;
					if(!field){
						if(0 != field){
							return chain;
						}
					}
					lex.field = field = ''+field;
					back.next = chain;
					chain.on = on;
					if(from.count){
						chain.on(from);
					} else
					if(!flex.field){
						lex.soul = flex.soul;
						CHAINA6.get(chain, lex, get);
					}
					return chain;
				};
			}());
			;(function(){
				function on(cat){
					cat.node;
				}
				CHAINA6.chain.put = function(data, cb, opt){ 
					var chain = this, at = chain._, put = at.put;
					put.data = data;
					put.state = CHAINA6.state();
					chain.on = on;
					if(at.count){ chain.on(at) }
					return chain;
				};
			}());
			var chaina6 = CHAINA6();

			var u; function noop(){};
			function CHAINA7(o){
				if(!(this instanceof CHAINA7)){ return new CHAINA7(o) }
				this._ = {lex: {}, put: {}, count: 0};
				if(!(o instanceof CHAINA7)){ this.opt(o) }
			};
			CHAINA7.is = function(chain){ return chain instanceof CHAINA7 }
			CHAINA7.get = function(chain, lex, cb){
				var soul = lex.soul, graph = chain.__.graph, node;
				if(node = graph[soul]){
					return cb.call(chain, null, node);
				}
				cb.call(chain, null, node);
			};
			CHAINA7.state = Date.now || function(){ return new Date().getTime() }
			CHAINA7.constructor = CHAINA7;
			CHAINA7.chain = CHAINA7.prototype;
			CHAINA7.chain.opt = function(o){
				var chain = this;
				chain.__ = chain.__ || chain._;
				chain.__.graph = chain.__.graph || {};
				return chain;
			};
			CHAINA7.chain.chain = function(){
				var chain = new CHAINA7(this);
				chain.__ = this.__;
				chain.back = this;
				return chain;
			};
			;(function(){
				function get(err, node){
					var chain = this, at = chain._;
					at.count++;
					at.err = err;
					at.node = node;
					if(chain.next){ chain.next.on(at) }
				}
				CHAINA7.chain.get = function(soul, cb, opt){
					var chain = this.chain(), at = chain._, lex = at.lex;
					lex.soul = soul;
					lex.opt = opt;
					if(cb){
						at.ok = cb;
						CHAINA7.get(chain, lex, get);
					}
					return chain;
				};
			}());
			;(function(){
				function get(err, node){
					var chain = this, at = chain._;
					at.err = err;
					at.node = node;
					chain.on(at);
				}
				function on(cat){
					var chain = this, at = chain._, node, vert, val;
					at.count++;
					at.err = cat.err;
					if(node = cat.node){
						if(val = node[field]){
							at.node = vert = {};
							vert[field] = val;
						}
					}
					if(chain.next){ chain.next.on(at) }
				}
				CHAINA7.chain.path = function(field, cb, opt){ 
					var chain = this.chain(), at = chain._, lex = at.lex
					, back = this, from = back._, flex = from.lex, vert;
					if(!field){
						if(0 != field){
							return chain;
						}
					}
					lex.field = field = ''+field;
					back.next = chain;
					chain.on = on;
					if(from.count){
						chain.on(from);
					} else
					if(!flex.field){
						lex.soul = flex.soul;
						CHAINA7.get(chain, lex, get);
					}
					return chain;
				};
			}());
			;(function(){
				function map(node, soul){
					Gun.tab.store.put(soul, node);
				}
				function ify(err, env){
					if(err){ return }
					Gun.obj.map(env.graph, map);
				}
				function on(cat){
					Gun.ify(cat.put.data, ify);
				}
				CHAINA7.chain.put = function(data, cb, opt){ 
					var chain = this, at = chain._, put = at.put;
					put.data = data;
					put.state = CHAINA7.state();
					chain.on = on;
					if(at.count){ chain.on(at) }
					return chain;
				};
			}());
			var chaina7 = CHAINA7();

			;(function(exports){ // On event emitter generic javascript utility.
				function Scope(){
					var s = function(a,b,c){ return s.tag = a, b? s.event(b,c) : s }
					s.emit = emit;
					s.event = event;
					s.create = Scope;
					s.on = {};
					return s;
				}
				function emit(a){
					var s = this, tag = s.tag, on = s.on[tag], i = -1, at;
					if(!on){ on = s.on[tag] = [] }
					while(at = on[i = 1 + i]){ at.on(a) }
					return s;
				}
				function event(fn){
					var s = this, tag = s.tag, on = s.on[tag], at = new At(fn, tag, s);
					if(!on){ on = s.on[tag] = [] }
					on.push(at);
					return s;
				}
				function At(fn, tag, s){
					this.on = fn;
					this.tag = tag;
					this.scope = s;
				}
				exports.on = Scope();
			}(window));

			var u; function noop(){};
			function CHAINA8(o){
				if(!(this instanceof CHAINA8)){ return new CHAINA8(o) }
				this._ = {lex: {}, put: {}, count: 0};
				if(!(o instanceof CHAINA8)){ this.opt(o) }
			};
			CHAINA8.is = function(chain){ return chain instanceof CHAINA8 }
			CHAINA8.get = function(chain, lex, cb){
				var soul = lex.soul, graph = chain.__.graph, node;
				if(node = graph[soul]){
					return cb.call(chain, null, node);
				}
				cb.call(chain, null, node);
			};
			CHAINA8.state = Date.now || function(){ return new Date().getTime() }
			CHAINA8.constructor = CHAINA8;
			CHAINA8.chain = CHAINA8.prototype;
			CHAINA8.chain.opt = function(o){
				var chain = this;
				chain.__ = chain.__ || chain._;
				chain.__.graph = chain.__.graph || {};
				return chain;
			};
			CHAINA8.chain.chain = function(){
				var chain = new CHAINA8(this);
				chain.__ = this.__;
				chain.back = this;
				return chain;
			};
			;(function(){
				function get(err, node){
					var chain = this, at = chain._;
					at.count++;
					at.err = err;
					at.node = node;
					if(chain.next){ chain.next.on(at) }
				}
				CHAINA8.chain.get = function(soul, cb, opt){
					var chain = this.chain(), at = chain._, lex = at.lex;
					lex.soul = soul;
					lex.opt = opt;
					if(cb){
						at.ok = cb;
						CHAINA8.get(chain, lex, get);
					}
					return chain;
				};
			}());
			;(function(){
				function get(err, node){
					var chain = this, at = chain._;
					at.err = err;
					at.node = node;
					chain.on(at);
				}
				function on(cat){
					var chain = this, at = chain._, node, vert, val;
					at.count++;
					at.err = cat.err;
					if(node = cat.node){
						if(val = node[field]){
							at.node = vert = {};
							vert[field] = val;
						}
					}
					at.back = cat;
					if(chain.next){ chain.next.on(at) }
				}
				CHAINA8.chain.path = function(field, cb, opt){ 
					var chain = this.chain(), at = chain._, lex = at.lex
					, back = this, from = back._, flex = from.lex, vert;
					if(!field){
						if(0 != field){
							return chain;
						}
					}
					lex.field = field = ''+field;
					back.next = chain;
					chain.on = on;
					if(from.count){
						chain.on(from);
					} else
					if(!flex.field){
						lex.soul = flex.soul;
						CHAINA8.get(chain, lex, get);
					}
					return chain;
				};
			}());
			;(function(){
				function map(node, soul){
					Gun.tab.store.put(soul, node);
				}
				function ify(err, env){
					if(err){ return }
					Gun.obj.map(env.graph, map);
				}
				function wrap(cat, data){
					if(!cat){ return data }
					if(cat.lex.field){
						data = Gun.obj.put({}, cat.lex.field, data);
					}
					data = Gun.is.node.soul.ify(data, cat.lex.soul);
					if(cat.lex.soul){ return data }
					if(cat !== cat.back){
						return wrap(cat.back, data);
					}
					return data;
				}
				function on(cat){
					var data = wrap(cat, cat.put.data);
					Gun.ify(data, ify);
				}
				CHAINA8.chain.put = function(data, cb, opt){ 
					var chain = this, at = chain._, put = at.put;
					put.data = data;
					put.state = CHAINA8.state();
					chain.on = on;
					if(at.count){ chain.on(at) }
					return chain;
				};
			}());
			var chaina8 = CHAINA8();

			var u; function noop(){};
			function CHAINA9(o){
				if(!(this instanceof CHAINA9)){ return new CHAINA9(o) }
				this._ = {lex: {}, put: {}, count: 0};
				if(!(o instanceof CHAINA9)){ this.opt(o) }
			};
			CHAINA9.is = function(chain){ return chain instanceof CHAINA9 }
			CHAINA9.get = function(chain, lex, cb){
				var soul = lex.soul, graph = chain.__.graph, node;
				if(node = graph[soul]){
					return cb.call(chain, null, node);
				}
				cb.call(chain, null, node);
			};
			CHAINA9.state = Date.now || function(){ return new Date().getTime() }
			CHAINA9.constructor = CHAINA9;
			CHAINA9.chain = CHAINA9.prototype;
			CHAINA9.chain.opt = function(o){
				var chain = this;
				chain.__ = chain.__ || chain._;
				chain.__.graph = chain.__.graph || {};
				return chain;
			};
			CHAINA9.chain.chain = function(){
				var chain = new CHAINA9(this);
				chain.__ = this.__;
				chain.back = this;
				return chain;
			};
			;(function(){
				function get(err, node){
					var chain = this, at = chain._;
					at.count++;
					at.err = err;
					at.node = node;
					if(chain.next){ chain.next.on(at) }
				}
				CHAINA9.chain.get = function(soul, cb, opt){
					var chain = this.chain(), at = chain._, lex = at.lex;
					lex.soul = soul;
					lex.opt = opt;
					if(cb){
						at.ok = cb;
						CHAINA9.get(chain, lex, get);
					}
					return chain;
				};
			}());
			;(function(){
				function get(err, node){
					var chain = this, at = chain._;
					at.err = err;
					at.node = node;
					chain.on(at);
				}
				function on(cat){
					var chain = this, at = chain._, node, vert, val;
					at.count++;
					at.err = cat.err;
					if(node = cat.node){
						if(val = node[field]){
							at.node = vert = {};
							vert[field] = val;
						}
					}
					at.back = cat;
					if(chain.next){ chain.next.on(at) }
				}
				CHAINA9.chain.path = function(field, cb, opt){ 
					var chain = this.chain(), at = chain._, lex = at.lex
					, back = this, from = back._, flex = from.lex, vert;
					if(!field){
						if(0 != field){
							return chain;
						}
					}
					lex.field = field = ''+field;
					back.next = chain;
					chain.on = on;
					if(from.count){
						chain.on(from);
					} else
					if(!flex.field){
						lex.soul = flex.soul;
						CHAINA9.get(chain, lex, get);
					}
					return chain;
				};
			}());
			;(function(){
				function wrap(cat, data){
					if(!cat){ return data }
					if(cat.lex.field){
						data = Gun.obj.put({}, cat.lex.field, data);
					}
					data = Gun.is.node.soul.ify(data, cat.lex.soul);
					if(cat.lex.soul){ return data }
					if(cat !== cat.back){
						return wrap(cat.back, data);
					}
					return data;
				}
				function on(cat){ var at = cat, state = Gun.time.is();
					var data = wrap(cat, cat.put.data);
					Gun.ify(data, end, {
						node: function(env, cb){ var eat = env.at;
							if(1 === eat.path.length && at.node){
								eat.soul = Gun.is.rel(at.node[eat.path[0]]);
							}
							cb(env, eat);
						}, value: function(env){ var eat = env.at;
							if(!eat.field){ return }
							Gun.is.node.state.ify(eat.node, {field: eat.field, state: state});
						}, uuid: gun.__.opt.uuid, state: state
					});
				}
				function ack(err, ok){
					//if(Gun.fns.is(opt.any)){ opt.any.call(gun, err, ok) } // TODO: gun context!
				}
				function end(err, env){
					if(err){ return }
					Gun.put(gun, env.graph, ack, env.opt); // TODO: incorrect options!
				}
				CHAINA9.chain.put = function(data, cb, opt){ 
					var chain = this, at = chain._, put = at.put;
					put.data = data;
					put.state = CHAINA9.state();
					chain.on = on;
					if(at.count){ chain.on(at) }
					return chain;
				};
			}());
			var chaina9 = CHAINA9();

			var u; function noop(){};
			function CHAINB1(o){
				if(!(this instanceof CHAINB1)){ return new CHAINB1(o) }
				this._ = {lex: {}, put: {}, count: 0};
				if(!(o instanceof CHAINB1)){ this.opt(o) }
			};
			CHAINB1.is = function(chain){ return chain instanceof CHAINB1 }
			CHAINB1.get = function(chain, lex, cb){
				var soul = lex.soul, graph = chain.__.graph, node;
				if(node = graph[soul]){
					return cb.call(chain, null, node);
				}
				Gun.tab.store.get(soul, function(err, data){
					graph[soul] = data;
					cb.call(chain, err, data);
				});
			};
			CHAINB1.state = Date.now || function(){ return new Date().getTime() }
			CHAINB1.constructor = CHAINB1;
			CHAINB1.chain = CHAINB1.prototype;
			CHAINB1.chain.opt = function(o){
				var chain = this;
				chain.__ = chain.__ || chain._;
				chain.__.graph = chain.__.graph || {};
				return chain;
			};
			CHAINB1.chain.chain = function(){
				var chain = new CHAINB1(this);
				chain.__ = this.__;
				chain.back = this;
				return chain;
			};
			;(function(){
				function get(err, node){
					var chain = this, at = chain._;
					at.count++;
					at.err = err;
					at.node = node;
					if(chain.next){ chain.next.run(at) }
				}
				CHAINB1.chain.get = function(soul, cb, opt){
					var chain = this.chain(), at = chain._, lex = at.lex;
					lex.soul = soul;
					lex.opt = opt;
					if(cb){
						at.ok = cb;
						CHAINB1.get(chain, lex, get);
					}
					return chain;
				};
			}());
			function got(err, node){
				var chain = this, at = chain._;
				at.err = err;
				at.node = node;
				chain.run(at);
			}
			;(function(){
				function run(cat){
					var chain = this, at = chain._, lex = at.lex, field = lex.field, node, vert, val;
					at.count++;
					at.err = cat.err;
					if(node = cat.node){
						if(val = Gun.is.rel(node[cat.lex.field])){
							return CHAINB1.get(chain, {soul: val}, got);
						}
						if(val = node[field]){
							at.node = vert = {};
							vert[field] = val;
						}
					}
					at.back = cat;
					if(chain.next){ chain.next.run(at) }
				}
				CHAINB1.chain.path = function(field, cb, opt){ 
					var chain = this.chain(), at = chain._, lex = at.lex
					, back = this, from = back._, flex = from.lex, vert;
					if(!field){
						if(0 != field){
							return chain;
						}
					}
					lex.field = field = ''+field;
					back.next = chain;
					chain.run = run;
					if(from.count){
						chain.run(from);
					} else
					if(!flex.field){
						lex.soul = flex.soul;
						CHAINB1.get(chain, lex, got);
					}
					return chain;
				};
			}());
			;(function(){
				function wrap(cat, data){
					if(!cat){ return data }
					if(cat.lex.field){
						data = Gun.obj.put({}, cat.lex.field, data);
					}
					data = Gun.is.node.soul.ify(data, cat.lex.soul);
					if(cat.lex.soul){ return data }
					if(cat !== cat.back){
						return wrap(cat.back, data);
					}
					return data;
				}
				function run(cat){ var at = cat, state = Gun.time.is();
					var data = wrap(cat, cat.put.data);
					Gun.ify(data, end, {
						node: function(env, cb){ var eat = env.at;
							if(1 === eat.path.length && at.node){
								eat.soul = Gun.is.rel(at.node[eat.path[0]]);
							}
							cb(env, eat);
						}, value: function(env){ var eat = env.at;
							if(!eat.field){ return }
							Gun.is.node.state.ify(eat.node, {field: eat.field, state: state});
						}, uuid: gun.__.opt.uuid, state: state
					});
				}
				function ack(err, ok){
					//if(Gun.fns.is(opt.any)){ opt.any.call(gun, err, ok) } // TODO: gun context!
				}
				function end(err, env){
					if(err){ return }
					Gun.put(gun, env.graph, ack, env.opt); // TODO: incorrect options!
				}
				CHAINB1.chain.put = function(data, cb, opt){ 
					var chain = this, at = chain._, put = at.put;
					put.data = data;
					put.state = CHAINB1.state();
					chain.run = run;
					if(at.count){ chain.run(at) }
					return chain;
				};
			}());
			;(function(){
				function run(cat){
					var chain = this, lex = cat.lex, node = cat.node, field = lex.field, val;
					if(field && (val = Gun.is.rel(node[field]))){
						return CHAINB1.get(chain, {soul: val}, got);
					}
					chain.cb(cat.node);
				}
				CHAINB1.chain.on = function(cb){
					var chain = this, at = chain._;
					chain.run = run;
					chain.cb = cb;
					if(at.count){ chain.run(at) }
					return chain;
				}
			}());
			var chainb1 = CHAINB1();

			var u; function noop(){};
			function CHAINB2(o){
				if(!(this instanceof CHAINB2)){ return new CHAINB2(o) }
				this._ = {lex: {}, put: {}, count: 0};
				if(!(o instanceof CHAINB2)){ this.opt(o) }
			};
			CHAINB2.is = function(chain){ return chain instanceof CHAINB2 }
			CHAINB2.get = function(chain, lex, cb){
				var soul = lex.soul, graph = chain.__.graph, node;
				if(node = graph[soul]){
					return cb.call(chain, null, node);
				}
				Gun.tab.store.get(soul, function(err, data){
					graph[soul] = data;
					cb.call(chain, err, data);
				});
			};
			CHAINB2.state = Date.now || function(){ return new Date().getTime() }
			CHAINB2.constructor = CHAINB2;
			CHAINB2.chain = CHAINB2.prototype;
			CHAINB2.chain.opt = function(o){
				var chain = this;
				chain.__ = chain.__ || chain._;
				chain.__.graph = chain.__.graph || {};
				return chain;
			};
			CHAINB2.chain.chain = function(){
				var chain = new CHAINB2(this);
				chain.__ = this.__;
				chain.back = this;
				return chain;
			};
			;(function(){
				function get(err, node){
					var chain = this, at = chain._;
					at.count++;
					at.err = err;
					at.node = node;
					if(chain.next){ chain.next.run(at) }
				}
				CHAINB2.chain.get = function(soul, cb, opt){
					var chain = this.chain(), at = chain._, lex = at.lex;
					lex.soul = soul;
					lex.opt = opt;
					if(cb){
						at.ok = cb;
						CHAINB2.get(chain, lex, get);
					}
					return chain;
				};
			}());
			function got(err, node){
				var chain = this, at = chain._;
				at.err = err;
				at.node = node;
				chain.run(at);
			}
			;(function(){
				function run(cat){
					var chain = this, at = chain._, lex = at.lex, field = lex.field, node, vert, val;
					at.count++;
					at.err = cat.err;
					if(node = cat.node){
						if(val = Gun.is.rel(node[cat.lex.field])){
							return CHAINB2.get(chain, {soul: val}, got);
						}
						if(val = node[field]){
							at.node = vert = {};
							vert[field] = val;
						}
					}
					at.back = cat;
					if(chain.next){ chain.next.run(at) }
				}
				CHAINB2.chain.path = function(field, cb, opt){ 
					var chain = this.chain(), at = chain._, lex = at.lex
					, back = this, from = back._, flex = from.lex, vert;
					if(!field){
						if(0 != field){
							return chain;
						}
					}
					lex.field = field = ''+field;
					back.next = chain;
					chain.run = run;
					if(from.count){
						chain.run(from);
					} else
					if(!flex.field){
						lex.soul = flex.soul;
						CHAINB2.get(chain, lex, got);
					}
					return chain;
				};
			}());
			;(function(){
				function wrap(cat, data){
					if(!cat){ return data }
					if(cat.lex.field){
						data = Gun.obj.put({}, cat.lex.field, data);
					}
					data = Gun.is.node.soul.ify(data, cat.lex.soul);
					if(cat.lex.soul){ return data }
					if(cat !== cat.back){
						return wrap(cat.back, data);
					}
					return data;
				}
				function run(cat){ var at = cat, state = Gun.time.is();
					var data = wrap(cat, cat.put.data);
					/*end(null, {graph: {
						users: {_: {'#': 'users', '>': {1: 9}}, 1: {'#': 'fdsa'}},
						fdsa: {_: {'#': 'fdsa', '>': {where: 9}}, where: {'#': 'sadf'}},
						sadf: {_: {'#': 'sadf', '>': {lat: 9, lng: 9, i: 9}}, lat: 0.123456789, lng: 0.987654321, i:1}
					}});return;*/
					Gun.ify(data, end, {
						node: function(env, cb){ var eat = env.at;
							if(1 === eat.path.length && at.node){
								eat.soul = Gun.is.rel(at.node[eat.path[0]]);
							}
							cb(env, eat);
						}, value: function(env){ var eat = env.at;
							if(!eat.field){ return }
							Gun.is.node.state.ify(eat.node, {field: eat.field, state: state});
						}, uuid: gun.__.opt.uuid, state: state
					});
				}
				function ack(err, ok){
					//if(Gun.fns.is(opt.any)){ opt.any.call(gun, err, ok) } // TODO: gun context!
				}
				function end(err, env){
					if(err){ return }
					Gun.put(gun, env.graph, ack, env.opt); // TODO: incorrect options!
				}
				CHAINB2.chain.put = function(data, cb, opt){ 
					var chain = this, at = chain._, put = at.put;
					put.data = data;
					put.state = CHAINB2.state();
					chain.run = run;
					if(at.count){ chain.run(at) }
					return chain;
				};
			}());
			;(function(){
				function run(cat){
					var chain = this, lex = cat.lex, node = cat.node, field = lex.field, val;
					if(field && (val = Gun.is.rel(node[field]))){
						return CHAINB2.get(chain, {soul: val}, got);
					}
					chain.cb(cat.node);
				}
				CHAINB2.chain.on = function(cb){
					var chain = this, at = chain._;
					chain.run = run;
					chain.cb = cb;
					if(at.count){ chain.run(at) }
					return chain;
				}
			}());
			var chainb2 = CHAINB2();

			function gun_get(soul){
				gun_get.as = 'a';
				if(!gun_get.a) Gun.tab.store.get(soul, gun_get.load);
				return gun_get;
			}
			gun_get.load = function(err,data){ gun_get[gun_get.as] = data }
			gun_get.path = function(f){
				var soul = Gun.is.rel(gun_get.a[f]);
				gun_get.as = 'b';
				if(!gun_get.b) Gun.tab.store.get(soul, gun_get.load);
				return gun_get;
			}
			gun_get.pathing = function(f){
				var soul = Gun.is.rel(gun_get.b[f]);
				gun_get.as = 'c';
				if(!gun_get.c) Gun.tab.store.get(soul, gun_get.load);
				return gun_get;
			}
			gun_get.on = function(cb){
				cb(gun_get.c);
				return gun_get;
			}
			var hewo = {hello: "world"};
			window.puti = window.puti || 0;
			window.geti = window.geti || 0;
			localStorage.clear();
			var gun = g.get('heylo');
			gun.once(ok);
			//var ok = function(a,b){ console.log('wat', a,b) }
			/*
			gun.get('users').put({1: {where: {lat: Math.random(), lng: Math.random(), i: 1}}});
			//Gun.log.debug=1;console.log("------------------");
			var val = gun.get('users').path(1).path('where').once(ok);
			*/
	});
	//localStorage.clear();
	stool.add('nothing', function(){
		// do nothing
	});
	stool.add('write', function(){
		gun.put({hello: "world"});
	});
	stool.add('read', function(){
		gun.once(ok);
	});return;
	// without variable caching:
	stool.add('write', function(){
		gun.get('hi').put({hello: "world"});
	});
	stool.add('read', function(){
		gun.get('hi').once(ok);
	});return;
	/*
	stool.add('put', function(){
		gun.get('users').put({1: {where: {lat: Math.random(), lng: Math.random(), i: 1}}});
	});
	stool.add('on', function(){
		val.once(ok);
	});
	stool.add('on', function(){
		gun.get('users').path(1).path('where').once(ok);
	});
	return;
	stool.add('put', function(){
		gun.get(puti++).put(hewo, any);asdf;
	});return;
	stool.add('put', function(){
		gun.get(geti++, any);
	});
	return;
	stool.add('get', function(){
		got.on(ok);
	});
	stool.add('get', function(){
		gun.get('users', any);
	});
	return;
	return;
	stool.add('get path * 2 put', function(){
		gun.get('users').path(i).path('where').put(pos);
	});
	stool.add('get path path on', function(){
		gun.get('users').path(i).path('where').on(ok);
	});
	stool.add('get path path', function(){
		gun.get('users').path(i).path('where', any);
	});
	stool.add('get path', function(){
		gun.get('users').path(i, any);
	});
	stool.add('get on', function(){
		gun.get('users').on(ok);
	});
	stool.add('get', function(){
		gun.get('users', any);
	});
	stool.add('get', function(){
		got.on(ok);
	});
	stool.add('fnx2', function(){
		thing.get('users').on(ok);
	});
	return;
	stool.add('get path * 2 on', function(){
		gun.get('users').path(i).path('where').on(function(node){
			console.log(node);
		});
	});
	return;
	stool.add('chain', function(){
		chainb2.get('users').path(i).path('where').on(function(node){
			//console.log(node);
		});
	});
	return;
	stool.add('chain', function(){
		chainb1.get('users').path(i).path('where').on(function(node){
			console.log(node);
		});
	});
	stool.add('chain', function(){
		chaina9.get('users').path(i).path('where').put(pos);
	});
	return;
	stool.add('chain', function(){
		chaina8.get('users').path(i).path('where').put(pos);
	});
	stool.add('chain', function(){
		chaina7.get('users').path(i).path('where').put(pos);
	});
	// Not declaring any metadata in the constructor takes this too far, still faster to initialize default values so methods don't do the work instead.
	stool.add('chain', function(){
		chaina6.get('users').path(i).path('where').put(pos);
	});
	// Counter to performance advice other places, it seems faster to not declare the fields in advance!
	stool.add('chain', function(){
		chaina5.get('users').path(i).path('where').put(pos);
	});
	// Caching functions allows us to keep above 1M ops/sec on my machine.
	stool.add('chain proto cache', function(){
		chaina4.get('users').path(i).path('where').put(pos);
	});
	// What if we then want the functions to actually do something?
	stool.add('chain proto fn work', function(){
		chaina3f.get('users').path(i).path('where').put(pos);
	});
	// HOLY COW! Major performance impact. This is probably the most important lesson. Do everything possible to prevent dynamic allocation of functions. They destroy performance more than anything else it seems. A good article on this: http://code.tutsplus.com/tutorials/stop-nesting-functions-but-not-all-of-them--net-22315 . 
	stool.add('chain proto fn', function(){
		chaina3e.get('users').path(i).path('where').put(pos);
	});
	// Be clever and check the param and then do one-time root level instantiation. Clean up referencing the root in every chain and gain +1M! Is this a card/board game?
	stool.add('chain proto check param', function(){
		chaina3d.get('users').path(i).path('where').put(pos);
	});
	// Add for the ability to have a parameter in your constructor. Lose 1M for being lame like that.
	stool.add('chain proto param', function(){
		chaina3c.get('users').path(i).path('where').put(pos);
	});
	// Try and make the class check be its own function and then have your heart get crushed. Don't do it or suffer ~1.5M ops/sec lost.
	stool.add('chain proto is check', function(){
		chaina3b.get('users').path(i).path('where').put(pos);
	});
	// Let's see if we can move some of this logic towards the constructor and lose the need for new.
	stool.add('chain proto no new', function(){
		chaina3a.get('users').path(i).path('where').put(pos);
	});
	// Now we need to check the in memory graph - so we have to reference it somehow. Lose ~half million ops/sec.
	stool.add('chain proto state put', function(){
		chaina3.get('users').path(i).path('where').put(pos);
	});
	// Have `path` look up its previous chain's context. Burn a couple million dollars.
	stool.add('chain proto state path', function(){
		chaina2.get('users').path(i).path('where').put(pos);
	});
	// Now start to flesh out the actual metadata states for the classes. Loose some performance.
	stool.add('chain proto state get', function(){
		chaina1.get('users').path(i).path('where').put(pos);
	});
	// What if we try to make put be a class on the existing class metadata? Well nope, makes things worse - high 1M ops/sec compared to a low 2M ops/sec. Moral of the story is have your class stub deeply and don't try to speed things up by using more classes (it doesn't work).
	stool.add('chain proto state every put class', function(){
		chain9.get('users').path(i).path('where').put(pos);
	});
	// Now we want to actually do stuff with the put arguments, which puts us now at the low 2M ops/sec. Let's stub them out as well.
	stool.add('chain proto state every back put', function(){
		chain8.get('users').path(i).path('where').put(pos);
	});
	// Alright, now we need `path` to actually do some validation on its parameters. You'll now might lose what you just gained back.
	stool.add('chain proto state every back path', function(){
		chain7.get('users').path(i).path('where').put(pos);
	});
	// Does stubbing out `chain.back` help at all? No. In fact, noticeably worse. Don't go down this pathway.
	stool.add('chain proto state every back', function(){
		chain6.get('users').path(i).path('where').put(pos);
	});
	// However our chain isn't actually creating new contextual chains. Something not every tool has to support but is important for us and things like jQuery. So prepare to then ditch ~1/4 or ~1/3 of your performance.
	stool.add('chain proto state every', function(){
		chain5.get('users').path(i).path('where').put(pos);
	});
	// But using a prototype to stub out the metadata gives us back an extra 1M ops/sec.
	stool.add('chain proto state', function(){
		chain4.get('users').path(i).path('where').put(pos);
	});
	// And then ~40% loss of performance just to assign the parameter to metadata on the chain.
	stool.add('chain proto state', function(){
		chain3.get('users').path(i).path('where').put(pos);
	});
	// Roughly ~1M ops/sec difference between the exact same code, except having arguments. No, not referencing the magical `arguments` object, just literally including parameters.
	stool.add('chain params', function(){
		chain2.get('users').path(i).path('where').put(pos);
	});
	stool.add('chain nothing', function(){
		chain.get('users').path(i).path('where').put(pos);
	});
	*/
	stool.add('Gun.ify', function(){
		Gun.graph.ify(data);
	});
	stool.add('Gun.ify', function(){
		Gun.ify(data);
	});
	return;
	stool.add('JSON.ify', function(){
		JSON.stringify(data);
	});
	stool.add('on', function(){
		on('data').emit(obj);
	});
	// This wound up being ~25M ops/sec on my machine.
	stool.add('call fn', function(){
		var a,b,c,d,e;
		a = f1(1);
		if(a){
			b = f2(a,2);
		}
		if(b){
			c = f3(b,3);
		}
		if(c){
			d = f4(c,4);
		}
		if(d){
			e = f5(c,d,5);
		}
	});
	// Each function call reduces performance by about half, although that amount decreases near the end.
	stool.add('call fn', function(){
		f1();
	}).add('call fn * 2', function(){
		f1();f2();
	}).add('call fn * 3', function(){
		f1();f2();f3();
	}).add('call fn * 4', function(){
		f1();f2();f3();f4();
	}).add('call fn * 5', function(){
		f1();f2();f3();f4();f5();
	});
	stool.add('list a Array?', function(){
		list instanceof Array;
	}).add('list isArray?', function(){
		Array.isArray(list);
	});
	// Wildly inconsistent winning results, although loose equality seemed to occasionally spike and instanceof was most stable at being fastest.
	stool.add('add a fn?', function(){
		add instanceof Function;
	}).add('add type fn?', function(){
		typeof add === 'function';
	}).add('add loose type fn?', function(){
		typeof add == 'function';
	});
	// Tad less than half the speed of a straightforward function call.
	stool.add('Call add', function(){
		var a = {num: 1};
		var b = {num: 2};
		addprop(a,b);
	});
	// The primitive assignments on an object were ~225% better in performance.
	stool.add('Assigning', function(){
		var bi = true;
		var num = 1;
		var text = "Hello world!";
		var list = [bi, num, text];
		var obj = {
			bi: bi,
			num: num,
			text: text,
			list: list,
			obj: {sub: true}
		};
	});
	stool.add('Assign circular', function(){
		var obj = {};
		obj.me = obj;
	});
	// If you thought calling a function was slow... you should probably just leave, now. It was 2/3rds the speed of a function call on my machine.
	stool.add('Assign object', function(){
		var obj = {
			bi: true,
			num: 1,
			text: 'Hello world!'
		};
	});
	// Oh javascript, you make me sad. An ORDER OF MAGNITUDE difference? Let every one be warned: Don't call functions in javascript. Like, no. Just don't. You be slow. So sad. Sad. I'm going to go cry now.
	stool.add('Call a function', function(){
		add(1,2);
	});
	stool.add('Add', function(){
		1 + 2;
	});
	// Simple addition and primitive assignment wasn't too bad either, 1B+ ops/sec!
	stool.add('Assign text', function(){
		var text = 'Hello world!';
	});
	stool.add('Assign', function(){
		var bi = true;
	});
	// We found out that doing nothing is extremely fast. In fact, on our machine we clocked over 1B ops/sec. This is obviously the future of JavaScript.
	stool.add('Nothing', function(){

	});
}());