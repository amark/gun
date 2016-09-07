/**
 * Created by Paul on 9/7/2016.
 */

let Chaining = (Gun) => {
  Gun.chain = Gun.prototype;

  Gun.chain.opt = function (opt, stun) {
    opt = opt || {};
    var gun = this, root = (gun.__ && gun.__.gun) ? gun.__.gun : (gun._ = gun.__ = {gun: gun}).gun.chain(); // if root does not exist, then create a root chain.
    root.__.by = root.__.by || function (f) {
        return gun.__.by[f] = gun.__.by[f] || {}
      };
    root.__.graph = root.__.graph || {};
    root.__.opt = root.__.opt || {peers: {}};
    root.__.opt.wire = root.__.opt.wire || {};
    if (Gun.text.is(opt)) {
      opt = {peers: opt}
    }
    if (Gun.list.is(opt)) {
      opt = {peers: opt}
    }
    if (Gun.text.is(opt.peers)) {
      opt.peers = [opt.peers]
    }
    if (Gun.list.is(opt.peers)) {
      opt.peers = Gun.obj.map(opt.peers, function (n, f, m) {
        m(n, {})
      })
    }
    Gun.obj.map(opt.peers, function (v, f) {
      root.__.opt.peers[f] = v;
    });
    Gun.obj.map(opt.wire, function (h, f) {
      if (!Gun.fns.is(h)) {
        return
      }
      root.__.opt.wire[f] = h;
    });
    Gun.obj.map(['key', 'on', 'path', 'map', 'not', 'init'], function (f) {
      if (!opt[f]) {
        return
      }
      root.__.opt[f] = opt[f] || root.__.opt[f];
    });
    if (!stun) {
      Gun.on('opt').emit(root, opt)
    }
    return gun;
  }

  Gun.chain.chain = function (s) {
    var from = this, gun = !from.back ? from : new this.constructor(from);//Gun(from);
    gun._ = gun._ || {};
    gun._.back = gun.back || from;
    gun.back = gun.back || from;
    gun.__ = gun.__ || from.__;
    gun._.on = gun._.on || Gun.on.create();
    gun._.at = gun._.at || Gun.on.at(gun._.on);
    return gun;
  }

  Gun.chain.put = function (val, cb, opt) {
    opt = opt || {};
    cb = cb || function () {
      };
    cb.hash = {};
    var gun = this, chain = gun.chain(), tmp = {val: val}, drift = Gun.time.now();

    function put(at) {
      var val = tmp.val;
      var ctx = {obj: val}; // prep the value for serialization
      ctx.soul = at.field ? at.soul : (at.at && at.at.soul) || at.soul; // figure out where we are
      ctx.field = at.field ? at.field : (at.at && at.at.field) || at.field; // did we come from some where?
      if (Gun.is(val)) {
        if (!ctx.field) {
          return cb.call(chain, {err: ctx.err = Gun.log('No field to link node to!')}), chain._.at('err').emit(ctx.err)
        }
        return val.val(function (node) {
          var soul = Gun.is.node.soul(node);
          if (!soul) {
            return cb.call(chain, {err: ctx.err = Gun.log('Only a node can be linked! Not "' + node + '"!')}), chain._.at('err').emit(ctx.err)
          }
          tmp.val = Gun.is.rel.ify(soul);
          put(at);
        });
      }
      if (cb.hash[at.hash = at.hash || Gun.on.at.hash(at)]) {
        return
      } // if we have already seen this hash...
      cb.hash[at.hash] = true; // else mark that we're processing the data (failure to write could still occur).
      ctx.by = chain.__.by(ctx.soul);
      ctx.not = at.not || (at.at && at.at.not);
      Gun.obj.del(at, 'not');
      Gun.obj.del(at.at || at, 'not'); // the data is no longer not known! // TODO: BUG! It could have been asynchronous by the time we now delete these properties. Don't other parts of the code assume their deletion is synchronous?
      if (ctx.field) {
        Gun.obj.as(ctx.obj = {}, ctx.field, val)
      } // if there is a field, then data is actually getting put on the parent.
      else if (!Gun.obj.is(val)) {
        return cb.call(chain, ctx.err = {err: Gun.log("No node exists to put " + (typeof val) + ' "' + val + '" in!')}), chain._.at('err').emit(ctx.err)
      } // if the data is a primitive and there is no context for it yet, then we have an error.
      // TODO: BUG? gun.get(key).path(field).put() isn't doing it as pseudo.
      function soul(env, cb, map) {
        var eat;
        if (!env || !(eat = env.at) || !env.at.node) {
          return
        }
        if (!eat.node._) {
          eat.node._ = {}
        }
        if (!eat.node._[Gun._.state]) {
          eat.node._[Gun._.state] = {}
        }
        if (!Gun.is.node.soul(eat.node)) {
          if (ctx.obj === eat.obj) {
            Gun.obj.as(env.graph, eat.soul = Gun.obj.as(eat.node._, Gun._.soul, Gun.is.node.soul(eat.obj) || ctx.soul), eat.node);
            cb(eat, eat.soul);
          } else {
            var path = function (err, node) {
              if (path.opt && path.opt.on && path.opt.on.off) {
                path.opt.on.off()
              }
              if (path.opt.done) {
                return
              }
              path.opt.done = true;
              if (err) {
                env.err = err
              }
              eat.soul = Gun.is.node.soul(node) || Gun.is.node.soul(eat.obj) || Gun.is.node.soul(eat.node) || Gun.text.random();
              Gun.obj.as(env.graph, Gun.obj.as(eat.node._, Gun._.soul, eat.soul), eat.node);
              cb(eat, eat.soul);
            };
            path.opt = {put: true};
            (ctx.not) ? path() : ((at.field || at.at) ? gun._.back : gun).path(eat.path || [], path, path.opt);
          }
        }
        if (!eat.field) {
          return
        }
        eat.node._[Gun._.state][eat.field] = drift;
      }

      function end(err, ify) {
        ctx.ify = ify;
        Gun.on('put').emit(chain, at, ctx, opt, cb, val);
        if (err || ify.err) {
          return cb.call(chain, err || ify.err), chain._.at('err').emit(err || ify.err)
        } // check for serialization error, emit if so.
        if (err = Gun.union(chain, ify.graph, {
            end: false, soul: function (soul) {
              if (chain.__.by(soul).end) {
                return
              }
              Gun.union(chain, Gun.is.node.soul.ify({}, soul)); // fire off an end node if there hasn't already been one, to comply with the wire spec.
            }
          }).err) {
          return cb.call(chain, err), chain._.at('err').emit(err)
        } // now actually union the serialized data, emit error if any occur.
        if (Gun.fns.is(end.wire = chain.__.opt.wire.put)) {
          var wcb = function (err, ok, info) {
            if (err) {
              return Gun.log(err.err || err), cb.call(chain, err), chain._.at('err').emit(err)
            }
            return cb.call(chain, err, ok);
          }
          end.wire(ify.graph, wcb, opt);
        } else {
          if (!Gun.log.count('no-wire-put')) {
            Gun.log("Warning! You have no persistence layer to save to!")
          }
          cb.call(chain, null); // This is in memory success, hardly "success" at all.
        }
        if (ctx.field) {
          return gun._.back.path(ctx.field, null, {chain: opt.chain || chain});
        }
        if (ctx.not) {
          return gun.__.gun.get(ctx.soul, null, {chain: opt.chain || chain});
        }
        chain.get(ctx.soul, null, {chain: opt.chain || chain, at: gun._.at})
      }

      Gun.ify(ctx.obj, soul, {pure: true})(end); // serialize the data!
    }

    if (gun === gun.back) { // if we are the root chain...
      put({soul: Gun.is.node.soul(val) || Gun.text.random(), not: true}); // then cause the new chain to save data!
    } else { // else if we are on an existing chain then...
      gun._.at('soul').map(put); // put data on every soul that flows through this chain.
      var back = function (gun) {
        if (back.get || gun._.back === gun || gun._.not) {
          return
        } // TODO: CLEAN UP! Would be ideal to accomplish this in a more ideal way.
        if (gun._.get) {
          back.get = true
        }
        gun._.at('null').event(function (at) {
          this.off();
          if (opt.init || gun.__.opt.init) {
            return Gun.log("Warning! You have no context to `.put`", val, "!")
          }
          gun.init();
        }, -999);
        return back(gun._.back);
      };
      if (!opt.init && !gun.__.opt.init) {
        back(gun)
      }
    }
    chain.back = gun.back;
    return chain;
  }

  Gun.chain.get = (function () {
    Gun.on('operating').event(function (gun, at) {
      if (!gun.__.by(at.soul).node) {
        gun.__.by(at.soul).node = gun.__.graph[at.soul]
      }
      if (at.field) {
        return
      } // TODO: It would be ideal to reuse HAM's field emit.
      gun.__.on(at.soul).emit(at);
    });
    Gun.on('get').event(function (gun, at, ctx, opt, cb) {
      if (ctx.halt) {
        return
      } // TODO: CLEAN UP with event emitter option?
      at.change = at.change || gun.__.by(at.soul).node;
      if (opt.raw) {
        return cb.call(opt.on, at)
      }
      if (!ctx.cb.no) {
        cb.call(ctx.by.chain, null, Gun.obj.copy(ctx.node || gun.__.by(at.soul).node))
      }
      gun._.at('soul').emit(at).chain(opt.chain);
    }, 0);
    Gun.on('get').event(function (gun, at, ctx) {
      if (ctx.halt) {
        ctx.halt = false;
        return
      } // TODO: CLEAN UP with event emitter option?
    }, Infinity);
    return function (lex, cb, opt) { // get opens up a reference to a node and loads it.
      var gun = this, ctx = {
        opt: opt || {},
        cb: cb || function () {
        },
        lex: (Gun.text.is(lex) || Gun.num.is(lex)) ? Gun.is.rel.ify(lex) : lex,
      };
      ctx.force = ctx.opt.force;
      if (cb !== ctx.cb) {
        ctx.cb.no = true
      }
      if (!Gun.obj.is(ctx.lex)) {
        return ctx.cb.call(gun = gun.chain(), {err: Gun.log('Invalid get request!', lex)}), gun
      }
      if (!(ctx.soul = ctx.lex[Gun._.soul])) {
        return ctx.cb.call(gun = this.chain(), {err: Gun.log('No soul to get!')}), gun
      } // TODO: With `.all` it'll be okay to not have an exact match!
      ctx.by = gun.__.by(ctx.soul);
      ctx.by.chain = ctx.by.chain || gun.chain();
      function load(lex) {
        var soul = lex[Gun._.soul];
        var cached = gun.__.by(soul).node || gun.__.graph[soul];
        if (ctx.force) {
          ctx.force = false
        }
        else if (cached) {
          return false
        }
        wire(lex, stream, ctx.opt);
        return true;
      }

      function stream(err, data, info) {
        //console.log("wire.get <--", err, data);
        Gun.on('wire.get').emit(ctx.by.chain, ctx, err, data, info);
        if (err) {
          Gun.log(err.err || err);
          ctx.cb.call(ctx.by.chain, err);
          return ctx.by.chain._.at('err').emit({soul: ctx.soul, err: err.err || err}).chain(ctx.opt.chain);
        }
        if (!data) {
          ctx.cb.call(ctx.by.chain, null);
          return ctx.by.chain._.at('null').emit({soul: ctx.soul, not: true}).chain(ctx.opt.chain);
        }
        if (Gun.obj.empty(data)) {
          return
        }
        if (err = Gun.union(ctx.by.chain, data).err) {
          ctx.cb.call(ctx.by.chain, err);
          return ctx.by.chain._.at('err').emit({
            soul: Gun.is.node.soul(data) || ctx.soul,
            err: err.err || err
          }).chain(ctx.opt.chain);
        }
      }

      function wire(lex, cb, opt) {
        Gun.on('get.wire').emit(ctx.by.chain, ctx, lex, cb, opt);
        if (Gun.fns.is(gun.__.opt.wire.get)) {
          return gun.__.opt.wire.get(lex, cb, opt)
        }
        if (!Gun.log.count('no-wire-get')) {
          Gun.log("Warning! You have no persistence layer to get from!")
        }
        cb(null); // This is in memory success, hardly "success" at all.
      }

      function on(at) {
        if (on.ran = true) {
          ctx.opt.on = this
        }
        if (load(ctx.lex)) {
          return
        }
        Gun.on('get').emit(ctx.by.chain, at, ctx, ctx.opt, ctx.cb, ctx.lex);
      }

      ctx.opt.on = (ctx.opt.at || gun.__.at)(ctx.soul).event(on);
      ctx.by.chain._.get = ctx.lex;
      if (!ctx.opt.ran && !on.ran) {
        on.call(ctx.opt.on, {soul: ctx.soul})
      }
      return ctx.by.chain;
    }
  }());

  Gun.chain.key = (function () {
    Gun.on('put').event(function (gun, at, ctx, opt, cb) {
      if (opt.key) {
        return
      }
      Gun.is.graph(ctx.ify.graph, function (node, soul) {
        var key = {node: gun.__.graph[soul]};
        if (!Gun.is.node.soul(key.node, 'key')) {
          return
        }
        if (!gun.__.by(soul).end) {
          gun.__.by(soul).end = 1
        }
        Gun.is.node(key.node, function each(rel, s) {
          var n = gun.__.graph[s];
          if (n && Gun.is.node.soul(n, 'key')) {
            Gun.is.node(n, each);
            return;
          }
          rel = ctx.ify.graph[s] = ctx.ify.graph[s] || Gun.is.node.soul.ify({}, s);
          Gun.is.node(node, function (v, f) {
            Gun.is.node.state.ify([rel, node], f, v)
          });
          Gun.obj.del(ctx.ify.graph, soul);
        })
      });
    });
    Gun.on('get').event(function (gun, at, ctx, opt, cb) {
      if (ctx.halt) {
        return
      } // TODO: CLEAN UP with event emitter option?
      if (opt.key && opt.key.soul) {
        at.soul = opt.key.soul;
        gun.__.by(opt.key.soul).node = Gun.union.ify(gun, opt.key.soul); // TODO: Check performance?
        gun.__.by(opt.key.soul).node._['key'] = 'pseudo';
        at.change = Gun.is.node.soul.ify(Gun.obj.copy(at.change || gun.__.by(at.soul).node), at.soul, true); // TODO: Check performance?
        return;
      }
      if (!(Gun.is.node.soul(gun.__.graph[at.soul], 'key') === 1)) {
        return
      }
      var node = at.change || gun.__.graph[at.soul];

      function map(rel, soul) {
        gun.__.gun.get(rel, cb, {key: ctx, chain: opt.chain || gun, force: opt.force})
      }

      ctx.halt = true;
      Gun.is.node(node, map);
    }, -999);
    return function (key, cb, opt) {
      var gun = this;
      opt = Gun.text.is(opt) ? {soul: opt} : opt || {};
      cb = cb || function () {
        };
      cb.hash = {};
      if (!Gun.text.is(key) || !key) {
        return cb.call(gun, {err: Gun.log('No key!')}), gun
      }
      function index(at) {
        var ctx = {node: gun.__.graph[at.soul]};
        if (at.soul === key || at.key === key) {
          return
        }
        if (cb.hash[at.hash = at.hash || Gun.on.at.hash(at)]) {
          return
        }
        cb.hash[at.hash] = true;
        ctx.obj = (1 === Gun.is.node.soul(ctx.node, 'key')) ? Gun.obj.copy(ctx.node) : Gun.obj.put({}, at.soul, Gun.is.rel.ify(at.soul));
        Gun.obj.as((ctx.put = Gun.is.node.ify(ctx.obj, key, true))._, 'key', 1);
        gun.__.gun.put(ctx.put, function (err, ok) {
          cb.call(this, err, ok)
        }, {chain: opt.chain, key: true, init: true});
      }

      if (opt.soul) {
        index({soul: opt.soul});
        return gun;
      }
      if (gun === gun.back) {
        cb.call(gun, {err: Gun.log('You have no context to `.key`', key, '!')});
      } else {
        gun._.at('soul').map(index);
      }
      return gun;
    }
  }());

  Gun.chain.on = function (cb, opt) { // on subscribes to any changes on the souls.
    var gun = this, u;
    opt = Gun.obj.is(opt) ? opt : {change: opt};
    cb = cb || function () {
      };
    function map(at) {
      opt.on = opt.on || this;
      var ctx = {by: gun.__.by(at.soul)}, change = ctx.by.node;
      if (opt.on.stat && opt.on.stat.first) {
        (at = Gun.on.at.copy(at)).change = ctx.by.node
      }
      if (opt.raw) {
        return cb.call(opt.on, at)
      }
      if (opt.once) {
        this.off()
      }
      if (opt.change) {
        change = at.change
      }
      if (!opt.empty && Gun.obj.empty(change, Gun._.meta)) {
        return
      }
      cb.call(ctx.by.chain || gun, Gun.obj.copy(at.field ? change[at.field] : change), at.field || (at.at && at.at.field));
    };
    opt.on = gun._.at('soul').map(map);
    if (gun === gun.back) {
      Gun.log('You have no context to `.on`!')
    }
    return gun;
  }

  Gun.chain.path = (function () {
    Gun.on('get').event(function (gun, at, ctx, opt, cb, lex) {
      if (ctx.halt) {
        return
      } // TODO: CLEAN UP with event emitter option?
      if (opt.path) {
        at.at = opt.path
      }
      var xtc = {soul: lex[Gun._.soul], field: lex[Gun._.field]};
      xtc.change = at.change || gun.__.by(at.soul).node;
      if (xtc.field) { // TODO: future feature!
        if (!Gun.obj.has(xtc.change, xtc.field)) {
          return
        }
        ctx.node = Gun.is.node.soul.ify({}, at.soul); // TODO: CLEAN UP! ctx.node usage.
        Gun.is.node.state.ify([ctx.node, xtc.change], xtc.field, xtc.change[xtc.field]);
        at.change = ctx.node;
        at.field = xtc.field;
      }
    }, -99);
    Gun.on('get').event(function (gun, at, ctx, opt, cb, lex) {
      if (ctx.halt) {
        return
      } // TODO: CLEAN UP with event emitter option?
      var xtc = {};
      xtc.change = at.change || gun.__.by(at.soul).node;
      if (!opt.put) { // TODO: CLEAN UP be nice if path didn't have to worry about this.
        Gun.is.node(xtc.change, function (v, f) {
          var fat = Gun.on.at.copy(at);
          fat.field = f;
          fat.value = v;
          Gun.obj.del(fat, 'at'); // TODO: CLEAN THIS UP! It would be nice in every other function every where else it didn't matter whether there was a cascading at.at.at.at or not, just and only whether the current context as a field or should rely on a previous field. But maybe that is the gotcha right there?
          fat.change = fat.change || xtc.change;
          if (v = Gun.is.rel(fat.value)) {
            fat = {soul: v, at: fat}
          }
          gun._.at('path:' + f).emit(fat).chain(opt.chain);
        });
      }
      if (!ctx.end) {
        ctx.end = gun._.at('end').emit(at).chain(opt.chain);
      }
    }, 99);
    return function (path, cb, opt) {
      opt = opt || {};
      cb = cb || (function () {
          var cb = function () {
          };
          cb.no = true;
          return cb
        }());
      cb.hash = {};
      var gun = this, chain = gun.chain(), f, c, u;
      if (!Gun.list.is(path)) {
        if (!Gun.text.is(path)) {
          if (!Gun.num.is(path)) { // if not a list, text, or number
            return cb.call(chain, {err: Gun.log("Invalid path '" + path + "'!")}), chain; // then complain
          } else {
            return this.path(path + '', cb, opt)
          }
        } else {
          return this.path(path.split('.'), cb, opt)
        }
      } // else coerce upward to a list.
      if (gun === gun.back) {
        cb.call(chain, opt.put ? null : {err: Gun.log('You have no context to `.path`', path, '!')}, opt.put ? gun.__.graph[(path || [])[0]] : u);
        return chain;
      }
      gun._.at('path:' + path[0]).event(function (at) {
        if (opt.done) {
          this.off();
          return
        } // TODO: BUG - THIS IS A FIX FOR A BUG! TEST #"context no double emit", COMMENT THIS LINE OUT AND SEE IT FAIL!
        var ctx = {soul: at.soul, field: at.field, by: gun.__.by(at.soul)}, field = path[0];
        var on = Gun.obj.as(cb.hash, at.hash, {
          off: function () {
          }
        });
        if (at.soul === on.soul) {
          return
        }
        else {
          on.off()
        }
        if (ctx.rel = (Gun.is.rel(at.value) || Gun.is.rel(at.at && at.at.value))) {
          if (opt.put && 1 === path.length) {
            return cb.call(ctx.by.chain || chain, null, Gun.is.node.soul.ify({}, ctx.rel));
          }
          var get = function (err, node) {
            if (!err && 1 !== path.length) {
              return
            }
            cb.call(this, err, node, field);
          };
          ctx.opt = {
            chain: opt.chain || chain,
            put: opt.put,
            path: {soul: (at.at && at.at.soul) || at.soul, field: field}
          };
          gun.__.gun.get(ctx.rel || at.soul, cb.no ? null : get, ctx.opt);
          (opt.on = cb.hash[at.hash] = on = ctx.opt.on).soul = at.soul; // TODO: BUG! CB getting reused as the hash point for multiple paths potentially! Could cause problems!
          return;
        }
        if (1 === path.length) {
          cb.call(ctx.by.chain || chain, null, at.value, ctx.field)
        }
        chain._.at('soul').emit(at).chain(opt.chain);
      });
      gun._.at('null').only(function (at) {
        if (!at.field) {
          return
        }
        if (at.not) {
          gun.put({}, null, {init: true});
          if (opt.init || gun.__.opt.init) {
            return
          }
        }
        (at = Gun.on.at.copy(at)).field = path[0];
        at.not = true;
        chain._.at('null').emit(at).chain(opt.chain);
      });
      gun._.at('end').event(function (at) {
        this.off();
        if (at.at && at.at.field === path[0]) {
          return
        } // TODO: BUG! THIS FIXES SO MANY PROBLEMS BUT DOES IT CATCH VARYING SOULS EDGE CASE?
        var ctx = {by: gun.__.by(at.soul)};
        if (Gun.obj.has(ctx.by.node, path[0])) {
          return
        }
        (at = Gun.on.at.copy(at)).field = path[0];
        at.not = true;
        cb.call(ctx.by.chain || chain, null);
        chain._.at('null').emit(at).chain(opt.chain);
      });
      if (path.length > 1) {
        (c = chain.path(path.slice(1), cb, opt)).back = gun;
      }
      return c || chain;
    }
  }());

  Gun.chain.map = function (cb, opt) {
    var u, gun = this, chain = gun.chain();
    cb = cb || function () {
      };
    cb.hash = {};
    opt = Gun.bi.is(opt) ? {change: opt} : opt || {};
    opt.change = Gun.bi.is(opt.change) ? opt.change : true;
    function path(err, val, field) {
      if (err || (val === u)) {
        return
      }
      cb.call(this, val, field);
    }

    function each(val, field) {
      //if(!Gun.is.rel(val)){ path.call(this.gun, null, val, field);return;}
      if (opt.node) {
        if (!Gun.is.rel(val)) {
          return;
        }
      }
      cb.hash[this.soul + field] = cb.hash[this.soul + field] || this.gun.path(field, path, {chain: chain, via: 'map'}); // TODO: path should reuse itself! We shouldn't have to do it ourselves.
      // TODO:
      // 1. Ability to turn off an event. // automatically happens within path since reusing is manual?
      // 2. Ability to pass chain context to fire on. // DONE
      // 3. Pseudoness handled for us. // DONE
      // 4. Reuse. // MANUALLY DONE
    }

    function map(at) {
      var ref = gun.__.by(at.soul).chain || gun;
      Gun.is.node(at.change, each, {gun: ref, soul: at.soul});
    }

    gun.on(map, {raw: true, change: true}); // TODO: ALLOW USER TO DO map change false!
    if (gun === gun.back) {
      Gun.log('You have no context to `.map`!')
    }
    return chain;
  }

  Gun.chain.val = (function () {
    Gun.on('get.wire').event(function (gun, ctx) {
      if (!ctx.soul) {
        return
      }
      var end;
      (end = gun.__.by(ctx.soul)).end = (end.end || -1); // TODO: CLEAN UP! This should be per peer!
    }, -999);
    Gun.on('wire.get').event(function (gun, ctx, err, data) {
      if (err || !ctx.soul) {
        return
      }
      if (data && !Gun.obj.empty(data, Gun._.meta)) {
        return
      }
      var end = gun.__.by(ctx.soul);
      end.end = (!end.end || end.end < 0) ? 1 : end.end + 1;
    }, -999);
    return function (cb, opt) {
      var gun = this, args = Gun.list.slit.call(arguments);
      cb = Gun.fns.is(cb) ? cb : function (val, field) {
        root.console.log.apply(root.console, args.concat([field && (field += ':'), val]))
      };
      cb.hash = {};
      opt = opt || {};
      function val(at) {
        var ctx = {
          by: gun.__.by(at.soul),
          at: at.at || at
        }, node = ctx.by.node, field = ctx.at.field, hash = Gun.on.at.hash({
          soul: ctx.at.key || ctx.at.soul,
          field: field
        });
        if (cb.hash[hash]) {
          return
        }
        if (at.field && Gun.obj.has(node, at.field)) {
          return cb.hash[hash] = true, cb.call(ctx.by.chain || gun, Gun.obj.copy(node[at.field]), at.field);
        }
        if (!opt.empty && Gun.obj.empty(node, Gun._.meta)) {
          return
        } // TODO: CLEAN UP! .on already does this without the .raw!
        if (ctx.by.end < 0) {
          return
        }
        return cb.hash[hash] = true, cb.call(ctx.by.chain || gun, Gun.obj.copy(node), field);
      }

      gun.on(val, {raw: true});
      if (gun === gun.back) {
        Gun.log('You have no context to `.val`!')
      }
      return gun;
    }
  }());

  Gun.chain.not = function (cb, opt) {
    var gun = this, chain = gun.chain();
    cb = cb || function () {
      };
    opt = opt || {};
    function not(at, e) {
      if (at.field) {
        if (Gun.obj.has(gun.__.by(at.soul).node, at.field)) {
          return Gun.obj.del(at, 'not'), chain._.at(e).emit(at)
        }
      } else if (at.soul && gun.__.by(at.soul).node) {
        return Gun.obj.del(at, 'not'), chain._.at(e).emit(at)
      }
      if (!at.not) {
        return
      }
      var kick = function (next) {
        if (++kick.c) {
          return Gun.log("Warning! Multiple `not` resumes!");
        }
        next._.at.all(function (on, e) { // TODO: BUG? Switch back to .at? I think .on is actually correct so it doesn't memorize. // TODO: BUG! What about other events?
          chain._.at(e).emit(on);
        });
      };
      kick.c = -1
      kick.chain = gun.chain();
      kick.next = cb.call(kick.chain, opt.raw ? at : (at.field || at.soul || at.not), kick);
      kick.soul = Gun.text.random();
      if (Gun.is(kick.next)) {
        kick(kick.next)
      }
      kick.chain._.at('soul').emit({soul: kick.soul, field: at.field, not: true, via: 'not'});
    }

    gun._.at.all(not);
    if (gun === gun.back) {
      Gun.log('You have no context to `.not`!')
    }
    chain._.not = true; // TODO: CLEAN UP! Would be ideal if we could accomplish this in a more elegant way.
    return chain;
  }

  Gun.chain.set = function (item, cb, opt) {
    var gun = this, ctx = {}, chain;
    cb = cb || function () {
      };
    if (!Gun.is(item)) {
      return cb.call(gun, {err: Gun.log('Set only supports node references currently!')}), gun
    } // TODO: Bug? Should we return not gun on error?
    (ctx.chain = item.chain()).back = gun;
    ctx.chain._ = item._;
    item.val(function (node) { // TODO: BUG! Return proxy chain with back = list.
      if (ctx.done) {
        return
      }
      ctx.done = true;
      var put = {}, soul = Gun.is.node.soul(node);
      if (!soul) {
        return cb.call(gun, {err: Gun.log('Only a node can be linked! Not "' + node + '"!')})
      }
      gun.put(Gun.obj.put(put, soul, Gun.is.rel.ify(soul)), cb, opt);
    });
    return ctx.chain;
  }

  Gun.chain.init = function (cb, opt) {
    var gun = this;
    gun._.at('null').event(function (at) {
      if (!at.not) {
        return
      } // TODO: BUG! This check is synchronous but it could be asynchronous!
      var ctx = {by: gun.__.by(at.soul)};
      this.off();
      if (at.field) {
        if (Gun.obj.has(ctx.by.node, at.field)) {
          return
        }
        gun._.at('soul').emit({soul: at.soul, field: at.field, not: true});
        return;
      }
      if (at.soul) {
        if (ctx.by.node) {
          return
        }
        var soul = Gun.text.random();
        gun.__.gun.put(Gun.is.node.soul.ify({}, soul), null, {init: true});
        gun.__.gun.key(at.soul, null, soul);
      }
    }, {raw: true});
    return gun;
  }
};

export default Chaining;
