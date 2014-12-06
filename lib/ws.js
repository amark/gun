var Gun = require('gun/gun')
,	url = require('url');
module.exports = function(wss, server){
	wss.on('connection', function(ws){
		var req = {};
		ws.upgradeReq = ws.upgradeReq || {};
		req.url = url.parse(ws.upgradeReq.url||'');
		req.method = (ws.upgradeReq.method||'').toLowerCase();
		req.headers = ws.upgradeReq.headers || {};
		//console.log("wsReq", req);
		ws.on('message', function(msg){
			msg = Gun.obj.ify(msg);
			msg.url = msg.url || {};
			msg.url.pathname = (req.url.pathname||'') + (msg.url.pathname||'');
			Gun.obj.map(req.url, function(val, i){
				msg.url[i] = msg.url[i] || val; // reattach url
			});
			msg.method = msg.method || req.method;
			msg.headers = msg.headers || {};
			Gun.obj.map(req.headers, function(val, i){
				msg.headers[i] = msg.headers[i] || val; // reattach headers
			});
			server.call(ws, msg, function(reply){
				if(!ws || !ws.send){ return }
				reply = reply || {};
				reply.wsrid = msg.wsrid;
				ws.send(Gun.text.ify(reply));
			});
		});
		ws.off = function(m){
			console.log("ws.off", m);
			ws.send = null;
		}
		ws.on('close', ws.off);
		ws.on('error', ws.off);
	});
}