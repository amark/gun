$(function(){
	var m = window.meta = {edit:[], os:{}}, ua = '', u;
	try{ua = navigator.userAgent.toLowerCase()}catch(e){}
	m.os.is = {
		win: (ua.search("win") >= 0)? "windows":false,
		lin: (ua.search("linux") >= 0)? "linux":false,
		mac: (ua.search("mac") >= 0)? "macintosh":false,
		and: (ua.search("android") >= 0)? "android":false,
		ios: (ua.search('ipod') >= 0 
			|| ua.search('iphone') >= 0 
			|| ua.search('ipad') >= 0)? "ios":false
	}
	var k = m.key = {ctrl: 17, cmd: 91};
	k.meta = (m.os.is.win||m.os.is.lin||m.os.is.and)? k.ctrl : k.cmd;
	k.down = function(eve){
		if($(eve.target).is('input') || eve.repeat){ return }
		(k.eve = m.eve = eve).which = eve.which || eve.fake || eve.keyCode;
		if(!eve.fake && eve.which === k.last){ return }
		if(k.meta === (k.last = eve.which)){ k.down.meta = m.flip(k.wipe()) || true }
		if(m.flip.is()){
			(k.combo || (k.combo = [])).push(eve.which);
			m.check('on', eve.which, k.at || (k.at = m.edit));
		}
		if(eve.metaKey && (k.meta !== eve.which)){ k.up(eve) } // on some systems, meta hijacks keyup
	}
	k.up = function(eve){ var tmp;
		if($(eve.target).is('input')){ return }
		k.eve = m.eve = eve;
		k.last = null;
		eve.which = eve.which || eve.fake || eve.keyCode;
		if(m.flip.is()){ m.check('up', eve.which) }
		if(tmp = (k.meta === eve.which)){ k.down.meta = false }
		if(tmp && k.at === m.edit){ k.wipe() }
		if(27 === eve.which){ return m.flip(false) }
	}
	m.flip = function(tmp, aid){
		if(aid){
			m.flip.aid = true;
			setTimeout(function(){$(document).one('click',function(eve){m.flip(m.flip.aid = false)})},250); // ugly but important for visual aid.
		}
		var board = $('#meta .meta-menu');
		((tmp === false) || (!tmp && board.is(':visible')))? 
			board.addClass('meta-none')
		: board.removeClass('meta-none');
	}
	m.flip.is = function(){
		if(m.flip.aid && ((m.eve||{}).fake || k.at !== m.edit)){ m.flip.aid = false }
		return !m.flip.aid && $('#meta .meta-menu').is(':visible');
	}
	m.flip.wait = 500;
	m.check = function(how, key, at){
		at = k.at || m.edit;
		//m.list(at);
		var edit = at[key], tmp;
		if(!edit){ return }
		if(k.eve && k.eve.preventDefault){ k.eve.preventDefault() }
		if(edit[how]){
			edit[how](m.eve);
			if(k.at !== m.edit && 'up' === how){
				if(k.down.meta){ m.list(k.at = m.edit) }
				else { k.wipe() }
			}
		}
		if('up' != how){ return }
		edit.back = at;
		m.list(edit, at);
	}
	m.list = function(at){
		var l = [];
		$.each(at, function(i,k){ 'back' != i && k.combo && l.push(k) });
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
		if(!at.back){ return }
		$ul.append($('<li>').html('&larr;').one('click', function(){ m.list(k.at = at.back) }));
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
		$put.focus();
	}
	k.wipe = function(){
		k.combo = [];
		m.flip(false);
		m.flip.aid = false;
		m.list(k.at = m.edit);
	};
	$(document).on('keydown', k.down).on('keyup', k.up);
	m.tap = {};
	m.tap.select = function(eve){
		m.tap.range = null;
		if(!(m.tap.text()||'').trim()){
			if(m.tap.was){
				m.tap.was = null;
				m.flip(false);
			}
			return;
		}
		m.flip(m.tap.range = monotype((eve||{}).target), m.tap.was = true);
	}
	m.tap.text = function(tmp){
		return ((tmp = window.getSelection) && tmp().toString()) ||
			((tmp = document.selection) && tmp.createRange().text) || '';
	}
	$(window).on('blur', k.wipe).on('focus', k.wipe);
	$(document).on('select contextmenu keyup mouseup', '[contenteditable=true]', m.tap.select);
	//.on('keydown', '[contenteditable=true]', function(e){});
	$(document).on('touchstart', '#meta .meta-start', function(eve){ m.tap.stun = true });
	$(document).on('click', '#meta .meta-menu li', function(eve){
		if(m.tap.stun){ return m.tap.stun = false }
		if(!(eve.fake = eve.which = (($(this).text().match(/[A-Z]/)||{})[0]||'').toUpperCase().charCodeAt(0))){ return }
		eve.tap = true;
		k.down(eve);
		k.up(eve);
	});
	meta.edit = function(edit){
		var tmp = edit.combow = [];
		$.each(edit.combo || (edit.combo = []), function(i,k){
			if(!k || !k.length){ return }
			tmp.push(k.toUpperCase().charCodeAt(0));
		});
		var at = meta.edit, l = edit.combo.length;
		$.each(tmp, function(i,k){ at = at[k] = (++i >= l)? edit : at[k] || {} });
		edit.combow = edit.combow.join(',');
		m.list(meta.edit);
	}
	meta.text = {zws: '&#8203;'};
	meta.text.editor = function(opt, as){ var tmp;
		if(!opt){ return }
		opt = (typeof opt == 'string')? {edit: opt} : opt.tag? opt : {tag: opt};
		var r = opt.range = opt.range || m.tap.range || monotype(), cmd = opt.edit;
		as = opt.as = opt.as || as;
		if(cmd && document.execCommand){
			r.restore();
			if(document.execCommand(cmd, null, as||null)){ return }
		}
		if(!opt.tag){ return }
		opt.tag = $(opt.tag);
		opt.name = opt.name || opt.tag.prop('tagName');
		if((tmp = $(r.get()).closest(opt.name)).length){
			if(r.s === r.e){
				tmp.after(meta.text.zws);
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
		if(m.tap.range){ m.tap.range = monotype() }
	}
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
				color: '#000044',
				overflow: 'visible',
				transition: 'all 0.2s ease-in'
			},
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
			(node = document.createElement('style')).innerHTML = tmp;
			document.body.appendChild(node);
		}
	}catch(e){}}());
	;(function(){
	// on fires when shortcut keydowns or on touch after command selected and then touchdown
	meta.edit({
		name: "Bold",
		combo: ['B'],
		on: function(e){
			meta.text.editor('bold');
		},
		up: function(){}
	});
	meta.edit({
		name: "Italic",
		combo: ['I'],
		on: function(e){
			meta.text.editor('italic');
		},
		up: function(){}
	});
	meta.edit({
		name: "Underline",
		combo: ['U'],
		on: function(e){
			meta.text.editor('underline');
		},
		up: function(){}
	});
	meta.edit({
		name: "linK",
		combo: ['K'],
		up: function(e){
			var range = meta.tap.range || monotype();
			meta.ask('Paste or type link...', function(url){
				meta.text.editor({tag: $('<a href="'+url+'">link</a>'), edit: url? 'createLink' : 'unlink', as: url, range: range});
			})
		},
		on: function(){}
	});
	meta.edit({name: "aliGn", combo: ['G']});
	meta.edit({
		name: "Left",
		combo: ['G','L'],
		on: function(e){ meta.text.editor('justifyLeft') },
		up: function(){}
	});
	meta.edit({
		name: "Right",
		combo: ['G','R'],
		on: function(e){ meta.text.editor('justifyRight') },
		up: function(){ }
	});
	meta.edit({
		name: "Middle",
		combo: ['G','M'],
		on: function(e){ meta.text.editor('justifyCenter') },
		up: function(){ }
	});
	meta.edit({
		name: "Justify",
		combo: ['G','J'],
		on: function(e){ meta.text.editor('justifyFull') },
		up: function(){}
	});
	// Align Number
	// Align Points
	// Align Strike
	meta.edit({name: "Size", combo: ['S']});
	meta.edit({
		name: "Small",
		combo: ['S','S'],
		on: function(e){ meta.text.editor('fontSize', 2) },
		up: function(){ }
	});
	meta.edit({
		name: "Normal",
		combo: ['S','N'],
		on: function(e){ meta.text.editor('fontSize', 5) },
		up: function(){}
	});
	meta.edit({
		name: "Header",
		combo: ['S','H'],
		on: function(e){ meta.text.editor('fontSize', 6) },
		up: function(){}
	});
	meta.edit({
		name: "Title",
		combo: ['S','T'],
		on: function(e){ meta.text.editor('fontSize', 7) },
		up: function(){}
	});
	// Size Spacing
	// Size Super
	// Size Sub
	meta.edit({name: "Edit", combo: ['E']});
	}());
});