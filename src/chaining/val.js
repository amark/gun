/**
 * Created by Paul on 9/8/2016.
 */
import { valBindings} from '../bindings';
import List from '../utilities/list';
import Obj from '../utilities/obj';
import Events from '../events';
import Utils from '../utilities/base';
import Reserved from '../reserved';
import Log from '../console';

export default (function () {
  valBindings();
  return function (cb, opt) {
    let gun = this, args = List.slit.call(arguments);
    cb = Utils.fns.is(cb) ? cb : function (val, field) {
      root.console.log.apply(root.console, args.concat([field && (field += ':'), val]));
    };
    cb.hash = {};
    opt = opt || {};
    function val(at) {
      let ctx = {
        by: gun.__.by(at.soul),
        at: at.at || at
      }, node = ctx.by.node, field = ctx.at.field, hash = Events.at.hash({
        soul: ctx.at.key || ctx.at.soul,
        field: field
      });
      if (cb.hash[hash]) {
        return;
      }
      if (at.field && Obj.has(node, at.field)) {
        return cb.hash[hash] = true, cb.call(ctx.by.chain || gun, Obj.copy(node[at.field]), at.field);
      }
      if (!opt.empty && Obj.empty(node, Reserved.meta)) {
        return;
      } // TODO: CLEAN UP! .on already does this without the .raw!
      if (ctx.by.end < 0) {
        return;
      }
      return cb.hash[hash] = true, cb.call(ctx.by.chain || gun, Obj.copy(node), field);
    }

    gun.on(val, {raw: true});
    if (gun === gun.back) {
      Log('You have no context to `.val`!');
    }
    return gun;
  }
}());
