var Gun = require('../../gun')
,	url = require('url');
module.exports = function(wss, server, opt){
	wss.on('connection', function(ws){
		var req = {};
		ws.upgradeReq = ws.upgradeReq || {};
		req.url = url.parse(ws.upgradeReq.url||'');
		req.method = (ws.upgradeReq.method||'').toLowerCase();
		req.headers = ws.upgradeReq.headers || {};
		//Gun.log("wsReq", req);
		ws.on('message', function(msg){
			msg = Gun.obj.ify(msg);
			msg.url = msg.url || {};
			msg.url.pathname = (req.url.pathname||'') + (msg.url.pathname||'');
			Gun.obj.map(req.url, function(val, i){
				msg.url[i] = msg.url[i] || val; // reattach url
			});
			msg.method = msg.method || msg.body? 'put' : 'get';
			msg.headers = msg.headers || {};
			Gun.obj.map(opt.headers || req.headers, function(val, i){
				msg.headers[i] = msg.headers[i]; // reattach headers
			});
			server.call(ws, msg, function(reply){
				if(!ws || !ws.send || !ws._socket || !ws._socket.writable){ return }
				reply = reply || {};
				if(msg && msg.headers && msg.headers['ws-rid']){
					(reply.headers = reply.headers || {})['ws-rid'] = msg.headers['ws-rid'];
				}
				try{ws.send(Gun.text.ify(reply));
				}catch(e){} // juuuust in case.
			});
		});
		ws.off = function(m){
			//Gun.log("ws.off", m);
			ws.send = null;
		}
		ws.on('close', ws.off);
		ws.on('error', ws.off);
	});
}