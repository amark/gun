/**
 * Created by Paul on 9/7/2016.
 */

let Request = () => {
  function r(base, body, cb, opt) {
    opt = opt || {};
    var o = base.length ? {base: base} : {};
    o.base = opt.base || base;
    o.body = opt.body || body;
    o.headers = opt.headers;
    o.url = opt.url;
    cb = cb || function () {
      };
    if (!o.base) {
      return
    }
    r.transport(o, cb);
  }

  r.createServer = function (fn) {
    r.createServer.s.push(fn)
  };
  r.createServer.ing = function (req, cb) {
    var i = r.createServer.s.length;
    while (i--) {
      (r.createServer.s[i] || function () {
      })(req, cb)
    }
  };
  r.createServer.s = [];
  r.back = 2;
  r.backoff = 2;
  r.transport = function (opt, cb) {
    //Gun.log("TRANSPORT:", opt);
    if (r.ws(opt, cb)) {
      return
    }
    r.jsonp(opt, cb);
  };
  r.ws = function (opt, cb) {
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
  r.ws.peers = {};
  r.ws.cbs = {};
  r.jsonp = function (opt, cb) {
    if (typeof window === "undefined") {
      return cb("JSONP is currently browser only.");
    }
    //Gun.log("jsonp send", opt);
    r.jsonp.ify(opt, function (url) {
      //Gun.log(url);
      if (!url) {
        return
      }
      r.jsonp.send(url, function (reply) {
        //Gun.log("jsonp reply", reply);
        cb(null, reply);
        r.jsonp.poll(opt, reply);
      }, opt.jsonp);
    });
  };
  r.jsonp.send = function (url, cb, id) {
    var js = document.createElement('script');
    js.src = url;
    window[js.id = id] = function (res) {
      cb(res);
      cb.id = js.id;
      js.parentNode.removeChild(js);
      window[cb.id] = null; // TODO: BUG: This needs to handle chunking!
      try {
        delete window[cb.id];
      } catch (e) {
      }
    };
    js.async = true;
    document.getElementsByTagName('head')[0].appendChild(js);
    return js;
  };
  r.jsonp.poll = function (opt, res) {
    if (!opt || !opt.base || !res || !res.headers || !res.headers.poll) {
      return
    }
    (r.jsonp.poll.s = r.jsonp.poll.s || {})[opt.base] = r.jsonp.poll.s[opt.base] || setTimeout(function () { // TODO: Need to optimize for Chrome's 6 req limit?
        //Gun.log("polling again");
        var o = {base: opt.base, headers: {pull: 1}};
        r.each(opt.headers, function (v, i) {
          o.headers[i] = v
        })
        r.jsonp(o, function (err, reply) {
          delete r.jsonp.poll.s[opt.base];
          while (reply.body && reply.body.length && reply.body.shift) { // we're assuming an array rather than chunk encoding. :(
            var res = reply.body.shift();
            //Gun.log("-- go go go", res);
            if (res && res.body) {
              r.createServer.ing(res, function () {
                r(opt.base, null, null, res)
              })
            } // emit extra events.
          }
        });
      }, res.headers.poll);
  };
  r.jsonp.ify = function (opt, cb) {
    var uri = encodeURIComponent, q = '?';
    if (opt.url && opt.url.pathname) {
      q = opt.url.pathname + q;
    }
    q = opt.base + q;
    r.each((opt.url || {}).query, function (v, i) {
      q += uri(i) + '=' + uri(v) + '&'
    });
    if (opt.headers) {
      q += uri('`') + '=' + uri(JSON.stringify(opt.headers)) + '&'
    }
    if (r.jsonp.max < q.length) {
      return cb()
    }
    q += uri('jsonp') + '=' + uri(opt.jsonp = 'P' + Math.floor((Math.random() * 65535) + 1));
    if (opt.body) {
      q += '&';
      var w = opt.body, wls = function (w, l, s) {
        return uri('%') + '=' + uri(w + '-' + (l || w) + '/' + (s || w)) + '&' + uri('$') + '=';
      };
      if (typeof w != 'string') {
        w = JSON.stringify(w);
        q += uri('^') + '=' + uri('json') + '&';
      }
      w = uri(w);
      var i = 0, l = w.length
        , s = r.jsonp.max - (q.length + wls(l.toString()).length);
      if (s < 0) {
        return cb()
      }
      while (w) {
        cb(q + wls(i, (i = i + s), l) + w.slice(0, i));
        w = w.slice(i);
      }
    } else {
      cb(q);
    }
  };
  r.jsonp.max = 2000;
  r.each = function (obj, cb) {
    if (!obj || !cb) {
      return
    }
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        cb(obj[i], i);
      }
    }
  };
  return r;
};

export default Request;
