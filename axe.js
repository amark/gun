;(function(){

  /* UNBUILD */
  function USE(arg, req){
    return req? require(arg) : arg.slice? USE[R(arg)] : function(mod, path){
      arg(mod = {exports: {}});
      USE[R(path)] = mod.exports;
    }
    function R(p){
      return p.split('/').slice(-1).toString().replace('.js','');
    }
  }
  if(typeof module !== "undefined"){ var MODULE = module }
  /* UNBUILD */

	;USE(function(module){
    if(typeof window !== "undefined"){ module.window = window }
    var tmp = module.window || module;
		var AXE = tmp.AXE || function(){};

    if(AXE.window = module.window){ AXE.window.AXE = AXE }
    try{ if(typeof MODULE !== "undefined"){ MODULE.exports = AXE } }catch(e){}
    module.exports = AXE;
	})(USE, './root');
  
	;USE(function(module){

		var AXE = USE('./root'), Gun = (AXE.window||'').Gun || USE('./gun', 1);
		(Gun.AXE = AXE).GUN = AXE.Gun = Gun;
    var ST = 0;

		Gun.on('opt', function(at){ start(at) ; this.to.next(at) }); // make sure to call the "next" middleware adapter.

		function start(at){
			if(at.axe){ return }
			var opt = at.opt, peers = opt.peers;
			if(false === opt.axe){ return }
			if((typeof process !== "undefined") && 'false' === ''+(process.env||'').AXE){ return }
			var axe = at.axe = {}, tmp, id;
			tmp = peers[id = 'http://localhost:8765/gun'] = peers[id] || {};
			tmp.id = tmp.url = id;
			tmp.retry = tmp.retry || 2; // BUG: Check 0?
			console.log("Attempting to discover network via (1) local peer (2) last used peers (3) hardcoded peers!");
			var last = JSON.parse((localStorage||'')[(opt.file||'')+'axe/']||null) || {};
			Object.keys(last.peers||'').forEach(function(key){
				tmp = peers[id = key] = peers[id] || {};
				tmp.id = tmp.url = id;
			});
			tmp = peers[id = 'https://gun-manhattan.herokuapp.com/gun'] = peers[id] || {};
			tmp.id = tmp.url = id;
		}

		var empty = {}, yes = true, u;

		module.exports = AXE;
	})(USE, './axe');
}());
