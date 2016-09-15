/**
 * Created by Paul on 9/8/2016.
 */
import Union from '../specific/union';
import Utils from '../utilities/base';
import Text from '../utilities/text';
import Obj from '../utilities/obj';
import Reserved from '../reserved';
import Events from '../events';
import IsNode from '../is/node';
import Log from '../console';
import {getBindings} from '../bindings';
import IsRel from '../is/rel';

export default (function () {
  getBindings();
  return function get(lex, cb, opt) { // get opens up a reference to a node and loads it.
    let gun = this, ctx = {
      opt: opt || {},
      cb: cb || function () {
      },
      lex: (Text.is(lex) || Utils.num.is(lex)) ? IsRel.ify(lex) : lex,
    };
    ctx.force = ctx.opt.force;
    if (cb !== ctx.cb) {
      ctx.cb.no = true
    }
    if (!Obj.is(ctx.lex)) {
      return ctx.cb.call(gun = gun.chain(), {err: Log('Invalid get request!', lex)}), gun
    }
    if (!(ctx.soul = ctx.lex[Reserved.soul])) {
      return ctx.cb.call(gun = this.chain(), {err: Log('No soul to get!')}), gun
    } // TODO: With `.all` it'll be okay to not have an exact match!
    ctx.by = gun.__.by(ctx.soul);
    ctx.by.chain = ctx.by.chain || gun.chain();
    function load(lex) {
      let soul = lex[Reserved.soul];
      let cached = gun.__.by(soul).node || gun.__.graph[soul];
      if (ctx.force) {
        ctx.force = false
      }
      else if (cached) {
        return false
      }
      wire(lex, stream, ctx.opt);
      return true;
    }

    function stream(err, data, info) {
      //console.log("wire.get <--", err, data);
      Events('wire.get').emit(ctx.by.chain, ctx, err, data, info);
      if (err) {
        Log(err.err || err);
        ctx.cb.call(ctx.by.chain, err);
        return ctx.by.chain._.at('err').emit({soul: ctx.soul, err: err.err || err}).chain(ctx.opt.chain);
      }
      if (!data) {
        ctx.cb.call(ctx.by.chain, null);
        return ctx.by.chain._.at('null').emit({soul: ctx.soul, not: true}).chain(ctx.opt.chain);
      }
      if (Obj.empty(data)) {
        return
      }
      if (err = Union(ctx.by.chain, data).err) {
        ctx.cb.call(ctx.by.chain, err);
        return ctx.by.chain._.at('err').emit({
          soul: IsNode.soul(data) || ctx.soul,
          err: err.err || err
        }).chain(ctx.opt.chain);
      }
    }

    function wire(lex, cb, opt) {
      Events('get.wire').emit(ctx.by.chain, ctx, lex, cb, opt);
      if (Utils.fns.is(gun.__.opt.wire.get)) {
        return gun.__.opt.wire.get(lex, cb, opt)
      }
      if (!Log.count('no-wire-get')) {
        Log("Warning! You have no persistence layer to get from!")
      }
      cb(null); // This is in memory success, hardly "success" at all.
    }

    function on(at) {
      if (on.ran = true) {
        ctx.opt.on = this
      }
      if (load(ctx.lex)) {
        return
      }
      Events('get').emit(ctx.by.chain, at, ctx, ctx.opt, ctx.cb, ctx.lex);
    }

    ctx.opt.on = (ctx.opt.at || gun.__.at)(ctx.soul).event(on);
    ctx.by.chain._.get = ctx.lex;
    if (!ctx.opt.ran && !on.ran) {
      on.call(ctx.opt.on, {soul: ctx.soul})
    }
    return ctx.by.chain;
  }
}());
