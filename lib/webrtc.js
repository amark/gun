;(function(){
	var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');
	Gun.on('opt', function(root){
		this.to.next(root);
		var opt = root.opt;
		if(root.once){ return }
		if(!Gun.Mesh){ return }
		if(false === opt.RTCPeerConnection){ return }

		var env;
		if(typeof window !== "undefined"){ env = window }
		if(typeof global !== "undefined"){ env = global }
		env = env || {};

		var rtcpc = opt.RTCPeerConnection || env.RTCPeerConnection || env.webkitRTCPeerConnection || env.mozRTCPeerConnection;
		var rtcsd = opt.RTCSessionDescription || env.RTCSessionDescription || env.webkitRTCSessionDescription || env.mozRTCSessionDescription;
		var rtcic = opt.RTCIceCandidate || env.RTCIceCandidate || env.webkitRTCIceCandidate || env.mozRTCIceCandidate;
		if(!rtcpc || !rtcsd || !rtcic){ return }
		opt.RTCPeerConnection = rtcpc;
		opt.RTCSessionDescription = rtcsd;
		opt.RTCIceCandidate = rtcic;
		opt.rtc = opt.rtc || {'iceServers': [
      {urls: 'stun:stun.l.google.com:19302'},
      {urls: "stun:stun.sipgate.net:3478"}/*,
      {urls: "stun:stun.stunprotocol.org"},
      {urls: "stun:stun.sipgate.net:10000"},
      {urls: "stun:217.10.68.152:10000"},
      {urls: 'stun:stun.services.mozilla.com'}*/ 
    ]};
    // TODO: Select the most appropriate stuns. 
    // FIXME: Find the wire throwing ICE Failed
    // The above change corrects at least firefox RTC Peer handler where it **throws** on over 6 ice servers, and updates url: to urls: removing deprecation warning 
    opt.rtc.dataChannel = opt.rtc.dataChannel || {ordered: false, maxRetransmits: 2};
    opt.rtc.sdp = opt.rtc.sdp || {mandatory: {OfferToReceiveAudio: false, OfferToReceiveVideo: false}};
    opt.rtc.max = opt.rtc.max || 55; // is this a magic number? // For Future WebRTC notes: Chrome 500 max limit, however 256 likely - FF "none", webtorrent does 55 per torrent.
    opt.rtc.room = opt.rtc.room || Gun.window && (location.hash.slice(1) || location.pathname.slice(1));
		var room = () => root.$.get('/RTC/'+opt.rtc.room+'<?99');
    opt.announce = function(to){
			opt.rtc.start = +new Date; // handle room logic:
			room().get('+').put(opt.pid, function(ack){
				if(!ack.ok || !ack.ok.rtc){ return }
				room().get('+'+ack.ok.rtc.id).put(opt.pid, function(ack){
					if(!ack.ok || !ack.ok.rtc){ return }
					open(ack);
				});
			}, {acks: opt.rtc.max}).on(function (last,key, msg){
				if(last === opt.pid || opt.rtc.start > msg.put['>']){ return }
				room().get('+'+last).put(opt.pid, function(ack){
					if(!ack.ok || !ack.ok.rtc){ return }
					open({'#': ''+ack['#'], ok: {rtc: {id: last, respect: true}}});
				});
				root.on('out', {'@': msg['#'], ok: {rtc: {id: opt.pid}}});
			});
			// TODO: implement negotiation setup here
			// TODO: order greetings in this function
			room().get('+'+opt.pid).on(function(last, key, msg){
				if(opt.rtc.start > msg.put['>']){ return }
				open({'#': ''+msg['#'], ok: {rtc: {id: last}}});
			});
    };

		var mesh = opt.mesh = opt.mesh || Gun.Mesh(root);
		root.on('create', function(at){
			console.log(opt.pid);
			this.to.next(at);
			setTimeout(opt.announce, 1);
		});

		function open(msg){
			if(this && this.off){ this.off() } // Ignore this, because of ask / ack.
			if(!msg.ok){ return }
			var rtc = msg.ok.rtc, peer, tmp;
			if(!rtc || !rtc.id || rtc.id === opt.pid){ return }
			peer = opt.peers[rtc.id] || open[rtc.id];
			if(!peer){
				(peer = new opt.RTCPeerConnection(opt.rtc)).id = rtc.id;
				var wire = peer.wire = peer.createDataChannel('dc', opt.rtc.dataChannel);
				open[rtc.id] = peer;
				wire.to = setTimeout(function(){delete open[rtc.id]},1000*60);
				wire.onclose = function(){ mesh.bye(peer) };
				wire.onerror = function(err){ };
				wire.onopen = function(e){
					delete open[rtc.id];
					mesh.hi(peer);
				}
				wire.onmessage = function(msg){
					if(!msg){ return }
					mesh.hear(msg.data || msg, peer);
				};
				peer.onicecandidate = function(e){ // source: EasyRTC!
					if(!e.candidate){ return }
					// root.on('out', {'@': msg['#'], ok: {rtc: {candidate: e.candidate, id: opt.pid}}});
					root.$.get('/RTC/'+opt.rtc.room+'<?99').get('='+rtc.id).put({candidate: e.candidate, id: opt.pid}); //previous data has to be erased here, or use pub-sub
				}
				peer.ondatachannel = function(e){
					var rc = e.channel;
					rc.onmessage = wire.onmessage;
					rc.onopen = wire.onopen;
					rc.onclose = wire.onclose;
				}
			}
			if(tmp = rtc.answer){
				tmp.sdp = tmp.sdp.replace(/\\r\\n/g, '\r\n');
				return peer.setRemoteDescription(new opt.RTCSessionDescription(tmp)); 
			}
			if(tmp = rtc.candidate){ return peer.addIceCandidate(new opt.RTCIceCandidate(tmp)) }
			if(tmp = rtc.offer){
				rtc.offer.sdp = rtc.offer.sdp.replace(/\\r\\n/g, '\r\n')
				peer.setRemoteDescription(new opt.RTCSessionDescription(tmp)); 
				peer.createAnswer(function(answer){
					peer.setLocalDescription(answer);
					// root.on('out', {'@': msg['#'], ok: {rtc: {answer: answer, id: opt.pid}}});
					root.$.get('/RTC/'+opt.rtc.room+'<?99').get('='+rtc.id).put({answer: answer, id: opt.pid});
				}, function(){}, opt.rtc.sdp);
				return;
			}
			if(tmp = rtc.negotiationneeded){
				peer.createOffer(function(offer){
					peer.setLocalDescription(offer);
					// root.on('out', {'@': msg['#'], '#': root.ask(open), ok: {rtc: {offer: offer, id: opt.pid}}});
					console.log('sending offer')
					root.$.get('/RTC/'+opt.rtc.room+'<?99').get('='+rtc.id).put({offer: offer, id: opt.pid});
				}, function(){}, opt.rtc.sdp);
				return;
			}
			// room join
			peer.negotiate = msg['#'];
			if(rtc.respect){ peer.respect = true }
			console.log('sending to', msg['#']);
			// setTimeout(function() {
			// root.on('out', {'@': msg['#'], ok: {rtc: {id: opt.pid}}}); //FIXME: does not send
			// }, 1);
			setTimeout(function() {
			root.on('out', {'@': msg['#'], ok: {rtc: {id: opt.pid}}}); //FIXME: does not send
			root.on('out', {'@': msg['#'], ok: {rtc: {id: 'heh'}}}); //FIXME: does not send
			}, 10);
		}
	});
}());
