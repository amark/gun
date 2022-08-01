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
		var axe = root.axe = {}, tmp, id;
		var mesh = opt.mesh = opt.mesh || Gun.Mesh(root); // DAM!
		axe.fall = {};

		tmp = peers[id = location.origin + '/gun'] = peers[id] || {};
		tmp.id = tmp.url = id; tmp.retry = tmp.retry || 0;
		/*tmp = peers[id = 'http://localhost:8765/gun'] = peers[id] || {};
		tmp.id = tmp.url = id; tmp.retry = tmp.retry || 0;*/
		Gun.log.once("AXE", "AXE enabled: Trying to find network via (1) local peer (2) last used peers (3) a URL parameter, and last (4) hard coded peers.");
		Gun.log.once("AXEWarn", "Warning: AXE alpha became super slow & laggy, now in testing only mode!");
		var last = (localStorage||'')['peers'] || '';
		last += (location.search.split('peers=')[1]||'').split('&')[0];

		root.on('bye', function(peer){
			this.to.next(peer);
			if(peer.retry){ return }
			//delete axe.fall[peer.id || peer.url];
			(function attempt(){
				clearTimeout(peer.attempt);
				var fall = Object.keys(axe.fall), one = fall[(Math.random()*fall.length) >> 0];
				//console.log("fall???", one, fall);
				if(!one){
					peer.attempt = setTimeout(attempt, 9);
					return;
				}
				//console.log("attempt", one);
				mesh.hi(one);
			}());
		});

		function found(text){
			console.log(text, axe.fall);

			((text||'').match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/ig)||[]).forEach(function(url){
				axe.fall[url] = {url: url, id: url, retry: 0}; // RETRY
			});
			
			//axe.fall = {'https://relay.peer.ooo/gun': {id: 'https://relay.peer.ooo/gun', url: 'https://relay.peer.ooo/gun', retry: 0}};
			return;
		  var urls = getUrls(urls);

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
		try{ fetch((location.search.split('axe=')[1]||'').split('&')[0] || location.axe || 'https://raw.githubusercontent.com/wiki/amark/gun/volunteer.dht.md').then(function(res){
	  	return res.text()
	  }).then(found).catch(function(){
	  	found(); // nothing
	  })}catch(e){found()}
	}

	var empty = {}, yes = true;
  try{ if(typeof module != ''+u){ module.exports = AXE } }catch(e){}
}());