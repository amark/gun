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
	m.key = {ctrl: 17, cmd: 91};
	m.key.meta = (m.os.is.win||m.os.is.lin||m.os.is.and)? m.key.ctrl : m.key.cmd;
	m.key.on = {};
	$(document).on('keydown', function(e){
		m.e = e;
		console.log('keydown', e.keyCode);
		m.key.on[e.code = e.keyCode] = !0;
	}).on('keyup', function(e){
		m.e = e;
		delete m.key.on[e.code = e.keyCode];
	}).on('keydown', '[contenteditable=true]', function(e){
		return;
		var r = monotype();
		console.log("keys down", Gun.obj.copy(m.key.on));
		$.each(m.edit, function(i,edit){ var tmp = true;
			$.each(edit.keys||[''], function(i,k){
				if(!m.key.on[k.length? k.charCodeAt(0) : k]){ tmp = false }
			});
			console.log(tmp, edit);
		})
		r.restore();
	});
	m.edit.push({keys: ['B'], on: function(){
		console.log('hi!');
	}})
});