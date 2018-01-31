;(function(){
	function as(el, gun, cb){
		el = $(el);
		if(gun === as.gui && as.el && as.el.is(el)){ return }
		as.gui = gun;
		as.el = el;
		if(el.data('as')){
			el.html(el.data('as').fresh);
		} else {
			el.data('as', {
				fresh: el.html()
			})
		}
		el.find("[name]").each(function(){
			if($(this).find("[name]").length){ return }
			var name = $(this),
				parents = name.parents("[name]"),
				path = [],
				ref = gun;

			path.push(name.attr('name'));
			parents.each(function(){
				path.push($(this).attr('name'));
			});
			path = path.reverse();

			path.forEach(function(key){
				if('#' === key){
					ref = ref.map()
				} else {
					ref = ref.get(key);
				}
			});
			
			var many = path.slice().reverse().indexOf('#'), model;
			many = (0 < ++many)? many : false;
			if(many){
				model = name.closest("[name='#']");
				model = model.data('model') || model.data('model', {$: model.clone(), on: model.parent(), has: {}}).hide().data('model');
			} 

			ref.get(function(at){
				var data = at.put, key = at.get, gui = at.gun, ui = name, back;
				if(model){
					ui = model.has[(gui._).id];
					if(!ui){
						back = gui.back(many - 1);
						ui = model.has[(back._).id];
						if(!ui){
							if(!(back._).get){ return }
							ui = (model.has[(back._).id] = model.$.clone(true).prependTo(model.on));
						}
						ui = ui.find("[name='"+key+"']").first();
						model.has[(gui._).id] = ui;
					}
				}
				ui.data('gun', gui);
				if(ui.data('was') === data){ return }
				if(many && ui.is('.sort')){
					var up = ui.closest("[name='#']");
					var tmp = as.sort(data, up.parent().children().last());
					up.insertAfter(tmp);
				}
				if(as.lock === gui){ return }
				(ui[0] && u === ui[0].value)? ui.text(data) : ui.val(data);
				ui.data('was', data);
				if(cb){
					cb(data, key, ui);
				}
			});
		});
	}
	as.wait = function(cb, wait, to){
		return function(a,b,c){
			var me = as.typing = this;
			clearTimeout(to);
			to = setTimeout(function(){
				cb.call(me, a,b,c);
				as.typing = me = false;
			}, wait || 200);
		}
	}
	as.sort = function(sort, el) {
		var vs = $(el).find('.sort');
		vs = (vs[0] && u === vs[0].value)? vs.text() : vs.val();
		var id = sort;
		var test = id >= vs;
		return test ? el : as.sort(sort, el.prev());
	}
	$(document).on('keyup', 'input, textarea, [contenteditable]', as.wait(function(){
		var el = $(this);
		var data = (el[0] && u === el[0].value)? el.text() : el.val();
		var g = el.data('gun');
		if(!g){ return }
		as.lock = g;
		g.put(data);
	}, 99));
	var u;
	window.as = as;
}());

;(function(){
	$('.page').not(':first').hide();
	$(document).on('click', 'a, button', function(e){
		e.preventDefault();
		r($(this).attr('href'));
	});
	function r(href){
		if(!href){ return }
		if(href[0] == '#'){ href = href.slice(1) }
		var h = href.split('/')[0];
		$('.page').hide();
		$('#' + h).show();
		location.hash = href;
		(r.page[h] || {on:function(){}}).on();
		return r;
	};
	r.page = function(h, cb){
		r.page[h] = r.page[h] || {on: cb};
		return r;
	}
	r.render = function(id, model, onto, data){
		var $data = $(
			$('#' + id).get(0) ||
			$('.model').find(model).clone(true).attr('id', id).appendTo(onto)
		);
		$.each(data, function(field, val){
			if($.isPlainObject(val)){ return }
			$data.find("[name='" + field + "']").val(val).text(val);
		});
		return $data;
	}
	setTimeout(function(){ r(location.hash.slice(1)) },1);
	window.onhashchange = function(){ r(location.hash.slice(1)) };
	if(window.as){
		as.route = r;
	} else {
		$.route = r;
	}
}());