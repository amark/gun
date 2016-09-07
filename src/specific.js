/**
 * Created by Paul on 9/7/2016.
 */

let SpecificUtils = (Gun) => {
  Gun.version = 0.3;

  Gun._ = { // some reserved key words, these are not the only ones.
    meta: '_' // all metadata of the node is stored in the meta property on the node.
    , soul: '#' // a soul is a UUID of a node but it always points to the "latest" data known.
    , field: '.' // a field is a property on a node which points to a value.
    , state: '>' // other than the soul, we store HAM metadata.
    , '#': 'soul'
    , '.': 'field'
    , '=': 'value'
    , '>': 'state'
  };

  Gun.is = function (gun) {
    return (gun instanceof Gun) ? true : false
  }; // check to see if it is a GUN instance.

  Gun.is.val = function (v) { // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
    if (v === null) {
      return true
    } // "deletes", nulling out fields.
    if (v === Infinity) {
      return false
    } // we want this to be, but JSON does not support it, sad face.
    if (Gun.bi.is(v) // by "binary" we mean boolean.
      || Gun.num.is(v)
      || Gun.text.is(v)) { // by "text" we mean strings.
      return true; // simple values are valid.
    }
    return Gun.is.rel(v) || false; // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
  };

  Gun.is.rel = function (v) { // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
    if (Gun.obj.is(v)) { // must be an object.
      var id;
      Gun.obj.map(v, function (s, f) { // map over the object...
        if (id) {
          return id = false
        } // if ID is already defined AND we're still looping through the object, it is considered invalid.
        if (f == Gun._.soul && Gun.text.is(s)) { // the field should be '#' and have a text value.
          id = s; // we found the soul!
        } else {
          return id = false; // if there exists anything else on the object that isn't the soul, then it is considered invalid.
        }
      });
      if (id) { // a valid id was found.
        return id; // yay! Return it.
      }
    }
    return false; // the value was not a valid soul relation.
  };

  Gun.is.rel.ify = function (s) {
    var r = {};
    return Gun.obj.put(r, Gun._.soul, s), r
  } // convert a soul into a relation and return it.

  Gun.is.lex = function (l) {
    var r = true;
    if (!Gun.obj.is(l)) {
      return false
    }
    Gun.obj.map(l, function (v, f) {
      if (!Gun.obj.has(Gun._, f) || !(Gun.text.is(v) || Gun.obj.is(v))) {
        return r = false
      }
    }); // TODO: What if the lex cursor has a document on the match, that shouldn't be allowed!
    return r;
  };

  Gun.is.node = function (n, cb, t) {
    var s; // checks to see if an object is a valid node.
    if (!Gun.obj.is(n)) {
      return false
    } // must be an object.
    if (s = Gun.is.node.soul(n)) { // must have a soul on it.
      return !Gun.obj.map(n, function (v, f) { // we invert this because the way we check for this is via a negation.
        if (f == Gun._.meta) {
          return
        } // skip over the metadata.
        if (!Gun.is.val(v)) {
          return true
        } // it is true that this is an invalid node.
        if (cb) {
          cb.call(t, v, f, n)
        } // optionally callback each field/value.
      });
    }
    return false; // nope! This was not a valid node.
  };

  Gun.is.node.ify = function (n, s, o) { // convert a shallow object into a node.
    o = Gun.bi.is(o) ? {force: o} : o || {}; // detect options.
    n = Gun.is.node.soul.ify(n, s, o.force); // put a soul on it.
    Gun.obj.map(n, function (v, f) { // iterate over each field/value.
      if (Gun._.meta === f) {
        return
      } // ignore meta.
      Gun.is.node.state.ify([n], f, v, o.state = o.state || Gun.time.now()); // and set the state for this field and value on this node.
    });
    return n; // This will only be a valid node if the object wasn't already deep!
  };

  Gun.is.node.soul = function (n, s) {
    return (n && n._ && n._[s || Gun._.soul]) || false
  }; // convenience function to check to see if there is a soul on a node and return it.

  Gun.is.node.soul.ify = function (n, s, o) { // put a soul on an object.
    n = n || {}; // make sure it exists.
    n._ = n._ || {}; // make sure meta exists.
    n._[Gun._.soul] = o ? s : n._[Gun._.soul] || s || Gun.text.random(); // if it already has a soul then use that instead - unless you force the soul you want with an option.
    return n;
  };

  Gun.is.node.state = function (n, f) {
    return (f && n && n._ && n._[Gun._.state] && Gun.num.is(n._[Gun._.state][f])) ? n._[Gun._.state][f] : false
  } // convenience function to get the state on a field on a node and return it.

  Gun.is.node.state.ify = function (l, f, v, state) { // put a field's state and value on some nodes.
    l = Gun.list.is(l) ? l : [l]; // handle a list of nodes or just one node.
    var l = l.reverse(), d = l[0]; // we might want to inherit the state from the last node in the list.
    Gun.list.map(l, function (n, i) { // iterate over each node.
      n = n || {}; // make sure it exists.
      if (Gun.is.val(v)) {
        n[f] = v
      } // if we have a value, then put it.
      n._ = n._ || {}; // make sure meta exists.
      n = n._[Gun._.state] = n._[Gun._.state] || {}; // make sure HAM state exists.
      if (i = d._[Gun._.state][f]) {
        n[f] = i
      } // inherit the state!
      if (Gun.num.is(state)) {
        n[f] = state
      } // or manually set the state.
    });
  };

  Gun.is.graph = function (g, cb, fn, t) { // checks to see if an object is a valid graph.
    var exist = false;
    if (!Gun.obj.is(g)) {
      return false
    } // must be an object.
    return !Gun.obj.map(g, function (n, s) { // we invert this because the way we check for this is via a negation.
        if (!n || s !== Gun.is.node.soul(n) || !Gun.is.node(n, fn)) {
          return true
        } // it is true that this is an invalid graph.
        (cb || function () {
        }).call(t, n, s, function (fn) { // optional callback for each node.
          if (fn) {
            Gun.is.node(n, fn, t)
          } // where we then have an optional callback for each field/value.
        });
        exist = true;
      }) && exist; // makes sure it wasn't an empty object.
  };

  Gun.is.graph.ify = function (n) {
    var s; // wrap a node into a graph.
    if (s = Gun.is.node.soul(n)) { // grab the soul from the node, if it is a node.
      return Gun.obj.put({}, s, n); // then create and return a graph which has a node on the matching soul property.
    }
  };


  Gun.HAM = function (machineState, incomingState, currentState, incomingValue, currentValue) { // TODO: Lester's comments on roll backs could be vulnerable to divergence, investigate!
    if (machineState < incomingState) {
      // the incoming value is outside the boundary of the machine's state, it must be reprocessed in another state.
      return {defer: true};
    }
    if (incomingState < currentState) {
      // the incoming value is within the boundary of the machine's state, but not within the range.
      return {historical: true};
    }
    if (currentState < incomingState) {
      // the incoming value is within both the boundary and the range of the machine's state.
      return {converge: true, incoming: true};
    }
    if (incomingState === currentState) {
      if (incomingValue === currentValue) { // Note: while these are practically the same, the deltas could be technically different
        return {state: true};
      }
      /*
       The following is a naive implementation, but will always work.
       Never change it unless you have specific needs that absolutely require it.
       If changed, your data will diverge unless you guarantee every peer's algorithm has also been changed to be the same.
       As a result, it is highly discouraged to modify despite the fact that it is naive,
       because convergence (data integrity) is generally more important.
       Any difference in this algorithm must be given a new and different name.
       */
      if (String(incomingValue) < String(currentValue)) { // String only works on primitive values!
        return {converge: true, current: true};
      }
      if (String(currentValue) < String(incomingValue)) { // String only works on primitive values!
        return {converge: true, incoming: true};
      }
    }
    return {err: "you have not properly handled recursion through your data or filtered it as JSON"};
  };

  Gun.union = function (gun, prime, cb, opt) { // merge two graphs into the first.
    var opt = opt || Gun.obj.is(cb) ? cb : {};
    var ctx = {graph: gun.__.graph, count: 0};
    ctx.cb = function () {
      cb = Gun.fns.is(cb) ? cb() && null : null;
    }
    if (!ctx.graph) {
      ctx.err = {err: Gun.log("No graph!")}
    }
    if (!prime) {
      ctx.err = {err: Gun.log("No data to merge!")}
    }
    if (ctx.soul = Gun.is.node.soul(prime)) {
      prime = Gun.is.graph.ify(prime)
    }
    if (!Gun.is.graph(prime, null, function (val, field, node) {
        var meta;
        if (!Gun.num.is(Gun.is.node.state(node, field))) {
          return ctx.err = {err: Gun.log("No state on '" + field + "'!")}
        }
      }) || ctx.err) {
      return ctx.err = ctx.err || {err: Gun.log("Invalid graph!", prime)}, ctx
    }
    function emit(at) {
      Gun.on('operating').emit(gun, at);
    }

    (function union(graph, prime) {
      var prime = Gun.obj.map(prime, function (n, s, t) {
        t(n)
      }).sort(function (A, B) {
        var s = Gun.is.node.soul(A);
        if (graph[s]) {
          return 1
        }
        return 0;
      });
      ctx.count += 1;
      ctx.err = Gun.list.map(prime, function (node, soul) {
        soul = Gun.is.node.soul(node);
        if (!soul) {
          return {err: Gun.log("Soul missing or mismatching!")}
        }
        ctx.count += 1;
        var vertex = graph[soul];
        if (!vertex) {
          graph[soul] = vertex = Gun.is.node.ify({}, soul)
        }
        Gun.union.HAM(vertex, node, function (vertex, field, val, state) {
          Gun.on('historical').emit(gun, {soul: soul, field: field, value: val, state: state, change: node});
          gun.__.on('historical').emit({soul: soul, field: field, change: node});
        }, function (vertex, field, val, state) {
          if (!vertex) {
            return
          }
          var change = Gun.is.node.soul.ify({}, soul);
          if (field) {
            Gun.is.node.state.ify([vertex, change, node], field, val);
          }
          emit({soul: soul, field: field, value: val, state: state, change: change});
        }, function (vertex, field, val, state) {
          Gun.on('deferred').emit(gun, {soul: soul, field: field, value: val, state: state, change: node});
        })(function () {
          emit({soul: soul, change: node});
          if (opt.soul) {
            opt.soul(soul)
          }
          if (!(ctx.count -= 1)) {
            ctx.cb()
          }
        }); // TODO: BUG? Handle error!
      });
      ctx.count -= 1;
    })(ctx.graph, prime);
    if (!ctx.count) {
      ctx.cb()
    }
    return ctx;
  };

  Gun.union.ify = function (gun, prime, cb, opt) {
    if (gun) {
      gun = (gun.__ && gun.__.graph) ? gun.__.graph : gun
    }
    if (Gun.text.is(prime)) {
      if (gun && gun[prime]) {
        prime = gun[prime];
      } else {
        return Gun.is.node.ify({}, prime);
      }
    }
    var vertex = Gun.is.node.soul.ify({}, Gun.is.node.soul(prime)), prime = Gun.is.graph.ify(prime) || prime;
    if (Gun.is.graph(prime, null, function (val, field) {
        var node;

        function merge(a, f, v) {
          Gun.is.node.state.ify(a, f, v)
        }

        if (Gun.is.rel(val)) {
          node = gun ? gun[field] || prime[field] : prime[field]
        }
        Gun.union.HAM(vertex, node, function () {
        }, function (vert, f, v) {
          merge([vertex, node], f, v);
        }, function () {
        })(function (err) {
          if (err) {
            merge([vertex], field, val)
          }
        })
      })) {
      return vertex
    }
  };

  Gun.union.HAM = function (vertex, delta, lower, now, upper) {
    upper.max = -Infinity;
    now.end = true;
    delta = delta || {};
    vertex = vertex || {};
    Gun.obj.map(delta._, function (v, f) {
      if (Gun._.state === f || Gun._.soul === f) {
        return
      }
      vertex._[f] = v;
    });
    if (!Gun.is.node(delta, function update(incoming, field) {
        now.end = false;
        var ctx = {incoming: {}, current: {}}, state;
        ctx.drift = Gun.time.now(); // DANGEROUS!
        ctx.incoming.value = Gun.is.rel(incoming) || incoming;
        ctx.current.value = Gun.is.rel(vertex[field]) || vertex[field];
        ctx.incoming.state = Gun.num.is(ctx.tmp = ((delta._ || {})[Gun._.state] || {})[field]) ? ctx.tmp : -Infinity;
        ctx.current.state = Gun.num.is(ctx.tmp = ((vertex._ || {})[Gun._.state] || {})[field]) ? ctx.tmp : -Infinity;
        upper.max = ctx.incoming.state > upper.max ? ctx.incoming.state : upper.max;
        state = Gun.HAM(ctx.drift, ctx.incoming.state, ctx.current.state, ctx.incoming.value, ctx.current.value);
        if (state.err) {
          root.console.log(".!HYPOTHETICAL AMNESIA MACHINE ERR!.", state.err); // this error should never happen.
          return;
        }
        if (state.state || state.historical || state.current) {
          lower.call(state, vertex, field, incoming, ctx.incoming.state);
          return;
        }
        if (state.incoming) {
          now.call(state, vertex, field, incoming, ctx.incoming.state);
          return;
        }
        if (state.defer) {
          upper.wait = true;
          upper.call(state, vertex, field, incoming, ctx.incoming.state); // signals that there are still future modifications.
          Gun.schedule(ctx.incoming.state, function () {
            update(incoming, field);
            if (ctx.incoming.state === upper.max) {
              (upper.last || function () {
              })()
            }
          });
        }
      })) {
      return function (fn) {
        if (fn) {
          fn({err: 'Not a node!'})
        }
      }
    }
    if (now.end) {
      now.call({}, vertex)
    } // TODO: Should HAM handle empty updates? YES.
    return function (fn) {
      upper.last = fn || function () {
        };
      if (!upper.wait) {
        upper.last()
      }
    }
  };

  Gun.on.at = function (on) { // On event emitter customized for gun.
    var proxy = function (e) {
      return proxy.e = e, proxy
    }
    proxy.emit = function (at) {
      if (at.soul) {
        at.hash = Gun.on.at.hash(at);
        //Gun.obj.as(proxy.mem, proxy.e)[at.soul] = at;
        Gun.obj.as(proxy.mem, proxy.e)[at.hash] = at;
      }
      if (proxy.all.cb) {
        proxy.all.cb(at, proxy.e)
      }
      on(proxy.e).emit(at);
      return {
        chain: function (c) {
          if (!c || !c._ || !c._.at) {
            return
          }
          return c._.at(proxy.e).emit(at)
        }
      };
    }
    proxy.only = function (cb) {
      if (proxy.only.cb) {
        return
      }
      return proxy.event(proxy.only.cb = cb);
    }
    proxy.all = function (cb) {
      proxy.all.cb = cb;
      Gun.obj.map(proxy.mem, function (mem, e) {
        Gun.obj.map(mem, function (at, i) {
          cb(at, e);
        });
      });
    }
    proxy.event = function (cb, i) {
      i = on(proxy.e).event(cb, i);
      return Gun.obj.map(proxy.mem[proxy.e], function (at) {
        i.stat = {first: true};
        cb.call(i, at);
      }), i.stat = {}, i;
    }
    proxy.map = function (cb, i) {
      return proxy.event(cb, i);
    };
    proxy.mem = {};
    return proxy;
  }

  Gun.on.at.hash = function (at) {
    return (at.at && at.at.soul) ? at.at.soul + (at.at.field || '') : at.soul + (at.field || '')
  };

  Gun.on.at.copy = function (at) {
    return Gun.obj.del(at, 'hash'), Gun.obj.map(at, function (v, f, t) {
      t(f, v)
    })
  }
};

export default SpecificUtils;
