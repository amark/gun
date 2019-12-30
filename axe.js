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
			start(at);
			this.to.next(at); // make sure to call the "next" middleware adapter.
		});

		function start(at){
			if(at.axe){ return }
			var opt = at.opt, peers = opt.peers;
			if(false === opt.axe){ return }
			if((typeof process !== "undefined") && 'false' === ''+(process.env||{}).AXE){ return }
			var axe = at.axe = {}, tmp;
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

			/*
				AXE should have a couple of threshold items...
				let's pretend there is a variable max peers connected
				mob = 10000
				if we get more peers than that...
				we should start sending those peers a remote command
				that they should connect to this or that other peer
				and then once they (or before they do?) drop them from us.
				sake of the test... gonna set that peer number to 1.
				The mob threshold might be determined by other factors,
				like how much RAM or CPU stress we have.
			*/
			opt.mob = opt.mob || Infinity;
			var mesh = opt.mesh = opt.mesh || Gun.Mesh(at);
			console.log("AXE enabled.");

			function verify(dht, msg) {
				var puts = Object.keys(msg.put);
				var soul = puts[0]; /// TODO: verify all souls in puts. Copy the msg only with subscribed souls?
				var subs = dht(soul);
				if (!subs) { return; }
				var tmp = [];
				Gun.obj.map(subs.split(','), function(pid) {
					if (pid in peers) {
						tmp.push(pid);
						mesh.say(msg, peers[pid]);
					}
				});
				/// Only connected peers in the tmp array.
				if (opt.super) {
					dht(soul, tmp.join(','));
				}
			}
			function route(get){ var tmp;
				if(!get){ return }
				if('string' != typeof (tmp = get['#'])){ return }
				return tmp;
			}

			var Rad = (Gun.window||{}).Radix || USE('./lib/radix', 1);
			at.opt.dht = Rad();
			at.on('in', function input(msg){
				var to = this.to, peer = (msg._||{}).via;
				var dht = opt.dht;
				var routes = axe.routes || (axe.routes = {}); // USE RAD INSTEAD! TMP TESTING!
				var get = msg.get, hash, tmp;
				//if(get && opt.super && peer){
				if(get && opt.super && peer && (tmp = route(get))){
					hash = tmp; //Gun.obj.hash(get); // USE RAD INSTEAD!
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
				if((tmp = msg['@']) && (tmp = at.dup.s[tmp]) && (tmp = tmp.it)){
					(tmp = (tmp._||ok)).ack = (tmp.ack || 0) + 1; // count remote ACKs to GET.
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
			});

			//try{console.log(req.connection.remoteAddress)}catch(e){};
			mesh.hear['opt'] = function(msg, peer){
				if(msg.ok){ return opt.log(msg) }
				var tmp = msg.opt;
				if(!tmp){ return }
				tmp = tmp.peers;
				if(!tmp || !Gun.text.is(tmp)){ return }
				if(axe.up[tmp] || 6 <= Object.keys(axe.up).length){ return }
				var o = tmp; //{peers: tmp};
				at.$.opt(o);
				o = peers[tmp];
				if(!o){ return }
				o.retry = 9;
				mesh.wire(o);
				if(peer){ mesh.say({dam: 'opt', ok: 1, '@': msg['#']}, peer) }
			}
			setInterval(function(tmp){
				if(!(tmp = at.stats && at.stats.stay)){ return }
				(tmp.axe = tmp.axe || {}).up = Object.keys(axe.up||{});
			},1000 * 60)
			setTimeout(function(tmp){
				if(!(tmp = at.stats && at.stats.stay)){ return }
				Gun.obj.map((tmp.axe||{}).up, function(url){ mesh.hear.opt({opt: {peers: url}}) })
			},1000);

			if(at.opt.super){
				var rotate = 0;
				mesh.way = function(msg) {
					if (msg.rtc) {
						if (msg.rtc.to) {
							/// Send announce to one peer only if the msg have 'to' attr
							var peer = (peers) ? peers[msg.rtc.to] : null;
							if (peer) { mesh.say(msg, peer); }
							return;
						}
					}
					if(msg.get){ mesh.say(msg, axe.up) } // always send gets up!
					if(msg.get && (tmp = route(msg.get))){
						var hash = tmp; //Gun.obj.hash(msg.get);
						var routes = axe.routes || (axe.routes = {}); // USE RAD INSTEAD! TMP TESTING!
						var peers = routes[hash];
						function chat(peers, old){ // what about optimizing for directed peers?
							if(!peers){ return chat(opt.peers) }
							var ids = Object.keys(peers); // TODO: BUG! THIS IS BAD PERFORMANCE!!!!
							var meta = (msg._||yes);
							clearTimeout(meta.lack);
							var id, peer, c = 1; // opt. ?redundancy?
							while((id = ids[meta.turn || 0]) && c--){ // TODO: This hits peers in order, not necessarily best for load balancing. And what about optimizing for directed peers?
								peer = peers[id];
								meta.turn = (meta.turn || 0) + 1;
								if((old && old[id]) || false === mesh.say(msg, peer)){ ++c }
							}
							//console.log("AXE:", Gun.obj.copy(msg), meta.turn, c, ids, opt.peers === peers);
							if(0 < c){
								if(peers === opt.peers){ return } // prevent infinite lack loop.
								return meta.turn = 0, chat(opt.peers, peers) 
							}
							var hash = msg['##'], ack = meta.ack;
							meta.lack = setTimeout(function(){
								if(ack && hash && hash === msg['##']){ return }
								if(meta.turn >= (axe.turns || 3)){ return } // variable for later! Also consider ACK based turn limit.
								//console.log(msg['#'], "CONTINUE:", ack, hash, msg['##']);
								chat(peers, old); // keep asking for data if there is mismatching hashes.
							}, 25);
						}
						return chat(peers);
					}
					// TODO: PUTs need to only go to subs!
					if(msg.put){
						var routes = axe.routes || (axe.routes = {}); // USE RAD INSTEAD! TMP TESTING!
						var peers = {};
						Gun.obj.map(msg.put, function(node, soul){
							var hash = soul; //Gun.obj.hash({'#': soul});
							var to = routes[hash];
							if(!to){ return }
							Gun.obj.to(to, peers);
						});
						mesh.say(msg, peers);
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
					}
					if (!msg.put) { mesh.say(msg); return; }
					verify(opt.dht, msg);
					/// Always send to superpeers?
					Gun.obj.map(peers, function(peer) {
						if (peer.url) {
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
			axe.up = {};
			at.on('hi', function(peer){
				this.to.next(peer);
				if(!peer.url){ return }
				axe.up[peer.id] = peer;
			});
			at.on('bye', function(peer){ this.to.next(peer);
				if(peer.url){ delete axe.up[peer.id] }
				Gun.obj.map(peer.routes, function(route, hash){
					delete route[peer.id];
					if(Gun.obj.empty(route)){
						delete axe.routes[hash];
					}
				});
			});

			// handle rebalancing a mob of peers:
			at.on('hi', function(peer){
				this.to.next(peer);
				if(peer.url){ return } // I am assuming that if we are wanting to make an outbound connection to them, that we don't ever want to drop them unless our actual config settings change.
				var count = Object.keys(opt.peers).length;
				if(opt.mob >= count){ return }  // TODO: Make dynamic based on RAM/CPU also. Or possibly even weird stuff like opt.mob / axe.up length?
				var peers = Object.keys(axe.up);
				if(!peers.length){ return }
				mesh.say({dam: 'mob', mob: count, peers: peers}, peer);
				//setTimeout(function(){ mesh.bye(peer) }, 9); // something with better perf? // UNCOMMENT WHEN WE ACTIVATE THIS FEATURE
			});
			at.on('bye', function(peer){
				this.to.next(peer);
			});

			at.on('hi', function(peer){
				this.to.next(peer);
				// this code handles disconnecting from self & duplicates
				setTimeout(function(){ // must wait
					if(peer.pid !== opt.pid){
						// this extra logic checks for duplicate connections between 2 peers.
						if(!Gun.obj.map(axe.up, function(p){
							if(peer.pid === p.pid && peer !== p){
								return yes = true;
							}
						})){ return }
					}
					mesh.say({dam: '-'}, peer);
					delete at.dup.s[peer.last];
				}, Math.random() * 100);
			});
			mesh.hear['-'] = function(msg, peer){
				mesh.bye(peer);
				peer.url = '';
			}
		}

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
