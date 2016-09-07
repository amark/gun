/**
 * Created by Paul on 9/7/2016.
 */
import Events from '../events';
import IsGraph from '../is/graph';
import IsNode from '../is/node';
import Union from '../specific/union';
import Obj from '../utilities/obj';

let Bindings = function () {
  Events('put').event(function (gun, at, ctx, opt, cb) {
    if (opt.key) {
      return
    }
    IsGraph(ctx.ify.graph, function (node, soul) {
      var key = {node: gun.__.graph[soul]};
      if (!IsNode.soul(key.node, 'key')) {
        return
      }
      if (!gun.__.by(soul).end) {
        gun.__.by(soul).end = 1
      }
      IsNode(key.node, function each(rel, s) {
        var n = gun.__.graph[s];
        if (n && IsNode.soul(n, 'key')) {
          IsNode(n, each);
          return;
        }
        rel = ctx.ify.graph[s] = ctx.ify.graph[s] || IsNode.soul.ify({}, s);
        IsNode(node, function (v, f) {
          IsNode.state.ify([rel, node], f, v)
        });
        Obj.del(ctx.ify.graph, soul);
      })
    });
  });
  Events('get').event(function (gun, at, ctx, opt, cb) {
    if (ctx.halt) {
      return
    } // TODO: CLEAN UP with event emitter option?
    if (opt.key && opt.key.soul) {
      at.soul = opt.key.soul;
      gun.__.by(opt.key.soul).node = Union.ify(gun, opt.key.soul); // TODO: Check performance?
      gun.__.by(opt.key.soul).node._['key'] = 'pseudo';
      at.change = IsNode.soul.ify(Obj.copy(at.change || gun.__.by(at.soul).node), at.soul, true); // TODO: Check performance?
      return;
    }
    if (!(IsNode.soul(gun.__.graph[at.soul], 'key') === 1)) {
      return
    }
    var node = at.change || gun.__.graph[at.soul];

    function map(rel, soul) {
      gun.__.gun.get(rel, cb, {key: ctx, chain: opt.chain || gun, force: opt.force})
    }

    ctx.halt = true;
    IsNode(node, map);
  }, -999);
};

export default Bindings;
