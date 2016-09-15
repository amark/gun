/**
 * Created by Paul on 9/8/2016.
 */

import Obj from '../utilities/obj';
import Events from '../events';
import Reserved from '../reserved';
import Log from '../console';

export default function (cb, opt) { // on subscribes to any changes on the souls.
  let gun = this, u;
  opt = Obj.is(opt) ? opt : {change: opt};
  cb = cb || function () { };
  function map(at) {
    opt.on = opt.on || this;
    let ctx = {by: gun.__.by(at.soul)}, change = ctx.by.node;
    if (opt.on.stat && opt.on.stat.first) {
      (at = Events.at.copy(at)).change = ctx.by.node;
    }
    if (opt.raw) {
      return cb.call(opt.on, at);
    }
    if (opt.once) {
      this.off();
    }
    if (opt.change) {
      change = at.change;
    }
    if (!opt.empty && Obj.empty(change, Reserved.meta)) {
      return;
    }
    cb.call(ctx.by.chain || gun, Obj.copy(at.field ? change[at.field] : change), at.field || (at.at && at.at.field));
  };
  opt.on = gun._.at('soul').map(map);
  if (gun === gun.back) {
    Log('You have no context to `.on`!');
  }
  return gun;
};
