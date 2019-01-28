$(function(){
	var m = window.meta = {edit:[], os:{}}, ua = '';
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
	k.on = {};
	k.down = function(e){ var tmp;
		m.e = e;
		e.which = e.which || e.keyCode;
		if(e.which === k.last){ return }
		if(tmp = (k.meta === e.which)){ m.wipe() }
		k.on[k.last = e.which] = !0;
		$('#debug').val(JSON.stringify(m.key.on, null, 2));
		if(tmp){
			(tmp = $('#create .menu')).is(':visible')?
				tmp.addClass('none') : tmp.removeClass('none');
		}
		if($('#create .menu').is(':visible')){
			(k.combo || (k.combo = [])).push(e.which)
			m.check('on', e.which, k.at || (k.at = m.edit));
		}
	}
	k.up = function(e){
		m.e = e;
		k.last = null;
		e.which = e.which || e.keyCode;
		delete k.on[e.which];
		$('#debug').val(JSON.stringify(k.on, null, 2));
		//if(m.key.on[m.key.meta]){ m.check('up') }
		if($('#create .menu').is(':visible')){ m.check('up', e.which) }
		if(k.meta === e.which){ m.wipe() }
	}
	m.check = function(how, key, at){
		at = k.at || m.edit;
		var edit = at[key], tmp;
		if(!edit){ return }
		if(edit[how]){
			edit[how](m.e);
			return;
		}
		at = k.at = edit;
	}
	m.wipe = function(){
		k.at = m.edit;
		k.combo = [];
		k.on = {};
	};
	$(document).on('keydown', k.down).on('keyup', k.up);
	$(window).on('blur', m.wipe).on('focus', m.wipe);
	//.on('keydown', '[contenteditable=true]', function(e){});
	meta.edit = function(edit){
		var tmp = edit.combow = [];
		$.each(edit.combo || (edit.combo = []), function(i,k){
			if(!k || !k.length){ return }
			tmp.push(k.toUpperCase().charCodeAt(0));
		});
		var at = meta.edit, l = edit.combo.length;
		$.each(tmp, function(i,k){ at = at[k] = (++i >= l)? edit : at[k] || {} });
		edit.combow = edit.combow.join(',');
	}
	// on fires when shortcut keydowns or on touch after command selected and then touchdown
	meta.edit({
		name: "Bold",
		combo: ['B'],
		on: function(e){
			console.log("OO!!", e);
			var r = monotype();
			console.log("YAY!");
			e.preventDefault();
		},
		up: function(){
			console.log("END!")
		}
	});
	meta.edit({
		name: "Italic",
		combo: ['I'],
		on: function(e){
			console.log("YAY!");
			e.preventDefault();
		},
		up: function(){
			console.log("END!")
		}
	});
	meta.edit({
		name: "Under",
		combo: ['U'],
		on: function(e){
			console.log("YAY!");
			e.preventDefault();
		},
		up: function(){
			console.log("END!")
		}
	});
});