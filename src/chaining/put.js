/**
 * Created by Paul on 9/8/2016.
 */

import Time from '../utilities/time';
import Obj from '../utilities/obj';
import Text from '../utilities/text';
import Serializer from '../serializer';
import IsNode from '../is/node';
import IsRel from '../is/rel';
import GunIs from '../is/base';
import Log from '../console';
import Events from '../events';
import Reserved from '../reserved';
import Union from '../specific/union';
import Utils from '../utilities/base';

export default function (val, cb, opt) {
  opt = opt || {};
  cb = cb || function () {
    };
  cb.hash = {};
  let gun = this, chain = gun.chain(), tmp = {val: val}, drift = Time.now();

  function put(at) {
    let val = tmp.val;
    let ctx = {obj: val}; // prep the value for serialization
    ctx.soul = at.field ? at.soul : (at.at && at.at.soul) || at.soul; // figure out where we are
    ctx.field = at.field ? at.field : (at.at && at.at.field) || at.field; // did we come from some where?
    if (GunIs(val)) {
      if (!ctx.field) {
        return cb.call(chain, {err: ctx.err = Log('No field to link node to!')}), chain._.at('err').emit(ctx.err)
      }
      return val.val(function (node) {
        let soul = IsNode.soul(node);
        if (!soul) {
          return cb.call(chain, {err: ctx.err = Log('Only a node can be linked! Not "' + node + '"!')}), chain._.at('err').emit(ctx.err)
        }
        tmp.val = IsRel.ify(soul);
        put(at);
      });
    }
    if (cb.hash[at.hash = at.hash || Events.at.hash(at)]) {
      return
    } // if we have already seen this hash...
    cb.hash[at.hash] = true; // else mark that we're processing the data (failure to write could still occur).
    ctx.by = chain.__.by(ctx.soul);
    ctx.not = at.not || (at.at && at.at.not);
    Obj.del(at, 'not');
    Obj.del(at.at || at, 'not'); // the data is no longer not known! // TODO: BUG! It could have been asynchronous by the time we now delete these properties. Don't other parts of the code assume their deletion is synchronous?
    if (ctx.field) {
      Obj.as(ctx.obj = {}, ctx.field, val)
    } // if there is a field, then data is actually getting put on the parent.
    else if (!Obj.is(val)) {
      return cb.call(chain, ctx.err = {err: Log("No node exists to put " + (typeof val) + ' "' + val + '" in!')}), chain._.at('err').emit(ctx.err)
    } // if the data is a primitive and there is no context for it yet, then we have an error.
    // TODO: BUG? gun.get(key).path(field).put() isn't doing it as pseudo.
    function soul(env, cb, map) {
      let eat;
      if (!env || !(eat = env.at) || !env.at.node) {
        return
      }
      if (!eat.node._) {
        eat.node._ = {}
      }
      if (!eat.node._[Reserved.state]) {
        eat.node._[Reserved.state] = {}
      }
      if (!IsNode.soul(eat.node)) {
        if (ctx.obj === eat.obj) {
          Obj.as(env.graph, eat.soul = Obj.as(eat.node._, Reserved.soul, IsNode.soul(eat.obj) || ctx.soul), eat.node);
          cb(eat, eat.soul);
        } else {
          let path = function (err, node) {
            if (path.opt && path.opt.on && path.opt.on.off) {
              path.opt.on.off()
            }
            if (path.opt.done) {
              return
            }
            path.opt.done = true;
            if (err) {
              env.err = err
            }
            eat.soul = IsNode.soul(node) || IsNode.soul(eat.obj) || IsNode.soul(eat.node) || Text.random();
            Obj.as(env.graph, Obj.as(eat.node._, Reserved.soul, eat.soul), eat.node);
            cb(eat, eat.soul);
          };
          path.opt = {put: true};
          (ctx.not) ? path() : ((at.field || at.at) ? gun._.back : gun).path(eat.path || [], path, path.opt);
        }
      }
      if (!eat.field) {
        return
      }
      eat.node._[Reserved.state][eat.field] = drift;
    }

    function end(err, ify) {
      ctx.ify = ify;
      Events('put').emit(chain, at, ctx, opt, cb, val);
      if (err || ify.err) {
        return cb.call(chain, err || ify.err), chain._.at('err').emit(err || ify.err)
      } // check for serialization error, emit if so.
      if (err = Union(chain, ify.graph, {
          end: false, soul: function (soul) {
            if (chain.__.by(soul).end) {
              return
            }
            Union(chain, IsNode.soul.ify({}, soul)); // fire off an end node if there hasn't already been one, to comply with the wire spec.
          }
        }).err) {
        return cb.call(chain, err), chain._.at('err').emit(err)
      } // now actually union the serialized data, emit error if any occur.
      if (Utils.fns.is(end.wire = chain.__.opt.wire.put)) {
        let wcb = function (err, ok, info) {
          if (err) {
            return Log(err.err || err), cb.call(chain, err), chain._.at('err').emit(err);
          }
          return cb.call(chain, err, ok);
        };
        end.wire(ify.graph, wcb, opt);
      } else {
        if (!Log.count('no-wire-put')) {
          Log("Warning! You have no persistence layer to save to!");
        }
        cb.call(chain, null); // This is in memory success, hardly "success" at all.
      }
      if (ctx.field) {
        return gun._.back.path(ctx.field, null, {chain: opt.chain || chain});
      }
      if (ctx.not) {
        return gun.__.gun.get(ctx.soul, null, {chain: opt.chain || chain});
      }
      chain.get(ctx.soul, null, {chain: opt.chain || chain, at: gun._.at})
    }

    Serializer(ctx.obj, soul, {pure: true})(end); // serialize the data!
  }

  if (gun === gun.back) { // if we are the root chain...
    put({soul: IsNode.soul(val) || Text.random(), not: true}); // then cause the new chain to save data!
  } else { // else if we are on an existing chain then...
    gun._.at('soul').map(put); // put data on every soul that flows through this chain.
    function back(gun) {
      if (back.get || gun._.back === gun || gun._.not) {
        return
      } // TODO: CLEAN UP! Would be ideal to accomplish this in a more ideal way.
      if (gun._.get) {
        back.get = true
      }
      gun._.at('null').event(function (at) {
        this.off();
        if (opt.init || gun.__.opt.init) {
          return Log("Warning! You have no context to `.put`", val, "!")
        }
        gun.init();
      }, -999);
      return back(gun._.back);
    };
    if (!opt.init && !gun.__.opt.init) {
      back(gun)
    }
  }
  chain.back = gun.back;
  return chain;
};
