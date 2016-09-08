/**
 * Created by Paul on 9/8/2016.
 */

import GunIs from '../is/base';
import Log from '../console';
import IsRel from '../is/rel';
import IsNode from '../is/node';
import Obj from '../utilities/obj';

export default function (item, cb, opt) {
  var gun = this, ctx = {}, chain;
  cb = cb || function () {
    };
  if (!GunIs(item)) {
    return cb.call(gun, {err: Log('Set only supports node references currently!')}), gun
  } // TODO: Bug? Should we return not gun on error?
  (ctx.chain = item.chain()).back = gun;
  ctx.chain._ = item._;
  item.val(function (node) { // TODO: BUG! Return proxy chain with back = list.
    if (ctx.done) {
      return
    }
    ctx.done = true;
    var put = {}, soul = IsNode.soul(node);
    if (!soul) {
      return cb.call(gun, {err: Log('Only a node can be linked! Not "' + node + '"!')})
    }
    gun.put(Obj.put(put, soul, IsRel.ify(soul)), cb, opt);
  });
  return ctx.chain;
};
