/**
 * Created by Paul on 9/8/2016.
 */
import { keyBindings } from '../bindings';
import Text from '../utilities/text';
import Obj from '../utilities/obj';
import IsNode from '../is/node';
import IsRel from '../is/rel';
import Events from '../events';
import Log from '../console';

export default  (function () {
  keyBindings();
  return function (key, cb, opt) {
    let gun = this;
    opt = Text.is(opt) ? {soul: opt} : opt || {};
    cb = cb || function () { };
    cb.hash = {};
    if (!Text.is(key) || !key) {
      return cb.call(gun, {err: Log('No key!')}), gun;
    }
    function index(at) {
      let ctx = {node: gun.__.graph[at.soul]};
      if (at.soul === key || at.key === key) {
        return;
      }
      if (cb.hash[at.hash = at.hash || Events.at.hash(at)]) {
        return;
      }
      cb.hash[at.hash] = true;
      ctx.obj = (1 === IsNode.soul(ctx.node, 'key')) ? Obj.copy(ctx.node) : Obj.put({}, at.soul, IsRel.ify(at.soul));
      Obj.as((ctx.put = IsNode.ify(ctx.obj, key, true))._, 'key', 1);
      gun.__.gun.put(ctx.put, function (err, ok) {
        cb.call(this, err, ok);
      }, {chain: opt.chain, key: true, init: true});
    }

    if (opt.soul) {
      index({soul: opt.soul});
      return gun;
    }
    if (gun === gun.back) {
      cb.call(gun, {err: Log('You have no context to `.key`', key, '!')});
    } else {
      gun._.at('soul').map(index);
    }
    return gun;
  }
}());
