/**
 * Created by Paul on 9/7/2016.
 */
import IsNode from './is/node';
import GunIs from './is/base';
import List from './utilities/list';
import Obj from './utilities/obj';
import Log from './console';
import Text from './utilities/text';
import Reserved from './reserved';

let ify = (data, cb, opt) => {
  opt = opt || {};
  cb = cb || function (env, cb) {
      cb(env.at, IsNode.soul(env.at.obj) || IsNode.soul(env.at.node) || Text.random())
    };
  var end = function (fn) {
    ctx.end = fn || function () {
      };
    unique(ctx);
  }, ctx = {at: {path: [], obj: data}, root: {}, graph: {}, queue: [], seen: [], opt: opt, loop: true};
  if (!data) {
    return ctx.err = {err: Log('Serializer does not have correct parameters.')}, end
  }
  if (ctx.opt.start) {
    IsNode.soul.ify(ctx.root, ctx.opt.start)
  }
  ctx.at.node = ctx.root;
  while (ctx.loop && !ctx.err) {
    seen(ctx, ctx.at);
    map(ctx, cb);
    if (ctx.queue.length) {
      ctx.at = ctx.queue.shift();
    } else {
      ctx.loop = false;
    }
  }
  return end;
};
let map = (ctx, cb) => {
  var u, rel = function (at, soul) {
    at.soul = at.soul || soul || IsNode.soul(at.obj) || IsNode.soul(at.node);
    if (!ctx.opt.pure) {
      ctx.graph[at.soul] = IsNode.soul.ify(at.node, at.soul);
      if (ctx.at.field) {
        IsNode.state.ify([at.node], at.field, u, ctx.opt.state);
      }
    }
    List.map(at.back, function (rel) {
      rel[Reserved.soul] = at.soul;
    });
    unique(ctx);
  }, it;
  Obj.map(ctx.at.obj, function (val, field) {
    ctx.at.val = val;
    ctx.at.field = field;
    it = cb(ctx, rel, map) || true;
    if (field === Reserved.meta) {
      ctx.at.node[field] = Obj.copy(val); // TODO: BUG! Is this correct?
      return;
    }
    if (String(field).indexOf('.') != -1 || (false && notValidField(field))) { // TODO: BUG! Do later for ACID "consistency" guarantee.
      return ctx.err = {err: Log("Invalid field name on '" + ctx.at.path.join('.') + "'!")};
    }
    if (!GunIs.val(val)) {
      var at = {obj: val, node: {}, back: [], path: [field]}, tmp = {}, was;
      at.path = (ctx.at.path || []).concat(at.path || []);
      if (!Obj.is(val)) {
        return ctx.err = {err: Log("Invalid value at '" + at.path.join('.') + "'!")};
      }
      if (was = seen(ctx, at)) {
        tmp[Reserved.soul] = IsNode.soul(was.node) || null;
        (was.back = was.back || []).push(ctx.at.node[field] = tmp);
      } else {
        ctx.queue.push(at);
        tmp[Reserved.soul] = null;
        at.back.push(ctx.at.node[field] = tmp);
      }
    } else {
      ctx.at.node[field] = Obj.copy(val);
    }
  });
  if (!it) {
    cb(ctx, rel)
  }
};
let unique = (ctx) => {
  if (ctx.err || (!List.map(ctx.seen, function (at) {
      if (!at.soul) {
        return true
      }
    }) && !ctx.loop)) {
    return ctx.end(ctx.err, ctx), ctx.end = function () {
    };
  }
};
let seen = (ctx, at) => {
  return List.map(ctx.seen, function (has) {
      if (at.obj === has.obj) {
        return has
      }
    }) || (ctx.seen.push(at) && false);
};
ify.wire = (n, cb, opt) => {
  return Text.is(n) ? ify.wire.from(n, cb, opt) : ify.wire.to(n, cb, opt)
};
ify.wire.to = (n, cb, opt) => {
  var t, b;
  if (!n || !(t = IsNode.soul(n))) {
    return null
  }
  cb = cb || function () {
    };
  t = (b = "#'" + JSON.stringify(t) + "'");
  Obj.map(n, function (v, f) {
    if (Reserved.meta === f) {
      return
    }
    var w = '', s = IsNode.state(n, f);
    if (!s) {
      return
    }
    w += ".'" + JSON.stringify(f) + "'";
    w += "='" + JSON.stringify(v) + "'";
    w += ">'" + JSON.stringify(s) + "'";
    t += w;
    w = b + w;
    cb(null, w);
  });
  return t;
};
ify.wire.from = (n, cb, opt) => {
  if (!n) {
    return null
  }
  var a = [], s = -1, e = 0, end = 1;
  while ((e = n.indexOf("'", s + 1)) >= 0) {
    if (s === e || '\\' === n.charAt(e - 1)) {
    } else {
      a.push(n.slice(s + 1, e));
      s = e;
    }
  }
  return a;
};


export default ify;
