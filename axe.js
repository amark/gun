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

    if(!Gun.window){ try{ USE('./lib/axe', 1) }catch(e){} }
		Gun.on('opt', function(at){ start(at) ; this.to.next(at) }); // make sure to call the "next" middleware adapter.

		function start(root){
			if(root.axe){ return }
			var opt = root.opt, peers = opt.peers;
			if(false === opt.axe){ return }
			if((typeof process !== "undefined") && 'false' === ''+(process.env||'').AXE){ return }
			if(!Gun.window){ return }
			var axe = root.axe = {}, tmp, id;
			tmp = peers[id = 'http://localhost:8765/gun'] = peers[id] || {};
			tmp.id = tmp.url = id;
			tmp.retry = tmp.retry || 0; // BUG: Check 0?
			Gun.log.once("AXE", "AXE enabled: Trying to find network via (1) local peer (2) last used peers (3) hard coded peers.");
			Gun.log.once("AXEWarn", "Warning: AXE alpha became super slow & laggy, now in testing only mode!");
			var last = JSON.parse((localStorage||'')[(opt.file||'')+'axe/']||null) || {};
			Object.keys(last.peers||'').forEach(function(key){
				tmp = peers[id = key] = peers[id] || {};
				tmp.id = tmp.url = id;
			});
			tmp = peers[id = 'https://guntest.herokuapp.com/gun'] = peers[id] || {};
			tmp.id = tmp.url = id;

			var mesh = opt.mesh = opt.mesh || Gun.Mesh(root); // DAM!
			mesh.way = function(msg){
				if(root.$ === msg.$ || (msg._||'').via){
					mesh.say(msg, opt.peers);
					return;
				}
				var at = (msg.$||'')._;
				if(!at){ mesh.say(msg, opt.peers); return }
				if(msg.get){
					if(at.axe){ return } // don't ask for it again!
					at.axe = {};
				}
				mesh.say(msg, opt.peers);
			}
		}

		var empty = {}, yes = true, u;

		module.exports = AXE;
	})(USE, './axe');
}());
