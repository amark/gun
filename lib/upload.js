;(function(){
	function upload(cb, opt){
		var el = $(this); cb = cb || function(){};
		opt = $.isPlainObject(opt)? opt : {input: opt}; 
		el.on('drop', function(e){
			e.preventDefault();
			upload.drop(((e.originalEvent||e).dataTransfer||{}).files||[], 0);
		}).on('dragover', function(e){
			e.preventDefault();
		});
		$(opt.input||el).on('change', function(e){
			if(!(e = (e.target||this||{}).files)){ return }
			upload.drop(e, 0);
		});
		upload.drop = function(files,i){
			if(opt.max && (files[i].fileSize > opt.max || files[i].size > opt.max)){
				cb({err: "File size is too large.", file: file[i]}, upload);
				if(files[++i]){ upload.drop(files,i) }
				return false;
			}
			var reader = new FileReader();
			reader.onload = function(e){
				cb({file: files[i], event: e, id: i}, upload);
				if(files[++i]){ upload.drop(files,i) }
			};
			if(files[i]){ reader.readAsDataURL(files[i]) }
		}
		return this;
	}
	upload.shrink = function(e, cb, w, h){ // via stackoverflow
		if(!e){ return cb && cb({err: "No file!"}) }
		if(e.err){ return }
		var file = (((e.event || e).target || e).result || e), img = new Image();
		if(!((file||'').split(';')[0].indexOf('image') + 1)){ e.err = "Not an image!"; return cb(e) }
    img.crossOrigin = "Anonymous";
    img.src = file;
    img.onload = function(){
    	if(img.width < (w = w || 1000) && img.height < (h||Infinity) && "data:" == file.slice(0,5)){
    		e.base64 = file;
    		return cb(e || file);
    	}
      if(!h){ h = img.height * (w / img.width) }
			var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
	    canvas.width = w;
	    canvas.height = h;
	    ctx.drawImage(img, 0, 0, w, h); // draw source image to canvas.
	    var b64 = e.base64 = canvas.toDataURL(); // base64 the shrunk image.
	    cb((e.base64 && e) || b64); 
    };
	}
	$.fn.upload = upload;
}());