/**
 * Created by Paul on 9/7/2016.
 */
import Reserved from '../reserved';
import Obj from '../utilities/obj';
import Log from '../console';
// import GunIs from '../is';
import IsNode from '../is/node';
import IsRel from '../is/rel';
import IsGraph from '../is/graph';
import Utils from '../utilities/base';
import Text from '../utilities/text';
import List from '../utilities/list';
import Time from '../utilities/time';
import schedule from '../scheduler';

import HAM from '../specific/ham';
import Events from '../events';

let Union = function (gun, prime, cb, opt) { // merge two graphs into the first.
  var opt = opt || Obj.is(cb) ? cb : {};
  var ctx = {graph: gun.__.graph, count: 0};
  ctx.cb = function () {
    cb = Utils.fns.is(cb) ? cb() && null : null;
  }
  if (!ctx.graph) {
    ctx.err = {err: Log("No graph!")}
  }
  if (!prime) {
    ctx.err = {err: Log("No data to merge!")}
  }
  if (ctx.soul = IsNode.soul(prime)) {
    prime = IsGraph.ify(prime)
  }
  if (!IsGraph(prime, null, function (val, field, node) {
      var meta;
      if (!Utils.num.is(IsNode.state(node, field))) {
        return ctx.err = {err: Log("No state on '" + field + "'!")}
      }
    }) || ctx.err) {
    return ctx.err = ctx.err || {err: Log("Invalid graph!", prime)}, ctx
  }
  function emit(at) {
    Events('operating').emit(gun, at);
  }

  (function union(graph, prime) {
    var prime = Obj.map(prime, function (n, s, t) {
      t(n)
    }).sort(function (A, B) {
      var s = IsNode.soul(A);
      if (graph[s]) {
        return 1
      }
      return 0;
    });
    ctx.count += 1;
    ctx.err = List.map(prime, function (node, soul) {
      soul = IsNode.soul(node);
      if (!soul) {
        return {err: Log("Soul missing or mismatching!")}
      }
      ctx.count += 1;
      var vertex = graph[soul];
      if (!vertex) {
        graph[soul] = vertex = IsNode.ify({}, soul)
      }
      Union.HAM(vertex, node, function (vertex, field, val, state) {
        Events('historical').emit(gun, {soul: soul, field: field, value: val, state: state, change: node});
        gun.__.on('historical').emit({soul: soul, field: field, change: node});
      }, function (vertex, field, val, state) {
        if (!vertex) {
          return
        }
        var change = IsNode.soul.ify({}, soul);
        if (field) {
          IsNode.state.ify([vertex, change, node], field, val);
        }
        emit({soul: soul, field: field, value: val, state: state, change: change});
      }, function (vertex, field, val, state) {
        Events('deferred').emit(gun, {soul: soul, field: field, value: val, state: state, change: node});
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

Union.ify = function (gun, prime, cb, opt) {
  if (gun) {
    gun = (gun.__ && gun.__.graph) ? gun.__.graph : gun
  }
  if (Text.is(prime)) {
    if (gun && gun[prime]) {
      prime = gun[prime];
    } else {
      return IsNode.ify({}, prime);
    }
  }
  var vertex = IsNode.soul.ify({}, IsNode.soul(prime)), prime = IsGraph.ify(prime) || prime;
  if (IsGraph(prime, null, function (val, field) {
      var node;

      function merge(a, f, v) {
        IsNode.state.ify(a, f, v)
      }

      if (IsRel(val)) {
        node = gun ? gun[field] || prime[field] : prime[field]
      }
      Union.HAM(vertex, node, function () {
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

Union.HAM = function (vertex, delta, lower, now, upper) {
  upper.max = -Infinity;
  now.end = true;
  delta = delta || {};
  vertex = vertex || {};
  Obj.map(delta._, function (v, f) {
    if (Reserved.state === f || Reserved.soul === f) {
      return
    }
    vertex._[f] = v;
  });
  if (!IsNode(delta, function update(incoming, field) {
      now.end = false;
      var ctx = {incoming: {}, current: {}}, state;
      ctx.drift = Time.now(); // DANGEROUS!
      ctx.incoming.value = IsRel(incoming) || incoming;
      ctx.current.value = IsRel(vertex[field]) || vertex[field];
      ctx.incoming.state = Utils.num.is(ctx.tmp = ((delta._ || {})[Reserved.state] || {})[field]) ? ctx.tmp : -Infinity;
      ctx.current.state = Utils.num.is(ctx.tmp = ((vertex._ || {})[Reserved.state] || {})[field]) ? ctx.tmp : -Infinity;
      upper.max = ctx.incoming.state > upper.max ? ctx.incoming.state : upper.max;
      state = HAM(ctx.drift, ctx.incoming.state, ctx.current.state, ctx.incoming.value, ctx.current.value);
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
        schedule(ctx.incoming.state, function () {
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

export default Union;
