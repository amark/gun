module.exports=require('theory')
('shoot',function(a){
	if(root.node){
		var shot = require('../../shots0')({src: a.com, batch: 999}).pump(function(g, m, done){
			console.log('>>> pump!');
			done();
		});
		return shot.spray(function(g, m, done){
			console.log('>>> shoot!');
			var gPrime = {};
			done(gPrime); // allow me to send custom modified filtered version
			//console.log(g());
		});
	}
	var shoot = {}
	, shot = a.shot()
	, the = a.discrete
	, $graph = $("#graph")
	, $node = $("#model-node")
	, $has = $("#model-has")
	, $ref = $("#model-ref")
	, $sub = $("#model-obj")
	, $url = $('body>.id')
	, g;
	shoot.clone = function($e, $to, id, name){
		var $r = $e.clone().attr('id',id).appendTo($to);
		name = name || id;
		if(name){ $r.attr('name', name) }
		return $r;
	}
	shoot.graph = function(g, url){
		if(url){ $url.text(url) }
		a.obj(g).each(function(n,id){
			var $n = $node.clone().attr('id',id).attr('name',id).appendTo($graph);
			$('.id', $n).text(id);
			shoot.field($('.sub', $n), n);
		});
		$('.node .sub .sub').slideUp();
	}
	shoot.field = function($n, n, p){
		a.obj(n).each(function(val,key){
			if(key === '_'){ return }
			if(a.obj.is(val)){
				var $val = shoot.clone($sub, $n, key);
				$('.key', $val).text(key);
				shoot.field($('.sub', $val), val);
			} else {
				var $val = shoot.clone($has, $n, key)
				, $v = $('.val', $val).text(val);
				$('.key', $val).text(key);
				if(a.bi.is(val)){
					$v.addClass('binary');
				} else
				if(a.num.is(val)){
					$v.addClass('number');
				} else
				if(a.text.is(val)){
					$v.addClass('text');
				}
			}
		});
	}
	shot.load('gunjs.herokuapp.com/tests/package.json',function(graph){
		if(!graph){ return $url.text("Something went wrong :( please reload.") }
		g = graph;
		window.graphbug = g;
		console.log('graph', g());
		shoot.graph(g(), 'Graph');
	});
	require('./interface')(function(){});
	$(document).on('keyboard',function(){
		var the = theory.discrete
		, key = theory.key, u;
		key.map({
			'up': 'prev'
			,'down': 'next'
			,'right': 'open'
			,'left': 'close'
			,'enter': 'add'
			,'erase': 'remove'
		});
		$(document).on('keyup','[contenteditable="true"]',function(e){
			if(!g){ return }
			e.where = this;
			var $v = $(e.where).find('.val').addBack('.val')
			, p = shoot.path($v), val, v;
			if(!p){ return }
			val = g(p);
			if(val === u){ return }
			v = $v.text();
			v = (v === 'true')? true : v;
			v = (v === 'false')? false : v;
			v = (a.num.is(parseFloat(v)))? parseFloat(v) : v;
			if(val === v){ return }
			console.log("EDIT FINALLY", p, val, v, (val === v));
			g(p,v);
		});
		the.key('enter').up(function(e){
			if(!g || the.key.tame()){ return }
		},document);
		the.key('erase').down(function(e){
			if(the.key.tame()){ return }
			e.stun(); e.stop();
		},document);
		the.key('erase').up(function(e){
			e.stun(); e.stop();
			if(!g || the.key.tame()){ return }
			var $v = $('.on')
			, p = shoot.path($v)
			, val;
			if(!p){ return }
			val = g(p);
			if(val === u){ return }
			g(p,null);
			shoot.nav();
			$v.closest('.field').remove();
		},document);
		shoot.path = function($e){
			return $e.parents().addBack().map(function(){
				return $(this).attr('name')
			}).get().join('.');
		}
		shoot.nav = function(dir){
			if(the.key.tame()){ return }
			var f = '.field', c = 'on', g = $graph;
			var x = dir? 'prev' : 'next', y = dir? 'last' : 'first';
			var on = $('.'+c, g), n;
			if(!on.length){
				return on = $(f, g)[y]().addClass(c);
			}
			if(dir){
				n = on.prev(f);
				if(!n.length){
					n = null;
				}
			}
			n = (n||on).find(f+':visible')[y]();
			if(!n.length){
				n = on[x](f);
			}
			if(!n.length){
				n = on.parents(f).first();
				if(!dir){
					n = n[x](f)[y]();
				}
				if(!n.length){
					n = $(f, g)[y]();
				}
			}
			on.removeClass(c);
			n.addClass(c);
		}
		the.key('down').hold(function(e){
			shoot.nav();
		});
		the.key('up').hold(function(e){
			shoot.nav(-1);
		});
		the.key('right').up(function(e){
			shoot.nav.out = false;
			if(the.key.tame()){ return }
			var on = $('.on', $graph);
			if(!on.children('.sub').length){ 
				return on.children('.val').focus();
			}
			on.children('.sub').slideDown();
		});
		the.key('left').up(function(e){
			var on = $('.on', $graph), n;
			if(the.key.tame()){
				if(shoot.nav.out){
					return $('.val',on).trigger('blur');
				}
				a.test(function(){
					var s = window.getSelection()
					, r = s.getRangeAt(0);
					if(!r.startOffset){
						shoot.nav.out = true;
					}
				})();
				return;
			}
			if(on.find('.field:visible').length){
				return $('.sub',on).slideUp();
			}
			n = on.parents('.field').first();
			if(!n.length){ return }
			on.removeClass('on');
			on = n.addClass('on');
			$('.sub',on).slideUp();
		});
		the.mouse.up(function(e){
			$('.on').removeClass('on');
			$(e.where).closest('.field').addClass('on');
		},'.field');
	});
	return shot.spray;
},['../../shot0']);