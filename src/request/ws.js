/**
 * Created by Paul on 9/7/2016.
 */

let ws = function (opt, cb) {
  var ws, WS = r.WebSocket || window.WebSocket || window.mozWebSocket || window.webkitWebSocket;
  if (!WS) {
    return
  }
  if (ws = r.ws.peers[opt.base]) {
    if (!ws.readyState) {
      return setTimeout(function () {
        r.ws(opt, cb)
      }, 10), true
    }
    var req = {};
    if (opt.headers) {
      req.headers = opt.headers
    }
    if (opt.body) {
      req.body = opt.body
    }
    if (opt.url) {
      req.url = opt.url
    }
    req.headers = req.headers || {};
    r.ws.cbs[req.headers['ws-rid'] = 'WS' + (+new Date()) + '.' + Math.floor((Math.random() * 65535) + 1)] = function (err, res) {
      if (res.body || res.end) {
        delete r.ws.cbs[req.headers['ws-rid']]
      }
      cb(err, res);
    };
    ws.send(JSON.stringify(req));
    return true;
  }
  if (ws === false) {
    return
  }
  try {
    ws = r.ws.peers[opt.base] = new WS(opt.base.replace('http', 'ws'));
  } catch (e) {
  }
  ws.onopen = function (o) {
    r.back = 2;
    r.ws(opt, cb)
  };
  ws.onclose = function (c) {
    if (!c) {
      return
    }
    if (ws && ws.close instanceof Function) {
      ws.close()
    }
    if (1006 === c.code) { // websockets cannot be used
      /*ws = r.ws.peers[opt.base] = false; // 1006 has mixed meanings, therefore we can no longer respect it.
       r.transport(opt, cb);
       return;*/
    }
    ws = r.ws.peers[opt.base] = null; // this will make the next request try to reconnect
    setTimeout(function () {
      r.ws(opt, function () {
      }); // opt here is a race condition, is it not? Does this matter?
    }, r.back *= r.backoff);
  };
  if (typeof window !== "undefined") {
    window.onbeforeunload = ws.onclose;
  }
  ws.onmessage = function (m) {
    if (!m || !m.data) {
      return
    }
    var res;
    try {
      res = JSON.parse(m.data);
    } catch (e) {
      return
    }
    if (!res) {
      return
    }
    res.headers = res.headers || {};
    if (res.headers['ws-rid']) {
      return (r.ws.cbs[res.headers['ws-rid']] || function () {
      })(null, res)
    }
    if (res.body) {
      r.createServer.ing(res, function (res) {
        r(opt.base, null, null, res)
      })
    } // emit extra events.
  };
  ws.onerror = function (e) {
    console.log(e);
  };
  return true;
};
ws.peers = {};
ws.cbs = {};

export default ws;
