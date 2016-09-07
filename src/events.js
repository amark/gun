/**
 * Created by Paul on 9/7/2016.
 */

let Events = (Type) => {

  function On() {
  }
  On.create = function () {
    var on = function (e) {
      on.event.e = e;
      on.event.s[e] = on.event.s[e] || [];
      return on;
    };
    on.emit = function (a) {
      var e = on.event.e, s = on.event.s[e], args = arguments, l = args.length;
      Type.list.map(s, function (hear, i) {
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
  var sort = Type.list.sort('i');
  Type.on = On.create();
  Type.on.create = On.create;

};

export default Events;
