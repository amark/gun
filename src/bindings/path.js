/**
 * Created by Paul on 9/7/2016.
 */

import Events from '../events';
import IsNode from '../is/node';
import IsRel from '../is/rel';
import Obj from '../utilities/obj';
import Reserved from '../reserved';

let Bindings = function () {
  Events('get').event(function (gun, at, ctx, opt, cb, lex) {
    if (ctx.halt) {
      return;
    } // TODO: CLEAN UP with event emitter option?
    if (opt.path) {
      at.at = opt.path;
    }
    let xtc = {soul: lex[Reserved.soul], field: lex[Reserved.field]};
    xtc.change = at.change || gun.__.by(at.soul).node;
    if (xtc.field) { // TODO: future feature!
      if (!Obj.has(xtc.change, xtc.field)) {
        return;
      }
      ctx.node = IsNode.soul.ify({}, at.soul); // TODO: CLEAN UP! ctx.node usage.
      IsNode.state.ify([ctx.node, xtc.change], xtc.field, xtc.change[xtc.field]);
      at.change = ctx.node;
      at.field = xtc.field;
    }
  }, -99);
  Events('get').event(function (gun, at, ctx, opt, cb, lex) {
    if (ctx.halt) {
      return;
    } // TODO: CLEAN UP with event emitter option?
    let xtc = {};
    xtc.change = at.change || gun.__.by(at.soul).node;
    if (!opt.put) { // TODO: CLEAN UP be nice if path didn't have to worry about this.
      IsNode(xtc.change, function (v, f) {
        let fat = Events.at.copy(at);
        fat.field = f;
        fat.value = v;
        Obj.del(fat, 'at'); // TODO: CLEAN THIS UP! It would be nice in every other function every where else it didn't matter whether there was a cascading at.at.at.at or not, just and only whether the current context as a field or should rely on a previous field. But maybe that is the gotcha right there?
        fat.change = fat.change || xtc.change;
        if (v = IsRel(fat.value)) {
          fat = {soul: v, at: fat};
        }
        gun._.at('path:' + f).emit(fat).chain(opt.chain);
      });
    }
    if (!ctx.end) {
      ctx.end = gun._.at('end').emit(at).chain(opt.chain);
    }
  }, 99);
};

export default Bindings;
