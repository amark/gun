module.exports=require('theory')((function(){
	var key = {};
	key.name = 'key';
	key.author = 'Mark';
	key.version = 4;
	root.opts.kiwi = root.opts.kiwi||{};
	key.deps = ['../discrete'];
	key.init = (function(a){
		var the = a.discrete || theory.discrete;
		$(document).ready(function(){
			root.opts.key = root.opts.key || {};
			var kf = $("#keyface"), h = root.opts.key.host||'';
			if(!kf.length){
				$("body").append("<div id='keyface'></div>");
				$('head').append('<link rel="stylesheet" href="'+h+'/key/key.css">');
				kf = $('#keyface').load(h+"/key/key.html",function(){
					r.init();
				});
			} else {
				r.init();
			}
		});
		var doc = {
			skin: {
				a: {color:'#000'}
				,on: {}
				,dull: {color:'#999'}
				,scale: {
					touch: {'font-size':'1.25em'}
					,key: {'font-size':'1em'}
				}
				,slide: {
					up: 175
					,down: 200
				}
			}
		}, realboard = (function(){ return !the.device.is.oriented })
		layout = (function(doc){
			var lo = {};
			lo.doc = doc||{};
			lo.size = {};
			lo.kb = $("#keyboard");
			lo.kt = $("#keys-top");
			lo.km = $("#keys-main");
			lo.kl = $("#keys-left");
			lo.kr = $("#keys-right");
			lo.k = $("#keys");
			lo.widths = (function(){	
				var r = {};
				r.lx = lo.width(lo.kl,{max:true,out:true})||0;
				r.kx = lo.width(lo.k,{max:true,out:true})||0;
				r.rx = lo.width(lo.kr,{max:true,out:true})||0;
				r.tx = lo.width(lo.kt,{max:true,out:true})||0;
				return r;
			});
			lo.set = function(e,c){
				lo.size.x = $(document).width();
				lo.size.o = lo.size.x/2;
				lo.size.max = lo.widths();
				lo.k.css({ width: lo.size.max.kx, 'margin-left': 'auto', 'margin-right':'auto' });
				lo.kt.css({ width: lo.size.max.tx, left: lo.size.o - lo.size.max.tx/2 });
				//console.log(lo.size.max.kx);
				var bk = lo.k.find("ul.key-row-a").last().find("li:visible").not(".key-offset")
					,bkflp = (bk.first().position()||{left:0}).left
					,bkfl = (lo.k.offset()||{left:0}).left + bkflp;
				//console.log(bkfl +" < "+ lo.size.max.lx);
				if(bkfl < lo.size.max.lx){
					if(!c && realboard()){
						if(lo.size.x <= (lo.size.max.lx - bkflp) + lo.size.max.kx || lo.size.x <= lo.size.max.tx
							|| lo.size.x - lo.size.max.rx <= ((bk.last().offset()||{left:0}).left + bk.last().outerWidth(true))
						){
							lo.kb.find("li:not(.key-a)").hide();
							return lo.set(e,true);
						}
					}
					lo.k.css({'margin-left': lo.size.max.lx - bkflp });
				}
			};
			lo.width = function(a,b){
				var x = 1, aa = a.children("ul.key-row-a").first(), b = b||{};
				b.out = b.out||false;
				b.max = b.max||false;
				b.filter = b.filter||':visible';
				a.children("ul.key-row-a").each(function(){
					aa = (aa.children('li'+b.filter).length < $(this).children('li'+b.filter).length)?
						((b.max)? $(this) : aa) : ((b.max)? aa : $(this));
				});
				aa.children('li'+b.filter).each(function(){
					x += Math.ceil($(this).outerWidth(b.out)||1);
				});
				return ++x;
			}
			lo.track = function(i){
				lo.set();
				lo.doc.initset = true;
				$(window).resize(lo.set);
			}
			return lo;
		}), 
		r = (function(m){
			var k = {};
			k.map = (function(o){
				var tag, code, s, j, x = 1, d, row, rowi, ul = {}, punc = {}, uls = {}
					,npunc = ":not(.punc)", w = $(document).width();
				k.go = true;
				k.wipe(function(){
					k.go = false;
					a.obj(o).each(function(v,i){
						if(!v || v.key || i === 'tag'){ return }
						tag = a.text.caps(i);
						code = the.key.code(tag);
						tag = $.isFunction(v.tag)? v.tag() : (v.tag||v||undefined);
						j = $("#kc"+code).show().addClass('key-a').css(doc.skin.a).html(tag);
						//console.log(" - "+j.outerWidth(true));
						row = j.closest('ul').addClass('key-row-a');
						d = d || row;
						rowi = row.attr('id');
						ul[rowi] = row;
						if(j.is('.punc')){
							npunc = "";
						}
					});
					if(realboard()){
						//x = layout.width(,{out:true,filter: npunc});
						a.obj(ul).each(function(v,i){
							d = (d.children('li'+npunc).length < v.children('li'+npunc).length)?
								v : d;
						});
						(d||$()).children("li"+npunc).each(function(){ // + npunc possibly wrong! actually most def is.
							x += Math.ceil($(this).outerWidth(true)||1);
						});
					}
					a.obj(ul).each(function(v,i){
						if(realboard() && x < w){
							v.children('li'+npunc).show();
						}
						v.slideDown(doc.skin.slide.down);
					});
					k.layout();
				});
				return true;
			});
			k.wipe = (function(fn){
				if(!k || !k.b){ return }
				if(!k.on){ k.on = k.b.show() }
				k.$put.blur().hide().val('');
				var c = 0, l;
				l = k.$rows.stop(true,true).removeClass('key-row-a').removeAttr('style').length;
				k.$rows.slideUp(doc.skin.slide.up,function(){
					$(this).empty().append(k.row[$(this).attr('id')].clone());
				}).promise().done(fn);
			});
			k.instr = (function(s){
				if(!s) return false;
				k.$instr.stop(true,true).slideUp(function(){
					k.$instr.slideDown().children('.instr').html(s).show();
				});
				return;
			});
			k.row = {};
			k.clone = (function(){
				k.$rows.each(function(){
					k.row[$(this).attr('id')] = $(this).contents().clone();
				});
			});
			k.init = (function(){
				k.on = false;
				k.b = $("#keyboard");
				k.$rows = $("#keyboard ul");
				k.$instr = $("#instr");
				k.$put = $("#keyput");
				$(document).trigger('keyboard');
				k.clone();
				k.lo = layout(doc);
				k.lo.track();
			});
			k.layout = (function(){
				k.lo && k.lo.set && k.lo.set();
			});
			return k;
		});r=r();
		return r;
	});
	return key;
})());