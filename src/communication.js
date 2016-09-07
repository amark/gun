/**
 * Created by Paul on 9/7/2016.
 */

let Communication = function (Gun, Tab) {

  function s() {
  }

  s.put = function (key, val, cb) {
    try {
      store.setItem(key, Gun.text.ify(val))
    } catch (e) {
      if (cb)cb(e)
    }
  };
  s.get = function (key, cb) { /*setTimeout(function(){*/
    try {
      cb(null, Gun.obj.ify(store.getItem(key) || null))
    } catch (e) {
      cb(e)
    }
    /*},1)*/
  };
  s.del = function (key) {
    return store.removeItem(key)
  };

  let store = (typeof localStorage === 'undefined') ? {
    setItem: function () {
    }, removeItem: function () {
    }, getItem: function () {
    }
  } : localStorage;

  Tab.store = s;

  Gun.on('opt').event(function (gun, opt) {
    opt = opt || {};
    var tab = gun.tab = gun.tab || {};
    tab.store = tab.store || Tab.store;
    tab.request = tab.request || Gun.request;
    if (!tab.request) {
      throw new Error("Default GUN driver could not find default network abstraction.")
    }
    tab.request.s = tab.request.s || {};
    tab.headers = opt.headers || {};
    tab.headers['gun-sid'] = tab.headers['gun-sid'] || Gun.text.random(); // stream id
    tab.prefix = tab.prefix || opt.prefix || 'gun/';
    tab.get = tab.get || function (lex, cb, opt) {
        if (!lex) {
          return
        }
        var soul = lex[Gun._.soul];
        if (!soul) {
          return
        }
        cb = cb || function () {
          };
        var ropt = {};
        (ropt.headers = Gun.obj.copy(tab.headers)).id = tab.msg();
        (function local(soul, cb) {
          tab.store.get(tab.prefix + soul, function (err, data) {
            if (!data) {
              return
            } // let the peers handle no data.
            if (err) {
              return cb(err)
            }
            cb(err, cb.node = data); // node
            cb(err, Gun.is.node.soul.ify({}, Gun.is.node.soul(data))); // end
            cb(err, {}); // terminate
          });
        }(soul, cb));
        if (!(cb.local = opt.local)) {
          tab.request.s[ropt.headers.id] = tab.error(cb, "Error: Get failed!", function (reply) {
            setTimeout(function () {
              tab.put(Gun.is.graph.ify(reply.body), function () {
              }, {local: true, peers: {}})
            }, 1); // and flush the in memory nodes of this graph to localStorage after we've had a chance to union on it.
          });
          Gun.obj.map(opt.peers || gun.__.opt.peers, function (peer, url) {
            var p = {};
            tab.request(url, lex, tab.request.s[ropt.headers.id], ropt);
            cb.peers = true;
          });
          var node = gun.__.graph[soul];
          if (node) {
            tab.put(Gun.is.graph.ify(node));
          }
        }
        tab.peers(cb);
      };
    tab.put = tab.put || function (graph, cb, opt) {
        cb = cb || function () {
          };
        opt = opt || {};
        var ropt = {};
        (ropt.headers = Gun.obj.copy(tab.headers)).id = tab.msg();
        Gun.is.graph(graph, function (node, soul) {
          if (!gun.__.graph[soul]) {
            return
          }
          tab.store.put(tab.prefix + soul, gun.__.graph[soul], function (err) {
            if (err) {
              cb({err: err})
            }
          });
        });
        if (!(cb.local = opt.local)) {
          tab.request.s[ropt.headers.id] = tab.error(cb, "Error: Put failed!");
          Gun.obj.map(opt.peers || gun.__.opt.peers, function (peer, url) {
            tab.request(url, graph, tab.request.s[ropt.headers.id], ropt);
            cb.peers = true;
          });
        }
        tab.peers(cb);
      };
    tab.error = function (cb, error, fn) {
      return function (err, reply) {
        reply.body = reply.body || reply.chunk || reply.end || reply.write;
        if (err || !reply || (err = reply.body && reply.body.err)) {
          return cb({err: Gun.log(err || error)});
        }
        if (fn) {
          fn(reply)
        }
        cb(null, reply.body);
      }
    };
    tab.peers = function (cb, o) {
      if (Gun.text.is(cb)) {
        return (o = {})[cb] = {}, o
      }
      if (cb && !cb.peers) {
        setTimeout(function () {
          if (!cb.local) {
            if (!Gun.log.count('no-peers')) {
              Gun.log("Warning! You have no peers to connect to!")
            }
          }
          if (!(cb.graph || cb.node)) {
            cb(null)
          }
        }, 1)
      }
    };
    tab.msg = tab.msg || function (id) {
        if (!id) {
          return tab.msg.debounce[id = Gun.text.random(9)] = Gun.time.is(), id;
        }
        clearTimeout(tab.msg.clear);
        tab.msg.clear = setTimeout(function () {
          var now = Gun.time.is();
          Gun.obj.map(tab.msg.debounce, function (t, id) {
            if (now - t < 1000 * 60 * 5) {
              return
            }
            Gun.obj.del(tab.msg.debounce, id);
          });
        }, 500);
        if (id = tab.msg.debounce[id]) {
          return tab.msg.debounce[id] = Gun.time.is(), id;
        }
      };
    tab.msg.debounce = tab.msg.debounce || {};
    tab.server = tab.server || function (req, res) {
        if (!req || !res || !req.body || !req.headers || !req.headers.id) {
          return
        }
        if (tab.request.s[req.headers.rid]) {
          return tab.request.s[req.headers.rid](null, req)
        }
        if (tab.msg(req.headers.id)) {
          return
        }
        // TODO: Re-emit message to other peers if we have any non-overlaping ones.
        if (req.headers.rid) {
          return
        } // no need to process
        if (Gun.is.lex(req.body)) {
          return tab.server.get(req, res)
        }
        else {
          return tab.server.put(req, res)
        }
      };
    tab.server.json = 'application/json';
    tab.server.regex = gun.__.opt.route = gun.__.opt.route || opt.route || /^\/gun/i;
    tab.server.get = function (req, cb) {
      var soul = req.body[Gun._.soul], node;
      if (!(node = gun.__.graph[soul])) {
        return
      }
      var reply = {headers: {'Content-Type': tab.server.json, rid: req.headers.id, id: tab.msg()}};
      cb({headers: reply.headers, body: node});
    };
    tab.server.put = function (req, cb) {
      var reply = {headers: {'Content-Type': tab.server.json, rid: req.headers.id, id: tab.msg()}}, keep;
      if (!req.body) {
        return cb({headers: reply.headers, body: {err: "No body"}})
      }
      if (!Gun.obj.is(req.body, function (node, soul) {
          if (gun.__.graph[soul]) {
            return true
          }
        })) {
        return
      }
      if (req.err = Gun.union(gun, req.body, function (err, ctx) {
          if (err) {
            return cb({headers: reply.headers, body: {err: err || "Union failed."}})
          }
          var ctx = ctx || {};
          ctx.graph = {};
          Gun.is.graph(req.body, function (node, soul) {
            ctx.graph[soul] = gun.__.graph[soul]
          });
          gun.__.opt.wire.put(ctx.graph, function (err, ok) {
            if (err) {
              return cb({headers: reply.headers, body: {err: err || "Failed."}})
            }
            cb({headers: reply.headers, body: {ok: ok || "Persisted."}});
          }, {local: true, peers: {}});
        }).err) {
        cb({headers: reply.headers, body: {err: req.err || "Union failed."}})
      }
    };
    Gun.obj.map(gun.__.opt.peers, function () { // only create server if peers and do it once by returning immediately.
      return (tab.server.able = tab.server.able || tab.request.createServer(tab.server) || true);
    });
    gun.__.opt.wire.get = gun.__.opt.wire.get || tab.get;
    gun.__.opt.wire.put = gun.__.opt.wire.put || tab.put;
    gun.__.opt.wire.key = gun.__.opt.wire.key || tab.key;

    Tab.request = tab.request;
    Gun.Tab = Tab;
  });
};

export default Communication;
