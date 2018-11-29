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
		opt.webrtc = opt.webrtc || {'iceServers': [
      {url: 'stun:stun.l.google.com:19302'},
      {url: "stun:stun.sipgate.net:3478"},
      {url: "stun:stun.stunprotocol.org"},
      {url: "stun:stun.sipgate.net:10000"},
      {url: "stun:217.10.68.152:10000"},
      {url: 'stun:stun.services.mozilla.com'} 
    ]};
    opt.webrtc.dataChannel = opt.webrtc.dataChannel || {ordered: false, maxRetransmits: 2};
    opt.webrtc.sdp = opt.webrtc.sdp || {mandatory: {OfferToReceiveAudio: false, OfferToReceiveVideo: false}};

		var mesh = opt.mesh = opt.mesh || Gun.Mesh(root);
		root.on('create', function(at){
			this.to.next(at);
			setTimeout(function(){ root.on('out', {webrtc: {id: opt.pid}}) },1); // announce ourself
		});
		root.on('in', function(msg){
			if(msg.webrtc){ open(msg) }
			this.to.next(msg);
		});

		function open(msg){
			var rtc = msg.webrtc, peer, tmp;
			if(!rtc || !rtc.id){ return }
			if(tmp = rtc.answer){
				if(!(peer = opt.peers[rtc.id]) || peer.remoteSet){ return }
				return peer.setRemoteDescription(peer.remoteSet = new opt.RTCSessionDescription(tmp)); 
			}
			if(tmp = rtc.candidate){
				peer = opt.peers[rtc.id] || open({webrtc: {id: rtc.id}});
				return peer.addIceCandidate(new opt.RTCIceCandidate(tmp));
			}
			if(opt.peers[rtc.id]){ return }
			(peer = new opt.RTCPeerConnection(opt.webrtc)).id = rtc.id;
			var wire = peer.wire = peer.createDataChannel('dc', opt.webrtc.dataChannel);
			mesh.hi(peer);
			wire.onclose = function(){
				mesh.bye(peer);
				peer.wire = null;
				//reconnect(peer);
			};
			wire.onerror = function(error){
				//reconnect(peer); // placement?
				if(!error){ return }
				if(error.code === 'ECONNREFUSED'){
					//reconnect(peer, as);
				}
			};
			wire.onopen = function(e){
				mesh.hi(peer);
			}
			wire.onmessage = function(msg){
				if(!msg){ return }
				mesh.hear(msg.data || msg, peer);
			};
			peer.onicecandidate = function(e){ // source: EasyRTC!
        if(!e.candidate){ return }
        root.on('out', {'@': msg['#'], webrtc: {candidate: e.candidate, id: opt.pid}});
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
					root.on('out', {'@': msg['#'], webrtc: {answer: answer, id: opt.pid}});
				}, function(){}, opt.webrtc.sdp);
				return;
			}
			peer.createOffer(function(offer){
				peer.setLocalDescription(offer);
				root.on('out', {'@': msg['#'], webrtc: {offer: offer, id: opt.pid}});
			}, function(){}, opt.webrtc.sdp);
			return peer;
		}
	});
	var noop = function(){};
}());