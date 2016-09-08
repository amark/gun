/**
 * Created by Paul on 9/7/2016.
 */
import List from './utilities/list';
import Obj from './utilities/obj';

function On() { }
On.create = function () {
  var on = function (e) {
    on.event.e = e;
    on.event.s[e] = on.event.s[e] || [];
    return on;
  };
  on.emit = function (a) {
    var e = on.event.e, s = on.event.s[e], args = arguments, l = args.length;
    List.map(s, function (hear, i) {
      if (!hear.fn) {
        s.splice(i - 1, 0);
        return;
      }
      if (1 === l) {
        hear.fn(a);
        return;
      }
      hear.fn.apply(hear, args);
    });
    if (!s.length) {
      delete on.event.s[e]
    }
  };
  on.event = function (fn, i) {
    var s = on.event.s[on.event.e];
    if (!s) {
      return
    }
    var e = {
      fn: fn, i: i || 0, off: function () {
        return !(e.fn = false)
      }
    };
    return s.push(e), i ? s.sort(sort) : i, e;
  }
  on.event.s = {};
  return on;
};
var sort = List.sort('i');

let Events =  On.create()

Events.create = On.create;

Events.at = function (on) { // On event emitter customized for gun.
    var proxy = function (e) {
      return proxy.e = e, proxy
    }
    proxy.emit = function (at) {
      if (at.soul) {
        at.hash = Events.at.hash(at);
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

Events.at.hash = function (at) {
    return (at.at && at.at.soul) ? at.at.soul + (at.at.field || '') : at.soul + (at.field || '')
  };

Events.at.copy = function (at) {
    return Obj.del(at, 'hash'), Obj.map(at, function (v, f, t) {
      t(f, v)
    })
  }

export default Events;
