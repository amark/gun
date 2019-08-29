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
      {url: 'stun:stun.l.google.com:19302'},
      {url: "stun:stun.sipgate.net:3478"},
      {url: "stun:stun.stunprotocol.org"},
      {url: "stun:stun.sipgate.net:10000"},
      {url: "stun:217.10.68.152:10000"},
      {url: 'stun:stun.services.mozilla.com'} 
    ]};
    opt.rtc.dataChannel = opt.rtc.dataChannel || {ordered: false, maxRetransmits: 2};
    opt.rtc.sdp = opt.rtc.sdp || {mandatory: {OfferToReceiveAudio: false, OfferToReceiveVideo: false}};
    opt.announce = function(to){
			root.on('out', {rtc: {id: opt.pid, to:to}}); // announce ourself
    };
		var mesh = opt.mesh = opt.mesh || Gun.Mesh(root);
		root.on('create', function(at){
			this.to.next(at);
			setTimeout(opt.announce, 1);
		});
		root.on('in', function(msg){
			if(msg.rtc){ open(msg) }
			this.to.next(msg);
		});

		function open(msg){
			var rtc = msg.rtc, peer, tmp;
			if(!rtc || !rtc.id){ return }
			delete opt.announce[rtc.id]; /// remove after connect
			if(tmp = rtc.answer){
				if(!(peer = opt.peers[rtc.id] || open[rtc.id]) || peer.remoteSet){ return }
				return peer.setRemoteDescription(peer.remoteSet = new opt.RTCSessionDescription(tmp)); 
			}
			if(tmp = rtc.candidate){
				peer = opt.peers[rtc.id] || open[rtc.id] || open({rtc: {id: rtc.id}});
				return peer.addIceCandidate(new opt.RTCIceCandidate(tmp));
			}
			//if(opt.peers[rtc.id]){ return }
			if(open[rtc.id]){ return }
			(peer = new opt.RTCPeerConnection(opt.rtc)).id = rtc.id;
			var wire = peer.wire = peer.createDataChannel('dc', opt.rtc.dataChannel);
			open[rtc.id] = peer;
			wire.onclose = function(){
				delete open[rtc.id];
				mesh.bye(peer);
				//reconnect(peer);
			};
			wire.onerror = function(err){};
			wire.onopen = function(e){
				//delete open[rtc.id];
				mesh.hi(peer);
			}
			wire.onmessage = function(msg){
				if(!msg){ return }
				mesh.hear(msg.data || msg, peer);
			};
			peer.onicecandidate = function(e){ // source: EasyRTC!
        if(!e.candidate){ return }
        root.on('out', {'@': msg['#'], rtc: {candidate: e.candidate, id: opt.pid}});
			}
			peer.ondatachannel = function(e){
				var rc = e.channel;
				rc.onmessage = wire.onmessage;
				rc.onopen = wire.onopen;
				rc.onclose = wire.onclose;
			}
			if(tmp = rtc.offer){
				peer.setRemoteDescription(new opt.RTCSessionDescription(tmp)); 
				peer.createAnswer(function(answer){
					peer.setLocalDescription(answer);
					root.on('out', {'@': msg['#'], rtc: {answer: answer, id: opt.pid}});
				}, function(){}, opt.rtc.sdp);
				return;
			}
			peer.createOffer(function(offer){
				peer.setLocalDescription(offer);
				root.on('out', {'@': msg['#'], rtc: {offer: offer, id: opt.pid}});
			}, function(){}, opt.rtc.sdp);
			return peer;
		}
	});
	var noop = function(){};
}());
