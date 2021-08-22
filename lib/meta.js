;(function(){
  function USE(arg, req){
    return req? require(arg) : arg.slice? USE[R(arg)] : function(mod, path){
      arg(mod = {exports: {}});
      USE[R(path)] = mod.exports;
    }
    function R(p){
      return p.split('/').slice(-1).toString().replace('.js','');
    }
  }
  if(typeof module !== "undefined"){ var MODULE = module }

	/* UNBUILD */
	;USE(function(module){
		var noop = function(){}, u;
		$.fn.or = function(s){ return this.length ? this : $(s||'body') };
		var m = window.meta = {edit:[]};
		var k = m.key = {};
		k.meta = {17:17, 91:17, 93:17, 224:17, 18: 17}; // ALT added
		function withMeta(eve){ return eve.metaKey || eve.ctrlKey || eve.altKey } // ALT added
		k.down = function(eve){
			var key = (k.eve = m.eve = eve).which = eve.which || eve.fake || eve.keyCode;
		  if(eve.repeat){ return }
			if(!k.meta[key] && withMeta(eve) && !k.at[key]) {
			  return m.flip(false)
		  } // cancel and close when no action and "meta key" held down (e.g. ctrl+c)
			if(!eve.fake && key === k.last){ return }; k.last = key; // jussi: polyfilling eve.repeat?
			if(!eve.fake && $(eve.target).closest('input, textarea, [contenteditable=true]').length/* && !$(eve.target).closest('#meta').get().length*/){
				return;
		    //if(meta.flip.is() && !withMeta(eve)) eve.preventDefault()
			}
			m.check('on', key, k.at || (k.at = m.edit));
			if(k.meta[key]){ m.flip() }
		}
		k.down.keys = {} // currently pressed keys
		k.up = function(eve){ var tmp;
			var key = (k.eve = m.eve = eve).which = eve.which || eve.fake || eve.keyCode;
			k.last = null;
			m.check('up', key);
			if(k.meta[key] && m.check.fired){
				m.close()
			}
		}
		m.flip = function(tmp){
		  m.flip.active = true;
			((tmp === false) || (!tmp && m.ui.board.is(':visible')))?
				m.close() : m.open();
		  m.flip.active = false;
		}
		m.open = function(){
		  m.check.fired = null;
		  m.ui.board.removeClass('meta-none');
		}
		m.close = function(){
			Object.keys(k.down.keys).forEach((keyDown) => {
			  m.check('up', keyDown);
			})
			m.ui.board.addClass('meta-none')
		}
		m.flip.is = function(){
			return m.ui.board.is(':visible');
		}
		m.flip.wait = 500;
		m.check = function(how, key, at){
		  if(!m.flip.is() && !k.meta[key]){ return } // TEMP: cancel non-open events when closed TODO make optional
		  at = k.at || m.edit;
			var next = at[key];
			if(!next){ return }
			var tmp = k.eve || noop;
			if(tmp.preventDefault){ tmp.preventDefault()} // prevent typing (etc) when action found
			if(next[how]){
					next[how](m.eve);
					meta.ui.blink();
					m.check.fired = true;
					if(how == 'up') delete k.down.keys[key]
					else            k.down.keys[key] = 1;
			}
			if('up' == how){ return }
			if(at != next && !next.back){ next.back = at }
			(k.combo || (k.combo = [])).push(key);
			m.list(next, true);
		}
		function defaultSort(a,b){
			a = a.combo.slice(-1)[0] || 0;
			if(a.length){ a = a.toUpperCase().charCodeAt(0) }
			b = b.combo.slice(-1)[0] || 0;
			if(b.length){ b = b.toUpperCase().charCodeAt(0) }
			return (a < b)? -1 : 1;
		}
		m.list = function(at, opt){
			if(!at){ return m.flip(false) }
			var l = [];
			$.each(at, function(i,k){ 'back' != i && k && k.combo && k.name && l.push(k) });
			if(!l.length){ return }
			k.at = at;
			if(at.sort !== null){ l = l.sort(at.sort || defaultSort) }
			var $ul = $('#meta .meta-menu ul')
			$ul.children('li').addClass('meta-none').hide(); setTimeout(function(){ $ul.children('.meta-none').remove() },250); // necessary fix for weird bug glitch
			$.each(l, function(i, k){
			  var $li = $('<li>').text(k.name).data(k)
				$ul.append($li);
				if(k.styles) meta.ui.iniline($li[0], k.styles);
			});
			if(opt){ m.flip(true) }
			$ul.append($('<li>').html('&larr;').on('click', back));
		}
		m.ask = function(help, cb, opt){
			var $ul = $('#meta .meta-menu ul').empty();
			var $put = $('<input>').attr('id', 'meta-ask').attr('placeholder', help);
			var $form = $('<form>').append($put).on('submit', function(eve){
				eve.preventDefault();
				cb($put.val());
				$li.remove();
				k.wipe();
			});
			if(opt){
				$form.on('keyup', function(eve){ cb($put.val()) })
			}
			var $li = $('<li>').append($form);
			$ul.append($li);
			m.flip(true);
			$put.focus();
		}
		k.wipe = function(opt){
			k.combo = [];
			if(!opt){ m.flip(false) }
			m.list(k.at = m.edit);
		};
		m.tap = function(){
			var on = $('.meta-on')
				.or($($(document.querySelectorAll(':hover')).get().reverse()).first())
				.or($(document.elementFromPoint(meta.tap.x, meta.tap.y)));
			return on;
		}
		meta.edit = function(e){
			var path = [];
			$.each(e.combo || (e.combo = []), function(i,k){
				if(!k || !k.length){ if('number' == typeof k){ path.push(k) } return }
				path.push(k.toUpperCase().charCodeAt(0));
			});
			var at = meta.edit, l = e.combo.length;
			$.each(path, function(i,k){ at = at[k] = at[k] || Object.create(defaults) });
		  $.extend(at, e) // fixes overwriting when sub action is defined before parent
			e.combow = path.join(','); // deprecate?
			m.list(k.at || meta.edit);
		}
		function back(){ // close root or go back on submenu
		  k.at == m.edit ? m.flip(false) : m.check('down', 'back')
		}
		var defaults = {
			8:  { on: back },  // backspace
			27: { up: k.wipe } // esc: close and reset menu
		}
		$.extend(meta.edit, defaults)
	})(USE, './metaCore');
	;USE(function(module){
		/* UI */
		meta.ui = {
			blink: function(){ // hint visually that action has happened
				$('#meta').css('transition', 'none').css('background', 'none')
				setTimeout(function(){
					$('#meta')[0].style.transition = null
					$('#meta')[0].style.background = null
				})
			},
			depth: function(n){
			  if (n) {
					$('#meta').css('background', 'hsl(60, 100%,'+(85-(n*10))+'%)');
				} else {
					$('#meta')[0].style.background = null
				}
			}
		}
		var $m = $('<div>').attr('id', 'meta');
		//$m.append($('<span>').html('&#9776;').addClass('meta-start'));
		$m.append($('<span>').html('+').addClass('meta-start'));
		$m.append($('<div>').addClass('meta-menu meta-none').append('<ul>'));
		$m.on('mouseenter', function(){
		  if (meta.flip.active || meta.flip.is()) return;
		  meta.flip();
		})
		$m.on('mouseleave', function(){
		  if (meta.flip.active || !meta.flip.is()) return;
		  meta.flip(false);
		})
		$(document.body).append($m);
		meta.ui.board = $('.meta-menu', $m);
		css({
			'#meta': {
				display: 'block',
				position: 'fixed',
				bottom: '2em',
				right: '2em',
				'font-size': '18pt',
				'font-family': 'Tahoma, arial',
				'border-radius': '1em',
				'text-align': 'center',
				'z-index': 999999,
				margin: 0,
				padding: 0,
				width: '2em',
				height: '2em',
				outline: 'none',
				overflow: 'visible',
				background: 'rgba(0,0,0,0.5)', color: 'white',
				transition: 'all 0.2s ease-in'
			},
			'#meta *': {outline: 'none'},
			'#meta .meta-none': {display: 'none'},
			'#meta span': {'line-height': '2em'},
			'#meta .meta-menu': {
				background: 'rgba(0,0,0,0.2)',
				width: '12em',
				right: '-2em',
				bottom: '-2em',
				overflow: 'visible',
				position: 'absolute',
				'overflow-y': 'scroll',
				'text-align': 'right',
				'min-height': '20em',
				height: '100vh'
			},
			'#meta .meta-menu ul': {
				padding: 0,
				margin: '1em 1em 2em 0',
				'list-style-type': 'none'
			},
			'#meta .meta-menu ul li': {
				display: 'block',
				'float': 'right',
				padding: '0.5em 1em',
				'border-radius': '1em',
				'margin-left': '0.25em',
				'margin-top': '0.25em',
				background: 'rgba(0,0,0,0.2)', 'backdrop-filter': 'blur(10px)', color: 'white',
				'cursor':  'pointer'
			},
			'#meta .meta-menu ul li:hover': {
				background: 'rgba(0,0,0,0.5)'
			},
			'#meta a': {color: 'black'},
			'#meta:hover': {opacity: 1},
			'#meta:hover .meta-menu': {display: 'block'},
			'#meta .meta-menu ul:before': {
				content: "' '",
				display: 'block',
				'min-height': '15em',
				height: '50vh'
			},
			'#meta .meta-start': {
				cursor: 'pointer'
			}
		});
		function css(css){
			var tmp = '';
			$.each(css, function(c,r){
				tmp += c + ' {\n';
				$.each(r, function(k,v){
					tmp += '\t'+ k +': '+ v +';\n';
				});
				tmp += '}\n';
			});
			var tag = document.createElement('style');
			tag.innerHTML = tmp;
			$m.append(tag)
		}
		meta.ui.iniline = function(el, cssObj){
			for(var k in cssObj) { el.style[k] = cssObj[k]; }
		}
	})(USE, './metaUI');
	;USE(function(module){
		var m = meta, k = m.key;
		//$(window).on('focus', k.wipe.bind(null, false)); // .on('blur', k.wipe.bind(null, false))
		$(document).on('mousedown mousemove mouseup', function(eve){
			m.tap.eve = eve;
			m.tap.x = eve.pageX||0;
			m.tap.y = eve.pageY||0;
			m.tap.on = $(eve.target);
		})
		var [start, end] = 'ontouchstart' in window
												? ['touchstart', 'touchend']
												: ['mousedown', 'mouseup']
		$(document).on(start, '#meta .meta-menu li', function(eve){
			var combo = $(this).data().combo;
			eve.fake = eve.which = combo && combo.slice(-1)[0].toUpperCase().charCodeAt(0);
			eve.tap = true;
			k.down(eve);
			$(document).one(end, () => k.up(eve))
		return;
		});
		$(document).on('keydown', k.down).on('keyup', k.up);
		$('#meta').on(start, function(ev) {
		  if (ev.target.tagName == 'LI' || ev.target.tagName == 'UL') return
			meta.flip()
		})
	})(USE, './metaEvents');
}());
