
var root;
if(typeof window !== "undefined"){ root = window }
if(typeof global !== "undefined"){ root = global }
root = root || {};
var console = root.console || {log: function(){}};
function require(arg){
	return arg.slice? require[resolve(arg)] : function(mod, path){
		arg(mod = {exports: {}});
		require[resolve(path)] = mod.exports;
	}
	function resolve(path){
		return path.split('/').slice(-1).toString().replace('.js','');
	}
}
if(typeof module !== "undefined"){ var common = module }
