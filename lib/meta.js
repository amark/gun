$(function(){
	var noop = function(){}, u;
	var m = window.meta = {edit:[]};
	var k = m.key = {};
	k.meta = {17:17, 91:17, 93:17, 224:17};
	k.down = function(eve){
		if(eve.repeat){ return }
		var key = (k.eve = m.eve = eve).which = eve.which || eve.fake || eve.keyCode;
		if(!eve.fake && key === k.last){ return } k.last = key;
		if(!eve.fake && $(eve.target).closest('input, textarea, [contenteditable=true]').length){
			if(k.meta[key]){ k.down.meta = key = -1 }
			if(!k.down.meta){ return }
		}
		(k.combo || (k.combo = [])).push(key);
		m.check('on', key, k.at || (k.at = m.edit));
		if(k.meta[key]){
			m.list(k.at.back || m.edit);
			if(k.at && !k.at.back){ m.flip() }
		}
	}
	k.up = function(eve){ var tmp;
		var key = (k.eve = m.eve = eve).which = eve.which || eve.fake || eve.keyCode;
		if(!eve.fake && $(eve.target).closest('input, textarea, [contenteditable=true]').length){
			if(k.meta[key]){
				k.down.meta = null;
				key = -1;
			} else
			if(!k.down.meta){ return }
		}
		k.last = null;
		if($(':focus').closest('#meta').length){ return }
		m.check('up', key);
		if(-1 === key || 27 === eve.which){ k.wipe() }
	}
	m.flip = function(tmp){
		var board = $('#meta .meta-menu');
		((tmp === false) || (!tmp && board.is(':visible')))? 
			board.addClass('meta-none')
		: board.removeClass('meta-none');
	}
	m.flip.is = function(){
		return $('#meta .meta-menu').is(':visible');
	}
	m.flip.wait = 500;
	m.check = function(how, key, at){
		at = k.at || m.edit;
		var edit = at[key];
		if(!edit){ return }
		var tmp = k.eve || noop;
		if(tmp.preventDefault){ tmp.preventDefault() }
		if(edit[how]){
			if(tmp.fake && !edit.fake){
				m.tap.edit = edit;
			} else {
				edit[how](m.eve);
				/*if(k.at !== m.edit && 'up' === how){
					if(k.down.meta){ m.list(k.at = m.edit) }
					else { k.wipe() }
				}*/
			}
		}
		if('up' != how){ return }
		if(at != edit){ edit.back = at }
		m.list(edit, true);
	}
	m.list = function(at, opt){
		if(!at){ return m.flip(false) }
		var l = [];
		$.each(at, function(i,k){ 'back' != i && k.combo && k.name && l.push(k) });
		if(!l.length){ return }
		k.at = at;
		l = l.sort(function(a,b){
			a = a.combo.slice(-1)[0] || 0;
			if(a.length){ a = a.toUpperCase().charCodeAt(0) }
			b = b.combo.slice(-1)[0] || 0;
			if(b.length){ b = b.toUpperCase().charCodeAt(0) }
			return (a < b)? -1 : 1;
		});
		var $ul = $('#meta .meta-menu ul')
		$ul.children('li').addClass('meta-none').hide(); setTimeout(function(){ $ul.children('.meta-none').remove() },250); // necessary fix for weird bug glitch
		$.each(l, function(i, k){
			$ul.append($('<li>').text(k.name));
		});
		if(opt){ m.flip(true) }
		$ul.append($('<li>').html('&larr;').one('click', function(){
			m.list(k.at = at.back);
		}));
	}
	m.ask = function(help, cb){
		var $ul = $('#meta .meta-menu ul').empty();
		var $put = $('<input>').attr('id', 'meta-ask').attr('placeholder', help);
		var $form = $('<form>').append($put).on('submit', function(eve){ 
			eve.preventDefault();
			cb($put.val());
			$li.remove();
			k.wipe();
		});
		var $li = $('<li>').append($form);
		$ul.append($li);
		m.flip(true);
		$put.focus();
	}
	k.wipe = function(opt){
		k.down.meta = false;
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
	$(window).on('blur', k.wipe).on('focus', k.wipe);
	$(document).on('mousedown mousemove mouseup', function(eve){
		m.tap.eve = eve;
		m.tap.x = eve.pageX||0;
		m.tap.y = eve.pageY||0;
		m.tap.on = $(eve.target);
	}).on('mousedown touchstart', function(eve){
		var tmp = m.tap.edit;
		if(!tmp || !tmp.on){ return }
		tmp.on(eve);
		m.tap.edit = null;
	});
	$(document).on('touchstart', '#meta .meta-start', function(eve){ m.tap.stun = true });
	$(document).on('click', '#meta .meta-menu li', function(eve){
		if(m.tap.stun){ return m.tap.stun = false }
		if(!(eve.fake = eve.which = (($(this).text().match(/[A-Z]/)||{})[0]||'').toUpperCase().charCodeAt(0))){ return }
		eve.tap = true;
		k.down(eve);
		k.up(eve);
	});
	$(document).on('keydown', k.down).on('keyup', k.up);
	meta.edit = function(edit){
		var tmp = edit.combow = [];
		$.each(edit.combo || (edit.combo = []), function(i,k){
			if(!k || !k.length){ if('number' == typeof k){ tmp.push(k) } return }
			tmp.push(k.toUpperCase().charCodeAt(0));
		});
		var at = meta.edit, l = edit.combo.length;
		$.each(tmp, function(i,k){ at = at[k] = (++i >= l)? edit : at[k] || {} });
		edit.combow = edit.combow.join(',');
		m.list(meta.edit);
	}
	$.fn.or = function(s){ return this.length ? this : $(s||'body') };
	;(function(){try{
		/* UI */
		if(meta.css){ return }
		var $m = $('<div>').attr('id', 'meta');
		$m.append($('<span>').text('+').addClass('meta-start'));
		$m.append($('<div>').addClass('meta-menu meta-none').append('<ul>'));
		$(document.body).append($m);
		css({
			'#meta': {
				display: 'block',
				position: 'fixed',
				bottom: '2em',
				right: '2em',
				background: 'white',
				'font-size': '18pt',
				'font-family': 'Tahoma, arial',
				'box-shadow': '0px 0px 1px #000044',
				'border-radius': '1em',
				'text-align': 'center',
				'z-index': 999999,
				margin: 0,
				padding: 0,
				width: '2em',
				height: '2em',
				opacity: 0.7,
				outline: 'none',
				color: '#000044',
				overflow: 'visible',
				transition: 'all 0.2s ease-in'
			},
			'#meta *': {outline: 'none'},
			'#meta .meta-none': {display: 'none'},
			'#meta span': {'line-height': '2em'},
			'#meta .meta-menu': {
				background: 'rgba(0,0,0,0.1)',
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
				background: 'white',
				padding: '0.5em 1em',
				'border-radius': '1em',
				'margin-left': '0.25em',
				'margin-top': '0.25em',
				'float': 'right'
			},
			'#meta a': {color: 'black'},
			'#meta:hover': {opacity: 1},
			'#meta .meta-menu ul:before': {
				content: "' '",
				display: 'block',
				'min-height': '15em',
				height: '50vh'
			},
			'#meta li': {
				background: 'white',
				padding: '0.5em 1em',
				'border-radius': '1em',
				'margin-left': '0.25em',
				'margin-top': '0.25em',
				'float': 'right'
			},
			'#meta:hover .meta-menu': {display: 'block'}
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
			document.body.appendChild(tag);
		}
	}catch(e){}}());
	;(function(){
		// include basic text editing by default.
		var monotype = window.monotype || function(){console.log("monotype needed")};
		var m = meta;
		m.text = {zws: '&#8203;'};
		m.text.on = function(eve){ var tmp;
			if($((eve||{}).target).closest('#meta').length){ return }
			m.text.range = null;
			if(!(m.text.copy()||'').trim()){
				m.flip(false);
				m.list(m.text.it);
				return;
			}
			m.text.range = monotype((eve||{}).target);
			m.text.it.on(eve);
		}
		m.text.copy = function(tmp){
			return ((tmp = window.getSelection) && tmp().toString()) ||
				((tmp = document.selection) && tmp.createRange().text) || '';
		}
		$(document).on('select contextmenu keyup mouseup', '[contenteditable=true]', m.text.on);
		m.text.editor = function(opt, as){ var tmp;
			if(!opt){ return }
			opt = (typeof opt == 'string')? {edit: opt} : opt.tag? opt : {tag: opt};
			var r = opt.range = opt.range || m.text.range || monotype(), cmd = opt.edit;
			as = opt.as = opt.as || as;
			if(cmd && document.execCommand){
				r.restore();
				if(document.execCommand(cmd, null, as||null)){
					if(m.text.range){ m.text.range = monotype() }
					return;
				}
			}
			if(!opt.tag){ return }
			opt.tag = $(opt.tag);
			opt.name = opt.name || opt.tag.prop('tagName');
			if((tmp = $(r.get()).closest(opt.name)).length){
				if(r.s === r.e){
					tmp.after(m.text.zws);
					r = r.select(monotype.next(tmp[0]),1);
				} else {
					tmp.contents().unwrap(opt.name);
				}
			} else
			if(r.s === r.e){
				r.insert(opt.tag);
				r = r.select(opt.tag);
			} else {
				r.wrap(opt.tag);
			}
			r.restore();
			opt.range = null;
			if(m.text.range){ m.text.range = monotype() }
		}
		meta.edit(meta.text.it = {combo: [-1], on: function(){ m.list(this, true) }, back: meta.edit}); // -1 is key for typing.
		meta.text.it[-1] = meta.text.it;
		meta.edit({
			name: "Bold",
			combo: [-1,'B'], fake: -1,
			on: function(eve){
				meta.text.editor('bold');
			},
			up: function(){}
		});
		meta.edit({
			name: "Italic",
			combo: [-1,'I'], fake: -1,
			on: function(eve){
				meta.text.editor('italic');
			},
			up: function(){}
		});
		/*meta.edit({
			name: "Underline",
			combo: [-1,'U'], fake: -1,
			on: function(eve){
				meta.text.editor('underline');
			},
			up: function(){}
		});*/
		meta.edit({
			name: "linK",
			combo: [-1,'K'], fake: -1,
			on: function(eve){
				var range = meta.text.range || monotype();
				meta.ask('Paste or type link...', function(url){
					meta.text.editor({tag: $('<a href="'+url+'">link</a>'), edit: url? 'createLink' : 'unlink', as: url, range: range});
				})
			}
		});
		//meta.edit({name: "aliGn", combo: [-1,'G']}); // MOVE TO ADVANCED MENu!
		meta.edit({
			name: "Left",
			combo: [-1,'G','L'], fake: -1,
			on: function(eve){ meta.text.editor('justifyLeft') },
			up: function(){}
		});
		meta.edit({
			name: "Right",
			combo: [-1,'G','R'], fake: -1,
			on: function(eve){ meta.text.editor('justifyRight') },
			up: function(){ }
		});
		meta.edit({
			name: "Middle",
			combo: [-1,'G','M'], fake: -1,
			on: function(eve){ meta.text.editor('justifyCenter') },
			up: function(){ }
		});
		meta.edit({
			name: "Justify",
			combo: [-1,'G','J'], fake: -1,
			on: function(eve){ meta.text.editor('justifyFull') },
			up: function(){}
		});
		// Align Number
		// Align Points
		// Align Strike
		meta.edit({name: "Size", combo: [-1,'S'], on: function(){ m.list(this, true) }});
		meta.edit({
			name: "Small",
			combo: [-1,'S','S'], fake: -1,
			on: function(eve){ meta.text.editor('fontSize', 2) },
			up: function(){ }
		});
		meta.edit({
			name: "Normal",
			combo: [-1,'S','N'], fake: -1,
			on: function(eve){ meta.text.editor('fontSize', 5) },
			up: function(){}
		});
		meta.edit({
			name: "Header",
			combo: [-1,'S','H'], fake: -1,
			on: function(eve){ meta.text.editor('fontSize', 6) },
			up: function(){}
		});
		meta.edit({
			name: "Title",
			combo: [-1,'S','T'], fake: -1,
			on: function(eve){ meta.text.editor('fontSize', 7) },
			up: function(){}
		});
	}());
});