/**
 * Created by Paul on 9/8/2016.
 */

import Text from '../utilities/text';
import Obj from '../utilities/obj';
import IsNode from '../is/node';

export default function (cb, opt) {
  let gun = this;
  gun._.at('null').event(function (at) {
    if (!at.not) {
      return;
    } // TODO: BUG! This check is synchronous but it could be asynchronous!
    let ctx = {by: gun.__.by(at.soul)};
    this.off();
    if (at.field) {
      if (Obj.has(ctx.by.node, at.field)) {
        return;
      }
      gun._.at('soul').emit({soul: at.soul, field: at.field, not: true});
      return;
    }
    if (at.soul) {
      if (ctx.by.node) {
        return;
      }
      let soul = Text.random();
      gun.__.gun.put(IsNode.soul.ify({}, soul), null, {init: true});
      gun.__.gun.key(at.soul, null, soul);
    }
  }, {raw: true});
  return gun;
};
