;(function(){
	function upload(cb, opt){
		var el = $(this); cb = cb || function(){}; opt = opt || {};
		el.on('drop', function(e){
			e.preventDefault();
			upload.drop(((e.originalEvent||{}).dataTransfer||{}).files, 0);
		}).on('dragover', function(e){
		    e.preventDefault();
		});
		upload.drop = function(files,i){
			if(opt.max && (files[i].fileSize > opt.max || files[i].size > opt.max)){
				cb({err: "File size is too large.", file: file[i]}, upload);
				if(files[++i]){ upload.drop(files,i) }
				return false;
			}
			reader = new FileReader();
			reader.onload = function(e){
				cb({file: files[i], event: e, id: i}, upload);
				if(files[++i]){ upload.drop(files,i) }
			};
			if(files[i]){ reader.readAsDataURL(files[i]) }
		}
	}
	upload.shrink = function(e, cb, w, h){ // via stackoverflow
		if(!e){ return cb && cb({err: "No file!"}) }
		if(e.err){ return }
		var file = (((e.event || e).target || e).result || e), img = new Image();
    img.src = file;
    img.onload = function(){
      if(!h && img.width > w){ h = img.height * (w / img.width) }
			var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
	    canvas.width = w;
	    canvas.height = h;
	    ctx.drawImage(img, 0, 0, w, h); // draw source image to canvas.
	    var b64 = e.base64 = canvas.toDataURL(); // base64 the compressed image.
	    cb((e.base64 && e) || b64); 
    };
	}
	$.fn.upload = upload;
}());