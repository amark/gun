/**
 * Created by Paul on 9/8/2016.
 */
import Obj from '../utilities/obj';

let At = function (on) { // On event emitter customized for gun.
  var proxy = function (e) {
    return proxy.e = e, proxy
  }
  proxy.emit = function (at) {
    if (at.soul) {
      at.hash = At.hash(at);
      //Obj.as(proxy.mem, proxy.e)[at.soul] = at;
      Obj.as(proxy.mem, proxy.e)[at.hash] = at;
    }
    if (proxy.all.cb) {
      proxy.all.cb(at, proxy.e)
    }
    on(proxy.e).emit(at);
    return {
      chain: function (c) {
        if (!c || !c._ || !c._.at) {
          return
        }
        return c._.at(proxy.e).emit(at)
      }
    };
  }
  proxy.only = function (cb) {
    if (proxy.only.cb) {
      return
    }
    return proxy.event(proxy.only.cb = cb);
  }
  proxy.all = function (cb) {
    proxy.all.cb = cb;
    Obj.map(proxy.mem, function (mem, e) {
      Obj.map(mem, function (at, i) {
        cb(at, e);
      });
    });
  }
  proxy.event = function (cb, i) {
    i = on(proxy.e).event(cb, i);
    return Obj.map(proxy.mem[proxy.e], function (at) {
      i.stat = {first: true};
      cb.call(i, at);
    }), i.stat = {}, i;
  }
  proxy.map = function (cb, i) {
    return proxy.event(cb, i);
  };
  proxy.mem = {};
  return proxy;
}

At.hash = function (at) {
  return (at.at && at.at.soul) ? at.at.soul + (at.at.field || '') : at.soul + (at.field || '')
};

At.copy = function (at) {
  return Obj.del(at, 'hash'), Obj.map(at, function (v, f, t) {
    t(f, v)
  })
}

export default At;
