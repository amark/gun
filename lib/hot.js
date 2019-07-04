;(function(){
	// on fires when shortcut keydowns or on touch after command selected and then touchdown
	var m = meta;
	m.edit({name: "Add", combo: ['A']});
	m.edit({name: "Row", combo: ['A', 'R'],
		on: function(eve){
			m.tap().append('<div class="hold center" style="min-height: 9em; padding: 2%;">');
		}
	});
	m.edit({name: "Columns", combo: ['A','C'],
		on: function(eve){
			var on = m.tap(), tmp, c;
			var html = '<div class="unit col" style="min-height: 9em; padding: 2%;"></div>';
			if(!on.children('.col').length){ html += html }
			c = (tmp = on.append(html).children('.col')).length;
			tmp.each(function(){
				$(this).css('width', (100/c)+'%');
			})
		}
	});
	m.edit({name: "Text", combo: ['A','T'],
		on: function(eve){
			m.tap().append('<p contenteditable="true">Text</p>');
		}
	});
	m.edit({name: "Drag", combo: ['D']});
	;(function(){
		$(document).on('click', function(){
			var tmp = $('.m-on');
			if(!tmp.length){ return }
			tmp.removeClass('m-on');
		})
		m.edit({combo: [38], // up
			on: function(eve){
				var on = m.tap().removeClass('m-on');
				on = on.prev().or(on.parent()).or(on);
				on.addClass('m-on');
			}, up: function(){ 
			}
		});
		m.edit({combo: [40], // down
			on: function(eve){
				var on = m.tap().removeClass('m-on');
				on = on.next().or(on.children().first()).or(on);
				on.addClass('m-on');
			}, up: function(){ 
			}
		});
		m.edit({combo: [39], // right
			on: function(eve){
				var on = m.tap().removeClass('m-on');
				on = on.children().first().or(on.next()).or(on.parent()).or(on);
				on.addClass('m-on');
			}, up: function(){ 
			}
		});
		m.edit({combo: [37], // left
			on: function(eve){
				var on = m.tap().removeClass('m-on');
				on = on.parent().or(on);
				on.addClass('m-on');
			}, up: function(){ 
			}
		});
	}());
	m.edit({name: "Turn", combo: ['T']});
	m.edit({name: "Size", combo: ['S']});
	m.edit({name: "X", combo: ['S','X'],
		on: function(eve){
			var on = m.tap(), was = on.width();
			$(document).on('mousemove.tmp', function(eve){
				var be = was + ((eve.pageX||0) - was);
				on.css({'max-width': be, width: '100%'});
			})
		}, up: function(){ $(document).off('mousemove.tmp') }
	});
	m.edit({name: "Y", combo: ['S','Y'],
		on: function(eve){
			var on = m.tap(), was = on.height();
			$(document).on('mousemove.tmp', function(eve){
				var be = was + ((eve.pageY||0) - was);
				on.css({'min-height': be});
			})
		}, up: function(){ $(document).off('mousemove.tmp') }
	});
	m.edit({name: "Fill", combo: ['F'],
		on: function(eve){
			var on = m.tap();
			m.ask('Color name, code, or URL?', function(color){
				var css = on.closest('p').length? 'color' : 'background';
				on.css(css, color);
			});
		}
	});
}());