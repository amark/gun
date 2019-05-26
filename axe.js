;(function(){

	/* UNBUILD */
	var root;
	if(typeof window !== "undefined"){ root = window }
	if(typeof global !== "undefined"){ root = global }
	root = root || {};
	var console = root.console || {log: function(){}};
	function USE(arg, req){
		return req? require(arg) : arg.slice? USE[R(arg)] : function(mod, path){
			arg(mod = {exports: {}});
			USE[R(path)] = mod.exports;
		}
		function R(p){
			return p.split('/').slice(-1).toString().replace('.js','');
		}
	}
	if(typeof module !== "undefined"){ var common = module }
	/* UNBUILD */

	;USE(function(module){
    if(typeof window !== "undefined"){ module.window = window }
    var tmp = module.window || module;
		var AXE = tmp.AXE || function(){};

    if(AXE.window = module.window){ AXE.window.AXE = AXE }
    try{ if(typeof common !== "undefined"){ common.exports = AXE } }catch(e){}
    module.exports = AXE;
	})(USE, './root');
  
	;USE(function(module){

		var AXE = USE('./root'), Gun = (AXE.window||{}).Gun || USE('./gun', 1);
		(Gun.AXE = AXE).GUN = AXE.Gun = Gun;
		Gun.on('opt', function(at){
			if(!at.axe){
				var axe = at.axe = {}, tmp;
				var opt = at.opt, peers = opt.peers;
				// 1. If any remembered peers or from last cache or extension
				// 2. Fallback to use hard coded peers from dApp
				// 3. Or any offered peers.
				//if(Gun.obj.empty(p)){
				//  Gun.obj.map(['http://localhost:8765/gun'/*, 'https://guntest.herokuapp.com/gun'*/], function(url){
				//    p[url] = {url: url, axe: {}};
				//  });
				//}
				// Our current hypothesis is that it is most optimal
				// to take peers in a common network, and align
				// them in a line, where you only have left and right
				// peers, so messages propagate left and right in
				// a linear manner with reduced overlap, and
				// with one common superpeer (with ready failovers)
				// in case the p2p linear latency is high.
				// Or there could be plenty of other better options.
				var mesh = opt.mesh = opt.mesh || Gun.Mesh(at);
				console.log("AXE enabled.");

				function verify(dht, msg) {
					var puts = Object.keys(msg.put);
					var soul = puts[0]; /// TODO: verify all souls in puts. Copy the msg only with subscribed souls?
					var subs = dht(soul);
// 					console.log('[AXE] VERIFY soul: %s, subs: %s, Peers: %s, msg: ', soul, subs, Object.keys(peers), msg);
					if (!subs) { return; }
					var tmp = [];
					Gun.obj.map(subs.split(','), function(pid) {
						if (pid in peers) {
							tmp.push(pid);
// 							console.log('[AXE] SEND TO >>>>> ', pid, msg.put.bob || msg.put);
							mesh.say(msg, peers[pid]);
						}
					});
					/// Only connected peers in the tmp array.
					if (opt.super) {
						dht(soul, tmp.join(','));
					}
				}

				var Rad = (Gun.window||{}).Radix || USE('./lib/radix', 1);
				at.opt.dht = Rad();
				at.on('in', input/*USE('./lib/super', 1)*/, at);
// 				at.on('out', function(msg, a) {
// 					this.to.next(msg);
// 					console.log('[AXE] out:', msg, a);
// 				}, at);


				function input(msg){
					var to = this.to, peer = (msg._||{}).via;
					var dht = opt.dht;
					var routes = axe.routes || (axe.routes = {}); // USE RAD INSTEAD! TMP TESTING!
					var get = msg.get, hash, tmp;
					if(get && opt.super && peer){
						hash = Gun.obj.hash(get); // USE RAD INSTEAD!
						(routes[hash] || (routes[hash] = {}))[peer.id] = peer;
						(peer.routes || (peer.routes = {}))[hash] = routes[hash];
						

						/*if(soul = get['#']){ // SWITCH BACK TO USING DHT!
							if(key = get['.']){

							} else {

							}
							if (!peer.id) {console.log('[*** WARN] no peer.id %s', soul);}
							var pids = joindht(dht, soul, peer.id);
							if (pids) {
									var dht = {};
									dht[soul] = pids;
									mesh.say({dht:dht}, opt.peers[peer.id]);
							}
						}*/
					}
					to.next(msg);

					if (opt.rtc && msg.dht) {
						Gun.obj.map(msg.dht, function(pids, soul) {
							dht(soul, pids);
							Gun.obj.map(pids.split(','), function(pid) {
								/// TODO: here we can put an algorithm of who must connect?
								if (!pid || pid in opt.peers || pid === opt.pid || opt.announce[pid]) { return; }
									opt.announce[pid] = true; /// To try only one connection to the same peer.
									opt.announce(pid);
							});
						});
					}
				}

				if(at.opt.super){
					var rotate = 0;
					mesh.way = function(msg) {
						if (msg.rtc) {
// 							console.log('[AXE] MSG WEBRTC: ', msg.rtc);
							if (msg.rtc.to) {
								/// Send announce to one peer only if the msg have 'to' attr
								var peer = (peers) ? peers[msg.rtc.to] : null;
								if (peer) { mesh.say(msg, peer); }
								return;
							}
						}
						if(msg.get){
							var hash = Gun.obj.hash(msg.get);
							var routes = axe.routes || (axe.routes = {}); // USE RAD INSTEAD! TMP TESTING!
							var peers = routes[hash];
							if(!peers){ return mesh.say(msg, opt.peers) }
							var ids = Object.keys(peers); // TODO: BUG! THIS IS BAD PERFORMANCE!!!!
							var meta = (msg._||yes);
							var id, peer, c = 1; // opt. ?redundancy?
							//console.log("AXE:", msg.get, ids);
							while(c-- && (id = ids[(meta.turn = (meta.turn || 0) + 1) - 1])){ // TODO: This has many flaws to it!
								peer = peers[id];
								if(false === mesh.say(msg, peer)){ ++c }
							}
							return;
						}
						mesh.say(msg, opt.peers); return; // TODO: DISABLE THIS!!! USE DHT!


						if (!msg.put) { mesh.say(msg); return; }
						//console.log('AXE HOOK!! ', msg);
						verify(opt.dht, msg);
					};
				} else {
					mesh.route = function(msg) {
						if (msg.rtc) {
// 							console.log('[AXE] MSG WEBRTC: ', msg.rtc);
						}
						if (!msg.put) { mesh.say(msg); return; }
						verify(opt.dht, msg);
						/// Always send to superpeers?
						Gun.obj.map(peers, function(peer) {
							if (peer.url) {
// 								console.log('SEND TO SUPERPEER', msg);
								mesh.say(msg, peer);
							}
						});
					};
					/*var connections = 0; // THIS HAS BEEN MOVED TO CORE NOW!
					at.on('hi', function(opt) {
						this.to.next(opt);
						//console.log('AXE PEER [HI]', new Date(), opt);
						connections++;
						/// The first connection don't need to resubscribe the nodes.
						if (connections === 1) { return; }
						/// Resubscribe all nodes.
						setTimeout(function() {
							var souls = Object.keys(at.graph);
							for (var i=0; i < souls.length; ++i) {
								//at.gun.get(souls[i]).off();
								at.next[souls[i]].ack = 0;
								at.gun.get(souls[i]).once(function(){});
							}
						//location.reload();
						}, 500);
					}, at);*/
				}
			}
			this.to.next(at); // make sure to call the "next" middleware adapter.
		});

		function joindht(dht, soul, pids) {
			if (!pids || !soul || !dht) { return; }
			var subs = dht(soul);
			var tmp = subs ? subs.split(',') : [];
			Gun.obj.map(pids.split(','), function(pid) {
				if (pid && tmp.indexOf(pid) === -1) { tmp.push(pid); }
			});
			tmp = tmp.join(',');
			dht(soul, tmp);
			return tmp;
		}

		var empty = {}, yes = true, u;

		module.exports = AXE;
	})(USE, './axe');
}());
