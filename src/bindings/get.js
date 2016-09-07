/**
 * Created by Paul on 9/7/2016.
 */
import Events from '../events';
import Obj from '../utilities/obj';

let Bindings = function () {
  Events('operating').event(function (gun, at) {
    if (!gun.__.by(at.soul).node) {
      gun.__.by(at.soul).node = gun.__.graph[at.soul]
    }
    if (at.field) {
      return
    } // TODO: It would be ideal to reuse HAM's field emit.
    gun.__.on(at.soul).emit(at);
  });
  Events('get').event(function (gun, at, ctx, opt, cb) {
    if (ctx.halt) {
      return
    } // TODO: CLEAN UP with event emitter option?
    at.change = at.change || gun.__.by(at.soul).node;
    if (opt.raw) {
      return cb.call(opt.on, at)
    }
    if (!ctx.cb.no) {
      cb.call(ctx.by.chain, null, Obj.copy(ctx.node || gun.__.by(at.soul).node))
    }
    gun._.at('soul').emit(at).chain(opt.chain);
  }, 0);
  Events('get').event(function (gun, at, ctx) {
    if (ctx.halt) {
      ctx.halt = false;
      return
    } // TODO: CLEAN UP with event emitter option?
  }, Infinity);
};

export default Bindings;
