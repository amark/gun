;(function(){

	var sT = setTimeout || {}, u;
  if(typeof window !== ''+u){ sT.window = window }
	var AXE = (sT.window||'').AXE || function(){};
  if(AXE.window = sT.window){ AXE.window.AXE = AXE }

	var Gun = (AXE.window||'').GUN || require('./gun');
	(Gun.AXE = AXE).GUN = AXE.Gun = Gun;

  //if(!Gun.window){ try{ require('./lib/axe') }catch(e){} }
  if(!Gun.window){ require('./lib/axe') }

	Gun.on('opt', function(at){ start(at) ; this.to.next(at) }); // make sure to call the "next" middleware adapter.

	function start(root){
		if(root.axe){ return }
		var opt = root.opt, peers = opt.peers;
		if(false === opt.axe){ return }
		if(!Gun.window){ return } // handled by ^ lib/axe.js
		var w = Gun.window, lS = w.localStorage || opt.localStorage || {}, loc = w.location || opt.location || {}, nav = w.navigator || opt.navigator || {};
		var axe = root.axe = {}, tmp, id;
		var mesh = opt.mesh = opt.mesh || Gun.Mesh(root); // DAM!

		tmp = peers[id = loc.origin + '/gun'] = peers[id] || {};
		tmp.id = tmp.url = id; tmp.retry = tmp.retry || 0;
		tmp = peers[id = 'http://localhost:8765/gun'] = peers[id] || {};
		tmp.id = tmp.url = id; tmp.retry = tmp.retry || 0;
		Gun.log.once("AXE", "AXE enabled: Trying to find network via (1) local peer (2) last used peers (3) a URL parameter, and last (4) hard coded peers.");
		Gun.log.once("AXEWarn", "Warning: AXE is in alpha, use only for testing!");
		var last = lS.peers || ''; if(last){ last += ' ' }
		last += ((loc.search||'').split('peers=')[1]||'').split('&')[0];

		root.on('bye', function(peer){
			this.to.next(peer);
			if(!peer.url){ return } // ignore WebRTC disconnects for now.
			if(!nav.onLine){ peer.retry = 1 }
			if(peer.retry){ return }
			if(axe.fall){ delete axe.fall[peer.url || peer.id] }
			(function next(){
				if(!axe.fall){ setTimeout(next, 9); return } // not found yet
				var fall = Object.keys(axe.fall||''), one = fall[(Math.random()*fall.length) >> 0];
				if(!fall.length){ lS.peers = ''; one = 'https://gunjs.herokuapp.com/gun' } // out of peers
				if(peers[one]){ next(); return } // already choose
				mesh.hi(one);
			}());
		});

		root.on('hi', function(peer){ // TEMPORARY! Try to connect all peers.
			this.to.next(peer);
			if(!peer.url){ return } // ignore WebRTC disconnects for now.
			return; // DO NOT COMMIT THIS FEATURE YET! KEEP TESTING NETWORK PERFORMANCE FIRST!
			(function next(){
				if(!peer.wire){ return }
				if(!axe.fall){ setTimeout(next, 9); return } // not found yet
				var one = (next.fall = next.fall || Object.keys(axe.fall||'')).pop();
				if(!one){ return }
				setTimeout(next, 99);
				mesh.say({dam: 'opt', opt: {peers: one}}, peer);
			}());
		});

		function found(text){

			axe.fall = {};
			((text||'').match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/ig)||[]).forEach(function(url){
				axe.fall[url] = {url: url, id: url, retry: 0}; // RETRY
			});
			
			return;

			// TODO: Finish porting below? Maybe not.

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

		if(last){ found(last); return }
		try{ fetch(((loc.search||'').split('axe=')[1]||'').split('&')[0] || loc.axe || 'https://raw.githubusercontent.com/wiki/amark/gun/volunteer.dht.md').then(function(res){
	  	return res.text()
	  }).then(function(text){
	  	found(lS.peers = text);
	  }).catch(function(){
	  	found(); // nothing
	  })}catch(e){found()}
	}

	var empty = {}, yes = true;
  try{ if(typeof module != ''+u){ module.exports = AXE } }catch(e){}
}());