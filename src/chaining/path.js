/**
 * Created by Paul on 9/8/2016.
 */
import { pathBindings } from '../bindings';
import Utils from '../utilities/base';
import Text from '../utilities/text';
import List from '../utilities/list';
import Obj from '../utilities/obj';
import Events from '../events';
import IsNode from '../is/node';
import IsRel from '../is/rel';
import Log from '../console';

export default (function () {
  pathBindings();
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
    if (!List.is(path)) {
      if (!Text.is(path)) {
        if (!Utils.num.is(path)) { // if not a list, text, or number
          return cb.call(chain, {err: Log("Invalid path '" + path + "'!")}), chain; // then complain
        } else {
          return this.path(path + '', cb, opt)
        }
      } else {
        return this.path(path.split('.'), cb, opt)
      }
    } // else coerce upward to a list.
    if (gun === gun.back) {
      cb.call(chain, opt.put ? null : {err: Log('You have no context to `.path`', path, '!')}, opt.put ? gun.__.graph[(path || [])[0]] : u);
      return chain;
    }
    gun._.at('path:' + path[0]).event(function (at) {
      if (opt.done) {
        this.off();
        return
      } // TODO: BUG - THIS IS A FIX FOR A BUG! TEST #"context no double emit", COMMENT THIS LINE OUT AND SEE IT FAIL!
      var ctx = {soul: at.soul, field: at.field, by: gun.__.by(at.soul)}, field = path[0];
      var on = Obj.as(cb.hash, at.hash, {
        off: function () {
        }
      });
      if (at.soul === on.soul) {
        return
      }
      else {
        on.off()
      }
      if (ctx.rel = (IsRel(at.value) || IsRel(at.at && at.at.value))) {
        if (opt.put && 1 === path.length) {
          return cb.call(ctx.by.chain || chain, null, IsNode.soul.ify({}, ctx.rel));
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
      (at = Events.at.copy(at)).field = path[0];
      at.not = true;
      chain._.at('null').emit(at).chain(opt.chain);
    });
    gun._.at('end').event(function (at) {
      this.off();
      if (at.at && at.at.field === path[0]) {
        return
      } // TODO: BUG! THIS FIXES SO MANY PROBLEMS BUT DOES IT CATCH VARYING SOULS EDGE CASE?
      var ctx = {by: gun.__.by(at.soul)};
      if (Obj.has(ctx.by.node, path[0])) {
        return
      }
      (at = Events.at.copy(at)).field = path[0];
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
