jsQuery = (function(){
	if(!window || !window.jQuery){
		console.log("jQuery Required!");
	}
	var $ = window.jQuery;
	function jsQuery(js){
		if(typeof js === 'string'){
			js = jsQuery.dom(js);
		}
		return js;
	}
	var jsq = jsQuery;
	jsq.dom = function(text, env){
		return (function recurse(tree, dom, prev){
			dom = dom || $('<div>'); prev = '';
			$.each(tree, function(i, code){
				if($.isArray(code)){
					var div = recurse(code);
					if(0 <= prev.indexOf('function')){
						div.addClass('function');
					} else
					if(0 <= prev.indexOf('if') || 0 <= prev.indexOf('else')){
						div.addClass('if');
					}
					dom.append(div);
				} else
				if(code){
					dom.append($("<span>").text(code));
				}
				prev = code;
			});
			return dom;
		})(nestrecurse(text || "", ['{','}']));
	}
	function nestrecurse(text){
		text = text || "";
		var args = Array.prototype.slice.call(arguments, 1);
		var env = {i: -1, text: text, at: [], start: {}, end: {}, count: {}};
		var i = -1, l = text.length; while(++i < l){
			env.c = env.text[++env.i];
			var ii = -1, ll = args.length, s = '', e = ''; while(!(s || e) && ++ii < ll){
				var nest = args[ii], s = (typeof nest === "string");
				var start = s? nest : nest[0], end = s? nest : nest[1];
				var c = (start.length === 1? env.c : env.text.slice(env.i, start.length));
				if(start === c){
					if(env.count[start] == env.count[end] || 0){
						s = start;
					}
					env.count[start] = (env.count[start] || 0) + 1;
				} else
				if(end === c){
					env.count[end] = (env.count[end] || 0) + 1;
					if(env.count[end] == env.count[start] || 0){
						e = end;
					}
				}
			}
			if(s){
				env.at.push(env.text.slice(0, env.i + s.length));
				env.text = env.text.slice(env.i + s.length); env.i = -1;
			}
			if(e){
				env.at.push(nestrecurse.apply(nestrecurse, [env.text.slice(0, env.i)].concat(args)));
				env.text = env.text.slice(env.i); env.i = e.length -1;
			}
		}
		if(env.text){
			env.at.push(env.text);
		}
		return env.at;
	}
	return jsQuery
}());